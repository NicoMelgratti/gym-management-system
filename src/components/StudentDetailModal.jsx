'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  HeartPulse,
  AlertTriangle,
  Dumbbell,
  CheckCircle2,
  DollarSign,
  Save,
  MessageCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PLANILLA_6_DIAS, formatearPlanillaATexto } from '@/lib/rutinas';

export default function StudentDetailModal({
  alumnoId,
  profesorId,
  onClose,
  onStudentUpdated,
}) {
  const [alumno, setAlumno] = useState(null);
  const [rutina, setRutina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Estados del editor de rutina
  const [rutinaTitulo, setRutinaTitulo] = useState('Plan E22 - 6 Días (Lunes a Sábado)');
  const [rutinaDetalles, setRutinaDetalles] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState(6);

  useEffect(() => {
    if (!alumnoId) return;
    loadStudentData();
  }, [alumnoId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/alumnos/${alumnoId}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error al cargar datos del alumno.');
      }

      setAlumno(data.alumno);
      setRutina(data.rutina);

      if (data.rutina) {
        setRutinaTitulo(data.rutina.titulo || 'Plan de Entrenamiento E22');
        setRutinaDetalles(data.rutina.detalles || '');
      } else {
        // Inicializar con la planilla de 6 días
        setRutinaTitulo('Plan E22 - 6 Días (Lunes a Sábado)');
        setRutinaDetalles(formatearPlanillaATexto(PLANILLA_6_DIAS.dias));
      }

      if (data.alumno?.dias_asistencia) {
        setDiasSeleccionados(data.alumno.dias_asistencia);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPresetDays = (numDias) => {
    setDiasSeleccionados(numDias);
    const diasRecortados = PLANILLA_6_DIAS.dias.slice(0, numDias);
    setRutinaTitulo(`Plan E22 - ${numDias} Días (${diasRecortados.map((d) => d.dia).join(', ')})`);
    setRutinaDetalles(formatearPlanillaATexto(diasRecortados));
    setMessage(`Planilla ajustada automáticamente a ${numDias} días de asistencia.`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveRoutine = async (e) => {
    if (e) e.preventDefault();
    if (!rutinaTitulo.trim() || !rutinaDetalles.trim()) {
      setError('El título y los ejercicios de la rutina no pueden estar vacíos.');
      return;
    }

    setSavingRoutine(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/alumnos/${alumnoId}/rutina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: rutinaTitulo.trim(),
          detalles: rutinaDetalles.trim(),
          profesor_id: profesorId || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error al guardar la rutina.');
      }

      setRutina(data.rutina);
      setMessage('¡Rutina asignada y guardada con éxito en la base de datos E22!');
      if (onStudentUpdated) {
        onStudentUpdated({ ...alumno, rutina_titulo: data.rutina.titulo });
      }
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleRegisterPayment = async () => {
    setRecordingPayment(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/alumnos/${alumnoId}/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meses: 1, metodo: 'efectivo' }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error al registrar el pago.');
      }

      setAlumno(data.alumno);
      setMessage('¡Pago registrado! 30 días de membresía acreditados.');
      if (onStudentUpdated) {
        onStudentUpdated(data.alumno);
      }
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setRecordingPayment(false);
    }
  };

  if (!alumnoId) return null;

  const isVerde = alumno?.estado_pago === 'verde';
  const isAmarillo = alumno?.estado_pago === 'amarillo';
  const isRojo = alumno?.estado_pago === 'rojo';

  const cleanPhone = (alumno?.telefono || '').replace(/[^\d+]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Encabezado del Alumno */}
        <div className="p-5 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-black border border-slate-700 shrink-0">
              <Image src="/logo.png" alt="E22 Gym" fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {alumno?.nombre_completo || alumno?.nombre}
                </h2>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full border ${
                    isVerde
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isAmarillo
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isVerde ? 'Al Día' : isAmarillo ? 'Por Vencer' : 'Vencido / Sin Pago'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Socio E22 • DNI: <span className="font-mono text-slate-200">{alumno?.dni}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificaciones */}
        {message && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cuerpo Principal del Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Fila de Datos y Ficha Médica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta 1: Información de Contacto y Asistencia */}
            <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-rose-400" /> Datos del Socio
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Teléfono:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-200">{alumno?.telefono || 'No indicado'}</span>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded transition"
                        title="Escribir por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-300">{alumno?.email || 'Sin registrar'}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Frecuencia semanal:</span>
                  <span className="font-bold text-white bg-slate-700 px-2 py-0.5 rounded">
                    {alumno?.dias_asistencia || 3} Días / semana
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Ficha de Salud (Alergias y Patologías) */}
            <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <HeartPulse className="w-4 h-4" /> Ficha de Salud & Condiciones
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-0.5">⚠️ Alergias Registradas:</span>
                  <p className="text-slate-300 italic">{alumno?.alergias || 'Ninguna indicada'}</p>
                </div>

                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="font-bold text-rose-400 block mb-0.5">🩺 Patologías / Lesiones:</span>
                  <p className="text-slate-300 italic">{alumno?.patologias || 'Ninguna indicada'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de Membresía y Cobro */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado de la Membresía E22
              </p>
              <p className="text-sm text-slate-200">
                Vencimiento:{' '}
                <strong className="text-white">
                  {alumno?.vencimiento_cuota
                    ? new Date(alumno.vencimiento_cuota).toLocaleDateString('es-AR')
                    : 'Sin pago previo'}
                </strong>
                {alumno?.dias_restantes !== undefined && (
                  <span className="ml-2 font-mono text-emerald-400">
                    ({alumno.dias_restantes > 0 ? `${alumno.dias_restantes} días restantes` : 'Vencido'})
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={handleRegisterPayment}
              disabled={recordingPayment}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              {recordingPayment ? 'Acreditando...' : 'Registrar Cobro (Sumar 30 Días)'}
            </button>
          </div>

          {/* Módulo de Carga de Rutina y Enlace al Editor de Planilla Técnica */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-base font-black text-white">
                    Planilla de Entrenamiento E22
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Protocolo oficial con metas personalizadas, ejercicios libres y periodización.
                  </p>
                </div>
              </div>

              <a
                href="/dashboard/profesor/rutinas"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Abrir en Editor de Planilla Técnica &rarr;</span>
              </a>
            </div>

            {/* Editor Rápido */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Título de la Rutina / Objetivo del Cliente
                </label>
                <input
                  type="text"
                  value={rutinaTitulo}
                  onChange={(e) => setRutinaTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Ejercicios y Detalles (o usa el Editor de Planilla Técnica para la tabla con bloques)
                </label>
                <textarea
                  value={rutinaDetalles}
                  onChange={(e) => setRutinaDetalles(e.target.value)}
                  rows={8}
                  className="w-full p-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-white resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Guardar Rutina */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                Para el formato de hoja física con bloques y RIR, utiliza el Editor de Planilla Técnica.
              </span>
              <button
                type="button"
                onClick={handleSaveRoutine}
                disabled={savingRoutine}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black rounded-xl shadow transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingRoutine ? 'Guardando...' : 'Guardar Rutina Rápida'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
