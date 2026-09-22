# ⚡ E22 GYM — Sistema de Gestión Deportiva & Entrenamiento Elite

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-IA_Multimodal-8E75C4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)

Plataforma web integral de alto rendimiento diseñada para la administración de gimnasios, gestión de cuotas y membresías de 30 días, digitalización de planillas técnicas de entrenamiento, prescripción personalizada de rutinas y seguimiento de sobrecarga progresiva con Inteligencia Artificial.

Diseñada bajo una estética **Stealth Dark Minimalista Deportiva** (paleta negro/zinc con alto contraste y tipografía monoespaciada para telemetría de gimnasio), 100% responsiva para celulares y tablets.

---

## 🚀 Características Principales

### 🏋️ 1. Planilla Técnica Oficial E22 (Estilo Hoja Física)
- **Fidelidad al Formato Físico**: Réplica digital exacta de la hoja de entrenamiento del centro de alto rendimiento.
- **Cabecera Oficial**: Identificador de `Plan Nº`, socio y objetivo individual personalizable por el entrenador (ej. *Aumento de fuerza e hipertrofia*).
- **Periodización Multi-Bloque**: 4 etapas de progresión con fechas límite y control de intensidad **RIR** (*Repeticiones en Reserva*), con subcolumnas de **Kg**, **R** (Repeticiones) y **S** (Series).
- **Redacción Libre de Ejercicios**: El profesor redacta los ejercicios y especificaciones de máquinas a utilizar sin restricciones de listas predeterminadas.
- **Grilla de 30 Días de Asistencia**: Matriz interactiva de 30 casillas donde el alumno tacha cada sesión completada, con persistencia inmediata en base de datos.
- **Doble Tema de Visualización**: Alternancia con un clic entre **Modo Oscuro Deportivo** y **Estilo Hoja Papel** (claro).
- **Exportación en PDF Oficial**: Descarga directa de la planilla técnica en formato horizontal A4 de alta definición para imprimir o llevar en el celular.

### 🤖 2. Inteligencia Artificial Multimodal (Google Gemini)
- **Escáner de Rutinas en Foto o Excel (`ScanRoutineModal`)**:
  - Digitaliza fotos de hojas físicas escritas a mano (`.jpg`, `.png`, `.webp`) o archivos de cálculo (`.xlsx`, `.csv`).
  - La IA analiza la caligrafía, reconoce los días, ejercicios, series, repeticiones y etapas de progresión, convirtiéndolos en la estructura oficial de E22.
  - Incluye parser local de contingencia para planillas Excel y bypass directo al editor ante caídas externas de conexión.
- **Coach Virtual E22 Inteligente (`AICoachWidget`)**:
  - Asistente personal disponible en el panel del alumno en tiempo real.
  - **Mapeo Semanal Automático**: Detecta el día actual en horario local argentino y le indica al alumno qué le toca entrenar (ej. *Lunes = Día 1: Pecho y Tríceps*).
  - Desglosa la lista completa de ejercicios con series, repeticiones recomendadas y máquina requerida según la planilla activa del socio.
  - Responde dudas biomecánicas de ejercicios (sentadillas, press banca, dominadas), tiempos de descanso óptimos y conceptos de RIR.
  - Motor híbrido ultra veloz con **Gemini Flash Lite** (~950 ms) y fallback local experto para asegurar respuestas sin demoras.

### 📱 3. Experiencia Móvil Optimizada (100% Responsive)
- **Menú Hamburguesa Flotante**: Encabezado sticky con cajón lateral (*slide-over drawer*) con fondo difuminado (*backdrop blur*).
- **Cierre Táctil Inteligente**: Cierre automático al tocar fuera del menú, cambiar de pestaña o presionar la tecla `Escape`.
- **Prevención de Desbordes**: Ajuste de ancho de pantalla, control de tipografía táctil y tablas adaptables con scroll suave para evitar desplazamientos horizontales no deseados.

### 💳 4. Control de Cuotas y Membresías de 30 Días
- **Contador Regresivo en Vivo**: Muestra al socio los días exactos que restan de su suscripción.
- **Notificación y Aprobación de Pagos**: Envío de comprobantes de transferencia bancaria con verificación en un solo clic por parte del profesor.
- **Habilitación Inmediata**: La aprobación suma 30 días de suscripción acumulativos y habilita automáticamente el acceso a la planilla y al gimnasio.

### 📈 5. Sobrecarga Progresiva (Récords Personales)
- Registro semana tras semana de cargas (kg), repeticiones y notas técnicas en ejercicios clave.
- Detección y badges automáticos de **PRs (Personal Records)**.
- Historial técnico para evaluar evolución a lo largo del tiempo.

---

## 🔒 Arquitectura de Seguridad y Roles

El acceso está protegido por roles y verificación en servidor:

