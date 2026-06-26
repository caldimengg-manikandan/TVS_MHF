import { MHFRequest } from '../types/request';

export const INITIAL_REQUESTS: MHFRequest[] = [
  {
    id: 'REQ-2026-0001',
    date: new Date().toISOString().split('T')[0],
    assemblyLine: 'Main Line',
    model: 'Raider',
    quantity: 10,
    status: 'Store',
    requestedBy: 'Jane Assembly',
    remarks: 'Need more trolleys for next shift'
  }
];
