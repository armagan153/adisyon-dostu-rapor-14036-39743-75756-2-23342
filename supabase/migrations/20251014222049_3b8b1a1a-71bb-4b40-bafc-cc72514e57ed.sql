-- Create media library table
CREATE TABLE public.media_library (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view media library"
ON public.media_library
FOR SELECT
USING (true);

CREATE POLICY "Public can insert media library"
ON public.media_library
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can delete media library"
ON public.media_library
FOR DELETE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_media_library_uploaded_at ON public.media_library(uploaded_at DESC);