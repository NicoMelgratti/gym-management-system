import { NextResponse } from 'next/server';
import { analizarRutinaConIA } from '@/lib/gemini';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Opción A: multipart/form-data (subida directa de archivo)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { ok: false, error: 'No se ha adjuntado ningún archivo.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'application/octet-stream';
      const fileName = file.name || '';

      // Si es imagen (JPG, PNG, WEBP, etc.)
      if (mimeType.startsWith('image/')) {
        const base64 = buffer.toString('base64');
        const planilla = await analizarRutinaConIA({
          imagenBase64: base64,
          mimeType,
          nombreArchivo: fileName,
        });

        return NextResponse.json({
          ok: true,
          mensaje: 'Imagen analizada con éxito por Gemini.',
          planilla,
        });
      }
      // Si es Excel o CSV
      else if (
        mimeType.includes('spreadsheet') ||
        mimeType.includes('excel') ||
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls') ||
        fileName.endsWith('.csv')
      ) {
        const planilla = await analizarRutinaConIA({
          excelBuffer: buffer,
          nombreArchivo: fileName,
        });

        return NextResponse.json({
          ok: true,
          mensaje: 'Archivo Excel analizado con éxito por Gemini.',
          planilla,
        });
      } else {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Formato de archivo no compatible. Sube una foto (JPG, PNG) o una planilla Excel (.xlsx, .csv).',
          },
          { status: 400 }
        );
      }
    }

    // Opción B: application/json con base64
    const body = await request.json();
    const { imagenBase64, mimeType = 'image/jpeg', nombreArchivo } = body;

    if (!imagenBase64) {
      return NextResponse.json(
        { ok: false, error: 'Debes proporcionar imagenBase64 en el cuerpo JSON.' },
        { status: 400 }
      );
    }

    const planilla = await analizarRutinaConIA({
      imagenBase64,
      mimeType,
      nombreArchivo,
    });

    return NextResponse.json({
      ok: true,
      mensaje: 'Rutina extraída exitosamente con IA.',
      planilla,
    });
  } catch (error) {
    console.error('Error en /api/ia/analizar-rutina:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Error al procesar el archivo con Gemini.',
      },
      { status: 500 }
    );
  }
}
