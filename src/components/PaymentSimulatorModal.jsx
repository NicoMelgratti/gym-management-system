'use client';

import { useState } from 'react';
import {
  CreditCard,
  Building2,
  Banknote,
  Copy,
  Check,
  X,
  QrCode,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function PaymentSimulatorModal({ alumno, onClose, onPaymentSuccess }) {
  const [copiedField, setCopiedField] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('transferencia');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!alumno) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/alumnos/${alumno.id}/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meses: 1,
          metodo: selectedMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error al procesar el pago.');
      }

      setMessage('¡Pago simulado con éxito! Tu cuota ha sido renovada por 30 días.');
      if (onPaymentSuccess) {
        onPaymentSuccess(data.alumno);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Métodos de Pago de Cuota</h3>
              <p className="text-sm text-slate-400">Zinerva Gym • Membresía Mensual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Métodos de Pago */}
        <div className="flex gap-2 mt-5 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setSelectedMethod('transferencia')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              selectedMethod === 'transferencia'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" /> Transferencia
          </button>
          <button
            onClick={() => setSelectedMethod('mercadopago')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              selectedMethod === 'mercadopago'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" /> Mercado Pago / QR
          </button>
          <button
            onClick={() => setSelectedMethod('efectivo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              selectedMethod === 'efectivo'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Banknote className="w-4 h-4" /> Efectivo
          </button>
        </div>

        {/* Contenido según método */}
        <div className="mt-5 space-y-3">
          {selectedMethod === 'transferencia' && (
            <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Banco:</span>
                <span className="font-semibold text-white">Banco Santander</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Titular:</span>
                <span className="font-semibold text-white">Zinerva Gym S.A.</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Alias:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-400">ZINERVA.GYM.FIT</span>
                  <button
                    onClick={() => handleCopy('ZINERVA.GYM.FIT', 'alias')}
                    className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded"
                    title="Copiar alias"
                  >
                    {copiedField === 'alias' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">CBU:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-300">0720123488000012345678</span>
                  <button
                    onClick={() => handleCopy('0720123488000012345678', 'cbu')}
                    className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded"
                    title="Copiar CBU"
                  >
                    {copiedField === 'cbu' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'mercadopago' && (
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-full h-full border-2 border-slate-900 border-dashed rounded flex flex-col items-center justify-center text-slate-900">
                  <QrCode className="w-16 h-16 text-slate-800" />
                  <span className="text-[10px] font-bold tracking-tight mt-1">ZINERVA QR</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Escanea desde la app de Mercado Pago o cualquier billetera virtual para abonar.
              </p>
            </div>
          )}

          {selectedMethod === 'efectivo' && (
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2 text-sm">
              <p className="text-slate-300">
                Puedes abonar tu cuota en recepción en efectivo en cualquiera de nuestras sedes:
              </p>
              <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                <li>Horarios de caja: Lunes a Viernes de 07:00 a 22:00 hs.</li>
                <li>Sábados: 09:00 a 18:00 hs.</li>
                <li>Indica tu DNI al recepcionista para impactar el pago al instante.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Mensaje de respuesta */}
        {message && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        {/* Botón de Simulación de Pago en Vivo */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Procesando simulación...' : 'Simular Pago y Activar Cuota Ahora'}
          </button>
          <p className="text-[11px] text-center text-slate-500">
            Esta acción actualizará tu cuota en el esquema E22 a estado VERDE por 30 días adicionales.
          </p>
        </div>
      </div>
    </div>
  );
}
