# ⚡ E22 GYM — Sistema de Gestión Deportiva & Entrenamiento Elite

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)

Plataforma web integral de alto rendimiento para la administración de cuotas, membresías de 30 días, prescripción de rutinas por días y registro de cargas progresivas de **E22 GYM**.

Diseñada bajo una estética **Stealth Dark Minimalista Deportiva** (paleta negro/zinc con alto contraste y tipografía monoespaciada para telemetría deportiva), eliminando distracciones y enfocándose en la eficiencia operativa.

---

## 📸 Capturas y Características Destacadas

- **Estética Stealth Monocromática**: Fondo oscuro profundo (`#09090b`), bordes sutiles de precisión (`#23232b`) y botones de acento blanco sólido.
- **Sin cuentas demo ni atajos**: Flujo real de enrolamiento, verificación de transferencias bancarias y habilitación manual o automática.
- **División de Rutina por Días (hasta 6 días)**: Título de enfoque por día, ejercicios estructurados, series x reps y especificaciones de máquinas a utilizar.
- **Tachado Interactivo `<SpringCheck />`**: Animación de resorte y tachado para marcar los ejercicios realizados en sala durante el entrenamiento.
- **Sobrecarga Progresiva**: Módulo de seguimiento de pesos semana tras semana (press banca, sentadilla, bíceps, peso muerto, etc.) con cálculo de marcas personales (PRs).

---

## 🔑 Credenciales de Acceso

| Rol | Usuario / Identificador | Contraseña | Panel Asignado |
| :--- | :--- | :--- | :--- |
| **Profesor / Administrador** | `e22gym` | `admin123` | `/dashboard/profesor` |
| **Alumnos / Socios** | `Número de DNI` | Clave elegida al registrarse | `/dashboard/alumno` |

---

## 🛠️ Módulos Principales

### 1. Portal de Acceso e Inscripción (`/`)
- **Ingreso Unificado (Sign In)**: Acceso para el administrador (`e22gym`) y socios mediante su DNI.
- **Registro de Nuevos Socios (Register)**:
  - Nombre, Apellido, DNI (utilizado como identificador de usuario) y Teléfono.
  - Contraseña personalizada.
  - **Ficha Médica Deportiva**: Declaración obligatoria de alergias y patologías/lesiones preexistentes que alertan al profesor en su panel.
  - Los alumnos inician con estado de cuota `pendiente` hasta registrar y validar su primer pago.

### 2. Panel de Control del Entrenador (`/dashboard/profesor`)
- **Lista de Socios & Búsqueda Instantánea**:
  - Búsqueda en tiempo real por DNI o Nombre con el atajo de teclado `/`.
  - Filtros rápidos: *Todos*, *Al Día* (verde), *Pendientes* (ámbar), *Vencidos* (rojo).
  - Alertas médicas visibles en cada tarjeta de socio.
- **Métricas del Gimnasio**: Telemetría en vivo de socios activos, pendientes de cobro, vencidos y capacidad de sala.
- **Cola de Verificación de Pagos (`/dashboard/profesor/pagos`)**:
  - Bandeja de transferencias bancarias notificadas por los alumnos.
  - Aprobación con un solo clic: habilita al alumno inmediatamente y otorga **30 días de suscripción** a partir de ese momento.
- **Estudio de Rutinas por Días (`/dashboard/profesor/rutinas`)**:
  - Estructuración de rutinas en hasta **6 días como máximo** (`Día 1` a `Día 6`).
  - **Título / Enfoque por jornada**: Ej. *Día 1: Pecho y Tríceps*, *Día 2: Espalda y Bíceps*, *Día 3: Piernas - Cuádriceps*.
  - **Carga de Ejercicios**:
    - Grupo muscular (Pecho, Espalda, Piernas, Cadena Posterior, Hombros, Brazos/Core) o nombre libre.
    - Series y repeticiones estimadas con RPE.
    - **Máquina a utilizar y notaciones de equipo** (ej: *Máquina Smith - carga guiada*, *Polea alta con soga*, *Banco inclinado 30°*).
  - **Plantilla Oficial de 6 Días**: Botón con un clic para precargar una distribución completa de 6 días recomendada por E22.

