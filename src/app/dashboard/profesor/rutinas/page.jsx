'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Search,
  Check,
  Calendar,
} from 'lucide-react';

const GRUPOS_MUSCULARES = {
  'Pecho y Empuje': [
    'Press de Banca Plano con Barra',
    'Press Inclinado con Mancuernas',
    'Aperturas en Poleas / Cruces',
    'Fondos en Paralelas',
    'Press en Máquina Smith',
    'Flexiones al Fallo',
  ],
  'Espalda y Tracción': [
    'Jalón al Pecho en Polea Alta',
    'Remo con Barra Olímpica',
    'Remo en Polea Baja (Gironda)',
    'Dominadas con Agarre Prono/Neutro',
    'Pullover en Polea con Soga',
  ],
  'Piernas y Cuádriceps': [
    'Sentadilla Trasera con Barra',
    'Prensa de Piernas 45°',
    'Sillón de Cuádriceps (Extensiones)',
    'Sentadilla Hack en Máquina',
    'Estocadas Búlgaras con Mancuernas',
  ],
  'Cadena Posterior e Isquios': [
    'Peso Muerto Rumano con Barra',
    'Camilla de Isquiotibiales Tumbado',
    'Hip Thrust con Barra en Banco',
    'Elevación de Talones en Máquina (Gemelos)',
  ],
  'Hombros': [
    'Press Militar con Mancuernas',
    'Elevaciones Laterales en Polea o Mancuernas',
    'Pájaros / Vuelos Posteriores',
    'Face Pull en Polea Alta',
    'Remo al Mentón con Barra',
  ],
  'Brazos y Core': [
    'Curl de Bíceps con Barra Z',
    'Curl Martillo en Banco Inclinado',
    'Extensiones de Tríceps en Polea (Soga)',
    'Press Francés con Barra Z',
    'Elevación de Piernas Colgado',
    'Plancha Isométrica',
  ],
};

