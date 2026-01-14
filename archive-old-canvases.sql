-- Archive all active canvases that are not today's date
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT
  id,
  date,
  name,
  status,
  object_count
FROM canvases
ORDER BY date DESC;

-- Archive canvases that are active but not today
UPDATE canvases
SET
  status = 'archived',
  archived_at = NOW()
WHERE status = 'active'
  AND date < CURRENT_DATE;

-- Verify the fix
SELECT
  id,
  date,
  name,
  status,
  object_count,
  archived_at
FROM canvases
ORDER BY date DESC;
