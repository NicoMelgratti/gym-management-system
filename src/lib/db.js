import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

    const isNeonOrCloud =
      connectionString.includes('neon.tech') ||
      connectionString.includes('sslmode=require') ||
      process.env.NODE_ENV === 'production';

    pool = new Pool({
      connectionString,
      ssl: isNeonOrCloud ? { rejectUnauthorized: false } : false,
    });

    pool.on('connect', (client) => {
      client.query('SET search_path TO "e22", public;');
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }
  return pool;
}

let schemaInitialized = false;

export async function ensureRutinasColumns() {
  if (schemaInitialized) return;
  try {
    const currentPool = getPool();
    await currentPool.query(`
      ALTER TABLE e22.rutinas ADD COLUMN IF NOT EXISTS origen VARCHAR(20) DEFAULT 'profesor';
      ALTER TABLE e22.rutinas ADD COLUMN IF NOT EXISTS es_activa BOOLEAN DEFAULT true;
    `);
    schemaInitialized = true;
  } catch (err) {
    // Si la tabla aún no existe o ya tiene las columnas
    schemaInitialized = true;
  }
}

/**
 * Consulta SQL directa a PostgreSQL en esquema e22
 */
export async function query(text, params = []) {
  try {
    await ensureRutinasColumns();
    const currentPool = getPool();
    const res = await currentPool.query(text, params);
    return res;
  } catch (error) {
    console.error('[PostgreSQL Error]:', error.message);
    throw error;
  }
}

/**
 * Calcula días restantes hasta la fecha de vencimiento
 */
export function diasRestantes(vencimientoStr) {
  if (!vencimientoStr) return 0;
  const vencimiento = new Date(vencimientoStr);
  const hoy = new Date();
  vencimiento.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  const diffTime = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function estadoCuota(vencimientoStr, habilitado) {
  if (!habilitado) return 'pendiente';
  if (!vencimientoStr) return 'pendiente';
  const dias = diasRestantes(vencimientoStr);
  if (dias <= 0) return 'vencido';
  if (dias <= 5) return 'atrasado';
  return 'al_dia';
}

export const calcularEstadoPago = estadoCuota;

export default {
  query,
  diasRestantes,
  estadoCuota,
  calcularEstadoPago,
};
