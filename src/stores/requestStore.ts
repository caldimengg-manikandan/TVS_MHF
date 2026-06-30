import { create } from 'zustand';
import { MHFRequest } from '../types/request';
import api from '../services/api';
import toast from 'react-hot-toast';

interface RequestState {
  requests: MHFRequest[];
  loading: boolean;
  fetchRequests: () => Promise<void>;
  addRequest: (req: MHFRequest) => Promise<void>;
  updateRequest: (id: string, updates: Partial<MHFRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  loading: false,

  fetchRequests: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/requests');
      set({ requests: res.data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  addRequest: async (req) => {
    try {
      const res = await api.post('/requests', req);
      set(state => ({ requests: [res.data, ...state.requests] }));
      toast.success('Request added');
    } catch (e) {
      console.error(e);
      toast.error('Failed to add request');
    }
  },

  updateRequest: async (id, updates) => {
    try {
      const res = await api.put(`/requests/${id}`, updates);
      set(state => ({
        requests: state.requests.map(r => r.id === id ? res.data : r)
      }));
      toast.success('Request updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update request');
    }
  },

  deleteRequest: async (id) => {
    try {
      await api.delete(`/requests/${id}`);
      set(state => ({
        requests: state.requests.filter(r => r.id !== id)
      }));
      toast.success('Request deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete request');
    }
  }
}));
