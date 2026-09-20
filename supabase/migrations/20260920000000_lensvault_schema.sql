-- ==============================================================================
-- LensVault Database Schema & Migration Script
-- Project: LensVault - Authentic Photography Marketplace
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_type AS ENUM ('standard', 'commercial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT CHECK (role IN ('buyer', 'seller', 'both')) DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 19.99,
    tags TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'Landscape',
    orientation TEXT DEFAULT 'landscape',
    original_url TEXT NOT NULL,
    watermarked_url TEXT NOT NULL,
    phash TEXT NOT NULL,
    exif_data JSONB DEFAULT '{}'::jsonb,
    verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
    rejection_reason TEXT,
    is_ai_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_photos_phash ON public.photos (phash);
CREATE INDEX IF NOT EXISTS idx_photos_status ON public.photos (verification_status);
CREATE INDEX IF NOT EXISTS idx_photos_seller ON public.photos (seller_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos (created_at DESC);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    license_type TEXT CHECK (license_type IN ('standard', 'commercial')) DEFAULT 'standard',
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_photo ON public.orders (photo_id);

CREATE OR REPLACE FUNCTION public.hamming_distance(h1 TEXT, h2 TEXT)
RETURNS INTEGER AS $$
DECLARE
    dist INTEGER := 0;
    val1 BIGINT;
    val2 BIGINT;
BEGIN
    IF length(h1) <> length(h2) THEN
        RETURN 64;
    END IF;
    val1 := ('x' || lpad(h1, 16, '0'))::bit(64)::bigint;
    val2 := ('x' || lpad(h2, 16, '0'))::bit(64)::bigint;
    dist := length(replace((val1 # val2)::bit(64)::text, '0', ''));
    RETURN dist;
EXCEPTION WHEN OTHERS THEN
    RETURN 64;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.check_phash_duplicate(input_phash TEXT, max_distance INTEGER DEFAULT 6)
RETURNS TABLE(photo_id UUID, title TEXT, distance INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.title, public.hamming_distance(p.phash, input_phash) as distance
    FROM public.photos p
    WHERE public.hamming_distance(p.phash, input_phash) <= max_distance
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

INSERT INTO storage.buckets (id, name, public)
VALUES ('previews', 'previews', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('originals', 'originals', false)
ON CONFLICT (id) DO UPDATE SET public = false;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Approved photos are viewable by everyone" ON public.photos FOR SELECT USING (verification_status = 'approved' OR auth.uid() = seller_id);
CREATE POLICY "Authenticated users can insert photos" ON public.photos FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own photos" ON public.photos FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can view their own purchases" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view orders for their photos" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.photos WHERE photos.id = orders.photo_id AND photos.seller_id = auth.uid())
);
CREATE POLICY "Authenticated users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
