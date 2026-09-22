import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const alumnoId = resolvedParams?.id;

    const res = await query(
      `SELECT r.*, p.nombre as profesor_nombre, p.apellido as profesor_apellido
       FROM e22.rutinas r
       LEFT JOIN e22.usuarios p ON r.profesor_id = p.id
       WHERE r.usuario_id = $1
       ORDER BY r.id DESC
       LIMIT 1;`,
      [alumnoId]
    );

    return NextResponse.json({
      ok: true,
      rutina: res.rows.length > 0 ? res.rows[0] : null,
    });
  } catch (error) {
    console.error('Error en GET rutina:', error);
    return NextResponse.json({ ok: false, error: 'Error al consultar rutina.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const alumnoId = resolvedParams?.id;
    const body = await request.json();
    const { titulo, detalles, profesor_id = 1 } = body;

    if (!titulo || !detalles) {
      return NextResponse.json(
        { ok: false, error: 'Título y detalles de la rutina son obligatorios.' },
        { status: 400 }
      );
    }

    // Validar que el profesor_id exista realmente en e22.usuarios (rol_id = 2) o buscar el profesor activo
    let validProfesorId = null;
    if (profesor_id) {
      const profCheck = await query(
        `SELECT id FROM e22.usuarios WHERE id = $1;`,
        [profesor_id]
      );
      if (profCheck.rows.length > 0) {
        validProfesorId = profCheck.rows[0].id;
      }
    }

    if (!validProfesorId) {
      const defaultProf = await query(
        `SELECT id FROM e22.usuarios WHERE rol_id = 2 LIMIT 1;`
      );
      if (defaultProf.rows.length > 0) {
        validProfesorId = defaultProf.rows[0].id;
      }
    }

    // Verificar si ya existe una rutina para este alumno
    const checkRes = await query(
      `SELECT id FROM e22.rutinas WHERE usuario_id = $1 ORDER BY id DESC LIMIT 1;`,
      [alumnoId]
    );

    let savedRutina;
    if (checkRes.rows.length > 0) {
      const rutinaId = checkRes.rows[0].id;
      const updateRes = await query(
        `UPDATE e22.rutinas
         SET titulo = $1, detalles = $2, profesor_id = $3, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *;`,
        [titulo, detalles, validProfesorId, rutinaId]
      );
      savedRutina = updateRes.rows[0];
    } else {
      const insertRes = await query(
        `INSERT INTO e22.rutinas (usuario_id, profesor_id, titulo, detalles, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *;`,
        [alumnoId, validProfesorId, titulo, detalles]
      );
      savedRutina = insertRes.rows[0];
    }

    return NextResponse.json({
      ok: true,
      message: 'Rutina guardada y asignada exitosamente.',
      rutina: savedRutina,
    });
  } catch (error) {
    console.error('Error en POST /api/alumnos/[id]/rutina:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al guardar la rutina del alumno.' },
      { status: 500 }
    );
  }
}
