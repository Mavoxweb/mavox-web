const { Client } = require('pg');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Defina DATABASE_URL no .env');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check ai_opportunities structure
    const aiOpp = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'ai_opportunities' ORDER BY ordinal_position;
    `);
    console.log('\nai_opportunities columns:');
    aiOpp.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    
    // Check settings table for new columns
    const settings = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'settings' ORDER BY ordinal_position;
    `);
    console.log('\nsettings columns:', settings.rows.map(r => r.column_name).join(', '));
    
    // Check pixel_events for tiktok column
    const pixelEvents = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pixel_events' ORDER BY ordinal_position;
    `);
    console.log('\npixel_events columns:', pixelEvents.rows.map(r => r.column_name).join(', '));
    
    // Check ai_opportunities for metadata column
    const meta = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ai_opportunities' AND column_name = 'metadata';
    `);
    console.log('\nai_opportunities has metadata column:', meta.rows.length > 0 ? 'YES' : 'NO');
    
    // Check ai_opportunities_category_idx
    const idx = await client.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'ai_opportunities' AND indexname = 'ai_opportunities_category_idx';
    `);
    console.log('ai_opportunities_category_idx exists:', idx.rows.length > 0 ? 'YES' : 'NO');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runMigrations();