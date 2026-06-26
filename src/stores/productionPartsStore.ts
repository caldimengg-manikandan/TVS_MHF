import { create } from 'zustand';

// --- Seed Data generation ---
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

let vId = 1;
let pId = 1;

const seedVehicles = [];
const seedParts = [];
const seedMhfParams = [];

MODELS.forEach((m) => {
  const vehicleId = `V${vId++}`;
  const modelCode = m.model.replace(/[\s\+-]+/g, '');
  
  seedVehicles.push({
    vehicle_id: vehicleId,
    vehicle_name: m.model,
    variant: 'Standard',
    status: 'Active',
  });

  ['Front Wheel Assy', 'Rear Wheel Assy'].forEach((wheelLine, idx) => {
    const partId = `P${pId++}`;
    const suffix = idx === 0 ? '-F' : '-R';
    
    seedParts.push({
      part_id: partId,
      vehicle_id: vehicleId,
      part_name: wheelLine,
      part_number: `PN-${modelCode}${suffix}`,
      assembly_line: 'Wheel Assembly Line',
      plant: 'Hosur Plant',
      capacity: 20, // Trolley Capacity
      status: 'Active',
    });

    seedMhfParams.push({
      part_id: partId,
      daily_volume: m.volumePerDay,
      working_hours: 16,
      supplier_hours: 4,
      transit_hours: 1.5,
      opening_hours: 2,
      poc_hours: 0.5,
      plant_available: m.plantAvailablePerLine,
      remarks: '',
    });
  });
});

const STORAGE_KEY = 'tvs-production-parts-v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(state) {
  try {
    const { vehicles, parts, mhfParams } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles, parts, mhfParams }));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

const saved = loadFromStorage();

export const useProductionPartsStore = create((set, get) => ({
  vehicles: saved?.vehicles || seedVehicles,
  parts: saved?.parts || seedParts,
  mhfParams: saved?.mhfParams || seedMhfParams,
  hasUnsavedChanges: false,

  // --- Actions ---
  addVehicle: (vehicle) => set((state) => {
    const newState = { ...state, vehicles: [...state.vehicles, vehicle], hasUnsavedChanges: false };
    saveToStorage(newState);
    return newState;
  }),

  updateVehicle: (id, updates) => set((state) => {
    const newState = { 
      ...state, 
      vehicles: state.vehicles.map(v => v.vehicle_id === id ? { ...v, ...updates } : v),
      hasUnsavedChanges: false 
    };
    saveToStorage(newState);
    return newState;
  }),

  addPartWithParams: (part, params) => set((state) => {
    const newState = {
      ...state,
      parts: [...state.parts, part],
      mhfParams: [...state.mhfParams, params],
      hasUnsavedChanges: false
    };
    saveToStorage(newState);
    return newState;
  }),

  updatePart: (id, updates) => set((state) => {
    const newState = {
      ...state,
      parts: state.parts.map(p => p.part_id === id ? { ...p, ...updates } : p),
      hasUnsavedChanges: false
    };
    saveToStorage(newState);
    return newState;
  }),

  updateMhfParams: (partId, updates) => set((state) => {
    const newState = {
      ...state,
      mhfParams: state.mhfParams.map(mp => mp.part_id === partId ? { ...mp, ...updates } : mp),
      hasUnsavedChanges: false
    };
    saveToStorage(newState);
    return newState;
  }),

  deletePart: (partId) => set((state) => {
    const newState = {
      ...state,
      parts: state.parts.filter(p => p.part_id !== partId),
      mhfParams: state.mhfParams.filter(mp => mp.part_id !== partId),
      hasUnsavedChanges: false
    };
    saveToStorage(newState);
    return newState;
  }),

  save: () => {
    const state = get();
    saveToStorage(state);
    set({ hasUnsavedChanges: false });
  },

  discardChanges: () => {
    const s = loadFromStorage();
    if (s) {
      set({ vehicles: s.vehicles, parts: s.parts, mhfParams: s.mhfParams, hasUnsavedChanges: false });
    } else {
      set({ vehicles: seedVehicles, parts: seedParts, mhfParams: seedMhfParams, hasUnsavedChanges: false });
    }
  },
  
  resetToDefaults: () => {
    set({ vehicles: seedVehicles, parts: seedParts, mhfParams: seedMhfParams, hasUnsavedChanges: true });
  }
}));

// --- Selectors ---

import { calculateMhfRow, calculateTotals } from '../engine/calculator';

export function useCalculatedParts(statusFilter = 'all') {
  const { vehicles, parts, mhfParams } = useProductionPartsStore();
  
  const filteredParts = statusFilter === 'all' 
    ? parts 
    : parts.filter(p => p.status === statusFilter);

  return filteredParts.map(part => {
    const vehicle = vehicles.find(v => v.vehicle_id === part.vehicle_id);
    const params = mhfParams.find(mp => mp.part_id === part.part_id);
    return calculateMhfRow(part, params, vehicle);
  }).filter(Boolean);
}

export function usePartTotals(statusFilter = 'Active') {
  const calculatedRows = useCalculatedParts(statusFilter);
  return calculateTotals(calculatedRows);
}

export function useActivePartTotals() {
  return usePartTotals('Active');
}

export function useUniqueVehicles(statusFilter = 'Active') {
  const { vehicles, parts } = useProductionPartsStore();
  const activeParts = statusFilter === 'all' ? parts : parts.filter(p => p.status === statusFilter);
  const vehicleIds = [...new Set(activeParts.map(p => p.vehicle_id))];
  return vehicles.filter(v => vehicleIds.includes(v.vehicle_id));
}
