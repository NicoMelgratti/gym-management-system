import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { consultarCoachVirtual } from '@/lib/gemini';
import { parsePlanillaData } from '@/lib/rutinas';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, usuario_id, rutinaActual: rutinaPasada } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { ok: false, error: 'El mensaje o pregunta no puede estar vacío.' },
        { status: 400 }
      );
    }

    let rutinaParaIA = rutinaPasada;
    let alumnoNombre = 'Alumno E22';

    // Si tenemos usuario_id, buscar su nombre y su rutina actual en PostgreSQL
    if (usuario_id) {
      const userRes = await query(
        `SELECT nombre, apellido FROM e22.usuarios WHERE id = $1 LIMIT 1;`,
        [usuario_id]
      );
      if (userRes.rows.length > 0) {
        alumnoNombre = `${userRes.rows[0].nombre} ${userRes.rows[0].apellido || ''}`.trim();
      }

      if (!rutinaParaIA) {
        const rutinaRes = await query(
          `SELECT titulo, detalles FROM e22.rutinas WHERE usuario_id = $1 ORDER BY id DESC LIMIT 1;`,
          [usuario_id]
        );
        if (rutinaRes.rows.length > 0) {
          rutinaParaIA = parsePlanillaData(
            rutinaRes.rows[0].detalles,
            rutinaRes.rows[0].titulo
          );
        }
      }
    }

    const respuesta = await consultarCoachVirtual({
      prompt: prompt.trim(),
      rutinaActual: rutinaParaIA || 'El alumno aún no tiene rutina cargada en el sistema.',
      alumnoNombre,
    });

    return NextResponse.json({
      ok: true,
      respuesta,
    });
  } catch (error) {
    console.error('Error en /api/ia/coach:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Error al consultar al Coach Virtual con Gemini.',
      },
      { status: 500 }
    );
  }
}
