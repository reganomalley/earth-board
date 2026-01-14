# Fix for Daily Board Reset Issue

## Problem Identified

Your Earth Board isn't clearing and archiving daily because:

1. ✅ The `daily-reset` edge function EXISTS and is DEPLOYED
2. ❌ The function is NOT running automatically (cron job not configured)
3. ❌ Old canvases are still marked as "active" instead of being archived

**Current database state:**
- "day XIV" (2026-01-14) - active ✓ (today's canvas)
- "day XIII" (2026-01-13) - **active** ❌ (should be archived!)
- Unnamed (2026-01-12) - archived ✓

## Quick Fix - 3 Steps

### Step 1: Archive Old Canvases

1. Go to your Supabase dashboard: https://qauohowjypulhbefrhye.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Copy and paste this SQL:

```sql
-- Archive all active canvases that are not today's date
UPDATE canvases
SET
  status = 'archived',
  archived_at = NOW()
WHERE status = 'active'
  AND date < CURRENT_DATE;

-- Verify the fix
SELECT id, date, name, status FROM canvases ORDER BY date DESC;
```

4. Click **Run**
5. You should see only ONE active canvas (today's) in the results

### Step 2: Set Up Cron Job for Automatic Daily Resets

1. Still in your Supabase dashboard, go to **Database** → **Extensions**
2. Find and enable the **pg_cron** extension if it's not already enabled
3. Go back to **SQL Editor**
4. Copy and paste this SQL:

```sql
-- Schedule daily reset at midnight EST
-- Midnight EST is 5 AM UTC
SELECT cron.schedule(
  'daily-canvas-reset',
  '0 5 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://qauohowjypulhbefrhye.supabase.co/functions/v1/daily-reset',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW9ob3dqeXB1bGhiZWZyaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDg0NzIsImV4cCI6MjA4MzgyNDQ3Mn0.8pEnoPTFvHOUsIzoIeR0GqPTUqI77DIbVuUnwEIiV6s"}'::jsonb
    ) as request_id;
  $$
);
```

5. Click **Run**
6. You should see a success message

### Step 3: Verify Cron Job is Active

Run this SQL to check your cron jobs:

```sql
-- List all cron jobs
SELECT * FROM cron.job;
```

You should see a row with `jobname = 'daily-canvas-reset'` and `schedule = '0 5 * * *'`

## How to Test Manually

You can manually trigger a reset anytime:

```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW9ob3dqeXB1bGhiZWZyaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDg0NzIsImV4cCI6MjA4MzgyNDQ3Mn0.8pEnoPTFvHOUsIzoIeR0GqPTUqI77DIbVuUnwEIiV6s" \
  -H "Content-Type: application/json" \
  https://qauohowjypulhbefrhye.supabase.co/functions/v1/daily-reset
```

**Note:** Don't do this multiple times in the same day - it will try to create duplicate canvases!

## Troubleshooting

### If you get "duplicate key" error

This means a canvas already exists for today. That's okay - just means the function already ran or the frontend created today's canvas.

### To manually fix multiple active canvases

```sql
-- Keep only today's canvas as active, archive the rest
UPDATE canvases
SET status = 'archived', archived_at = NOW()
WHERE status = 'active' AND date < CURRENT_DATE;
```

### To disable the cron job (if needed)

```sql
SELECT cron.unschedule('daily-canvas-reset');
```

## What Happens at Midnight EST

1. The cron job runs at 5:00 AM UTC (midnight EST)
2. It calls your `daily-reset` edge function
3. The function:
   - Archives yesterday's canvas (sets `status = 'archived'`)
   - Creates a new canvas for today with a Roman numeral name
4. Users see a fresh canvas when they visit

## Files Created

I created these helper files for you:

- `check-db.js` - Check the current state of your canvases
- `fix-archives.js` - Attempt to fix archives (needs service role key)
- `archive-old-canvases.sql` - SQL to run in Supabase dashboard
- `FIX_DAILY_RESET.md` - This file!

## Summary

1. Run the SQL in Step 1 to fix the current database state
2. Run the SQL in Step 2 to set up the cron job
3. Your board will now automatically reset every day at midnight EST!

---

**Questions?** Check the edge function logs in your Supabase dashboard:
**Edge Functions** → **daily-reset** → **Logs**
