/**
 * Quick Fix: Update vw_tours_complete view
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

async function fixView() {
  const client = await pool.connect();

  try {
    console.log('🔧 Fixing vw_tours_complete view...\n');

    // Read SQL file
    const sqlPath = join(__dirname, 'fix-view-quick.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    await client.query(sql);

    console.log('✅ View updated successfully!\n');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run fix
fixView();
