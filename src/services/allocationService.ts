import { useAllocationStore } from '../stores/allocationStore';
import { PlanAllocation, AllocationLine } from '../types/allocation';
import { PlanningService } from './planningService';

export class AllocationService {
  static async getAll(): Promise<PlanAllocation[]> {
    return useAllocationStore.getState().allocations;
  }

  static async getById(planId: string): Promise<PlanAllocation | undefined> {
    return useAllocationStore.getState().allocations.find(a => a.id === planId);
  }

  // Generates a default allocation for a daily plan if it doesn't exist
  static async getOrCreateForPlan(planId: string): Promise<PlanAllocation[]> {
    const existing = useAllocationStore.getState().allocations.filter(a => a.id === planId);
    if (existing.length > 0) return existing;

    const plan = await PlanningService.getPlanById(planId);
    if (!plan) throw new Error("Plan not found");

    const newAllocations: PlanAllocation[] = plan.rows.map(row => {
      // Default: 1 line taking everything
      const defaultLine: AllocationLine = {
        id: `al-${Date.now()}-${row.model.replace(/\s+/g, '')}`,
        assemblyLine: 'Main Line',
        required: row.required,
        allocated: 0,
        balance: row.required
      };

      const allocation: PlanAllocation = {
        id: planId,
        date: plan.date,
        model: row.model,
        totalRequired: row.required,
        totalAllocated: 0,
        lines: [defaultLine]
      };

      useAllocationStore.getState().addAllocation(allocation);
      return allocation;
    });

    return newAllocations;
  }

  static async updateLineAllocation(planId: string, model: string, lineId: string, allocatedQty: number): Promise<void> {
    const state = useAllocationStore.getState();
    const target = state.allocations.find(a => a.id === planId && a.model === model);
    if (!target) return;

    const updatedLines = target.lines.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          allocated: allocatedQty,
          balance: line.required - allocatedQty
        };
      }
      return line;
    });

    const newTotalAllocated = updatedLines.reduce((sum, line) => sum + line.allocated, 0);

    state.updateAllocation(planId, {
      totalAllocated: newTotalAllocated,
      lines: updatedLines
    });
  }

  static async updateLineField(planId: string, model: string, lineId: string, field: keyof AllocationLine, value: any): Promise<void> {
    const state = useAllocationStore.getState();
    const target = state.allocations.find(a => a.id === planId && a.model === model);
    if (!target) return;

    const updatedLines = target.lines.map(line => {
      if (line.id === lineId) {
        const updated = { ...line, [field]: value };
        // Recalculate balance if required or allocated changed
        if (field === 'required' || field === 'allocated') {
            updated.balance = updated.required - updated.allocated;
        }
        return updated;
      }
      return line;
    });

    state.updateAllocation(planId, {
      lines: updatedLines
    });
  }

  static async addLine(planId: string, model: string, assemblyLine: string): Promise<void> {
    const state = useAllocationStore.getState();
    const target = state.allocations.find(a => a.id === planId && a.model === model);
    if (!target) return;

    const newLine: AllocationLine = {
      id: `al-${Date.now()}`,
      assemblyLine,
      required: 0,
      allocated: 0,
      balance: 0
    };

    state.updateAllocation(planId, {
      lines: [...target.lines, newLine]
    });
  }
}
