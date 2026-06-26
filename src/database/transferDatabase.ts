import { TransferRecord } from '../types/transfer';

export const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'TRN-2026-0001',
    date: new Date().toISOString().split('T')[0],
    model: 'HLX 100',
    quantity: 5,
    source: 'Hosur Plant 2',
    destination: 'Hosur Plant 1',
    status: 'Approved',
    requestedBy: 'John Planner',
    approvedBy: 'Mike Boss',
    remarks: 'Emergency transfer for shortfall'
  }
];
