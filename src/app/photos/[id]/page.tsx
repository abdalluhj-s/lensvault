'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Photo, LicenseType } from '@/types';
import { INITIAL_PHOTOS } from '@/lib/data/sample-photos';
import { createClient } from '@/lib/supabase/client';
import { WatermarkedImage } from '@/components/watermarked-image';
import { ExifBadge } from '@/components/exif-badge';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function PhotoDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('standard');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchasedOrder, setPurchasedOrder] = useState<any | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  useEffect(() => {
    async function loadPhoto() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('photos')
          .select('*, seller:profiles(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          setPhoto(data);
          return;
        }
      } catch {}

      const found = INITIAL_PHOTOS.find((p) => p.id === id);
      if (found) {
        setPhoto(found);
      }
    }

    if (id) {
      loadPhoto();
    }
  }, [id]);

  if (!photo) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-zinc-400">Loading authentic photo details...</p>
      </div>
    );
  }

  const standardPrice = photo.price;
  const commercialPrice = Math.round(photo.price * 2.8 * 100) / 100;
  const activePrice = selectedLicense === 'commercial' ? commercialPrice : standardPrice;

  const handleCheckout = async () => {
    setIsPurchasing(true);
    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_id: photo.id,
          license_type: selectedLicense,
          amount: activePrice,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPurchasedOrder(data.order);
        handleGenerateDownload();
      } else {
        alert(data.error || 'Failed to complete order');
      }
    } catch (err: any) {
      alert(err.message || 'Checkout error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleGenerateDownload = async () => {
    setDownloadLoading(true);
    try {
      const res = await fetch('/api/orders/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photo.id }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setExpiresIn(data.expiresInSeconds);
      }
    } catch {} finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Gallery
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full">
              <WatermarkedImage
                src={photo.watermarked_url}
                alt={photo.title}
                className="h-full w-full"
                priority
              />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Protected Preview with Diagonal Watermark
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                pHash: {photo.phash}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{photo.title}</h1>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                Authentic Verified
              </span>
            </div>
            {photo.description && (
              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">{photo.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400 border border-zinc-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Camera & Optics Specification
            </h2>
            <ExifBadge exif={photo.exif_data} />
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-5">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <Award className="h-5 w-5" />
              <h3 className="text-sm font-bold tracking-tight">LensVault Authenticity Certificate</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Physical Camera Hardware Sensor Validated ({photo.exif_data.make})</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero AI Software Tags or Synthetic Prompt Markers</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>64-bit DCT pHash Checked (Hamming Distance Unique)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Eligible for Full Commercial & Editorial Licensing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl backdrop-blur-md space-y-6 sticky top-24">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-zinc-400">
                Acquire Rights
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-white">{formatPrice(activePrice)}</span>
                <span className="text-xs text-zinc-400 font-mono">One-time payment</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Select License Tier
              </label>

              <div
                onClick={() => setSelectedLicense('standard')}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                  selectedLicense === 'standard'
                    ? 'border-emerald-500/80 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Standard License</span>
                  <span className="text-sm font-semibold text-zinc-300">{formatPrice(standardPrice)}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Web, editorial, blog posts, personal prints, and social media campaigns.
                </p>
              </div>

              <div
                onClick={() => setSelectedLicense('commercial')}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                  selectedLicense === 'commercial'
                    ? 'border-emerald-500/80 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Commercial License</span>
                  <span className="text-sm font-semibold text-zinc-300">{formatPrice(commercialPrice)}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Billboards, merchandise, TV advertising, unlimited worldwide distribution rights.
                </p>
              </div>
            </div>

            {!purchasedOrder ? (
              <button
                onClick={handleCheckout}
                disabled={isPurchasing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
              >
                <Lock className="h-4 w-4 stroke-[2.5]" />
                {isPurchasing ? 'Processing License...' : `Buy ${selectedLicense === 'commercial' ? 'Commercial' : 'Standard'} License`}
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>License Granted & Active</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Your purchase is completed. You can now download the full unwatermarked high-resolution original.
                </p>

                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Original File (Signed 15m)
                  </a>
                ) : (
                  <button
                    onClick={handleGenerateDownload}
                    disabled={downloadLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 py-2.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {downloadLoading ? 'Generating Signed URL...' : 'Generate 15-Min Download Link'}
                  </button>
                )}

                {expiresIn && (
                  <span className="block text-[10px] text-zinc-400 text-center font-mono">
                    ⏳ Signed URL valid for 15 minutes
                  </span>
                )}
              </div>
            )}

            <div className="space-y-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Instant unwatermarked high-res download</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Perpetual non-exclusive licensing certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Photographer directly compensated</span>
              </div>
            </div>

            {photo.seller && (
              <div className="border-t border-zinc-800/80 pt-4">
                <div className="flex items-center gap-3">
                  <img
                    src={photo.seller.avatar_url}
                    alt={photo.seller.full_name}
                    className="h-10 w-10 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{photo.seller.full_name}</h4>
                    <span className="text-[11px] text-zinc-400">@{photo.seller.username}</span>
                  </div>
                </div>
                {photo.seller.bio && (
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{photo.seller.bio}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
