// Script to move objects to the correct canvas based on EST timezone
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qauohowjypulhbefrhye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW9ob3dqeXB1bGhiZWZyaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDg0NzIsImV4cCI6MjA4MzgyNDQ3Mn0.8pEnoPTFvHOUsIzoIeR0GqPTUqI77DIbVuUnwEIiV6s'
);

// Convert UTC timestamp to EST date
function toESTDate(utcTimestamp) {
  const date = new Date(utcTimestamp);
  const estOffset = -5 * 60; // EST is UTC-5
  const estTime = new Date(date.getTime() + (estOffset * 60 * 1000));
  return estTime.toISOString().split('T')[0];
}

async function moveObjects() {
  console.log('Starting to move misplaced objects to correct canvases...\n');

  // Get all canvases
  const { data: canvases, error: canvasError } = await supabase
    .from('canvases')
    .select('id, date, name, status')
    .order('date', { ascending: false });

  if (canvasError) {
    console.error('Error fetching canvases:', canvasError);
    return;
  }

  console.log(`Found ${canvases.length} canvases:\n`);
  canvases.forEach(c => {
    console.log(`  ${c.name || 'Unnamed'} (${c.date}) - ${c.status}`);
  });

  // Get all objects
  const { data: objects, error: objectsError } = await supabase
    .from('canvas_objects')
    .select('id, canvas_id, created_at')
    .order('created_at', { ascending: true });

  if (objectsError) {
    console.error('Error fetching objects:', objectsError);
    return;
  }

  console.log(`\n\nAnalyzing ${objects.length} objects...\n`);

  // Find misplaced objects
  const misplaced = [];

  for (const obj of objects) {
    const estDate = toESTDate(obj.created_at);
    const canvas = canvases.find(c => c.id === obj.canvas_id);

    if (!canvas) {
      console.log(`⚠️  Object ${obj.id} has invalid canvas_id`);
      continue;
    }

    // Check if object's EST date matches its canvas date
    if (estDate !== canvas.date) {
      misplaced.push({
        objectId: obj.id,
        currentCanvasDate: canvas.date,
        correctEstDate: estDate,
        createdAt: obj.created_at,
      });
    }
  }

  if (misplaced.length === 0) {
    console.log('✅ No misplaced objects found! All objects are on the correct canvas.');
    return;
  }

  console.log(`\n⚠️  Found ${misplaced.length} misplaced objects:\n`);

  // Group by target date
  const byTargetDate = {};
  misplaced.forEach(m => {
    if (!byTargetDate[m.correctEstDate]) {
      byTargetDate[m.correctEstDate] = [];
    }
    byTargetDate[m.correctEstDate].push(m);
  });

  // Show summary
  Object.entries(byTargetDate).forEach(([date, objs]) => {
    const targetCanvas = canvases.find(c => c.date === date);
    console.log(`  ${date} (${targetCanvas?.name || 'No canvas'}): ${objs.length} objects`);
  });

  console.log('\n📝 Moving objects to correct canvases...\n');

  let moved = 0;
  let skipped = 0;

  for (const [targetDate, objectsToMove] of Object.entries(byTargetDate)) {
    // Find the canvas for this EST date
    const targetCanvas = canvases.find(c => c.date === targetDate);

    if (!targetCanvas) {
      console.log(`⚠️  No canvas found for date ${targetDate}, skipping ${objectsToMove.length} objects`);
      skipped += objectsToMove.length;
      continue;
    }

    console.log(`Moving ${objectsToMove.length} objects to ${targetCanvas.name} (${targetDate})...`);

    for (const obj of objectsToMove) {
      const { error: updateError } = await supabase
        .from('canvas_objects')
        .update({ canvas_id: targetCanvas.id })
        .eq('id', obj.objectId);

      if (updateError) {
        console.error(`  ❌ Error moving object ${obj.objectId}:`, updateError.message);
        skipped++;
      } else {
        moved++;
      }
    }

    console.log(`  ✓ Moved ${objectsToMove.length} objects to ${targetCanvas.name}`);
  }

  console.log(`\n✨ Done!`);
  console.log(`   Moved: ${moved} objects`);
  console.log(`   Skipped: ${skipped} objects`);

  // Verify the fix
  console.log('\n🔍 Verifying...\n');

  const { data: newObjects } = await supabase
    .from('canvas_objects')
    .select('id, canvas_id, created_at')
    .order('created_at', { ascending: true });

  const stillMisplaced = [];
  for (const obj of newObjects) {
    const estDate = toESTDate(obj.created_at);
    const canvas = canvases.find(c => c.id === obj.canvas_id);
    if (canvas && estDate !== canvas.date) {
      stillMisplaced.push(obj);
    }
  }

  if (stillMisplaced.length === 0) {
    console.log('✅ All objects are now on the correct canvas!');
  } else {
    console.log(`⚠️  Still ${stillMisplaced.length} misplaced objects (likely due to RLS permissions)`);
    console.log('    Run this SQL in Supabase dashboard to fix:');
    console.log('');
    console.log('    UPDATE canvas_objects');
    console.log('    SET canvas_id = (');
    console.log('      SELECT id FROM canvases');
    console.log('      WHERE date = DATE(created_at AT TIME ZONE \'America/New_York\')');
    console.log('      LIMIT 1');
    console.log('    )');
    console.log('    WHERE DATE(created_at AT TIME ZONE \'America/New_York\') !=');
    console.log('      (SELECT date FROM canvases WHERE id = canvas_id LIMIT 1);');
  }
}

moveObjects();
