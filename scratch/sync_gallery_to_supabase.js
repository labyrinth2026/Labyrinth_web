const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://paqpkdipiyvwdneeghin.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXBrZGlwaXl2d2RuZWVnaGluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk1NTUyMSwiZXhwIjoyMDk4NTMxNTIxfQ.kBOoRDhujiG3EJMplWmV6-dBYHtsQyidz2SkUo5KBvM';

const client = createClient(supabaseUrl, serviceRoleKey);
const dbPath = path.join(__dirname, '../src/data/db.json');

async function syncGallery() {
  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found at:', dbPath);
    return;
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const galleryItems = db.gallery || [];
  console.log(`Found ${galleryItems.length} items in local db.json gallery.`);

  if (galleryItems.length === 0) {
    console.log('No gallery items to sync.');
    return;
  }

  // Insert items in batches of 10
  for (let i = 0; i < galleryItems.length; i += 10) {
    const batch = galleryItems.slice(i, i + 10).map(item => ({
      title: item.title,
      category: item.category,
      description: item.description,
      image: item.image,
      date: item.date,
      orientation: item.orientation || 'landscape',
      rotation: item.rotation ?? 0
    }));

    const { error } = await client.from('gallery').insert(batch);
    if (error) {
      console.error('Error inserting batch:', error);
    } else {
      console.log(`Successfully synced batch ${i / 10 + 1}`);
    }
  }
  console.log('Sync complete.');
}

syncGallery();
