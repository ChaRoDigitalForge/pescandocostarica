/**
 * Inspect current data in countries and zones
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function inspect() {
  const client = await pool.connect();

  try {
    console.log('🔍 Inspecting current data...\n');

    // Countries
    const { rows: countries } = await client.query('SELECT * FROM countries LIMIT 10');
    console.log('📊 Countries (first 10):');
    countries.forEach(c => console.log(`   ${c.code} - ${c.name} (active: ${c.is_active})`));
    console.log('');

    // Zones
    const { rows: zones } = await client.query(`
      SELECT z.*, c.code as country_code
      FROM zones z
      LEFT JOIN countries c ON z.country_id = c.id
      LIMIT 15
    `);
    console.log('📍 Zones (first 15):');
    zones.forEach(z => console.log(`   [${z.country_code || 'NULL'}] ${z.name} ${z.is_popular ? '⭐' : ''}`));
    console.log('');

    // Tours status
    const { rows: tourStats } = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(provincia_id) as has_provincia,
        COUNT(location_id) as has_location,
        COUNT(country_id) as has_country,
        COUNT(zone_id) as has_zone
      FROM tours
    `);
    console.log('🎣 Tours status:');
    console.log(`   Total tours: ${tourStats[0].total}`);
    console.log(`   With provincia_id: ${tourStats[0].has_provincia}`);
    console.log(`   With location_id: ${tourStats[0].has_location}`);
    console.log(`   With country_id: ${tourStats[0].has_country}`);
    console.log(`   With zone_id: ${tourStats[0].has_zone}`);
    console.log('');

    // Old tables
    const { rows: provinciaCount } = await client.query('SELECT COUNT(*) FROM provincias');
    const { rows: locationCount } = await client.query('SELECT COUNT(*) FROM locations');
    console.log('📦 Old tables:');
    console.log(`   Provincias: ${provinciaCount[0].count}`);
    console.log(`   Locations: ${locationCount[0].count}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
