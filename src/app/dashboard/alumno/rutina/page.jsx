'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SpringCheck from '@/components/SpringCheck';
import { generarRutinaPDF } from '@/lib/pdfGenerator';
import {
  Dumbbell,
  FileDown,
  RotateCcw,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export default function AlumnoRutinaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [alumnoData, setAlumnoData] = useState(null);
  const [rutinaData, setRutinaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tachados, setTachados] = useState({});

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
      fetchData(parsed.id);

      // Cargar tachados guardados
      const savedTachados = localStorage.getItem(`e22_tachados_${parsed.id}`);
      if (savedTachados) {
        try {
          setTachados(JSON.parse(savedTachados));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      router.push('/');
    }
  }, []);

  const fetchData = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/socios/${id}`);
      const data = await res.json();
      if (data.ok) {
        setAlumnoData(data.socio);
        setRutinaData(data.rutina);
      }
    } catch (err) {
      console.error('Error cargando rutina:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!alumnoData || !rutinaData) {
      alert('La rutina aún no está disponible para exportar a PDF.');
      return;
    }
    generarRutinaPDF({ alumno: alumnoData, rutina: rutinaData });
  };

  const toggleTacharEjercicio = (key) => {
    setTachados((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (currentUser?.id) {
        localStorage.setItem(`e22_tachados_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleResetTachados = () => {
    if (confirm('¿Deseas reiniciar y desmarcar todos los ejercicios completados?')) {
      setTachados({});
      if (currentUser?.id) {
        localStorage.removeItem(`e22_tachados_${currentUser.id}`);
      }
    }
  };

  // Parser para descomponer el texto de rutina en bloques de días
  const parseRoutineBlocks = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const blocks = [];
    let currentBlock = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (
        trimmed.toLowerCase().startsWith('día') ||
        trimmed.toLowerCase().startsWith('dia') ||
        trimmed.toLowerCase().startsWith('notas') ||
        trimmed.toLowerCase().startsWith('ejercicios asignados')
      ) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          title: trimmed.replace(':', ''),
          isNotes: trimmed.toLowerCase().startsWith('notas'),
          items: [],
        };
      } else {
        if (!currentBlock) {
          currentBlock = {
            title: 'Ejercicios Principales',
            isNotes: false,
            items: [],
          };
        }
        currentBlock.items.push(trimmed.replace(/^[•\-\*]\s*/, ''));
      }
    });

    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  };

  const routineBlocks = rutinaData ? parseRoutineBlocks(rutinaData.detalles) : [];
  const isAlDia = alumnoData?.estado_pago === 'al_dia';

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* 1. SIDEBAR */}
      <Sidebar user={currentUser} />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 space-y-6 overflow-y-auto max-w-7xl w-full min-w-0">
        {/* Breadcrumb y Cabecera */}
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
                TRAINING PROTOCOL // PREDEFINED 6-DAY SHEET
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                {rutinaData?.titulo || 'Planilla de Rutina E22'}
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Entrenador Responsable: {rutinaData?.profesor_nombre || 'Staff Entrenadores E22'} • {alumnoData?.dias_asistencia || 6} Días por semana
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => currentUser?.id && fetchData(currentUser.id)}
                className="p-2 bg-e22-card border border-e22-border hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {rutinaData && (
                <>
                  <button
                    onClick={handleResetTachados}
                    className="flex items-center gap-2 px-3.5 py-2 bg-e22-card hover:bg-zinc-850 text-zinc-300 hover:text-white text-xs font-bold rounded-xl border border-e22-border transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar Tachados</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Descargar PDF</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notificación de Modo de Uso */}
        <div className="p-3.5 bg-e22-card border border-e22-border rounded-xl flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong>Modo Interactivo:</strong> Toca cualquier ejercicio para tacharlo al completarlo en el gimnasio. Los tachados se guardan automáticamente en tu dispositivo.
            </span>
          </div>
        </div>

        {/* Contenido de la rutina */}
        {!rutinaData ? (
          <div className="p-16 text-center bg-e22-card border border-e22-border rounded-2xl space-y-4 max-w-xl mx-auto">
            <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Rutina en Preparación</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                {isAlDia
                  ? 'Tu profesor de E22 está configurando tu planilla en el Routine Studio. Aparecerá aquí en breve.'
                  : 'Tu profesor te cargará la rutina predefinida una vez que verifique tu comprobante de pago.'}
              </p>
            </div>
            {!isAlDia && (
              <Link
                href="/dashboard/alumno/pagos"
                className="inline-block px-4 py-2 bg-white text-zinc-950 font-black text-xs rounded-xl hover:bg-zinc-200 transition"
              >
                Notificar Pago Ahora &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {routineBlocks.map((block, bIdx) => (
              <div
                key={bIdx}
                className={`flex flex-col rounded-2xl border p-5 transition ${
                  block.isNotes
                    ? 'bg-zinc-900/70 border-zinc-700 md:col-span-2 lg:col-span-3'
                    : 'bg-e22-card border-e22-border hover:border-zinc-600'
                }`}
              >
                {/* Cabecera del bloque */}
                <div className="flex items-center justify-between pb-3 border-b border-e22-border/60 mb-3.5">
                  <h4
                    className={`font-black text-xs uppercase tracking-wider ${
                      block.isNotes ? 'text-amber-400' : 'text-white'
                    }`}
                  >
                    {block.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800/80 rounded text-zinc-400 border border-zinc-700">
                    {block.items.length} {block.isNotes ? 'pautas' : 'ejercicios'}
                  </span>
                </div>

                {/* Lista de ejercicios con SpringCheck */}
                <ul className="space-y-1.5 flex-1">
                  {block.items.map((item, iIdx) => {
                    const itemKey = `${bIdx}-${iIdx}`;
                    const isTachado = !!tachados[itemKey];

                    if (block.isNotes) {
                      return (
                        <li key={iIdx} className="text-xs text-zinc-300 leading-relaxed py-1 font-mono">
                          • {item}
                        </li>
                      );
                    }

                    let mainText = item;
                    let noteText = '';
                    const match = item.match(/^(.*?)\[Máquina\/Equipo:\s*(.*?)\]$/);
                    if (match) {
                      mainText = match[1].trim();
                      noteText = match[2].trim();
                    }

                    return (
                      <li key={iIdx} className="w-full">
                        <div className="w-full py-1.5 px-2 rounded-xl hover:bg-zinc-900/60 transition-colors">
                          <SpringCheck
                            label={mainText}
                            checked={isTachado}
                            onChange={() => toggleTacharEjercicio(itemKey)}
                            color="#ffffff"
                            fillColor="#ffffff"
                            checkColor="#09090b"
                            boxSize={22}
                            boxRadius={7}
                            fontSize={13}
                            bounce={0.25}
                            strikeLag={0.08}
                            doneOpacity={0.35}
                            strike="left"
                            className="w-full justify-start cursor-pointer"
                          />
                          {noteText && (
                            <div className="ml-8 mt-1 text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                              <span className="text-zinc-300">
                                <strong className="text-zinc-400">Máquina / Notas:</strong> {noteText}
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
