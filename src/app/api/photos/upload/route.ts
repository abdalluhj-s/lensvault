import { NextRequest, NextResponse } from 'next/server';
import { extractExif } from '@/lib/verification/exif';
import { calculateHammingDistance } from '@/lib/verification/phash';
import { runAuthenticityPipeline } from '@/lib/verification/ai-detector';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_PHOTOS } from '@/lib/data/sample-photos';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Untitled Capture';
    const description = (formData.get('description') as string) || '';
    const price = parseFloat((formData.get('price') as string) || '25.00');
    const category = (formData.get('category') as string) || 'Landscape';
    const tagsString = (formData.get('tags') as string) || '';
    const clientPhash = formData.get('phash') as string | null;
    const orientation = (formData.get('orientation') as string) || 'landscape';
    const watermarkedDataUrl = formData.get('watermarked_data_url') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const exifResult = await extractExif(buffer);

    const phash = clientPhash || 'a1b2c3d4e5f67890';

    let duplicateMatch: { photo_id: string; title: string; distance: number } | null = null;
    const supabase = createClient();

    try {
      const { data: dbMatches } = await supabase.rpc('check_phash_duplicate', {
        input_phash: phash,
        max_distance: 6,
      });

      if (dbMatches && dbMatches.length > 0) {
        duplicateMatch = dbMatches[0];
      }
    } catch {}

    if (!duplicateMatch) {
      for (const p of INITIAL_PHOTOS) {
        const d = calculateHammingDistance(p.phash, phash);
        if (d <= 6) {
          duplicateMatch = { photo_id: p.id, title: p.title, distance: d };
          break;
        }
      }
    }

    const verification = await runAuthenticityPipeline({
      exifResult,
      phash,
      duplicateMatch,
    });

    if (verification.isDuplicate) {
      return NextResponse.json(
        {
          error: 'This image or a near-identical copy has already been uploaded.',
          verification,
        },
        { status: 409 }
      );
    }

    if (verification.isAiFlagged) {
      return NextResponse.json(
        {
          error: 'Only authentic camera captures are permitted on this platform.',
          details: verification.rejectionReason,
          verification,
        },
        { status: 422 }
      );
    }

    const tags = tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const photoId = crypto.randomUUID();
    const originalFileName = `${photoId}_original_${file.name}`;
    const previewFileName = `${photoId}_watermarked.jpg`;

    let originalUrl = `https://opppyurtuurhvouovtpp.supabase.co/storage/v1/object/public/originals/${originalFileName}`;
    let watermarkedUrl = watermarkedDataUrl || `https://opppyurtuurhvouovtpp.supabase.co/storage/v1/object/public/previews/${previewFileName}`;\

    const newPhoto = {
      id: photoId,
      seller_id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      title,
      description,
      price,
      tags,
      category,
      orientation,
      original_url: originalUrl,
      watermarked_url: watermarkedUrl,
      phash,
      exif_data: verification.exif,
      verification_status: 'approved',
      is_ai_flagged: false,
    };

    try {
      await supabase.from('photos').insert([newPhoto]);
    } catch {}

    return NextResponse.json({
      success: true,
      photo: newPhoto,
      verification,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload processing failed' }, { status: 500 });
  }
}
