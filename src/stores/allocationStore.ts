import { create } from 'zustand';
import { PlanAllocation } from '../types/allocation';
import { INITIAL_ALLOCATIONS } from '../database/allocationsDatabase';

interface AllocationState {
  allocations: PlanAllocation[];
  setAllocations: (allocations: PlanAllocation[]) => void;
  addAllocation: (allocation: PlanAllocation) => void;
  updateAllocation: (id: string, updates: Partial<PlanAllocation>) => void;
}

export const useAllocationStore = create<AllocationState>((set) => ({
  allocations: INITIAL_ALLOCATIONS,
  setAllocations: (allocations) => set({ allocations }),
  addAllocation: (allocation) => set((state) => ({ 
    allocations: [...state.allocations, allocation] 
  })),
  updateAllocation: (id, updates) => set((state) => ({
    allocations: state.allocations.map(a => a.id === id ? { ...a, ...updates } : a)
  }))
}));
