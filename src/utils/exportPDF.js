import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export dashboard data as PDF.
 */
export function exportPDF(calculatedRows, totals, params) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TVS — MHF Wheel Trolley Dashboard', 14, 15);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}   |   Working Hours: ${params.workingHoursPerDay}h   |   Trolley Capacity: ${params.trolleyCapacity}`,
    14,
    21
  );

  doc.setTextColor(0);

  const headers = [
    [
      'Model',
      'Wheel Line',
      'Vol/Day',
      'Vol/Hr',
      `Sup(${params.supplierHours}h)\nPcs`,
      'Sup\nTrol',
      `Trn(${params.transitHours}h)\nPcs`,
      'Trn\nTrol',
      `Opn(${params.openingHours}h)\nPcs`,
      'Opn\nTrol',
      `POC(${params.pocHours}h)\nPcs`,
      'POC\nTrol',
      'Cap',
      'Req',
      'Avail',
      'Gap',
      'Remarks',
    ],
  ];

  const body = calculatedRows.map((row) => [
    row.model,
    row.wheelLine === 'Front wheel Assy' ? 'Front' : 'Rear',
    row.volumePerDay,
    row.volPerHour,
    row.supplierPieces,
    row.supplierTrolleys,
    row.transitPieces,
    row.transitTrolleys,
    row.openingPieces,
    row.openingTrolleys,
    row.pocPieces,
    row.pocTrolleys,
    params.trolleyCapacity,
    row.totalRequired,
    row.plantAvailableTrolleys ?? '—',
    row.gap != null ? (row.gap >= 0 ? `+${row.gap}` : row.gap) : '—',
    row.remarks || '',
  ]);

  // Totals row
  body.push([
    { content: 'TOTAL', styles: { fontStyle: 'bold' } },
    '',
    { content: totals.totalVolumePerDay, styles: { fontStyle: 'bold' } },
    '',
    '', '', '', '', '', '', '', '',
    '',
    { content: totals.totalRequired, styles: { fontStyle: 'bold', textColor: [184, 134, 11] } },
    totals.totalPlantAvailable ?? '—',
    totals.totalGap != null
      ? { content: totals.totalGap >= 0 ? `+${totals.totalGap}` : totals.totalGap,
          styles: { fontStyle: 'bold', textColor: totals.totalGap >= 0 ? [46, 125, 50] : [198, 40, 40] } }
      : '—',
    '',
  ]);

  autoTable(doc, {
    head: headers,
    body,
    startY: 26,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [40, 44, 52],
      textColor: [230, 230, 230],
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 14 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right', fontSize: 6 },
      5: { halign: 'right' },
      6: { halign: 'right', fontSize: 6 },
      7: { halign: 'right' },
      8: { halign: 'right', fontSize: 6 },
      9: { halign: 'right' },
      10: { halign: 'right', fontSize: 6 },
      11: { halign: 'right' },
      12: { halign: 'right' },
      13: { halign: 'right', fontStyle: 'bold' },
      14: { halign: 'right' },
      15: { halign: 'right', fontStyle: 'bold' },
      16: { cellWidth: 20 },
    },
    didParseCell: (data) => {
      // Color-code Gap column
      if (data.column.index === 15 && data.section === 'body') {
        const val = data.cell.raw;
        if (typeof val === 'number' || typeof val === 'string') {
          const num = typeof val === 'number' ? val : parseInt(val, 10);
          if (!isNaN(num)) {
            if (num >= 0) {
              data.cell.styles.textColor = [46, 125, 50];
              data.cell.styles.fillColor = [232, 245, 233];
            } else {
              data.cell.styles.textColor = [198, 40, 40];
              data.cell.styles.fillColor = [255, 235, 238];
            }
          }
        }
      }
      // Highlight Required column
      if (data.column.index === 13 && data.section === 'body') {
        data.cell.styles.fillColor = [255, 248, 225];
        data.cell.styles.textColor = [184, 134, 11];
      }
    },
  });

  // Footer note
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('TVS Motor Company — Internal / Confidential', 14, pageHeight - 8);
  doc.text(
    `Params: Supplier ${params.supplierHours}h, Transit ${params.transitHours}h, Opening ${params.openingHours}h, POC ${params.pocHours}h, Cap ${params.trolleyCapacity}`,
    14,
    pageHeight - 4
  );

  doc.save('TVS_Wheel_Trolley_Dashboard.pdf');
}
