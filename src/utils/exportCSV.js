/**
 * Export dashboard data as CSV.
 */
export function exportCSV(calculatedRows, totals, params) {
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

  const escapeCSV = (val) => {
    const str = val == null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.map(escapeCSV).join(',')];

  for (const row of calculatedRows) {
    lines.push(
      [
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
      ]
        .map(escapeCSV)
        .join(',')
    );
  }

  // Totals row
  lines.push(
    [
      'TOTAL',
      '',
      totals.totalVolumePerDay,
      '', '', '', '', '', '', '', '', '',
      '',
      totals.totalRequired,
      totals.totalPlantAvailable ?? '',
      totals.totalGap ?? '',
      '',
    ]
      .map(escapeCSV)
      .join(',')
  );

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'TVS_Wheel_Trolley_Dashboard.csv';
  a.click();
  URL.revokeObjectURL(url);
}
