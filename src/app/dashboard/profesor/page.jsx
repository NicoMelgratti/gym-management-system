'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import {
  Search,
  Plus,
  FileDown,
  Dumbbell,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Check,
  Flame,
  ShieldAlert,
  Sparkles,
  Calendar,
  Layers,
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

export default function ProfessorDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [socios, setSocios] = useState([]);
  const [metrics, setMetrics] = useState({ active: 0, pending: 0, expired: 0, capacityThreshold: '78% Óptima' });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'al_dia' | 'pendiente' | 'vencido'

  // Socio seleccionado para edición de rutina
  const [selectedSocio, setSelectedSocio] = useState(null);

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.rol !== 'profesor') {
          router.push('/dashboard/alumno');
          return;
        }
        setCurrentUser(parsed);
      } catch (e) {
        router.push('/');
      }
    } else {
      router.push('/');
    }

    loadSocios();
  }, []);

  const loadSocios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/socios?filter=${activeFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.ok) {
        setSocios(data.socios || []);
        if (data.metrics) setMetrics(data.metrics);
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

  useEffect(() => {
    loadSocios();
  }, [activeFilter, search]);

  // Manejo de Días (hasta 6 máximo)
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

  // Agregar Ejercicio al Día Activo
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

  // Cargar plantilla completa de 6 días
  const handleCargarPlantilla6Dias = () => {
    if (confirm('¿Deseas cargar la plantilla predefinida oficial de 6 días?')) {
      setDiasRutina(DEFAULT_6_DAYS);
      setDiaActivoIndex(0);
      setRoutineTitle('Plan E22 - 6 Días Hipertrofia Elite');
    }
  };

  // Guardar y Asignar Rutina en Base de Datos
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
      // Formatear texto estructurado por días
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

  // Aprobar pago de un socio
  const handleAprobarPago = async (socioId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('/api/pagos/aprobar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: socioId }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage(data.message);
        setTimeout(() => setStatusMessage(''), 4000);
        loadSocios();
      } else {
        alert(data.error || 'Error al aprobar pago');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const diaActual = diasRutina[diaActivoIndex] || diasRutina[0];

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col font-sans selection:bg-white selection:text-black relative">
      {/* 1. NAVEGACIÓN SUPERIOR GLASS + MÓVIL LIQUID GLASS */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col px-4 sm:px-8 lg:px-10 pt-28 sm:pt-32 lg:pt-36 pb-28 sm:pb-32 space-y-6 max-w-7xl w-full mx-auto min-w-0">
        {/* Cabecera Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-e22-border/80 pb-5">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              PANEL DE CONTROL DEL ENTRENADOR // E22 GYM
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              GESTIÓN DE SOCIOS Y RUTINAS
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-e22-card border border-e22-border hover:bg-zinc-900 transition flex items-center gap-2 shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar Planilla</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-xl text-xs font-black text-zinc-950 bg-white hover:bg-zinc-200 transition flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Socio</span>
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Barra de Filtros + Métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Búsqueda y Filtros Rápidos */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-e22-card border border-e22-border rounded-xl p-3">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 mb-1 px-1">
                <span>BÚSQUEDA RÁPIDA POR DNI O NOMBRE</span>
                <span>Atajo: Presiona /</span>
              </div>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ingresa DNI o Nombre del socio (ej: 44024808)..."
                  className="w-full bg-e22-bg border border-e22-border rounded-lg pl-9 pr-20 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
                <span className="absolute right-2.5 px-2 py-0.5 bg-zinc-800 text-[10px] font-mono text-zinc-400 rounded">
                  DNI ID
                </span>
              </div>
            </div>

            {/* Filtros Rápidos con Puntos */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-zinc-500 mr-1">Filtros:</span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeFilter === 'all'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'bg-e22-card border border-e22-border text-zinc-400 hover:text-white'
                }`}
              >
                Todos los Socios
              </button>
              <button
                onClick={() => setActiveFilter('al_dia')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeFilter === 'al_dia'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'bg-e22-card border border-e22-border text-zinc-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Al Día</span>
              </button>
              <button
                onClick={() => setActiveFilter('pendiente')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeFilter === 'pendiente'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'bg-e22-card border border-e22-border text-zinc-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pendientes</span>
              </button>
              <button
                onClick={() => setActiveFilter('vencido')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeFilter === 'vencido'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'bg-e22-card border border-e22-border text-zinc-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Vencidos</span>
              </button>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta MÉTRICAS */}
          <div className="lg:col-span-4 bg-e22-card border border-e22-border rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-e22-border/60 pb-2">
              <span>MÉTRICAS DEL GIMNASIO</span>
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-e22-bg p-2 rounded-lg border border-e22-border/60">
                <span className="text-xl font-black text-white block leading-none">{metrics.active}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1 block">ACTIVOS</span>
              </div>
              <div className="bg-e22-bg p-2 rounded-lg border border-e22-border/60">
                <span className="text-xl font-black text-amber-400 block leading-none">{metrics.pending}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1 block">PENDIENTES</span>
              </div>
              <div className="bg-e22-bg p-2 rounded-lg border border-e22-border/60">
                <span className="text-xl font-black text-red-400 block leading-none">{metrics.expired}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1 block">VENCIDOS</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 font-mono">
              <span>Capacidad de Sala</span>
              <span className="text-zinc-300 font-bold">{metrics.capacityThreshold}</span>
            </div>
          </div>
        </div>

        {/* 3. GRID PRINCIPAL: LISTA DE SOCIOS (IZQ) vs ESTUDIO DE RUTINAS POR DÍAS (DER) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LISTA DE SOCIOS */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">Lista de Socios</h3>
              <span className="text-[10px] text-zinc-500 font-mono">Mostrando {socios.length} socios</span>
            </div>

            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {socios.length === 0 ? (
                <div className="p-10 text-center bg-e22-card border border-e22-border rounded-xl text-zinc-500 text-xs">
                  {loading ? 'Cargando socios...' : 'No hay socios en esta vista.'}
                </div>
              ) : (
                socios.map((socio) => {
                  const isSelected = selectedSocio?.id === socio.id;
                  const isAlDia = socio.estado_pago === 'al_dia';
                  const isPendiente = socio.estado_pago === 'pendiente';

                  return (
                    <div
                      key={socio.id}
                      onClick={() => setSelectedSocio(socio)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-zinc-900 border-zinc-400 shadow-md'
                          : 'bg-e22-card border-e22-border hover:border-zinc-700'
                      }`}
                    >
                      {/* Avatar y Datos */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {socio.nombre[0]}
                          {socio.apellido ? socio.apellido[0] : ''}
                        </div>

                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isAlDia
                                  ? 'bg-emerald-500'
                                  : isPendiente
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <p className="text-xs font-bold text-white truncate">{socio.nombre_completo}</p>
                            <span
                              className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                                isAlDia
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                                  : isPendiente
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-900'
                                  : 'bg-red-950/40 text-red-400 border-red-900'
                              }`}
                            >
                              {isAlDia ? 'Al Día' : isPendiente ? 'Pendiente' : 'Vencido'}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                            DNI: {socio.dni} • Plan: {socio.rutina_titulo || 'Sin rutina asignada'}
                          </p>

                          {/* Alerta de Salud */}
                          {(socio.alergias !== 'Ninguna' || socio.patologias !== 'Ninguna') && (
                            <p className="text-[10px] text-amber-400/90 font-mono truncate mt-0.5">
                              ⚠️ Alertas: {socio.alergias !== 'Ninguna' ? `Alergia (${socio.alergias})` : ''} {socio.patologias !== 'Ninguna' ? `Lesión (${socio.patologias})` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isAlDia && (
                          <button
                            onClick={(e) => handleAprobarPago(socio.id, e)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow"
                            title="Aprobar pago y habilitar 30 días"
                          >
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">Aprobar Pago</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedSocio(socio)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold border border-zinc-700 transition flex items-center gap-1.5"
                        >
                          <Dumbbell className="w-3 h-3" />
                          <span>Editar Rutina</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ESTUDIO DE RUTINAS EN ESPAÑOL DIVIDIDO EN DÍAS (HASTA 6 MÁXIMO) */}
          <div className="lg:col-span-7 bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-5 w-full min-w-0">
            {/* Cabecera del Editor */}
            <div className="flex justify-between items-center border-b border-e22-border/60 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  ESTUDIO DE RUTINAS // E22 GYM
                </span>
                <h3 className="text-base font-black text-white uppercase">Editor de Rutina por Días</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700">
                Socio: {selectedSocio ? selectedSocio.nombre_completo : 'Selecciona un socio'}
              </span>
            </div>

            {/* Título General del Plan y Botón Plantilla */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-8">
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

              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={handleCargarPlantilla6Dias}
                  className="w-full py-2 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold rounded-xl border border-zinc-700 transition flex items-center justify-center gap-1.5"
                  title="Cargar protocolo completo de 6 días con series y máquinas"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Cargar Plantilla 6 Días</span>
                </button>
              </div>
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
