import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_PHOTOS } from '@/lib/data/sample-photos';
import { calculateHammingDistance } from '@/lib/verification/phash';

export async function POST(req: NextRequest) {
  try {
    const { phash } = await req.json();

    if (!phash || phash.length !== 16) {
      return NextResponse.json({ error: 'Invalid pHash provided (must be 16-character hex)' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: dbMatches, error } = await supabase.rpc('check_phash_duplicate', {
      input_phash: phash,
      max_distance: 6,
    });

    if (!error && dbMatches && dbMatches.length > 0) {
      const match = dbMatches[0];
      return NextResponse.json({
        isDuplicate: true,
        match: {
          photo_id: match.photo_id,
          title: match.title,
          distance: match.distance,
        },
      });
    }

    for (const photo of INITIAL_PHOTOS) {
      const dist = calculateHammingDistance(photo.phash, phash);
      if (dist <= 6) {
        return NextResponse.json({
          isDuplicate: true,
          match: {
            photo_id: photo.id,
            title: photo.title,
            distance: dist,
          },
        });
      }
    }

    return NextResponse.json({ isDuplicate: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
