import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query('SELECT clave, valor, fecha_actualizacion FROM e22.configuracion;');
    
    const configMap = {};
    for (const row of res.rows) {
      configMap[row.clave] = row.valor;
    }

    return NextResponse.json({
      ok: true,
      configuracion: configMap,
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al consultar configuración del gimnasio.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Soportar actualización individual { clave, valor }
    if (body.clave && body.valor !== undefined) {
      await query(
        `INSERT INTO e22.configuracion (clave, valor, fecha_actualizacion)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (clave) DO UPDATE
         SET valor = EXCLUDED.valor, fecha_actualizacion = CURRENT_TIMESTAMP;`,
        [body.clave, JSON.stringify(body.valor)]
      );

      return NextResponse.json({
        ok: true,
        mensaje: `Configuración de ${body.clave} actualizada con éxito.`,
      });
    }

    // O actualización masiva { precios, horarios, datos_bancarios }
    const keys = ['precios', 'horarios', 'datos_bancarios'];
    let updatedCount = 0;

    for (const key of keys) {
      if (body[key] !== undefined) {
        await query(
          `INSERT INTO e22.configuracion (clave, valor, fecha_actualizacion)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (clave) DO UPDATE
           SET valor = EXCLUDED.valor, fecha_actualizacion = CURRENT_TIMESTAMP;`,
          [key, JSON.stringify(body[key])]
        );
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      return NextResponse.json(
        { ok: false, error: 'No se enviaron claves válidas para actualizar.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: 'Configuración general actualizada exitosamente.',
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al actualizar configuración en la base de datos.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  return POST(request);
}
