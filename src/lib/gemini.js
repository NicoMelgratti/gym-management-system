import * as XLSX from 'xlsx';
import { DEFAULT_BLOQUES, DEFAULT_PLANILLA_FISICA_E22 } from './rutinas';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-2.5-pro',
  'gemini-pro-latest',
];

/**
 * Realiza una llamada a la API de Gemini probando modelos en orden con reintentos y timeout de 12s.
 */
export async function llamarGemini({ contents, systemInstruction }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const payload = {
        contents,
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          modelUsado: model,
          texto: data.candidates[0].content.parts[0].text,
        };
      }

      const msg = data.error?.message || `HTTP ${res.status}`;
      lastError = new Error(`Modelo ${model}: ${msg}`);
      console.warn(`[Gemini Warning] ${model}:`, msg);
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.warn(`[Gemini Error] ${model}:`, err.message);
    }
  }

  throw lastError || new Error('Los servidores de Google Gemini están experimentando alta demanda (503).');
}

/**
 * Limpia y parsea un bloque JSON retornado por un LLM
 */
function extraerJSON(texto) {
  if (!texto) return null;

  // Remover bloques de código markdown ```json ... ```
  let limpio = texto.trim();
  limpio = limpio.replace(/^```(?:json)?\s*/i, '');
  limpio = limpio.replace(/\s*```$/i, '');
  limpio = limpio.trim();

  // Buscar el primer { y el último }
  const primerBrace = limpio.indexOf('{');
  const ultimoBrace = limpio.lastIndexOf('}');

  if (primerBrace !== -1 && ultimoBrace !== -1 && ultimoBrace > primerBrace) {
    limpio = limpio.substring(primerBrace, ultimoBrace + 1);
  }

  return JSON.parse(limpio);
}

/**
 * Analiza una imagen (foto de rutina en papel escrita a mano o impresa)
 * o un archivo Excel/CSV y devuelve una PlanillaE22 normalizada.
 */
