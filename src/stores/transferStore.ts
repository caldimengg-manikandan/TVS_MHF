import { create } from 'zustand';
import { TransferRecord } from '../types/transfer';
import api from '../services/api';
import toast from 'react-hot-toast';

interface TransferState {
  transfers: TransferRecord[];
  loading: boolean;
  fetchTransfers: () => Promise<void>;
  addTransfer: (transfer: TransferRecord) => Promise<void>;
  updateTransfer: (id: string, updates: Partial<TransferRecord>) => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: [],
  loading: false,

  fetchTransfers: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/transfers');
      set({ transfers: res.data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  addTransfer: async (transfer) => {
    try {
      const res = await api.post('/transfers', transfer);
      set(state => ({ transfers: [res.data, ...state.transfers] }));
      toast.success('Transfer recorded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to record transfer');
    }
  },

  updateTransfer: async (id, updates) => {
    try {
      const res = await api.put(`/transfers/${id}`, updates);
      set(state => ({
        transfers: state.transfers.map(t => t.id === id ? res.data : t)
      }));
      toast.success('Transfer updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update transfer');
    }
  },

  deleteTransfer: async (id) => {
    try {
      await api.delete(`/transfers/${id}`);
      set(state => ({
        transfers: state.transfers.filter(t => t.id !== id)
      }));
      toast.success('Transfer deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete transfer');
    }
  }
}));
