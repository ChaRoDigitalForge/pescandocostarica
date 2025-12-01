import { query } from '../../config/database.js';

// Reporte diario de capturas por marina/ubicación
export const getDailyCatchesByLocation = async (req, res, next) => {
  try {
    const { date, location_id } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let reportQuery = `
      SELECT
        l.name as location_name,
        l.id as location_id,
        p.name as provincia_name,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT t.id) as total_tours,
        COALESCE(AVG(r.rating), 0) as average_satisfaction,
        json_agg(
          DISTINCT jsonb_build_object(
            'tour_title', t.title,
            'fishing_type', t.fishing_type,
            'bookings', (
              SELECT COUNT(*)
              FROM bookings b2
              WHERE b2.tour_id = t.id
              AND DATE(b2.booking_date) = $1
              AND b2.status IN ('confirmed', 'completed')
            )
          )
        ) FILTER (WHERE t.id IS NOT NULL) as tours_info
      FROM locations l
      LEFT JOIN tours t ON t.location_id = l.id AND t.deleted_at IS NULL
      LEFT JOIN bookings b ON b.tour_id = t.id
        AND DATE(b.booking_date) = $1
        AND b.status IN ('confirmed', 'completed')
        AND b.deleted_at IS NULL
      LEFT JOIN reviews r ON r.booking_id = b.id AND r.status = 'approved'
      LEFT JOIN provincias p ON l.provincia_id = p.id
    `;

    const params = [targetDate];
    let paramCount = 2;

    if (location_id) {
      reportQuery += ` WHERE l.id = $${paramCount}`;
      params.push(location_id);
      paramCount++;
    }

    reportQuery += `
      GROUP BY l.id, l.name, p.name
      HAVING COUNT(DISTINCT b.id) > 0
      ORDER BY COUNT(DISTINCT b.id) DESC
    `;

    const result = await query(reportQuery, params);

    res.json({
      success: true,
      data: {
        date: targetDate,
        locations: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Especies más activas del mes
export const getActiveSpeciesByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || (currentDate.getMonth() + 1);

    // Nota: Esta query asume que tienes información sobre especies
    // Si no existe la tabla, necesitarás crearla. Por ahora, usaremos fishing_type
    const speciesQuery = `
      SELECT
        t.fishing_type as species_type,
        COUNT(DISTINCT b.id) as total_catches,
        COUNT(DISTINCT t.id) as tours_available,
        COALESCE(AVG(r.rating), 0) as average_rating,
        json_agg(
          DISTINCT jsonb_build_object(
            'location', l.name,
            'provincia', p.name,
            'catches', (
              SELECT COUNT(*)
              FROM bookings b2
              WHERE b2.tour_id = t.id
              AND EXTRACT(YEAR FROM b2.booking_date) = $1
              AND EXTRACT(MONTH FROM b2.booking_date) = $2
              AND b2.status IN ('confirmed', 'completed')
            )
          )
        ) FILTER (WHERE l.id IS NOT NULL) as locations
      FROM tours t
      LEFT JOIN bookings b ON b.tour_id = t.id
        AND EXTRACT(YEAR FROM b.booking_date) = $1
        AND EXTRACT(MONTH FROM b.booking_date) = $2
        AND b.status IN ('confirmed', 'completed')
        AND b.deleted_at IS NULL
      LEFT JOIN reviews r ON r.booking_id = b.id AND r.status = 'approved'
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN provincias p ON l.provincia_id = p.id
      WHERE t.status = 'active' AND t.deleted_at IS NULL
      GROUP BY t.fishing_type
      ORDER BY total_catches DESC, average_rating DESC
      LIMIT 10
    `;

    const result = await query(speciesQuery, [targetYear, targetMonth]);

    res.json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        species: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Temporadas por provincia
export const getSeasonsByProvince = async (req, res, next) => {
  try {
    const seasonsQuery = `
      SELECT
        p.name as provincia_name,
        p.code as provincia_code,
        t.fishing_type,
        COUNT(DISTINCT b.id) as total_bookings,
        json_build_object(
          'jan', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 1),
          'feb', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 2),
          'mar', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 3),
          'apr', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 4),
          'may', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 5),
          'jun', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 6),
          'jul', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 7),
          'aug', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 8),
          'sep', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 9),
          'oct', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 10),
          'nov', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 11),
          'dec', COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.booking_date) = 12)
        ) as monthly_distribution,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM provincias p
      LEFT JOIN locations l ON l.provincia_id = p.id
      LEFT JOIN tours t ON t.location_id = l.id AND t.deleted_at IS NULL
      LEFT JOIN bookings b ON b.tour_id = t.id
        AND b.status IN ('confirmed', 'completed')
        AND b.deleted_at IS NULL
        AND b.booking_date >= NOW() - INTERVAL '12 months'
      LEFT JOIN reviews r ON r.booking_id = b.id AND r.status = 'approved'
      GROUP BY p.id, p.name, p.code, t.fishing_type
      HAVING COUNT(DISTINCT b.id) > 0
      ORDER BY p.name, total_bookings DESC
    `;

    const result = await query(seasonsQuery);

    // Agrupar por provincia
    const groupedData = result.rows.reduce((acc, row) => {
      const provincia = row.provincia_name;
      if (!acc[provincia]) {
        acc[provincia] = {
          provincia_name: row.provincia_name,
          provincia_code: row.provincia_code,
          fishing_types: []
        };
      }
      acc[provincia].fishing_types.push({
        type: row.fishing_type,
        total_bookings: parseInt(row.total_bookings),
        monthly_distribution: row.monthly_distribution,
        average_rating: parseFloat(row.average_rating)
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(groupedData)
    });
  } catch (error) {
    next(error);
  }
};

// Calcular probabilidad de éxito
export const getSuccessProbability = async (req, res, next) => {
  try {
    const { location_id, fishing_type, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const parsedDate = new Date(targetDate);
    const month = parsedDate.getMonth() + 1;
    const dayOfWeek = parsedDate.getDay();

    let probabilityQuery = `
      WITH historical_data AS (
        SELECT
          COUNT(DISTINCT b.id) as total_bookings,
          COUNT(DISTINCT CASE WHEN r.rating >= 4 THEN b.id END) as successful_trips,
          COALESCE(AVG(r.rating), 0) as avg_rating
        FROM bookings b
        LEFT JOIN reviews r ON r.booking_id = b.id AND r.status = 'approved'
        LEFT JOIN tours t ON b.tour_id = t.id
        LEFT JOIN locations l ON t.location_id = l.id
        WHERE b.status IN ('confirmed', 'completed')
          AND b.deleted_at IS NULL
          AND t.deleted_at IS NULL
          AND EXTRACT(MONTH FROM b.tour_date) = $1
    `;

    const params = [month];
    let paramCount = 2;

    if (location_id) {
      probabilityQuery += ` AND l.id = $${paramCount}`;
      params.push(location_id);
      paramCount++;
    }

    if (fishing_type) {
      probabilityQuery += ` AND t.fishing_type = $${paramCount}`;
      params.push(fishing_type);
      paramCount++;
    }

    probabilityQuery += `
          AND b.tour_date >= NOW() - INTERVAL '12 months'
      ),
      weather_factor AS (
        SELECT
          CASE
            WHEN ${dayOfWeek} IN (0, 6) THEN 1.1
            ELSE 1.0
          END as weekend_boost
      ),
      season_factor AS (
        SELECT
          CASE
            WHEN ${month} BETWEEN 12 AND 4 THEN 1.15
            WHEN ${month} BETWEEN 5 AND 8 THEN 1.25
            ELSE 1.0
          END as season_multiplier
      )
      SELECT
        hd.total_bookings,
        hd.successful_trips,
        hd.avg_rating,
        wf.weekend_boost,
        sf.season_multiplier,
        CASE
          WHEN hd.total_bookings > 0 THEN
            LEAST(
              GREATEST(
                ((hd.successful_trips::float / hd.total_bookings) * 100 * wf.weekend_boost * sf.season_multiplier),
                20
              ),
              95
            )
          ELSE 50
        END as success_probability
      FROM historical_data hd
      CROSS JOIN weather_factor wf
      CROSS JOIN season_factor sf
    `;

    const result = await query(probabilityQuery, params);
    const data = result.rows[0];

    // Obtener información de la ubicación y tipo de pesca
    let locationInfo = {};
    if (location_id) {
      const locationQuery = `
        SELECT l.name, p.name as provincia_name
        FROM locations l
        LEFT JOIN provincias p ON l.provincia_id = p.id
        WHERE l.id = $1
      `;
      const locResult = await query(locationQuery, [location_id]);
      if (locResult.rows.length > 0) {
        locationInfo = locResult.rows[0];
      }
    }

    // Determinar el nombre del tipo de pesca en español
    const fishingTypeNames = {
      'offshore': 'Alta Mar',
      'inshore': 'Costera',
      'river': 'Río',
      'lake': 'Lago'
    };

    const probability = Math.round(parseFloat(data.success_probability));
    const fishingTypeName = fishing_type ? fishingTypeNames[fishing_type] || fishing_type : 'cualquier tipo de pesca';
    const locationName = locationInfo.name || 'Costa Rica';

    // Generar mensaje personalizado
    let message = `Hoy: ${probability}% probabilidad de éxito`;

    if (fishing_type && location_id) {
      message = `Hoy: ${probability}% probabilidad de encontrar ${fishingTypeName} en ${locationName}`;
    } else if (fishing_type) {
      message = `Hoy: ${probability}% probabilidad de éxito en pesca ${fishingTypeName}`;
    } else if (location_id) {
      message = `Hoy: ${probability}% probabilidad de éxito en ${locationName}`;
    }

    res.json({
      success: true,
      data: {
        date: targetDate,
        probability: probability,
        message: message,
        details: {
          total_historical_trips: parseInt(data.total_bookings) || 0,
          successful_trips: parseInt(data.successful_trips) || 0,
          average_rating: parseFloat(data.avg_rating).toFixed(1),
          location: locationInfo.name || null,
          fishing_type: fishingTypeName,
          factors: {
            weekend_boost: parseFloat(data.weekend_boost),
            season_multiplier: parseFloat(data.season_multiplier)
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resumen general de reportes
export const getReportsSummary = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Obtener datos del día
    const dailyQuery = `
      SELECT
        COUNT(DISTINCT b.id) as today_bookings,
        COUNT(DISTINCT l.id) as active_locations
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN locations l ON t.location_id = l.id
      WHERE DATE(b.booking_date) = $1
        AND b.status IN ('confirmed', 'completed')
        AND b.deleted_at IS NULL
    `;

    // Top especies del mes
    const topSpeciesQuery = `
      SELECT
        t.fishing_type,
        COUNT(DISTINCT b.id) as catches
      FROM tours t
      LEFT JOIN bookings b ON b.tour_id = t.id
      WHERE EXTRACT(MONTH FROM b.booking_date) = $1
        AND EXTRACT(YEAR FROM b.booking_date) = $2
        AND b.status IN ('confirmed', 'completed')
        AND b.deleted_at IS NULL
        AND t.deleted_at IS NULL
      GROUP BY t.fishing_type
      ORDER BY catches DESC
      LIMIT 3
    `;

    // Probabilidad general
    const probabilityQuery = `
      WITH historical AS (
        SELECT
          COUNT(DISTINCT b.id) as total,
          COUNT(DISTINCT CASE WHEN r.rating >= 4 THEN b.id END) as successful
        FROM bookings b
        LEFT JOIN reviews r ON r.booking_id = b.id AND r.status = 'approved'
        WHERE b.status IN ('confirmed', 'completed')
          AND b.deleted_at IS NULL
          AND EXTRACT(MONTH FROM b.booking_date) = $1
          AND b.booking_date >= NOW() - INTERVAL '12 months'
      )
      SELECT
        CASE
          WHEN total > 0 THEN
            LEAST(GREATEST(((successful::float / total) * 100), 20), 95)
          ELSE 65
        END as probability
      FROM historical
    `;

    const [dailyResult, speciesResult, probabilityResult] = await Promise.all([
      query(dailyQuery, [today]),
      query(topSpeciesQuery, [currentMonth, currentYear]),
      query(probabilityQuery, [currentMonth])
    ]);

    const fishingTypeNames = {
      'offshore': 'Alta Mar',
      'inshore': 'Costera',
      'river': 'Río',
      'lake': 'Lago'
    };

    res.json({
      success: true,
      data: {
        daily_summary: {
          date: today,
          total_bookings: parseInt(dailyResult.rows[0].today_bookings) || 0,
          active_locations: parseInt(dailyResult.rows[0].active_locations) || 0
        },
        top_species: speciesResult.rows.map(row => ({
          type: fishingTypeNames[row.fishing_type] || row.fishing_type,
          catches: parseInt(row.catches)
        })),
        today_probability: {
          value: Math.round(parseFloat(probabilityResult.rows[0].probability)),
          message: `Hoy: ${Math.round(parseFloat(probabilityResult.rows[0].probability))}% probabilidad de éxito`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
