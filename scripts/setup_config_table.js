const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});

async function run() {
  try {
    console.log('Connecting to PostgreSQL...');
    await pool.query('CREATE SCHEMA IF NOT EXISTS "e22";');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS e22.configuracion (
        clave VARCHAR(50) PRIMARY KEY,
        valor JSONB NOT NULL,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table e22.configuracion ensured.');

    const defaultPrecios = {
      cuota_mensual: 25000,
      pase_diario: 3500,
      pase_semanal: 12000,
      matricula: 0,
      descripcion: 'Acceso total a sala de musculación, seguimiento de sobrecarga progresiva y prescripción de rutina personalizada por la app.'
    };

    const defaultHorarios = [
      {
        dia: 'Lunes a Viernes',
        apertura: '07:00',
        cierre: '22:00',
        turnos: 'Musculación continua libre. Clases de Funcional & Core: 08:00, 15:00 y 19:30.'
      },
      {
        dia: 'Sábados',
        apertura: '09:00',
        cierre: '14:00',
        turnos: 'Open Gym & Acondicionamiento físico general.'
      },
      {
        dia: 'Domingos y Feriados',
        apertura: 'Cerrado',
        cierre: '',
        turnos: 'Descanso y recuperación activa recomendada.'
      }
    ];

    const defaultBancarios = {
      alias: 'E22.GYM.FIT',
      cbu: '0000003100045892019482',
      titular: 'E22 GYM SRL',
      banco: 'Banco Macro',
      instrucciones: 'Una vez realizada la transferencia, sube o notifica tu comprobante aquí para que el profesor valide y renueve tu membresía.'
    };

    // Insert or keep if exists
    await pool.query(`
      INSERT INTO e22.configuracion (clave, valor)
      VALUES ($1, $2)
      ON CONFLICT (clave) DO NOTHING;
    `, ['precios', JSON.stringify(defaultPrecios)]);

    await pool.query(`
      INSERT INTO e22.configuracion (clave, valor)
      VALUES ($1, $2)
      ON CONFLICT (clave) DO NOTHING;
    `, ['horarios', JSON.stringify(defaultHorarios)]);

    await pool.query(`
      INSERT INTO e22.configuracion (clave, valor)
      VALUES ($1, $2)
      ON CONFLICT (clave) DO NOTHING;
    `, ['datos_bancarios', JSON.stringify(defaultBancarios)]);

    const rows = await pool.query('SELECT clave, valor FROM e22.configuracion');
    console.log('Current configuracion rows:');
    for (const r of rows.rows) {
      console.log(`- ${r.clave}:`, r.valor);
    }
  } catch (err) {
    console.error('Error setting up table:', err);
  } finally {
    await pool.end();
  }
}

run();