const DEFAULT_6_DAYS = [
  {
    dia: 1,
    enfoque: 'Pecho y Tríceps',
    ejercicios: [
      {
        nombre: 'Press de Banca Plano con Barra',
        seriesReps: '4 series x 8-10 reps (RPE 8.5)',
        maquinaNotas: 'Banco plano olímpico - control en bajada',
      },
      {
        nombre: 'Press Inclinado con Mancuernas',
        seriesReps: '3 series x 10-12 reps',
        maquinaNotas: 'Banco regulable a 30° con mancuernas pesadas',
      },
      {
        nombre: 'Fondos en Paralelas',
        seriesReps: '3 series al fallo',
        maquinaNotas: 'Estación de paralelas - torso inclinado',
      },
      {
        nombre: 'Extensiones de Tríceps en Polea (Soga)',
        seriesReps: '4 series x 12-15 reps',
        maquinaNotas: 'Torre de polea alta con soga',
      },
    ],
  },
  {
    dia: 2,
    enfoque: 'Espalda y Bíceps',
    ejercicios: [
      {
        nombre: 'Dominadas con Agarre Prono/Neutro',
        seriesReps: '4 series x 6-8 reps',
        maquinaNotas: 'Barra fija de dominadas con cinto de lastre',
      },
      {
        nombre: 'Remo con Barra Olímpica',
        seriesReps: '4 series x 8-10 reps',
        maquinaNotas: 'Barra olímpica - torso a 45°',
      },
      {
        nombre: 'Jalón al Pecho en Polea Alta',
        seriesReps: '3 series x 10-12 reps',
        maquinaNotas: 'Polea alta con agarre prono ancho',
      },
      {
        nombre: 'Curl de Bíceps con Barra Z',
        seriesReps: '4 series x 10-12 reps',
        maquinaNotas: 'Barra Z de pie - codos fijados al costado',
      },
    ],
  },
  {
    dia: 3,
    enfoque: 'Piernas (Enfoque Cuádriceps)',
    ejercicios: [
      {
        nombre: 'Sentadilla Trasera con Barra',
        seriesReps: '4 series x 6-8 reps (RPE 9)',
        maquinaNotas: 'Rack de sentadillas libre con topes de seguridad',
      },
      {
        nombre: 'Prensa de Piernas 45°',
        seriesReps: '4 series x 10-12 reps',
        maquinaNotas: 'Prensa 45° - pies al ancho de caderas',
      },
      {
        nombre: 'Sillón de Cuádriceps (Extensiones)',
        seriesReps: '3 series x 15 reps',
        maquinaNotas: 'Máquina de extensiones con 1s de pausa arriba',
      },
      {
        nombre: 'Elevación de Talones en Máquina (Gemelos)',
        seriesReps: '4 series x 15 reps',
        maquinaNotas: 'Máquina de pantorrillas de pie',
      },
    ],
  },
  {
    dia: 4,
    enfoque: 'Hombros y Core',
    ejercicios: [
      {
        nombre: 'Press Militar con Mancuernas',
        seriesReps: '4 series x 8-10 reps',
        maquinaNotas: 'Banco a 75° con mancuernas',
      },
      {
        nombre: 'Elevaciones Laterales en Polea o Mancuernas',
        seriesReps: '4 series x 12-15 reps',
        maquinaNotas: 'Mancuernas ligeras o polea baja lateral',
      },
      {
        nombre: 'Face Pull en Polea Alta',
        seriesReps: '4 series x 15 reps',
        maquinaNotas: 'Polea alta con soga a la frente',
      },
      {
        nombre: 'Elevación de Piernas Colgado',
        seriesReps: '3 series x 15 reps',
        maquinaNotas: 'Barra de dominadas - sin balanceo',
      },
    ],
  },
  {
    dia: 5,
    enfoque: 'Cadena Posterior e Isquios',
    ejercicios: [
      {
        nombre: 'Peso Muerto Rumano con Barra',
        seriesReps: '4 series x 8-10 reps',
        maquinaNotas: 'Barra olímpica - flexión ligera de rodillas',
      },
      {
        nombre: 'Camilla de Isquiotibiales Tumbado',
        seriesReps: '4 series x 10-12 reps',
        maquinaNotas: 'Máquina de femorales acostado',
      },
      {
        nombre: 'Estocadas Búlgaras con Mancuernas',
        seriesReps: '3 series x 10 reps por pierna',
        maquinaNotas: 'Banco plano como soporte de empeine',
      },
      {
        nombre: 'Plancha Isométrica',
        seriesReps: '3 series x 60 segundos',
        maquinaNotas: 'Colchoneta en piso - abdomen activo',
      },
    ],
  },
  {
    dia: 6,
    enfoque: 'Torso y Brazos (Hipertrofia)',
    ejercicios: [
      {
        nombre: 'Press Inclinado con Mancuernas',
        seriesReps: '3 series x 10 reps',
        maquinaNotas: 'Banco regulable a 30°',
      },
      {
        nombre: 'Remo en Polea Baja (Gironda)',
        seriesReps: '3 series x 10 reps',
        maquinaNotas: 'Polea baja con agarre en V cerrado',
      },
      {
        nombre: 'Curl Martillo en Banco Inclinado',
        seriesReps: '3 series x 12 reps',
        maquinaNotas: 'Banco inclinado a 60° con mancuernas',
      },
      {
        nombre: 'Press Francés con Barra Z',
        seriesReps: '3 series x 12 reps',
        maquinaNotas: 'Banco plano con barra Z hacia la frente',
      },
    ],
  },
];

