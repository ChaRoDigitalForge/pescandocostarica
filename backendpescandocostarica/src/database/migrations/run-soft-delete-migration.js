import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL migration file
    const sqlFilePath = join(__dirname, 'add_deleted_at_columns.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Reading migration file...');
    console.log('🚀 Executing migration...\n');

    // Execute the migration
    const result = await client.query(sqlContent);

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Result:', result.rows);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runMigration();
