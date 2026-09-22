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
} from 'lucide-react';

export default function AICoachWidget({ alumno, rutina }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      id: 'bienvenida',
      remitente: 'coach',
      texto:
        '¡Hola! Soy tu **Coach Virtual E22**. Conozco tu rutina oficial y tus objetivos. Pregúntame qué te toca hacer hoy, tips de técnica o dudas sobre RIR y descansos.',
    },
  ]);

  const messagesEndRef = useRef(null);

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
      const res = await fetch('/api/ia/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptFinal,
          usuario_id: alumno?.id,
          rutinaActual: rutina?.planilla || rutina,
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
    '¿Cómo ejecuto sentadillas frontales?',
    '¿Qué significa RIR 3 en mi planilla?',
    '¿Cuánto descansar entre series?',
  ];

  return (
    <>
      {/* Botón Flotante para Abrir Coach */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-full shadow-2xl font-black text-xs transition active:scale-95 group border border-zinc-300"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Sparkles className="w-4 h-4 text-zinc-950 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Coach Virtual E22</span>
      </button>

      {/* Ventana de Chat del Coach */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] bg-[#0d0d11] border border-[#272731] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Cabecera */}
          <div className="p-3.5 bg-[#14141a] border-b border-[#23232b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white text-zinc-950 rounded-lg">
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
                  Asistente personal de entrenamiento
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
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
                    <p className="whitespace-pre-line">{m.texto}</p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>El Coach está respondiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas Rápidas */}
          <div className="px-3 py-2 bg-[#101015] border-t border-[#1f1f27] overflow-x-auto flex gap-1.5 no-scrollbar">
            {PREGUNTAS_RAPIDAS.map((pregunta, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleEnviar(pregunta)}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-mono rounded-lg border border-zinc-800 transition shrink-0 whitespace-nowrap disabled:opacity-50"
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
            className="p-2.5 bg-[#14141a] border-t border-[#23232b] flex items-center gap-2"
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
              className="p-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
