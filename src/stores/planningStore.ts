import { create } from 'zustand';
import { DailyPlan } from '../types/planning';
import { INITIAL_DAILY_PLANS } from '../database/planningDatabase';

interface PlanningState {
  plans: DailyPlan[];
  setPlans: (plans: DailyPlan[]) => void;
  addPlan: (plan: DailyPlan) => void;
  updatePlan: (id: string, updates: Partial<DailyPlan>) => void;
  deletePlan: (id: string) => void;
}

export const usePlanningStore = create<PlanningState>((set) => ({
  plans: INITIAL_DAILY_PLANS,
  setPlans: (plans) => set({ plans }),
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
  updatePlan: (id, updates) => set((state) => ({
    plans: state.plans.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deletePlan: (id) => set((state) => ({
    plans: state.plans.filter(p => p.id !== id)
  }))
}));
