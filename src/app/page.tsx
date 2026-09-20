'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Photo } from '@/types';
import { INITIAL_PHOTOS } from '@/lib/data/sample-photos';
import { createClient } from '@/lib/supabase/client';
import { PhotoGrid } from '@/components/photo-grid';
import { FilterBar } from '@/components/filter-bar';
import { ShieldCheck, Camera, Sparkles, UploadCloud, CheckCircle2, Lock } from 'lucide-react';

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedOrientation, setSelectedOrientation] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('photos')
          .select('*, seller:profiles(*)')
          .eq('verification_status', 'approved')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setPhotos(data);
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    }
    loadPhotos();
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (selectedCategory !== 'All' && photo.category !== selectedCategory) {
        return false;
      }

      if (selectedBrand !== 'All Brands') {
        const make = photo.exif_data?.make?.toLowerCase() || '';
        if (!make.includes(selectedBrand.toLowerCase())) {
          return false;
        }
      }

      if (selectedOrientation !== 'all' && photo.orientation !== selectedOrientation) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = photo.title.toLowerCase().includes(q);
        const descMatch = photo.description?.toLowerCase().includes(q) || false;
        const tagMatch = photo.tags.some((t) => t.toLowerCase().includes(q));
        const cameraMatch =
          photo.exif_data?.make?.toLowerCase().includes(q) ||
          photo.exif_data?.model?.toLowerCase().includes(q) ||
          photo.exif_data?.lens?.toLowerCase().includes(q);

        if (!titleMatch && !descMatch && !tagMatch && !cameraMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-asc') return a.price - b.price;
      if (selectedSort === 'price-desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [photos, searchQuery, selectedCategory, selectedBrand, selectedOrientation, selectedSort]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-8 sm:p-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-full max-w-2xl bg-emerald-500/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Strict Authenticity Enforcement Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Original Photography Captured by{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Real Cameras.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            LensVault protects genuine photography. Every upload passes an automated AI verification pipeline that
            inspects raw optical sensor EXIF data, runs 64-bit perceptual hashing to block duplicates, and rejects synthetic AI models.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/upload"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95"
            >
              <UploadCloud className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
              Upload & Verify Your Photos
            </Link>

            <a
              href="#gallery"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white transition-all"
            >
              <Camera className="h-4 w-4 text-zinc-400" />
              Browse Authentic Catalog
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-800/80 pt-6">
            <div>
              <span className="block text-2xl font-black text-white">100%</span>
              <span className="text-xs text-zinc-400">Authentic Optical Capture</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-emerald-400">0%</span>
              <span className="text-xs text-zinc-400">AI-Generated Allowance</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-white">64-bit</span>
              <span className="text-xs text-zinc-400">pHash Duplicate Shield</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-sky-400">15-Min</span>
              <span className="text-xs text-zinc-400">Secure Signed Delivery</span>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Verified Marketplace</h2>
            <p className="text-xs text-zinc-400">
              Showing {filteredPhotos.length} verified camera captures protected with diagonal watermarking.
            </p>
          </div>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedOrientation={selectedOrientation}
          onOrientationChange={setSelectedOrientation}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
        />

        <PhotoGrid photos={filteredPhotos} />
      </section>
    </div>
  );
}
