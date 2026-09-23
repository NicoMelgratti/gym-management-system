'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TrainingSheet from '@/components/TrainingSheet';
import AICoachWidget from '@/components/AICoachWidget';
import { parsePlanillaData } from '@/lib/rutinas';
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
} from 'lucide-react';

export default function AlumnoRutinaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [alumnoData, setAlumnoData] = useState(null);
  const [rutinaData, setRutinaData] = useState(null);
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAsistencia, setUpdatingAsistencia] = useState(false);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'print'
  const [statusMsg, setStatusMsg] = useState('');

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
        setRutinaData(data.rutina);
        if (data.socio) {
          try {
            const saved = localStorage.getItem('e22_user');
            if (saved) {
              const current = JSON.parse(saved);
              const updated = { ...current, ...data.socio };
              localStorage.setItem('e22_user', JSON.stringify(updated));
              setCurrentUser(updated);
            }
          } catch (e) {
            // ignore
          }
        }
        if (data.rutina) {
          const parsed =
            data.rutina.planilla ||
            parsePlanillaData(data.rutina.detalles, data.rutina.titulo);
          setPlanilla(parsed);
        }
      }
    } catch (err) {
      console.error('Error cargando rutina:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAsistencia = async (diaNum) => {
    if (!currentUser?.id || !planilla) return;

    const setDias = new Set(planilla.asistenciaDias || []);
    const yaAsistio = setDias.has(diaNum);
    if (yaAsistio) {
      setDias.delete(diaNum);
    } else {
      setDias.add(diaNum);
    }

    const nuevosDias = Array.from(setDias).sort((a, b) => a - b);
    const updatedPlanilla = { ...planilla, asistenciaDias: nuevosDias };
    setPlanilla(updatedPlanilla);

    try {
      setUpdatingAsistencia(true);
      const res = await fetch('/api/rutinas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          dia: diaNum,
          asistio: !yaAsistio,
          asistenciaDias: nuevosDias,
        }),
      });

      const resData = await res.json();
      if (resData.ok) {
        setStatusMsg(
          !yaAsistio
            ? `Día ${diaNum} marcado como entrenado en tu ciclo de 30 días.`
            : `Día ${diaNum} desmarcado.`
        );
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error actualizando asistencia:', error);
    } finally {
      setUpdatingAsistencia(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!alumnoData || !planilla) {
      alert('Tu planilla de entrenamiento aún no está disponible para exportar.');
      return;
    }
    generarRutinaPDF({ alumno: alumnoData, rutina: rutinaData, planilla });
  };

  const isAlDia = alumnoData?.estado_pago === 'al_dia' || alumnoData?.habilitado;

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col font-sans selection:bg-white selection:text-black relative">
      {/* 1. NAVEGACIÓN SUPERIOR GLASS + MÓVIL LIQUID GLASS */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col px-4 sm:px-8 lg:px-10 pt-28 sm:pt-32 lg:pt-36 pb-28 sm:pb-32 space-y-6 max-w-7xl w-full mx-auto min-w-0">
        {/* Breadcrumb y Cabecera */}
        <div className="space-y-3 border-b border-e22-border/80 pb-5">
          <Link
            href="/dashboard/alumno"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Resumen de Membresía</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                OFFICIAL TRAINING SHEET // PLAN PERSONALIZADO E22
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                {planilla?.objetivo || rutinaData?.titulo || 'Planilla de Entrenamiento'}
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Socio: <strong>{alumnoData?.nombre_completo || currentUser?.nombre}</strong> • Entrenador Responsable: {rutinaData?.profesor_nombre || 'Staff E22 GYM'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => currentUser?.id && fetchData(currentUser.id)}
                className="p-2 bg-e22-card border border-e22-border hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Selector de Tema de Planilla (Oscuro / Impresión Hoja Física) */}
              <button
                type="button"
                onClick={() => setThemeMode(themeMode === 'dark' ? 'print' : 'dark')}
                className="flex items-center gap-2 px-3.5 py-2 bg-e22-card hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl border border-e22-border transition"
                title="Alternar entre modo oscuro deportivo y estilo hoja física"
              >
                {themeMode === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Estilo Hoja Papel</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Modo Oscuro</span>
                  </>
                )}
              </button>

              {planilla && (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar PDF Oficial</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notificación de Asistencia */}
        {statusMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Notificación de Modo de Uso */}
        <div className="p-3.5 bg-e22-card border border-e22-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong>Planilla Técnica Oficial:</strong> Esta es tu planificación personalizada cargada por tu entrenador. Utiliza la grilla de 30 días al pie de la tabla para registrar cada sesión que completes en la sala.
            </span>
          </div>
          <Link
            href="/dashboard/alumno/progreso"
            className="text-white hover:underline font-mono text-[11px] whitespace-nowrap"
          >
            Registrar Cargas Semanales (PRs) &rarr;
          </Link>
        </div>

        {/* Contenido de la Planilla */}
        {!planilla ? (
          <div className="p-16 text-center bg-e22-card border border-e22-border rounded-2xl space-y-4 max-w-xl mx-auto">
            <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Planilla en Preparación</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                {isAlDia
                  ? 'Tu profesor de E22 está redactando tu planilla de ejercicios personalizada. En cuanto la guarde, aparecerá aquí automáticamente.'
                  : 'Tu profesor te cargará tu planilla técnica personalizada una vez que verifique tu comprobante de pago.'}
              </p>
            </div>
            {!isAlDia && (
              <Link
                href="/dashboard/alumno/pagos"
                className="inline-block px-4 py-2 bg-white text-zinc-950 font-black text-xs rounded-xl hover:bg-zinc-200 transition"
              >
                Notificar Pago Ahora &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render de la Planilla Técnica con componente TrainingSheet */}
            <TrainingSheet
              planilla={planilla}
              alumnoNombre={alumnoData?.nombre_completo || currentUser?.nombre}
              isInteractive={true}
              onToggleAsistencia={handleToggleAsistencia}
              theme={themeMode}
            />

            {/* Ficha médica y notas al pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-e22-card border border-e22-border rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Ficha Médica & Restricciones
                </span>
                <p className="text-xs text-zinc-300 font-mono">
                  Alergias: <strong className="text-white">{alumnoData?.alergias || 'Ninguna'}</strong>
                </p>
                <p className="text-xs text-zinc-300 font-mono">
                  Patologías / Lesiones:{' '}
                  <strong className="text-rose-400">{alumnoData?.patologias || 'Ninguna'}</strong>
                </p>
              </div>

              <div className="p-4 bg-e22-card border border-e22-border rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Metas y Cumplimiento
                </span>
                <p className="text-xs text-zinc-300 font-mono">
                  Sesiones completadas en el ciclo de 30 días:{' '}
                  <strong className="text-emerald-400">
                    {planilla.asistenciaDias?.length || 0} de 30 días
                  </strong>
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Recuerda respetar los tiempos de descanso y consultar con tu entrenador de sala ante dudas de ejecución.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* COACH VIRTUAL INTELIGENTE (GEMINI IA) */}
        <AICoachWidget alumno={alumnoData || currentUser} rutina={rutinaData} />
      </main>
    </div>
  );
}
