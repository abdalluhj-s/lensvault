'use client';

import React from 'react';
import Image from 'next/image';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  showWatermarkOverlay?: boolean;
}

export function WatermarkedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  showWatermarkOverlay = true,
}: WatermarkedImageProps) {
  return (
    <div className={`relative overflow-hidden select-none group ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading={priority ? 'eager' : 'lazy'}
      />

      {showWatermarkOverlay && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 rotate-[-25deg] scale-150 flex flex-wrap items-center justify-center opacity-30 select-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="m-6 text-sm sm:text-base font-black tracking-widest text-white/40 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                LENSVAULT PREVIEW
              </span>
            ))}
          </div>

          <div className="relative z-20 mt-auto flex items-center justify-between bg-zinc-950/80 px-3 py-1.5 backdrop-blur-sm border-t border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LensVault Watermarked Preview
            </span>
            <span className="text-[9px] text-zinc-400 font-mono">Original Unlocked on Purchase</span>
          </div>
        </div>
      )}
    </div>
  );
}
