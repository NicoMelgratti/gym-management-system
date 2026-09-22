'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
  Calendar,
  Dumbbell,
  BarChart3,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HeartPulse,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function AlumnoDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [socioData, setSocioData] = useState(null);
  const [rutinaData, setRutinaData] = useState(null);
  const [registrosPeso, setRegistrosPeso] = useState([]);
  const [loading, setLoading] = useState(true);

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
      loadProfile(parsed.id);
    } catch (e) {
      router.push('/');
    }
  }, []);

  const loadProfile = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/socios/${id}`);
      const data = await res.json();
      if (data.ok) {
        setSocioData(data.socio);
        setRutinaData(data.rutina);
        setRegistrosPeso(data.registros_peso || []);
      }
    } catch (err) {
      console.error('Error cargando perfil del socio:', err);
    } finally {
      setLoading(false);
    }
  };

  const dias = socioData?.dias_restantes ?? 0;
  const isAlDia = socioData?.estado_pago === 'al_dia' && dias > 0;
  const isPendiente = socioData?.estado_pago === 'pendiente';
  const isVencido = !isAlDia && !isPendiente;

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* 1. SIDEBAR */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 space-y-6 overflow-y-auto max-w-7xl w-full min-w-0">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-e22-border/80 pb-5">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              MEMBER ACCESS PORTAL // E22 CORE
            </span>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase">
              HOLA, {socioData?.nombre || currentUser?.nombre}
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              DNI: {socioData?.dni || currentUser?.dni} • Plan de Entrenamiento Oficial
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => currentUser?.id && loadProfile(currentUser.id)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-e22-card border border-e22-border hover:bg-zinc-900 hover:text-white transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>
            <Link
              href="/dashboard/alumno/rutina"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black text-zinc-950 bg-white hover:bg-zinc-200 transition flex items-center justify-center gap-2 shadow"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Ver Planilla</span>
            </Link>
          </div>
        </div>

        {/* 3. CARD DE CONTADOR DE 30 DÍAS DE SUSCRIPCIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Contador de Membresía */}
          <div className="lg:col-span-8 bg-e22-card border border-e22-border rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  ESTADO DE SUSCRIPCIÓN // 30-DAY CYCLE
                </span>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isAlDia
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : isPendiente
                        ? 'bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse'
                        : 'bg-red-500 shadow-sm shadow-red-500/50'
                    }`}
                  />
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    {isAlDia
                      ? 'Membresía Activa y Habilitada'
                      : isPendiente
                      ? 'Comprobante en Verificación'
                      : 'Cuota Pendiente de Pago'}
                  </h3>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border shrink-0 ${
                  isAlDia
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                    : isPendiente
                    ? 'bg-amber-950/40 text-amber-400 border-amber-900'
                    : 'bg-red-950/40 text-red-400 border-red-900'
                }`}
              >
                {isAlDia ? 'AL DÍA' : isPendiente ? 'PENDIENTE' : 'VENCIDO'}
              </span>
            </div>

            {/* Número gigante de días */}
            <div className="my-5 sm:my-6 flex items-baseline gap-3">
              <span className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-white leading-none">
                {dias}
              </span>
              <div>
                <span className="text-xs sm:text-sm uppercase tracking-wider font-bold text-zinc-400 block">
                  Días Restantes
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-500 font-mono">
                  {socioData?.vencimiento_cuota
                    ? `Vence: ${socioData.vencimiento_cuota}`
                    : 'Aún no posee cuota aprobada'}
                </span>
              </div>
            </div>

            {/* Barra de progreso de los 30 días */}
            <div className="space-y-2">
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-e22-border">
                <div
                  className={`h-full transition-all duration-500 ${
                    isAlDia ? 'bg-white' : isPendiente ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (dias / 30) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>0 días</span>
                <span>Ciclo de 30 días activo</span>
                <span>30 días</span>
              </div>
            </div>

            {/* Alerta de pago si no está al día */}
            {!isAlDia && (
              <div className="mt-5 pt-4 border-t border-e22-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isPendiente
                      ? 'Tu profesor está validando tu comprobante de pago para extender los 30 días.'
                      : 'Realiza tu transferencia para activar los 30 días y habilitar tu rutina.'}
                  </span>
                </div>
                <Link
                  href="/dashboard/alumno/pagos"
                  className="shrink-0 px-3.5 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-black rounded-lg transition"
                >
                  Notificar Pago
                </Link>
              </div>
            )}
          </div>

          {/* Tarjeta de Ficha de Salud & Asistencia */}
          <div className="lg:col-span-4 bg-e22-card border border-e22-border rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-zinc-400" />
                  FICHA MÉDICA E22
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {socioData?.dias_asistencia || 4} DÍAS/SEMANA
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-e22-bg p-2.5 rounded-lg border border-e22-border">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    Alergias Declaradas
                  </span>
                  <p className="text-white font-mono mt-0.5">
                    {socioData?.alergias || 'Ninguna'}
                  </p>
                </div>

                <div className="bg-e22-bg p-2.5 rounded-lg border border-e22-border">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    Patologías / Lesiones
                  </span>
                  <p className="text-white font-mono mt-0.5">
                    {socioData?.patologias || 'Ninguna'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-e22-border/60">
              <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                Registrado el {socioData?.fecha_registro ? new Date(socioData.fecha_registro).toLocaleDateString() : 'N/A'}. Protocolo verificado por Staff E22.
              </p>
            </div>
          </div>
        </div>

        {/* 4. SECCIÓN MODULAR: RUTINA ASIGNADA & REGISTRO DE CARGAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Preview de Rutina */}
          <div className="lg:col-span-7 bg-e22-card border border-e22-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">
                    {rutinaData?.titulo || 'Plan de Rutina (Lunes a Sábado)'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Profesor: {rutinaData?.profesor_nombre || 'Staff Entrenadores E22'}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/alumno/rutina"
                className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1 group transition"
              >
                <span>Abrir Planilla</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {rutinaData ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-e22-bg border border-e22-border rounded-xl space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold uppercase block">
                    • Planilla Oficial Activa
                  </span>
                  <p className="text-xs font-bold text-white leading-snug">
                    {rutinaData.planilla?.objetivo || rutinaData.titulo}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono pt-1">
                    <span>
                      Días: <strong className="text-white">{rutinaData.planilla?.dias?.length || 3} días</strong>
                    </span>
                    <span>
                      Asistencia:{' '}
                      <strong className="text-emerald-400">
                        {rutinaData.planilla?.asistenciaDias?.length || 0} / 30 días
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                  <span>
                    Actualizada:{' '}
                    {rutinaData.fecha_actualizacion
                      ? new Date(rutinaData.fecha_actualizacion).toLocaleDateString()
                      : 'Recientemente'}
                  </span>
                  <Link
                    href="/dashboard/alumno/rutina"
                    className="text-white font-bold hover:underline"
                  >
                    Abrir planilla interactiva &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-e22-bg rounded-xl border border-e22-border space-y-2">
                <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">
                  {isAlDia
                    ? 'Tu profesor de E22 está armando tu rutina personalizada en el Routine Studio.'
                    : 'Una vez validado tu pago, el profesor te asignará la rutina correspondiente.'}
                </p>
              </div>
            )}
          </div>

          {/* Preview de Cargas Semanales */}
          <div className="lg:col-span-5 bg-e22-card border border-e22-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">
                    Registro de Cargas
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Progreso semana tras semana
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/alumno/progreso"
                className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1 group transition"
              >
                <span>Ver Todo</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-2">
              {registrosPeso.length === 0 ? (
                <div className="p-6 text-center bg-e22-bg rounded-xl border border-e22-border space-y-2">
                  <p className="text-xs text-zinc-500">
                    Aún no registraste cargas en press de banca, sentadilla o bíceps.
                  </p>
                  <Link
                    href="/dashboard/alumno/progreso"
                    className="inline-block px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg border border-zinc-700 transition"
                  >
                    + Registrar Primera Carga
                  </Link>
                </div>
              ) : (
                registrosPeso.slice(0, 4).map((reg) => (
                  <div
                    key={reg.id}
                    className="p-2.5 bg-e22-bg border border-e22-border rounded-lg flex items-center justify-between text-xs font-mono"
                  >
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{reg.ejercicio}</p>
                      <p className="text-[10px] text-zinc-500">
                        Semana {reg.semana} • {reg.repeticiones} reps
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white">{reg.peso_kg} kg</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {registrosPeso.length > 0 && (
              <Link
                href="/dashboard/alumno/progreso"
                className="block text-center py-2 text-xs font-bold text-zinc-400 hover:text-white bg-e22-bg border border-e22-border rounded-lg transition"
              >
                + Registrar Nueva Semana
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