| Rol | Identificador | Acceso y Seguridad | Panel Asignado |
| :--- | :--- | :--- | :--- |
| **Profesor / Administrador** | Usuario Administrativo | Contraseña encriptada configurada en el despliegue | `/dashboard/profesor` |
| **Alumno / Socio** | Número de DNI | Contraseña personal elegida al registrarse | `/dashboard/alumno` |

> [!NOTE]
> Las credenciales administrativas no se incluyen en el repositorio público por motivos de seguridad. Se configuran mediante variables de entorno o scripts de inicialización interna.

---

## 🗄️ Esquema de Base de Datos (PostgreSQL)

Todo el sistema opera dentro del esquema aislado `e22`:

```sql
CREATE SCHEMA IF NOT EXISTS e22;

CREATE TYPE e22.rol_enum AS ENUM ('usuario', 'profesor');

-- Usuarios y Socios
CREATE TABLE e22.usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  dni VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  email VARCHAR(150),
  telefono VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  rol e22.rol_enum DEFAULT 'usuario',
  vencimiento_cuota DATE,
  estado_pago VARCHAR(20) DEFAULT 'pendiente',
  habilitado BOOLEAN DEFAULT false,
  alergias TEXT DEFAULT 'Ninguna',
  patologias TEXT DEFAULT 'Ninguna',
  dias_asistencia INTEGER DEFAULT 4,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Planillas y Rutinas de Entrenamiento
CREATE TABLE e22.rutinas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
  profesor_id INTEGER REFERENCES e22.usuarios(id) ON DELETE SET NULL,
  titulo VARCHAR(150) NOT NULL,
  detalles TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registro de Sobrecarga Progresiva (PRs)
CREATE TABLE e22.registros_peso (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
  ejercicio VARCHAR(100) NOT NULL,
  peso_kg NUMERIC(6, 2) NOT NULL,
  repeticiones INTEGER DEFAULT 10,
  semana INTEGER DEFAULT 1,
  notas TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pagos y Comprobantes Notificados
CREATE TABLE e22.pagos_notificados (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
  metodo VARCHAR(50) DEFAULT 'transferencia',
  referencia VARCHAR(100),
  monto NUMERIC(10, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion TIMESTAMP
);
```

---

## 📡 API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Autenticación para profesores y socios (por DNI). |
| `POST` | `/api/auth/register` | Registro de nuevos socios con ficha médica deportiva. |
| `GET` | `/api/socios` | Directorio de socios con filtros de estado y búsqueda por DNI. |
| `GET` | `/api/socios/[id]` | Perfil integral del socio: cuota, planilla técnica y registros. |
| `GET` | `/api/rutinas` | Obtener la planilla técnica asignada al socio. |
| `POST` | `/api/rutinas` | Crear o modificar planilla técnica personalizada. |
| `PATCH`| `/api/rutinas` | Registrar o desmarcar días en la grilla de asistencia de 30 días. |
| `POST` | `/api/ia/coach` | Consultar al Coach Virtual E22 sobre la rutina del día o técnica. |
| `POST` | `/api/ia/analizar-rutina` | Digitalizar rutina mediante IA desde foto o archivo Excel. |
| `POST` | `/api/pagos/notificar` | Notificar comprobante de pago de membresía. |
| `GET` | `/api/pagos` | Listar pagos pendientes de verificación o históricos. |
| `POST` | `/api/pagos/aprobar` | Validar pago, extender suscripción (+30 días) y habilitar acceso. |
| `GET` | `/api/progreso` | Consultar historial de cargas semanales y récords personales (PRs). |
| `POST` | `/api/progreso` | Guardar registro de carga semanal por ejercicio. |
| `DELETE`| `/api/progreso` | Eliminar registro de peso. |

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos Previos
- **Node.js** v18 o superior.
- **PostgreSQL** v14 o superior (local o en la nube como Neon / Supabase).
- Clave API de **Google Gemini** (opcional, para funciones de IA).

### 1. Clonar el Repositorio
```bash
git clone https://github.com/NicoMelgratti/gym-management-system.git
cd gym-management-system
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto tomando como referencia el archivo `.env.example`:
```env
# Conexión a Base de Datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_base_datos?sslmode=disable"
PG_SCHEMA=e22

# Clave API para IA (Google AI Studio)
GEMINI_API_KEY="tu_clave_de_gemini_aqui"
```

### 4. Inicializar Base de Datos
Ejecuta el script de migración para generar el esquema `e22` y las tablas necesarias:
```bash
node scripts/rebuild_e22_database.js
```

### 5. Iniciar en Modo Desarrollo
```bash
npm run dev
```

La plataforma estará lista en: **[http://localhost:3000](http://localhost:3000)**

---

## 👥 Equipo y Créditos
- Desarrollado para **E22 GYM** — Centro de Alto Rendimiento & Fitness.
- Autor: [Nico Melgratti](https://github.com/NicoMelgratti).
