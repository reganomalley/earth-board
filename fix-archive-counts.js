// Script to fix object_count and participant_count for archived canvases
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qauohowjypulhbefrhye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW9ob3dqeXB1bGhiZWZyaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDg0NzIsImV4cCI6MjA4MzgyNDQ3Mn0.8pEnoPTFvHOUsIzoIeR0GqPTUqI77DIbVuUnwEIiV6s'
);

async function fixArchiveCounts() {
  console.log('Fixing archive counts...\n');

  // Get all canvases
  const { data: canvases, error: canvasError } = await supabase
    .from('canvases')
    .select('id, date, name, status, object_count, participant_count')
    .order('date', { ascending: false });

  if (canvasError) {
    console.error('Error fetching canvases:', canvasError);
    return;
  }

  console.log(`Found ${canvases.length} canvases\n`);

  for (const canvas of canvases) {
    console.log(`\nProcessing: ${canvas.name || 'Unnamed'} (${canvas.date})`);

    // Get all objects for this canvas
    const { data: objects, error: objectsError } = await supabase
      .from('canvas_objects')
      .select('created_by')
      .eq('canvas_id', canvas.id);

    if (objectsError) {
      console.error(`  ❌ Error fetching objects:`, objectsError);
      continue;
    }

    // Count unique participants (created_by values)
    const uniqueParticipants = new Set(objects.map(obj => obj.created_by));

    const objectCount = objects.length;
    const participantCount = uniqueParticipants.size;

    console.log(`  Current: ${canvas.object_count || 0} marks, ${canvas.participant_count || 0} souls`);
    console.log(`  Actual: ${objectCount} marks, ${participantCount} souls`);

    // Update the canvas if counts are different
    if (canvas.object_count !== objectCount || canvas.participant_count !== participantCount) {
      const { error: updateError } = await supabase
        .from('canvases')
        .update({
          object_count: objectCount,
          participant_count: participantCount,
        })
        .eq('id', canvas.id);

      if (updateError) {
        console.error(`  ❌ Error updating counts:`, updateError);
      } else {
        console.log(`  ✅ Updated to ${objectCount} marks, ${participantCount} souls`);
      }
    } else {
      console.log(`  ✓ Counts already correct`);
    }
  }

  console.log('\n✨ Done!\n');

  // Show summary
  const { data: updatedCanvases } = await supabase
    .from('canvases')
    .select('name, date, object_count, participant_count, status')
    .order('date', { ascending: false });

  console.log('Summary:');
  updatedCanvases.forEach(c => {
    console.log(`  ${c.name || 'Unnamed'} (${c.date}) - ${c.status}`);
    console.log(`    ${c.object_count} marks • ${c.participant_count} souls`);
  });
}

fixArchiveCounts();
