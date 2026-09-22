'use client';

import { useState } from 'react';
import { CheckCircle2, DollarSign, X, Calendar, CreditCard, Banknote } from 'lucide-react';

export default function PaymentModal({ alumno, onClose, onSuccess }) {
  const [meses, setMeses] = useState(1);
  const [metodo, setMetodo] = useState('efectivo');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!alumno) return null;

  // Calcular la fecha tentativa de vencimiento
  const hoy = new Date();
  let baseDate = hoy;
  if (alumno.vencimiento_cuota) {
    const vDate = new Date(alumno.vencimiento_cuota);
    if (vDate > hoy) baseDate = vDate;
  }
  const tentativa = new Date(baseDate);
  tentativa.setMonth(tentativa.getMonth() + Number(meses));
  const previewVencimiento = fechaPersonalizada || tentativa.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/alumnos/${alumno.id}/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meses: Number(meses),
          metodo,
          fechaPersonalizada: fechaPersonalizada || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo registrar el pago');
      }

      onSuccess(data.alumno);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Registrar Pago de Cuota</h3>
              <p className="text-sm text-slate-400">
                Alumno: <span className="text-slate-200 font-semibold">{alumno.nombre}</span> (DNI: {alumno.dni})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Período / Meses */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Período a Abonar
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { val: 1, label: '1 Mes' },
                { val: 3, label: '3 Meses (Trimestral)' },
                { val: 6, label: '6 Meses (Semestral)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    setMeses(opt.val);
                    setFechaPersonalizada('');
                  }}
                  className={`py-2 px-3 text-sm font-medium rounded-xl border transition ${
                    meses === opt.val && !fechaPersonalizada
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/25'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                { id: 'transferencia', label: 'Transferencia', icon: Calendar },
                { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodo(m.id)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-xl border transition ${
                      metodo === m.id
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opcional: Fecha personalizada */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              O seleccionar fecha límite personalizada (opcional):
            </label>
            <input
              type="date"
              value={fechaPersonalizada}
              onChange={(e) => setFechaPersonalizada(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Vista previa del resultado */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-sm">
            <span className="text-slate-400">Nuevo Vencimiento:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {previewVencimiento} (Estado: VERDE)
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar y Actualizar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
