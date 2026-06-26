import { useTransferStore } from '../stores/transferStore';
import { TransferRecord, TransferStatus } from '../types/transfer';

export class TransferService {
  static async getAll(): Promise<TransferRecord[]> {
    return useTransferStore.getState().transfers;
  }

  static async createTransfer(data: Omit<TransferRecord, 'id' | 'status'>): Promise<TransferRecord> {
    const state = useTransferStore.getState();
    const newTransfer: TransferRecord = {
      ...data,
      id: `TRN-${new Date().getFullYear()}-${String(state.transfers.length + 1).padStart(4, '0')}`,
      status: 'Draft'
    };
    
    state.addTransfer(newTransfer);
    return newTransfer;
  }

  static async updateStatus(id: string, status: TransferStatus, user?: string): Promise<void> {
    const updates: Partial<TransferRecord> = { status };
    if (status === 'Approved') {
      updates.approvedBy = user;
    } else if (status === 'Completed') {
      updates.completedOn = new Date().toISOString();
    }
    useTransferStore.getState().updateTransfer(id, updates);
  }
}
