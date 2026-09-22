import { NextResponse } from 'next/server';
import { query, calcularEstadoPago, diasRestantes } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('dni') || '';

    let sql = `
      SELECT u.id, u.dni, u.nombre, u.apellido, u.email, u.telefono, u.rol_id, 
             r.nombre as rol_nombre, u.vencimiento_cuota, u.estado_pago,
             u.alergias, u.patologias, u.dias_asistencia, u.primer_pago_realizado,
             (SELECT titulo FROM e22.rutinas WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1) as rutina_titulo,
             (SELECT id FROM e22.rutinas WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1) as rutina_id
      FROM e22.usuarios u
      JOIN e22.roles r ON u.rol_id = r.id
      WHERE r.nombre = 'alumno'
    `;
    const params = [];

    if (search.trim() !== '') {
      sql += ` AND (u.dni ILIKE $1 OR u.nombre ILIKE $1 OR u.apellido ILIKE $1 OR u.telefono ILIKE $1)`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` ORDER BY u.primer_pago_realizado DESC, u.nombre ASC;`;

    const result = await query(sql, params);

    const alumnos = (result.rows || []).map((alumno) => {
      const estadoCalculado = alumno.vencimiento_cuota
        ? calcularEstadoPago(alumno.vencimiento_cuota)
        : 'rojo';
      const dias = diasRestantes(alumno.vencimiento_cuota);

      return {
        ...alumno,
        nombre_completo: alumno.apellido ? `${alumno.nombre} ${alumno.apellido}` : alumno.nombre,
        estado_pago: estadoCalculado,
        dias_restantes: dias,
      };
    });

    return NextResponse.json({
      ok: true,
      alumnos,
      total: alumnos.length,
    });
  } catch (error) {
    console.error('Error en GET /api/alumnos:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al obtener listado de alumnos de E22.' },
      { status: 500 }
    );
  }
}