export async function analizarRutinaConIA({
  imagenBase64,
  mimeType = 'image/jpeg',
  excelBuffer,
  nombreArchivo = '',
}) {
  let promptTexto = '';
  const parts = [];

  const SYSTEM_PROMPT = `Eres un entrenador de gimnasio experto y analista de datos deportivos del Centro de Alto Rendimiento E22 GYM.
Tu misión es analizar la rutina de entrenamiento proporcionada (ya sea una foto de una hoja física escrita a mano/impresa o datos de Excel) y extraerla con TOTAL PRECISIÓN en un formato JSON estructurado oficial de E22.

DEBES RESPONDER EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO (sin explicaciones antes ni después) con el siguiente schema exacto:
{
  "planNumero": "1",
  "objetivo": "Título u objetivo de la rutina (ej: 'Variación de cargas múltiples – OBJETIVO: Aumentar masa muscular y fuerza')",
  "indicacionPrevia": "Indicación de calentamiento, core o notas previas (ej: 'PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA DE CORE/MOVILIDAD')",
  "bloques": [
    { "id": 1, "fecha": "Hasta: 15/04", "rir": "RIR: 3" },
    { "id": 2, "fecha": "Hasta: 29/04", "rir": "RIR: 2" },
    { "id": 3, "fecha": "Hasta: 06/05", "rir": "RIR: 4" },
    { "id": 4, "fecha": "Hasta: 20/05", "rir": "RIR: 0" }
  ],
  "dias": [
    {
      "dia": 1,
      "enfoque": "Día 1",
      "ejercicios": [
        {
          "nombre": "Nombre exacto del ejercicio escrito por el profesor (ej: 'Empuje 2 BB C/Mancuernas')",
          "valores": [
            { "kg": "", "r": "4", "s": "4" },
            { "kg": "", "r": "3", "s": "4" },
            { "kg": "", "r": "3", "s": "3" },
            { "kg": "", "r": "2", "s": "4" }
          ]
        }
      ]
    }
  ]
}

Reglas importantes:
1. En "ejercicios", escribe el nombre exacto que se lee en el papel o Excel (ej: "Sentadillas frontales C/Barra", "Press banco plano", "Dominadas", etc.).
2. Si la hoja tiene 4 columnas de etapas/fechas y RIR (como la planilla E22), extrae cada una en "bloques" y rellena los valores de reps ("r") y series ("s") para cada etapa.
3. Si es una rutina tradicional que solo tiene series y repeticiones simples (ej: "4x10"), distribúyelas consistentemente en los 4 bloques con los valores indicados.
4. Mantén los días separados ordenadamente (Día 1, Día 2, Día 3...).
5. Responde ÚNICAMENTE el JSON.`;

  // Caso 1: Imagen en base64
  if (imagenBase64) {
    const cleanBase64 = imagenBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      text: 'Analiza la foto de esta planilla física de entrenamiento de gimnasio. Lee los textos escritos a mano o impresos, los días, ejercicios, series, repeticiones y etapas de progresión. Devuelve el JSON estructurado solicitado.',
    });
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: cleanBase64,
      },
    });
  }
  // Caso 2: Archivo Excel o CSV
  else if (excelBuffer) {
    try {
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
      let excelTexto = '';

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        excelTexto += `--- HOJA: ${sheetName} ---\n${csv}\n\n`;
      });

      parts.push({
        text: `Analiza la siguiente tabla extraída de un archivo Excel de entrenamiento:\n\n${excelTexto}\n\nExtrae los días, ejercicios, series y repeticiones y conviértelos al JSON estructurado oficial de E22.`,
      });
    } catch (excelErr) {
      throw new Error(`Error al leer el archivo Excel: ${excelErr.message}`);
    }
  } else {
    throw new Error('Debes proporcionar una imagen o un archivo Excel para analizar.');
  }

  const { texto } = await llamarGemini({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{ parts }],
  });

  try {
    const parsed = extraerJSON(texto);
    if (!parsed || !Array.isArray(parsed.dias)) {
      throw new Error('El formato devuelto por la IA no contiene una lista válida de días.');
    }

    // Normalizar la salida para que encaje 100% con la Planilla E22
    const bloquesFinales =
      Array.isArray(parsed.bloques) && parsed.bloques.length > 0
        ? parsed.bloques
        : DEFAULT_BLOQUES;

    const diasNormalizados = parsed.dias.map((d, dIdx) => ({
      dia: d.dia || dIdx + 1,
      enfoque: d.enfoque || `Día ${dIdx + 1}`,
      ejercicios: (d.ejercicios || []).map((ex, eIdx) => ({
        id: `ia_d${dIdx + 1}_e${eIdx + 1}_${Date.now()}`,
        nombre: ex.nombre || `Ejercicio ${eIdx + 1}`,
        valores: bloquesFinales.map((_, bIdx) => {
          const val = ex.valores?.[bIdx];
          return {
            kg: val?.kg ? String(val.kg) : '',
            r: val?.r ? String(val.r) : val?.reps ? String(val.reps) : '10',
            s: val?.s ? String(val.s) : val?.series ? String(val.series) : '4',
          };
        }),
      })),
    }));

    return {
      version: '2.0',
      tipo: 'tecnica_e22',
      planNumero: parsed.planNumero || '1',
      objetivo: parsed.objetivo || 'Planilla de Entrenamiento Digitalizada por IA E22',
      indicacionPrevia:
        parsed.indicacionPrevia || DEFAULT_PLANILLA_FISICA_E22.indicacionPrevia,
      bloques: bloquesFinales,
      dias: diasNormalizados,
      asistenciaDias: [],
    };
  } catch (parseError) {
    // Si era un archivo Excel y la IA falló o dio 503, procesar localmente con XLSX
    if (excelBuffer) {
      console.warn('Utilizando parser local de contingencia para Excel...');
      return extraerPlanillaDesdeExcelLocal(excelBuffer, nombreArchivo);
    }
    console.error('Error parseando JSON de Gemini:', parseError, 'Texto recibido:', texto);
    throw new Error('La IA no pudo estructurar la información del archivo. Asegúrate de que la foto esté bien iluminada y nítida, o sube un archivo Excel/CSV.');
  }
}

/**
 * Parser de contingencia para archivos Excel/CSV en caso de falla o demanda alta de la API.
 */
export function extraerPlanillaDesdeExcelLocal(excelBuffer, nombreArchivo = '') {
  try {
    const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
    const dias = [];

    workbook.SheetNames.forEach((sheetName, sIdx) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      const ejercicios = [];

      rows.forEach((row, rIdx) => {
        if (!Array.isArray(row) || row.length === 0) return;
        const primeraCelda = String(row[0] || '').trim();
        const segundaCelda = String(row[1] || '').trim();

        // Ignorar encabezados comunes
        if (
          !primeraCelda ||
          primeraCelda.toLowerCase().startsWith('ejercicio') ||
          primeraCelda.toLowerCase().startsWith('dia') ||
          primeraCelda.toLowerCase().startsWith('rutina')
        ) {
          if (segundaCelda && !segundaCelda.toLowerCase().startsWith('series')) {
            ejercicios.push({
              id: `ex_loc_${sIdx}_${rIdx}`,
              nombre: segundaCelda,
              valores: DEFAULT_BLOQUES.map(() => ({ kg: '', r: '10', s: '4' })),
            });
          }
          return;
        }

        const reps = row[2] ? String(row[2]) : '10';
        const series = row[1] ? String(row[1]) : '4';
        const kg = row[3] ? String(row[3]) : '';

        ejercicios.push({
          id: `ex_loc_${sIdx}_${rIdx}`,
          nombre: primeraCelda,
          valores: DEFAULT_BLOQUES.map(() => ({ kg, r: reps, s: series })),
        });
      });

      if (ejercicios.length > 0) {
        dias.push({
          dia: dias.length + 1,
          enfoque: sheetName.startsWith('Sheet') ? `Día ${dias.length + 1}` : sheetName,
          ejercicios,
        });
      }
    });

    if (dias.length === 0) {
      return DEFAULT_PLANILLA_FISICA_E22;
    }

    return {
      version: '2.0',
      tipo: 'tecnica_e22',
      planNumero: '1',
      objetivo: `Planilla E22 importada desde Excel (${nombreArchivo || 'Rutina'})`,
      indicacionPrevia: DEFAULT_PLANILLA_FISICA_E22.indicacionPrevia,
      bloques: DEFAULT_BLOQUES,
      dias,
      asistenciaDias: [],
    };
  } catch (err) {
    console.error('Error en parser local de Excel:', err);
    return DEFAULT_PLANILLA_FISICA_E22;
  }
}

