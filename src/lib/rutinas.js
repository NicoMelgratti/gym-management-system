// Modelo y plantilla oficial de la Planilla Técnica de Entrenamiento E22 Gym
// Basada con total fidelidad en la hoja física de planificación de cargas y progresión

export const DEFAULT_BLOQUES = [
  { id: 1, fecha: 'Hasta: 15/04', rir: 'RIR: 3' },
  { id: 2, fecha: 'Hasta: 29/04', rir: 'RIR: 2' },
  { id: 3, fecha: 'Hasta: 06/05', rir: 'RIR: 4' },
  { id: 4, fecha: 'Hasta: 20/05', rir: 'RIR: 0' },
];

export const DEFAULT_PLANILLA_FISICA_E22 = {
  version: '2.0',
  tipo: 'tecnica_e22',
  planNumero: '1',
  objetivo: 'Variación de cargas múltiples – OBJETIVO: Mejorar el IMC & aumentar los niveles de fuerza',
  indicacionPrevia: 'PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA DE "CORE/MOVILIDAD/ESTABILIDAD" PARA LUEGO COMENZAR CON EL DIA CORRESPONDIENTE',
  bloques: DEFAULT_BLOQUES,
  dias: [
    {
      dia: 1,
      enfoque: 'Día 1',
      ejercicios: [
        {
          id: 'd1_e1',
          nombre: 'Empuje 2 BB C/Mancuernas',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd1_e2',
          nombre: 'Sentadillas frontales C/Barra',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd1_e3',
          nombre: 'Remo horizontal C/Barra',
          valores: [
            { kg: '', r: '5', s: '4' },
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '4', s: '3' },
            { kg: '', r: '3', s: '4' },
          ],
        },
        {
          id: 'd1_e4',
          nombre: 'Fuerza en banco plano en equilibrio C/Mancuernas C/Lado',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd1_e5',
          nombre: 'Vuelos posteriores C/Barra',
          valores: [
            { kg: '', r: '6', s: '4' },
            { kg: '', r: '5', s: '4' },
            { kg: '', r: '5', s: '3' },
            { kg: '', r: '8', s: '4' },
          ],
        },
      ],
    },
    {
      dia: 2,
      enfoque: 'Día 2',
      ejercicios: [
        {
          id: 'd2_e1',
          nombre: 'Tirones altos C/Barra S/Rodillas',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd2_e2',
          nombre: 'Peso muerto C/T.B',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd2_e3',
          nombre: 'Dominadas T/Neutra',
          valores: [
            { kg: '', r: '6', s: '4' },
            { kg: '', r: '8', s: '4' },
            { kg: '', r: '8', s: '3' },
            { kg: '', r: '10', s: '4' },
          ],
        },
        {
          id: 'd2_e4',
          nombre: 'Fuerza en banco plano C/Barra',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd2_e5',
          nombre: 'Biceps C/Barra W',
          valores: [
            { kg: '', r: '6', s: '4' },
            { kg: '', r: '8', s: '4' },
            { kg: '', r: '8', s: '3' },
            { kg: '', r: '10', s: '4' },
          ],
        },
      ],
    },
    {
      dia: 3,
      enfoque: 'Día 3',
      ejercicios: [
        {
          id: 'd3_e1',
          nombre: 'Cargadas a fuerza C/Barra S/Rodillas',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd3_e2',
          nombre: 'Sentadillas posteriores C/Barra',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd3_e3',
          nombre: 'Remo en puente alternado C/Mancuernas T/Neutra C/Lado',
          valores: [
            { kg: '', r: '5', s: '4' },
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '4', s: '3' },
            { kg: '', r: '3', s: '4' },
          ],
        },
        {
          id: 'd3_e4',
          nombre: 'Fuerza en banco plano C/Barra',
          valores: [
            { kg: '', r: '4', s: '4' },
            { kg: '', r: '3', s: '4' },
            { kg: '', r: '3', s: '3' },
            { kg: '', r: '2', s: '4' },
          ],
        },
        {
          id: 'd3_e5',
          nombre: 'Fondo en paralelas',
          valores: [
            { kg: '', r: '5', s: '4' },
            { kg: '', r: '8', s: '4' },
            { kg: '', r: '8', s: '3' },
            { kg: '', r: '10', s: '4' },
          ],
        },
      ],
    },
  ],
  asistenciaDias: [3, 18],
};

/**
 * Parsea los detalles de la rutina desde la base de datos.
 * Si es JSON estructurado con la nueva planilla técnica, lo devuelve completo.
 * Si es texto tradicional, lo convierte en una estructura compatible para la tabla.
 */
