import { GapTicket } from '../types/gap';

export const INITIAL_GAPS: GapTicket[] = [
  {
    id: 'GAP-2026-0001',
    planId: 'PLAN-2026-0001',
    date: new Date().toISOString().split('T')[0],
    model: 'Raider',
    required: 21,
    available: 15,
    gapAmount: 6,
    priority: 'High',
    reason: 'Maintenance of 6 trolleys',
    action: 'Expedite repair from maintenance yard',
    owner: 'John Planner',
    status: 'In Progress'
  }
];
