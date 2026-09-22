'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
  BarChart3,
  Plus,
  Trash2,
  Trophy,
  Calendar,
  Dumbbell,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
} from 'lucide-react';

const COMMON_EXERCISES = [
  'Press de Banca Plano (Pecho)',
  'Press Inclinado con Mancuernas (Pecho)',
  'Sentadilla con Barra (Piernas)',
  'Peso Muerto Rumano (Isquios/Glúteo)',
  'Prensa de Piernas 45°',
  'Curl de Bíceps con Barra (Bíceps)',
  'Curl Martillo con Mancuernas (Bíceps)',
  'Press Militar con Mancuernas (Hombros)',
  'Elevaciones Laterales (Hombros)',
  'Dominadas con Lastre (Espalda)',
  'Remo con Barra (Espalda)',
  'Fondos en Paralelas (Tríceps/Pecho)',
  'Extensiones de Tríceps en Polea',
];

export default function AlumnoProgresoPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario de Nueva Carga
  const [selectedExercise, setSelectedExercise] = useState(COMMON_EXERCISES[0]);
  const [customExercise, setCustomExercise] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [pesoKg, setPesoKg] = useState('');
  const [reps, setReps] = useState('10');
  const [semana, setSemana] = useState('1');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Filtro de historial
  const [filtroEjercicio, setFiltroEjercicio] = useState('all');

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
      loadProgreso(parsed.id);
    } catch (e) {
      router.push('/');
    }
  }, []);

  const loadProgreso = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/progreso?usuario_id=${userId}`);
      const data = await res.json();
      if (data.ok) {
        setRegistros(data.registros || []);
        setRecords(data.records || []);
        // Si hay registros previos, auto-incrementar la sugerencia de semana
        if (data.registros && data.registros.length > 0) {
          const maxSemana = Math.max(...data.registros.map((r) => Number(r.semana) || 1));
          setSemana(String(maxSemana));
        }
      }
    } catch (err) {
      console.error('Error cargando progresos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCarga = async (e) => {
    e.preventDefault();
    const ejercicioFinal = isCustom ? customExercise.trim() : selectedExercise;

    if (!ejercicioFinal) {
      alert('Por favor indica el ejercicio.');
      return;
    }
    if (!pesoKg || isNaN(pesoKg) || Number(pesoKg) <= 0) {
      alert('Por favor ingresa un peso válido en kg.');
      return;
    }

    setSaving(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          ejercicio: ejercicioFinal,
          peso_kg: Number(pesoKg),
          repeticiones: Number(reps) || 10,
          semana: Number(semana) || 1,
          notas: notas.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al guardar.');

      setStatusMessage(`¡Carga de ${pesoKg} kg registrada en ${ejercicioFinal}!`);
      setPesoKg('');
      setNotas('');
      setTimeout(() => setStatusMessage(''), 4000);
      loadProgreso(currentUser.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Deseas eliminar este registro de carga?')) return;
    try {
      const res = await fetch(`/api/progreso?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        loadProgreso(currentUser.id);
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const registrosFiltrados = registros.filter((r) => {
    if (filtroEjercicio === 'all') return true;
    return r.ejercicio === filtroEjercicio;
  });

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* 1. SIDEBAR */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 space-y-6 overflow-y-auto max-w-7xl w-full min-w-0">
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
                STRENGTH &amp; LOAD PROGRESSION // WEEK OVER WEEK
              </span>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase">
                REGISTRO SEMANAL DE CARGAS
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Seguimiento de sobrecarga progresiva en ejercicios fundamentales
              </p>
            </div>
          </div>
        </div>

        {/* Notificación de éxito */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 3. GRID FORMULARIO + RÉCORDS (PRs) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulario de Carga */}
          <form
            onSubmit={handleGuardarCarga}
            className="lg:col-span-7 bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm w-full min-w-0"
          >
            <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-white" />
                <h3 className="text-sm font-black text-white uppercase">
                  Registrar Nueva Carga Semanal
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">SOBRECARGA PROGRESIVA</span>
            </div>

            {/* Selector de Ejercicio */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Ejercicio
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustom(!isCustom)}
                  className="text-[10px] text-zinc-400 hover:text-white underline font-mono"
                >
                  {isCustom ? 'Elegir de lista predefinida' : 'Otro ejercicio personalizado'}
                </button>
              </div>

              {isCustom ? (
                <input
                  type="text"
                  required
                  value={customExercise}
                  onChange={(e) => setCustomExercise(e.target.value)}
                  placeholder="Ej: Press Francés, Sentadilla Búlgara..."
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              ) : (
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                >
                  {COMMON_EXERCISES.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Inputs: Peso, Reps, Semana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Peso (KG) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={pesoKg}
                  onChange={(e) => setPesoKg(e.target.value)}
                  placeholder="Ej: 80"
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Reps Logradas
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Semana #
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  required
                  value={semana}
                  onChange={(e) => setSemana(e.target.value)}
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Notas / Sensaciones (RPE, descanso, técnica)
              </label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: RPE 9, 3 series completadas con esta carga"
                className="w-full bg-e22-bg border border-e22-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Guardando Carga...' : 'Guardar Registro de Carga'}</span>
            </button>
          </form>

          {/* Tarjeta de Récords Personales (PRs) */}
          <div className="lg:col-span-5 bg-e22-card border border-e22-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-e22-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white" />
                <h3 className="text-sm font-black text-white uppercase">
                  Tus Máximas Cargas (PRs)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{records.length} ejercicios</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {records.length === 0 ? (
                <div className="p-8 text-center bg-e22-bg rounded-xl border border-e22-border text-zinc-500 text-xs font-mono">
                  Registra tu primera sesión para calcular tus marcas personales.
                </div>
              ) : (
                records.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-e22-bg border border-e22-border rounded-xl flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-white truncate">{rec.ejercicio}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {rec.total_sesiones} {Number(rec.total_sesiones) === 1 ? 'registro' : 'registros'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-black font-mono text-white">
                        {rec.max_peso} kg
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 4. TABLA DE HISTORIAL SEMANA TRAS SEMANA */}
        <div className="bg-e22-card border border-e22-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-e22-border/60 pb-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase">
                Historial de Cargas Registradas
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                {registrosFiltrados.length} registros encontrados
              </p>
            </div>

            {/* Filtro por ejercicio */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={filtroEjercicio}
                onChange={(e) => setFiltroEjercicio(e.target.value)}
                className="bg-e22-bg border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
              >
                <option value="all">Todos los ejercicios</option>
                {records.map((r, i) => (
                  <option key={i} value={r.ejercicio}>
                    {r.ejercicio}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {registrosFiltrados.length === 0 ? (
            <div className="p-12 text-center bg-e22-bg rounded-xl border border-e22-border text-zinc-500 text-xs font-mono">
              No hay registros para mostrar con el filtro actual.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-e22-border/60 text-[10px] uppercase font-bold text-zinc-500">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Semana</th>
                    <th className="py-2.5 px-3">Ejercicio</th>
                    <th className="py-2.5 px-3 text-right">Peso (KG)</th>
                    <th className="py-2.5 px-3 text-right">Reps</th>
                    <th className="py-2.5 px-3">Notas</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-e22-border/40 font-mono">
                  {registrosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                      <td className="py-3 px-3 text-zinc-400">
                        {item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-3 text-white font-bold">
                        Semana {item.semana}
                      </td>
                      <td className="py-3 px-3 text-white font-sans font-bold">
                        {item.ejercicio}
                      </td>
                      <td className="py-3 px-3 text-right text-white font-black text-sm">
                        {item.peso_kg} kg
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-300">
                        {item.repeticiones} reps
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-sans italic max-w-xs truncate">
                        {item.notas || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleEliminar(item.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
