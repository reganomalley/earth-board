-- Viral Canvas Database Schema
-- Phase 1: Core canvas functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Canvas pixels table (current state)
CREATE TABLE IF NOT EXISTS canvas_pixels (
  x SMALLINT NOT NULL CHECK (x >= 0 AND x < 100),
  y SMALLINT NOT NULL CHECK (y >= 0 AND y < 100),
  color SMALLINT NOT NULL CHECK (color >= 0 AND color < 16),
  placed_by UUID,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (x, y)
);

-- Pixel history table (activity log)
CREATE TABLE IF NOT EXISTS pixel_history (
  id BIGSERIAL PRIMARY KEY,
  x SMALLINT NOT NULL,
  y SMALLINT NOT NULL,
  color SMALLINT NOT NULL,
  session_id UUID NOT NULL,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User cooldowns table (rate limiting)
CREATE TABLE IF NOT EXISTS user_cooldowns (
  session_id UUID PRIMARY KEY,
  last_placement TIMESTAMP WITH TIME ZONE NOT NULL,
  total_pixels INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pixel_history_placed_at ON pixel_history(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pixel_history_session ON pixel_history(session_id);
CREATE INDEX IF NOT EXISTS idx_user_cooldowns_last_placement ON user_cooldowns(last_placement);

-- Enable Row Level Security
ALTER TABLE canvas_pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cooldowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anonymous read access
CREATE POLICY "Allow anonymous read canvas_pixels"
  ON canvas_pixels FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read pixel_history"
  ON pixel_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read user_cooldowns"
  ON user_cooldowns FOR SELECT
  TO anon
  USING (true);

-- RLS Policies: Allow authenticated and anonymous writes
CREATE POLICY "Allow anonymous insert canvas_pixels"
  ON canvas_pixels FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update canvas_pixels"
  ON canvas_pixels FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert pixel_history"
  ON pixel_history FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert user_cooldowns"
  ON user_cooldowns FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update user_cooldowns"
  ON user_cooldowns FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Function to update total_pixels count
CREATE OR REPLACE FUNCTION increment_pixel_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_cooldowns
  SET total_pixels = total_pixels + 1
  WHERE session_id = NEW.session_id;

  IF NOT FOUND THEN
    INSERT INTO user_cooldowns (session_id, last_placement, total_pixels)
    VALUES (NEW.session_id, NOW(), 1);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment pixel count
CREATE TRIGGER pixel_placed_trigger
AFTER INSERT ON pixel_history
FOR EACH ROW
EXECUTE FUNCTION increment_pixel_count();

-- Comments for documentation
COMMENT ON TABLE canvas_pixels IS 'Current state of the canvas (100x100 grid)';
COMMENT ON TABLE pixel_history IS 'Complete history of all pixel placements';
COMMENT ON TABLE user_cooldowns IS 'Rate limiting for anonymous sessions';
