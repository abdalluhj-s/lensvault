'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, ShieldCheck, UploadCloud, ShoppingBag, User, Sparkles } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-zinc-950 shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
              <Camera className="h-5 w-5 text-white stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                LensVault
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Authentic Only
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 -mt-0.5">Real Cameras • Zero AI</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-800">
            <Link href="/" className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-white">
              Explore Gallery
            </Link>
            <Link href="/upload" className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-white flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4 text-emerald-400" />
              Upload & Verify
            </Link>
            <Link href="/purchases" className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-white flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-sky-400" />
              My Purchases
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>AI Detector Active</span>
          </div>

          <Link href="/upload" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95">
            <UploadCloud className="h-4 w-4" />
            <span>Sell Capture</span>
          </Link>

          <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors" title="Profile & Dashboard">
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