/**
 * Coach Virtual E22: Responde preguntas del alumno conociendo su rutina actual
 */
export async function consultarCoachVirtual({
  prompt,
  rutinaActual,
  alumnoNombre = 'Alumno',
}) {
  const diaSemanaHoy = new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(new Date());

  const SYSTEM_PROMPT = `Eres el Coach Virtual Inteligente del gimnasio E22 GYM (Centro de Alto Rendimiento).
Tu tono es directo, profesional, motivador y claro.
Conoces la rutina oficial asignada al alumno (${alumnoNombre}).
Hoy es ${diaSemanaHoy}.

Esta es la rutina actual del alumno:
${JSON.stringify(rutinaActual, null, 2)}

Instrucciones:
1. Si el usuario pregunta qué le toca entrenar hoy, analiza los días de su rutina y dale una respuesta clara con el enfoque del día, los ejercicios principales, series y repeticiones recomendadas para la etapa actual.
2. Si pregunta sobre cómo ejecutar un ejercicio, dale tips biomecánicos esenciales, cómo evitar lesiones y la máquina o barra adecuada.
3. Si pregunta sobre RIR o series, explícale de forma sencilla (RIR = Repeticiones en Reserva; ej: RIR 3 significa detenerse cuando te quedan 3 repeticiones antes del fallo muscular).
4. Sé conciso y enérgico, invitándolo a dar el máximo en su entrenamiento en E22 GYM.`;

  try {
    const { texto } = await llamarGemini({
      systemInstruction: SYSTEM_PROMPT,
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    return texto;
  } catch (err) {
    console.warn('[Coach Fallback] Gemini no disponible temporalmente, usando respuesta experta local:', err.message);

    // Fallback inteligente para "¿Qué me toca hoy?" y dudas frecuentes
    const promptLow = prompt.toLowerCase();
    const dias = rutinaActual?.dias || [];

    if (promptLow.includes('toca hoy') || promptLow.includes('hago hoy') || promptLow.includes('que me toca')) {
      if (dias.length > 0) {
        const dia1 = dias[0];
        const nombresEj = dia1.ejercicios?.map((e) => `• ${e.nombre} (${e.valores?.[0]?.s || 4}x${e.valores?.[0]?.r || 10})`).join('\n');
        return `¡Hola ${alumnoNombre}! Hoy es un gran día para entrenar en E22 GYM.\n\nPara tu sesión te corresponde:\n🔥 **${dia1.enfoque || 'Día 1'}**\n\nEjercicios asignados:\n${nombresEj || 'Consulta la tabla de tu planilla.'}\n\n*Recuerda respetar los descansos de 90 segundos y calentar adecuadamente.* ¡A darle con todo!`;
      }
      return `¡Hola ${alumnoNombre}! Tu profesor de E22 aún está preparando tu planilla de ejercicios. Acércate a la sala o avísale para que te cargue tu rutina de esta semana.`;
    }

    if (promptLow.includes('rir')) {
      return `El **RIR (Repeticiones en Reserva)** mide la intensidad del esfuerzo:\n\n• **RIR 3**: Debes detener la serie cuando sientas que podrías haber hecho exactamente 3 repeticiones más antes de fallar.\n• **RIR 2**: Esfuerzo alto, te quedan 2 en el tanque.\n• **RIR 0**: Llegar al límite técnico de la serie.\n\nEn tu planilla E22, el profesor programa el RIR para que progreses sin sobreentrenar.`;
    }

    return `¡Hola ${alumnoNombre}! En E22 GYM nos enfocamos en la técnica estricta y sobrecarga progresiva. Revisa tu planilla interactiva en pantalla y anota cada sesión completada en la grilla de 30 días. ¡Cualquier duda de ejecución en sala, consulta a los entrenadores!`;
  }
}
