'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Download, Clock, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { INITIAL_PHOTOS } from '@/lib/data/sample-photos';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDate } from '@/lib/utils';

interface PurchaseItem {
  id: string;
  photo_id: string;
  photo_title: string;
  photo_thumbnail: string;
  amount: number;
  license_type: 'standard' | 'commercial';
  created_at: string;
  seller_name: string;
  camera_specs: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<Record<string, { url: string; expiresAt: number }>>({});
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  useEffect(() => {
    const defaultPurchases: PurchaseItem[] = [
      {
        id: 'ord-101',
        photo_id: INITIAL_PHOTOS[0].id,
        photo_title: INITIAL_PHOTOS[0].title,
        photo_thumbnail: INITIAL_PHOTOS[0].watermarked_url,
        amount: INITIAL_PHOTOS[0].price,
        license_type: 'standard',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        seller_name: INITIAL_PHOTOS[0].seller?.full_name || 'Elena Vance',
        camera_specs: `${INITIAL_PHOTOS[0].exif_data.make} ${INITIAL_PHOTOS[0].exif_data.model}`,
      },
      {
        id: 'ord-102',
        photo_id: INITIAL_PHOTOS[1].id,
        photo_title: INITIAL_PHOTOS[1].title,
        photo_thumbnail: INITIAL_PHOTOS[1].watermarked_url,
        amount: INITIAL_PHOTOS[1].price * 2.8,
        license_type: 'commercial',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        seller_name: INITIAL_PHOTOS[1].seller?.full_name || 'Marcus Sterling',
        camera_specs: `${INITIAL_PHOTOS[1].exif_data.make} ${INITIAL_PHOTOS[1].exif_data.model}`,
      },
    ];

    setPurchases(defaultPurchases);

    async function loadDbOrders() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('orders')
          .select('*, photo:photos(*)')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const mapped: PurchaseItem[] = data.map((d) => ({
            id: d.id,
            photo_id: d.photo_id,
            photo_title: d.photo?.title || 'Authentic Capture',
            photo_thumbnail: d.photo?.watermarked_url || '',
            amount: Number(d.amount),
            license_type: d.license_type,
            created_at: d.created_at,
            seller_name: 'Verified Photographer',
            camera_specs: d.photo?.exif_data?.make ? `${d.photo.exif_data.make} ${d.photo.exif_data.model || ''}` : 'Camera Verified',
          }));
          setPurchases(mapped);
        }
      } catch {}
    }
    loadDbOrders();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedTimeLeft: Record<string, number> = {};

      Object.entries(downloadLinks).forEach(([photoId, item]) => {
        const remainingSeconds = Math.max(0, Math.floor((item.expiresAt - now) / 1000));
        updatedTimeLeft[photoId] = remainingSeconds;
      });

      setTimeLeft(updatedTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [downloadLinks]);

  const handleGenerateDownload = async (photoId: string) => {
    setActiveDownloadId(photoId);
    try {
      const res = await fetch('/api/orders/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photoId }),
      });

      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        const expiresAt = Date.now() + 15 * 60 * 1000;
        setDownloadLinks((prev) => ({
          ...prev,
          [photoId]: {
            url: data.downloadUrl,
            expiresAt,
          },
        }));
      } else {
        alert(data.error || 'Failed to generate signed download');
      }
    } catch (err: any) {
      alert(err.message || 'Download error');
    } finally {
      setActiveDownloadId(null);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Buyer Licensing Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Purchased Captures</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Access your acquired licenses and generate secure, time-limited 15-minute signed URLs to download full-resolution originals.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors"
        >
          Explore More Photos
        </Link>
      </div>

      <div className="space-y-4">
        {purchases.map((item) => {
          const download = downloadLinks[item.photo_id];
          const remainingSec = timeLeft[item.photo_id] ?? (download ? 900 : 0);
          const isExpired = download && remainingSec <= 0;

          return (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm transition-all hover:border-zinc-700"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                  <img
                    src={item.photo_thumbnail}
                    alt={item.photo_title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-1 left-1 rounded bg-zinc-950/80 px-1 py-0.5 text-[8px] font-bold text-emerald-400">
                    VERIFIED
                  </div>
                </div>

                <div className="space-y-1">
                  <Link href={`/photos/${item.photo_id}`} className="hover:underline">
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      {item.photo_title}
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span>Photographer: {item.seller_name}</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-300">{item.camera_specs}</span>
                    <span>•</span>
                    <span>Purchased: {formatDate(item.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.license_type === 'commercial'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.license_type} License
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      {formatPrice(item.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
                {download && !isExpired ? (
                  <div className="space-y-2 text-right">
                    <a
                      href={download.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download High-Res Original
                    </a>
                    <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono text-amber-400">
                      <Clock className="h-3 w-3 animate-pulse" />
                      <span>Link expires in: {formatSeconds(remainingSec)}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateDownload(item.photo_id)}
                    disabled={activeDownloadId === item.photo_id}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 text-emerald-400" />
                    {activeDownloadId === item.photo_id
                      ? 'Generating 15m Signed Token...'
                      : isExpired
                      ? 'Renew 15-Min Signed Download'
                      : 'Generate 15-Min Secure Download'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
