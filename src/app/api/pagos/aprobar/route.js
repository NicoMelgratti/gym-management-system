import { NextResponse } from 'next/server';
import { query, diasRestantes } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { usuario_id, pago_id } = body;

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'ID de usuario requerido.' }, { status: 400 });
    }

    // Calcular nueva fecha: 30 días a partir de hoy (o extender si ya estaba vigente)
    const userCheck = await query(
      `SELECT vencimiento_cuota FROM e22.usuarios WHERE id = $1;`,
      [usuario_id]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Socio no encontrado.' }, { status: 404 });
    }

    const currentVenc = userCheck.rows[0].vencimiento_cuota;
    const hoy = new Date();
    let base = hoy;

    if (currentVenc) {
      const vDate = new Date(currentVenc);
      if (vDate > hoy) base = vDate;
    }

    const nuevaFecha = new Date(base);
    nuevaFecha.setDate(nuevaFecha.getDate() + 30);
    const fechaStr = nuevaFecha.toISOString().split('T')[0];

    // 1. Actualizar usuario: habilitado = true, estado_pago = 'al_dia', vencimiento_cuota
    const userUpdate = await query(
      `UPDATE e22.usuarios
       SET habilitado = true,
           vencimiento_cuota = $1,
           estado_pago = 'al_dia'
       WHERE id = $2
       RETURNING id, dni, nombre, apellido, vencimiento_cuota, estado_pago, habilitado;`,
      [fechaStr, usuario_id]
    );

    // 2. Marcar pagos pendientes como aprobados
    if (pago_id) {
      await query(
        `UPDATE e22.pagos_notificados
         SET estado = 'aprobado', fecha_aprobacion = CURRENT_TIMESTAMP
         WHERE id = $1;`,
        [pago_id]
      );
    } else {
      await query(
        `UPDATE e22.pagos_notificados
         SET estado = 'aprobado', fecha_aprobacion = CURRENT_TIMESTAMP
         WHERE usuario_id = $1 AND estado = 'pendiente';`,
        [usuario_id]
      );
    }

    const updatedUser = userUpdate.rows[0];
    updatedUser.dias_restantes = diasRestantes(updatedUser.vencimiento_cuota);

    return NextResponse.json({
      ok: true,
      message: `¡Pago verificado y aceptado! Socio habilitado con 30 días de suscripción hasta el ${fechaStr}.`,
      socio: updatedUser,
    });
  } catch (error) {
    console.error('Error en /api/pagos/aprobar:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al aprobar el pago.' },
      { status: 500 }
    );
  }
}
