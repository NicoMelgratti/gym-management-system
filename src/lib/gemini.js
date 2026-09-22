import * as XLSX from 'xlsx';
import { DEFAULT_BLOQUES, DEFAULT_PLANILLA_FISICA_E22 } from './rutinas.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Modelos activos y verificados en Google Generative Language API
const DEFAULT_CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

/**
 * Realiza una llamada a la API de Gemini probando modelos activos en orden con timeout configurable.
 */
export async function llamarGemini({
  contents,
  systemInstruction,
  candidateModels = null,
  timeoutMs = 15000,
}) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }

  const modelsToTry = candidateModels || DEFAULT_CANDIDATE_MODELS;
  let lastError = null;

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
 * Limpia y parsea un bloque JSON retornado por un LLM de forma ultra-robusta
 */
function extraerJSON(texto) {
  if (!texto) return null;

  let limpio = texto.trim();

  // 1. Extraer bloque de código markdown si existe ```json ... ``` o ``` ... ```
  const matchCodeBlock = limpio.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (matchCodeBlock && matchCodeBlock[1]) {
    limpio = matchCodeBlock[1].trim();
  } else {
    limpio = limpio.replace(/^```(?:json)?\s*/i, '');
    limpio = limpio.replace(/\s*```$/i, '');
    limpio = limpio.trim();
  }

  // 2. Buscar el primer { y el último }
  const primerBrace = limpio.indexOf('{');
  const ultimoBrace = limpio.lastIndexOf('}');

  if (primerBrace !== -1 && ultimoBrace !== -1 && ultimoBrace > primerBrace) {
    limpio = limpio.substring(primerBrace, ultimoBrace + 1);
  }

  // 3. Remover comas finales antes de llaves o corchetes de cierre (ej: { "a": 1, })
  limpio = limpio.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(limpio);
  } catch (err) {
    console.error('Error parseando JSON de Gemini:', err.message, 'Texto recibido:', limpio.substring(0, 300));
    throw err;
  }
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

  let textoIA = null;
  try {
    const resIA = await llamarGemini({
      systemInstruction: SYSTEM_PROMPT,
      contents: [{ parts }],
      candidateModels: ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'],
      timeoutMs: 35000,
    });
    textoIA = resIA.texto;
  } catch (apiError) {
    console.warn('[Gemini Scan Warning] API no respondió o saturada:', apiError.message);

    // Si era Excel, usar el parser local infalible
    if (excelBuffer) {
      console.info('Utilizando parser local de contingencia para Excel...');
      return extraerPlanillaDesdeExcelLocal(excelBuffer, nombreArchivo);
    }

    // Si era imagen y Gemini está saturado (503 / timeout), devolver estructura base E22
    console.info('Proveyendo estructura base E22 como contingencia ante saturación de IA...');
    return {
      ...DEFAULT_PLANILLA_FISICA_E22,
      objetivo: `Planilla E22 (Ajuste Manual - Foto: ${nombreArchivo || 'Hoja de Rutina'})`,
      advertencia:
        'Los servidores de Google Gemini están experimentando alta demanda momentánea. Se ha precargado la estructura oficial E22 en el editor para que puedas redactar o ajustar los ejercicios inmediatamente sin demoras.',
    };
  }

  try {
    const parsed = extraerJSON(textoIA);
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
    if (excelBuffer) {
      console.warn('Utilizando parser local de contingencia para Excel...');
      return extraerPlanillaDesdeExcelLocal(excelBuffer, nombreArchivo);
    }
    console.error('Error parseando JSON de Gemini:', parseError, 'Texto recibido:', textoIA);
    // Devolver plantilla base oficial en caso de fallo de formateo
    return {
      ...DEFAULT_PLANILLA_FISICA_E22,
      objetivo: `Planilla E22 (Ajuste Manual - ${nombreArchivo || 'Rutina'})`,
      advertencia:
        'No se pudo extraer el texto de la foto con claridad. Se cargó la plantilla técnica oficial de E22 para que puedas redactar los ejercicios directamente.',
    };
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
  const ahora = new Date();
  const diaSemanaHoy = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(ahora);
  const diaSemanaNorm = diaSemanaHoy.toLowerCase();

  const mapaDias = {
    lunes: 1,
    martes: 2,
    miércoles: 3,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
    sabado: 6,
    domingo: 7,
  };

  const diaSugerido = mapaDias[diaSemanaNorm] || 1;

  const SYSTEM_PROMPT = `Eres el Coach Virtual Inteligente de E22 GYM (Centro de Alto Rendimiento Deportivo).
Tu tono es enérgico, cercano, motivador, directo y profesional.
Alumno: ${alumnoNombre}.
Hoy es ${diaSemanaHoy}. En el sistema de entrenamiento E22, los días corresponden por defecto al día de la semana:
- Lunes = Día 1
- Martes = Día 2
- Miércoles = Día 3
- Jueves = Día 4
- Viernes = Día 5
- Sábado = Día 6
- Domingo = Descanso o repaso general

Planilla oficial de entrenamiento del alumno:
${JSON.stringify(rutinaActual, null, 2)}

INSTRUCCIONES CLAVE:
1. SI PREGUNTA QUÉ DEBE ENTRENAR HOY (o variaciones como 'qué me toca hoy', 'dime qué debo entrenar hoy', 'mi rutina de hoy', etc.):
   - Identifica el día actual (${diaSemanaHoy} -> Día ${diaSugerido}).
   - Dile con entusiasmo qué día le toca (ej: "¡Hola ${alumnoNombre}! Hoy es **${diaSemanaHoy}**, te corresponde el **Día ${diaSugerido}: [Enfoque]**").
   - Detalla la lista completa de ejercicios para ese día con viñetas claras, indicando nombre exacto, series y repeticiones (ej: "• Press de Banca Plano: 4 series x 8-10 reps") y la máquina o notas técnicas si están indicadas.
   - Si hoy es domingo o un día fuera del rango de días asignados, indícale qué día le toca o sugiérele descanso activo / movilidad.
   - Finaliza con un tip técnico breve (ej: 90s de descanso, RIR o respiración) y una frase de motivación para romperla en la sala.
2. Si menciona un día específico (ej: "qué me toca el martes", "qué hago el día 3"), busca exactamente ese día en su planilla y desglósalo.
3. Si pregunta sobre técnica o biomecánica de un ejercicio, dale tips concretos de postura, rango de recorrido y prevención de lesiones.
4. Si pregunta sobre RIR o conceptos de su planilla, explícalo de forma sencilla y práctica para la sala de pesas.
5. Responde con un formato limpio en Markdown (negritas, viñetas), de forma concisa y enérgica.`;

  try {
    const { texto } = await llamarGemini({
      systemInstruction: SYSTEM_PROMPT,
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      candidateModels: ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'],
      timeoutMs: 12000,
    });

    return texto;
  } catch (err) {
    console.warn('[Coach Fallback] Usando respuesta local experta E22:', err.message);

    const promptLow = prompt.toLowerCase();
    const dias = Array.isArray(rutinaActual?.dias) ? rutinaActual.dias : [];

    // Detectar si pregunta sobre qué entrenar hoy, rutina de hoy, o días específicos
    const esConsultaRutina =
      promptLow.includes('toca') ||
      promptLow.includes('hago') ||
      promptLow.includes('entrenar') ||
      promptLow.includes('rutina') ||
      promptLow.includes('hoy') ||
      promptLow.includes('dia') ||
      promptLow.includes('día') ||
      promptLow.includes('planilla') ||
      promptLow.includes('lunes') ||
      promptLow.includes('martes') ||
      promptLow.includes('miercoles') ||
      promptLow.includes('miércoles') ||
      promptLow.includes('jueves') ||
      promptLow.includes('viernes') ||
      promptLow.includes('sabado') ||
      promptLow.includes('sábado') ||
      promptLow.includes('domingo');

    if (esConsultaRutina) {
      if (dias.length === 0) {
        return `¡Hola ${alumnoNombre}! Tu profesor de E22 aún está preparando tu planilla de ejercicios personalizada. Acércate al mostrador o avísale al profesor para que te cargue tu rutina de esta semana.`;
      }

      // Determinar qué día buscar
      let diaTarget = diaSugerido;
      if (promptLow.includes('lunes')) diaTarget = 1;
      else if (promptLow.includes('martes')) diaTarget = 2;
      else if (promptLow.includes('miercoles') || promptLow.includes('miércoles')) diaTarget = 3;
      else if (promptLow.includes('jueves')) diaTarget = 4;
      else if (promptLow.includes('viernes')) diaTarget = 5;
      else if (promptLow.includes('sabado') || promptLow.includes('sábado')) diaTarget = 6;
      else if (promptLow.includes('domingo')) diaTarget = 7;
      else {
        const matchNum = promptLow.match(/d[ií]a\s*(\d+)/);
        if (matchNum) diaTarget = parseInt(matchNum[1], 10);
      }

      // Si es domingo y no hay día 7 programado
      if (diaTarget === 7 && !dias.some((d) => d.dia === 7)) {
        return `¡Hola ${alumnoNombre}! Hoy es **domingo**, día programado de **recuperación y descanso activo** en E22 GYM. Aprovecha para descansar, hidratarte y estirar la musculatura. ¡Mañana arrancamos con todo el Día 1!`;
      }

      // Encontrar el día en la rutina
      let diaEncontrado = dias.find((d) => Number(d.dia) === Number(diaTarget));
      if (!diaEncontrado) {
        const idx = (diaTarget - 1) % dias.length;
        diaEncontrado = dias[idx] || dias[0];
      }

      const listaEjercicios = (diaEncontrado.ejercicios || [])
        .map((e, idx) => {
          const val = e.valores?.[0] || {};
          const s = val.s || '4';
          const r = val.r || '10';
          const kg = val.kg ? ` [${val.kg} kg]` : '';
          const notas = e.notas ? ` (${e.notas})` : '';
          return `• **${e.nombre || `Ejercicio ${idx + 1}`}**: ${s} series x ${r} reps${kg}${notas}`;
        })
        .join('\n');

      return `¡Hola ${alumnoNombre}! Hoy es **${diaSemanaHoy}**, por lo que te corresponde entrenar tu **${diaEncontrado.enfoque || `Día ${diaEncontrado.dia}`}**:\n\n🔥 **Plan de Sesión E22:**\n${listaEjercicios || '• Consulta los ejercicios en tu planilla interactiva.'}\n\n💡 *Tip del Coach:* Mantén descansos de 90 segundos entre series y anota cada sesión completada en tu grilla de 30 días. ¡A romperla en la sala!`;
    }

    if (promptLow.includes('rir')) {
      return `El **RIR (Repeticiones en Reserva)** mide la intensidad del esfuerzo:\n\n• **RIR 3**: Debes detener la serie cuando sientas que podrías haber hecho exactamente 3 repeticiones más antes de fallar.\n• **RIR 2**: Esfuerzo alto, te quedan 2 en el tanque antes del fallo.\n• **RIR 0**: Llegar al límite técnico de la serie sin perder postura.\n\nEn tu planilla E22, el profesor programa el RIR para que progreses con sobrecarga controlada sin lesionarte.`;
    }

    if (promptLow.includes('descans') || promptLow.includes('tiempo')) {
      return `⏱️ **Tiempos de Descanso Recomendados en E22 GYM:**\n\n• **Ejercicios Pesados/Multiarticulares** (Sentadilla, Press de Banca, Peso Muerto): **90 a 120 segundos** para permitir la recuperación del sistema nervioso y ATP.\n• **Ejercicios de Aislamiento / Hipertrofia** (Bíceps, Tríceps, Elevaciones, Máquinas): **60 a 75 segundos** para maximizar el estrés metabólico.`;
    }

    if (promptLow.includes('sentadilla') || promptLow.includes('front') || promptLow.includes('squat')) {
      return `🏋️ **Indicaciones Técnicas para Sentadillas:**\n\n1. **Postura inicial**: Pies al ancho de los hombros, puntas ligeramente abiertas hacia afuera (~15-30°).\n2. **Descenso**: Inicia empujando la cadera hacia atrás y flexionando rodillas de forma sincronizada. Pecho erguido y core activo.\n3. **Profundidad**: Busca bajar al menos hasta que el muslo quede paralelo al suelo (romper los 90° si tu movilidad lo permite).\n4. **Empuje**: Empuja fuerte desde el mediopié distribuyendo el peso parejo. ¡Evita que las rodillas colapsen hacia adentro!`;
    }

    return `¡Hola ${alumnoNombre}! En E22 GYM nos enfocamos en la técnica estricta y sobrecarga progresiva. Revisa tu planilla interactiva en pantalla y anota cada sesión completada en la grilla de 30 días. ¡Cualquier duda de ejecución en sala, consulta a los entrenadores!`;
  }
}
