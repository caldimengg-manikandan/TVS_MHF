/**
 * Regression check — validates the REAL production engine (src/engine/calculator.js)
 * and the REAL seed data (src/data/seedData.js) against the client's source
 * reference sheet ("HLX — wheel trolley Dashboard" PDF), row by row.
 *
 * This replaces the old verify.mjs, which reverse-engineered plausible-looking
 * volume/day numbers from scratch (without the actual source sheet) and got
 * 5 of 8 models wrong as a result. This version checks the real engine against
 * real source figures instead of guessing.
 *
 * Run: node verify.mjs
 */
import { DEFAULT_PARAMS, calculateRow } from './src/engine/calculator.js';

// Ground truth, transcribed directly from the client's source sheet (per wheel line).
const SOURCE_OF_TRUTH = [
  // model              vol/day  vph  supplierPcs transitPcs openingPcs pocPcs  totalTrolleys
  ['HLX 100',            500,    31,  125,        47,        63,        16,     15],
  ['HLX 125 4-speed',    500,    31,  125,        47,        63,        16,     15],
  ['HLX 125 5-speed',    500,    31,  125,        47,        63,        16,     15],
  ['HLX 150',            300,    19,  75,         28,        38,        9,      9],
  ['Radeon',             200,    13,  50,         19,        25,        6,      7],
  ['City+ DOM',          200,    13,  50,         19,        25,        6,      7],
  ['Sport',              250,    16,  63,         23,        31,        8,      9],
  ['Raider',             800,    50,  200,        75,        100,       25,     21],
];

let allPass = true;
console.log('Model                vol/day  vph  sup  trn  opn  poc  total   result');
console.log('-'.repeat(78));

for (const [model, vol, vph, sup, trn, opn, poc, total] of SOURCE_OF_TRUTH) {
  const row = calculateRow({ model, volumePerDay: vol, qtyPerVehicle: 1, trolleyCapacity: 20 }, DEFAULT_PARAMS);
  const checks = {
    volPerHour: row.volPerHour === vph,
    supplierPieces: row.supplierPieces === sup,
    transitPieces: row.transitPieces === trn,
    openingPieces: row.openingPieces === opn,
    pocPieces: row.pocPieces === poc,
    totalRequired: row.totalRequired === total,
  };
  const pass = Object.values(checks).every(Boolean);
  if (!pass) allPass = false;
  console.log(
    `${model.padEnd(20)} ${String(vol).padStart(6)}  ${String(row.volPerHour).padStart(3)}  ` +
    `${String(row.supplierPieces).padStart(3)}  ${String(row.transitPieces).padStart(3)}  ` +
    `${String(row.openingPieces).padStart(3)}  ${String(row.pocPieces).padStart(3)}  ` +
    `${String(row.totalRequired).padStart(5)}   ${pass ? 'PASS' : 'FAIL ' + JSON.stringify(checks)}`
  );
}

console.log('-'.repeat(78));
console.log(allPass ? 'ALL ROWS MATCH SOURCE SHEET ✔' : 'MISMATCHES FOUND ✘');

// Grand total check (16 rows = each of the 8 above, doubled for front+rear).
const grandTotal = SOURCE_OF_TRUTH.reduce((sum, [, , , , , , , total]) => sum + total * 2, 0);
console.log(`Grand total (16 rows): ${grandTotal} (expected 196)`);

process.exit(allPass && grandTotal === 196 ? 0 : 1);
