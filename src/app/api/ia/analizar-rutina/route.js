import { NextResponse } from 'next/server';
import { analizarRutinaConIA } from '@/lib/gemini';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

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
      let mimeType = file.type || '';
      const fileName = file.name || '';

      const isImage =
        mimeType.startsWith('image/') ||
        /\.(jpg|jpeg|png|webp|heic|bmp|gif)$/i.test(fileName);
      const isExcel =
        mimeType.includes('spreadsheet') ||
        mimeType.includes('excel') ||
        /\.(xlsx|xls|csv)$/i.test(fileName);

      if (isImage) {
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (/\.png$/i.test(fileName)) mimeType = 'image/png';
          else if (/\.webp$/i.test(fileName)) mimeType = 'image/webp';
          else mimeType = 'image/jpeg';
        }

        const base64 = buffer.toString('base64');
        const planilla = await analizarRutinaConIA({
          imagenBase64: base64,
          mimeType,
          nombreArchivo: fileName,
        });

        return NextResponse.json({
          ok: true,
          mensaje: planilla.advertencia || 'Imagen analizada con éxito.',
          planilla,
          advertencia: planilla.advertencia || null,
        });
      } else if (isExcel) {
        const planilla = await analizarRutinaConIA({
          excelBuffer: buffer,
          nombreArchivo: fileName,
        });

        return NextResponse.json({
          ok: true,
          mensaje: planilla.advertencia || 'Archivo Excel analizado con éxito.',
          planilla,
          advertencia: planilla.advertencia || null,
        });
      } else {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Formato de archivo no compatible. Sube una foto (JPG, PNG, WEBP) o una planilla Excel (.xlsx, .csv).',
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
      mensaje: planilla.advertencia || 'Rutina extraída exitosamente.',
      planilla,
      advertencia: planilla.advertencia || null,
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
