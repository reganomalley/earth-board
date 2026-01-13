# Save Current Canvas as "the big bang" and Clear It

Follow these steps to archive the current canvas with the name "the big bang" and start fresh.

## Option 1: Using Supabase Dashboard (Easiest)

### Step 1: Save Current Canvas as "the big bang"

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **canvases**
3. Find the row with `status = 'active'`
4. Click on the row to edit it
5. Update the following fields:
   - `name`: Set to `the big bang`
   - `status`: Change from `active` to `archived`
   - `archived_at`: Set to current timestamp (or click "Now")
6. Click **Save**

### Step 2: Create Fresh Canvas for Today

1. Still in **Table Editor** → **canvases**
2. Click **Insert** → **Insert row**
3. Fill in the fields:
   - `date`: Today's date (YYYY-MM-DD format, e.g., `2026-01-12`)
   - `status`: `active`
   - `name`: Leave blank (it will auto-generate on next load)
4. Click **Save**

### Step 3: Clear Objects from New Canvas (Optional)

If you want to start completely fresh:

1. Navigate to **Table Editor** → **canvas_objects**
2. Find all objects with `canvas_id` matching the NEW canvas you just created
3. Select them all and delete

OR run this SQL in the **SQL Editor**:

```sql
-- Delete all objects from the active canvas
DELETE FROM canvas_objects
WHERE canvas_id = (
  SELECT id FROM canvases WHERE status = 'active' LIMIT 1
);
```

## Option 2: Using SQL Editor (Faster)

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Step 1: Archive current canvas with name "the big bang"
UPDATE canvases
SET
  status = 'archived',
  name = 'the big bang',
  archived_at = NOW()
WHERE status = 'active';

-- Step 2: Create new active canvas for today
INSERT INTO canvases (date, status)
VALUES (CURRENT_DATE, 'active');

-- Step 3: (Optional) If you want to clear all objects from old canvas
-- This keeps "the big bang" canvas clean in the archives
-- DELETE FROM canvas_objects
-- WHERE canvas_id IN (SELECT id FROM canvases WHERE name = 'the big bang');
```

## Option 3: Using the Daily Reset Function

You can manually trigger the daily reset function which will:
- Archive the current canvas (you'll need to rename it to "the big bang" after)
- Create a new canvas for today

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT.supabase.co/functions/v1/daily-reset
```

Then update the archived canvas name:

```sql
UPDATE canvases
SET name = 'the big bang'
WHERE status = 'archived'
ORDER BY archived_at DESC
LIMIT 1;
```

## Verification

After running the steps, verify:

1. **Check canvases table**:
   ```sql
   SELECT id, date, name, status, object_count FROM canvases ORDER BY date DESC LIMIT 5;
   ```

   You should see:
   - One row with `status = 'archived'` and `name = 'the big bang'`
   - One row with `status = 'active'` and today's date

2. **Check in the app**:
   - Reload the page
   - You should see a fresh, empty canvas
   - Click "Archives" to see "the big bang" saved there

## Troubleshooting

**Multiple active canvases**: If you accidentally created multiple active canvases:
```sql
-- Keep only the most recent active canvas
UPDATE canvases
SET status = 'archived', archived_at = NOW()
WHERE status = 'active'
AND id NOT IN (
  SELECT id FROM canvases WHERE status = 'active' ORDER BY created_at DESC LIMIT 1
);
```

**Canvas not showing**: Clear your browser cache or open in incognito mode.

**Wrong name**: Update the name:
```sql
UPDATE canvases
SET name = 'the big bang'
WHERE status = 'archived'
AND (name IS NULL OR name != 'the big bang')
LIMIT 1;
```
