import exifr from 'exifr';
import { ExifData } from '@/types';

const AI_SOFTWARE_SIGNATURES = [
  'midjourney',
  'dall-e',
  'dalle',
  'stable diffusion',
  'stablediffusion',
  'automatic1111',
  'comfyui',
  'fooocus',
  'novelai',
  'adobe firefly',
  'firefly',
  'leonardo.ai',
  'flux.1',
  'bing image creator',
  'craiyon',
  'invokeai',
  'generative fill',
  'canva ai',
];

export interface ExifInspectionResult {
  exif: ExifData;
  hasCameraHardware: boolean;
  isAiFlagged: boolean;
  aiMarkerDetected?: string;
  reasons: string[];
}

export function formatShutterSpeed(val: number | string | undefined): string | undefined {
  if (!val) return undefined;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num) || num <= 0) return typeof val === 'string' ? val : undefined;

  if (num >= 1) {
    return `${Math.round(num * 10) / 10}s`;
  }
  const denominator = Math.round(1 / num);
  return `1/${denominator}s`;
}

export function formatAperture(val: number | string | undefined): string | undefined {
  if (!val) return undefined;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return typeof val === 'string' ? val : undefined;
  return `f/${Math.round(num * 10) / 10}`;
}

export async function extractExif(fileOrBuffer: Blob | ArrayBuffer | Buffer): Promise<ExifInspectionResult> {
  const reasons: string[] = [];
  let isAiFlagged = false;
  let aiMarkerDetected: string | undefined;

  try {
    const rawExif = await exifr.parse(fileOrBuffer, {
      tiff: true,
      xmp: true,
      icc: true,
      jfif: true,
      gps: true,
      exif: true,
    });

    if (!rawExif) {
      return {
        exif: {},
        hasCameraHardware: false,
        isAiFlagged: true,
        reasons: ['No EXIF metadata found. Authentic camera captures contain hardware sensor metadata.'],
      };
    }

    const make = rawExif.Make ? String(rawExif.Make).trim() : undefined;
    const model = rawExif.Model ? String(rawExif.Model).trim() : undefined;
    const lens = rawExif.LensModel || rawExif.Lens ? String(rawExif.LensModel || rawExif.Lens).trim() : undefined;
    const shutter = formatShutterSpeed(rawExif.ExposureTime || rawExif.ShutterSpeedValue);
    const aperture = formatAperture(rawExif.FNumber || rawExif.ApertureValue);
    const iso = rawExif.ISO || rawExif.ISOSpeedRatings;
    const focalLength = rawExif.FocalLength ? `${Math.round(rawExif.FocalLength)}mm` : undefined;
    const software = rawExif.Software ? String(rawExif.Software).trim() : undefined;
    const dateTaken = rawExif.DateTimeOriginal ? new Date(rawExif.DateTimeOriginal).toISOString() : undefined;

    const exif: ExifData = {
      make,
      model,
      lens,
      shutter,
      aperture,
      iso: iso ? String(iso) : undefined,
      focal_length: focalLength,
      software,
      date_taken: dateTaken,
      white_balance: rawExif.WhiteBalance === 1 ? 'Manual' : rawExif.WhiteBalance === 0 ? 'Auto' : undefined,
      raw: {
        colorSpace: rawExif.ColorSpace,
        meteringMode: rawExif.MeteringMode,
        exposureProgram: rawExif.ExposureProgram,
      },
    };

    const searchableMeta = JSON.stringify(rawExif).toLowerCase();
    for (const signature of AI_SOFTWARE_SIGNATURES) {
      if (searchableMeta.includes(signature)) {
        isAiFlagged = true;
        aiMarkerDetected = signature;
        reasons.push(`Detected synthetic generation software signature: "${signature}".`);
        break;
      }
    }

    const hasCameraHardware = Boolean(make && model);
    if (!hasCameraHardware && !isAiFlagged) {
      isAiFlagged = true;
      reasons.push('Missing camera hardware metadata (Camera Make & Model are required for authenticity verification).');
    }

    return {
      exif,
      hasCameraHardware,
      isAiFlagged,
      aiMarkerDetected,
      reasons,
    };
  } catch (err: any) {
    return {
      exif: {},
      hasCameraHardware: false,
      isAiFlagged: true,
      reasons: [`EXIF parsing error: ${err.message || 'Corrupt or unreadable image header'}`],
    };
  }
}
