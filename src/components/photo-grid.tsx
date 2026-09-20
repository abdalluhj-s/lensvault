'use client';

import React from 'react';
import { Photo } from '@/types';
import { PhotoCard } from './photo-card';
import { CameraOff } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 mb-4">
          <CameraOff className="h-6 w-6 text-zinc-500" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200">No matching photos found</h3>
        <p className="text-sm text-zinc-400 max-w-sm mt-1">
          Try adjusting your search criteria, selecting a different camera brand, or clear your category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
