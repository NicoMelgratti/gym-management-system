-- Datos iniciales para pruebas en Zinerva Gym (Esquema E22)

-- 1. Insertar roles si no existen
INSERT INTO "E22".roles (id, nombre) VALUES 
(1, 'alumno'),
(2, 'profesor')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 2. Insertar Usuarios
-- Profesor
INSERT INTO "E22".usuarios (dni, nombre, email, password, rol_id, vencimiento_cuota, estado_pago)
VALUES 
('11111111', 'Prof. Carlos Rossi', 'carlos.rossi@zinervagym.com', 'admin123', 2, NULL, 'verde')
ON CONFLICT (dni) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Alumnos con diferentes estados de cuota
INSERT INTO "E22".usuarios (dni, nombre, email, password, rol_id, vencimiento_cuota, estado_pago)
VALUES 
('22222222', 'Martín Pérez', 'martin.perez@email.com', '123456', 1, CURRENT_DATE + INTERVAL '22 days', 'verde'),
('33333333', 'Sofía Gómez', 'sofia.gomez@email.com', '123456', 1, CURRENT_DATE + INTERVAL '3 days', 'amarillo'),
('44444444', 'Lucas Álvarez', 'lucas.alvarez@email.com', '123456', 1, CURRENT_DATE - INTERVAL '6 days', 'rojo'),
('55555555', 'Valentina Díaz', 'valen.diaz@email.com', '123456', 1, CURRENT_DATE + INTERVAL '15 days', 'verde')
ON CONFLICT (dni) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  vencimiento_cuota = EXCLUDED.vencimiento_cuota,
  estado_pago = EXCLUDED.estado_pago;

-- 3. Insertar Rutinas iniciales
INSERT INTO "E22".rutinas (usuario_id, profesor_id, titulo, detalles, fecha_creacion)
SELECT u.id, p.id, 'Rutina de Hipertrofia 3 Días (Fuerza y Volumen)', 
'Día 1 - Pecho y Tríceps:
• Press Banca Plano: 4 series x 10 repeticiones
• Press Inclinado con Mancuernas: 3 series x 12 repeticiones
• Aperturas en Polea: 3 series x 15 repeticiones
• Fondos en Paralelas: 3 series al fallo
• Extensión de Tríceps en Polea: 4 series x 12 repeticiones

Día 2 - Espalda y Bíceps:
• Jalón al Pecho: 4 series x 10 repeticiones
• Remo con Barra: 4 series x 8 repeticiones
• Remo Gironda sentado: 3 series x 12 repeticiones
• Curl de Bíceps con Barra Z: 4 series x 10 repeticiones
• Curl Martillo con Mancuernas: 3 series x 12 repeticiones

Día 3 - Piernas y Hombros:
• Sentadilla Libre: 4 series x 8 repeticiones
• Prensa 45°: 4 series x 12 repeticiones
• Sillón de Cuádriceps: 3 series x 15 repeticiones
• Press Militar con Mancuernas: 4 series x 10 repeticiones
• Vuelos Laterales: 4 series x 15 repeticiones
• Abdominales en polea: 3 series x 20 repeticiones

Notas del Profesor:
- Calentamiento previo articular de 10 minutos.
- Descanso de 90 segundos entre series pesadas y 60 segundos en aislamiento.
- Hidratación constante durante el entrenamiento.',
CURRENT_TIMESTAMP
FROM "E22".usuarios u
CROSS JOIN "E22".usuarios p
WHERE u.dni = '22222222' AND p.dni = '11111111'
LIMIT 1;
