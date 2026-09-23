'use client';

import React from 'react';
import { Calendar, CheckCircle2, Award, Info } from 'lucide-react';

/**
 * Componente oficial de la Planilla Técnica de Entrenamiento E22 Gym.
 * Replica de forma exacta la hoja física de planificación de cargas y progresión.
 *
 * Props:
 * - planilla: Objeto con { planNumero, objetivo, indicacionPrevia, bloques, dias, asistenciaDias }
 * - alumnoNombre: Nombre completo del alumno (ej: 'MEGRATTI Nicolas')
 * - isInteractive: Si es true, permite hacer clic en las casillas de 30 días para marcar asistencia
 * - onToggleAsistencia: Callback (dia) => void al hacer clic en un día de asistencia
 * - theme: 'dark' (por defecto para dashboard) o 'print' (para imprimir/estilo hoja papel)
 */
export default function TrainingSheet({
  planilla,
  alumnoNombre = 'Alumno E22',
  isInteractive = true,
  onToggleAsistencia,
  theme = 'dark',
}) {
  if (!planilla) return null;

  const {
    planNumero = '1',
    objetivo = 'Variación de cargas múltiples – OBJETIVO: Mejorar el IMC & aumentar los niveles de fuerza',
    indicacionPrevia = 'PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA DE "CORE/MOVILIDAD/ESTABILIDAD" PARA LUEGO COMENZAR CON EL DIA CORRESPONDIENTE',
    bloques = [],
    dias = [],
    asistenciaDias = [],
  } = planilla;

  const isPrint = theme === 'print';
  const setAsistencias = new Set(asistenciaDias.map(Number));

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border transition-all ${
        isPrint
          ? 'bg-white text-zinc-900 border-zinc-400 font-sans'
          : 'bg-[#0c0c0f] text-zinc-100 border-[#272731] shadow-2xl font-sans'
      }`}
    >
      {/* 1. CABECERA SUPERIOR: PLAN Nº X - ALUMNO */}
      <div
        className={`px-4 py-2.5 sm:px-6 sm:py-3 text-center font-black tracking-wider uppercase border-b text-sm sm:text-base ${
          isPrint
            ? 'bg-zinc-800 text-white border-zinc-700'
            : 'bg-zinc-900/90 text-white border-[#272731] flex items-center justify-between'
        }`}
      >
        <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-zinc-400 font-normal">
          E22 HIGH PERFORMANCE // PROTOCOLO DE FUERZA
        </span>
        <span className="mx-auto sm:mx-0">
          PLAN Nº {planNumero} – {alumnoNombre.toUpperCase()}
        </span>
        <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 font-normal">
          {dias.length} DÍAS // 30 DÍAS CICLO
        </span>
      </div>

      {/* 2. SUBTÍTULO / OBJETIVO PERSONALIZADO */}
      <div
        className={`px-4 py-2 sm:px-6 sm:py-2.5 text-center text-xs sm:text-sm font-bold tracking-wide border-b ${
          isPrint
            ? 'bg-zinc-200 text-zinc-800 border-zinc-400'
            : 'bg-[#141419] text-zinc-200 border-[#272731]'
        }`}
      >
        {objetivo}
      </div>

      {/* 3. AVISO / CALENTAMIENTO PREVIO */}
      <div
        className={`px-3 py-1.5 sm:px-6 sm:py-2 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b ${
          isPrint
            ? 'bg-zinc-100 text-zinc-700 border-zinc-300'
            : 'bg-[#0f0f13] text-zinc-400 border-[#23232b]'
        }`}
      >
        {indicacionPrevia}
      </div>

      {/* 4. TABLA PRINCIPAL DE PROGRESIÓN MULTI-BLOQUE */}
      <div className="overflow-x-auto w-full">
        <table
          className={`w-full text-left border-collapse text-xs sm:text-sm min-w-[760px] ${
            isPrint ? 'border-zinc-500' : 'border-[#272731]'
          }`}
        >
          {/* ENCABEZADOS DE COLUMNAS */}
          <thead>
            {/* FILA 1: D, EJERCICIOS, Y BLOQUES CON FECHA Y RIR */}
            <tr
              className={`border-b text-center font-bold uppercase text-[11px] sm:text-xs ${
                isPrint
                  ? 'bg-zinc-200 text-zinc-900 border-zinc-400'
                  : 'bg-[#18181f] text-zinc-200 border-[#272731]'
              }`}
            >
              <th
                rowSpan={2}
                className={`w-12 text-center px-2 py-2 border-r font-black ${
                  isPrint ? 'border-zinc-400' : 'border-[#272731]'
                }`}
              >
                D
              </th>
              <th
                rowSpan={2}
                className={`px-4 py-2 border-r font-black text-left min-w-[220px] ${
                  isPrint ? 'border-zinc-400' : 'border-[#272731]'
                }`}
              >
                EJERCICIOS
              </th>

              {bloques.map((b, idx) => (
                <th
                  key={idx}
                  colSpan={3}
                  className={`px-3 py-1.5 border-r last:border-r-0 text-center font-bold ${
                    isPrint
                      ? 'border-zinc-400 bg-zinc-300 text-zinc-900'
                      : 'border-[#272731] bg-[#1c1c24] text-white'
                  }`}
                >
                  <div className="flex items-center justify-around gap-2 text-[11px]">
                    <span className="font-bold">{b.fecha}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black ${
                        isPrint
                          ? 'bg-zinc-800 text-white'
                          : 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                      }`}
                    >
                      {b.rir}
                    </span>
                  </div>
                </th>
              ))}
            </tr>

            {/* FILA 2: SUBCOLUMNAS KG, R, S PARA CADA BLOQUE */}
            <tr
              className={`border-b text-center text-[10px] sm:text-[11px] font-mono font-bold ${
                isPrint
                  ? 'bg-zinc-100 text-zinc-800 border-zinc-400'
                  : 'bg-[#14141a] text-zinc-400 border-[#272731]'
              }`}
            >
              {bloques.map((_, bIdx) => (
                <React.Fragment key={bIdx}>
                  <th
                    className={`w-16 py-1.5 border-r font-bold ${
                      isPrint ? 'border-zinc-400' : 'border-[#272731]'
                    }`}
                  >
                    Kg.
                  </th>
                  <th
                    className={`w-12 py-1.5 border-r font-bold ${
                      isPrint ? 'border-zinc-400' : 'border-[#272731]'
                    }`}
                  >
                    R
                  </th>
                  <th
                    className={`w-12 py-1.5 border-r font-bold ${
                      isPrint ? 'border-zinc-400' : 'border-[#272731]'
                    }`}
                  >
                    S
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          {/* CUERPO DE LA TABLA AGRUPADO POR DÍAS */}
          <tbody>
            {dias.map((diaObj, diaIdx) => {
              const cantEjercicios = Math.max(1, diaObj.ejercicios?.length || 0);

              return (
                <React.Fragment key={diaIdx}>
                  {diaObj.ejercicios && diaObj.ejercicios.length > 0 ? (
                    diaObj.ejercicios.map((ejercicio, exIdx) => (
                      <tr
                        key={ejercicio.id || exIdx}
                        className={`border-b transition hover:bg-zinc-500/5 ${
                          isPrint
                            ? 'border-zinc-300'
                            : 'border-[#202029] hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* CELDA D: Solo en la primera fila del día con rowspan */}
                        {exIdx === 0 && (
                          <td
                            rowSpan={cantEjercicios}
                            className={`text-center align-middle font-black text-base sm:text-lg border-r ${
                              isPrint
                                ? 'border-zinc-400 bg-zinc-100 text-zinc-900'
                                : 'border-[#272731] bg-[#111116] text-white'
                            }`}
                          >
                            {diaObj.dia}
                          </td>
                        )}

                        {/* NOMBRE DEL EJERCICIO (Escritura libre por el profesor) */}
                        <td
                          className={`px-3 py-2 sm:px-4 sm:py-2.5 font-medium border-r ${
                            isPrint
                              ? 'border-zinc-300 text-zinc-900'
                              : 'border-[#272731] text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="select-all">{ejercicio.nombre}</span>
                          </div>
                        </td>

                        {/* VALORES KG, R, S PARA CADA BLOQUE */}
                        {bloques.map((_, bIdx) => {
                          const val = ejercicio.valores?.[bIdx] || { kg: '', r: '-', s: '-' };
                          return (
                            <React.Fragment key={bIdx}>
                              {/* Kg */}
                              <td
                                className={`text-center font-mono py-2 px-1 border-r text-xs ${
                                  isPrint
                                    ? 'border-zinc-300 text-zinc-800'
                                    : 'border-[#272731] text-zinc-300'
                                }`}
                              >
                                {val.kg ? (
                                  <span className="font-bold text-white bg-zinc-800 px-1 py-0.5 rounded">
                                    {val.kg}kg
                                  </span>
                                ) : (
                                  <span className="text-zinc-600">—</span>
                                )}
                              </td>
                              {/* R (Reps) */}
                              <td
                                className={`text-center font-mono font-bold py-2 px-1 border-r ${
                                  isPrint
                                    ? 'border-zinc-300 text-zinc-900'
                                    : 'border-[#272731] text-white'
                                }`}
                              >
                                {val.r || '—'}
                              </td>
                              {/* S (Series) */}
                              <td
                                className={`text-center font-mono font-bold py-2 px-1 border-r ${
                                  isPrint
                                    ? 'border-zinc-300 text-zinc-900'
                                    : 'border-[#272731] text-white'
                                }`}
                              >
                                {val.s || '—'}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    // Caso día sin ejercicios
                    <tr
                      className={`border-b ${
                        isPrint ? 'border-zinc-300' : 'border-[#202029]'
                      }`}
                    >
                      <td
                        className={`text-center py-3 font-black text-base border-r ${
                          isPrint
                            ? 'border-zinc-400 bg-zinc-100 text-zinc-900'
                            : 'border-[#272731] bg-[#111116] text-white'
                        }`}
                      >
                        {diaObj.dia}
                      </td>
                      <td
                        className={`px-4 py-3 italic text-zinc-500 border-r ${
                          isPrint ? 'border-zinc-300' : 'border-[#272731]'
                        }`}
                      >
                        Sin ejercicios cargados para este día.
                      </td>
                      {bloques.map((_, bIdx) => (
                        <React.Fragment key={bIdx}>
                          <td className="border-r py-3 text-center text-zinc-600">—</td>
                          <td className="border-r py-3 text-center text-zinc-600">—</td>
                          <td className="border-r py-3 text-center text-zinc-600">—</td>
                        </React.Fragment>
                      ))}
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. SECCIÓN INFERIOR: CONTROL Y GRILLA DE 30 DÍAS DE ASISTENCIA */}
      <div
        className={`p-4 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${
          isPrint
            ? 'bg-zinc-100 border-zinc-400 text-zinc-900'
            : 'bg-[#111116] border-[#272731] text-zinc-300'
        }`}
      >
        <div className="flex items-center gap-2.5 text-xs text-zinc-400">
          <Calendar className="w-4 h-4 text-white shrink-0" />
          <div>
            <p className="font-bold text-white">Grilla de Asistencia & Cumplimiento (Ciclo de 30 Días)</p>
            <p className="text-[11px] text-zinc-400">
              {isInteractive
                ? 'Toca un número para marcar o desmarcar tu sesión completada en el gimnasio.'
                : 'Control de sesiones entrenadas durante la vigencia del plan.'}
            </p>
          </div>
        </div>

        {/* CUADRÍCULA DE 30 CASILLAS OPTIMIZADA PARA MOBILE Y DESKTOP */}
        <div className="w-full md:w-auto">
          <div
            className={`border rounded-xl p-2 inline-block w-full sm:w-auto ${
              isPrint ? 'bg-white border-zinc-400' : 'bg-[#09090b] border-[#272731]'
            }`}
          >
            {/* VISTA MÓVIL: 3 FILAS DE 10 DÍAS (FÁCIL DE TOCAR CON EL PULGAR, SIN SCROLL) */}
            <div className="sm:hidden space-y-1.5 w-full">
              {[0, 10, 20].map((offset) => (
                <div
                  key={`row-${offset}`}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
                  className="gap-1 text-[11px] font-mono text-center"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1 + offset).map((diaNum) => {
                    const checked = setAsistencias.has(diaNum);
                    return (
                      <button
                        key={diaNum}
                        type="button"
                        disabled={!isInteractive}
                        onClick={() => isInteractive && onToggleAsistencia && onToggleAsistencia(diaNum)}
                        className={`h-7 w-full flex items-center justify-center rounded-lg border font-bold transition ${
                          checked
                            ? 'bg-zinc-200 text-zinc-950 border-white shadow-sm font-black'
                            : 'bg-[#18181f] text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white'
                        } ${isInteractive ? 'cursor-pointer active:scale-90' : 'cursor-default'}`}
                        title={`Día ${diaNum} - ${checked ? 'Completado' : 'Pendiente'}`}
                      >
                        {diaNum}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* VISTA TABLET / ESCRITORIO / IMPRESIÓN: 2 FILAS DE 15 DÍAS (IDÉNTICO A PLANILLA FÍSICA) */}
            <div className="hidden sm:block">
              {/* Fila 1: 1 al 15 */}
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
                className="gap-1 text-[11px] font-mono text-center mb-1"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((diaNum) => {
                  const checked = setAsistencias.has(diaNum);
                  return (
                    <button
                      key={diaNum}
                      type="button"
                      disabled={!isInteractive}
                      onClick={() => isInteractive && onToggleAsistencia && onToggleAsistencia(diaNum)}
                      className={`w-6 h-6 flex items-center justify-center rounded border font-bold transition ${
                        checked
                          ? isPrint
                            ? 'bg-zinc-700 text-white border-zinc-800'
                            : 'bg-zinc-300 text-zinc-950 border-white shadow-sm font-black'
                          : isPrint
                          ? 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                          : 'bg-[#18181f] text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white'
                      } ${isInteractive ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                      title={`Día ${diaNum} - ${checked ? 'Completado' : 'Pendiente'}`}
                    >
                      {diaNum}
                    </button>
                  );
                })}
              </div>

              {/* Fila 2: 16 al 30 */}
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
                className="gap-1 text-[11px] font-mono text-center"
              >
                {Array.from({ length: 15 }, (_, i) => i + 16).map((diaNum) => {
                  const checked = setAsistencias.has(diaNum);
                  return (
                    <button
                      key={diaNum}
                      type="button"
                      disabled={!isInteractive}
                      onClick={() => isInteractive && onToggleAsistencia && onToggleAsistencia(diaNum)}
                      className={`w-6 h-6 flex items-center justify-center rounded border font-bold transition ${
                        checked
                          ? isPrint
                            ? 'bg-zinc-700 text-white border-zinc-800'
                            : 'bg-zinc-300 text-zinc-950 border-white shadow-sm font-black'
                          : isPrint
                          ? 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                          : 'bg-[#18181f] text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white'
                      } ${isInteractive ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                      title={`Día ${diaNum} - ${checked ? 'Completado' : 'Pendiente'}`}
                    >
                      {diaNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
