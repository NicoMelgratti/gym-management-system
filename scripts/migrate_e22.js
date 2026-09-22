const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});

async function migrate() {
  try {
    console.log('[DB Migrate] Conectando a PostgreSQL localhost:5432...');

    // 1. Asegurar esquema e22
    await pool.query('CREATE SCHEMA IF NOT EXISTS "e22";');

    // 2. Asegurar tabla de roles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS e22.roles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE
      );
    `);
    await pool.query(`
      INSERT INTO e22.roles (id, nombre) VALUES (1, 'alumno'), (2, 'profesor')
      ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;
    `);

    // 3. Modificar o crear tabla usuarios en e22
    await pool.query(`
      CREATE TABLE IF NOT EXISTS e22.usuarios (
        id SERIAL PRIMARY KEY,
        dni VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150),
        password VARCHAR(255),
        rol_id INTEGER REFERENCES e22.roles(id),
        vencimiento_cuota DATE,
        estado_pago VARCHAR(20) DEFAULT 'rojo'
      );
    `);

    // 4. Agregar columnas adicionales para registro y ficha médica
    await pool.query(`
      ALTER TABLE e22.usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(100);
      ALTER TABLE e22.usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(50);
      ALTER TABLE e22.usuarios ADD COLUMN IF NOT EXISTS alergias TEXT DEFAULT 'Ninguna';
      ALTER TABLE e22.usuarios ADD COLUMN IF NOT EXISTS patologias TEXT DEFAULT 'Ninguna';
      ALTER TABLE e22.usuarios ADD COLUMN IF NOT EXISTS dias_asistencia INTEGER DEFAULT 3;
      ALTER TABLE e22.usuarios ADD COLUMN IF NOT EXISTS primer_pago_realizado BOOLEAN DEFAULT false;
    `);

    // 5. Asegurar tabla de rutinas en e22
    await pool.query(`
      CREATE TABLE IF NOT EXISTS e22.rutinas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
        profesor_id INTEGER REFERENCES e22.usuarios(id) ON DELETE SET NULL,
        titulo VARCHAR(150) NOT NULL,
        detalles TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Insertar profesor inicial si no existe
    await pool.query(`
      INSERT INTO e22.usuarios (dni, nombre, apellido, email, telefono, password, rol_id, estado_pago, primer_pago_realizado)
      VALUES ('11111111', 'Prof. Carlos', 'Rossi', 'profesor@e22gym.com', '+5491144556677', 'admin123', 2, 'verde', true)
      ON CONFLICT (dni) DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        apellido = EXCLUDED.apellido,
        rol_id = 2;
    `);

    // 7. Insertar algunos alumnos de prueba si no existen
    await pool.query(`
      INSERT INTO e22.usuarios (dni, nombre, apellido, email, telefono, password, rol_id, vencimiento_cuota, estado_pago, alergias, patologias, dias_asistencia, primer_pago_realizado)
      VALUES 
      ('22222222', 'Martín', 'Pérez', 'martin.perez@email.com', '+5491122334455', '123', 1, CURRENT_DATE + INTERVAL '25 days', 'verde', 'Alergia al polen', 'Ninguna', 4, true),
      ('33333333', 'Sofía', 'Gómez', 'sofia.gomez@email.com', '+5491166778899', '123', 1, CURRENT_DATE + INTERVAL '3 days', 'amarillo', 'Ninguna', 'Tendinitis en hombro derecho', 3, true),
      ('44444444', 'Lucas', 'Álvarez', 'lucas.alvarez@email.com', '+5491188990011', '123', 1, CURRENT_DATE - INTERVAL '4 days', 'rojo', 'Ninguna', 'Lumbalgia L5-S1 leve', 5, true)
      ON CONFLICT (dni) DO NOTHING;
    `);

    console.log('[DB Migrate] ✅ Migración completada exitosamente en PostgreSQL esquema e22!');
  } catch (err) {
    console.error('[DB Migrate] ❌ Error en migración:', err);
  } finally {
    await pool.end();
  }
}

migrate();
