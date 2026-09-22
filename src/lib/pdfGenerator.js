import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parsePlanillaData } from './rutinas';

/**
 * Genera y descarga un PDF con la Planilla Técnica Oficial de E22 Gym.
 * Replica de forma exacta la hoja física de planificación de cargas y periodización.
 */
export function generarRutinaPDF({ alumno, rutina, planilla: planillaArg }) {
  if (!alumno) {
    alert('No hay información suficiente del alumno para exportar.');
    return;
  }

  const planilla =
    planillaArg ||
    (rutina?.planilla
      ? rutina.planilla
      : parsePlanillaData(rutina?.detalles, rutina?.titulo));

  // Usamos orientación horizontal (landscape) para que las 4 etapas entren con total nitidez y legibilidad
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const alumnoNombre = (alumno.nombre_completo || `${alumno.nombre} ${alumno.apellido || ''}`).trim();
  const planNumero = planilla.planNumero || '1';
  const objetivo = planilla.objetivo || 'Variación de cargas múltiples – OBJETIVO: Desarrollo de Fuerza';
  const indicacionPrevia =
    planilla.indicacionPrevia ||
    'PREVIAMENTE REALIZAR EJERCICIOS DE LA TABLA DE "CORE/MOVILIDAD/ESTABILIDAD" PARA LUEGO COMENZAR CON EL DIA CORRESPONDIENTE';
  const bloques = planilla.bloques || [];
  const dias = planilla.dias || [];
  const asistenciaSet = new Set((planilla.asistenciaDias || []).map(Number));

  // 1. FRANJA SUPERIOR: PLAN Nº X - NOMBRE DEL ALUMNO
  doc.setFillColor(39, 39, 42); // zinc-800
  doc.rect(10, 10, pageWidth - 20, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `PLAN Nº ${planNumero} – ${alumnoNombre.toUpperCase()}`,
    pageWidth / 2,
    15.5,
    { align: 'center' }
  );

  // 2. FRANJA SUBTÍTULO / OBJETIVO
  doc.setFillColor(228, 228, 231); // zinc-200
  doc.rect(10, 18, pageWidth - 20, 7, 'F');
  doc.setDrawColor(161, 161, 170); // zinc-400
  doc.rect(10, 18, pageWidth - 20, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text(objetivo, pageWidth / 2, 22.8, { align: 'center' });

  // 3. FRANJA DE CALENTAMIENTO PREVIO
  doc.setFillColor(244, 244, 245); // zinc-100
  doc.rect(10, 25, pageWidth - 20, 6, 'F');
  doc.rect(10, 25, pageWidth - 20, 6, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(63, 63, 70);
  doc.text(indicacionPrevia, pageWidth / 2, 29.2, { align: 'center' });

  // 4. PREPARAR CABECERAS Y FILAS DE LA TABLA
  const head = [
    [
      { content: 'D', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } },
      { content: 'EJERCICIOS', rowSpan: 2, styles: { halign: 'left', valign: 'middle', fontStyle: 'bold' } },
      ...bloques.map((b) => ({
        content: `${b.fecha}   |   ${b.rir}`,
        colSpan: 3,
        styles: { halign: 'center', fontStyle: 'bold', fillColor: [220, 220, 225] },
      })),
    ],
    [
      ...bloques.flatMap(() => [
        { content: 'Kg.', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'R', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'S', styles: { halign: 'center', fontStyle: 'bold' } },
      ]),
    ],
  ];

  const body = [];

  dias.forEach((diaObj) => {
    const cant = Math.max(1, diaObj.ejercicios?.length || 0);

    if (diaObj.ejercicios && diaObj.ejercicios.length > 0) {
      diaObj.ejercicios.forEach((ex, exIdx) => {
        const row = [];

        if (exIdx === 0) {
          row.push({
            content: String(diaObj.dia),
            rowSpan: cant,
            styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [248, 248, 250] },
          });
        }

        row.push({ content: ex.nombre || '', styles: { halign: 'left', fontStyle: 'normal' } });

        bloques.forEach((_, bIdx) => {
          const val = ex.valores?.[bIdx] || { kg: '', r: '', s: '' };
          row.push({ content: val.kg || '', styles: { halign: 'center' } });
          row.push({ content: String(val.r || ''), styles: { halign: 'center', fontStyle: 'bold' } });
          row.push({ content: String(val.s || ''), styles: { halign: 'center', fontStyle: 'bold' } });
        });

        body.push(row);
      });
    } else {
      body.push([
        { content: String(diaObj.dia), styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'Sin ejercicios cargados', styles: { fontStyle: 'italic' } },
        ...bloques.flatMap(() => ['', '', '']),
      ]);
    }
  });

  // Generar tabla con autoTable
  autoTable(doc, {
    startY: 32,
    head: head,
    body: body,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      lineColor: [161, 161, 170],
      lineWidth: 0.2,
      textColor: [24, 24, 27],
    },
    headStyles: {
      fillColor: [240, 240, 242],
      textColor: [24, 24, 27],
      fontStyle: 'bold',
      lineColor: [161, 161, 170],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 10 }, // D
      1: { cellWidth: 'auto' }, // EJERCICIOS
    },
  });

  const finalY = doc.lastAutoTable.finalY || 140;

  // 5. GRILLA DE 30 DÍAS DE ASISTENCIA EN LA ESQUINA INFERIOR DERECHA (Idéntica a la foto)
  const boxWidth = 9;
  const boxHeight = 6;
  const gridTotalWidth = boxWidth * 15;
  const gridStartX = pageWidth - 10 - gridTotalWidth;
  const gridStartY = Math.min(finalY + 4, pageHeight - 22);

  // Marco exterior
  doc.setDrawColor(113, 113, 122);
  doc.setLineWidth(0.3);

  // Fila 1: 1 al 15
  for (let i = 1; i <= 15; i++) {
    const x = gridStartX + (i - 1) * boxWidth;
    const y = gridStartY;

    if (asistenciaSet.has(i)) {
      doc.setFillColor(161, 161, 170); // sombreado como en la foto
      doc.rect(x, y, boxWidth, boxHeight, 'FD');
    } else {
      doc.rect(x, y, boxWidth, boxHeight, 'S');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(24, 24, 27);
    doc.text(String(i), x + boxWidth / 2, y + 4.2, { align: 'center' });
  }

  // Fila 2: 16 al 30
  for (let i = 16; i <= 30; i++) {
    const x = gridStartX + (i - 16) * boxWidth;
    const y = gridStartY + boxHeight;

    if (asistenciaSet.has(i)) {
      doc.setFillColor(161, 161, 170); // sombreado como en la foto
      doc.rect(x, y, boxWidth, boxHeight, 'FD');
    } else {
      doc.rect(x, y, boxWidth, boxHeight, 'S');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(24, 24, 27);
    doc.text(String(i), x + boxWidth / 2, y + 4.2, { align: 'center' });
  }

  // Nota de pie a la izquierda
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text(
    `E22 GYM — Centro de Alto Rendimiento • Socio DNI: ${alumno.dni || ''} • Emisión: ${new Date().toLocaleDateString('es-AR')}`,
    10,
    gridStartY + 8
  );

  // Descargar archivo PDF
  const filename = `Planilla_E22_Plan${planNumero}_${alumnoNombre.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
