# LensVault — Authentic Photography Marketplace

LensVault is a full-stack, production-ready web application engineered exclusively for buying and selling original photographs captured by real cameras. The platform enforces high authenticity by rejecting AI-generated images and blocking duplicate/stolen uploads using an automated AI verification pipeline.

---

## Key Highlights & Core Value Proposition

- **Authenticity Gate**: Enforces physical camera presence through binary EXIF sensor telemetry extraction (Camera Make, Model, Lens, ISO, Shutter, Aperture, Focal Length).
- **Zero AI Tolerance**: Automated detection heuristic inspects metadata and synthetic software signatures (Midjourney, DALL-E, Stable Diffusion, ComfyUI, Adobe Firefly, etc.) and blocks non-camera uploads.
- **Perceptual Hashing (64-bit DCT pHash)**: Fast client & server perceptual hashing stored in PostgreSQL with Hamming distance comparison. Rejects identical or cropped/resized re-uploads (>90% similarity cutoff).
- **Dual-Storage Protection**:
  - `originals/` (Private bucket): Stores full-resolution unwatermarked photos. Accessible strictly through 15-minute time-limited Signed URLs upon verified purchase.
  - `previews/` (Public bucket): Stores automatically downscaled, compressed, and watermarked versions for public gallery browsing.
- **Complete Licensing & Checkout**: Supports Standard and Commercial licenses with instant delivery to the buyer's "My Purchases" vault.

---

## Tech Stack

- **Frontend & Full-Stack Framework**: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL 17, Row Level Security, Auth, Storage)
- **Metadata Extraction**: `exifr` (EXIF, TIFF, XMP, GPS parser)
- **Perceptual Hashing**: Pure TypeScript 64-bit DCT pHash with Hamming bitwise distance
- **Watermarking**: Dynamic repeating diagonal watermark (`"LensVault Preview"`) with bottom verification strip

---

## Project Structure

```
lensvault/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── photos/
│   │   │   │   ├── upload/route.ts          # 4-stage verification & upload pipeline
│   │   │   │   └── duplicate-check/route.ts # Preflight 64-bit pHash duplicate check
│   │   │   └── orders/
│   │   │       ├── checkout/route.ts        # Order creation & licensing
│   │   │       └── download/route.ts        # 15-minute signed URL delivery
│   │   ├── auth/
│   │   │   ├── login/page.tsx               # Supabase auth login
│   │   │   └── signup/page.tsx              # Signup with buyer/seller roles
│   │   ├── photos/[id]/page.tsx             # Photo detail & EXIF telemetry inspector
│   │   ├── profile/page.tsx                 # Seller portfolio & earnings dashboard
│   │   ├── purchases/page.tsx               # Buyer vault & 15m download links
│   │   ├── upload/page.tsx                  # 4-stage live verification studio
│   │   ├── globals.css                      # Tailwind dark theme tokens
│   │   ├── layout.tsx                       # Root layout & navigation
│   │   └── page.tsx                         # Marketplace explore & multi-filter
│   ├── components/
│   │   ├── exif-badge.tsx                   # Camera optics telemetry badge
│   │   ├── filter-bar.tsx                   # Brand, category, orientation filters
│   │   ├── footer.tsx                       # Platform footer & tech specs
│   │   ├── navbar.tsx                       # Brand header with status badges
│   │   ├── photo-card.tsx                   # Watermarked preview card
│   │   ├── photo-grid.tsx                   # Gallery grid
│   │   └── watermarked-image.tsx            # Protected image renderer
│   ├── lib/
│   │   ├── data/sample-photos.ts            # Realistic camera seed data
│   │   ├── supabase/
│   │   │   ├── client.ts                    # Supabase browser client
│   │   │   └── server.ts                    # Supabase SSR server client
│   │   ├── verification/
│   │   │   ├── ai-detector.ts               # Authenticity pipeline evaluator
│   │   │   ├── exif.ts                      # Sensor EXIF parser & AI tag scanner
│   │   │   ├── phash.ts                     # 64-bit DCT pHash & Hamming distance
│   │   │   └── watermark.ts                 # Diagonal watermark canvas generator
│   │   └── utils.ts
│   └── types/
│       └── index.ts                         # Photo, Order, Profile, EXIF types
└── supabase/
    └── migrations/
        └── 20260920000000_lensvault_schema.sql # PostgreSQL schema, functions & RLS
```

---

## Supabase Database Setup

The migration script [`supabase/migrations/20260920000000_lensvault_schema.sql`](file:///./supabase/migrations/20260920000000_lensvault_schema.sql) contains:
- `profiles`, `photos`, `orders` tables with Row Level Security (RLS)
- `hamming_distance(text, text)` PostgreSQL bitwise function
- `check_phash_duplicate(text, int)` similarity lookup
- `previews` (public) & `originals` (private) storage buckets

### Environment Variables (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://opppyurtuurhvouovtpp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
