'use client';

import { Clock, ShieldCheck, AlertTriangle, XCircle, Flame } from 'lucide-react';

export default function CountdownWidget({ alumno, onPayClick }) {
  if (!alumno) return null;

  const dias = alumno.dias_restantes ?? 0;
  const isPaid = alumno.primer_pago_realizado && alumno.vencimiento_cuota;
  const isVerde = alumno.estado_pago === 'verde';
  const isAmarillo = alumno.estado_pago === 'amarillo';
  const isRojo = alumno.estado_pago === 'rojo';

  // Porcentaje restante de los 30 días
  const porcentaje = Math.max(0, Math.min(100, Math.round((dias / 30) * 100)));

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 border backdrop-blur-xl shadow-2xl transition-all ${
        !isPaid
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border-rose-500/40 shadow-rose-950/30'
          : isVerde
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/40 shadow-emerald-950/20'
          : isAmarillo
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-amber-500/40 shadow-amber-950/20'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border-rose-500/40 shadow-rose-950/20'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Contador Principal Destacado */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          {/* Círculo o Contador visual de días */}
          <div className="relative shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
            {isPaid && dias > 0 ? (
              <div className="text-center">
                <span
                  className={`block text-3xl sm:text-4xl font-black tracking-tight leading-none ${
                    isVerde ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {dias}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                  Días restantes
                </span>
              </div>
            ) : (
              <div className="text-center p-2">
                <XCircle className="w-8 h-8 text-rose-500 mx-auto mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight text-rose-400 block leading-tight">
                  {isPaid ? 'Vencido' : 'Sin Pagar'}
                </span>
              </div>
            )}

            {/* Efecto resplandor */}
            <div
              className={`absolute -inset-1 rounded-2xl blur-sm opacity-30 -z-10 ${
                isVerde ? 'bg-emerald-500' : isAmarillo ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </div>

          {/* Información y estado */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full border shadow-sm ${
                  !isPaid
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : isVerde
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isAmarillo
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    !isPaid
                      ? 'bg-rose-400'
                      : isVerde
                      ? 'bg-emerald-400 animate-ping'
                      : isAmarillo
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                {!isPaid
                  ? 'Pendiente de Primer Pago'
                  : isVerde
                  ? 'Membresía Activa (Al Día)'
                  : isAmarillo
                  ? 'Por Vencer (Últimos días)'
                  : 'Cuota Vencida'}
              </span>

              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                Ciclo de 30 días
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              {!isPaid
                ? 'Realiza tu primer pago para activar tu mes'
                : dias > 0
                ? `Te quedan ${dias} días de tu mes en E22`
                : dias === 0
                ? '¡Tu cuota vence el día de hoy!'
                : `Tu membresía venció hace ${Math.abs(dias)} días`}
            </h3>

            {/* Barra de progreso de los 30 días */}
            {isPaid && (
              <div className="w-full max-w-md pt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Progreso del mes:</span>
                  <span className="text-slate-200 font-bold">{dias} / 30 días disponibles</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isVerde
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : isAmarillo
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-600 to-rose-500'
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de Pago / Renovación */}
        <div className="w-full md:w-auto flex md:flex-col items-center gap-2">
          <button
            type="button"
            onClick={onPayClick}
            className={`w-full md:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 ${
              !isPaid
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-600/30 animate-pulse'
                : isVerde
                ? 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-600/30'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>{!isPaid ? 'Abonar Primer Pago' : 'Renovar 30 Días'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
