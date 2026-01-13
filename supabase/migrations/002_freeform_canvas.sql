-- Viral Canvas Freeform Drawing Schema
-- Complete pivot from pixel grid to freeform collaborative canvas

-- ============================================
-- CANVASES TABLE (Daily canvas management)
-- ============================================
CREATE TABLE IF NOT EXISTS canvases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  theme TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  snapshot_url TEXT,
  object_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_canvases_date ON canvases(date DESC);
CREATE INDEX IF NOT EXISTS idx_canvases_status ON canvases(status);

-- ============================================
-- CANVAS OBJECTS TABLE (Replaces canvas_pixels)
-- ============================================
CREATE TABLE IF NOT EXISTS canvas_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stroke', 'rectangle', 'circle', 'arrow', 'line', 'text', 'sticker')),
  data JSONB NOT NULL,
  style JSONB NOT NULL,
  transform JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  z_index INTEGER NOT NULL DEFAULT 0,
  locked BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_canvas_objects_canvas_id ON canvas_objects(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_objects_type ON canvas_objects(type);
CREATE INDEX IF NOT EXISTS idx_canvas_objects_z_index ON canvas_objects(canvas_id, z_index);
CREATE INDEX IF NOT EXISTS idx_canvas_objects_created_at ON canvas_objects(created_at DESC);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_canvas_objects_data ON canvas_objects USING GIN (data);

-- ============================================
-- STICKERS TABLE (Curated library)
-- ============================================
CREATE TABLE IF NOT EXISTS stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stickers_category ON stickers(category);
CREATE INDEX IF NOT EXISTS idx_stickers_active ON stickers(active);

-- ============================================
-- OBJECT HISTORY (Audit trail + undo)
-- ============================================
CREATE TABLE IF NOT EXISTS object_history (
  id BIGSERIAL PRIMARY KEY,
  object_id UUID NOT NULL,
  canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'transform')),
  data_before JSONB,
  data_after JSONB,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_object_history_object_id ON object_history(object_id);
CREATE INDEX IF NOT EXISTS idx_object_history_canvas_id ON object_history(canvas_id);
CREATE INDEX IF NOT EXISTS idx_object_history_session_id ON object_history(session_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE object_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anonymous read access
CREATE POLICY "Allow anonymous read canvases"
  ON canvases FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read canvas_objects"
  ON canvas_objects FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read stickers"
  ON stickers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read object_history"
  ON object_history FOR SELECT
  TO anon
  USING (true);

-- RLS Policies: Allow anonymous writes
CREATE POLICY "Allow anonymous insert canvases"
  ON canvases FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert canvas_objects"
  ON canvas_objects FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update canvas_objects"
  ON canvas_objects FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete canvas_objects"
  ON canvas_objects FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert object_history"
  ON object_history FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get or create today's canvas
CREATE OR REPLACE FUNCTION get_active_canvas()
RETURNS UUID AS $$
DECLARE
  canvas_uuid UUID;
BEGIN
  SELECT id INTO canvas_uuid FROM canvases WHERE date = CURRENT_DATE AND status = 'active';

  IF canvas_uuid IS NULL THEN
    INSERT INTO canvases (date, status) VALUES (CURRENT_DATE, 'active') RETURNING id INTO canvas_uuid;
  END IF;

  RETURN canvas_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update canvas object count trigger
CREATE OR REPLACE FUNCTION update_canvas_object_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE canvases SET object_count = object_count + 1 WHERE id = NEW.canvas_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE canvases SET object_count = object_count - 1 WHERE id = OLD.canvas_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER canvas_object_count_trigger
AFTER INSERT OR DELETE ON canvas_objects
FOR EACH ROW EXECUTE FUNCTION update_canvas_object_count();

-- Log object changes to history
CREATE OR REPLACE FUNCTION log_object_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO object_history (object_id, canvas_id, action, data_after, session_id)
    VALUES (NEW.id, NEW.canvas_id, 'create', row_to_json(NEW)::jsonb, NEW.created_by);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO object_history (object_id, canvas_id, action, data_before, data_after, session_id)
    VALUES (NEW.id, NEW.canvas_id, 'update', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, NEW.created_by);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO object_history (object_id, canvas_id, action, data_before, session_id)
    VALUES (OLD.id, OLD.canvas_id, 'delete', row_to_json(OLD)::jsonb, OLD.created_by);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER object_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON canvas_objects
FOR EACH ROW EXECUTE FUNCTION log_object_change();

-- Comments for documentation
COMMENT ON TABLE canvases IS 'Daily canvases (one per day), archived at midnight UTC';
COMMENT ON TABLE canvas_objects IS 'All drawing objects (strokes, shapes, text, stickers)';
COMMENT ON TABLE stickers IS 'Curated sticker library';
COMMENT ON TABLE object_history IS 'Complete audit trail of all object changes';

-- Create today's canvas if it doesn't exist
SELECT get_active_canvas();
