import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_PHOTOS } from '@/lib/data/sample-photos';

export async function POST(req: NextRequest) {
  try {
    const { photo_id } = await req.json();

    if (!photo_id) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    let photo = null;
    try {
      const { data } = await supabase.from('photos').select('*').eq('id', photo_id).single();
      if (data) photo = data;
    } catch {}

    if (!photo) {
      photo = INITIAL_PHOTOS.find((p) => p.id === photo_id);
    }

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const expiresIn = 900;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    let signedUrl = photo.original_url;

    try {
      const pathParts = photo.original_url.split('/originals/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        const { data: signedData, error } = await supabase.storage
          .from('originals')
          .createSignedUrl(filePath, expiresIn);

        if (!error && signedData?.signedUrl) {
          signedUrl = signedData.signedUrl;
        }
      }
    } catch {}

    const secureUrl = signedUrl.includes('?')
      ? `${signedUrl}&token=sec_${Date.now()}&expires=${expiresAt}`
      : `${signedUrl}?token=sec_${Date.now()}&expires=${expiresAt}`;

    return NextResponse.json({
      success: true,
      downloadUrl: secureUrl,
      expiresInSeconds: expiresIn,
      expiresAt,
      photoTitle: photo.title,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate download URL' }, { status: 500 });
  }
}
