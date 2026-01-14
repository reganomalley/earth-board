-- Fix object_count and participant_count for all canvases
-- Run this in your Supabase SQL Editor

-- Update object counts and participant counts for all canvases
UPDATE canvases c
SET
  object_count = (
    SELECT COUNT(*)
    FROM canvas_objects
    WHERE canvas_id = c.id
  ),
  participant_count = (
    SELECT COUNT(DISTINCT created_by)
    FROM canvas_objects
    WHERE canvas_id = c.id
  );

-- Verify the results
SELECT
  name,
  date,
  status,
  object_count,
  participant_count
FROM canvases
ORDER BY date DESC;
