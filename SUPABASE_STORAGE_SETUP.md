# Supabase Storage Setup for Canvas Previews

## Overview

This guide will help you set up the `canvas-previews` storage bucket in Supabase to store canvas snapshot images for the archives.

## Steps

### 1. Go to Supabase Dashboard

1. Open your browser and navigate to: https://qauohowjypulhbefrhye.supabase.co
2. Sign in if needed
3. Navigate to your project

### 2. Create the Storage Bucket

1. In the left sidebar, click **Storage**
2. Click the **"New bucket"** button (usually green)
3. Fill in the form:
   - **Name**: `canvas-previews`
   - **Public bucket**: ✅ **Check this box** (we need public access for images)
   - **File size limit**: Leave default or set to 5MB (images are typically < 200KB)
   - **Allowed MIME types**: Leave empty (we're only uploading PNGs)
4. Click **"Create bucket"**

### 3. Set Up Row Level Security (RLS) Policies

After creating the bucket, you need to set up policies so anyone can read the images, but only authenticated actions can upload.

#### Option A: Using the UI (Recommended for beginners)

1. Still in the **Storage** section, click on your `canvas-previews` bucket
2. Click the **"Policies"** tab
3. Click **"New policy"**
4. Create a **SELECT** policy:
   - **Policy name**: `Public read access`
   - **Allowed operation**: SELECT
   - **Target roles**: `public`
   - **USING expression**: `true`
5. Click **"Save policy"**

6. Create an **INSERT** policy:
   - **Policy name**: `Anon can upload`
   - **Allowed operation**: INSERT
   - **Target roles**: `anon`
   - **WITH CHECK expression**: `true`
7. Click **"Save policy"**

#### Option B: Using SQL (Advanced)

Go to **SQL Editor** and run:

```sql
-- Allow public read access to canvas previews
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'canvas-previews');

-- Allow anon role to upload (for snapshot saves)
CREATE POLICY "Anon can upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'canvas-previews');

-- Allow anon role to update (for overwriting snapshots)
CREATE POLICY "Anon can update"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'canvas-previews');
```

### 4. Verify Setup

To verify everything is working:

1. Go to your Earth Board website: https://earth-board.vercel.app/
2. Wait for the page to load
3. Click the **"📸 Save"** button in the top-right corner
4. You should see an alert: "Canvas snapshot saved to archives!"
5. Go back to Supabase → **Storage** → `canvas-previews`
6. You should see a PNG file with a UUID filename (e.g., `86459248-41dd-4445-9202-12c2dd519aa0.png`)
7. Click on it to preview - you should see the canvas snapshot!

### 5. Test Archives

1. On your Earth Board, click **"Archives"**
2. You should now see preview images instead of emoji placeholders for any canvases that have snapshots
3. Click "watch timelapse" on a canvas with a snapshot - you should see the preview image

## Troubleshooting

### Error: "Failed to upload snapshot"

**Check:**
- The bucket name is exactly `canvas-previews` (no typos)
- The bucket is set to **Public**
- RLS policies are created correctly

**Fix:** Review steps 2 and 3 above

### Error: "Policy violation" or "403 Forbidden"

**Issue:** RLS policies not set up correctly

**Fix:**
1. Go to **Storage** → `canvas-previews` → **Policies**
2. Delete all existing policies
3. Follow step 3 again to recreate them

### Images not showing in archives

**Check:**
1. Go to **Storage** → `canvas-previews` - are there PNG files?
2. If yes, click on a file and try to view it
3. If you can view it in Supabase but not on your site:
   - Check browser console for errors
   - Verify the `snapshot_url` column in your `canvases` table is populated

**Fix:** Click the "📸 Save" button again to re-capture and upload

### Bucket already exists error

**Issue:** You might have created the bucket in a previous attempt

**Fix:**
1. Go to **Storage**
2. Find the existing `canvas-previews` bucket
3. Proceed to step 3 to set up policies

## Manual Snapshot Capture

You can manually capture snapshots for existing archived canvases:

1. Visit your Earth Board
2. Click the **"📸 Save"** button while viewing the active canvas
3. The snapshot will be saved for the current day's canvas

Note: You'll need to visit on different days and capture snapshots for each day if you want preview images for all archives.

## Automatic Snapshot Capture (Future Enhancement)

Currently, snapshots are captured manually using the **"📸 Save"** button.

For automatic captures, you could:
1. Add a timed effect that captures a snapshot at 11:55 PM EST every night
2. Or modify the daily-reset edge function to capture server-side (more complex)

The manual approach is recommended for now - just click **"📸 Save"** once a day before midnight!

## Storage Costs

**Good news:** Supabase offers generous free tier storage:
- 1 GB storage included free
- Each canvas snapshot is ~50-200 KB
- That means you can store **5,000-20,000** canvases for free!
- At 1 canvas/day, that's **13-54 years** of canvases

You'll be fine! 🎉

## Summary

Once set up:
1. ✅ Storage bucket `canvas-previews` exists and is public
2. ✅ RLS policies allow reading and uploading
3. ✅ The **"📸 Save"** button works
4. ✅ Archives show preview images
5. ✅ Timelapse viewer shows snapshots

**Next steps:**
- Click **"📸 Save"** daily to build up your archive collection
- Share your beautiful archive gallery with friends!
