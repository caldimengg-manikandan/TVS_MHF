import { create } from 'zustand';
import { GapTicket } from '../types/gap';
import api from '../services/api';
import toast from 'react-hot-toast';

interface GapState {
  gaps: GapTicket[];
  loading: boolean;
  fetchGaps: () => Promise<void>;
  addGap: (gap: GapTicket) => Promise<void>;
  updateGap: (id: string, updates: Partial<GapTicket>) => Promise<void>;
  deleteGap: (id: string) => Promise<void>;
}

export const useGapStore = create<GapState>((set, get) => ({
  gaps: [],
  loading: false,

  fetchGaps: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/gaps');
      set({ gaps: res.data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  addGap: async (gap) => {
    try {
      const res = await api.post('/gaps', gap);
      set(state => ({ gaps: [res.data, ...state.gaps] }));
      toast.success('Gap ticket added');
    } catch (e) {
      console.error(e);
      toast.error('Failed to add gap ticket');
    }
  },

  updateGap: async (id, updates) => {
    try {
      const res = await api.put(`/gaps/${id}`, updates);
      set(state => ({
        gaps: state.gaps.map(g => g.id === id ? res.data : g)
      }));
      toast.success('Gap ticket updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update gap ticket');
    }
  },

  deleteGap: async (id) => {
    try {
      await api.delete(`/gaps/${id}`);
      set(state => ({
        gaps: state.gaps.filter(g => g.id !== id)
      }));
      toast.success('Gap ticket deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete gap ticket');
    }
  }
}));
