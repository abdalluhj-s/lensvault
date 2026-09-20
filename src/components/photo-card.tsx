'use client';

import React from 'react';
import Link from 'next/link';
import { Photo } from '@/types';
import { WatermarkedImage } from './watermarked-image';
import { ExifBadge } from './exif-badge';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PhotoCardProps {
  photo: Photo;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const isPortrait = photo.orientation === 'portrait';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-emerald-950/10">
      <Link href={`/photos/${photo.id}`} className="relative block overflow-hidden">
        <div className={`w-full overflow-hidden bg-zinc-950 ${isPortrait ? 'aspect-[3/4]' : 'aspect-[16/10]'}`}>
          <WatermarkedImage
            src={photo.watermarked_url}
            alt={photo.title}
            className="h-full w-full"
          />
        </div>

        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-md bg-zinc-950/85 px-2 py-1 text-[10px] font-medium text-emerald-400 backdrop-blur-md border border-emerald-500/20 shadow">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
          <span className="rounded-md bg-zinc-950/85 px-2 py-1 text-[10px] font-medium text-zinc-300 backdrop-blur-md border border-zinc-700/40">
            {photo.category}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 z-20">
          <span className="rounded-md bg-emerald-600/90 px-2.5 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md border border-emerald-400/30">
            {formatPrice(photo.price)}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent p-3 pt-6 transition-transform duration-300 group-hover:translate-y-0">
          <ExifBadge exif={photo.exif_data} compact />
        </div>
      </Link>

      <div className="flex flex-col p-3.5 gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/photos/${photo.id}`} className="hover:underline">
            <h3 className="font-semibold text-sm text-zinc-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {photo.title}
            </h3>
          </Link>
          <Link href={`/photos/${photo.id}`} className="text-zinc-400 hover:text-white transition-colors" title="View full specs">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/60 pt-2.5">
          <div className="flex items-center gap-2">
            {photo.seller?.avatar_url ? (
              <img src={photo.seller.avatar_url} alt={photo.seller.full_name || 'Photographer'} className="h-5 w-5 rounded-full object-cover border border-zinc-700" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-zinc-800 text-[10px] flex items-center justify-center font-bold text-zinc-300">
                {photo.seller?.full_name?.[0] || 'P'}
              </div>
            )}
            <span className="font-medium text-zinc-300 truncate max-w-[120px]">
              {photo.seller?.full_name || photo.seller?.username || 'Verified Creator'}
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[110px]">
            {photo.exif_data.make} {photo.exif_data.model?.replace(photo.exif_data.make || '', '').trim()}
          </span>
        </div>
      </div>
    </div>
  );
}
