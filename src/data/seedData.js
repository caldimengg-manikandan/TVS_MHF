/**
 * Seed data — 16 rows (8 models x Front/Rear wheel line).
 *
 * volumePerDay values are taken VERBATIM from the client's source reference
 * sheet ("HLX — wheel trolley Dashboard"), not reverse-engineered. Each value
 * below was cross-checked stage-by-stage (supplier/transit/opening/POC pieces
 * AND trolley counts) against that sheet and matches exactly. See
 * HANDOVER_v3_wheel_trolley_dashboard.md §2 "Model Volume Audit" for the
 * row-by-row proof.
 *
 * Verified totals (combined front+rear, all 16 rows):
 *   - Sum of 8 model volumes/day = 3,250
 *   - Total trolleys required    = 196
 *   - HLX 100 / HLX 125 (either gearbox) = 15 trolleys/line (500/day)
 *   - HLX 150 = 9 trolleys/line (300/day)
 *   - Radeon / City+ DOM = 7 trolleys/line (200/day)
 *   - Sport = 9 trolleys/line (250/day)
 *   - Raider = 21 trolleys/line (800/day)
 *
 * PLANT AVAILABLE — placeholder/demo values only.
 * These are NOT real plant trolley counts. They exist purely so a fresh
 * install shows working surplus/shortage analytics instead of an all-dash
 * "Unallocated" dashboard. Replace with an actual physical trolley count
 * from the Hosur plant floor before this is used for any real planning
 * decision. (Flagged as an open action item in the handover doc.)
 */

let _id = 0;
const makeId = () => `row-${++_id}`;

const MODELS = [
  { model: 'HLX 100',           volumePerDay: 500, plantAvailablePerLine: 15 },
  { model: 'HLX 125 4-speed',   volumePerDay: 500, plantAvailablePerLine: 12 },
  { model: 'HLX 125 5-speed',   volumePerDay: 500, plantAvailablePerLine: 17 },
  { model: 'HLX 150',           volumePerDay: 300, plantAvailablePerLine: 9 },
  { model: 'Radeon',            volumePerDay: 200, plantAvailablePerLine: 5 },
  { model: 'City+ DOM',         volumePerDay: 200, plantAvailablePerLine: 9 },
  { model: 'Sport',             volumePerDay: 250, plantAvailablePerLine: 8 },
  { model: 'Raider',            volumePerDay: 800, plantAvailablePerLine: 21 },
];

export const SEED_ROWS = MODELS.flatMap(({ model, volumePerDay, plantAvailablePerLine }) => {
  const modelCode = model.replace(/[\s\+-]+/g, '');
  return [
    {
      id: makeId(),
      model,
      wheelLine: 'Front wheel Assy',
      volumePerDay,
      partNumber: `PN-${modelCode}-F`,
      qtyPerVehicle: 1,
      trolleyType: 'Standard Wheel Trolley',
      trolleyCapacity: 20,
      plantAvailableTrolleys: plantAvailablePerLine,
      remarks: '',
      source: 'default',
      status: 'Active',
      notes: '',
      category: '',
      addedAt: null,
      addedBy: null,
      inManufacturingLine: true,
    },
    {
      id: makeId(),
      model,
      wheelLine: 'Rear wheel Assy',
      volumePerDay,
      partNumber: `PN-${modelCode}-R`,
      qtyPerVehicle: 1,
      trolleyType: 'Standard Wheel Trolley',
      trolleyCapacity: 20,
      plantAvailableTrolleys: plantAvailablePerLine,
      remarks: '',
      source: 'default',
      status: 'Active',
      notes: '',
      category: '',
      addedAt: null,
      addedBy: null,
      inManufacturingLine: true,
    },
  ];
});

export function getNextId() {
  return makeId();
}
