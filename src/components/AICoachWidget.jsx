'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Dumbbell,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export default function AICoachWidget({ alumno, rutina }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(alumno || null);
  const [mensajes, setMensajes] = useState([
    {
      id: 'bienvenida',
      remitente: 'coach',
      texto:
        '¡Hola! Soy tu **Coach Virtual E22**. Conozco el sistema de entrenamiento del gimnasio, la técnica de ejercicios y tus objetivos. Pregúntame qué te toca hacer hoy, dudas de RIR o consejos de biomecánica.',
    },
  ]);

  const messagesEndRef = useRef(null);

  // Cargar usuario si no se pasó por props
  useEffect(() => {
    if (alumno) {
      setActiveUser(alumno);
      return;
    }
    try {
      const saved = localStorage.getItem('e22_user');
      if (saved) {
        setActiveUser(JSON.parse(saved));
      }
    } catch (e) {}
  }, [alumno]);

  // Escuchar evento personalizado para abrir desde el menú móvil o navbar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('e22-open-coach', handleOpen);
      return () => window.removeEventListener('e22-open-coach', handleOpen);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, isOpen]);

  const handleEnviar = async (textoAEnviar) => {
    const promptFinal = (textoAEnviar || inputMsg).trim();
    if (!promptFinal || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      remitente: 'usuario',
      texto: promptFinal,
    };

    setMensajes((prev) => [...prev, userMsg]);
    setInputMsg('');
    setLoading(true);

    try {
      const userToUse = activeUser || alumno;
      const res = await fetch('/api/ia/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptFinal,
          usuario_id: userToUse?.id,
          rutinaActual: rutina?.planilla || rutina || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo obtener respuesta del Coach.');
      }

      setMensajes((prev) => [
        ...prev,
        {
          id: `coach_${Date.now()}`,
          remitente: 'coach',
          texto: data.respuesta,
        },
      ]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        {
          id: `coach_err_${Date.now()}`,
          remitente: 'coach',
          texto:
            'Tuve un pequeño problema de conexión con el servidor. Pero recuerda: mantén técnica estricta, respeta el RIR programado en tu planilla y consulta con los profes de sala si tienes dudas.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const PREGUNTAS_RAPIDAS = [
    '¿Qué me toca entrenar hoy?',
    '¿Cómo ejecuto sentadillas?',
    '¿Qué significa RIR 2 o 3?',
    '¿Cuánto descansar entre series?',
  ];

  // Formateador simple de markdown para negritas y viñetas
  const formatText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-white font-black">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Botón Flotante para Abrir Coach: visible y accesible tanto en Mobile como en Desktop */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir Coach Virtual IA E22"
        className="fixed bottom-[max(4.75rem,calc(env(safe-area-inset-bottom)+4.25rem))] right-3 sm:right-6 lg:bottom-6 lg:right-6 z-[55] flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white text-zinc-950 hover:bg-zinc-100 active:scale-95 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_15px_rgba(16,185,129,0.3)] font-black text-xs transition-all duration-200 border border-zinc-200 group"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <Sparkles className="w-4 h-4 text-zinc-950 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="text-[11px] sm:text-xs font-black tracking-wide uppercase">
          Coach IA
        </span>
        <span className="hidden sm:inline text-zinc-300 font-normal">|</span>
        <span className="hidden sm:inline text-zinc-600 font-mono text-[10px]">
          E22
        </span>
      </button>

      {/* Backdrop en pantallas móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] sm:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Ventana de Chat del Coach */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px] h-[85vh] sm:h-[560px] max-h-[720px] z-[65] bg-[#0d0d12] border border-[#272731] rounded-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
          {/* Indicador táctil en móvil */}
          <div className="w-10 h-1 bg-zinc-700/80 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

          {/* Cabecera */}
          <div className="p-3.5 bg-[#14141a] border-b border-[#23232b] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white text-zinc-950 rounded-xl shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  Coach Virtual E22
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    GEMINI IA
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Asistente inteligente de sala y rutinas
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition active:scale-95"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-[#09090b]">
            {mensajes.map((m) => {
              const esCoach = m.remitente === 'coach';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${esCoach ? 'items-start' : 'items-end justify-end'}`}
                >
                  {esCoach && (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Dumbbell className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      esCoach
                        ? 'bg-[#16161d] text-zinc-200 border border-[#272731]'
                        : 'bg-white text-zinc-950 font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{formatText(m.texto)}</p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono p-2 bg-zinc-900/60 rounded-xl border border-zinc-800 w-max">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>El Coach está respondiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas Rápidas */}
          <div className="px-3 py-2 bg-[#101015] border-t border-[#1f1f27] overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {PREGUNTAS_RAPIDAS.map((pregunta, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleEnviar(pregunta)}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white text-[10px] font-mono rounded-lg border border-zinc-800 transition shrink-0 whitespace-nowrap disabled:opacity-50"
              >
                {pregunta}
              </button>
            ))}
          </div>

          {/* Input de Mensaje */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEnviar();
            }}
            className="p-2.5 bg-[#14141a] border-t border-[#23232b] flex items-center gap-2 shrink-0 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Pregúntale a tu Coach E22..."
              disabled={loading}
              className="flex-1 bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition font-sans"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || loading}
              className="p-2 bg-white hover:bg-zinc-200 active:scale-95 text-zinc-950 rounded-xl transition disabled:opacity-50 shrink-0"
              aria-label="Enviar pregunta"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
