import { PlanningService } from './planningService';
import { AllocationService } from './allocationService';
import { GapService } from './gapService';
import { TransferService } from './transferService';
import { RequestService } from './requestService';

export class ReportService {
  
  // Aggregates a single Daily Plan with its Allocations and Gaps into a flattened row format
  static async getDailyPlanExecutionReport(planId: string): Promise<any[]> {
    const plan = await PlanningService.getPlanById(planId);
    if (!plan) return [];

    const allocations = await AllocationService.getOrCreateForPlan(planId);
    const gaps = await GapService.getAll();
    const planGaps = gaps.filter(g => g.planId === planId);

    const reportData = plan.rows.map(row => {
      const modelAlloc = allocations.find(a => a.model === row.model);
      const totalAllocated = modelAlloc ? modelAlloc.totalAllocated : 0;
      
      const modelGap = planGaps.find(g => g.model === row.model);
      const gapStatus = modelGap ? modelGap.status : 'No Gap';
      const gapPriority = modelGap ? modelGap.priority : '-';

      return {
        'Plan ID': plan.id,
        'Date': plan.date,
        'Model': row.model,
        'Required Qty': row.required,
        'Available Qty': row.available,
        'Shortfall': row.required - row.available > 0 ? row.required - row.available : 0,
        'Allocated to Lines': totalAllocated,
        'Unallocated Balance': row.required - totalAllocated,
        'Gap Ticket Status': gapStatus,
        'Gap Priority': gapPriority
      };
    });

    return reportData;
  }

  // Returns all transfers
  static async getTransferHistoryReport(): Promise<any[]> {
    const transfers = await TransferService.getAll();
    return transfers.map(t => ({
      'Transfer ID': t.id,
      'Date': t.date,
      'Model': t.model,
      'Quantity': t.quantity,
      'Source': t.source,
      'Destination': t.destination,
      'Status': t.status,
      'Requested By': t.requestedBy,
      'Approved By': t.approvedBy || '-',
      'Remarks': t.remarks || '-'
    }));
  }

  // Returns all requests
  static async getRequestHistoryReport(): Promise<any[]> {
    const requests = await RequestService.getAll();
    return requests.map(r => ({
      'Request ID': r.id,
      'Date': r.date,
      'Assembly Line': r.assemblyLine,
      'Model': r.model,
      'Quantity': r.quantity,
      'Status': r.status,
      'Requested By': r.requestedBy,
      'Issued By': r.issuedBy || '-',
      'Closed By': r.closedBy || '-',
      'Remarks': r.remarks || '-'
    }));
  }
}
