export type GapPriority = 'High' | 'Medium' | 'Low';
export type GapStatus = 'Open' | 'In Progress' | 'Resolved';

export interface GapTicket {
  id: string; // e.g. GAP-2026-001
  planId: string;
  date: string;
  model: string;
  required: number;
  available: number;
  gapAmount: number;
  priority: GapPriority;
  reason?: string;
  action?: string;
  owner?: string;
  status: GapStatus;
}
