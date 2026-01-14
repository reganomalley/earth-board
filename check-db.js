// Quick script to check the canvases table
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qauohowjypulhbefrhye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW9ob3dqeXB1bGhiZWZyaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDg0NzIsImV4cCI6MjA4MzgyNDQ3Mn0.8pEnoPTFvHOUsIzoIeR0GqPTUqI77DIbVuUnwEIiV6s'
);

async function checkCanvases() {
  console.log('Fetching all canvases...\n');

  const { data, error } = await supabase
    .from('canvases')
    .select('id, date, name, status, object_count, archived_at')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total canvases:', data.length);
  console.log('\nCanvases:');
  data.forEach((canvas, i) => {
    console.log(`\n${i + 1}. ${canvas.name || 'Unnamed'}`);
    console.log(`   ID: ${canvas.id}`);
    console.log(`   Date: ${canvas.date}`);
    console.log(`   Status: ${canvas.status}`);
    console.log(`   Objects: ${canvas.object_count || 0}`);
    if (canvas.archived_at) {
      console.log(`   Archived: ${canvas.archived_at}`);
    }
  });

  // Check for active canvases
  const activeCanvases = data.filter(c => c.status === 'active');
  console.log(`\n\nActive canvases: ${activeCanvases.length}`);
  if (activeCanvases.length > 1) {
    console.log('⚠️  WARNING: Multiple active canvases found! This will cause issues.');
  }

  // Check today's date
  const today = new Date().toISOString().split('T')[0];
  console.log(`\nToday's date: ${today}`);
  const todayCanvas = data.find(c => c.date === today);
  if (todayCanvas) {
    console.log(`Today's canvas: ${todayCanvas.name} (${todayCanvas.status})`);
  } else {
    console.log('No canvas for today found.');
  }
}

checkCanvases();
