import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parsePlanillaData } from '@/lib/rutinas';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { usuario_id, tipo } = body; // tipo: 'profesor' | 'alumno'

    if (!usuario_id || !tipo) {
      return NextResponse.json(
        { ok: false, error: 'usuario_id y tipo (profesor o alumno) son requeridos.' },
        { status: 400 }
      );
    }

    // Verificar que exista la rutina que se desea activar
    const check = await query(
      `SELECT id, titulo, detalles, origen FROM e22.rutinas
       WHERE usuario_id = $1 AND (origen = $2 OR (origen IS NULL AND $2 = 'profesor'))
       ORDER BY id DESC LIMIT 1;`,
      [usuario_id, tipo]
    );

    if (check.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: `No se encontró una rutina de tipo ${tipo} para activar.` },
        { status: 404 }
      );
    }

    const targetId = check.rows[0].id;

    // Desactivar todas y activar la elegida
    await query(
      `UPDATE e22.rutinas SET es_activa = (id = $1) WHERE usuario_id = $2;`,
      [targetId, usuario_id]
    );

    const parsed = parsePlanillaData(check.rows[0].detalles, check.rows[0].titulo);

    return NextResponse.json({
      ok: true,
      message: `Rutina de ${tipo === 'alumno' ? 'tu autoría (Personal)' : 'Profesor'} establecida como activa.`,
      activa: tipo,
      rutina_activa: {
        ...check.rows[0],
        es_activa: true,
        planilla: parsed,
      },
    });
  } catch (error) {
    console.error('Error en POST /api/rutinas/activar:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al cambiar la rutina activa.' },
      { status: 500 }
    );
  }
}
