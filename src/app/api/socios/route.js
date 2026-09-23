import { NextResponse } from 'next/server';
import { query, diasRestantes, estadoCuota } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';

    let sql = `
      SELECT u.id, u.username, u.dni, u.nombre, u.apellido, u.email, u.telefono,
             u.rol, u.vencimiento_cuota, u.estado_pago, u.habilitado,
             u.alergias, u.patologias, u.dias_asistencia, u.fecha_registro,
             (SELECT titulo FROM e22.rutinas WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1) as rutina_titulo,
             (SELECT id FROM e22.rutinas WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1) as rutina_id,
             (SELECT COUNT(*) FROM e22.pagos_notificados WHERE usuario_id = u.id AND estado = 'pendiente') as pagos_pendientes_count,
             (SELECT id FROM e22.pagos_notificados WHERE usuario_id = u.id AND estado = 'pendiente' ORDER BY id DESC LIMIT 1) as ultimo_pago_pendiente_id
      FROM e22.usuarios u
      WHERE u.rol = 'usuario'
    `;
    const params = [];

    if (search.trim() !== '') {
      sql += ` AND (u.dni ILIKE $1 OR u.nombre ILIKE $1 OR u.apellido ILIKE $1 OR u.telefono ILIKE $1)`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` ORDER BY u.fecha_registro DESC;`;

    const result = await query(sql, params);

    const socios = (result.rows || []).map((s) => {
      const dias = s.vencimiento_cuota ? diasRestantes(s.vencimiento_cuota) : 0;
      const estado = estadoCuota(s.vencimiento_cuota, s.habilitado);

      return {
        ...s,
        nombre_completo: `${s.nombre} ${s.apellido || ''}`.trim(),
        dias_restantes: dias,
        estado_pago: estado,
        tiene_pago_pendiente: Number(s.pagos_pendientes_count) > 0,
      };
    });

    // Aplicar filtro si se especificó
    let filteredSocios = socios;
    if (filter === 'al_dia') {
      filteredSocios = socios.filter((s) => s.habilitado && s.estado_pago === 'al_dia');
    } else if (filter === 'pendiente') {
      filteredSocios = socios.filter((s) => !s.habilitado || s.tiene_pago_pendiente || s.estado_pago === 'pendiente');
    } else if (filter === 'vencido') {
      filteredSocios = socios.filter((s) => s.estado_pago === 'vencido' || s.estado_pago === 'atrasado');
    }

    // Métricas del gimnasio
    const activeCount = socios.filter((s) => s.habilitado && s.estado_pago === 'al_dia').length;
    const pendingCount = socios.filter((s) => !s.habilitado || s.tiene_pago_pendiente).length;
    const expiredCount = socios.filter((s) => s.estado_pago === 'vencido' || s.estado_pago === 'atrasado').length;

    return NextResponse.json({
      ok: true,
      socios: filteredSocios,
      total: socios.length,
      metrics: {
        active: activeCount,
        pending: pendingCount,
        expired: expiredCount,
        capacityThreshold: '78% Optimal',
      },
    });
  } catch (error) {
    console.error('Error en GET /api/socios:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al consultar la lista de socios.' },
      { status: 500 }
    );
  }
}
