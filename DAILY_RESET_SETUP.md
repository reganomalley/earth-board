# Daily Canvas Reset Setup

This document explains how to set up the daily canvas reset that runs at midnight EST.

## How It Works

1. At midnight EST (5 AM UTC during standard time, 4 AM UTC during daylight saving time), the edge function runs
2. It archives the current active canvas (sets `status = 'archived'` and `archived_at = NOW()`)
3. It creates a new canvas for the new day with:
   - Name: "the big bang" for the first ever canvas, or roman numerals (MM.DD.YYYY) for subsequent canvases
   - Date: Today's date in EST timezone
   - Status: 'active'

## Setup Instructions

### 1. Apply Database Migration

First, apply the migration to add the `name` column to canvases:

```bash
# Run the migration in Supabase SQL Editor or via CLI
npx supabase db push
```

Or manually run the SQL from `supabase/migrations/003_add_canvas_name.sql` in your Supabase dashboard.

### 2. Deploy the Edge Function

Deploy the daily-reset edge function to Supabase:

```bash
npx supabase functions deploy daily-reset
```

### 3. Set Up Cron Schedule

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Enable the `pg_cron` extension if not already enabled
4. Go to **SQL Editor**
5. Run this SQL to create the cron job:

```sql
-- Schedule daily reset at midnight EST
-- Midnight EST is 5 AM UTC (during standard time) or 4 AM UTC (during daylight saving)
-- Using 5 AM UTC for consistency (adjust if needed for EDT)

SELECT cron.schedule(
  'daily-canvas-reset',       -- Job name
  '0 5 * * *',               -- Cron expression: At 5:00 AM UTC (midnight EST)
  $$
  SELECT
    net.http_post(
        url:='YOUR_SUPABASE_PROJECT_URL/functions/v1/daily-reset',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

**IMPORTANT**: Replace:
- `YOUR_SUPABASE_PROJECT_URL` with your actual Supabase project URL
- `YOUR_SUPABASE_ANON_KEY` with your Supabase anon/public key

#### Option B: Using External Cron Service

If you prefer using an external service like Vercel Cron, GitHub Actions, or cron-job.org:

1. Create a cron job that runs at midnight EST
2. Make it call: `POST https://YOUR_PROJECT.supabase.co/functions/v1/daily-reset`
3. Include header: `Authorization: Bearer YOUR_ANON_KEY`

Example with GitHub Actions (`.github/workflows/daily-reset.yml`):

```yaml
name: Daily Canvas Reset

on:
  schedule:
    - cron: '0 5 * * *'  # 5 AM UTC = midnight EST
  workflow_dispatch:  # Allow manual trigger

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://YOUR_PROJECT.supabase.co/functions/v1/daily-reset
```

### 4. Test the Function

Test the function manually before setting up the schedule:

```bash
# Using curl
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT.supabase.co/functions/v1/daily-reset

# Or using Supabase CLI
npx supabase functions invoke daily-reset
```

Expected response:
```json
{
  "success": true,
  "archived": {
    "id": "...",
    "name": "the big bang",
    "date": "2026-01-12",
    "object_count": 42
  },
  "created": {
    "id": "...",
    "name": "I.XIII.MMXXVI",
    "date": "2026-01-13"
  },
  "message": "Daily reset completed successfully"
}
```

### 5. Monitor the Function

Check function logs in your Supabase dashboard:
- Navigate to **Edge Functions** → **daily-reset** → **Logs**
- Verify it runs successfully each night

### 6. Adjust for Daylight Saving Time (Optional)

The current setup uses 5 AM UTC (midnight EST during standard time). If you want to account for EDT (Eastern Daylight Time), you have two options:

1. **Use two cron jobs**: One for EST (5 AM UTC) and one for EDT (4 AM UTC), enabled/disabled based on season
2. **Accept the 1-hour shift**: During EDT, the reset will happen at 1 AM instead of midnight
3. **Use a timezone-aware service**: Some external cron services support timezone-specific scheduling

## Manual Reset

To manually trigger a reset at any time:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://YOUR_PROJECT.supabase.co/functions/v1/daily-reset
```

## Troubleshooting

### Cron job not running
- Check if `pg_cron` extension is enabled
- Verify the cron expression is correct
- Check Supabase function logs for errors

### Wrong timezone
- Confirm your cron expression matches midnight EST (5 AM UTC)
- Consider using an external cron service with timezone support

### Function errors
- Check the function logs in Supabase dashboard
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in function secrets
- Test the function manually to see detailed error messages

## Running for a Week

The setup will automatically run for a week (7 days). After that, you can:
1. Let it continue running (costs minimal)
2. Disable the cron job to stop automatic resets
3. Delete the function if you no longer need it

To disable the cron job:
```sql
SELECT cron.unschedule('daily-canvas-reset');
```

## Cost Estimation

- Edge Function invocations: 1 per day = ~30/month (well within free tier of 2M/month)
- Database operations: Minimal (2-3 queries per day)
- Storage: Minimal (archives grow slowly)

**Estimated monthly cost**: $0 (within free tier)
