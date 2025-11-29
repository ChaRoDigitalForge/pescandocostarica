import { neon } from '@neondatabase/serverless';

// Función para obtener la conexión SQL
export function getSQL() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL o NETLIFY_DATABASE_URL no está definida');
  }

  return neon(databaseUrl);
}

// Exportar una instancia por defecto para usar directamente
export const sql = getSQL();
