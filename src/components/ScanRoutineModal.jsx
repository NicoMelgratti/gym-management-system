'use client';

import { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import { DEFAULT_PLANILLA_FISICA_E22 } from '@/lib/rutinas';

export default function ScanRoutineModal({ isOpen, onClose, onRoutineExtracted }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [error, setError] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [extractedPlanilla, setExtractedPlanilla] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError('');
    setAdvertencia('');
    setExtractedPlanilla(null);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    setFile(dropped);
    setError('');
    setAdvertencia('');
    setExtractedPlanilla(null);

    if (dropped.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(dropped);
    } else {
      setPreviewUrl('');
    }
  };

  const handleAnalizar = async () => {
    if (!file) {
      setError('Por favor selecciona una foto o un archivo Excel.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAdvertencia('');
    setStatusStep('Subiendo archivo al servidor...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setStatusStep('Google Gemini digitalizando y detectando ejercicios...');

      const res = await fetch('/api/ia/analizar-rutina', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error al procesar el archivo con Gemini.');
      }

      if (data.advertencia) {
        setAdvertencia(data.advertencia);
        setStatusStep('Estructura E22 cargada para ajustar en el editor');
      } else {
        setStatusStep('¡Estructura validada y convertida a Planilla E22!');
      }

      setExtractedPlanilla(data.planilla);
    } catch (err) {
      console.error('Error analizando rutina:', err);
      setError(err.message || 'Error durante el análisis inteligente.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAplicarPlanilla = () => {
    if (extractedPlanilla && onRoutineExtracted) {
      onRoutineExtracted(extractedPlanilla);
      handleCerrar();
    }
  };

  const handleCargarBase = () => {
    if (onRoutineExtracted) {
      onRoutineExtracted({
        ...DEFAULT_PLANILLA_FISICA_E22,
        objetivo: file?.name
          ? `Planilla E22 (Basada en ${file.name})`
          : DEFAULT_PLANILLA_FISICA_E22.objetivo,
      });
      handleCerrar();
    }
  };

  const handleCerrar = () => {
    setFile(null);
    setPreviewUrl('');
    setError('');
    setAdvertencia('');
    setStatusStep('');
    setExtractedPlanilla(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#0e0e12] border border-[#272731] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-[#23232b] flex items-center justify-between bg-[#141419]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white text-zinc-950 rounded-xl shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                Escanear Rutina con IA (Gemini)
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Sube una foto escrita a mano o archivo Excel/CSV para digitalizar la rutina al instante.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCerrar}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Mensajes de Error con bypass */}
          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2.5 text-xs text-rose-300 font-mono">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-rose-900/40">
                <span className="text-[11px] text-zinc-400 font-sans">
                  ¿Deseas abrir la estructura oficial en el editor para redactarla manualmente?
                </span>
                <button
                  type="button"
                  onClick={handleCargarBase}
                  className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5"
                >
                  <span>Abrir en Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Advertencia si la IA usó modo de contingencia */}
          {advertencia && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-300 font-mono">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{advertencia}</span>
            </div>
          )}

          {/* Zona de Arrastrar y Soltar / Subida */}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2d2d38] hover:border-white/50 bg-[#09090b] hover:bg-zinc-900/40 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
            >
              <div className="p-3 bg-zinc-850 rounded-full border border-zinc-700 text-white">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Arrastra tu foto o archivo aquí
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Soporta fotos (.jpg, .png, .webp) o planillas de cálculo (.xlsx, .csv)
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tomar Foto / Elegir Archivo</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#09090b] border border-[#272731] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {previewUrl ? (
                    <ImageIcon className="w-5 h-5 text-zinc-400 shrink-0" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{file.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Documento'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                    setError('');
                    setAdvertencia('');
                    setExtractedPlanilla(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-rose-400 font-mono underline"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Vista previa de imagen si aplica */}
              {previewUrl && (
                <div className="relative max-h-48 overflow-hidden rounded-xl border border-zinc-800 bg-black flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview rutina"
                    className="max-h-48 object-contain w-full"
                  />
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.xlsx,.xls,.csv"
            className="hidden"
          />

          {/* Estado de análisis */}
          {analyzing && (
            <div className="p-4 bg-zinc-900/80 border border-zinc-700 rounded-xl space-y-2 text-center">
              <Loader2 className="w-6 h-6 text-white animate-spin mx-auto" />
              <p className="text-xs font-bold text-white">{statusStep}</p>
              <p className="text-[10px] text-zinc-400 font-mono">
                Extrayendo nombres de ejercicios, series, repeticiones y etapas...
              </p>
            </div>
          )}

          {/* Resultado exitoso */}
          {extractedPlanilla && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {advertencia
                    ? 'Plantilla E22 lista para editar en el editor'
                    : '¡Rutina extraída con éxito por Google Gemini!'}
                </span>
              </div>

              <div className="p-3 bg-[#09090b] rounded-lg border border-emerald-900/50 space-y-1.5 text-xs font-mono">
                <p className="text-white font-bold truncate">
                  Objetivo: {extractedPlanilla.objetivo}
                </p>
                <div className="flex gap-4 text-zinc-400 text-[11px]">
                  <span>
                    Días: <strong className="text-white">{extractedPlanilla.dias?.length || 0}</strong>
                  </span>
                  <span>
                    Total Ejercicios:{' '}
                    <strong className="text-white">
                      {extractedPlanilla.dias?.reduce(
                        (acc, d) => acc + (d.ejercicios?.length || 0),
                        0
                      )}
                    </strong>
                  </span>
                  <span>
                    Etapas:{' '}
                    <strong className="text-white">{extractedPlanilla.bloques?.length || 0}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-[#23232b] bg-[#141419] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCerrar}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            Cancelar
          </button>

          {!extractedPlanilla ? (
            <button
              type="button"
              onClick={handleAnalizar}
              disabled={!file || analyzing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black rounded-xl transition shadow disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analizar con IA (Gemini)</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAplicarPlanilla}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black rounded-xl transition shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Cargar en Editor de Planilla</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
