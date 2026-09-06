-- SQL Migration: Add Store Settings Table for Cross-Device Price & Rate Sync
-- Run this in your Supabase SQL Editor:
-- Go to https://supabase.com -> Select your project -> SQL Editor -> New query -> Paste and Run

CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon) to read store rates and products
CREATE POLICY "Allow public read access on store_settings"
  ON public.store_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow upsert/update with anon key
CREATE POLICY "Allow anon insert/update on store_settings"
  ON public.store_settings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Enable Realtime publication so mobile phones receive price updates automatically
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
