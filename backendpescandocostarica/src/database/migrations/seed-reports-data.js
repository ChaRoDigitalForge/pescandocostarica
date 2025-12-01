import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function seedReportsData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando seed de datos de prueba para reportes...\n');

    await client.query('BEGIN');

    // 1. Crear bookings de prueba para los últimos 30 días
    console.log('📅 Creando reservas de prueba...');

    // Obtener IDs necesarios
    const toursResult = await client.query(`
      SELECT id, fishing_type, location_id
      FROM tours
      WHERE status = 'active' AND deleted_at IS NULL
      LIMIT 10
    `);

    const usersResult = await client.query(`
      SELECT id
      FROM users
      WHERE role = 'cliente' AND deleted_at IS NULL
      LIMIT 5
    `);

    if (toursResult.rows.length === 0) {
      console.log('⚠️  No hay tours disponibles. Creando tours de prueba primero...');

      // Obtener provincias y ubicaciones
      const provinciaResult = await client.query(`
        SELECT id FROM provincias WHERE code = 'guanacaste' LIMIT 1
      `);

      const locationResult = await client.query(`
        SELECT id FROM locations WHERE provincia_id = $1 LIMIT 1
      `, [provinciaResult.rows[0].id]);

      const captainResult = await client.query(`
        SELECT id FROM users WHERE role = 'capitan' AND deleted_at IS NULL LIMIT 1
      `);

      if (locationResult.rows.length === 0 || captainResult.rows.length === 0) {
        console.log('❌ No hay ubicaciones o capitanes disponibles. Por favor, crea usuarios y ubicaciones primero.');
        await client.query('ROLLBACK');
        return;
      }

      // Crear tours de prueba
      const fishingTypes = ['offshore', 'inshore', 'river', 'lake'];
      const tourTitles = [
        'Pesca Deportiva en Alta Mar',
        'Aventura de Pesca Costera',
        'Pesca en Río y Manglar',
        'Pesca en Lago Arenal'
      ];

      for (let i = 0; i < 4; i++) {
        await client.query(`
          INSERT INTO tours (
            title, slug, short_description, description,
            price, duration_hours, capacity, fishing_type,
            location_id, provincia_id, capitan_id, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active'
          )
        `, [
          tourTitles[i],
          `tour-prueba-${i + 1}`,
          `Descripción corta del ${tourTitles[i]}`,
          `Descripción completa del tour de ${tourTitles[i]}. Incluye equipo profesional y guía experto.`,
          250 + (i * 50),
          4 + i,
          4 + i,
          fishingTypes[i],
          locationResult.rows[0].id,
          provinciaResult.rows[0].id,
          captainResult.rows[0].id
        ]);
      }

      // Volver a obtener tours
      const newToursResult = await client.query(`
        SELECT id, fishing_type, location_id
        FROM tours
        WHERE status = 'active' AND deleted_at IS NULL
      `);
      toursResult.rows = newToursResult.rows;
    }

    if (usersResult.rows.length === 0) {
      console.log('⚠️  No hay usuarios disponibles. Creando usuarios de prueba...');

      for (let i = 0; i < 5; i++) {
        await client.query(`
          INSERT INTO users (
            firebase_uid, email, first_name, last_name, role, status
          ) VALUES (
            $1, $2, $3, $4, 'cliente', 'active'
          )
        `, [
          `test-user-${i + 1}`,
          `testuser${i + 1}@example.com`,
          `Usuario`,
          `Prueba ${i + 1}`
        ]);
      }

      // Volver a obtener usuarios
      const newUsersResult = await client.query(`
        SELECT id FROM users WHERE role = 'cliente' AND deleted_at IS NULL
      `);
      usersResult.rows = newUsersResult.rows;
    }

    const tours = toursResult.rows;
    const users = usersResult.rows;

    // Crear bookings para los últimos 30 días
    let bookingsCreated = 0;
    const statuses = ['confirmed', 'confirmed', 'confirmed', 'completed', 'completed'];

    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      // Más bookings en los días recientes
      const bookingsPerDay = day < 7 ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2);

      for (let i = 0; i < bookingsPerDay; i++) {
        const tour = tours[Math.floor(Math.random() * tours.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const participants = 1 + Math.floor(Math.random() * 4);
        const price = 250 + (Math.random() * 200);

        await client.query(`
          INSERT INTO bookings (
            user_id, tour_id, booking_date, number_of_people,
            subtotal, total_amount, status, customer_name, customer_email, customer_phone
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
        `, [
          user.id,
          tour.id,
          date.toISOString().split('T')[0],
          participants,
          price,
          price,
          status,
          'Cliente Prueba',
          'cliente@example.com',
          '+50612345678'
        ]);

        bookingsCreated++;
      }
    }

    console.log(`✅ ${bookingsCreated} reservas creadas`);

    // 2. Crear reviews para bookings completados
    console.log('\n⭐ Creando reviews de prueba...');

    const completedBookings = await client.query(`
      SELECT b.id, b.user_id, b.tour_id
      FROM bookings b
      WHERE b.status = 'completed'
      AND b.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM reviews r WHERE r.booking_id = b.id
      )
      LIMIT 30
    `);

    let reviewsCreated = 0;
    const ratings = [5, 5, 5, 4, 4, 4, 3, 5]; // Más ratings altos para mejor probabilidad
    const comments = [
      'Excelente experiencia de pesca! El capitán fue muy profesional.',
      'Increíble día en el mar, capturamos varios peces grandes.',
      'Muy recomendado, todo el equipo de primera calidad.',
      'Gran aventura, definitivamente volveré.',
      'Buena experiencia, aunque el clima no ayudó mucho.',
      'Fantástico tour, valió cada dólar.',
      'Personal muy amable y conocedor de la zona.',
      'Una de las mejores experiencias de pesca que he tenido.'
    ];

    for (const booking of completedBookings.rows) {
      const rating = ratings[Math.floor(Math.random() * ratings.length)];
      const comment = comments[Math.floor(Math.random() * comments.length)];

      await client.query(`
        INSERT INTO reviews (
          user_id, tour_id, booking_id, rating, comment, status
        ) VALUES (
          $1, $2, $3, $4, $5, 'approved'
        )
      `, [booking.user_id, booking.tour_id, booking.id, rating, comment]);

      reviewsCreated++;
    }

    console.log(`✅ ${reviewsCreated} reviews creadas`);

    // 3. Actualizar estadísticas de tours
    console.log('\n📊 Actualizando estadísticas de tours...');

    await client.query(`
      UPDATE tours t
      SET
        average_rating = (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r
          WHERE r.tour_id = t.id AND r.status = 'approved'
        ),
        total_reviews = (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.tour_id = t.id AND r.status = 'approved'
        ),
        total_bookings = (
          SELECT COUNT(*)
          FROM bookings b
          WHERE b.tour_id = t.id AND b.status IN ('confirmed', 'completed')
        )
      WHERE t.deleted_at IS NULL
    `);

    console.log('✅ Estadísticas actualizadas');

    await client.query('COMMIT');

    console.log('\n✨ Seed completado exitosamente!\n');
    console.log('📈 Resumen:');
    console.log(`   - ${bookingsCreated} reservas creadas (últimos 30 días)`);
    console.log(`   - ${reviewsCreated} reviews creadas`);
    console.log('   - Estadísticas de tours actualizadas');
    console.log('\n🎯 Ahora puedes probar los reportes en: http://localhost:3000\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar seed
seedReportsData()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
