export type TransferStatus = 'Draft' | 'Approved' | 'Completed';

export interface TransferRecord {
  id: string; // e.g. TRN-2026-0001
  date: string;
  model: string;
  quantity: number;
  source: string;
  destination: string;
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string;
  completedOn?: string;
  remarks?: string;
}
