import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const estado = searchParams.get('estado'); // 'pendiente' | 'aprobado' | 'todos'

    let sql = `
      SELECT p.*, u.nombre, u.apellido, u.dni, u.email, u.telefono
      FROM e22.pagos_notificados p
      JOIN e22.usuarios u ON p.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (usuario_id) {
      params.push(usuario_id);
      sql += ` AND p.usuario_id = $${params.length}`;
    }

    if (estado && estado !== 'todos') {
      params.push(estado);
      sql += ` AND p.estado = $${params.length}`;
    }

    sql += ` ORDER BY p.fecha DESC, p.id DESC;`;

    const res = await query(sql, params);

    return NextResponse.json({
      ok: true,
      pagos: res.rows,
    });
  } catch (error) {
    console.error('Error en GET /api/pagos:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al consultar el registro de pagos.' },
      { status: 500 }
    );
  }
}
