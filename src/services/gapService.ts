import { useGapStore } from '../stores/gapStore';
import { GapTicket } from '../types/gap';
import { PlanningService } from './planningService';

export class GapService {
  static async getAll(): Promise<GapTicket[]> {
    return useGapStore.getState().gaps;
  }

  static async getById(id: string): Promise<GapTicket | undefined> {
    return useGapStore.getState().gaps.find(g => g.id === id);
  }

  // Generates gap tickets from a given daily plan if they don't already exist
  static async generateFromPlan(planId: string): Promise<void> {
    const existing = useGapStore.getState().gaps.filter(g => g.planId === planId);
    if (existing.length > 0) return; // already generated

    const plan = await PlanningService.getPlanById(planId);
    if (!plan) throw new Error("Plan not found");

    const state = useGapStore.getState();

    plan.rows.forEach(row => {
      // Gap is positive if Required > Available
      const gapAmount = row.required - row.available;
      
      if (gapAmount > 0) {
        const newTicket: GapTicket = {
          id: `GAP-${new Date().getFullYear()}-${String(state.gaps.length + 1).padStart(4, '0')}`,
          planId,
          date: plan.date,
          model: row.model,
          required: row.required,
          available: row.available,
          gapAmount: gapAmount,
          priority: gapAmount > 10 ? 'High' : 'Medium',
          status: 'Open'
        };
        state.addGap(newTicket);
      }
    });
  }

  static async updateGap(id: string, updates: Partial<GapTicket>): Promise<void> {
    useGapStore.getState().updateGap(id, updates);
  }
}
