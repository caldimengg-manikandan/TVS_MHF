import { create } from 'zustand';
import { DEFAULT_PARAMS, calculateRow, calculateTotals } from '../engine/calculator';
import { SEED_ROWS, getNextId } from '../data/seedData';
import { useAuthStore } from './authStore';

/**
 * Main app store — Zustand.
 * Single shared store across all pages.
 * Explicit save (not auto-persist).
 */

const STORAGE_KEY = 'mhf-trolley-state';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.rows) && data.params) {
      const validStatuses = ['Draft', 'Approved', 'Active', 'Paused', 'Discontinued'];
      data.rows = data.rows.map((row) => {
        let status = row.status || 'Active';
        if (!validStatuses.includes(status)) {
          status = 'Active';
        }
        return {
          ...row,
          source: row.source || 'default',
          status,
          notes: row.notes || '',
          category: row.category || '',
          addedAt: row.addedAt || null,
          addedBy: row.addedBy || null,
        };
      });
      return data;
    }
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(rows, params) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows, params, savedAt: new Date().toISOString() }));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

const saved = loadFromStorage();
const initialRows = saved ? saved.rows : [...SEED_ROWS];
const initialParams = saved ? { ...DEFAULT_PARAMS, ...saved.params } : { ...DEFAULT_PARAMS };

