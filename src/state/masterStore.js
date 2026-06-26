import { create } from 'zustand';

/**
 * masterStore — Manages all Master Data modules (Sprint 1)
 * Simulates the backend tables for Plants, Suppliers, Models, etc.
 */

const INITIAL_PLANTS = [
  { id: 'p1', code: 'P01', name: 'Hosur Plant 1', location: 'Hosur', workingHours: 8, defaultCapacity: 1000, status: 'Active' },
  { id: 'p2', code: 'P02', name: 'Hosur Plant 2', location: 'Hosur', workingHours: 8, defaultCapacity: 800, status: 'Active' },
];

const INITIAL_SUPPLIERS = [
  { id: 's1', code: 'SUP001', name: 'Alpha Wheels Ltd', contact: 'John Doe', plant: 'Hosur Plant 1', transitTime: 1.5, defaultInventoryHours: 4, status: 'Active' },
  { id: 's2', code: 'SUP002', name: 'Beta Tyres Inc', contact: 'Jane Smith', plant: 'Hosur Plant 2', transitTime: 2.0, defaultInventoryHours: 4, status: 'Active' },
];

const INITIAL_MODELS = [
  { id: 'm1', code: 'HLX100', name: 'HLX 100', category: 'Motorcycle', volumePerDay: 500, partName: 'Front wheel Assy', status: 'Active' },
  { id: 'm2', code: 'HLX125', name: 'HLX 125 4-speed', category: 'Motorcycle', volumePerDay: 500, partName: 'Front wheel Assy', status: 'Active' },
  { id: 'm3', code: 'RAI800', name: 'Raider', category: 'Motorcycle', volumePerDay: 800, partName: 'Rear wheel Assy', status: 'Active' },
];

export const useMasterStore = create((set) => ({
  plants: INITIAL_PLANTS,
  suppliers: INITIAL_SUPPLIERS,
  vehicleModels: INITIAL_MODELS,

  // --- Plant Actions ---
  addPlant: (plant) => set((state) => ({ plants: [...state.plants, { ...plant, id: `p${Date.now()}` }] })),
  updatePlant: (id, updates) => set((state) => ({
    plants: state.plants.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deletePlant: (id) => set((state) => ({ plants: state.plants.filter(p => p.id !== id) })),

  // --- Supplier Actions ---
  addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, { ...supplier, id: `s${Date.now()}` }] })),
  updateSupplier: (id, updates) => set((state) => ({
    suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  deleteSupplier: (id) => set((state) => ({ suppliers: state.suppliers.filter(s => s.id !== id) })),

  // --- Vehicle Model Actions ---
  addModel: (model) => set((state) => ({ vehicleModels: [...state.vehicleModels, { ...model, id: `m${Date.now()}` }] })),
  updateModel: (id, updates) => set((state) => ({
    vehicleModels: state.vehicleModels.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  deleteModel: (id) => set((state) => ({ vehicleModels: state.vehicleModels.filter(m => m.id !== id) })),
}));
