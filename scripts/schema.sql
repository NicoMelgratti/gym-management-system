-- Script de definición de base de datos para Zinerva Gym
-- Esquema: E22

CREATE SCHEMA IF NOT EXISTS "E22";

-- 1. Tabla de Roles
CREATE TABLE IF NOT EXISTS "E22".roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "E22".usuarios (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    password VARCHAR(255),
    rol_id INTEGER REFERENCES "E22".roles(id) ON DELETE RESTRICT,
    vencimiento_cuota DATE,
    estado_pago VARCHAR(20) DEFAULT 'rojo' CHECK (estado_pago IN ('verde', 'amarillo', 'rojo'))
);

-- 3. Tabla de Rutinas
CREATE TABLE IF NOT EXISTS "E22".rutinas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES "E22".usuarios(id) ON DELETE CASCADE,
    profesor_id INTEGER REFERENCES "E22".usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    detalles TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de optimización
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON "E22".usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON "E22".usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_usuario ON "E22".rutinas(usuario_id);
