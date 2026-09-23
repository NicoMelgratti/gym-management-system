-- ==============================================================================
-- Datos Iniciales / Semilla para E22 GYM (Solo Administrador y Configuración)
-- ==============================================================================

-- 1. Insertar ÚNICAMENTE al profesor / admin inicial
INSERT INTO e22.usuarios (
  username, dni, nombre, apellido, email, telefono, password,
  rol, vencimiento_cuota, estado_pago, habilitado, alergias, patologias, primer_pago_realizado
) VALUES (
  'e22gym',
  'e22gym',
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
  'Ninguna',
  true
)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  rol = EXCLUDED.rol,
  habilitado = EXCLUDED.habilitado;

-- 2. Configuración general por defecto del gimnasio
INSERT INTO e22.configuracion (clave, valor)
VALUES 
(
  'precios',
  '{"cuota_mensual":25000,"pase_diario":3500,"pase_semanal":12000,"matricula":0,"descripcion":"Acceso total a sala de musculación, seguimiento de sobrecarga progresiva y prescripción de rutina personalizada por la app."}'::jsonb
),
(
  'horarios',
  '[{"dia":"Lunes a Viernes","apertura":"07:00","cierre":"22:00","turnos":"Musculación continua libre. Clases de Funcional & Core: 08:00, 15:00 y 19:30."},{"dia":"Sábados","apertura":"09:00","cierre":"14:00","turnos":"Open Gym & Acondicionamiento físico general."},{"dia":"Domingos y Feriados","apertura":"Cerrado","cierre":"","turnos":"Descanso y recuperación activa recomendada."}]'::jsonb
),
(
  'datos_bancarios',
  '{"alias":"E22.GYM.FIT","cbu":"0000003100045892019482","titular":"E22 GYM SRL","banco":"Banco Macro","instrucciones":"Una vez realizada la transferencia, sube o notifica tu comprobante aquí para que el profesor valide y renueve tu membresía."}'::jsonb
)
ON CONFLICT (clave) DO NOTHING;
