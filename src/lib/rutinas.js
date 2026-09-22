// Planilla predefinida de 6 días (Lunes a Sábado) para E22 Gym
export const PLANILLA_6_DIAS = {
  titulo: 'Planilla Predefinida E22 (Lunes a Sábado)',
  dias: [
    {
      dia: 'Lunes',
      musculos: 'Pecho y Tríceps',
      ejercicios: [
        { nombre: 'Press Banca Plano con Barra', series: '4 series x 10 repeticiones' },
        { nombre: 'Press Inclinado con Mancuernas', series: '3 series x 12 repeticiones' },
        { nombre: 'Aperturas en Polea (Cruce de Poleas)', series: '3 series x 15 repeticiones' },
        { nombre: 'Fondos en Paralelas (Dips)', series: '3 series al fallo' },
        { nombre: 'Extensión de Tríceps en Polea Alta', series: '4 series x 12 repeticiones' },
        { nombre: 'Press Francés con Mancuerna', series: '3 series x 12 repeticiones' },
      ],
    },
    {
      dia: 'Martes',
      musculos: 'Espalda y Bíceps',
      ejercicios: [
        { nombre: 'Jalón al Pecho en Polea Abierta', series: '4 series x 10 repeticiones' },
        { nombre: 'Remo con Barra Prono', series: '4 series x 8 repeticiones' },
        { nombre: 'Remo Gironda en Polea Baja', series: '3 series x 12 repeticiones' },
        { nombre: 'Pull-over en Polea Alta con Cuerda', series: '3 series x 15 repeticiones' },
        { nombre: 'Curl de Bíceps con Barra Z', series: '4 series x 10 repeticiones' },
        { nombre: 'Curl Martillo Alternado con Mancuernas', series: '3 series x 12 repeticiones' },
      ],
    },
    {
      dia: 'Miércoles',
      musculos: 'Piernas y Core',
      ejercicios: [
        { nombre: 'Sentadilla Libre con Barra', series: '4 series x 8 repeticiones' },
        { nombre: 'Prensa Inclinada 45°', series: '4 series x 12 repeticiones' },
        { nombre: 'Sillón de Cuádriceps (Extensión)', series: '3 series x 15 repeticiones' },
        { nombre: 'Elevación de Talones (Gemelos)', series: '4 series x 15 repeticiones' },
        { nombre: 'Plancha Abdominal Isométrica', series: '4 series x 45 segundos' },
        { nombre: 'Elevaciones de Piernas en Barra', series: '3 series x 15 repeticiones' },
      ],
    },
    {
      dia: 'Jueves',
      musculos: 'Hombros y Trapecios',
      ejercicios: [
        { nombre: 'Press Militar con Mancuernas sentado', series: '4 series x 10 repeticiones' },
        { nombre: 'Elevaciones Laterales con Mancuerna', series: '4 series x 15 repeticiones' },
        { nombre: 'Pájaros Posteriores en Polea o Banco', series: '4 series x 15 repeticiones' },
        { nombre: 'Remo al Mentón con Barra', series: '3 series x 12 repeticiones' },
        { nombre: 'Encogimientos con Mancuernas (Trapecio)', series: '4 series x 15 repeticiones' },
      ],
    },
    {
      dia: 'Viernes',
      musculos: 'Isquiotibiales, Glúteos y Full Body',
      ejercicios: [
        { nombre: 'Peso Muerto Rumano con Barra', series: '4 series x 10 repeticiones' },
        { nombre: 'Hip Thrust con Barra en Banco', series: '4 series x 12 repeticiones' },
        { nombre: 'Camilla Femoral Acostado', series: '3 series x 12 repeticiones' },
        { nombre: 'Zancadas Dinámicas (Estocadas)', series: '3 series x 12 pasos por pierna' },
        { nombre: 'Dominadas Asistidas o Jalón Neutro', series: '3 series x 10 repeticiones' },
      ],
    },
    {
      dia: 'Sábado',
      musculos: 'Funcional, Cardio & Movilidad',
      ejercicios: [
        { nombre: 'Circuito HIIT en Cinta o Bici', series: '20 minutos (1 min suave / 45 seg sprint)' },
        { nombre: 'Swing con Kettlebell', series: '4 series x 20 repeticiones' },
        { nombre: 'Burpees con Salto', series: '3 series x 12 repeticiones' },
        { nombre: 'Abdominales Crunch en Polea Alta', series: '4 series x 20 repeticiones' },
        { nombre: 'Sesión de Movilidad y Estiramiento General', series: '15 minutos guiados' },
      ],
    },
  ],
  notas: `- Calentamiento dinámico articular de 10 minutos previo a cada sesión.
- Descanso de 90 segundos en ejercicios compuestos y 60 segundos en aislamiento.
- Hidratación constante de al menos 750ml durante el entrenamiento.`,
};

export function formatearPlanillaATexto(diasFiltrados = PLANILLA_6_DIAS.dias) {
  let texto = '';
  diasFiltrados.forEach((d) => {
    texto += `Día: ${d.dia} - ${d.musculos}:\n`;
    d.ejercicios.forEach((e) => {
      texto += `• ${e.nombre}: ${e.series}\n`;
    });
    texto += '\n';
  });
  texto += `Notas del Entrenador E22:\n${PLANILLA_6_DIAS.notas}`;
  return texto;
}
