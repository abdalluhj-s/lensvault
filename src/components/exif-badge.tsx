import React from 'react';
import { ExifData } from '@/types';
import { Camera, Eye, Zap, Clock, Maximize2 } from 'lucide-react';

interface ExifBadgeProps {
  exif: ExifData;
  compact?: boolean;
}

export function ExifBadge({ exif, compact = false }: ExifBadgeProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-300">
        {exif.make && (
          <span className="rounded bg-zinc-900/90 px-1.5 py-0.5 border border-zinc-700/60 text-zinc-200">
            {exif.make} {exif.model?.replace(exif.make, '').trim()}
          </span>
        )}
        {exif.shutter && (
          <span className="rounded bg-zinc-900/90 px-1.5 py-0.5 border border-zinc-700/60">
            {exif.shutter}
          </span>
        )}
        {exif.aperture && (
          <span className="rounded bg-zinc-900/90 px-1.5 py-0.5 border border-zinc-700/60 text-emerald-400">
            {exif.aperture}
          </span>
        )}
        {exif.iso && (
          <span className="rounded bg-zinc-900/90 px-1.5 py-0.5 border border-zinc-700/60 text-amber-400">
            ISO {exif.iso}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <Camera className="h-4 w-4" />
          <span>Camera Hardware Telemetry</span>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
          Sensor Verified
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-zinc-400 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Camera className="h-3 w-3" /> Camera Body
          </span>
          <p className="font-medium text-zinc-200 truncate">
            {exif.make || 'Unknown'} {exif.model?.replace(exif.make || '', '').trim()}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Maximize2 className="h-3 w-3" /> Lens
          </span>
          <p className="font-medium text-zinc-200 truncate" title={exif.lens || 'Prime/Zoom'}>
            {exif.lens || exif.focal_length || 'Standard Optical'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> Exposure
          </span>
          <p className="font-mono text-zinc-200">
            {exif.shutter || '1/125s'} • {exif.aperture || 'f/2.8'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Zap className="h-3 w-3" /> Sensitivity
          </span>
          <p className="font-mono text-amber-400">
            ISO {exif.iso || '100'} • {exif.focal_length || '50mm'}
          </p>
        </div>
      </div>
    </div>
  );
}
