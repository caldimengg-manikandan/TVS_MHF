export type RequestStatus = 'Assembly' | 'Store' | 'Issue' | 'Close';

export interface MHFRequest {
  id: string; // e.g. REQ-2026-0001
  date: string;
  assemblyLine: string;
  model: string;
  quantity: number;
  status: RequestStatus;
  requestedBy: string;
  issuedBy?: string;
  closedBy?: string;
  remarks?: string;
}
