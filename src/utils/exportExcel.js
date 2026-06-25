import * as XLSX from 'xlsx';

/**
 * Export dashboard data as Excel (.xlsx).
 */
export function exportExcel(calculatedRows, totals, params) {
  const headers = [
    'Model',
    'Part Name',
    'Vol/Day',
    'Vol/Hr',
    `Supplier (${params.supplierHours}h) Pcs`,
    `Supplier Trolleys`,
    `Transit (${params.transitHours}h) Pcs`,
    `Transit Trolleys`,
    `Opening (${params.openingHours}h) Pcs`,
    `Opening Trolleys`,
    `POC (${params.pocHours}h) Pcs`,
    `POC Trolleys`,
    'Capacity',
    'Required',
    'Plant Available',
    'Gap',
    'Remarks',
  ];

  const data = calculatedRows.map((row) => [
    row.model,
    row.wheelLine,
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
    row.plantAvailableTrolleys ?? '',
    row.gap ?? '',
    row.remarks,
  ]);

  // Footer row
  data.push([
    'TOTAL',
    '',
    totals.totalVolumePerDay,
    '',
    '', '', '', '', '', '', '', '',
    '',
    totals.totalRequired,
    totals.totalPlantAvailable ?? '',
    totals.totalGap ?? '',
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Column widths
  ws['!cols'] = [
    { wch: 18 }, { wch: 16 }, { wch: 8 }, { wch: 7 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 8 }, { wch: 10 }, { wch: 13 }, { wch: 6 }, { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Wheel Trolley Dashboard');
  XLSX.writeFile(wb, 'TVS_Wheel_Trolley_Dashboard.xlsx');
}