export const useStore = create((set, get) => ({
  // ── Data ──
  rows: initialRows,
  params: initialParams,
  hasUnsavedChanges: false,

  // ── Derived (recomputed on access via selectors below) ──

  // ── Actions ──
  setParam: (key, value) =>
    set((s) => ({
      params: { ...s.params, [key]: value },
      hasUnsavedChanges: true,
    })),

  setRowField: (rowId, field, value) =>
    set((s) => {
      const targetRow = s.rows.find((r) => r.id === rowId);
      if (!targetRow) return {};
      
      const modelFields = ['model', 'volumePerDay', 'status', 'notes', 'category', 'inManufacturingLine'];
      if (modelFields.includes(field)) {
        const oldModelName = targetRow.model;
        return {
          rows: s.rows.map((r) =>
            r.model === oldModelName ? { ...r, [field]: value } : r
          ),
          hasUnsavedChanges: true,
        };
      }
      
      return {
        rows: s.rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
        hasUnsavedChanges: true,
      };
    }),

  addModel: (
    modelName,
    volumePerDay,
    partNumberFront,
    partNumberRear,
    qtyPerVehicle = 1,
    trolleyType = 'Standard Wheel Trolley',
    trolleyCapacity = 20,
    plantAvailableTrolleys = null,
    status = 'Active',
    notes = '',
    category = ''
  ) => {
    const addedAt = new Date().toISOString();
    const addedBy = useAuthStore.getState().user?.name || 'Unknown';
    set((s) => ({
      rows: [
        ...s.rows,
        {
          id: getNextId(),
          model: modelName,
          wheelLine: 'Front wheel Assy',
          volumePerDay,
          partNumber: partNumberFront || `PN-${modelName.replace(/[\s\+-]+/g, '')}-F`,
          qtyPerVehicle,
          trolleyType,
          trolleyCapacity,
          plantAvailableTrolleys,
          remarks: '',
          source: 'custom',
          status,
          notes,
          category,
          addedAt,
          addedBy,
          inManufacturingLine: true,
        },
        {
          id: getNextId(),
          model: modelName,
          wheelLine: 'Rear wheel Assy',
          volumePerDay,
          partNumber: partNumberRear || `PN-${modelName.replace(/[\s\+-]+/g, '')}-R`,
          qtyPerVehicle,
          trolleyType,
          trolleyCapacity,
          plantAvailableTrolleys,
          remarks: '',
          source: 'custom',
          status,
          notes,
          category,
          addedAt,
          addedBy,
          inManufacturingLine: true,
        },
      ],
      hasUnsavedChanges: true,
    }));
  },

  duplicateModel: (modelName) => {
    const state = get();
    const sourceRows = state.rows.filter((r) => r.model === modelName);
    if (!sourceRows.length) return;
    const newName = `${modelName} (Copy)`;
    const addedAt = new Date().toISOString();
    const addedBy = useAuthStore.getState().user?.name || 'Unknown';
    const newRows = sourceRows.map((r) => {
      const isFront = r.wheelLine.toLowerCase().includes('front');
      const suffix = isFront ? '-F' : '-R';
      const cleanName = newName.replace(/[\s\+-]+/g, '').replace('Copy', '');
      return {
        ...r,
        id: getNextId(),
        model: newName,
        partNumber: r.partNumber ? `${r.partNumber}-COPY` : `PN-${cleanName}${suffix}`,
        source: 'custom',
        addedAt,
        addedBy,
      };
    });
    set({ rows: [...state.rows, ...newRows], hasUnsavedChanges: true });
  },

  editModel: (oldName, newName, volumePerDay) =>
    set((s) => ({
      rows: s.rows.map((r) =>
        r.model === oldName ? { ...r, model: newName, volumePerDay } : r
      ),
      hasUnsavedChanges: true,
    })),

  removeModel: (modelName) =>
    set((s) => ({
      rows: s.rows.filter((r) => r.model !== modelName),
      hasUnsavedChanges: true,
    })),

  deleteRow: (rowId) =>
    set((s) => ({
      rows: s.rows.filter((r) => r.id !== rowId),
      hasUnsavedChanges: true,
    })),

  resetToDefaults: () => {
    set({ params: { ...DEFAULT_PARAMS }, rows: [...SEED_ROWS], hasUnsavedChanges: true });
  },

  // ── Explicit save ──
  save: () => {
    const { rows, params } = get();
    saveToStorage(rows, params);
    set({ hasUnsavedChanges: false });
  },

  // ── Discard unsaved changes ──
  discardChanges: () => {
    const saved = loadFromStorage();
    if (saved) {
      set({ rows: saved.rows, params: { ...DEFAULT_PARAMS, ...saved.params }, hasUnsavedChanges: false });
    } else {
      set({ rows: [...SEED_ROWS], params: { ...DEFAULT_PARAMS }, hasUnsavedChanges: false });
    }
  },

  addModelToLine: (modelName, initialPlantAvail) =>
    set((s) => {
      const activatedAt = new Date().toISOString();
      const activatedBy = useAuthStore.getState().user?.name || 'Unknown';
      return {
        rows: s.rows.map((r) =>
          r.model === modelName
            ? {
                ...r,
                status: 'Active',
                plantAvailableTrolleys: initialPlantAvail,
                activatedAt,
                activatedBy,
              }
            : r
        ),
        hasUnsavedChanges: true,
      };
    }),

  removeModelFromLine: (modelName, newStatus = 'Discontinued') =>
    set((s) => ({
      rows: s.rows.map((r) =>
        r.model === modelName ? { ...r, status: newStatus } : r
      ),
      hasUnsavedChanges: true,
    })),
}));

// ── Selectors (derived data) ──
export function useCalculatedRows() {
  const rows = useStore((s) => s.rows);
  const params = useStore((s) => s.params);
  return rows.map((row) => calculateRow(row, params));
}

export function useTotals(statusFilter = 'Active') {
  const rows = useStore((s) => s.rows);
  const params = useStore((s) => s.params);
  const filteredRows = statusFilter === 'all'
    ? rows
    : rows.filter((row) => row.status === statusFilter);
  const calculated = filteredRows.map((row) => calculateRow(row, params));
  return calculateTotals(calculated);
}

export function useActiveTotals() {
  return useTotals('Active');
}

export function useUniqueModels(statusFilter = 'Active') {
  const rows = useStore((s) => s.rows);
  const filteredRows = statusFilter === 'all'
    ? rows
    : rows.filter((row) => row.status === statusFilter);
  const map = new Map();
  filteredRows.forEach((r) => {
    if (!map.has(r.model)) map.set(r.model, r.volumePerDay);
  });
  return Array.from(map, ([name, volume]) => ({ name, volume }));
}
