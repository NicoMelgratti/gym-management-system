'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TrainingSheet from '@/components/TrainingSheet';
import ScanRoutineModal from '@/components/ScanRoutineModal';
import {
  DEFAULT_BLOQUES,
  DEFAULT_PLANILLA_FISICA_E22,
  parsePlanillaData,
  serializePlanillaData,
} from '@/lib/rutinas';
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
  Save,
  RotateCcw,
  Eye,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function ProfesorRutinasPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [searchSocio, setSearchSocio] = useState('');

  // Estados de la Planilla Técnica
  const [planNumero, setPlanNumero] = useState('1');
  const [objetivo, setObjetivo] = useState(
    'Variación de cargas múltiples – OBJETIVO: Mejorar el IMC & aumentar los niveles de fuerza'
  );
  const [indicacionPrevia, setIndicacionPrevia] = useState(
    'PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA DE "CORE/MOVILIDAD/ESTABILIDAD" PARA LUEGO COMENZAR CON EL DIA CORRESPONDIENTE'
  );
  const [bloques, setBloques] = useState(DEFAULT_BLOQUES);
  const [dias, setDias] = useState(DEFAULT_PLANILLA_FISICA_E22.dias);
  const [asistenciaDias, setAsistenciaDias] = useState([3, 18]);
  const [diaActivoIndex, setDiaActivoIndex] = useState(0);

  // Estados de interfaz
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const handleRoutineExtracted = (extracted) => {
    if (!extracted) return;
    if (extracted.planNumero) setPlanNumero(extracted.planNumero);
    if (extracted.objetivo) setObjetivo(extracted.objetivo);
    if (extracted.indicacionPrevia) setIndicacionPrevia(extracted.indicacionPrevia);
    if (extracted.bloques && extracted.bloques.length > 0) setBloques(extracted.bloques);
    if (extracted.dias && extracted.dias.length > 0) {
      setDias(extracted.dias);
      setDiaActivoIndex(0);
    }
    setStatusMessage('¡Rutina digitalizada con éxito mediante Gemini IA y cargada en el editor!');
    setTimeout(() => setStatusMessage(''), 5000);
  };

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
          seleccionarSocio(data.socios[0]);
        }
      }
    } catch (err) {
      console.error('Error cargando socios:', err);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarSocio = async (socio) => {
    setSelectedSocio(socio);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/rutinas?usuario_id=${socio.id}`);
      const data = await res.json();

      if (data.ok && data.rutina) {
        const plan = data.rutina.planilla || parsePlanillaData(data.rutina.detalles, data.rutina.titulo);
        setPlanNumero(plan.planNumero || '1');
        setObjetivo(plan.objetivo || `Planilla Personalizada – OBJETIVO: Metas de ${socio.nombre_completo}`);
        setIndicacionPrevia(plan.indicacionPrevia || DEFAULT_PLANILLA_FISICA_E22.indicacionPrevia);
        setBloques(plan.bloques || DEFAULT_BLOQUES);
        setDias(plan.dias || DEFAULT_PLANILLA_FISICA_E22.dias);
        setAsistenciaDias(plan.asistenciaDias || []);
      } else {
        // Inicializar plantilla limpia con el nombre del socio
        setPlanNumero('1');
        setObjetivo(
          `Variación de cargas múltiples – OBJETIVO: Mejorar la condición física de ${socio.nombre_completo}`
        );
        setIndicacionPrevia(DEFAULT_PLANILLA_FISICA_E22.indicacionPrevia);
        setBloques(DEFAULT_BLOQUES);
        setDias(DEFAULT_PLANILLA_FISICA_E22.dias);
        setAsistenciaDias([]);
      }
      setDiaActivoIndex(0);
    } catch (err) {
      console.error('Error al cargar rutina del socio:', err);
    }
  };

  // Acciones sobre Días
  const handleAgregarDia = () => {
    if (dias.length >= 7) {
      alert('Se permite un máximo de 7 días de entrenamiento.');
      return;
    }
    const nuevoNum = dias.length + 1;
    const nuevoDia = {
      dia: nuevoNum,
      enfoque: `Día ${nuevoNum}`,
      ejercicios: [
        {
          id: `d${nuevoNum}_e1`,
          nombre: '',
          valores: bloques.map(() => ({ kg: '', r: '10', s: '4' })),
        },
      ],
    };
    setDias([...dias, nuevoDia]);
    setDiaActivoIndex(dias.length);
  };

  const handleEliminarDia = (index) => {
    if (dias.length <= 1) {
      alert('La rutina debe tener al menos 1 día.');
      return;
    }
    const filtrados = dias
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, dia: i + 1 }));
    setDias(filtrados);
    setDiaActivoIndex(Math.max(0, index - 1));
  };

  // Acciones sobre Ejercicios en el Día Activo
  const handleAgregarEjercicio = () => {
    setDias((prev) => {
      const copy = [...prev];
      const diaAct = copy[diaActivoIndex];
      const nuevoIdx = (diaAct.ejercicios?.length || 0) + 1;
      const nuevoEx = {
        id: `d${diaAct.dia}_e${Date.now()}_${nuevoIdx}`,
        nombre: '',
        valores: bloques.map(() => ({ kg: '', r: '10', s: '4' })),
      };
      copy[diaActivoIndex] = {
        ...diaAct,
        ejercicios: [...(diaAct.ejercicios || []), nuevoEx],
      };
      return copy;
    });
  };

  const handleEliminarEjercicio = (exIdx) => {
    setDias((prev) => {
      const copy = [...prev];
      const diaAct = copy[diaActivoIndex];
      if (diaAct.ejercicios.length <= 1) {
        alert('Debe existir al menos un ejercicio en el día. Puedes dejarlo en blanco o eliminar el día.');
        return copy;
      }
      copy[diaActivoIndex] = {
        ...diaAct,
        ejercicios: diaAct.ejercicios.filter((_, i) => i !== exIdx),
      };
      return copy;
    });
  };

  const handleModificarNombreEjercicio = (exIdx, nuevoNombre) => {
    setDias((prev) => {
      const copy = [...prev];
      const diaAct = copy[diaActivoIndex];
      const exList = [...diaAct.ejercicios];
      exList[exIdx] = { ...exList[exIdx], nombre: nuevoNombre };
      copy[diaActivoIndex] = { ...diaAct, ejercicios: exList };
      return copy;
    });
  };

  const handleModificarValor = (exIdx, bloqueIdx, campo, valor) => {
    setDias((prev) => {
      const copy = [...prev];
      const diaAct = copy[diaActivoIndex];
      const exList = [...diaAct.ejercicios];
      const ex = { ...exList[exIdx] };
      const valList = [...(ex.valores || bloques.map(() => ({ kg: '', r: '10', s: '4' })))];
      valList[bloqueIdx] = {
        ...valList[bloqueIdx],
        [campo]: valor,
      };
      ex.valores = valList;
      exList[exIdx] = ex;
      copy[diaActivoIndex] = { ...diaAct, ejercicios: exList };
      return copy;
    });
  };

  // Modificar encabezados de bloques (Fechas y RIR)
  const handleModificarBloque = (bIdx, campo, valor) => {
    setBloques((prev) => {
      const copy = [...prev];
      copy[bIdx] = { ...copy[bIdx], [campo]: valor };
      return copy;
    });
  };

  // Cargar modelo idéntico de la foto
  const handleCargarModeloFoto = () => {
    if (confirm('¿Deseas cargar la planilla técnica oficial del modelo de ejemplo (foto)? Podrás editar todos los campos libremente.')) {
      setPlanNumero(DEFAULT_PLANILLA_FISICA_E22.planNumero);
      setObjetivo(
        selectedSocio
          ? `Variación de cargas múltiples – OBJETIVO: Mejorar el IMC & fuerza de ${selectedSocio.nombre_completo}`
          : DEFAULT_PLANILLA_FISICA_E22.objetivo
      );
      setIndicacionPrevia(DEFAULT_PLANILLA_FISICA_E22.indicacionPrevia);
      setBloques(DEFAULT_BLOQUES);
      setDias(DEFAULT_PLANILLA_FISICA_E22.dias);
      setAsistenciaDias([3, 18]);
      setDiaActivoIndex(0);
      setStatusMessage('Plantilla técnica de la foto cargada en el editor.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Limpiar planilla para escribir desde cero
  const handleLimpiarPlanilla = () => {
    if (confirm('¿Deseas vaciar la planilla para redactar todos los ejercicios desde cero?')) {
      setDias([
        {
          dia: 1,
          enfoque: 'Día 1',
          ejercicios: [
            {
              id: 'd1_e1',
              nombre: '',
              valores: bloques.map(() => ({ kg: '', r: '10', s: '4' })),
            },
          ],
        },
      ]);
      setDiaActivoIndex(0);
      setAsistenciaDias([]);
    }
  };

  // Guardar en la Base de Datos
  const handleGuardarPlanilla = async () => {
    if (!selectedSocio) {
      alert('Por favor selecciona un socio de la lista.');
      return;
    }

    if (!objetivo.trim()) {
      alert('Por favor especifica un título u objetivo para la planilla.');
      return;
    }

    // Validar que al menos un ejercicio tenga nombre
    const hayEjerciciosConNombre = dias.some((d) =>
      d.ejercicios?.some((e) => e.nombre && e.nombre.trim().length > 0)
    );

    if (!hayEjerciciosConNombre) {
      alert('Por favor agrega por escrito al menos un ejercicio a la planilla antes de guardar.');
      return;
    }

    setSavingRoutine(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const planillaObj = {
        version: '2.0',
        tipo: 'tecnica_e22',
        planNumero: planNumero || '1',
        objetivo: objetivo.trim(),
        indicacionPrevia: indicacionPrevia.trim(),
        bloques,
        dias,
        asistenciaDias,
      };

      const res = await fetch('/api/rutinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: selectedSocio.id,
          profesor_id: currentUser?.id,
          titulo: objetivo.trim(),
          planilla: planillaObj,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al guardar la planilla.');

      setStatusMessage(`¡Planilla guardada y asignada exitosamente a ${selectedSocio.nombre_completo}!`);
      setTimeout(() => setStatusMessage(''), 5000);
      loadSocios();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSavingRoutine(false);
    }
  };

  const diaActual = dias[diaActivoIndex] || dias[0];

  const sociosFiltrados = socios.filter((s) => {
    if (!searchSocio.trim()) return true;
    const term = searchSocio.toLowerCase();
    return s.dni?.includes(term) || s.nombre_completo?.toLowerCase().includes(term);
  });

  const currentPlanillaState = {
    planNumero,
    objetivo,
    indicacionPrevia,
    bloques,
    dias,
    asistenciaDias,
  };

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col font-sans selection:bg-white selection:text-black relative">
      {/* 1. NAVEGACIÓN SUPERIOR GLASS + MÓVIL LIQUID GLASS */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col px-4 sm:px-8 lg:px-10 pt-28 sm:pt-32 lg:pt-36 pb-28 sm:pb-32 space-y-6 max-w-7xl w-full mx-auto min-w-0">
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
                TECHNICAL TRAINING SHEET // E22 GYM STUDIO
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                Editor de Planilla Técnica
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Carga de ejercicios por escrito libre, objetivos individuales y periodización de cargas (estilo hoja física).
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold rounded-xl border border-zinc-700 transition shadow"
                title="Escanear foto de hoja escrita a mano o archivo Excel con Gemini IA"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Escanear con IA</span>
              </button>

              <button
                type="button"
                onClick={() => setVistaPrevia(!vistaPrevia)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
                  vistaPrevia
                    ? 'bg-white text-zinc-950 border-white font-black'
                    : 'bg-e22-card text-zinc-300 border-e22-border hover:bg-zinc-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{vistaPrevia ? 'Volver al Editor' : 'Vista Previa de Planilla'}</span>
              </button>

              <button
                type="button"
                onClick={handleGuardarPlanilla}
                disabled={savingRoutine || !selectedSocio}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingRoutine ? 'Guardando...' : 'Guardar y Asignar Planilla'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CONTENIDO DIVIDIDO: SELECTOR DE SOCIO + FORMULARIO / VISTA PREVIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: LISTA Y SELECCIÓN DE ALUMNOS (4 cols) */}
          <div className="lg:col-span-4 bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Seleccionar Alumno
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {sociosFiltrados.length} Socios
              </span>
            </div>

            {/* Buscador de alumnos */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por DNI o apellido..."
                value={searchSocio}
                onChange={(e) => setSearchSocio(e.target.value)}
                className="w-full bg-[#09090b] border border-e22-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition font-mono"
              />
            </div>

            {/* Lista con scroll */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {sociosFiltrados.map((s) => {
                const isSelected = selectedSocio?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => seleccionarSocio(s)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-850 border-white text-white'
                        : 'bg-[#09090b]/60 border-e22-border/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-xs truncate text-white">{s.nombre_completo}</p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        DNI: {s.dni} • {s.dias_asistencia || 3} Días/Sem
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                    ) : (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          s.estado_pago === 'al_dia'
                            ? 'bg-emerald-500'
                            : s.estado_pago === 'pendiente'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Acciones Rápidas */}
            <div className="pt-2 border-t border-e22-border/60 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                Plantillas & Asistentes IA
              </span>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                <span>Escanear Foto o Excel con IA</span>
              </button>

              <button
                type="button"
                onClick={handleCargarModeloFoto}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Cargar Modelo de la Foto (E22)</span>
              </button>

              <button
                type="button"
                onClick={handleLimpiarPlanilla}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold rounded-xl border border-zinc-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar / Empezar en Blanco</span>
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: EDITOR DE LA PLANILLA TÉCNICA O VISTA PREVIA (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Si está en modo vista previa */}
            {vistaPrevia ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    Previsualización en tiempo real para: <strong>{selectedSocio?.nombre_completo}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setVistaPrevia(false)}
                    className="text-xs text-zinc-400 hover:text-white underline font-mono"
                  >
                    Editar contenido
                  </button>
                </div>
                <TrainingSheet
                  planilla={currentPlanillaState}
                  alumnoNombre={selectedSocio?.nombre_completo || 'Socio E22'}
                  isInteractive={false}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. SECCIÓN DE CABECERA Y METAS */}
                <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
                    <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-white" />
                      1. Identificación y Metas del Alumno
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Socio: <strong>{selectedSocio?.nombre_completo || 'Ninguno'}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Número de Plan */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400">
                        Número de Plan
                      </label>
                      <input
                        type="text"
                        value={planNumero}
                        onChange={(e) => setPlanNumero(e.target.value)}
                        placeholder="Ej: 1"
                        className="w-full bg-[#09090b] border border-e22-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white font-bold"
                      />
                    </div>

                    {/* Título y Objetivo Personalizado del Alumno */}
                    <div className="sm:col-span-9 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400">
                        Título de Planilla & Objetivo Específico del Cliente
                      </label>
                      <input
                        type="text"
                        value={objetivo}
                        onChange={(e) => setObjetivo(e.target.value)}
                        placeholder="Variación de cargas múltiples – OBJETIVO: ..."
                        className="w-full bg-[#09090b] border border-e22-border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    {/* Nota de calentamiento / previo */}
                    <div className="sm:col-span-12 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400">
                        Indicación Previa / Calentamiento y Core
                      </label>
                      <input
                        type="text"
                        value={indicacionPrevia}
                        onChange={(e) => setIndicacionPrevia(e.target.value)}
                        placeholder="PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA..."
                        className="w-full bg-[#09090b] border border-e22-border rounded-xl px-3 py-2 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. CONFIGURACIÓN DE BLOQUES DE PERIODIZACIÓN / FECHAS Y RIR */}
                <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
                    <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white" />
                      2. Bloques de Progresión (Fechas Límite & RIR)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      4 Etapas Periodizadas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {bloques.map((b, bIdx) => (
                      <div
                        key={b.id || bIdx}
                        className="bg-[#09090b] border border-e22-border rounded-xl p-3 space-y-2"
                      >
                        <span className="text-[10px] font-mono uppercase font-black text-zinc-400 block">
                          Etapa {bIdx + 1}
                        </span>
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase">
                            Fecha / Límite
                          </label>
                          <input
                            type="text"
                            value={b.fecha}
                            onChange={(e) => handleModificarBloque(bIdx, 'fecha', e.target.value)}
                            placeholder="Hasta: dd/mm"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase">
                            Intensidad RIR
                          </label>
                          <input
                            type="text"
                            value={b.rir}
                            onChange={(e) => handleModificarBloque(bIdx, 'rir', e.target.value)}
                            placeholder="RIR: 3"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. EDITOR DE EJERCICIOS POR DÍA (ESCRITURA LIBRE) */}
                <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-e22-border/60 pb-3">
                    <div>
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-white" />
                        3. Ejercicios por Escrito Libre & Cargas
                      </span>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Escribe el nombre exacto de cada ejercicio y define reps/series por etapa.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAgregarDia}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Agregar Día</span>
                      </button>
                    </div>
                  </div>

                  {/* Pestañas de Días */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {dias.map((d, idx) => {
                      const isActive = diaActivoIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDiaActivoIndex(idx)}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                            isActive
                              ? 'bg-white text-zinc-950 font-black shadow'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          <span>Día {d.dia}</span>
                          <span className="text-[10px] opacity-70 font-mono">
                            ({d.ejercicios?.length || 0})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Contenedor del Día Activo */}
                  {diaActual && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between bg-[#09090b] p-3 rounded-xl border border-e22-border">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-white text-zinc-950 font-black text-xs flex items-center justify-center">
                            {diaActual.dia}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Configuración de Ejercicios para Día {diaActual.dia}
                          </span>
                        </div>

                        {dias.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarDia(diaActivoIndex)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition font-mono"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar Día {diaActual.dia}</span>
                          </button>
                        )}
                      </div>

                      {/* Lista de Filas de Ejercicios con campos de escritura libre */}
                      <div className="space-y-3">
                        {diaActual.ejercicios?.map((ejercicio, exIdx) => (
                          <div
                            key={ejercicio.id || exIdx}
                            className="bg-[#09090b] border border-e22-border rounded-xl p-3 sm:p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Nombre del Ejercicio escrito por el profesor */}
                              <div className="flex-1">
                                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                                  Ejercicio #{exIdx + 1} (Escribe el nombre libremente)
                                </label>
                                <input
                                  type="text"
                                  value={ejercicio.nombre}
                                  onChange={(e) =>
                                    handleModificarNombreEjercicio(exIdx, e.target.value)
                                  }
                                  placeholder="Ej: Empuje 2 BB C/Mancuernas, Sentadilla frontal C/Barra..."
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-white placeholder-zinc-600"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleEliminarEjercicio(exIdx)}
                                className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition mt-4"
                                title="Eliminar este ejercicio"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Celdas de las 4 etapas para este ejercicio (Kg, Reps, Series) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                              {bloques.map((b, bIdx) => {
                                const val = ejercicio.valores?.[bIdx] || { kg: '', r: '10', s: '4' };
                                return (
                                  <div
                                    key={bIdx}
                                    className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                      <span className="text-zinc-400 font-bold">{b.fecha}</span>
                                      <span className="text-emerald-400">{b.rir}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                                      <div>
                                        <span className="text-[9px] text-zinc-500 block">Kg</span>
                                        <input
                                          type="text"
                                          value={val.kg}
                                          onChange={(e) =>
                                            handleModificarValor(exIdx, bIdx, 'kg', e.target.value)
                                          }
                                          placeholder="—"
                                          className="w-full bg-[#09090b] border border-zinc-700 rounded px-1 py-1 text-center text-white font-bold"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-zinc-500 block">Reps</span>
                                        <input
                                          type="text"
                                          value={val.r}
                                          onChange={(e) =>
                                            handleModificarValor(exIdx, bIdx, 'r', e.target.value)
                                          }
                                          placeholder="4"
                                          className="w-full bg-[#09090b] border border-zinc-700 rounded px-1 py-1 text-center text-white font-bold"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-zinc-500 block">Series</span>
                                        <input
                                          type="text"
                                          value={val.s}
                                          onChange={(e) =>
                                            handleModificarValor(exIdx, bIdx, 's', e.target.value)
                                          }
                                          placeholder="4"
                                          className="w-full bg-[#09090b] border border-zinc-700 rounded px-1 py-1 text-center text-white font-bold"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botón para agregar otro ejercicio a este día */}
                      <button
                        type="button"
                        onClick={handleAgregarEjercicio}
                        className="w-full py-2.5 border border-dashed border-zinc-700 hover:border-zinc-400 hover:bg-zinc-800/40 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Agregar Otro Ejercicio al Día {diaActual.dia}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* BOTÓN FINAL DE GUARDAR */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setVistaPrevia(true)}
                    className="px-4 py-2.5 bg-e22-card border border-e22-border hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition"
                  >
                    Ver Vista Previa
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardarPlanilla}
                    disabled={savingRoutine || !selectedSocio}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {savingRoutine
                        ? 'Guardando Planilla...'
                        : `Guardar Planilla para ${selectedSocio?.nombre_completo || 'Socio'}`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* MODAL DE ESCANEO DE RUTINA CON IA (GEMINI) */}
        <ScanRoutineModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onRoutineExtracted={handleRoutineExtracted}
        />
      </main>
    </div>
  );
}
