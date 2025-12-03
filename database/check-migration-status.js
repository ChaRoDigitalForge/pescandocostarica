/**
 * Check current migration status
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function checkStatus() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking database migration status...\n');

    // Check if new tables exist
    const { rows: tables } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('countries', 'zones', 'provincias', 'locations')
      ORDER BY table_name
    `);

    console.log('📊 Existing tables:');
    tables.forEach(t => console.log(`   ✓ ${t.table_name}`));
    console.log('');

    // Check countries structure if exists
    if (tables.some(t => t.table_name === 'countries')) {
      const { rows: countryColumns } = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'countries'
        ORDER BY ordinal_position
      `);

      console.log('📋 Countries table columns:');
      countryColumns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));
      console.log('');

      const { rows: countryCount } = await client.query('SELECT COUNT(*) FROM countries');
      console.log(`   Records: ${countryCount[0].count}\n`);
    }

    // Check zones structure if exists
    if (tables.some(t => t.table_name === 'zones')) {
      const { rows: zoneColumns } = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'zones'
        ORDER BY ordinal_position
      `);

      console.log('📋 Zones table columns:');
      zoneColumns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));
      console.log('');

      const { rows: zoneCount } = await client.query('SELECT COUNT(*) FROM zones');
      console.log(`   Records: ${zoneCount[0].count}\n`);
    }

    // Check tours columns
    const { rows: tourColumns } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'tours'
      AND column_name IN ('provincia_id', 'location_id', 'country_id', 'zone_id')
      ORDER BY ordinal_position
    `);

    console.log('📋 Tours location columns:');
    tourColumns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkStatus();
