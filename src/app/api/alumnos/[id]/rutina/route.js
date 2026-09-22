import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parsePlanillaData, serializePlanillaData } from '@/lib/rutinas';

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
    console.error('Error en GET rutina:', error);
    return NextResponse.json({ ok: false, error: 'Error al consultar rutina.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const alumnoId = resolvedParams?.id;
    const body = await request.json();
    const { titulo, detalles, planilla, profesor_id } = body;

    let serializedDetalles = '';
    let finalTitulo = titulo || 'Planilla Técnica E22';

    if (planilla && typeof planilla === 'object') {
      serializedDetalles = serializePlanillaData(planilla);
      finalTitulo = planilla.objetivo || titulo || 'Planilla Técnica E22';
    } else if (typeof detalles === 'object') {
      serializedDetalles = serializePlanillaData(detalles);
      finalTitulo = detalles.objetivo || titulo || 'Planilla Técnica E22';
    } else if (typeof detalles === 'string') {
      serializedDetalles = detalles;
    }

    if (!serializedDetalles) {
      return NextResponse.json(
        { ok: false, error: 'Título y detalles de la rutina son obligatorios.' },
        { status: 400 }
      );
    }

    // Validar profesor
    let validProfesorId = null;
    if (profesor_id) {
      const profCheck = await query(`SELECT id FROM e22.usuarios WHERE id = $1;`, [profesor_id]);
      if (profCheck.rows.length > 0) validProfesorId = profCheck.rows[0].id;
    }
    if (!validProfesorId) {
      const defaultProf = await query(`SELECT id FROM e22.usuarios WHERE rol = 'profesor' LIMIT 1;`);
      if (defaultProf.rows.length > 0) validProfesorId = defaultProf.rows[0].id;
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
        [finalTitulo, serializedDetalles, validProfesorId, rutinaId]
      );
      savedRutina = updateRes.rows[0];
    } else {
      const insertRes = await query(
        `INSERT INTO e22.rutinas (usuario_id, profesor_id, titulo, detalles, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *;`,
        [alumnoId, validProfesorId, finalTitulo, serializedDetalles]
      );
      savedRutina = insertRes.rows[0];
    }

    const parsed = parsePlanillaData(savedRutina.detalles, savedRutina.titulo);

    return NextResponse.json({
      ok: true,
      message: 'Rutina guardada y asignada exitosamente.',
      rutina: {
        ...savedRutina,
        planilla: parsed,
      },
    });
  } catch (error) {
    console.error('Error en POST /api/alumnos/[id]/rutina:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al guardar la rutina del alumno.' },
      { status: 500 }
    );
  }
}
