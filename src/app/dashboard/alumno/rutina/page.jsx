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
} from '@/lib/rutinas';
import { generarRutinaPDF } from '@/lib/pdfGenerator';
import {
  Dumbbell,
  FileDown,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Printer,
  Moon,
  Sun,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Check,
  RotateCcw,
  Eye,
  User,
  Users,
  Star,
  Info,
} from 'lucide-react';

export default function AlumnoRutinaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [alumnoData, setAlumnoData] = useState(null);

  // Rutinas disponibles
  const [rutinaProfesor, setRutinaProfesor] = useState(null);
  const [rutinaAlumno, setRutinaAlumno] = useState(null);
  const [activaTipo, setActivaTipo] = useState('profesor'); // 'profesor' | 'alumno'
  const [selectedTab, setSelectedTab] = useState('profesor'); // 'profesor' | 'alumno'

  // Estados de carga y feedback
  const [loading, setLoading] = useState(true);
  const [updatingAsistencia, setUpdatingAsistencia] = useState(false);
  const [activating, setActivating] = useState(false);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'print'
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modo Editor de Rutina Personal
  const [modoEdicion, setModoEdicion] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [vistaPreviaEdicion, setVistaPreviaEdicion] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Campos de la Planilla en el Editor
  const [planNumero, setPlanNumero] = useState('1');
  const [objetivo, setObjetivo] = useState('Mi Rutina Personal – Enfoque Hipertrofia & Fuerza');
  const [indicacionPrevia, setIndicacionPrevia] = useState(
    'PREVIAMENTE REALIZAR EJERCICIOS DE MOVILIDAD Y CALENTAMIENTO ARTICULAR'
  );
  const [bloques, setBloques] = useState(DEFAULT_BLOQUES);
  const [dias, setDias] = useState(DEFAULT_PLANILLA_FISICA_E22.dias);
  const [diaActivoIndex, setDiaActivoIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('e22_user');
    if (!saved) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed.rol === 'profesor') {
        router.push('/dashboard/profesor');
        return;
      }
      setCurrentUser(parsed);
      fetchData(parsed.id);
    } catch (e) {
      router.push('/');
    }
  }, []);

  const fetchData = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/socios/${id}`);
      const data = await res.json();
      if (data.ok) {
        setAlumnoData(data.socio);

        const profRoutine = data.rutina_profesor || (data.rutina?.origen !== 'alumno' ? data.rutina : null);
        const alumRoutine = data.rutina_alumno || (data.rutina?.origen === 'alumno' ? data.rutina : null);

        setRutinaProfesor(profRoutine);
        setRutinaAlumno(alumRoutine);

        const currentActive = data.activa || (alumRoutine && alumRoutine.es_activa ? 'alumno' : 'profesor');
        setActivaTipo(currentActive);

        // Si el usuario no tiene rutina del profesor pero sí personal, mostrar la personal
        if (!profRoutine && alumRoutine) {
          setSelectedTab('alumno');
        } else if (currentActive === 'alumno' && alumRoutine) {
          setSelectedTab('alumno');
        } else {
          setSelectedTab('profesor');
        }

        // Si ya tiene rutina personal, precargar los campos en el editor
        if (alumRoutine?.planilla) {
          cargarRutinaEnEditor(alumRoutine.planilla);
        } else {
          cargarPlantillaBase();
        }
      }
    } catch (err) {
      console.error('Error cargando rutina:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarRutinaEnEditor = (planilla) => {
    if (!planilla) return;
    setPlanNumero(planilla.planNumero || '1');
    setObjetivo(planilla.objetivo || 'Mi Rutina Personal E22');
    setIndicacionPrevia(planilla.indicacionPrevia || DEFAULT_PLANILLA_FISICA_E22.indicacionPrevia);
    setBloques(planilla.bloques && planilla.bloques.length > 0 ? planilla.bloques : DEFAULT_BLOQUES);
    setDias(planilla.dias && planilla.dias.length > 0 ? planilla.dias : DEFAULT_PLANILLA_FISICA_E22.dias);
    setDiaActivoIndex(0);
  };

  const cargarPlantillaBase = () => {
    setPlanNumero('1');
    setObjetivo(
      `Plan Personal E22 – OBJETIVO: Fuerza y Desarrollo de ${currentUser?.nombre || 'Alumno'}`
    );
    setIndicacionPrevia(DEFAULT_PLANILLA_FISICA_E22.indicacionPrevia);
    setBloques(DEFAULT_BLOQUES);
    setDias(DEFAULT_PLANILLA_FISICA_E22.dias);
    setDiaActivoIndex(0);
  };

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
    setStatusMsg('¡Rutina digitalizada con éxito mediante Gemini IA y cargada en tu editor!');
    setModoEdicion(true);
    setTimeout(() => setStatusMsg(''), 5000);
  };

  // Alternar rutina activa (del profesor vs personal)
  const handleActivarRutina = async (tipo) => {
    if (!currentUser?.id || activating) return;
    setActivating(true);
    try {
      const res = await fetch('/api/rutinas/activar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          tipo,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al cambiar la rutina activa.');

      setActivaTipo(tipo);
      setSelectedTab(tipo);
      setStatusMsg(
        tipo === 'alumno'
          ? '¡Tu rutina personal ahora es tu rutina activa y predeterminada!'
          : '¡La rutina de tu profesor ahora es tu rutina activa y predeterminada!'
      );
      setTimeout(() => setStatusMsg(''), 4000);
      fetchData(currentUser.id);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setActivating(false);
    }
  };

  // Guardar rutina personal (máximo 1: reemplaza la anterior)
  const handleGuardarRutinaPersonal = async () => {
    if (!currentUser?.id) return;

    if (!objetivo.trim()) {
      alert('Por favor especifica un título u objetivo para tu rutina personal.');
      return;
    }

    const tieneEjercicios = dias.some((d) =>
      d.ejercicios?.some((e) => e.nombre && e.nombre.trim().length > 0)
    );

    if (!tieneEjercicios) {
      alert('Debes agregar al menos un ejercicio con nombre en tu rutina.');
      return;
    }

    setSavingPersonal(true);
    try {
      const planillaToSave = {
        planNumero,
        objetivo: objetivo.trim(),
        indicacionPrevia: indicacionPrevia.trim(),
        bloques,
        dias,
        asistenciaDias: rutinaAlumno?.planilla?.asistenciaDias || [],
      };

      const res = await fetch('/api/rutinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          origen: 'alumno',
          titulo: objetivo.trim(),
          planilla: planillaToSave,
          hacer_activa: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al guardar tu rutina.');

      setStatusMsg('¡Tu rutina personal ha sido guardada con éxito y establecida como activa!');
      setModoEdicion(false);
      setVistaPreviaEdicion(false);
      setSelectedTab('alumno');
      setActivaTipo('alumno');
      setTimeout(() => setStatusMsg(''), 5000);
      fetchData(currentUser.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingPersonal(false);
    }
  };

  // Eliminar rutina personal (sacrificar la personal y restaurar la del profesor)
  const handleEliminarRutinaPersonal = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar tu rutina personal? Esta acción no se puede deshacer y tu rutina activa volverá a ser la de tu profesor.')) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/rutinas?usuario_id=${currentUser.id}&tipo=alumno`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al eliminar rutina.');

      setStatusMsg('Rutina personal eliminada. Tu rutina oficial del profesor vuelve a ser la activa.');
      setModoEdicion(false);
      setSelectedTab('profesor');
      setActivaTipo('profesor');
      setTimeout(() => setStatusMsg(''), 5000);
      fetchData(currentUser.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Acciones en el Editor
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
      alert('La rutina debe tener al menos 1 día de entrenamiento.');
      return;
    }
    const filtrados = dias
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, dia: i + 1 }));
    setDias(filtrados);
    setDiaActivoIndex(Math.max(0, index - 1));
  };

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
        alert('Debe haber al menos un ejercicio en el día.');
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

  const handleModificarBloque = (bIdx, campo, valor) => {
    setBloques((prev) => {
      const copy = [...prev];
      copy[bIdx] = { ...copy[bIdx], [campo]: valor };
      return copy;
    });
  };

  const handleLimpiarPlanilla = () => {
    if (confirm('¿Deseas vaciar la planilla para redactar todos tus ejercicios desde cero?')) {
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
    }
  };

  // Alternar asistencia de 30 días
  const handleToggleAsistencia = async (diaNum) => {
    const routineInView = selectedTab === 'profesor' ? rutinaProfesor : rutinaAlumno;
    if (!currentUser?.id || !routineInView?.planilla) return;

    const currentPlanilla = routineInView.planilla;
    const setDias = new Set(currentPlanilla.asistenciaDias || []);
    const yaAsistio = setDias.has(diaNum);
    if (yaAsistio) {
      setDias.delete(diaNum);
    } else {
      setDias.add(diaNum);
    }

    const nuevosDias = Array.from(setDias).sort((a, b) => a - b);
    const updatedPlanilla = { ...currentPlanilla, asistenciaDias: nuevosDias };

    if (selectedTab === 'profesor') {
      setRutinaProfesor({ ...rutinaProfesor, planilla: updatedPlanilla });
    } else {
      setRutinaAlumno({ ...rutinaAlumno, planilla: updatedPlanilla });
    }

    try {
      setUpdatingAsistencia(true);
      await fetch('/api/rutinas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          rutina_id: routineInView.id,
          dia: diaNum,
          asistio: !yaAsistio,
          asistenciaDias: nuevosDias,
        }),
      });
      setStatusMsg(
        !yaAsistio
          ? `Día ${diaNum} marcado como entrenado en tu ciclo de 30 días.`
          : `Día ${diaNum} desmarcado.`
      );
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (error) {
      console.error('Error actualizando asistencia:', error);
    } finally {
      setUpdatingAsistencia(false);
    }
  };

  // Descarga de PDF
  const handleDownloadPDF = () => {
    const routineInView = selectedTab === 'profesor' ? rutinaProfesor : rutinaAlumno;
    if (!alumnoData || !routineInView?.planilla) {
      alert('La planilla aún no está disponible para exportar.');
      return;
    }
    generarRutinaPDF({ alumno: alumnoData, rutina: routineInView, planilla: routineInView.planilla });
  };

  const isAlDia = alumnoData?.estado_pago === 'al_dia' || alumnoData?.habilitado;
  const routineInView = selectedTab === 'profesor' ? rutinaProfesor : rutinaAlumno;
  const isViewActive = activaTipo === selectedTab;

  const currentPlanillaState = {
    planNumero,
    objetivo,
    indicacionPrevia,
    bloques,
    dias,
    asistenciaDias: rutinaAlumno?.planilla?.asistenciaDias || [],
  };

  const diaActual = dias[diaActivoIndex] || dias[0];

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col font-sans selection:bg-white selection:text-black relative">
      <Sidebar user={currentUser} />

      <main className="flex-1 flex flex-col px-4 sm:px-8 lg:px-10 pt-28 sm:pt-32 lg:pt-36 pb-28 sm:pb-32 space-y-6 max-w-6xl w-full mx-auto min-w-0">
        {/* Cabecera y Navegación Superior */}
        <div className="space-y-4 border-b border-e22-border/80 pb-5">
          <Link
            href="/dashboard/alumno"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Resumen de Membresía</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                CENTRO DE ENTRENAMIENTO // E22 CORE STUDIO
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                {modoEdicion
                  ? 'Editor de Rutina Personal'
                  : routineInView?.planilla?.objetivo || routineInView?.titulo || 'Planilla de Rutina'}
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {modoEdicion
                  ? 'Carga o escanea con IA tu propio plan técnico. Se mantendrá 1 rutina personal a la vez.'
                  : `Socio: ${alumnoData?.nombre_completo || currentUser?.nombre} • Plan Activo: ${
                      activaTipo === 'profesor' ? 'Rutina del Profesor' : 'Mi Rutina Personal'
                    }`}
              </p>
            </div>

            {/* Acciones Rápidas de Cabecera */}
            <div className="flex items-center gap-2 flex-wrap">
              {!modoEdicion ? (
                <>
                  <button
                    type="button"
                    onClick={() => currentUser?.id && fetchData(currentUser.id)}
                    className="p-2.5 bg-e22-card border border-e22-border hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition shadow-sm"
                    title="Actualizar datos"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode(themeMode === 'dark' ? 'print' : 'dark')}
                    className="flex items-center gap-2 px-3.5 py-2 bg-e22-card hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl border border-e22-border transition shadow-sm"
                  >
                    {themeMode === 'dark' ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Hoja Papel</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="hidden sm:inline">Modo Oscuro</span>
                      </>
                    )}
                  </button>

                  {routineInView?.planilla && (
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setModoEdicion(false);
                    setVistaPreviaEdicion(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-700 transition"
                >
                  <span>Volver a Planillas</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {statusMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 font-mono animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SELECTOR SEGMENTADO DE RUTINAS (DEL PROFESOR vs MI RUTINA PERSONAL) */}
        {!modoEdicion && (
          <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-e22-border/60 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                  SELECTOR DE RUTINA // PLANES DISPONIBLES
                </span>
                <p className="text-xs text-zinc-300 font-medium">
                  Elige qué rutina ver o activar. Solo se entrena con 1 rutina predeterminada activa a la vez.
                </p>
              </div>

              {/* Botón para crear o editar la rutina personal */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (rutinaAlumno?.planilla) {
                      cargarRutinaEnEditor(rutinaAlumno.planilla);
                    } else {
                      cargarPlantillaBase();
                    }
                    setModoEdicion(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-black rounded-xl shadow-lg transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{rutinaAlumno ? 'Editar Mi Rutina' : '+ Cargar Mi Propia Rutina (IA)'}</span>
                </button>
              </div>
            </div>

            {/* Tarjetas Segmentadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tarjeta 1: Rutina del Profesor */}
              <div
                onClick={() => setSelectedTab('profesor')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                  selectedTab === 'profesor'
                    ? 'bg-zinc-900 border-white/40 shadow-lg ring-1 ring-white/20'
                    : 'bg-e22-bg border-e22-border hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                        Rutina del Profesor
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {rutinaProfesor?.profesor_nombre
                          ? `Asignada por Prof. ${rutinaProfesor.profesor_nombre}`
                          : 'Asignada por el Staff de E22'}
                      </p>
                    </div>
                  </div>

                  {activaTipo === 'profesor' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVA
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
                      DISPONIBLE
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {rutinaProfesor?.planilla?.objetivo || rutinaProfesor?.titulo || 'Plan oficial del gimnasio'}
                </div>

                {rutinaProfesor && activaTipo !== 'profesor' && selectedTab === 'profesor' && (
                  <button
                    type="button"
                    disabled={activating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivarRutina('profesor');
                    }}
                    className="w-full py-1.5 px-3 bg-white text-zinc-950 font-black text-xs rounded-lg hover:bg-zinc-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Establecer como Rutina Activa</span>
                  </button>
                )}
              </div>

              {/* Tarjeta 2: Mi Rutina Personal */}
              <div
                onClick={() => setSelectedTab('alumno')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                  selectedTab === 'alumno'
                    ? 'bg-zinc-900 border-white/40 shadow-lg ring-1 ring-white/20'
                    : 'bg-e22-bg border-e22-border hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                        Mi Rutina Personal
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded">
                          AUTORÍA PROPIA
                        </span>
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {rutinaAlumno ? 'Plan personalizado creado por ti' : 'Aún no cargaste una rutina propia'}
                      </p>
                    </div>
                  </div>

                  {rutinaAlumno ? (
                    activaTipo === 'alumno' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
                        DISPONIBLE
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
                      SIN CARGAR
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {rutinaAlumno?.planilla?.objetivo || rutinaAlumno?.titulo || 'Redacta o escanea tu hoja con IA'}
                </div>

                {rutinaAlumno && activaTipo !== 'alumno' && selectedTab === 'alumno' && (
                  <button
                    type="button"
                    disabled={activating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivarRutina('alumno');
                    }}
                    className="w-full py-1.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Establecer como Rutina Activa</span>
                  </button>
                )}
              </div>
            </div>

            {/* Banner Informativo si se está viendo la rutina inactiva */}
            {!isViewActive && routineInView && (
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-300 font-mono">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Estás viendo la <strong>{selectedTab === 'profesor' ? 'Rutina del Profesor' : 'Rutina Personal'}</strong> (en modo consulta). Tu rutina activa actualmente es la <strong>{activaTipo === 'profesor' ? 'del Profesor' : 'Personal'}</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={activating}
                  onClick={() => handleActivarRutina(selectedTab)}
                  className="px-3 py-1 bg-white text-zinc-950 font-bold text-xs rounded-lg hover:bg-zinc-200 transition shrink-0 ml-2"
                >
                  Activar esta
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================= MODO VISOR DE PLANILLA ======================= */}
        {!modoEdicion ? (
          !routineInView?.planilla ? (
            <div className="p-12 sm:p-16 text-center bg-e22-card border border-e22-border rounded-2xl space-y-4 max-w-xl mx-auto shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white uppercase">
                  {selectedTab === 'alumno' ? 'Aún no cargaste tu rutina personal' : 'Planilla en Preparación'}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  {selectedTab === 'alumno'
                    ? 'Puedes armar tu propia rutina personalizada por escrito libre o digitalizar una foto de tu planilla de entrenamiento con Gemini IA.'
                    : isAlDia
                    ? 'Tu profesor de E22 está redactando tu planilla de ejercicios personalizada. En cuanto la guarde, aparecerá aquí.'
                    : 'Tu profesor te asignará la rutina personalizada una vez que verifique tu cuota.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {selectedTab === 'alumno' ? (
                  <button
                    type="button"
                    onClick={() => {
                      cargarPlantillaBase();
                      setModoEdicion(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white text-zinc-950 font-black text-xs rounded-xl hover:bg-zinc-200 transition shadow flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Comenzar a Crear Mi Rutina</span>
                  </button>
                ) : (
                  !isAlDia && (
                    <Link
                      href="/dashboard/alumno/pagos"
                      className="inline-block px-4 py-2 bg-white text-zinc-950 font-black text-xs rounded-xl hover:bg-zinc-200 transition"
                    >
                      Notificar Pago Ahora &rarr;
                    </Link>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Planilla Técnica Renderizada */}
              <TrainingSheet
                planilla={routineInView.planilla}
                alumnoNombre={alumnoData?.nombre_completo || currentUser?.nombre}
                isInteractive={true}
                onToggleAsistencia={handleToggleAsistencia}
                theme={themeMode}
              />

              {/* Botón adicional de edición si es la rutina personal */}
              {selectedTab === 'alumno' && (
                <div className="p-4 bg-e22-card border border-e22-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Edit3 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Esta es tu rutina personal. Si deseas hacer ajustes en cargas, días o ejercicios, puedes editarla.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleEliminarRutinaPersonal}
                      className="px-3.5 py-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Mi Rutina</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        cargarRutinaEnEditor(routineInView.planilla);
                        setModoEdicion(true);
                      }}
                      className="px-4 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Mi Rutina</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          /* ======================= MODO EDITOR DE RUTINA PERSONAL ======================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Barra de Acciones del Editor */}
            <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  CREADOR DE RUTINA PERSONAL // ASISTENCIA IA
                </span>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Puedes escribir tus propios ejercicios o escanear una foto con IA. Solo tendrás 1 rutina personal activa (reemplazable).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-black rounded-xl transition shadow"
                  title="Digitalizar una foto de tu planilla de entrenamiento o archivo Excel"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Escanear Foto/Excel con IA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVistaPreviaEdicion(!vistaPreviaEdicion)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
                    vistaPreviaEdicion
                      ? 'bg-white text-zinc-950 border-white font-black'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{vistaPreviaEdicion ? 'Volver a Editar' : 'Vista Previa'}</span>
                </button>

                <button
                  type="button"
                  disabled={savingPersonal}
                  onClick={handleGuardarRutinaPersonal}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingPersonal ? 'Guardando...' : 'Guardar y Activar'}</span>
                </button>
              </div>
            </div>

            {/* Vista Previa en Tiempo Real si se activó */}
            {vistaPreviaEdicion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Previsualización del formato oficial físico:</span>
                  <button
                    type="button"
                    onClick={() => setVistaPreviaEdicion(false)}
                    className="text-white underline font-bold"
                  >
                    Regresar al Editor
                  </button>
                </div>
                <TrainingSheet
                  planilla={currentPlanillaState}
                  alumnoNombre={alumnoData?.nombre_completo || currentUser?.nombre}
                  isInteractive={false}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Metas y Título del Plan */}
                <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
                    <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      1. Identificación y Objetivos de tu Plan
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLimpiarPlanilla}
                        className="text-[11px] font-mono text-zinc-400 hover:text-rose-400 transition"
                      >
                        Vaciar
                      </button>
                      <span className="text-zinc-600">|</span>
                      <button
                        type="button"
                        onClick={cargarPlantillaBase}
                        className="text-[11px] font-mono text-zinc-400 hover:text-white transition"
                      >
                        Plantilla Base
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                        Nº de Plan
                      </label>
                      <input
                        type="text"
                        value={planNumero}
                        onChange={(e) => setPlanNumero(e.target.value)}
                        placeholder="1"
                        className="w-full bg-[#09090b] border border-e22-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white font-bold"
                      />
                    </div>

                    <div className="sm:col-span-9 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                        Título de Planilla & Objetivo Específico
                      </label>
                      <input
                        type="text"
                        value={objetivo}
                        onChange={(e) => setObjetivo(e.target.value)}
                        placeholder="Ej: Variación de cargas – OBJETIVO: Fuerza e Hipertrofia..."
                        className="w-full bg-[#09090b] border border-e22-border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="sm:col-span-12 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                        Indicación Previa / Calentamiento y Core
                      </label>
                      <input
                        type="text"
                        value={indicacionPrevia}
                        onChange={(e) => setIndicacionPrevia(e.target.value)}
                        placeholder="PREVIAMENTE REALIZAR EJERCICIOS DE MOVILIDAD..."
                        className="w-full bg-[#09090b] border border-e22-border rounded-xl px-3 py-2 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Bloques de Progresión (Fechas y RIR) */}
                <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
                    <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      2. Bloques de Progresión (4 Etapas Periodizadas)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      RIR & Fechas Límite
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

                {/* 3. Editor de Ejercicios por Día */}
                <div className="bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-e22-border/60 pb-3">
                    <div>
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-emerald-400" />
                        3. Ejercicios por Día (Escritura Libre)
                      </span>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Agrega los días que entrenas y completa cada ejercicio con repeticiones y series.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAgregarDia}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Agregar Día</span>
                    </button>
                  </div>

                  {/* Pestañas de Días */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
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

                  {/* Configuración del Día Activo */}
                  {diaActual && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between bg-[#09090b] p-3 rounded-xl border border-e22-border">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-white text-zinc-950 font-black text-xs flex items-center justify-center">
                            {diaActual.dia}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Configuración del Día {diaActual.dia}
                          </span>
                        </div>

                        {dias.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarDia(diaActivoIndex)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar este día</span>
                          </button>
                        )}
                      </div>

                      {/* Enfoque del Día */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                          Enfoque del Día {diaActual.dia} (ej: Pecho & Tríceps, Piernas Femorales, etc.)
                        </label>
                        <input
                          type="text"
                          value={diaActual.enfoque || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDias((prev) => {
                              const copy = [...prev];
                              copy[diaActivoIndex] = { ...copy[diaActivoIndex], enfoque: val };
                              return copy;
                            });
                          }}
                          placeholder={`Día ${diaActual.dia} – Enfoque Muscular`}
                          className="w-full bg-[#09090b] border border-e22-border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-white"
                        />
                      </div>

                      {/* Lista de Ejercicios */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                            Ejercicios de la Sesión ({diaActual.ejercicios?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={handleAgregarEjercicio}
                            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold font-mono"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Ejercicio</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {diaActual.ejercicios?.map((ex, exIdx) => (
                            <div
                              key={ex.id || exIdx}
                              className="bg-[#09090b] border border-e22-border rounded-2xl p-3.5 space-y-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-zinc-300 font-mono">
                                  #{exIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={ex.nombre}
                                  onChange={(e) => handleModificarNombreEjercicio(exIdx, e.target.value)}
                                  placeholder="Escribe el nombre del ejercicio (ej: Press de Banca Plano, Sentadilla con Barra)..."
                                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleEliminarEjercicio(exIdx)}
                                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition"
                                  title="Eliminar ejercicio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Parámetros por Etapas (Kg, R, S) */}
                              <div className="overflow-x-auto">
                                <div className="grid grid-cols-4 gap-2 min-w-[480px]">
                                  {bloques.map((b, bIdx) => {
                                    const val = ex.valores?.[bIdx] || { kg: '', r: '10', s: '4' };
                                    return (
                                      <div
                                        key={bIdx}
                                        className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2 space-y-1.5"
                                      >
                                        <div className="text-[10px] font-mono text-zinc-400 font-bold flex justify-between">
                                          <span>Etapa {bIdx + 1}</span>
                                          <span className="text-emerald-400 text-[9px]">{b.rir}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                                          <div>
                                            <span className="text-[8px] text-zinc-500 uppercase block">KG</span>
                                            <input
                                              type="text"
                                              value={val.kg ?? ''}
                                              onChange={(e) => handleModificarValor(exIdx, bIdx, 'kg', e.target.value)}
                                              placeholder="Kg"
                                              className="w-full bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-center text-white text-[11px]"
                                            />
                                          </div>
                                          <div>
                                            <span className="text-[8px] text-zinc-500 uppercase block">REPS</span>
                                            <input
                                              type="text"
                                              value={val.r ?? ''}
                                              onChange={(e) => handleModificarValor(exIdx, bIdx, 'r', e.target.value)}
                                              placeholder="10"
                                              className="w-full bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-center text-white text-[11px]"
                                            />
                                          </div>
                                          <div>
                                            <span className="text-[8px] text-zinc-500 uppercase block">SETS</span>
                                            <input
                                              type="text"
                                              value={val.s ?? ''}
                                              onChange={(e) => handleModificarValor(exIdx, bIdx, 's', e.target.value)}
                                              placeholder="4"
                                              className="w-full bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-center text-white text-[11px]"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={handleAgregarEjercicio}
                          className="w-full py-2.5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-dashed border-zinc-700 transition flex items-center justify-center gap-2 text-xs font-bold"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Añadir Otro Ejercicio al Día {diaActual.dia}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra Inferior de Guardado */}
                <div className="p-4 bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-40 shadow-2xl">
                  <span className="text-xs text-zinc-400 font-mono">
                    Recuerda: al guardar, tu rutina personal se establecerá como la activa.
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setModoEdicion(false)}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      disabled={savingPersonal}
                      onClick={handleGuardarRutinaPersonal}
                      className="px-5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{savingPersonal ? 'Guardando...' : 'Guardar y Establecer como Activa'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Escaneo con IA */}
        <ScanRoutineModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onRoutineExtracted={handleRoutineExtracted}
        />
      </main>
    </div>
  );
}
