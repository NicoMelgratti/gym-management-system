import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parsePlanillaData, serializePlanillaData } from '@/lib/rutinas';

export const dynamic = 'force-dynamic';

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
       ORDER BY r.es_activa DESC, r.id DESC;`,
      [usuario_id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({
        ok: true,
        rutina: null,
        rutina_activa: null,
        rutina_profesor: null,
        rutina_alumno: null,
        activa: null,
      });
    }

    let rutinaProfesor = null;
    let rutinaAlumno = null;
    let rutinaActiva = null;

    for (const r of res.rows) {
      const parsedPlanilla = parsePlanillaData(r.detalles, r.titulo);
      const obj = {
        ...r,
        planilla: parsedPlanilla,
      };

      if (r.origen === 'alumno') {
        if (!rutinaAlumno) rutinaAlumno = obj;
      } else {
        if (!rutinaProfesor) rutinaProfesor = obj;
      }

      if (r.es_activa && !rutinaActiva) {
        rutinaActiva = obj;
      }
    }

    // Si ninguna está marcada como activa, tomar la primera
    if (!rutinaActiva) {
      rutinaActiva = rutinaProfesor || rutinaAlumno || res.rows[0];
    }

    const activaTipo = rutinaActiva?.origen === 'alumno' ? 'alumno' : 'profesor';

    return NextResponse.json({
      ok: true,
      rutina: rutinaActiva,
      rutina_activa: rutinaActiva,
      rutina_profesor: rutinaProfesor,
      rutina_alumno: rutinaAlumno,
      activa: activaTipo,
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
      origen = 'profesor', // 'profesor' | 'alumno'
      titulo,
      detalles,
      planilla,
      hacer_activa = true,
    } = body;

    if (!usuario_id) {
      return NextResponse.json(
        { ok: false, error: 'usuario_id es obligatorio.' },
        { status: 400 }
      );
    }

    // Resolver profesor id real si es de origen profesor
    let validProfesorId = null;
    if (origen === 'profesor') {
      if (profesor_id) {
        const pCheck = await query(`SELECT id FROM e22.usuarios WHERE id = $1;`, [profesor_id]);
        if (pCheck.rows.length > 0) validProfesorId = pCheck.rows[0].id;
      }
      if (!validProfesorId) {
        const defProf = await query(`SELECT id FROM e22.usuarios WHERE rol = 'profesor' LIMIT 1;`);
        if (defProf.rows.length > 0) validProfesorId = defProf.rows[0].id;
      }
    }

    // Serializar detalles de planilla
    let serializedDetalles = '';
    let finalTitulo = titulo || (origen === 'alumno' ? 'Mi Rutina Personal E22' : 'Planilla Técnica E22');

    if (planilla && typeof planilla === 'object') {
      serializedDetalles = serializePlanillaData(planilla);
      finalTitulo = planilla.objetivo || titulo || finalTitulo;
    } else if (typeof detalles === 'object') {
      serializedDetalles = serializePlanillaData(detalles);
      finalTitulo = detalles.objetivo || titulo || finalTitulo;
    } else if (typeof detalles === 'string') {
      serializedDetalles = detalles.trim();
    }

    if (!serializedDetalles) {
      return NextResponse.json(
        { ok: false, error: 'Los detalles o ejercicios de la rutina son obligatorios.' },
        { status: 400 }
      );
    }

    // Regla: Solo puede existir 1 rutina de cada origen por alumno
    const check = await query(
      `SELECT id FROM e22.rutinas WHERE usuario_id = $1 AND (origen = $2 OR (origen IS NULL AND $2 = 'profesor')) ORDER BY id DESC LIMIT 1;`,
      [usuario_id, origen]
    );

    let saved;
    if (check.rows.length > 0) {
      const rutinaId = check.rows[0].id;
      const updateRes = await query(
        `UPDATE e22.rutinas
         SET titulo = $1, detalles = $2, profesor_id = $3, origen = $4, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *;`,
        [finalTitulo, serializedDetalles, validProfesorId, origen, rutinaId]
      );
      saved = updateRes.rows[0];
    } else {
      const insertRes = await query(
        `INSERT INTO e22.rutinas (usuario_id, profesor_id, titulo, detalles, origen, es_activa, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *;`,
        [usuario_id, validProfesorId, finalTitulo, serializedDetalles, origen, hacer_activa]
      );
      saved = insertRes.rows[0];
    }

    // Si se desea marcar como activa
    if (hacer_activa) {
      await query(
        `UPDATE e22.rutinas SET es_activa = (id = $1) WHERE usuario_id = $2;`,
        [saved.id, usuario_id]
      );
      saved.es_activa = true;
    }

    const parsed = parsePlanillaData(saved.detalles, saved.titulo);

    return NextResponse.json({
      ok: true,
      message: origen === 'alumno' ? 'Tu rutina personal ha sido guardada con éxito.' : 'Planilla asignada exitosamente.',
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

// Endpoint PATCH para actualizar la asistencia (grilla de 30 días)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { usuario_id, rutina_id, dia, asistio, asistenciaDias } = body;

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'usuario_id es requerido.' }, { status: 400 });
    }

    // Si se pasa rutina_id, actualizar esa; si no, actualizar la que está activa
    let check;
    if (rutina_id) {
      check = await query(`SELECT id, titulo, detalles FROM e22.rutinas WHERE id = $1 AND usuario_id = $2;`, [rutina_id, usuario_id]);
    } else {
      check = await query(
        `SELECT id, titulo, detalles FROM e22.rutinas WHERE usuario_id = $1 ORDER BY es_activa DESC, id DESC LIMIT 1;`,
        [usuario_id]
      );
    }

    if (check.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No se encontró rutina activa para este alumno.' }, { status: 404 });
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

// Endpoint DELETE para eliminar la rutina personal del alumno
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const tipo = searchParams.get('tipo'); // 'alumno'

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'usuario_id es requerido.' }, { status: 400 });
    }

    if (tipo !== 'alumno') {
      return NextResponse.json({ ok: false, error: 'Solo se permite eliminar la rutina personal del alumno.' }, { status: 400 });
    }

    await query(
      `DELETE FROM e22.rutinas WHERE usuario_id = $1 AND origen = 'alumno';`,
      [usuario_id]
    );

    // Reactivar la del profesor
    await query(
      `UPDATE e22.rutinas SET es_activa = true WHERE usuario_id = $1 AND (origen = 'profesor' OR origen IS NULL);`,
      [usuario_id]
    );

    return NextResponse.json({
      ok: true,
      message: 'Rutina personal eliminada. Se ha restaurado la rutina del profesor.',
    });
  } catch (error) {
    console.error('Error en DELETE /api/rutinas:', error);
    return NextResponse.json({ ok: false, error: 'Error al eliminar rutina.' }, { status: 500 });
  }
}
