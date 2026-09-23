'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  ArrowLeft,
  Building,
  Send,
  RefreshCw,
} from 'lucide-react';

export default function AlumnoPagosPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [socioData, setSocioData] = useState(null);
  const [pagosList, setPagosList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [configuracion, setConfiguracion] = useState({
    precios: { cuota_mensual: 25000 },
    datos_bancarios: {
      alias: 'E22.GYM.FIT',
      cbu: '0000003100045892019482',
      titular: 'E22 GYM FITNESS S.R.L.',
      banco: 'Banco Macro'
    }
  });

  // Formulario de Pago
  const [metodo, setMetodo] = useState('transferencia');
  const [referencia, setReferencia] = useState('');
  const [monto, setMonto] = useState('25000');
  const [notifying, setNotifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedField, setCopiedField] = useState('');

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
      loadData(parsed.id);
    } catch (e) {
      router.push('/');
    }
  }, []);

  const loadData = async (userId) => {
    try {
      setLoading(true);
      const [resSocio, resConfig] = await Promise.all([
        fetch(`/api/socios/${userId}`),
        fetch('/api/configuracion')
      ]);

      const dataSocio = await resSocio.json();
      if (dataSocio.ok) {
        setSocioData(dataSocio.socio);
        setPagosList(dataSocio.pagos || []);
      }

      const dataConfig = await resConfig.json();
      if (dataConfig.ok && dataConfig.configuracion) {
        setConfiguracion(dataConfig.configuracion);
        if (dataConfig.configuracion.precios?.cuota_mensual) {
          setMonto(String(dataConfig.configuracion.precios.cuota_mensual));
        }
      }
    } catch (err) {
      console.error('Error cargando pagos o configuracion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const handleNotificarPago = async (e) => {
    e.preventDefault();
    if (!referencia.trim()) {
      alert('Por favor ingresa el número o comprobante de la transferencia.');
      return;
    }

    setNotifying(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/pagos/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          metodo,
          referencia: referencia.trim(),
          monto: Number(monto) || 25000,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al notificar pago.');

      setStatusMessage('¡Comprobante enviado! El profesor lo verificará en su panel para habilitar tus 30 días.');
      setReferencia('');
      setTimeout(() => setStatusMessage(''), 5000);
      loadData(currentUser.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setNotifying(false);
    }
  };

  const dias = socioData?.dias_restantes ?? 0;
  const isAlDia = socioData?.estado_pago === 'al_dia' && dias > 0;
  const isPendiente = socioData?.estado_pago === 'pendiente';

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col font-sans selection:bg-white selection:text-black relative">
      {/* 1. NAVEGACIÓN SUPERIOR GLASS + MÓVIL LIQUID GLASS */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 pt-24 sm:pt-28 pb-28 sm:pb-32 space-y-6 max-w-7xl w-full mx-auto min-w-0">
        {/* Cabecera */}
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
                CENTRO DE PAGOS // MEMBRESÍA E22
              </span>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase">
                CENTRO DE PAGOS Y CUOTAS
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Notifica tu transferencia bancaria para activar o renovar tu mes de entrenamiento
              </p>
            </div>

            <button
              onClick={() => currentUser?.id && loadData(currentUser.id)}
              className="p-2 bg-e22-card border border-e22-border hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notificación de Éxito */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 3. GRID: DATOS BANCARIOS + FORMULARIO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tarjeta de Datos Bancarios E22 */}
          <div className="lg:col-span-6 bg-e22-card border border-e22-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-white" />
                <h3 className="text-sm font-black text-white uppercase">
                  Datos de Transferencia Bancaria
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">CUENTA OFICIAL E22</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Realiza la transferencia por el valor de tu cuota mensual y luego envía la notificación en el formulario con tu número de comprobante.
            </p>

            <div className="space-y-3">
              {/* Alias */}
              <div className="bg-e22-bg p-3.5 rounded-xl border border-e22-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    Alias Bancario
                  </span>
                  <span className="text-base font-black font-mono text-white mt-0.5 block">
                    {configuracion.datos_bancarios?.alias || 'E22.GYM.FIT'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(configuracion.datos_bancarios?.alias || 'E22.GYM.FIT', 'alias')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg flex items-center gap-1.5 transition font-mono"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedField === 'alias' ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* CBU */}
              <div className="bg-e22-bg p-3.5 rounded-xl border border-e22-border flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    CBU Único
                  </span>
                  <span className="text-xs font-mono text-zinc-300 mt-0.5 block truncate">
                    {configuracion.datos_bancarios?.cbu || '0000003100045892019482'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(configuracion.datos_bancarios?.cbu || '0000003100045892019482', 'cbu')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg flex items-center gap-1.5 transition font-mono shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedField === 'cbu' ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Titular y Arancel */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-e22-bg p-3 rounded-xl border border-e22-border">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Titular</span>
                  <p className="text-white font-mono mt-0.5 truncate">
                    {configuracion.datos_bancarios?.titular || 'E22 GYM FITNESS S.R.L.'}
                  </p>
                </div>
                <div className="bg-e22-bg p-3 rounded-xl border border-e22-border">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Membresía Mensual</span>
                  <p className="text-white font-mono font-bold mt-0.5">
                    ${Number(configuracion.precios?.cuota_mensual || 25000).toLocaleString('es-AR')} / 30 días
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Notificación de Pago */}
          <form
            onSubmit={handleNotificarPago}
            className="lg:col-span-6 bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4 w-full min-w-0"
          >
            <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-white" />
                <h3 className="text-sm font-black text-white uppercase">
                  Notificar Pago Realizado
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">VALIDACIÓN INMEDIATA</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Método de Pago
              </label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="w-full bg-e22-bg border border-e22-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-400"
              >
                <option value="transferencia">Transferencia Bancaria (Alias / CBU)</option>
                <option value="debito">Tarjeta de Débito</option>
                <option value="efectivo">Efectivo en Recepción</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Monto Abonado ($)
                </label>
                <input
                  type="number"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  N° Referencia / Operación *
                </label>
                <input
                  type="text"
                  required
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: TRX-998248"
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 font-mono">
              Al hacer clic en enviar, el profesor verá tu comprobante en su lista de espera y habilitará tus 30 días de suscripción.
            </p>

            <button
              type="submit"
              disabled={notifying}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{notifying ? 'Enviando Notificación...' : 'Enviar Comprobante al Profesor'}</span>
            </button>
          </form>
        </div>

        {/* 4. TABLA DE HISTORIAL DE NOTIFICACIONES DE PAGO */}
        <div className="bg-e22-card border border-e22-border rounded-2xl p-6 space-y-4">
          <div className="border-b border-e22-border/60 pb-3">
            <h3 className="text-sm font-black text-white uppercase">
              Historial de Pagos y Comprobantes
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              Registros procesados por administración E22
            </p>
          </div>

          {pagosList.length === 0 ? (
            <div className="p-8 text-center bg-e22-bg rounded-xl border border-e22-border text-zinc-500 text-xs font-mono">
              No se han registrado pagos previos para esta cuenta.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-e22-border/60 text-[10px] uppercase font-bold text-zinc-500">
                    <th className="py-2.5 px-3">Fecha Notificada</th>
                    <th className="py-2.5 px-3">Método</th>
                    <th className="py-2.5 px-3">Referencia</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-e22-border/40 font-mono">
                  {pagosList.map((pago) => {
                    const isAprobado = pago.estado === 'aprobado';
                    return (
                      <tr key={pago.id} className="hover:bg-zinc-900/50 transition">
                        <td className="py-3 px-3 text-zinc-400">
                          {pago.fecha ? new Date(pago.fecha).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-3 text-white uppercase text-[11px]">
                          {pago.metodo}
                        </td>
                        <td className="py-3 px-3 text-white">
                          {pago.referencia || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right text-white font-bold">
                          ${Number(pago.monto).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                              isAprobado
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                                : 'bg-amber-950/40 text-amber-400 border-amber-900'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAprobado ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`}
                            />
                            {isAprobado ? 'Aprobado (+30 días)' : 'En Verificación'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
