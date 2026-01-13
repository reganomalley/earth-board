-- Add name column to canvases table for "the big bang" and roman numeral dates
-- Migration: Add canvas naming (the big bang / roman numerals)

ALTER TABLE canvases
ADD COLUMN IF NOT EXISTS name TEXT;

-- Create index for canvas name
CREATE INDEX IF NOT EXISTS idx_canvases_name ON canvases(name);

-- Comment for documentation
COMMENT ON COLUMN canvases.name IS 'Canvas name: "the big bang" for first canvas, roman numerals (MM.DD.YYYY) for subsequent canvases';
