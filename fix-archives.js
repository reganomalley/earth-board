// Script to archive old active canvases
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qauohowjypulhbefrhye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW9ob3dqeXB1bGhiZWZyaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDg0NzIsImV4cCI6MjA4MzgyNDQ3Mn0.8pEnoPTFvHOUsIzoIeR0GqPTUqI77DIbVuUnwEIiV6s'
);

async function fixArchives() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`Today's date: ${today}\n`);

  // Get all active canvases
  const { data: activeCanvases, error: fetchError } = await supabase
    .from('canvases')
    .select('*')
    .eq('status', 'active')
    .order('date', { ascending: false });

  if (fetchError) {
    console.error('Error fetching canvases:', fetchError);
    return;
  }

  console.log(`Found ${activeCanvases.length} active canvas(es):\n`);
  activeCanvases.forEach(c => {
    console.log(`  - ${c.name} (${c.date}) - ${c.date === today ? 'TODAY' : 'OLD'}`);
  });

  // Find canvases that should be archived (not today's date)
  const toArchive = activeCanvases.filter(c => c.date !== today);

  if (toArchive.length === 0) {
    console.log('\n✓ No canvases need archiving. Database is in good state!');
    return;
  }

  console.log(`\n📦 Archiving ${toArchive.length} old canvas(es)...\n`);

  for (const canvas of toArchive) {
    console.log(`   Archiving: ${canvas.name} (${canvas.date})...`);

    const { error: updateError } = await supabase
      .from('canvases')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', canvas.id);

    if (updateError) {
      console.error(`   ❌ Error archiving ${canvas.name}:`, updateError);
    } else {
      console.log(`   ✓ Archived ${canvas.name}`);
    }
  }

  console.log('\n✨ Done! Database state fixed.');

  // Verify
  const { data: newActive } = await supabase
    .from('canvases')
    .select('*')
    .eq('status', 'active');

  console.log(`\nVerification: ${newActive.length} active canvas(es) remaining`);
  if (newActive.length === 1) {
    console.log(`✓ ${newActive[0].name} (${newActive[0].date}) is the only active canvas`);
  }
}

fixArchives();