export default function ProfesorRutinasPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [searchSocio, setSearchSocio] = useState('');

  // Estados del Routine Editor dividido en días (hasta 6 días máximo)
  const [routineTitle, setRoutineTitle] = useState('Plan E22 - 6 Días Hipertrofia Elite');
  const [diasRutina, setDiasRutina] = useState(DEFAULT_6_DAYS);
  const [diaActivoIndex, setDiaActivoIndex] = useState(0);

  // Campos para nuevo ejercicio dentro del día activo
  const [selectedGrupo, setSelectedGrupo] = useState('Pecho y Empuje');
  const [selectedEjercicio, setSelectedEjercicio] = useState(GRUPOS_MUSCULARES['Pecho y Empuje'][0]);
  const [customEjercicio, setCustomEjercicio] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [seriesReps, setSeriesReps] = useState('4 series x 8-10 reps (RPE 8.5)');
  const [maquinaNotas, setMaquinaNotas] = useState('Banco plano olímpico / Barra 20kg');

  const [savingRoutine, setSavingRoutine] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('e22_user');
    if (!saved) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed.rol !== 'profesor') {
        router.push('/dashboard/alumno');
        return;
      }
      setCurrentUser(parsed);
      loadSocios();
    } catch (e) {
      router.push('/');
    }
  }, []);

  const loadSocios = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/socios');
      const data = await res.json();
      if (data.ok) {
        setSocios(data.socios || []);
        if (data.socios?.length > 0 && !selectedSocio) {
          setSelectedSocio(data.socios[0]);
        }
      }
    } catch (err) {
      console.error('Error cargando socios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarDia = () => {
    if (diasRutina.length >= 6) {
      alert('Se permite un máximo de 6 días de entrenamiento.');
      return;
    }
    const nuevoNumero = diasRutina.length + 1;
    const nuevoDia = {
      dia: nuevoNumero,
      enfoque: `Día ${nuevoNumero} - Enfoque Específico`,
      ejercicios: [],
    };
    setDiasRutina([...diasRutina, nuevoDia]);
    setDiaActivoIndex(diasRutina.length);
  };

  const handleEliminarDia = (indexParaEliminar) => {
    if (diasRutina.length <= 1) {
      alert('La rutina debe tener al menos 1 día de entrenamiento.');
      return;
    }
    const filtrados = diasRutina
      .filter((_, idx) => idx !== indexParaEliminar)
      .map((d, idx) => ({ ...d, dia: idx + 1 }));

    setDiasRutina(filtrados);
    setDiaActivoIndex(Math.max(0, indexParaEliminar - 1));
  };

  const handleCambiarEnfoqueDia = (nuevoEnfoque) => {
    setDiasRutina((prev) => {
      const copy = [...prev];
      copy[diaActivoIndex] = { ...copy[diaActivoIndex], enfoque: nuevoEnfoque };
      return copy;
    });
  };

  const handleAgregarEjercicioAlDia = (e) => {
    if (e) e.preventDefault();
    const nombreFinal = isCustom ? customEjercicio.trim() : selectedEjercicio;
    if (!nombreFinal) {
      alert('Por favor indica el nombre del ejercicio.');
      return;
    }

    const nuevoItem = {
      nombre: nombreFinal,
      seriesReps: seriesReps.trim() || '4 series x 10 reps',
      maquinaNotas: maquinaNotas.trim() || 'Sin observaciones',
    };

    setDiasRutina((prev) => {
      const copy = [...prev];
      const diaActual = copy[diaActivoIndex];
      copy[diaActivoIndex] = {
        ...diaActual,
        ejercicios: [...(diaActual.ejercicios || []), nuevoItem],
      };
      return copy;
    });

    setCustomEjercicio('');
    setIsCustom(false);
  };

  const handleEliminarEjercicio = (ejercicioIdx) => {
    setDiasRutina((prev) => {
      const copy = [...prev];
      const diaActual = copy[diaActivoIndex];
      copy[diaActivoIndex] = {
        ...diaActual,
        ejercicios: diaActual.ejercicios.filter((_, i) => i !== ejercicioIdx),
      };
      return copy;
    });
  };

  const handleCargarPlantilla6Dias = () => {
    if (confirm('¿Deseas cargar la plantilla predefinida oficial de 6 días?')) {
      setDiasRutina(DEFAULT_6_DAYS);
      setDiaActivoIndex(0);
      setRoutineTitle('Plan E22 - 6 Días Hipertrofia Elite');
    }
  };

  const handleSaveRoutine = async () => {
    if (!selectedSocio) {
      alert('Por favor selecciona un socio de la lista.');
      return;
    }

    const totalEjercicios = diasRutina.reduce((acc, d) => acc + (d.ejercicios?.length || 0), 0);
    if (totalEjercicios === 0) {
      alert('Agrega al menos un ejercicio a la rutina antes de guardar.');
      return;
    }

    setSavingRoutine(true);
    setStatusMessage('');

    try {
      let formattedText = `Plan: ${routineTitle}\nSocio: ${selectedSocio.nombre_completo} (DNI: ${selectedSocio.dni})\n\n`;

      diasRutina.forEach((d) => {
        formattedText += `Día ${d.dia}: ${d.enfoque}\n`;
        if (d.ejercicios && d.ejercicios.length > 0) {
          d.ejercicios.forEach((ex) => {
            formattedText += `• ${ex.nombre}: ${ex.seriesReps} [Máquina/Equipo: ${ex.maquinaNotas || 'Estándar'}]\n`;
          });
        } else {
          formattedText += `• Día de descanso o recuperación activa.\n`;
        }
        formattedText += `\n`;
      });

      formattedText += `Notas del Entrenador E22:\n- Mantener técnica estricta y descanso de 90 segundos entre series pesadas.\n- Tachar cada ejercicio completado en la planilla interactiva.`;

      const res = await fetch('/api/rutinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: selectedSocio.id,
          profesor_id: currentUser?.id,
          titulo: routineTitle,
          detalles: formattedText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al guardar.');

      setStatusMessage(`¡Rutina asignada exitosamente a ${selectedSocio.nombre_completo}!`);
      setTimeout(() => setStatusMessage(''), 4500);
      loadSocios();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingRoutine(false);
    }
  };

  const diaActual = diasRutina[diaActivoIndex] || diasRutina[0];

  const sociosFiltrados = socios.filter((s) => {
    if (!searchSocio.trim()) return true;
    const term = searchSocio.toLowerCase();
    return s.dni?.includes(term) || s.nombre_completo?.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* 1. SIDEBAR */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col p-6 sm:p-8 lg:p-10 space-y-6 overflow-y-auto max-w-7xl">
        {/* Cabecera */}
        <div className="space-y-3 border-b border-e22-border/80 pb-5">
          <Link
            href="/dashboard/profesor"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Lista de Socios</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                ESTUDIO DE RUTINAS // E22 GYM
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                DISEÑADOR DE RUTINAS POR DÍAS
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Organiza el entrenamiento en hasta 6 días con título de enfoque, repeticiones y máquinas sugeridas
              </p>
            </div>

            <button
              onClick={handleCargarPlantilla6Dias}
              disabled={savingRoutine}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cargar Plantilla Oficial (6 Días)</span>
            </button>
          </div>
        </div>

        {/* Notificación */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 3. GRID: SELECTOR DE SOCIO (IZQ) vs EDITOR POR DÍAS (DER) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Selector de Socio */}
          <div className="lg:col-span-4 bg-e22-card border border-e22-border rounded-2xl p-5 space-y-4">
            <div className="border-b border-e22-border/60 pb-3">
              <h3 className="text-sm font-black text-white uppercase">
                Seleccionar Socio ({sociosFiltrados.length})
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                Elige al socio para asignarle el entrenamiento
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchSocio}
                onChange={(e) => setSearchSocio(e.target.value)}
                placeholder="Filtrar por DNI o Nombre..."
                className="w-full bg-e22-bg border border-e22-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {sociosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 font-mono">
                  No hay socios registrados.
                </div>
              ) : (
                sociosFiltrados.map((s) => {
                  const isSelected = selectedSocio?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSocio(s)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-zinc-900 border-zinc-400 shadow'
                          : 'bg-e22-bg border-e22-border hover:border-zinc-700'
                      }`}
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{s.nombre_completo}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">DNI: {s.dni}</p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {s.rutina_titulo || 'Sin rutina asignada'}
                        </p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* EDITOR POR DÍAS (Hasta 6 Días) */}
          <div className="lg:col-span-8 bg-e22-card border border-e22-border rounded-2xl p-6 space-y-5">
            {/* Cabecera del Editor */}
            <div className="flex justify-between items-center border-b border-e22-border/60 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                  CONFIGURACIÓN DE ENTRENAMIENTO
                </span>
                <h3 className="text-base font-black text-white uppercase">Editor de Rutina por Días</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700">
                Socio: {selectedSocio ? selectedSocio.nombre_completo : 'Selecciona un socio'}
              </span>
            </div>

            {/* Título General del Plan */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Título del Plan de Entrenamiento
              </label>
              <input
                type="text"
                value={routineTitle}
                onChange={(e) => setRoutineTitle(e.target.value)}
                placeholder="Ej: Plan E22 - 6 Días Hipertrofia Elite"
                className="w-full bg-e22-bg border border-e22-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-zinc-400 font-mono"
              />
            </div>

            {/* BARRA DE PESTAÑAS DE DÍAS (Hasta 6 Días Máximo) */}
            <div className="space-y-2 pt-2 border-t border-e22-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Días de Entrenamiento ({diasRutina.length} / 6 máx)
                  </span>
                </div>

                {diasRutina.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAgregarDia}
                    className="px-2.5 py-1 text-[11px] font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Agregar Día</span>
                  </button>
                )}
              </div>

              {/* Pestañas de Días 1 a 6 */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {diasRutina.map((d, idx) => {
                  const isActive = idx === diaActivoIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDiaActivoIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        isActive
                          ? 'bg-white text-zinc-950 shadow-md'
                          : 'bg-e22-bg border border-e22-border text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <span>Día {d.dia}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {d.ejercicios?.length || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PANEL DEL DÍA ACTIVO */}
            {diaActual && (
              <div className="bg-e22-bg border border-e22-border rounded-xl p-4 space-y-4">
                {/* Enfoque del Día + Botón Eliminar Día */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-e22-border/60 pb-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Enfoque / Título del Día {diaActual.dia}
                    </label>
                    <input
                      type="text"
                      value={diaActual.enfoque}
                      onChange={(e) => handleCambiarEnfoqueDia(e.target.value)}
                      placeholder="Ej: Pecho y Tríceps, Piernas Cuádriceps..."
                      className="w-full bg-e22-surface border border-e22-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400 font-bold"
                    />
                  </div>

                  {diasRutina.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleEliminarDia(diaActivoIndex)}
                      className="self-end sm:self-center px-2.5 py-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg text-[11px] font-mono transition flex items-center gap-1 shrink-0"
                      title="Eliminar este día de la rutina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Día</span>
                    </button>
                  )}
                </div>

                {/* Formulario para añadir ejercicio al Día Activo */}
                <div className="space-y-3 p-3.5 bg-e22-surface rounded-xl border border-e22-border">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-300">
                    <span>Añadir Ejercicio al Día {diaActual.dia}</span>
                    <button
                      type="button"
                      onClick={() => setIsCustom(!isCustom)}
                      className="text-zinc-400 hover:text-white underline font-mono normal-case"
                    >
                      {isCustom ? 'Elegir de lista' : 'Escribir personalizado'}
                    </button>
                  </div>

                  {/* Selector o Input de Ejercicio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        Grupo Muscular
                      </label>
                      <select
                        value={selectedGrupo}
                        onChange={(e) => {
                          setSelectedGrupo(e.target.value);
                          setSelectedEjercicio(GRUPOS_MUSCULARES[e.target.value][0]);
                        }}
                        className="w-full bg-e22-bg border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                      >
                        {Object.keys(GRUPOS_MUSCULARES).map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        Ejercicio a Realizar
                      </label>
                      {isCustom ? (
                        <input
                          type="text"
                          value={customEjercicio}
                          onChange={(e) => setCustomEjercicio(e.target.value)}
                          placeholder="Nombre del ejercicio..."
                          className="w-full bg-e22-bg border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                        />
                      ) : (
                        <select
                          value={selectedEjercicio}
                          onChange={(e) => setSelectedEjercicio(e.target.value)}
                          className="w-full bg-e22-bg border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                        >
                          {(GRUPOS_MUSCULARES[selectedGrupo] || []).map((ej) => (
                            <option key={ej} value={ej}>
                              {ej}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Series/Reps + Máquina a Utilizar / Notaciones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        Series y Repeticiones (RPE)
                      </label>
                      <input
                        type="text"
                        value={seriesReps}
                        onChange={(e) => setSeriesReps(e.target.value)}
                        placeholder="Ej: 4 series x 8-10 reps"
                        className="w-full bg-e22-bg border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        Máquina / Equipo y Notaciones
                      </label>
                      <input
                        type="text"
                        value={maquinaNotas}
                        onChange={(e) => setMaquinaNotas(e.target.value)}
                        placeholder="Ej: Máquina Smith, Polea alta con soga, Banco 30°..."
                        className="w-full bg-e22-bg border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAgregarEjercicioAlDia}
                    className="w-full py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg transition shadow flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Añadir Ejercicio al Día {diaActual.dia}</span>
                  </button>
                </div>

                {/* Lista de Ejercicios del Día Activo */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400">
                    <span>Ejercicios Programados para el Día {diaActual.dia}</span>
                    <span className="font-mono">{diaActual.ejercicios?.length || 0} movimientos</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {!diaActual.ejercicios || diaActual.ejercicios.length === 0 ? (
                      <p className="text-center py-5 text-zinc-600 text-xs italic font-mono">
                        Aún no hay ejercicios cargados para el Día {diaActual.dia}.
                      </p>
                    ) : (
                      diaActual.ejercicios.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-e22-surface border border-e22-border rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="w-5 h-5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-white truncate">{item.nombre}</p>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                                <span>{item.seriesReps}</span>
                                <span>•</span>
                                <span className="text-zinc-300 truncate">
                                  Máquina/Notas: {item.maquinaNotas}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEliminarEjercicio(idx)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition shrink-0"
                            title="Eliminar ejercicio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botón Final: Guardar y Asignar Rutina */}
            <div className="pt-3 border-t border-e22-border/60">
              <button
                type="button"
                onClick={handleSaveRoutine}
                disabled={savingRoutine || !selectedSocio}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>
                  {savingRoutine
                    ? 'Guardando Protocolo de Entrenamiento...'
                    : `Guardar y Asignar Rutina a ${selectedSocio ? selectedSocio.nombre_completo : 'Socio'}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
