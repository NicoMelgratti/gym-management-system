const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});

async function rebuildDatabase() {
  try {
    console.log('[E22 DB] Conectando a PostgreSQL para reiniciar la base de datos...');

    // 1. Crear esquema e22 si no existe
    await pool.query('CREATE SCHEMA IF NOT EXISTS "e22";');

    // 2. Eliminar tablas anteriores para reiniciar completamente la base de datos
    await pool.query(`
      DROP TABLE IF EXISTS e22.registros_peso CASCADE;
      DROP TABLE IF EXISTS e22.pagos_notificados CASCADE;
      DROP TABLE IF EXISTS e22.rutinas CASCADE;
      DROP TABLE IF EXISTS e22.usuarios CASCADE;
      DROP TABLE IF EXISTS e22.roles CASCADE;
      DROP TYPE IF EXISTS e22.rol_enum CASCADE;
    `);

    // 3. Crear tipo ENUM rol_enum con 'usuario' y 'profesor'
    await pool.query(`
      CREATE TYPE e22.rol_enum AS ENUM ('usuario', 'profesor');
    `);

    // 4. Crear tabla usuarios
    await pool.query(`
      CREATE TABLE e22.usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        dni VARCHAR(30) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) DEFAULT '',
        email VARCHAR(150),
        telefono VARCHAR(50) DEFAULT '',
        password VARCHAR(255) NOT NULL,
        rol e22.rol_enum NOT NULL DEFAULT 'usuario',
        vencimiento_cuota DATE,
        estado_pago VARCHAR(30) DEFAULT 'pendiente', -- 'al_dia', 'pendiente', 'vencido'
        habilitado BOOLEAN DEFAULT false,
        alergias TEXT DEFAULT 'Ninguna',
        patologias TEXT DEFAULT 'Ninguna',
        dias_asistencia INTEGER DEFAULT 3,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Crear tabla rutinas
    await pool.query(`
      CREATE TABLE e22.rutinas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
        profesor_id INTEGER REFERENCES e22.usuarios(id) ON DELETE SET NULL,
        titulo VARCHAR(150) NOT NULL,
        detalles TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Crear tabla registros_peso (seguimiento de cargas por ejercicio)
    await pool.query(`
      CREATE TABLE e22.registros_peso (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
        ejercicio VARCHAR(100) NOT NULL,
        peso_kg NUMERIC(6,2) NOT NULL,
        repeticiones INTEGER DEFAULT 10,
        semana INTEGER DEFAULT 1,
        notas TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Crear tabla pagos_notificados (cliente realiza el pago y profesor lo aprueba)
    await pool.query(`
      CREATE TABLE e22.pagos_notificados (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
        metodo VARCHAR(50) DEFAULT 'transferencia',
        referencia VARCHAR(100) DEFAULT '',
        monto NUMERIC(10,2) DEFAULT 0,
        estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_aprobacion TIMESTAMP
      );
    `);

    // 8. Insertar ÚNICAMENTE al profesor / admin inicial: usuario e22gym, contraseña admin123
    await pool.query(`
      INSERT INTO e22.usuarios (
        username, dni, nombre, apellido, email, telefono, password,
        rol, vencimiento_cuota, estado_pago, habilitado, alergias, patologias
      ) VALUES (
        'e22gym',
        '00000000',
        'Profesor',
        'E22',
        'admin@e22gym.com',
        '+5491100000000',
        'admin123',
        'profesor',
        CURRENT_DATE + INTERVAL '365 days',
        'al_dia',
        true,
        'Ninguna',
        'Ninguna'
      );
    `);

    // Índices de búsqueda
    await pool.query(`
      CREATE INDEX idx_usuarios_dni ON e22.usuarios(dni);
      CREATE INDEX idx_usuarios_username ON e22.usuarios(username);
      CREATE INDEX idx_registros_peso_usuario ON e22.registros_peso(usuario_id);
      CREATE INDEX idx_pagos_usuario ON e22.pagos_notificados(usuario_id);
    `);

    console.log('[E22 DB] ✅ Base de datos reiniciada con éxito. Único usuario: e22gym (admin123) con rol profesor.');
  } catch (err) {
    console.error('[E22 DB] ❌ Error reiniciando base de datos:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

rebuildDatabase();
