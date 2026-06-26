import { PlanAllocation } from '../types/allocation';

export const INITIAL_ALLOCATIONS: PlanAllocation[] = [
  {
    id: 'PLAN-2026-0001',
    date: new Date().toISOString().split('T')[0],
    model: 'HLX 100',
    totalRequired: 15,
    totalAllocated: 15,
    lines: [
      { id: 'al-1', assemblyLine: 'Line 1', required: 10, allocated: 10, balance: 0, remarks: 'Standard' },
      { id: 'al-2', assemblyLine: 'Line 2', required: 5, allocated: 5, balance: 0, remarks: 'Overflow' }
    ]
  }
];
