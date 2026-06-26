export interface AllocationLine {
  id: string;
  assemblyLine: string;
  required: number;
  allocated: number;
  balance: number; // required - allocated
  remarks?: string;
}

export interface PlanAllocation {
  id: string; // matches DailyPlan ID
  date: string;
  model: string;
  totalRequired: number;
  totalAllocated: number;
  lines: AllocationLine[];
}
