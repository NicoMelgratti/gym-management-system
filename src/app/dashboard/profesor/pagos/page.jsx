'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Check,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function ProfesorPagosPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendiente'); // 'todos' | 'pendiente' | 'aprobado'
  const [statusMessage, setStatusMessage] = useState('');
  const [search, setSearch] = useState('');

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
      loadPagos();
    } catch (e) {
      router.push('/');
    }
  }, [filter]);

  const loadPagos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pagos?estado=${filter}`);
      const data = await res.json();
      if (data.ok) {
        setPagos(data.pagos || []);
      }
    } catch (err) {
      console.error('Error cargando pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (usuarioId, pagoId) => {
    try {
      const res = await fetch('/api/pagos/aprobar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId, pago_id: pagoId }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage(data.message);
        setTimeout(() => setStatusMessage(''), 5000);
        loadPagos();
      } else {
        alert(data.error || 'Error al aprobar pago.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const pagosFiltrados = pagos.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      p.dni?.toLowerCase().includes(term) ||
      p.nombre?.toLowerCase().includes(term) ||
      p.apellido?.toLowerCase().includes(term) ||
      p.referencia?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col font-sans selection:bg-white selection:text-black relative">
      {/* 1. NAVEGACIÓN SUPERIOR GLASS + MÓVIL LIQUID GLASS */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 pt-24 sm:pt-28 pb-28 sm:pb-32 space-y-6 max-w-7xl w-full mx-auto min-w-0">
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
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                VERIFICACIÓN DE TRANSFERENCIAS // CICLO DE 30 DÍAS
              </span>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase">
                COLA DE VERIFICACIÓN DE PAGOS
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Valida transferencias bancarias de los alumnos y habilita sus 30 días de suscripción
              </p>
            </div>

            <button
              onClick={loadPagos}
              className="p-2 bg-e22-card border border-e22-border hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition self-start sm:self-auto"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notificación */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Filtros y Buscador */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-e22-card border border-e22-border rounded-xl p-3 w-full min-w-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'pendiente'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white bg-e22-bg'
              }`}
            >
              Pendientes de Aprobación
            </button>
            <button
              onClick={() => setFilter('aprobado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'aprobado'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white bg-e22-bg'
              }`}
            >
              Ya Aprobados
            </button>
            <button
              onClick={() => setFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'todos'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white bg-e22-bg'
              }`}
            >
              Todos los Comprobantes
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI o Nombre..."
              className="w-full bg-e22-bg border border-e22-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono"
            />
          </div>
        </div>

        {/* Lista de Comprobantes */}
        <div className="bg-e22-card border border-e22-border rounded-2xl p-6 space-y-4">
          <div className="border-b border-e22-border/60 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase">
              Comprobantes en el Sistema ({pagosFiltrados.length})
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              Al aprobar un pago, el socio recibe 30 días de suscripción automáticamente
            </span>
          </div>

          {pagosFiltrados.length === 0 ? (
            <div className="p-12 text-center bg-e22-bg rounded-xl border border-e22-border text-zinc-500 text-xs font-mono">
              {loading ? 'Cargando comprobantes...' : 'No hay comprobantes pendientes en este momento.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-e22-border/60 text-[10px] uppercase font-bold text-zinc-500">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Socio / DNI</th>
                    <th className="py-2.5 px-3">Método</th>
                    <th className="py-2.5 px-3">Referencia / Comprobante</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-e22-border/40 font-mono">
                  {pagosFiltrados.map((pago) => {
                    const isPendiente = pago.estado === 'pendiente';
                    return (
                      <tr key={pago.id} className="hover:bg-zinc-900/50 transition">
                        <td className="py-3.5 px-3 text-zinc-400">
                          {pago.fecha ? new Date(pago.fecha).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-sans font-bold text-white leading-tight">
                            {pago.nombre} {pago.apellido || ''}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">DNI: {pago.dni}</p>
                        </td>
                        <td className="py-3.5 px-3 uppercase text-[11px] text-zinc-300">
                          {pago.metodo}
                        </td>
                        <td className="py-3.5 px-3 text-white font-bold">
                          {pago.referencia || 'Sin referencia'}
                        </td>
                        <td className="py-3.5 px-3 text-right text-white font-black text-sm">
                          ${Number(pago.monto).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                              isPendiente
                                ? 'bg-amber-950/40 text-amber-400 border-amber-900'
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPendiente ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                              }`}
                            />
                            {isPendiente ? 'Pendiente' : 'Aprobado'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {isPendiente ? (
                            <button
                              type="button"
                              onClick={() => handleAprobar(pago.usuario_id, pago.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar (+30 días)</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-500">Habilitado</span>
                          )}
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
