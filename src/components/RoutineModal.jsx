'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, X, Save, Sparkles } from 'lucide-react';

const PLANTILLAS = {
  hipertrofia: {
    titulo: 'Rutina de Hipertrofia 3 Días (Fuerza y Volumen)',
    detalles: `Día 1 - Pecho y Tríceps:
• Press Banca Plano: 4 series x 10 repeticiones
• Press Inclinado con Mancuernas: 3 series x 12 repeticiones
• Aperturas en Polea: 3 series x 15 repeticiones
• Fondos en Paralelas: 3 series al fallo
• Extensión de Tríceps en Polea: 4 series x 12 repeticiones

Día 2 - Espalda y Bíceps:
• Jalón al Pecho: 4 series x 10 repeticiones
• Remo con Barra: 4 series x 8 repeticiones
• Remo Gironda sentado: 3 series x 12 repeticiones
• Curl de Bíceps con Barra Z: 4 series x 10 repeticiones
• Curl Martillo con Mancuernas: 3 series x 12 repeticiones

Día 3 - Piernas y Hombros:
• Sentadilla Libre: 4 series x 8 repeticiones
• Prensa 45°: 4 series x 12 repeticiones
• Sillón de Cuádriceps: 3 series x 15 repeticiones
• Press Militar con Mancuernas: 4 series x 10 repeticiones
• Vuelos Laterales: 4 series x 15 repeticiones
• Abdominales en polea: 3 series x 20 repeticiones

Notas del Profesor:
- Calentamiento articular previo de 10 minutos.
- Descanso de 90 segundos entre series pesadas.
- Hidratación constante durante todo el entrenamiento.`,
  },
  definicion: {
    titulo: 'Rutina de Definición y Resistencia Muscular',
    detalles: `Día 1 - Tren Superior (Circuitos):
• Press de Pecho en Máquina: 4 series x 15 repeticiones
• Jalón Dorsal en Polea: 4 series x 15 repeticiones
• Elevaciones Laterales: 4 series x 15 repeticiones
• Fondos en Banco: 3 series x 15 repeticiones
• Cardio: 20 minutos en cinta HIIT (1 min rápido / 1 min caminata)

Día 2 - Tren Inferior & Core:
• Sentadillas Goblet: 4 series x 15 repeticiones
• Zancadas caminando: 3 series x 12 pasos por pierna
• Peso Muerto Rumano: 4 series x 12 repeticiones
• Plancha Abdominal: 4 series x 45 segundos
• Elevaciones de Piernas colgado: 3 series x 15 repeticiones

Notas del Profesor:
- Mantener pausas cortas (45 a 60 segundos).
- Enfoque en la contracción muscular controlada.`,
  },
  iniciacion: {
    titulo: 'Plan de Adaptación e Iniciación Full Body',
    detalles: `Día 1 / 3 / 5 - Full Body General:
• Prensa de Piernas: 3 series x 12 repeticiones
• Polea al Pecho abierta: 3 series x 12 repeticiones
• Press de Pecho en Máquina Convergente: 3 series x 12 repeticiones
• Press de Hombros en Máquina: 3 series x 12 repeticiones
• Curl de Bíceps con Mancuernas: 3 series x 12 repeticiones
• Extensión de Tríceps: 3 series x 12 repeticiones
• Crunch Abdominal en colchoneta: 3 series x 15 repeticiones

Notas del Profesor:
- Cargas ligeras para aprender la técnica correcta de ejecución.
- Consultar cualquier molestia con los entrenadores de piso.`,
  },
};

export default function RoutineModal({ alumno, profesorId, onClose, onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [detalles, setDetalles] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!alumno) return;

    // Cargar rutina existente si la tiene
    async function loadRoutine() {
      try {
        setFetching(true);
        const res = await fetch(`/api/alumnos/${alumno.id}/rutina`);
        const data = await res.json();
        if (data.ok && data.rutina) {
          setTitulo(data.rutina.titulo || '');
          setDetalles(data.rutina.detalles || '');
        } else {
          // Pre-cargar plantilla por defecto para facilitar al profesor
          setTitulo(PLANTILLAS.hipertrofia.titulo);
          setDetalles(PLANTILLAS.hipertrofia.detalles);
        }
      } catch (err) {
        console.error('Error cargando rutina:', err);
      } finally {
        setFetching(false);
      }
    }

    loadRoutine();
  }, [alumno]);

  const handleApplyTemplate = (key) => {
    const template = PLANTILLAS[key];
    if (template) {
      setTitulo(template.titulo);
      setDetalles(template.detalles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !detalles.trim()) {
      setError('Por favor completa el título y los ejercicios de la rutina.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/alumnos/${alumno.id}/rutina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          detalles: detalles.trim(),
          profesor_id: profesorId || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error al guardar la rutina.');
      }

      onSuccess(data.rutina);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!alumno) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Gestionar Rutina de Entrenamiento</h3>
              <p className="text-sm text-slate-400">
                Para: <span className="text-slate-200 font-semibold">{alumno.nombre}</span> (DNI: {alumno.dni})
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

        {/* Plantillas Rápidas */}
        <div className="mt-4 p-3.5 bg-slate-800/60 border border-slate-700/70 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Plantillas Rápidas para Cargar:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate('hipertrofia')}
              className="px-3 py-1.5 text-xs bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
            >
              Hipertrofia 3 Días
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('definicion')}
              className="px-3 py-1.5 text-xs bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
            >
              Definición y Resistencia
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('iniciacion')}
              className="px-3 py-1.5 text-xs bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
            >
              Iniciación Full Body
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 flex-1 flex flex-col min-h-0 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Título del Plan / Rutina
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Rutina de Hipertrofia 3 Días"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500 placeholder-slate-500"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Detalle de Ejercicios, Días y Series (formato descargable en PDF)
            </label>
            <textarea
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              rows={12}
              placeholder="Día 1 - Pecho y Tríceps:&#10;• Press Banca: 4 series x 10 reps..."
              className="w-full flex-1 p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
            />
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
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-600/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar y Asignar Rutina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
