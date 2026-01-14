// Check which canvas the objects belong to
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qauohowjypulhbefrhye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW9ob3dqeXB1bGhiZWZyaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDg0NzIsImV4cCI6MjA4MzgyNDQ3Mn0.8pEnoPTFvHOUsIzoIeR0GqPTUqI77DIbVuUnwEIiV6s'
);

async function checkObjects() {
  console.log('Checking canvas objects...\n');

  // Get all canvases
  const { data: canvases } = await supabase
    .from('canvases')
    .select('id, date, name, status')
    .order('date', { ascending: false });

  console.log('Canvases:');
  canvases.forEach(c => {
    console.log(`  ${c.name || 'Unnamed'} (${c.date}) - ${c.status}`);
    console.log(`    ID: ${c.id}`);
  });

  // Get all objects
  const { data: objects } = await supabase
    .from('canvas_objects')
    .select('id, canvas_id, type, created_at')
    .order('created_at', { ascending: true });

  console.log(`\n\nTotal objects: ${objects.length}\n`);

  // Group by canvas
  const byCanvas = {};
  objects.forEach(obj => {
    if (!byCanvas[obj.canvas_id]) {
      byCanvas[obj.canvas_id] = [];
    }
    byCanvas[obj.canvas_id].push(obj);
  });

  console.log('Objects per canvas:');
  Object.entries(byCanvas).forEach(([canvasId, objs]) => {
    const canvas = canvases.find(c => c.id === canvasId);
    console.log(`\n  ${canvas?.name || 'Unknown'} (${canvas?.date}):`);
    console.log(`    ${objs.length} objects`);
    objs.forEach((obj, i) => {
      console.log(`    ${i+1}. ${obj.type} - created ${obj.created_at}`);
    });
  });

  // Check today's active canvas
  const today = new Date().toISOString().split('T')[0];
  const todayCanvas = canvases.find(c => c.date === today && c.status === 'active');
  if (todayCanvas) {
    const todayObjects = byCanvas[todayCanvas.id] || [];
    console.log(`\n\n📌 Today's canvas (${todayCanvas.name}):`);
    console.log(`   ${todayObjects.length} objects`);
    if (todayObjects.length > 0) {
      console.log('   ⚠️  Today\'s canvas should be empty!');
    }
  }
}

checkObjects();
