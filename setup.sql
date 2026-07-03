-- Jalankan SQL ini di Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
CREATE TABLE IF NOT EXISTS file_categories (
  filename TEXT PRIMARY KEY,
  category TEXT NOT NULL
);
