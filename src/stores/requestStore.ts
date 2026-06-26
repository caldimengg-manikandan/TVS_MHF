import { create } from 'zustand';
import { MHFRequest } from '../types/request';
import { INITIAL_REQUESTS } from '../database/requestDatabase';

interface RequestState {
  requests: MHFRequest[];
  setRequests: (requests: MHFRequest[]) => void;
  addRequest: (req: MHFRequest) => void;
  updateRequest: (id: string, updates: Partial<MHFRequest>) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  requests: INITIAL_REQUESTS,
  setRequests: (requests) => set({ requests }),
  addRequest: (req) => set((state) => ({ requests: [...state.requests, req] })),
  updateRequest: (id, updates) => set((state) => ({
    requests: state.requests.map(r => r.id === id ? { ...r, ...updates } : r)
  }))
}));
