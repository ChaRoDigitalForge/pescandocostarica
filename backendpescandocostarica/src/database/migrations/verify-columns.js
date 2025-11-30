import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function verifyColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('🔍 Verifying deleted_at columns...\n');

    const tables = ['bookings', 'tours', 'reviews', 'tour_services', 'tour_inclusions',
                    'tour_requirements', 'tour_availability', 'review_images'];

    for (const table of tables) {
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = 'deleted_at'
      `, [table]);

      if (result.rows.length > 0) {
        console.log(`✅ ${table}: deleted_at column exists`);
        console.log(`   Type: ${result.rows[0].data_type}, Nullable: ${result.rows[0].is_nullable}, Default: ${result.rows[0].column_default || 'NULL'}`);
      } else {
        console.log(`❌ ${table}: deleted_at column NOT found`);
      }
    }

    console.log('\n📊 Verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await client.end();
  }
}

verifyColumns();
