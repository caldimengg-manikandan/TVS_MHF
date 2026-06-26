export type PlanStatus = 'Draft' | 'Submitted' | 'Approved' | 'Locked';

export interface PlanRow {
  id: string;
  model: string;
  volume: number;
  hours: number;
  required: number;
  available: number;
  gap: number;
  remarks: string;
}

export interface DailyPlan {
  id: string;              // Plan Number (e.g. PLAN-2026-0001)
  date: string;            // YYYY-MM-DD
  status: PlanStatus;
  version: number;
  createdBy: string;
  createdOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rows: PlanRow[];
}
