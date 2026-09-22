import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'usuario_id es requerido.' }, { status: 400 });
    }

    const res = await query(
      `SELECT r.*, p.nombre as profesor_nombre, p.apellido as profesor_apellido
       FROM e22.rutinas r
       LEFT JOIN e22.usuarios p ON r.profesor_id = p.id
       WHERE r.usuario_id = $1
       ORDER BY r.id DESC
       LIMIT 1;`,
      [usuario_id]
    );

    return NextResponse.json({
      ok: true,
      rutina: res.rows.length > 0 ? res.rows[0] : null,
    });
  } catch (error) {
    console.error('Error en GET /api/rutinas:', error);
    return NextResponse.json({ ok: false, error: 'Error al consultar rutina.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { usuario_id, profesor_id, titulo, detalles } = body;

    if (!usuario_id || !titulo || !detalles) {
      return NextResponse.json(
        { ok: false, error: 'usuario_id, título y detalles son obligatorios.' },
        { status: 400 }
      );
    }

    // Resolver profesor id real si se pasa o buscar el profesor
    let validProfesorId = null;
    if (profesor_id) {
      const pCheck = await query(`SELECT id FROM e22.usuarios WHERE id = $1;`, [profesor_id]);
      if (pCheck.rows.length > 0) validProfesorId = pCheck.rows[0].id;
    }
    if (!validProfesorId) {
      const defProf = await query(`SELECT id FROM e22.usuarios WHERE rol = 'profesor' LIMIT 1;`);
      if (defProf.rows.length > 0) validProfesorId = defProf.rows[0].id;
    }

    // Verificar si ya existe rutina para el usuario
    const check = await query(
      `SELECT id FROM e22.rutinas WHERE usuario_id = $1 ORDER BY id DESC LIMIT 1;`,
      [usuario_id]
    );

    let saved;
    if (check.rows.length > 0) {
      const rutinaId = check.rows[0].id;
      const updateRes = await query(
        `UPDATE e22.rutinas
         SET titulo = $1, detalles = $2, profesor_id = $3, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *;`,
        [titulo, detalles, validProfesorId, rutinaId]
      );
      saved = updateRes.rows[0];
    } else {
      const insertRes = await query(
        `INSERT INTO e22.rutinas (usuario_id, profesor_id, titulo, detalles, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *;`,
        [usuario_id, validProfesorId, titulo, detalles]
      );
      saved = insertRes.rows[0];
    }

    return NextResponse.json({
      ok: true,
      message: 'Rutina asignada exitosamente al socio.',
      rutina: saved,
    });
  } catch (error) {
    console.error('Error en POST /api/rutinas:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al guardar la rutina.' },
      { status: 500 }
    );
  }
}
