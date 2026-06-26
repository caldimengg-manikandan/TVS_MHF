import { usePlanningStore } from '../stores/planningStore';
import { DailyPlan, PlanRow } from '../types/planning';
import { useStore } from '../state/useStore';

/**
 * Service Layer:
 * Components MUST use this service to interact with planning data.
 * They should not import usePlanningStore directly.
 */

export class PlanningService {
  static async getAllPlans(): Promise<DailyPlan[]> {
    return usePlanningStore.getState().plans;
  }

  static async getPlanById(id: string): Promise<DailyPlan | undefined> {
    return usePlanningStore.getState().plans.find(p => p.id === id);
  }

  static async getPlansByDate(date: string): Promise<DailyPlan[]> {
    return usePlanningStore.getState().plans.filter(p => p.date === date);
  }

  static async createPlan(date: string, createdBy: string): Promise<DailyPlan> {
    const state = usePlanningStore.getState();
    const newId = `PLAN-${new Date().getFullYear()}-${String(state.plans.length + 1).padStart(4, '0')}`;
    
    // Auto-generate from calculation engine (useStore.rows)
    const currentCalculationRows = useStore.getState().rows.filter(r => r.status === 'Active');
    
    const newRows: PlanRow[] = currentCalculationRows.map(r => ({
      id: r.id,
      model: r.model,
      volume: r.volumePerDay,
      hours: 8, // default 8
      required: Math.ceil(r.volumePerDay / r.trolleyCapacity), // basic requirement logic
      available: r.plantAvailableTrolleys,
      gap: r.plantAvailableTrolleys - Math.ceil(r.volumePerDay / r.trolleyCapacity),
      remarks: ''
    }));

    const newPlan: DailyPlan = {
      id: newId,
      date,
      status: 'Draft',
      version: 1,
      createdBy,
      createdOn: new Date().toISOString(),
      rows: newRows
    };

    state.addPlan(newPlan);
    return newPlan;
  }

  static async duplicatePlan(id: string, createdBy: string): Promise<DailyPlan> {
    const existing = await this.getPlanById(id);
    if (!existing) throw new Error("Plan not found");
    
    const state = usePlanningStore.getState();
    const newId = `PLAN-${new Date().getFullYear()}-${String(state.plans.length + 1).padStart(4, '0')}`;
    
    const newPlan: DailyPlan = {
      ...existing,
      id: newId,
      status: 'Draft',
      version: 1,
      createdBy,
      createdOn: new Date().toISOString(),
      approvedBy: undefined,
      approvedOn: undefined,
    };
    
    state.addPlan(newPlan);
    return newPlan;
  }

  static async updatePlanStatus(id: string, status: DailyPlan['status'], approvedBy?: string): Promise<void> {
    const updates: Partial<DailyPlan> = { status };
    if (status === 'Approved' || status === 'Locked') {
      updates.approvedBy = approvedBy;
      updates.approvedOn = new Date().toISOString();
    }
    usePlanningStore.getState().updatePlan(id, updates);
  }

  static async deletePlan(id: string): Promise<void> {
    usePlanningStore.getState().deletePlan(id);
  }
}
