import { create } from 'zustand';
import { TransferRecord } from '../types/transfer';
import { INITIAL_TRANSFERS } from '../database/transferDatabase';

interface TransferState {
  transfers: TransferRecord[];
  setTransfers: (transfers: TransferRecord[]) => void;
  addTransfer: (transfer: TransferRecord) => void;
  updateTransfer: (id: string, updates: Partial<TransferRecord>) => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  transfers: INITIAL_TRANSFERS,
  setTransfers: (transfers) => set({ transfers }),
  addTransfer: (transfer) => set((state) => ({ transfers: [...state.transfers, transfer] })),
  updateTransfer: (id, updates) => set((state) => ({
    transfers: state.transfers.map(t => t.id === id ? { ...t, ...updates } : t)
  }))
}));
