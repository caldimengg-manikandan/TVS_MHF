/**
 * Global parameters — configurable defaults from the source sheet.
 */
export const DEFAULT_PARAMS = {
  workingHoursPerDay: 16,
  trolleyCapacity: 20,
  supplierHours: 4,
  transitHours: 1.5,
  openingHours: 2,
  pocHours: 0.5,
};

/**
 * Calculate a single row's derived values.
 *
 * Rounding rules (matching the source sheet exactly):
 *   - Stage pieces: Math.round() (nearest integer)
 *   - Trolley counts: Math.ceil() (ceiling)
 *
 * @param {object} row - { model, wheelLine, volumePerDay, plantAvailableTrolleys }
 * @param {object} params - global parameters
 * @returns {object} calculated row with all derived fields
 */
export function calculateRow(row, params) {
  const qty = row.qtyPerVehicle != null ? row.qtyPerVehicle : 1;
  const effectiveVolume = row.volumePerDay * qty;

  // IMPORTANT: keep the *exact* (unrounded) vol/hr for the stage-piece math.
  // Rounding this intermediate value before multiplying by stage hours was a bug:
  // it drifted from the source sheet on every model whose vol/day isn't an exact
  // multiple of 16 (e.g. 500/day -> 31.25/hr). Rounding early silently shaved or
  // added pieces at each stage (verified against the client's reference sheet:
  // HLX 100 @ 500/day must yield 125 supplier pieces, not 124).
  // `volPerHour` below is the rounded value kept ONLY for on-screen display.
  const volPerHourExact = effectiveVolume / params.workingHoursPerDay;
  const volPerHour = Math.round(volPerHourExact);

  const capacity = row.trolleyCapacity != null ? row.trolleyCapacity : params.trolleyCapacity;

  const supplierPieces = Math.round(volPerHourExact * params.supplierHours);
  const transitPieces = Math.round(volPerHourExact * params.transitHours);
  const openingPieces = Math.round(volPerHourExact * params.openingHours);
  const pocPieces = Math.round(volPerHourExact * params.pocHours);

  const supplierTrolleys = Math.ceil(supplierPieces / capacity);
  const transitTrolleys = Math.ceil(transitPieces / capacity);
  const openingTrolleys = Math.ceil(openingPieces / capacity);
  const pocTrolleys = Math.ceil(pocPieces / capacity);

  const totalRequired =
    supplierTrolleys + transitTrolleys + openingTrolleys + pocTrolleys;

  const gap =
    row.plantAvailableTrolleys != null
        ? row.plantAvailableTrolleys - totalRequired
        : null;

  return {
    ...row,
    qtyPerVehicle: qty,
    trolleyCapacity: capacity,
    volPerHour,
    supplierPieces,
    transitPieces,
    openingPieces,
    pocPieces,
    supplierTrolleys,
    transitTrolleys,
    openingTrolleys,
    pocTrolleys,
    totalRequired,
    gap,
  };
}

/**
 * Calculate totals across all rows.
 * @param {Array} calculatedRows
 * @returns {object} totals
 */
export function calculateTotals(calculatedRows) {
  let totalVolumePerDay = 0;
  let totalRequired = 0;
  let totalPlantAvailable = 0;
  let hasAnyPlantAvailable = false;

  for (const row of calculatedRows) {
    totalVolumePerDay += row.volumePerDay;
    totalRequired += row.totalRequired;
    if (row.plantAvailableTrolleys != null) {
      totalPlantAvailable += row.plantAvailableTrolleys;
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
