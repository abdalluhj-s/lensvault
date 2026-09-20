'use client';

import React from 'react';
import { Search, SlidersHorizontal, Camera, Compass } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedOrientation: string;
  onOrientationChange: (orientation: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

const CATEGORIES = ['All', 'Landscape', 'Street', 'Wildlife', 'Astrophotography', 'Architecture'];
const BRANDS = ['All Brands', 'Sony', 'Leica', 'Canon', 'Nikon', 'Fujifilm'];
const ORIENTATIONS = [
  { label: 'All Layouts', value: 'all' },
  { label: 'Landscape', value: 'landscape' },
  { label: 'Portrait', value: 'portrait' },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  selectedOrientation,
  onOrientationChange,
  selectedSort,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-6 mb-8">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search verified photos by title, tag, optics, or location..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Camera className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            <select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-7 py-2 text-xs font-medium text-zinc-300 outline-none focus:border-emerald-500 cursor-pointer"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center">
            <Compass className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            <select
              value={selectedOrientation}
              onChange={(e) => onOrientationChange(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-7 py-2 text-xs font-medium text-zinc-300 outline-none focus:border-emerald-500 cursor-pointer"
            >
              {ORIENTATIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="newest">Newest Uploads</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
