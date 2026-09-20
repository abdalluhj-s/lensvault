'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';
import { extractExif, ExifInspectionResult } from '@/lib/verification/exif';
import { computeBrowserPHash, calculateHammingDistance } from '@/lib/verification/phash';
import { createWatermarkedPreview } from '@/lib/verification/watermark';
import { ExifBadge } from '@/components/exif-badge';
import { ExifData } from '@/types';

type PipelineStage = 'idle' | 'extracting_exif' | 'checking_phash' | 'checking_ai' | 'watermarking' | 'completed' | 'rejected';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('25.00');
  const [category, setCategory] = useState('Landscape');
  const [tags, setTags] = useState('nature, authentic, raw');

  // Verification Pipeline States
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [stageLogs, setStageLogs] = useState<string[]>([]);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [phash, setPhash] = useState<string | null>(null);
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [rejectionDetails, setRejectionDetails] = useState<string | null>(null);

  // Trigger file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = async (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setStage('idle');
    setRejectionError(null);
    setRejectionDetails(null);
    setStageLogs([]);
    setWatermarkedUrl(null);

    // Auto-fill title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
  };

  // Run the full verification pipeline
  const handleStartVerification = async () => {
    if (!selectedFile) return;

    try {
      // -------------------------------------------------------------
      // STAGE 1: EXIF Metadata & Optical Sensor Extraction
      // -------------------------------------------------------------
      setStage('extracting_exif');
      setStageLogs((prev) => [...prev, '⚡ Reading binary EXIF header & optical sensor tags...']);

      const buffer = await selectedFile.arrayBuffer();
      const exifResult = await extractExif(buffer);
      setExifData(exifResult.exif);

      await new Promise((r) => setTimeout(r, 600));

      if (exifResult.hasCameraHardware) {
        setStageLogs((prev) => [
          ...prev,
          `✅ Valid camera hardware sensor detected: ${exifResult.exif.make} ${exifResult.exif.model || ''}`,
        ]);
      } else {
        setStageLogs((prev) => [
          ...prev,
          '⚠️ Warning: Camera hardware sensor tags missing from image header.',
        ]);
      }

      // -------------------------------------------------------------
      // STAGE 2: 64-bit DCT Perceptual Hashing & Duplicate Check
      // -------------------------------------------------------------
      setStage('checking_phash');
      setStageLogs((prev) => [...prev, '⚡ Computing 64-bit Discrete Cosine Transform pHash...']);

      const computedPhash = await computeBrowserPHash(selectedFile);
      setPhash(computedPhash);
      setStageLogs((prev) => [...prev, `🔍 pHash Fingerprint: ${computedPhash}`]);

      // Call API duplicate check
      const dupRes = await fetch('/api/photos/duplicate-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phash: computedPhash }),
      });
      const dupData = await dupRes.json();

      if (dupData.isDuplicate) {
        setStage('rejected');
        setRejectionError('This image or a near-identical copy has already been uploaded.');
        setRejectionDetails(
          `Matches catalog photo "${dupData.match.title}" with Hamming distance ${dupData.match.distance}/64 bits (>90% perceptual similarity).`
        );
        return;
      }

      setStageLogs((prev) => [...prev, '✅ Duplicate check passed (Hamming distance unique in database)']);
      await new Promise((r) => setTimeout(r, 600));

      // -------------------------------------------------------------
      // STAGE 3: AI Generation & Synthetic Software Scan
      // -------------------------------------------------------------
      setStage('checking_ai');
      setStageLogs((prev) => [...prev, '⚡ Scanning for generative AI artifacts & software signatures...']);

      if (exifResult.isAiFlagged) {
        setStage('rejected');
        setRejectionError('Only authentic camera captures are permitted on this platform.');
        setRejectionDetails(exifResult.reasons.join(' | '));
        return;
      }

      setStageLogs((prev) => [...prev, '✅ Zero AI signatures detected. Verified authentic camera capture.']);
      await new Promise((r) => setTimeout(r, 600));

      // -------------------------------------------------------------
      // STAGE 4: Watermarking & Secure Ingestion
      // -------------------------------------------------------------
      setStage('watermarking');
      setStageLogs((prev) => [...prev, '⚡ Generating diagonal watermarked web preview & storage packaging...']);

      const watermarkedBlob = await createWatermarkedPreview(selectedFile);
      const watermarkedBlobUrl = URL.createObjectURL(watermarkedBlob);
      setWatermarkedUrl(watermarkedBlobUrl);

      // Convert to base64 for API upload
      const reader = new FileReader();
      reader.readAsDataURL(watermarkedBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        // Submit to API
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title || 'Authentic Capture');
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('tags', tags);
        formData.append('phash', computedPhash);
        formData.append('watermarked_data_url', base64Data);

        const uploadRes = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (uploadRes.ok && uploadData.success) {
          setStage('completed');
          setStageLogs((prev) => [
            ...prev,
            '🎉 Photo successfully verified and published to LensVault Marketplace!',
          ]);
        } else {
          setStage('rejected');
          setRejectionError(uploadData.error || 'Verification rejected');
          setRejectionDetails(uploadData.details || uploadData.verification?.rejectionReason);
        }
      };
    } catch (err: any) {
      setStage('rejected');
      setRejectionError('Verification failed due to an unexpected error.');
      setRejectionDetails(err.message || 'Processing exception');
    }
  };

  // Demo presets helper to quickly test scenarios
  const loadDemoPreset = async (presetType: 'genuine' | 'ai' | 'duplicate') => {
    setRejectionError(null);
    setRejectionDetails(null);
    setStage('idle');
    setStageLogs([]);

    if (presetType === 'genuine') {
      setTitle('Sunrise Over Mount Rainier');
      setDescription('Captured at dawn on tripod with Sony Alpha 7 IV and FE 24-105mm F4 G OSS.');
      setPrice('32.00');
      setCategory('Landscape');
      setTags('mountain, sunrise, pacific, nature');
      // Create a mock image file
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.fillText('Authentic Sony A7 IV Optical Capture', 40, 200);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sony_a7_genuine_capture.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          // Pre-populate authentic camera EXIF
          setExifData({
            make: 'Sony',
            model: 'ILCE-7M4',
            lens: 'FE 24-105mm F4 G OSS',
            shutter: '1/250s',
            aperture: 'f/8.0',
            iso: '100',
            focal_length: '50mm',
            white_balance: 'Daylight',
          });
        }
      }, 'image/jpeg');
    } else if (presetType === 'ai') {
      setTitle('Cyberpunk Futuristic Cityscape');
      setDescription('Generated using synthetic prompt engineering.');
      setPrice('20.00');
      setCategory('Street');
      setTags('cyberpunk, neon, future');
      // Create canvas with synthetic mark
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#ec4899';
      ctx.font = '20px sans-serif';
      ctx.fillText('Synthetic Diffusion Generation', 40, 200);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'midjourney_synthetic_art.png', { type: 'image/png' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          // No hardware tags, simulated Midjourney software
          setExifData({
            software: 'Midjourney v6.0 Diffusion Engine',
          });
        }
      }, 'image/png');
    } else if (presetType === 'duplicate') {
      setTitle('Dolomite Peaks at Sunrise (Re-upload)');
      setDescription('Identical copy of existing photo in database.');
      setPrice('35.00');
      setCategory('Landscape');
      setTags('mountain, dolomites');
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.fillText('Duplicate Photo Test', 40, 200);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'dolomites_duplicate_copy.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          // Existing pHash in database
          setPhash('f0e1c2b3a4958677');
          setExifData({
            make: 'Sony',
            model: 'ILCE-7RM4',
            lens: 'FE 24-70mm F2.8 GM',
            shutter: '1/125s',
            aperture: 'f/8.0',
            iso: '100',
          });
        }
      }, 'image/jpeg');
    }
  };

  return (\n    <div className=\"mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10\">\n      {/* Header */}\n      <div className=\"mb-8\">\n        <div className=\"inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3\">\n          <ShieldCheck className=\"h-3.5 w-3.5\" />\n          <span>Automated AI & Duplicate Verification Engine</span>\n        </div>\n        <h1 className=\"text-3xl font-black text-white tracking-tight\">Upload & Authenticate Photo</h1>\n        <p className=\"mt-1 text-sm text-zinc-400 max-w-2xl\">\n          To maintain marketplace integrity, all uploads undergo a 4-stage automated gate: EXIF sensor telemetry check,\n          64-bit DCT perceptual hashing, and generative AI signature detection.\n        </p>\n      </div>\n\n      {/* Quick Interactive Testing Bar */}\n      <div className=\"mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4\">\n        <div className=\"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3\">\n          <div className=\"flex items-center gap-2 text-xs font-semibold text-zinc-300\">\n            <Sparkles className=\"h-4 w-4 text-emerald-400\" />\n            <span>Interactive Verification Demos:</span>\n          </div>\n          <div className=\"flex flex-wrap items-center gap-2\">\n            <button\n              onClick={() => loadDemoPreset('genuine')}\n              className=\"rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition-colors\"\n            >\n              1. Test Genuine Camera\n            </button>\n            <button\n              onClick={() => loadDemoPreset('ai')}\n              className=\"rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/50 transition-colors\"\n            >\n              2. Test AI-Generated Image\n            </button>\n            <button\n              onClick={() => loadDemoPreset('duplicate')}\n              className=\"rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/50 transition-colors\"\n            >\n              3. Test Duplicate Image\n            </button>\n          </div>\n        </div>\n      </div>\n\n      <div className=\"grid grid-cols-1 lg:grid-cols-12 gap-8\">\n        {/* Left Column: Dropzone & Stepper (7 cols) */}\n        <div className=\"lg:col-span-7 space-y-6\">\n          {/* File Upload Dropzone */}\n          <div\n            onClick={() => fileInputRef.current?.click()}\n            className=\"group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center cursor-pointer transition-all hover:border-emerald-500/80 hover:bg-zinc-900/80\"\n          >\n            <input\n              ref={fileInputRef}\n              type=\"file\"\n              accept=\"image/jpeg,image/png,image/tiff,image/x-adobe-dng,image/webp\"\n              onChange={handleFileChange}\n              className=\"hidden\"\n            />\n\n            {previewUrl ? (\n              <div className=\"relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-zinc-950 mb-3 border border-zinc-800\">\n                <img src={previewUrl} alt=\"Upload preview\" className=\"h-full w-full object-contain\" />\n                <div className=\"absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity\">\n                  <span className=\"rounded-lg bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-white border border-zinc-700\">\n                    Click to change photo\n                  </span>\n                </div>\n              </div>\n            ) : (\n              <div className=\"flex flex-col items-center py-6\">\n                <div className=\"flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors mb-3\">\n                  <UploadCloud className=\"h-7 w-7\" />\n                </div>\n                <h3 className=\"text-sm font-bold text-white\">Click or drag & drop high-resolution capture</h3>\n                <p className=\"text-xs text-zinc-400 mt-1 max-w-sm\">\n                  Accepts JPEG, PNG, TIFF, and RAW files with intact EXIF sensor data.\n                </p>\n              </div>\n            )}\n\n            {selectedFile && (\n              <span className=\"text-xs font-mono text-emerald-400\">\n                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)\n              </span>\n            )}\n          </div>\n\n          {/* Verification Stepper Progress */}\n          {stage !== 'idle' && (\n            <div className=\"rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4\">\n              <div className=\"flex items-center justify-between border-b border-zinc-800 pb-3\">\n                <h3 className=\"text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2\">\n                  <Cpu className=\"h-4 w-4 text-emerald-400\" />\n                  Verification Pipeline Status\n                </h3>\n                <span className=\"text-xs font-mono text-zinc-400 uppercase\">\n                  {stage.replace('_', ' ')}\n                </span>\n              </div>\n\n              {/* Steps Progress Visualizer */}\n              <div className=\"grid grid-cols-4 gap-2 text-center text-[11px]\">\n                {/* Step 1 */}\n                <div\n                  className={`rounded-lg p-2.5 border transition-all ${\n                    ['extracting_exif', 'checking_phash', 'checking_ai', 'watermarking', 'completed'].includes(stage)\n                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'\n                      : 'border-zinc-800 bg-zinc-900 text-zinc-500'\n                  }`}\n                >\n                  <span className=\"block font-bold\">1. EXIF Scan</span>\n                  <span className=\"text-[9px]\">Sensor Data</span>\n                </div>\n\n                {/* Step 2 */}\n                <div\n                  className={`rounded-lg p-2.5 border transition-all ${\n                    ['checking_phash', 'checking_ai', 'watermarking', 'completed'].includes(stage)\n                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'\n                      : 'border-zinc-800 bg-zinc-900 text-zinc-500'\n                  }`}\n                >\n                  <span className=\"block font-bold\">2. pHash 64-bit</span>\n                  <span className=\"text-[9px]\">Duplicate Guard</span>\n                </div>\n\n                {/* Step 3 */}\n                <div\n                  className={`rounded-lg p-2.5 border transition-all ${\n                    ['checking_ai', 'watermarking', 'completed'].includes(stage)\n                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'\n                      : 'border-zinc-800 bg-zinc-900 text-zinc-500'\n                  }`}\n                >\n                  <span className=\"block font-bold\">3. AI Filter</span>\n                  <span className=\"text-[9px]\">Zero Synthetic</span>\n                </div>\n\n                {/* Step 4 */}\n                <div\n                  className={`rounded-lg p-2.5 border transition-all ${\n                    ['watermarking', 'completed'].includes(stage)\n                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'\n                      : 'border-zinc-800 bg-zinc-900 text-zinc-500'\n                  }`}\n                >\n                  <span className=\"block font-bold\">4. Watermark</span>\n                  <span className=\"text-[9px]\">Asset Publish</span>\n                </div>\n              </div>\n\n              {/* Live Terminal Log */}\n              <div className=\"rounded-xl bg-zinc-950 p-3.5 font-mono text-xs text-zinc-300 space-y-1.5 max-h-48 overflow-y-auto border border-zinc-800/80\">\n                {stageLogs.map((log, index) => (\n                  <div key={index} className=\"leading-tight\">\n                    {log}\n                  </div>\n                ))}\n              </div>\n\n              {/* Rejection Alert Box */}\n              {stage === 'rejected' && rejectionError && (\n                <div className=\"rounded-xl border border-rose-500/50 bg-rose-950/40 p-4 text-rose-200 space-y-2\">\n                  <div className=\"flex items-center gap-2 text-rose-400 font-bold text-sm\">\n                    <XCircle className=\"h-5 w-5\" />\n                    <span>Upload Rejected: {rejectionError}</span>\n                  </div>\n                  {rejectionDetails && (\n                    <p className=\"text-xs text-rose-300 leading-relaxed bg-rose-950/60 p-2.5 rounded-lg border border-rose-800/40\">\n                      {rejectionDetails}\n                    </p>\n                  )}\n                  <div className=\"text-[11px] text-zinc-400 pt-1\">\n                    Please upload an unedited optical camera capture containing raw camera sensor tags.\n                  </div>\n                </div>\n              )}\n\n              {/* Success Alert Box */}\n              {stage === 'completed' && (\n                <div className=\"rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-emerald-200 space-y-3\">\n                  <div className=\"flex items-center gap-2 text-emerald-400 font-bold text-sm\">\n                    <CheckCircle2 className=\"h-5 w-5\" />\n                    <span>Authenticity Verification Successful!</span>\n                  </div>\n                  <p className=\"text-xs text-zinc-300\">\n                    Your photo passed all strict authenticity gates and has been ingested with diagonal watermarking.\n                  </p>\n                  <div className=\"flex items-center gap-3 pt-1\">\n                    <button\n                      onClick={() => router.push('/')}\n                      className=\"rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5\"\n                    >\n                      <span>View in Marketplace</span>\n                      <ArrowRight className=\"h-3.5 w-3.5\" />\n                    </button>\n                    <button\n                      onClick={() => {\n                        setStage('idle');\n                        setSelectedFile(null);\n                        setPreviewUrl(null);\n                        setStageLogs([]);\n                      }}\n                      className=\"rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition-colors\"\n                    >\n                      Upload Another\n                    </button>\n                  </div>\n                </div>\n              )}\n            </div>\n          )}\n\n          {/* EXIF Data Preview if detected */}\n          {exifData && (\n            <div className=\"space-y-2\">\n              <span className=\"text-xs font-semibold uppercase tracking-wider text-zinc-400\">\n                Detected Hardware Telemetry\n              </span>\n              <ExifBadge exif={exifData} />\n            </div>\n          )}\n        </div>\n\n        {/* Right Column: Listing Details & Trigger (5 cols) */}\n        <div className=\"lg:col-span-5 space-y-5\">\n          <div className=\"rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4\">\n            <h3 className=\"text-sm font-bold text-white uppercase tracking-wider\">Photo Listing Details</h3>\n\n            {/* Title */}\n            <div className=\"space-y-1.5\">\n              <label className=\"text-xs font-semibold text-zinc-300\">Title</label>\n              <input\n                type=\"text\"\n                value={title}\n                onChange={(e) => setTitle(e.target.value)}\n                placeholder=\"e.g. Alpine Dawn at Cascade Pass\"\n                className=\"w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500\"\n              />\n            </div>\n\n            {/* Description */}\n            <div className=\"space-y-1.5\">\n              <label className=\"text-xs font-semibold text-zinc-300\">Description & Optical Notes</label>\n              <textarea\n                rows={3}\n                value={description}\n                onChange={(e) => setDescription(e.target.value)}\n                placeholder=\"Details on lighting, filters, composition, tripod usage...\"\n                className=\"w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 resize-none\"\n              />\n            </div>\n\n            {/* Price & Category */}\n            <div className=\"grid grid-cols-2 gap-3\">\n              <div className=\"space-y-1.5\">\n                <label className=\"text-xs font-semibold text-zinc-300\">Price (USD)</label>\n                <div className=\"relative\">\n                  <span className=\"absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono\">$</span>\n                  <input\n                    type=\"number\"\n                    step=\"1\"\n                    min=\"5\"\n                    value={price}\n                    onChange={(e) => setPrice(e.target.value)}\n                    className=\"w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-7 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono\"\n                  />\n                </div>\n              </div>\n\n              <div className=\"space-y-1.5\">\n                <label className=\"text-xs font-semibold text-zinc-300\">Category</label>\n                <select\n                  value={category}\n                  onChange={(e) => setCategory(e.target.value)}\n                  className=\"w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500\"\n                >\n                  <option value=\"Landscape\">Landscape</option>\n                  <option value=\"Street\">Street</option>\n                  <option value=\"Wildlife\">Wildlife</option>\n                  <option value=\"Astrophotography\">Astrophotography</option>\n                  <option value=\"Architecture\">Architecture</option>\n                  <option value=\"Portrait\">Portrait</option>\n                </select>\n              </div>\n            </div>\n\n            {/* Tags */}\n            <div className=\"space-y-1.5\">\n              <label className=\"text-xs font-semibold text-zinc-300\">Tags (comma separated)</label>\n              <input\n                type=\"text\"\n                value={tags}\n                onChange={(e) => setTags(e.target.value)}\n                placeholder=\"nature, mountain, sunrise\"\n                className=\"w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500\"\n              />\n            </div>\n\n            {/* Submit Button */}\n            <button\n              onClick={handleStartVerification}\n              disabled={!selectedFile || ['extracting_exif', 'checking_phash', 'checking_ai', 'watermarking'].includes(stage)}\n              className=\"w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed\"\n            >\n              <ShieldCheck className=\"h-4 w-4 stroke-[2.5]\" />\n              {stage === 'idle' || stage === 'rejected'\n                ? 'Run Verification & Publish'\n                : stage === 'completed'\n                ? 'Published'\n                : 'Verifying Captures...'}\n            </button>\n\n            {/* Watermark notice */}\n            <div className=\"rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-[11px] text-zinc-400 space-y-1\">\n              <span className=\"font-semibold text-zinc-300 flex items-center gap-1\">\n                <Layers className=\"h-3.5 w-3.5 text-emerald-400\" />\n                Asset Protection Protocol\n              </span>\n              <p>\n                Original unwatermarked file is stored in encrypted private storage. A public downscaled version with\n                semi-transparent diagonal watermark &quot;LensVault Preview&quot; will be automatically generated for browsing.\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n