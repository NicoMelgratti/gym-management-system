import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { usuario_id, metodo = 'transferencia', referencia = '', monto = 0 } = body;

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'ID de usuario requerido.' }, { status: 400 });
    }

    // Insertar notificación de pago pendiente
    const pagoRes = await query(
      `INSERT INTO e22.pagos_notificados (usuario_id, metodo, referencia, monto, estado, fecha)
       VALUES ($1, $2, $3, $4, 'pendiente', CURRENT_TIMESTAMP)
       RETURNING *;`,
      [usuario_id, metodo, referencia, monto || 0]
    );

    // Actualizar estado del socio a 'pendiente'
    await query(
      `UPDATE e22.usuarios
       SET estado_pago = 'pendiente'
       WHERE id = $1;`,
      [usuario_id]
    );

    return NextResponse.json({
      ok: true,
      message: 'Comprobante y notificación enviados al profesor para su verificación.',
      pago: pagoRes.rows[0],
    });
  } catch (error) {
    console.error('Error en /api/pagos/notificar:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al notificar el pago.' },
      { status: 500 }
    );
  }
}
