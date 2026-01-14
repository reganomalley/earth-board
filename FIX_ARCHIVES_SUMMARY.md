# Fix Archives - Summary

## Issues Fixed

### 1. ✅ 0 Marks / 0 Souls Display
**Problem:** Archives were showing "0 marks • 0 souls" even though they had objects

**Cause:** The `object_count` and `participant_count` fields weren't being populated when canvases were archived

**Fixes:**
1. Created SQL script to retroactively fix existing archives
2. Updated daily-reset function to automatically count objects/participants when archiving

### 2. ✅ Generic Emoji Placeholder
**Problem:** Archives showed a generic 🎨 emoji when no snapshot was available

**Fix:** Updated UI to show no preview at all if snapshot doesn't exist (cleaner look)

---

## What You Need to Do

### Step 1: Fix Existing Archives (2 minutes)

Run this SQL in your Supabase dashboard:

1. Go to https://qauohowjypulhbefrhye.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Copy and paste this SQL:

```sql
-- Fix object_count and participant_count for all canvases
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
```

4. Click **Run**
5. You should see the correct counts in the results:
   - day XIV: 28 marks, 2 souls
   - day XIII: 138 marks, 8 souls
   - Unnamed: 198 marks, 4 souls

### Step 2: Deploy Updated Edge Function (5 minutes)

The daily-reset function needs to be redeployed with the new counting logic:

```bash
cd /Users/romalley/personal/magic/viral-canvas

# Deploy the updated daily-reset function
npx supabase functions deploy daily-reset
```

If you don't have the Supabase CLI installed:
```bash
npm install -g supabase
# Then run the deploy command above
```

### Step 3: Deploy UI Changes (2 minutes)

Commit and push the changes to remove the generic emoji:

```bash
git add .
git commit -m "Fix archives: add counts, remove generic emoji

- Update daily-reset to populate object/participant counts
- Remove generic emoji placeholder from archives
- Show preview image or nothing (cleaner look)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

Vercel will automatically deploy your changes.

---

## Verification

After completing the steps above:

1. **Check Archives:**
   - Go to https://earth-board.vercel.app/
   - Click **"Archives"**
   - You should see correct counts: "138 marks • 8 souls" for day XIII
   - No more generic 🎨 emoji!

2. **Test Timelapse:**
   - Click "▶ watch timelapse" on day XIII
   - You should see "138 marks" in the header
   - The preview should show either the snapshot image (if you've captured one) or a message "no preview available"

3. **Test Future Archiving:**
   - Tomorrow at midnight EST, the daily reset will run
   - It will automatically count objects and participants
   - The next time you check archives, today's canvas will show the correct counts

---

## Expected Results

**Before:**
```
day XIII
January 12, 2026
0 marks • 0 souls     ❌
🎨 (generic emoji)    ❌
```

**After:**
```
day XIII
January 13, 2026
138 marks • 8 souls   ✅
[Preview image or nothing]  ✅
```

---

## Files Modified

1. **supabase/functions/daily-reset/index.ts**
   - Added object/participant counting before archiving
   - Automatically populates counts for future archives

2. **src/components/canvas/CanvasContainer.tsx**
   - Removed generic emoji placeholder
   - Only shows preview div if snapshot_url exists

3. **fix-archive-counts.sql** (new)
   - SQL script to fix existing archives

---

## Future Archiving

From now on, every time the daily reset runs at midnight EST:
1. ✅ Counts objects and participants
2. ✅ Updates the canvas record with counts
3. ✅ Archives with full metadata
4. ✅ Creates new canvas for next day

Your archives will always show accurate counts! 🎉

---

## Troubleshooting

### Counts still showing 0 after running SQL

**Issue:** RLS policies might be preventing updates

**Fix:** Make sure you're running the SQL in the Supabase SQL Editor (not via the anon API key)

### Edge function deploy fails

**Issue:** Supabase CLI not installed or not logged in

**Fix:**
```bash
npm install -g supabase
supabase login
supabase link --project-ref qauohowjypulhbefrhye
supabase functions deploy daily-reset
```

### "No preview available" in timelapse

**Normal:** This is expected for canvases that don't have a snapshot yet

**To add snapshots:**
1. Visit the canvas when it's active (before midnight)
2. Click the **"📸 Save"** button
3. The snapshot will be stored and shown in archives

---

## Summary

Once you complete the 3 steps above:
- ✅ Existing archives will show correct counts
- ✅ No more generic emoji placeholder
- ✅ Future archives will automatically have counts
- ✅ Cleaner, more professional look

The archives will look much better! 🌍✨
