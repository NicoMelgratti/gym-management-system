import { NextResponse } from 'next/server';
import { query, calcularEstadoPago, diasRestantes } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const alumnoId = resolvedParams?.id;

    if (!alumnoId) {
      return NextResponse.json({ ok: false, error: 'ID de alumno inválido.' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { metodo = 'efectivo', meses = 1, fechaPersonalizada } = body;

    // Obtener fecha actual y fecha actual de vencimiento
    const userRes = await query(
      `SELECT id, vencimiento_cuota, estado_pago, primer_pago_realizado FROM e22.usuarios WHERE id = $1;`,
      [alumnoId]
    );

    if (!userRes || userRes.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Alumno no encontrado.' }, { status: 404 });
    }

    const currentVencimiento = userRes.rows[0].vencimiento_cuota;
    let nuevaFecha;

    if (fechaPersonalizada) {
      nuevaFecha = new Date(fechaPersonalizada);
    } else {
      const hoy = new Date();
      let fechaBase = hoy;

      // Si la cuota ya está vigente en el futuro, sumar 30 días a partir de esa fecha
      if (currentVencimiento) {
        const vDate = new Date(currentVencimiento);
        if (vDate > hoy) {
          fechaBase = vDate;
        }
      }

      // Son exactamente 30 días a partir del pago (o por cada mes abonado)
      nuevaFecha = new Date(fechaBase);
      nuevaFecha.setDate(nuevaFecha.getDate() + 30 * Number(meses));
    }

    const fechaStr = nuevaFecha.toISOString().split('T')[0];
    const nuevoEstado = 'verde';

    // Actualizar en esquema e22 marcando primer_pago_realizado = true
    const updateRes = await query(
      `UPDATE e22.usuarios
       SET vencimiento_cuota = $1, estado_pago = $2, primer_pago_realizado = true
       WHERE id = $3
       RETURNING id, dni, nombre, apellido, email, telefono, vencimiento_cuota,
                 estado_pago, alergias, patologias, dias_asistencia, primer_pago_realizado;`,
      [fechaStr, nuevoEstado, alumnoId]
    );

    const updatedUser = updateRes.rows[0];
    updatedUser.dias_restantes = diasRestantes(updatedUser.vencimiento_cuota);
    updatedUser.nombre_completo = updatedUser.apellido
      ? `${updatedUser.nombre} ${updatedUser.apellido}`
      : updatedUser.nombre;

    return NextResponse.json({
      ok: true,
      message: `¡Pago registrado exitosamente (${metodo})! 30 días de membresía activados hasta el ${fechaStr}.`,
      alumno: updatedUser,
    });
  } catch (error) {
    console.error('Error en POST /api/alumnos/[id]/pago:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al registrar el pago de la membresía en E22.' },
      { status: 500 }
    );
  }
}
