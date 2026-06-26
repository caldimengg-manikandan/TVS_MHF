import { create } from 'zustand';
import { GapTicket } from '../types/gap';
import { INITIAL_GAPS } from '../database/gapDatabase';

interface GapState {
  gaps: GapTicket[];
  setGaps: (gaps: GapTicket[]) => void;
  addGap: (gap: GapTicket) => void;
  updateGap: (id: string, updates: Partial<GapTicket>) => void;
}

export const useGapStore = create<GapState>((set) => ({
  gaps: INITIAL_GAPS,
  setGaps: (gaps) => set({ gaps }),
  addGap: (gap) => set((state) => ({ gaps: [...state.gaps, gap] })),
  updateGap: (id, updates) => set((state) => ({
    gaps: state.gaps.map(g => g.id === id ? { ...g, ...updates } : g)
  }))
}));
