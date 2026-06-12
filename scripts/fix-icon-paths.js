const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');

const supabaseUrl = envLines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
const supabaseServiceKey = envLines.find(l => l.startsWith('SUPABASE_SERVICE_KEY='))?.split('=')[1]?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixIconPaths() {
  console.log('Fetching shop items...');
  
  const { data: items, error } = await supabase
    .from('shop_items')
    .select('*');
  
  if (error) {
    console.error('Error fetching items:', error);
    return;
  }
  
  console.log(`Found ${items.length} items`);
  
  console.log('\nCurrent items in database:');
  items.forEach(item => {
    console.log(`- ${item.name} (category: ${item.category}, image: ${item.image})`);
  });
  
  console.log('\nChecking if these files exist in public/icons:');
  const fs = require('fs');
  const iconFiles = fs.readdirSync('public/icons');
  iconFiles.forEach(file => {
    console.log(`- ${file}`);
  });
  
  let fixedCount = 0;
  
  for (const item of items) {
    let newImage = item.image;
    
    // Fix common path issues
    if (newImage.startsWith('/icons/')) {
      newImage = newImage.replace('/icons/', '');
    } else if (newImage.startsWith('/')) {
      newImage = newImage.substring(1);
    } else if (newImage.startsWith('icons/')) {
      newImage = newImage.replace('icons/', '');
    }
    
    // Only update if changed
    if (newImage !== item.image) {
      console.log(`Updating "${item.name}": "${item.image}" -> "${newImage}"`);
      
      const { error: updateError } = await supabase
        .from('shop_items')
        .update({ image: newImage })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`Error updating item ${item.id}:`, updateError);
      } else {
        fixedCount++;
      }
    }
  }
  
  console.log(`\nFixed ${fixedCount} items`);
}

fixIconPaths();
