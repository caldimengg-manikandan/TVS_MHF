/**
 * Shared table columns configuration.
 * Serves as the single source of truth for grid alignments, widths, and types.
 */
export const TABLE_COLUMNS = [
  { key: 'model', name: 'Model', align: 'left', width: '180px' },
  { key: 'wheelLine', name: 'Part Name', align: 'left', width: '160px' },
  { key: 'partNumber', name: 'Part Number', align: 'left', width: '150px', mono: true },
  { key: 'qtyPerVehicle', name: 'Qty', align: 'right', width: '60px', mono: true },
  { key: 'volumePerDay', name: 'Vol/Day', align: 'right', width: '90px', mono: true },
  { key: 'volPerHour', name: 'Vol/Hr', align: 'right', width: '75px', mono: true },
  
  // Stage Columns
  { key: 'supplierPieces', name: 'Pcs', align: 'right', width: '65px', mono: true, isStage: true, stage: 'supplier' },
  { key: 'supplierTrolleys', name: 'Trolleys', align: 'right', width: '80px', mono: true, isStage: true, stage: 'supplier' },
  
  { key: 'transitPieces', name: 'Pcs', align: 'right', width: '65px', mono: true, isStage: true, stage: 'transit' },
  { key: 'transitTrolleys', name: 'Trolleys', align: 'right', width: '80px', mono: true, isStage: true, stage: 'transit' },
  
  { key: 'openingPieces', name: 'Pcs', align: 'right', width: '65px', mono: true, isStage: true, stage: 'opening' },
  { key: 'openingTrolleys', name: 'Trolleys', align: 'right', width: '80px', mono: true, isStage: true, stage: 'opening' },
  
  { key: 'pocPieces', name: 'Pcs', align: 'right', width: '65px', mono: true, isStage: true, stage: 'poc' },
  { key: 'pocTrolleys', name: 'Trolleys', align: 'right', width: '80px', mono: true, isStage: true, stage: 'poc' },
  
  { key: 'trolleyType', name: 'Trolley Type', align: 'left', width: '220px' },
  { key: 'trolleyCapacity', name: 'Cap', align: 'right', width: '65px', mono: true },
  
  // Totals / Gap Columns
  { key: 'totalRequired', name: 'Required', align: 'right', width: '90px', mono: true, highlight: true },
  { key: 'plantAvailableTrolleys', name: 'Plant Avail', align: 'right', width: '100px', mono: true, highlight: true },
  { key: 'gap', name: 'Gap', align: 'right', width: '90px', mono: true, highlight: true },
  
  { key: 'remarks', name: 'Remarks', align: 'left', width: '180px' },
  { key: 'actions', name: 'Actions', align: 'center', width: '105px', isAction: true }
];
