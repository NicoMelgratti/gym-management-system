import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'usuario_id es requerido.' }, { status: 400 });
    }

    const res = await query(
      `SELECT id, usuario_id, ejercicio, peso_kg, repeticiones, semana, notas, fecha
       FROM e22.registros_peso
       WHERE usuario_id = $1
       ORDER BY fecha DESC, id DESC;`,
      [usuario_id]
    );

    // Obtener máximos pesos por ejercicio para telemetría
    const prRes = await query(
      `SELECT ejercicio, MAX(peso_kg) as max_peso, COUNT(*) as total_sesiones
       FROM e22.registros_peso
       WHERE usuario_id = $1
       GROUP BY ejercicio;`,
      [usuario_id]
    );

    return NextResponse.json({
      ok: true,
      registros: res.rows,
      records: prRes.rows,
    });
  } catch (error) {
    console.error('Error en GET /api/progreso:', error);
    return NextResponse.json({ ok: false, error: 'Error al consultar progresos.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { usuario_id, ejercicio, peso_kg, repeticiones = 10, semana = 1, notas = '' } = body;

    if (!usuario_id || !ejercicio || peso_kg === undefined || peso_kg === null) {
      return NextResponse.json(
        { ok: false, error: 'usuario_id, ejercicio y peso_kg son requeridos.' },
        { status: 400 }
      );
    }

    const insertRes = await query(
      `INSERT INTO e22.registros_peso (usuario_id, ejercicio, peso_kg, repeticiones, semana, notas, fecha)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [
        usuario_id,
        ejercicio.trim(),
        Number(peso_kg),
        Number(repeticiones) || 10,
        Number(semana) || 1,
        notas.trim(),
      ]
    );

    return NextResponse.json({
      ok: true,
      message: `Carga registrada: ${peso_kg} kg en ${ejercicio}.`,
      registro: insertRes.rows[0],
    });
  } catch (error) {
    console.error('Error en POST /api/progreso:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al registrar la carga.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID de registro requerido.' }, { status: 400 });
    }

    await query(`DELETE FROM e22.registros_peso WHERE id = $1;`, [id]);

    return NextResponse.json({ ok: true, message: 'Registro eliminado correctamente.' });
  } catch (error) {
    console.error('Error en DELETE /api/progreso:', error);
    return NextResponse.json({ ok: false, error: 'Error al eliminar el registro.' }, { status: 500 });
  }
}
