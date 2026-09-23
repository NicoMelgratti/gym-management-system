-- ==============================================================================
-- Esquema de Base de Datos para E22 GYM en PostgreSQL / Neon Cloud
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS "e22";

-- 1. Tipo Enum para roles de usuarios
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_namespace n ON n.oid = t.typnamespace 
    WHERE t.typname = 'rol_enum' AND n.nspname = 'e22'
  ) THEN
    CREATE TYPE e22.rol_enum AS ENUM ('usuario', 'profesor');
  END IF;
END $$;

-- 2. Tabla de Usuarios y Socios
CREATE TABLE IF NOT EXISTS e22.usuarios (
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
  estado_pago VARCHAR(30) DEFAULT 'pendiente',
  habilitado BOOLEAN DEFAULT false,
  alergias TEXT DEFAULT 'Ninguna',
  patologias TEXT DEFAULT 'Ninguna',
  dias_asistencia INTEGER DEFAULT 3,
  primer_pago_realizado BOOLEAN DEFAULT false,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON e22.usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON e22.usuarios(username);

-- 3. Tabla de Rutinas
CREATE TABLE IF NOT EXISTS e22.rutinas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
  profesor_id INTEGER REFERENCES e22.usuarios(id) ON DELETE SET NULL,
  titulo VARCHAR(150) NOT NULL,
  detalles TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rutinas_usuario ON e22.rutinas(usuario_id);

-- 4. Tabla de Registros de Sobrecarga Progresiva (Peso / Cargas)
CREATE TABLE IF NOT EXISTS e22.registros_peso (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
  ejercicio VARCHAR(100) NOT NULL,
  peso_kg NUMERIC(6,2) NOT NULL,
  repeticiones INTEGER DEFAULT 10,
  semana INTEGER DEFAULT 1,
  notas TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registros_peso_usuario ON e22.registros_peso(usuario_id);

-- 5. Tabla de Pagos Notificados
CREATE TABLE IF NOT EXISTS e22.pagos_notificados (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
  metodo VARCHAR(50) DEFAULT 'transferencia',
  referencia VARCHAR(100) DEFAULT '',
  monto NUMERIC(10,2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON e22.pagos_notificados(usuario_id);

-- 6. Tabla de Configuración Dinámica del Gimnasio
CREATE TABLE IF NOT EXISTS e22.configuracion (
  clave VARCHAR(50) PRIMARY KEY,
  valor JSONB NOT NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
