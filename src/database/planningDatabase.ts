import { DailyPlan } from '../types/planning';

// Mock database table for Daily Plans
export const INITIAL_DAILY_PLANS: DailyPlan[] = [
  {
    id: 'PLAN-2026-0001',
    date: new Date().toISOString().split('T')[0],
    status: 'Approved',
    version: 1,
    createdBy: 'Planner 1',
    createdOn: new Date().toISOString(),
    approvedBy: 'Production Engineer',
    approvedOn: new Date().toISOString(),
    rows: [
      { id: 'r1', model: 'HLX 100', volume: 500, hours: 8, required: 15, available: 15, gap: 0, remarks: 'OK' },
      { id: 'r2', model: 'Raider', volume: 800, hours: 8, required: 21, available: 21, gap: 0, remarks: 'OK' }
    ]
  }
];
