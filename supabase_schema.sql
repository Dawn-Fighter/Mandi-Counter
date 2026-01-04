-- Mandi Counter Database Schema

-- 1. Create the main table
CREATE TABLE IF NOT EXISTS public.mandi_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  location TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  number_of_people INTEGER NOT NULL DEFAULT 1,
  per_person_cost DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.mandi_entries ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow users to view only their own entries
CREATE POLICY "Users can view own entries" ON public.mandi_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert entries where user_id matches their own ID
CREATE POLICY "Users can insert own entries" ON public.mandi_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own entries
CREATE POLICY "Users can update own entries" ON public.mandi_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own entries
CREATE POLICY "Users can delete own entries" ON public.mandi_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_mandi_entries_user_id ON public.mandi_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mandi_entries_date ON public.mandi_entries(date);
CREATE INDEX IF NOT EXISTS idx_mandi_entries_location ON public.mandi_entries(location);
