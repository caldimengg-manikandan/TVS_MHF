import ExcelJS from 'exceljs';

/**
 * Export dashboard data as Excel (.xlsx).
 */
export async function exportExcel(calculatedRows, totals) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Wheel Trolley Dashboard');

  const headers = [
    'MHF Description',
    'Volume/day',
    'Qty / MHF',
    'Supplier',
    'Transit inventory',
    'Opening Inventory',
    'Inventory at POC',
    'TOTAL',
    'Available',
    'Gap'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF107C41' } // Excel Green
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  for (const row of calculatedRows) {
    const mhfDesc = row.model + ' ' + (row.partName || row.wheelLine || '');
    const rowValues = [
      mhfDesc.trim(),
      row.volumePerDay || 0,
      row.trolleyCapacity || row.capacity || 0,
      row.supplierTrolleys || 0,
      row.transitTrolleys || 0,
      row.openingTrolleys || 0,
      row.pocTrolleys || 0,
      row.totalRequired || 0,
      row.plantAvailableTrolleys ?? '',
      row.gap ?? ''
    ];
    
    const addedRow = worksheet.addRow(rowValues);
    addedRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
    });
  }

  // Footer row
  const footerValues = [
    'TOTAL',
    totals.totalVolumePerDay || 0,
    '',
    totals.totalSupplier || 0,
    totals.totalTransit || 0,
    totals.totalOpening || 0,
    totals.totalPoc || 0,
    totals.totalRequired || 0,
    totals.totalPlantAvailable ?? '',
    totals.totalGap ?? ''
  ];
  const footerRow = worksheet.addRow(footerValues);
  footerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFEFEF' }
    };
    cell.font = {
      bold: true
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.columns.forEach(column => {
    let maxLen = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const colLen = cell.value ? cell.value.toString().length : 10;
      if (colLen > maxLen) {
        maxLen = colLen;
      }
    });
    column.width = maxLen + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `TVS_Wheel_Trolley_Dashboard.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
