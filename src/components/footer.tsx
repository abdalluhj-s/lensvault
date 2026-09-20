import React from 'react';
import { Camera, ShieldCheck, Database, Cpu, CheckCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">LensVault</span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              The premier marketplace for genuine, optical photography. Every photo is mathematically verified against
              synthetic generation markers and audited with 64-bit perceptual hashing to prevent theft and protect original creators.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" /> Zero AI Tolerance
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Hardware EXIF Enforced
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Database className="h-3.5 w-3.5" /> pHash Duplicate Shield
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3">Verification Engine</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-zinc-300"><Cpu className="h-3.5 w-3.5 text-emerald-400" /> EXIF Sensor Telemetry</li>
              <li className="flex items-center gap-1.5 text-zinc-300"><Cpu className="h-3.5 w-3.5 text-emerald-400" /> 64-bit DCT Perceptual Hashing</li>
              <li className="flex items-center gap-1.5 text-zinc-300"><Cpu className="h-3.5 w-3.5 text-emerald-400" /> Midjourney / DALL-E Filter</li>
              <li className="flex items-center gap-1.5 text-zinc-300"><Cpu className="h-3.5 w-3.5 text-emerald-400" /> 15-Minute Signed URL Delivery</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3">Platform Infrastructure</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>Supabase PostgreSQL (RLS)</li>
              <li>Next.js 14 App Router</li>
              <li>Automated Dynamic Watermarking</li>
              <li>Encrypted Private Storage Bucket</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} LensVault Inc. Built for authentic photographers.</p>
          <p className="text-zinc-400">Connected to Supabase EU (PostgreSQL 17) • Public Repository on GitHub</p>
        </div>
      </div>
    </footer>
  );
}
