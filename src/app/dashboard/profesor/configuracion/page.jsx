'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
  Clock,
  DollarSign,
  Building2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export default function ProfesorConfiguracionPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('horarios'); // 'horarios' | 'precios' | 'banco'

  // Estados de configuración
  const [horarios, setHorarios] = useState([]);
  const [precios, setPrecios] = useState({
    cuota_mensual: 25000,
    pase_diario: 3500,
    pase_semanal: 12000,
    matricula: 0,
    descripcion: '',
  });
  const [bancarios, setBancarios] = useState({
    alias: '',
    cbu: '',
    titular: '',
    banco: '',
    instrucciones: '',
  });

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
      loadConfiguracion();
    } catch (e) {
      router.push('/');
    }
  }, []);

  const loadConfiguracion = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/configuracion');
      const data = await res.json();
      if (data.ok && data.configuracion) {
        if (data.configuracion.horarios) {
          setHorarios(data.configuracion.horarios);
        }
        if (data.configuracion.precios) {
          setPrecios((prev) => ({ ...prev, ...data.configuracion.precios }));
        }
        if (data.configuracion.datos_bancarios) {
          setBancarios((prev) => ({ ...prev, ...data.configuracion.datos_bancarios }));
        }
      }
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tabToSave) => {
    try {
      setSaving(true);
      setMessage(null);

      let payload = {};
      if (tabToSave === 'horarios' || !tabToSave) {
        payload.horarios = horarios;
      }
      if (tabToSave === 'precios' || !tabToSave) {
        payload.precios = {
          ...precios,
          cuota_mensual: Number(precios.cuota_mensual) || 0,
          pase_diario: Number(precios.pase_diario) || 0,
          pase_semanal: Number(precios.pase_semanal) || 0,
          matricula: Number(precios.matricula) || 0,
        };
      }
      if (tabToSave === 'banco' || !tabToSave) {
        payload.datos_bancarios = bancarios;
      }

      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage({ type: 'success', text: '¡Configuración guardada correctamente en el sistema!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'No se pudo guardar la configuración.' });
      }
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor al guardar.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Manejadores de Horarios
  const handleHorarioChange = (index, field, value) => {
    const updated = [...horarios];
    updated[index] = { ...updated[index], [field]: value };
    setHorarios(updated);
  };

  const handleAddHorario = () => {
    setHorarios([
      ...horarios,
      {
        dia: 'Día / Franja horaria',
        apertura: '08:00',
        cierre: '21:00',
        turnos: 'Clases y musculación libre.',
      },
    ]);
  };

  const handleRemoveHorario = (index) => {
    if (horarios.length <= 1) {
      alert('Debe haber al menos un horario configurado.');
      return;
    }
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col min-h-screen bg-e22-bg text-zinc-100 relative">
      <Sidebar user={currentUser} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-28 sm:pb-32 max-w-6xl w-full mx-auto space-y-6">
        {/* Cabecera de Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-e22-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mb-1">
              <Link href="/dashboard/profesor" className="hover:text-white transition flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel
              </Link>
              <span>/</span>
              <span className="text-zinc-200">ADMINISTRACIÓN GENERAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Clock className="w-7 h-7 text-white" />
              Horarios, Clases & Precios E22
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Ajusta los días y horarios de apertura, las tarifas de membresías y los datos para transferencias bancarias.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Todo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notificación de Éxito o Error */}
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs de Configuración */}
        <div className="flex items-center gap-2 border-b border-e22-border pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('horarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'horarios'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Horarios & Clases</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-900 text-zinc-400">
              {horarios.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('precios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'precios'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Tarifas de Membresía</span>
          </button>

          <button
            onClick={() => setActiveTab('banco')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'banco'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Datos Bancarios (Alias/CBU)</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
            <p className="text-xs font-mono">Cargando parámetros del gimnasio...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ================= TAB 1: HORARIOS Y CLASES ================= */}
            {activeTab === 'horarios' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-e22-card p-4 rounded-xl border border-e22-border">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Cronograma Semanal de Apertura y Clases
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Define los turnos de musculación y clases por día. Estos horarios se reflejan en el acceso y consultas de los alumnos.
                    </p>
                  </div>
                  <button
                    onClick={handleAddHorario}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition border border-zinc-700 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Franja / Día
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {horarios.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-e22-card border border-e22-border hover:border-zinc-700 transition space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-e22-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                            Bloque #{idx + 1}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveHorario(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                          title="Eliminar este día u horario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Días comprendidos
                          </label>
                          <input
                            type="text"
                            value={item.dia || ''}
                            onChange={(e) => handleHorarioChange(idx, 'dia', e.target.value)}
                            placeholder="Ej: Lunes a Viernes"
                            className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Hora Apertura
                          </label>
                          <input
                            type="text"
                            value={item.apertura || ''}
                            onChange={(e) => handleHorarioChange(idx, 'apertura', e.target.value)}
                            placeholder="Ej: 07:00 ó Cerrado"
                            className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Hora Cierre
                          </label>
                          <input
                            type="text"
                            value={item.cierre || ''}
                            onChange={(e) => handleHorarioChange(idx, 'cierre', e.target.value)}
                            placeholder="Ej: 22:00"
                            className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Clases, Turnos o Descripción
                        </label>
                        <input
                          type="text"
                          value={item.turnos || ''}
                          onChange={(e) => handleHorarioChange(idx, 'turnos', e.target.value)}
                          placeholder="Ej: Musculación continua. Clases de Funcional: 08:00, 15:00 y 19:30."
                          className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 2: TARIFAS Y PRECIOS ================= */}
            {activeTab === 'precios' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-e22-card p-5 rounded-2xl border border-e22-border space-y-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Valores de Membresía y Acceso
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Modifica las tarifas vigentes. El valor de la <strong>Cuota Mensual</strong> se cargará automáticamente cuando los alumnos notifiquen su pago mensual en la plataforma.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-e22-bg p-4 rounded-xl border border-e22-border space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          Cuota Mensual ($ ARS)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono font-bold">$</span>
                          <input
                            type="number"
                            value={precios.cuota_mensual || ''}
                            onChange={(e) => setPrecios({ ...precios, cuota_mensual: e.target.value })}
                            className="w-full bg-e22-card border border-e22-border rounded-lg pl-8 pr-3 py-2 text-sm font-black text-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500">Monto predeterminado sugerido al socio.</p>
                      </div>

                      <div className="bg-e22-bg p-4 rounded-xl border border-e22-border space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                          Pase Diario ($ ARS)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono font-bold">$</span>
                          <input
                            type="number"
                            value={precios.pase_diario || ''}
                            onChange={(e) => setPrecios({ ...precios, pase_diario: e.target.value })}
                            className="w-full bg-e22-card border border-e22-border rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-zinc-400 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500">Para visitantes o entrenamiento ocasional.</p>
                      </div>

                      <div className="bg-e22-bg p-4 rounded-xl border border-e22-border space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                          Pase Semanal ($ ARS)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono font-bold">$</span>
                          <input
                            type="number"
                            value={precios.pase_semanal || ''}
                            onChange={(e) => setPrecios({ ...precios, pase_semanal: e.target.value })}
                            className="w-full bg-e22-card border border-e22-border rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-zinc-400 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500">Acceso por 7 días seguidos.</p>
                      </div>

                      <div className="bg-e22-bg p-4 rounded-xl border border-e22-border space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                          Matrícula / Inscripción ($ ARS)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono font-bold">$</span>
                          <input
                            type="number"
                            value={precios.matricula ?? 0}
                            onChange={(e) => setPrecios({ ...precios, matricula: e.target.value })}
                            className="w-full bg-e22-card border border-e22-border rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-zinc-400 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500">Costo de apertura o carnet (0 si es gratis).</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Detalle de beneficios incluidos en el plan
                      </label>
                      <textarea
                        rows={3}
                        value={precios.descripcion || ''}
                        onChange={(e) => setPrecios({ ...precios, descripcion: e.target.value })}
                        placeholder="Ej: Acceso total a sala de musculación, seguimiento de sobrecarga progresiva y prescripción técnica de rutina por la app."
                        className="w-full bg-e22-bg border border-e22-border rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Tarjeta de previsualización para el alumno */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-zinc-900 to-black p-5 rounded-2xl border border-zinc-700/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                        VISTA ALUMNO
                      </span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>

                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Membresía Activa E22
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        ${Number(precios.cuota_mensual || 0).toLocaleString('es-AR')}
                      </span>
                      <span className="text-xs text-zinc-400 font-sans">/ mes</span>
                    </div>

                    <p className="text-xs text-zinc-300 mt-4 leading-relaxed font-sans border-t border-zinc-800 pt-3">
                      {precios.descripcion || 'Sin descripción adicional.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                      <div>
                        Pase Diario: <strong className="text-white">${Number(precios.pase_diario || 0).toLocaleString('es-AR')}</strong>
                      </div>
                      <div>
                        Pase Semanal: <strong className="text-white">${Number(precios.pase_semanal || 0).toLocaleString('es-AR')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: DATOS BANCARIOS ================= */}
            {activeTab === 'banco' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-e22-card p-5 rounded-2xl border border-e22-border space-y-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Cuentas Bancarias para Transferencias
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Estos datos son los que se mostrarán en la pantalla de <strong>Notificar Pago</strong> para que los alumnos puedan copiar el Alias o CBU con un solo click.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Alias de Cuenta
                      </label>
                      <input
                        type="text"
                        value={bancarios.alias || ''}
                        onChange={(e) => setBancarios({ ...bancarios, alias: e.target.value })}
                        placeholder="Ej: E22.GYM.FIT"
                        className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        CBU / CVU (22 dígitos)
                      </label>
                      <input
                        type="text"
                        value={bancarios.cbu || ''}
                        onChange={(e) => setBancarios({ ...bancarios, cbu: e.target.value })}
                        placeholder="0000003100045892019482"
                        className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Entidad Bancaria o Billetera
                      </label>
                      <input
                        type="text"
                        value={bancarios.banco || ''}
                        onChange={(e) => setBancarios({ ...bancarios, banco: e.target.value })}
                        placeholder="Ej: Banco Macro / Mercado Pago"
                        className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Titular de la Cuenta
                      </label>
                      <input
                        type="text"
                        value={bancarios.titular || ''}
                        onChange={(e) => setBancarios({ ...bancarios, titular: e.target.value })}
                        placeholder="Ej: E22 GYM SRL"
                        className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Instrucciones de Pago para el Alumno
                    </label>
                    <textarea
                      rows={2}
                      value={bancarios.instrucciones || ''}
                      onChange={(e) => setBancarios({ ...bancarios, instrucciones: e.target.value })}
                      placeholder="Instrucciones al realizar la transferencia..."
                      className="w-full bg-e22-bg border border-e22-border rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                {/* Previsualización de Datos Bancarios */}
                <div className="bg-e22-card p-5 rounded-2xl border border-e22-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Tarjeta de Transferencia</span>
                  </div>
                  <div className="p-4 rounded-xl bg-e22-bg border border-zinc-800 space-y-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Alias Oficial</p>
                      <p className="text-sm font-black font-mono text-white">{bancarios.alias || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">CBU / CVU</p>
                      <p className="text-xs font-mono text-zinc-300 break-all">{bancarios.cbu || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Titular y Banco</p>
                      <p className="text-xs font-semibold text-zinc-300">
                        {bancarios.titular || '-'} ({bancarios.banco || '-'})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
