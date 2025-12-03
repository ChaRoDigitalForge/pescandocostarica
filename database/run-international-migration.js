/**
 * International Location System Migration Runner
 * Executes migrate_to_international_locations.sql
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting International Location System Migration...\n');

    // Read SQL file
    const sqlPath = join(__dirname, 'migrate_to_international_locations.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('📄 Migration script loaded');
    console.log('🔍 Checking current database state...\n');

    // Check current state
    const { rows: provinciaCount } = await client.query('SELECT COUNT(*) FROM provincias');
    const { rows: locationCount } = await client.query('SELECT COUNT(*) FROM locations');
    const { rows: tourCount } = await client.query('SELECT COUNT(*) FROM tours');

    console.log('Current database:');
    console.log(`  - Provincias: ${provinciaCount[0].count}`);
    console.log(`  - Locations: ${locationCount[0].count}`);
    console.log(`  - Tours: ${tourCount[0].count}\n`);

    console.log('⚠️  WARNING: This migration will:');
    console.log('  1. Create new tables: countries, zones');
    console.log('  2. Migrate all data from provincias → zones');
    console.log('  3. Migrate all data from locations → zones');
    console.log('  4. Update tours table structure');
    console.log('  5. DROP old tables: provincias, locations');
    console.log('  6. DROP old ENUM: provincia_type\n');

    // Execute migration
    console.log('▶️  Executing migration...\n');

    // Set client to receive notices
    client.on('notice', (notice) => {
      if (notice.message) {
        console.log(`   ${notice.message}`);
      }
    });

    await client.query(sql);

    console.log('\n✅ Migration completed successfully!\n');

    // Verify results
    console.log('🔍 Verifying migration results...\n');

    const { rows: countries } = await client.query('SELECT COUNT(*) FROM countries');
    const { rows: zones } = await client.query('SELECT COUNT(*) FROM zones');
    const { rows: toursUpdated } = await client.query('SELECT COUNT(*) FROM tours WHERE country_id IS NOT NULL');

    console.log('New database state:');
    console.log(`  - Countries: ${countries[0].count}`);
    console.log(`  - Zones: ${zones[0].count}`);
    console.log(`  - Tours with country_id: ${toursUpdated[0].count}\n`);

    // Show sample data
    console.log('📊 Sample countries:');
    const { rows: sampleCountries } = await client.query(`
      SELECT code, name, flag_emoji, is_popular
      FROM countries
      WHERE is_popular = true
      ORDER BY name
      LIMIT 5
    `);
    sampleCountries.forEach(c => {
      console.log(`   ${c.flag_emoji} ${c.name} (${c.code})`);
    });

    console.log('\n📍 Sample zones (Costa Rica):');
    const { rows: sampleZones } = await client.query(`
      SELECT z.name, z.zone_type, z.is_popular
      FROM zones z
      INNER JOIN countries c ON z.country_id = c.id
      WHERE c.code = 'CRI'
      ORDER BY z.zone_type, z.name
      LIMIT 8
    `);
    sampleZones.forEach(z => {
      const icon = z.zone_type === 'province' ? '📍' : '🏖️';
      const popular = z.is_popular ? '⭐' : '';
      console.log(`   ${icon} ${z.name} (${z.zone_type}) ${popular}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('🚀 You can now start the backend and test the international system.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration();
