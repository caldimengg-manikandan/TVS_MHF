import { create } from 'zustand';
import { PlanAllocation } from '../types/allocation';
import api from '../services/api';
import toast from 'react-hot-toast';
interface AllocationState {
  allocations: PlanAllocation[];
  loading: boolean;
  fetchAllocations: () => Promise<void>;
  addAllocation: (allocation: PlanAllocation) => Promise<void>;
  updateAllocation: (id: string, updates: Partial<PlanAllocation>) => Promise<void>;
  deleteAllocation: (id: string) => Promise<void>;
}

export const useAllocationStore = create<AllocationState>((set, get) => ({
  allocations: [],
  loading: false,

  fetchAllocations: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/allocations');
      set({ allocations: res.data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  addAllocation: async (allocation) => {
    try {
      const res = await api.post('/allocations', allocation);
      set(state => ({ allocations: [res.data, ...state.allocations] }));
      toast.success('Allocation added');
    } catch (e) {
      console.error(e);
      toast.error('Failed to add allocation');
    }
  },

  updateAllocation: async (id, updates) => {
    try {
      const res = await api.put(`/allocations/${id}`, updates);
      set(state => ({
        allocations: state.allocations.map(a => a.id === id ? res.data : a)
      }));
      toast.success('Allocation updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update allocation');
    }
  },

  deleteAllocation: async (id) => {
    try {
      await api.delete(`/allocations/${id}`);
      set(state => ({
        allocations: state.allocations.filter(a => a.id !== id)
      }));
      toast.success('Allocation deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete allocation');
    }
  }
}));