export function parsePlanillaData(detalles, fallbackTitulo = 'Plan de Entrenamiento E22') {
  if (!detalles) {
    return {
      ...DEFAULT_PLANILLA_FISICA_E22,
      objetivo: fallbackTitulo || DEFAULT_PLANILLA_FISICA_E22.objetivo,
      asistenciaDias: [],
    };
  }

  // Si ya es un objeto JSON estructurado
  if (typeof detalles === 'object') {
    return normalizarPlanilla(detalles);
  }

  const str = String(detalles).trim();
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      return normalizarPlanilla(parsed);
    } catch (e) {
      console.warn('No se pudo parsear JSON de rutina, usando parser de texto:', e);
    }
  }

  // Parser de retrocompatibilidad para texto plano existente
  const lineas = str.split('\n');
  const dias = [];
  let currentDia = null;

  lineas.forEach((linea) => {
    const trimmed = linea.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase().startsWith('día') || trimmed.toLowerCase().startsWith('dia')) {
      const diaNumMatch = trimmed.match(/\d+/);
      const diaNum = diaNumMatch ? parseInt(diaNumMatch[0], 10) : dias.length + 1;
      currentDia = {
        dia: diaNum,
        enfoque: trimmed,
        ejercicios: [],
      };
      dias.push(currentDia);
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const limpio = trimmed.replace(/^[•\-\*]\s*/, '');
      const partes = limpio.split(':');
      const nombre = partes[0]?.trim() || 'Ejercicio';
      const serieInfo = partes[1]?.trim() || '4 series x 10 reps';

      if (!currentDia) {
        currentDia = { dia: 1, enfoque: 'Día 1', ejercicios: [] };
        dias.push(currentDia);
      }

      currentDia.ejercicios.push({
        id: `gen_${Math.random().toString(36).substring(2, 7)}`,
        nombre: nombre,
        valores: DEFAULT_BLOQUES.map(() => ({ kg: '', r: '10', s: '4' })),
        notas: serieInfo,
      });
    }
  });

  return {
    version: '2.0',
    tipo: 'tecnica_e22',
    planNumero: '1',
    objetivo: fallbackTitulo || 'Variación de cargas múltiples – OBJETIVO: Fuerza y Desarrollo Físico',
    indicacionPrevia: 'PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA DE "CORE/MOVILIDAD/ESTABILIDAD" PARA LUEGO COMENZAR CON EL DIA CORRESPONDIENTE',
    bloques: DEFAULT_BLOQUES,
    dias: dias.length > 0 ? dias : DEFAULT_PLANILLA_FISICA_E22.dias,
    asistenciaDias: [],
  };
}

/**
 * Normaliza la estructura para asegurar que no falten arrays ni campos
 */
function normalizarPlanilla(obj) {
  const bloques = Array.isArray(obj.bloques) && obj.bloques.length > 0 ? obj.bloques : DEFAULT_BLOQUES;
  const dias = Array.isArray(obj.dias)
    ? obj.dias.map((d, dIdx) => ({
        dia: d.dia || dIdx + 1,
        enfoque: d.enfoque || `Día ${dIdx + 1}`,
        ejercicios: Array.isArray(d.ejercicios)
          ? d.ejercicios.map((ex, eIdx) => ({
              id: ex.id || `d${dIdx + 1}_e${eIdx + 1}`,
              nombre: ex.nombre || '',
              valores: Array.isArray(ex.valores) && ex.valores.length === bloques.length
                ? ex.valores
                : bloques.map((_, bIdx) => ({
                    kg: ex.valores?.[bIdx]?.kg || '',
                    r: ex.valores?.[bIdx]?.r || '10',
                    s: ex.valores?.[bIdx]?.s || '4',
                  })),
            }))
          : [],
      }))
    : DEFAULT_PLANILLA_FISICA_E22.dias;

  return {
    version: obj.version || '2.0',
    tipo: obj.tipo || 'tecnica_e22',
    planNumero: obj.planNumero || '1',
    objetivo: obj.objetivo || 'Variación de cargas múltiples – OBJETIVO: Mejorar el IMC & aumentar los niveles de fuerza',
    indicacionPrevia: obj.indicacionPrevia || 'PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA DE "CORE/MOVILIDAD/ESTABILIDAD" PARA LUEGO COMENZAR CON EL DIA CORRESPONDIENTE',
    bloques: bloques,
    dias: dias,
    asistenciaDias: Array.isArray(obj.asistenciaDias) ? obj.asistenciaDias : [],
  };
}

/**
 * Serializa los datos estructurados a cadena JSON lista para almacenar en Postgres
 */
export function serializePlanillaData(planilla) {
  return JSON.stringify(normalizarPlanilla(planilla));
}
