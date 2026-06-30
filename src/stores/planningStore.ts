import { create } from 'zustand';
import { DailyPlan } from '../types/planning';
import api from '../services/api';
import toast from 'react-hot-toast';

interface PlanningState {
  plans: DailyPlan[];
  loading: boolean;
  fetchPlans: () => Promise<void>;
  addPlan: (plan: DailyPlan) => Promise<void>;
  updatePlan: (id: string, updates: Partial<DailyPlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  plans: [],
  loading: false,

  fetchPlans: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/plans');
      set({ plans: res.data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  addPlan: async (plan) => {
    try {
      const res = await api.post('/plans', plan);
      set(state => ({ plans: [res.data, ...state.plans] }));
      toast.success('Daily plan added');
    } catch (e) {
      console.error(e);
      toast.error('Failed to add plan');
    }
  },

  updatePlan: async (id, updates) => {
    try {
      const res = await api.put(`/plans/${id}`, updates);
      set(state => ({
        plans: state.plans.map(p => p.id === id ? res.data : p)
      }));
      toast.success('Daily plan updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update plan');
    }
  },

  deletePlan: async (id) => {
    try {
      await api.delete(`/plans/${id}`);
      set(state => ({
        plans: state.plans.filter(p => p.id !== id)
      }));
      toast.success('Daily plan deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete plan');
    }
  }
}));
