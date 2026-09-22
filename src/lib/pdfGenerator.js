import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera y descarga un PDF estilizado con la rutina de entrenamiento del alumno en E22 Gym.
 */
export function generarRutinaPDF({ alumno, rutina }) {
  if (!alumno || !rutina) {
    alert('No hay información suficiente para exportar la rutina.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. ENCABEZADO SUPERIOR (Fondo Oscuro Deportivo E22)
  doc.setFillColor(9, 9, 11); // slate-950
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Franja decorativa color blanco/zinc E22
  doc.setFillColor(255, 255, 255); // blanco
  doc.rect(0, 38, pageWidth, 1.5, 'F');

  // Nombre del Gimnasio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('E22 GYM', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('CENTRO DE ALTO RENDIMIENTO & FITNESS', 14, 25);
  doc.text('PLANILLA OFICIAL DE ENTRENAMIENTO (6 DÍAS)', 14, 32);

  // Fecha de emisión
  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Fecha de Emisión: ${fechaHoy}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Vencimiento Membresía: ${alumno.vencimiento_cuota || 'Al día'}`, pageWidth - 14, 26, { align: 'right' });
  doc.text(`Días de entrenamiento: ${alumno.dias_asistencia || 6} días/sem`, pageWidth - 14, 32, { align: 'right' });

  // 2. TARJETA DE DATOS DEL ALUMNO Y FICHA MÉDICA
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 47, pageWidth - 28, 30, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('SOCIO:', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`${alumno.nombre_completo || alumno.nombre} (DNI: ${alumno.dni})`, 38, 55);

  doc.setFont('helvetica', 'bold');
  doc.text('TELÉFONO:', 20, 63);
  doc.setFont('helvetica', 'normal');
  doc.text(`${alumno.telefono || 'Sin registrar'}`, 42, 63);

  doc.setFont('helvetica', 'bold');
  doc.text('ALERTAS:', 20, 71);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(185, 28, 28); // rojo alerta
  const alertaTexto = `Alergias: ${alumno.alergias || 'Ninguna'} | Patologías: ${alumno.patologias || 'Ninguna'}`;
  doc.text(doc.splitTextToSize(alertaTexto, pageWidth - 60), 38, 71);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('ENTRENADOR:', pageWidth / 2 + 15, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(rutina.profesor_nombre || 'Staff E22', pageWidth / 2 + 45, 55);

  // 3. TÍTULO DE LA PLANILLA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(24, 24, 27);
  doc.text(rutina.titulo || 'Planilla de Rutina E22 (Lunes a Sábado)', 14, 85);

  // 4. TABLA DE EJERCICIOS
  const lineas = (rutina.detalles || '').split('\n');
  const tableRows = [];

  lineas.forEach((linea) => {
    const trimmed = linea.trim();
    if (!trimmed) return;

    if (
      trimmed.toLowerCase().startsWith('día') ||
      trimmed.toLowerCase().startsWith('dia') ||
      trimmed.toLowerCase().startsWith('notas')
    ) {
      tableRows.push([
        {
          content: trimmed.replace(':', ''),
          colSpan: 3,
          styles: {
            fillColor: [24, 24, 27],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
        },
      ]);
    } else {
      let ejercicio = trimmed.replace(/^[•\-\*]\s*/, '');
      let seriesReps = '-';
      let check = '[  ] Realizado';

      if (ejercicio.includes(':')) {
        const partes = ejercicio.split(':');
        ejercicio = partes[0].trim();
        seriesReps = partes.slice(1).join(':').trim();
      }

      tableRows.push([ejercicio, seriesReps, check]);
    }
  });

  if (tableRows.length === 0) {
    tableRows.push([rutina.detalles, '', '']);
  }

  autoTable(doc, {
    startY: 90,
    head: [['Ejercicio / Movimiento', 'Series x Repeticiones', 'Control Diario']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 2.5,
      overflow: 'linebreak',
    },
  });

  // 5. PIE DE PÁGINA
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : pageHeight - 20;
  const footerY = Math.min(finalY, pageHeight - 15);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('E22 GYM • Centro de Entrenamiento • Calidad, Fuerza y Rendimiento', pageWidth / 2, footerY, {
    align: 'center',
  });

  const nombreArchivo = `Rutina_${(alumno.nombre_completo || alumno.nombre).replace(/\s+/g, '_')}_E22.pdf`;
  doc.save(nombreArchivo);
}