### 3. Portal del Alumno (`/dashboard/alumno`)
- **Contador Regresivo de Membresía**:
  - Muestra en número gigante los **días restantes del ciclo de 30 días**.
  - Barra de progreso del mes y fecha exacta de vencimiento.
- **Ficha de Salud y Asistencia**: Visualización de patologías, alergias y días de entrenamiento semanal.
- **Planilla Interactiva de Rutina (`/dashboard/alumno/rutina`)**:
  - Bloques organizados por días de entrenamiento.
  - Componente `<SpringCheck />` para tachar cada ejercicio completado con efecto de resorte.
  - Notaciones de máquinas a utilizar destacadas en cada movimiento.
  - Persistencia en almacenamiento local para no perder el progreso del día.
  - **Exportación a PDF**: Generación de planilla oficial en formato PDF lista para imprimir o compartir mediante `jspdf` y `jspdf-autotable`.
- **Registro Semanal de Cargas (`/dashboard/alumno/progreso`)**:
  - Registro semana tras semana del peso (kg), repeticiones y notas técnicas en ejercicios fundamentales.
  - Badges de Récords Personales (PRs).
  - Tabla de evolución histórica con filtros por ejercicio.
- **Centro de Notificación de Pagos (`/dashboard/alumno/pagos`)**:
  - Datos bancarios oficiales: Alias (`E22.GYM.FIT`) y CBU con botón de copiado rápido.
  - Formulario para notificar el comprobante de transferencia y monto abonado.

---

## 🗄️ Arquitectura de Base de Datos (PostgreSQL)

Todo el sistema opera de manera aislada bajo el esquema `e22`:

```sql
-- Esquema E22
CREATE SCHEMA IF NOT EXISTS e22;

-- Tipo Enumerado de Roles
CREATE TYPE e22.rol_enum AS ENUM ('usuario', 'profesor');

-- Tabla de Usuarios y Socios
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

-- Tabla de Rutinas Asignadas
CREATE TABLE e22.rutinas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES e22.usuarios(id) ON DELETE CASCADE,
  profesor_id INTEGER REFERENCES e22.usuarios(id) ON DELETE SET NULL,
  titulo VARCHAR(150) NOT NULL,
  detalles TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Sobrecarga Progresiva (Cargas Semanales)
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

-- Tabla de Comprobantes y Pagos Notificados
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

## 🚀 Instalación y Puesta en Marcha

### Requisitos Previos
- **Node.js** v18 o superior.
- **PostgreSQL** v14 o superior en ejecución en `localhost:5432` (o servicio cloud).

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
Crea un archivo `.env.local` en la raíz del proyecto tomando como base `.env.example`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
```

### 4. Inicializar la Base de Datos
Ejecuta el script automatizado para crear el esquema `e22`, las tablas e insertar el usuario profesor administrador:
```bash
node scripts/rebuild_e22_database.js
```

### 5. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará lista en: **[http://localhost:3000](http://localhost:3000)**

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Iniciar sesión (admin `e22gym` o socio por DNI). |
| `POST` | `/api/auth/register` | Enrolar nuevo socio con ficha de salud. |
| `GET` | `/api/socios` | Lista de socios filtrada por estado y búsqueda por DNI. |
| `GET` | `/api/socios/[id]` | Perfil completo del socio (rutina, pagos, cargas). |
| `POST` | `/api/pagos/notificar` | Notificar comprobante de transferencia bancaria. |
| `GET` | `/api/pagos` | Lista de comprobantes pendientes o históricos. |
| `POST` | `/api/pagos/aprobar` | Aprobar cuota y otorgar 30 días de suscripción. |
| `GET` | `/api/rutinas` | Obtener rutina activa del socio. |
| `POST` | `/api/rutinas` | Crear o actualizar protocolo de rutina de hasta 6 días. |
| `GET` | `/api/progreso` | Consultar histórico de pesos y récords personales (PRs). |
| `POST` | `/api/progreso` | Registrar nueva carga semanal en un ejercicio. |
| `DELETE`| `/api/progreso` | Eliminar registro de carga. |

---

## 👥 Equipo y Créditos
- Desarrollado para **E22 GYM** — Centro de Alto Rendimiento & Fitness.
- Autor: [Nico Melgratti](https://github.com/NicoMelgratti).
