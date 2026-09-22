import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parsePlanillaData, serializePlanillaData } from '@/lib/rutinas';

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

    if (res.rows.length === 0) {
      return NextResponse.json({
        ok: true,
        rutina: null,
      });
    }

    const rutina = res.rows[0];
    const planillaParsed = parsePlanillaData(rutina.detalles, rutina.titulo);

    return NextResponse.json({
      ok: true,
      rutina: {
        ...rutina,
        planilla: planillaParsed,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/rutinas:', error);
    return NextResponse.json({ ok: false, error: 'Error al consultar rutina.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      usuario_id,
      profesor_id,
      titulo,
      detalles,
      planilla, // Puede venir la planilla como objeto completo
    } = body;

    if (!usuario_id) {
      return NextResponse.json(
        { ok: false, error: 'usuario_id es obligatorio.' },
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

    // Si viene el objeto planilla estructurado, serializarlo
    let serializedDetalles = '';
    let finalTitulo = titulo || 'Planilla Técnica E22';

    if (planilla && typeof planilla === 'object') {
      serializedDetalles = serializePlanillaData(planilla);
      finalTitulo = planilla.objetivo || titulo || 'Planilla Técnica E22';
    } else if (typeof detalles === 'object') {
      serializedDetalles = serializePlanillaData(detalles);
      finalTitulo = detalles.objetivo || titulo || 'Planilla Técnica E22';
    } else if (typeof detalles === 'string') {
      // Verificar si es string JSON
      if (detalles.trim().startsWith('{')) {
        serializedDetalles = detalles.trim();
      } else {
        serializedDetalles = detalles;
      }
    }

    if (!serializedDetalles) {
      return NextResponse.json(
        { ok: false, error: 'Los detalles o ejercicios de la rutina son obligatorios.' },
        { status: 400 }
      );
    }

    // Verificar si ya existe rutina para el usuario
    const check = await query(
      `SELECT id, detalles FROM e22.rutinas WHERE usuario_id = $1 ORDER BY id DESC LIMIT 1;`,
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
        [finalTitulo, serializedDetalles, validProfesorId, rutinaId]
      );
      saved = updateRes.rows[0];
    } else {
      const insertRes = await query(
        `INSERT INTO e22.rutinas (usuario_id, profesor_id, titulo, detalles, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *;`,
        [usuario_id, validProfesorId, finalTitulo, serializedDetalles]
      );
      saved = insertRes.rows[0];
    }

    const parsed = parsePlanillaData(saved.detalles, saved.titulo);

    return NextResponse.json({
      ok: true,
      message: 'Planilla de entrenamiento guardada y asignada exitosamente.',
      rutina: {
        ...saved,
        planilla: parsed,
      },
    });
  } catch (error) {
    console.error('Error en POST /api/rutinas:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al guardar la rutina.' },
      { status: 500 }
    );
  }
}

// Endpoint PATCH para actualizar la asistencia (grilla de 30 días) directamente
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { usuario_id, dia, asistio, asistenciaDias } = body;

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'usuario_id es requerido.' }, { status: 400 });
    }

    const check = await query(
      `SELECT id, titulo, detalles FROM e22.rutinas WHERE usuario_id = $1 ORDER BY id DESC LIMIT 1;`,
      [usuario_id]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No hay rutina asignada para este alumno.' }, { status: 404 });
    }

    const rutina = check.rows[0];
    const planilla = parsePlanillaData(rutina.detalles, rutina.titulo);

    if (Array.isArray(asistenciaDias)) {
      planilla.asistenciaDias = asistenciaDias;
    } else if (dia !== undefined) {
      const setDias = new Set(planilla.asistenciaDias || []);
      if (asistio) {
        setDias.add(Number(dia));
      } else {
        setDias.delete(Number(dia));
      }
      planilla.asistenciaDias = Array.from(setDias).sort((a, b) => a - b);
    }

    const serialized = serializePlanillaData(planilla);

    const updateRes = await query(
      `UPDATE e22.rutinas
       SET detalles = $1, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *;`,
      [serialized, rutina.id]
    );

    return NextResponse.json({
      ok: true,
      message: 'Asistencia actualizada.',
      asistenciaDias: planilla.asistenciaDias,
      rutina: {
        ...updateRes.rows[0],
        planilla,
      },
    });
  } catch (error) {
    console.error('Error en PATCH /api/rutinas:', error);
    return NextResponse.json({ ok: false, error: 'Error al actualizar asistencia.' }, { status: 500 });
  }
}
