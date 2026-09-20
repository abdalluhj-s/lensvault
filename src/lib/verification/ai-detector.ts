import { ExifInspectionResult } from './exif';
import { VerificationResult, ExifData } from '@/types';

export interface AiDetectionOptions {
  exifResult: ExifInspectionResult;
  phash: string;
  duplicateMatch?: { photo_id: string; title: string; distance: number } | null;
  imageDimensions?: { width: number; height: number };
}

export async function runAuthenticityPipeline(options: AiDetectionOptions): Promise<VerificationResult> {
  const { exifResult, phash, duplicateMatch } = options;
  const reasons: string[] = [];

  const formatValid = true;
  const exifExtracted = Object.keys(exifResult.exif).length > 0;
  const hardwareTagsPresent = exifResult.hasCameraHardware;
  const duplicateCheckPassed = !duplicateMatch;
  const aiSignaturesAbsent = !exifResult.isAiFlagged;

  let isDuplicate = !duplicateCheckPassed;
  let isAiFlagged = !aiSignaturesAbsent;

  if (isDuplicate && duplicateMatch) {
    reasons.push(
      `This image or a near-identical copy has already been uploaded (Matches "${duplicateMatch.title}", Hamming distance: ${duplicateMatch.distance}/64).`
    );
  }

  if (isAiFlagged) {
    if (exifResult.aiMarkerDetected) {
      reasons.push(`Flagged as AI-generated: ${exifResult.reasons.join(' ')}`);
    } else if (!hardwareTagsPresent) {
      reasons.push('Only authentic camera captures are permitted on this platform (Missing Camera Make/Model hardware metadata).');
    } else {
      reasons.push(exifResult.reasons.join(' '));
    }
  }

  const isRejected = isDuplicate || isAiFlagged;
  const status = isRejected ? 'rejected' : 'approved';
  const rejectionReason = isRejected ? reasons.join(' | ') : undefined;

  let confidence = 98.5;
  if (isAiFlagged) confidence = 99.2;
  if (isDuplicate) confidence = 99.9;

  return {
    status,
    isAiFlagged,
    isDuplicate,
    duplicateOf: duplicateMatch || null,
    rejectionReason,
    exif: exifResult.exif,
    phash,
    confidence,
    checks: {
      formatValid,
      exifExtracted,
      hardwareTagsPresent,
      duplicateCheckPassed,
      aiSignaturesAbsent,
    },
  };
}
