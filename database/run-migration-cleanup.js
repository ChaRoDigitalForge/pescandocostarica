/**
 * Complete and cleanup international migration
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function runCleanup() {
  const client = await pool.connect();

  try {
    console.log('🧹 Starting migration cleanup...\n');

    // Check current state
    const { rows: toursBefore } = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(zone_id) as with_zone
      FROM tours
    `);

    console.log('📊 Current state:');
    console.log(`   Tours total: ${toursBefore[0].total}`);
    console.log(`   Tours with zone_id: ${toursBefore[0].with_zone}\n`);

    // Read and execute cleanup SQL
    const sqlPath = join(__dirname, 'complete-migration-cleanup.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('▶️  Executing cleanup script...\n');

    // Capture notices
    client.on('notice', (notice) => {
      if (notice.message) {
        console.log(`   ${notice.message}`);
      }
    });

    await client.query(sql);

    console.log('\n✅ Cleanup completed!\n');

    // Verify final state
    console.log('🔍 Verifying final state...\n');

    const { rows: toursAfter } = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(country_id) as with_country,
        COUNT(zone_id) as with_zone
      FROM tours
    `);

    console.log('📊 Final state:');
    console.log(`   Tours total: ${toursAfter[0].total}`);
    console.log(`   Tours with country_id: ${toursAfter[0].with_country}`);
    console.log(`   Tours with zone_id: ${toursAfter[0].with_zone}\n`);

    // Check if old tables exist
    const { rows: tables } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('provincias', 'locations')
    `);

    if (tables.length === 0) {
      console.log('✅ Old tables successfully removed\n');
    } else {
      console.log('⚠️  Some old tables still exist:', tables.map(t => t.table_name).join(', '), '\n');
    }

    // Show sample tours
    console.log('📍 Sample tours with new structure:');
    const { rows: sampleTours } = await client.query(`
      SELECT
        t.title,
        c.name as country,
        z.name as zone
      FROM tours t
      LEFT JOIN countries c ON t.country_id = c.id
      LEFT JOIN zones z ON t.zone_id = z.id
      LIMIT 5
    `);

    sampleTours.forEach(tour => {
      console.log(`   🎣 ${tour.title}`);
      console.log(`      📍 ${tour.zone || 'No zone'}, ${tour.country || 'No country'}`);
    });

    console.log('\n🎉 Migration cleanup completed successfully!');
    console.log('🚀 System is now fully international!\n');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup();
