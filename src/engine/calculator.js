export const DEFAULT_PARAMS = {
  workingHoursPerDay: 16,
  supplierHours: 2,
  transitHours: 2,
  openingHours: 4,
  pocHours: 4,
};

/**
 * Backward compatibility stub for old store.
 */
export function calculateRow(row, params) {
  if (!row || !params) return null;
  const effectiveVolume = row.volumePerDay * (row.qtyPerVehicle || 1);
  const volPerHourExact = params.workingHoursPerDay > 0 ? effectiveVolume / params.workingHoursPerDay : 0;
  const volPerHour = Math.round(volPerHourExact);
  const capacity = row.trolleyCapacity || 20;

  const supplierPieces = Math.round(volPerHourExact * params.supplierHours);
  const transitPieces = Math.round(volPerHourExact * params.transitHours);
  const openingPieces = Math.round(volPerHourExact * params.openingHours);
  const pocPieces = Math.round(volPerHourExact * params.pocHours);

  const supplierTrolleys = Math.ceil(supplierPieces / capacity);
  const transitTrolleys = Math.ceil(transitPieces / capacity);
  const openingTrolleys = Math.ceil(openingPieces / capacity);
  const pocTrolleys = Math.ceil(pocPieces / capacity);

  const totalRequired = supplierTrolleys + transitTrolleys + openingTrolleys + pocTrolleys;
  const gap = row.plantAvailableTrolleys != null ? row.plantAvailableTrolleys - totalRequired : null;

  return {
    ...row,
    volPerHour,
    supplierPieces, transitPieces, openingPieces, pocPieces,
    supplierTrolleys, transitTrolleys, openingTrolleys, pocTrolleys,
    totalRequired,
    gap,
  };
}

/**
 * Calculate a single part's derived MHF values based on the normalized structure.
 *
 * @param {object} part - The part master entity
 * @param {object} mhfParams - The part's MHF parameters
 * @param {object} vehicle - The vehicle master entity
 * @returns {object} Calculated row object for display
 */
export function calculateMhfRow(part, mhfParams, vehicle) {
  if (!part || !mhfParams) return null;

  const effectiveVolume = mhfParams.daily_volume || 0;
  const workingHours = mhfParams.working_hours || 16;
  
  const volPerHourExact = workingHours > 0 ? effectiveVolume / workingHours : 0;
  const volPerHour = Math.round(volPerHourExact);

  const capacity = part.capacity || 20;

  const supplierPieces = Math.round(volPerHourExact * (mhfParams.supplier_hours || 0));
  const transitPieces = Math.round(volPerHourExact * (mhfParams.transit_hours || 0));
  const openingPieces = Math.round(volPerHourExact * (mhfParams.opening_hours || 0));
  const pocPieces = Math.round(volPerHourExact * (mhfParams.poc_hours || 0));

  const supplierTrolleys = Math.ceil(supplierPieces / capacity);
  const transitTrolleys = Math.ceil(transitPieces / capacity);
  const openingTrolleys = Math.ceil(openingPieces / capacity);
  const pocTrolleys = Math.ceil(pocPieces / capacity);

  const totalRequired = supplierTrolleys + transitTrolleys + openingTrolleys + pocTrolleys;

  const gap = mhfParams.plant_available != null
    ? mhfParams.plant_available - totalRequired
    : null;

  return {
    part_id: part.part_id,
    vehicle_model: vehicle ? vehicle.vehicle_name : 'Unknown',
    variant: vehicle ? vehicle.variant : '',
    part_name: part.part_name,
    part_number: part.part_number,
    daily_volume: effectiveVolume,
    volPerHour,
    supplierPieces,
    transitPieces,
    openingPieces,
    pocPieces,
    supplierHours: mhfParams.supplier_hours || 0,
    transitHours: mhfParams.transit_hours || 0,
    openingHours: mhfParams.opening_hours || 0,
    pocHours: mhfParams.poc_hours || 0,
    capacity,
    supplierTrolleys,
    transitTrolleys,
    openingTrolleys,
    pocTrolleys,
    totalRequired,
    plant_available: mhfParams.plant_available,
    gap,
    remarks: mhfParams.remarks || '',
    status: part.status,
    // Alias for old UI components
    model: vehicle ? vehicle.vehicle_name : 'Unknown',
    wheelLine: part.part_name,
    partNumber: part.part_number,
    volumePerDay: effectiveVolume,
    trolleyCapacity: capacity,
    plantAvailableTrolleys: mhfParams.plant_available,
  };
}

/**
 * Calculate totals across all joined rows.
 * @param {Array} calculatedRows
 * @returns {object} totals
 */
export function calculateTotals(calculatedRows) {
  let totalVolumePerDay = 0;
  let totalRequired = 0;
  let totalPlantAvailable = 0;
  let hasAnyPlantAvailable = false;

  for (const row of calculatedRows) {
    if (!row) continue;
    // We sum up daily_volume assuming it's per part, though in the old code it was per vehicle.
    // The new requirement is that daily_volume is per-part in mhfParams.
    totalVolumePerDay += row.daily_volume || 0;
    totalRequired += row.totalRequired || 0;
    
    if (row.plant_available != null) {
      totalPlantAvailable += row.plant_available;
      hasAnyPlantAvailable = true;
    }
  }

  const totalGap = hasAnyPlantAvailable
    ? totalPlantAvailable - totalRequired
    : null;

  return {
    totalVolumePerDay,
    totalRequired,
    totalPlantAvailable: hasAnyPlantAvailable ? totalPlantAvailable : null,
    totalGap,
  };
}
