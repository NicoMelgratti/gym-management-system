import { NextResponse } from 'next/server';
import { query, calcularEstadoPago, diasRestantes } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const alumnoId = resolvedParams?.id;

    if (!alumnoId) {
      return NextResponse.json({ ok: false, error: 'ID de alumno no especificado.' }, { status: 400 });
    }

    const userRes = await query(
      `SELECT u.id, u.dni, u.nombre, u.apellido, u.email, u.telefono, u.rol_id, 
              r.nombre as rol_nombre, u.vencimiento_cuota, u.estado_pago,
              u.alergias, u.patologias, u.dias_asistencia, u.primer_pago_realizado
       FROM e22.usuarios u
       JOIN e22.roles r ON u.rol_id = r.id
       WHERE u.id = $1
       LIMIT 1;`,
      [alumnoId]
    );

    if (!userRes || userRes.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Alumno no encontrado.' }, { status: 404 });
    }

    const alumno = userRes.rows[0];
    alumno.nombre_completo = alumno.apellido ? `${alumno.nombre} ${alumno.apellido}` : alumno.nombre;
    alumno.estado_pago = alumno.vencimiento_cuota
      ? calcularEstadoPago(alumno.vencimiento_cuota)
      : 'rojo';
    alumno.dias_restantes = alumno.vencimiento_cuota
      ? diasRestantes(alumno.vencimiento_cuota)
      : 0;

    // Rutina asignada
    const rutinaRes = await query(
      `SELECT r.id, r.usuario_id, r.profesor_id, r.titulo, r.detalles, r.fecha_creacion,
              p.nombre as profesor_nombre, p.apellido as profesor_apellido
       FROM e22.rutinas r
       LEFT JOIN e22.usuarios p ON r.profesor_id = p.id
       WHERE r.usuario_id = $1
       ORDER BY r.id DESC
       LIMIT 1;`,
      [alumnoId]
    );

    const rutina = rutinaRes.rows.length > 0 ? rutinaRes.rows[0] : null;

    return NextResponse.json({
      ok: true,
      alumno,
      rutina,
    });
  } catch (error) {
    console.error('Error en GET /api/alumnos/[id]:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al consultar datos del socio E22.' },
      { status: 500 }
    );
  }
}
