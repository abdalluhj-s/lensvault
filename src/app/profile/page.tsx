'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Camera, ShieldCheck, DollarSign, Download, UploadCloud, CheckCircle2 } from 'lucide-react';
import { INITIAL_PHOTOS, SAMPLE_PROFILES } from '@/lib/data/sample-photos';
import { formatPrice } from '@/lib/utils';

export default function ProfilePage() {
  const profile = SAMPLE_PROFILES['a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'];
  const sellerPhotos = INITIAL_PHOTOS.filter((p) => p.seller_id === profile.id);

  const [activeTab, setActiveTab] = useState<'uploads' | 'analytics' | 'settings'>('uploads');

  const totalEarnings = 1420.0;
  const totalDownloads = 48;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{profile.full_name}</h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Verified Seller & Creator
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">@{profile.username}</p>
              <p className="text-xs text-zinc-300 max-w-xl leading-relaxed pt-1">{profile.bio}</p>
            </div>
          </div>

          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            <UploadCloud className="h-4 w-4" />
            Upload New Capture
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-800/80 pt-6">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Camera className="h-3.5 w-3.5 text-emerald-400" /> Active Portfolio
            </span>
            <p className="text-xl font-bold text-white">{sellerPhotos.length} Captures</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Gross Revenue
            </span>
            <p className="text-xl font-bold text-emerald-400">{formatPrice(totalEarnings)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Download className="h-3.5 w-3.5 text-sky-400" /> Licensed Downloads
            </span>
            <p className="text-xl font-bold text-white">{totalDownloads}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> AI Gate Pass Rate
            </span>
            <p className="text-xl font-bold text-white">100%</p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800 mb-6 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'uploads'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          My Uploaded Photos ({sellerPhotos.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Verification & Account Settings
        </button>
      </div>

      {activeTab === 'uploads' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellerPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-700"
            >
              <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
                <img src={photo.watermarked_url} alt={photo.title} className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2 rounded-md bg-emerald-600/90 px-2 py-0.5 text-xs font-bold text-white">
                  {formatPrice(photo.price)}
                </div>
                <div className="absolute top-2 left-2 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-white line-clamp-1">{photo.title}</h3>
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>{photo.exif_data.make} {photo.exif_data.model?.replace(photo.exif_data.make || '', '').trim()}</span>
                  <span>{photo.category}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span className="text-zinc-500 font-mono text-[10px]">pHash: {photo.phash.slice(0, 10)}...</span>
                  <Link
                    href={`/photos/${photo.id}`}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    View Listing
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Account Verification Settings</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Manage your photographer credentials and payout details.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Primary Camera Hardware</label>
              <input
                type="text"
                defaultValue="Sony ILCE-7RM4 (Alpha 7R IV) • Leica M11"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Creator Bio</label>
              <textarea
                rows={3}
                defaultValue={profile.bio}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Default License Pricing (USD)</label>
              <input
                type="number"
                defaultValue="35.00"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none font-mono"
              />
            </div>

            <button
              onClick={() => alert('Settings saved successfully')}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
