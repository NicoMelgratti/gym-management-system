import { NextResponse } from 'next/server';
import { query, diasRestantes, estadoCuota } from '@/lib/db';
import { parsePlanillaData } from '@/lib/rutinas';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const socioId = resolvedParams?.id;

    if (!socioId) {
      return NextResponse.json({ ok: false, error: 'ID de socio no especificado.' }, { status: 400 });
    }

    // Datos del socio
    const userRes = await query(
      `SELECT id, username, dni, nombre, apellido, email, telefono, rol,
              vencimiento_cuota, estado_pago, habilitado, alergias, patologias,
              dias_asistencia, fecha_registro
       FROM e22.usuarios
       WHERE id = $1
       LIMIT 1;`,
      [socioId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Socio no encontrado.' }, { status: 404 });
    }

    const socio = userRes.rows[0];
    socio.nombre_completo = `${socio.nombre} ${socio.apellido || ''}`.trim();
    socio.dias_restantes = socio.vencimiento_cuota ? diasRestantes(socio.vencimiento_cuota) : 0;
    socio.estado_pago = estadoCuota(socio.vencimiento_cuota, socio.habilitado);

    // Rutinas asignadas (profesor y alumno)
    const rutinaRes = await query(
      `SELECT r.*, p.nombre as profesor_nombre, p.apellido as profesor_apellido
       FROM e22.rutinas r
       LEFT JOIN e22.usuarios p ON r.profesor_id = p.id
       WHERE r.usuario_id = $1
       ORDER BY r.es_activa DESC, r.id DESC;`,
      [socioId]
    );

    // Registros de peso recientes
    const pesoRes = await query(
      `SELECT * FROM e22.registros_peso
       WHERE usuario_id = $1
       ORDER BY fecha DESC
       LIMIT 10;`,
      [socioId]
    );

    // Pagos notificados recientes
    const pagosRes = await query(
      `SELECT * FROM e22.pagos_notificados
       WHERE usuario_id = $1
       ORDER BY fecha DESC
       LIMIT 5;`,
      [socioId]
    );

    let rutinaProfesor = null;
    let rutinaAlumno = null;
    let rutinaActiva = null;

    for (const r of rutinaRes.rows) {
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

    if (!rutinaActiva) {
      rutinaActiva = rutinaProfesor || rutinaAlumno || null;
    }

    const activaTipo = rutinaActiva ? (rutinaActiva.origen === 'alumno' ? 'alumno' : 'profesor') : null;

    return NextResponse.json({
      ok: true,
      socio,
      rutina: rutinaActiva,
      rutina_activa: rutinaActiva,
      rutina_profesor: rutinaProfesor,
      rutina_alumno: rutinaAlumno,
      activa: activaTipo,
      registros_peso: pesoRes.rows,
      pagos: pagosRes.rows,
    });
  } catch (error) {
    console.error('Error en GET /api/socios/[id]:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al consultar la ficha del socio.' },
      { status: 500 }
    );
  }
}
