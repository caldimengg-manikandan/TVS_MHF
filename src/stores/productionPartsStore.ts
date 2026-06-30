import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useProductionPartsStore = create((set, get) => ({
  vehicles: [],
  parts: [],
  mhfParams: [],
  hasUnsavedChanges: false,
  loading: false,

  fetchData: async () => {
    set({ loading: true });
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/parts')
      ]);
      const fetchedVehicles = vRes.data;
      const fetchedParts = pRes.data;
      const mhfParams = fetchedParts.map(p => ({
        part_id: p.part_id,
        ...p.mhf_params
      }));
      set({ vehicles: fetchedVehicles, parts: fetchedParts, mhfParams, loading: false });
    } catch (e) {
      console.error('Fetch error:', e);
      set({ loading: false });
    }
  },

  addVehicle: async (vehicle) => {
    try {
      const res = await api.post('/vehicles', vehicle);
      set(state => ({ vehicles: [...state.vehicles, res.data] }));
    } catch(e) { console.error(e); }
  },

  updateVehicle: async (id, updates) => {
    set(state => ({ vehicles: state.vehicles.map(v => v.vehicle_id === id ? { ...v, ...updates } : v) }));
  },

  addPartWithParams: async (part, params) => {
    try {
      const payload = { ...part, mhf_params: params };
      const res = await api.post('/parts', payload);
      set(state => ({
        parts: [res.data, ...state.parts],
        mhfParams: [{ part_id: part.part_id, ...params }, ...state.mhfParams]
      }));
      toast.success('Part added successfully');
    } catch(e) { 
      console.error(e); 
      toast.error('Failed to add part');
    }
  },

  updatePart: async (id, updates) => {
    try {
      const res = await api.put(`/parts/${id}`, updates);
      set(state => ({ parts: state.parts.map(p => p.part_id === id ? { ...p, ...res.data } : p) }));
      toast.success('Part updated');
    } catch (e) { 
      console.error(e); 
      toast.error('Failed to update part');
    }
  },

  updateMhfParams: async (partId, updates) => {
    try {
      const state = get();
      const existing = state.mhfParams.find(m => m.part_id === partId);
      const updatedMhf = { ...existing, ...updates };
      await api.put(`/parts/${partId}`, { mhf_params: updatedMhf });
      set(state => ({ mhfParams: state.mhfParams.map(mp => mp.part_id === partId ? updatedMhf : mp) }));
      toast.success('Params updated');
    } catch (e) { 
      console.error(e); 
      toast.error('Failed to update params');
    }
  },

  deletePart: async (partId) => {
    try {
      await api.delete(`/parts/${partId}`);
      set(state => ({
        parts: state.parts.filter(p => p.part_id !== partId),
        mhfParams: state.mhfParams.filter(mp => mp.part_id !== partId)
      }));
      toast.success('Part deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete part');
    }
  },

  save: () => {},
  discardChanges: () => { get().fetchData(); },
  resetToDefaults: () => {}
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
