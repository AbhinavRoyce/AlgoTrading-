import { create } from 'zustand';

export const useStrategyStore = create((set) => ({
  strategies: [], selectedStrategy: null, backtestResult: null, isBacktesting: false,
  setStrategies: (strategies) => set({ strategies }),
  selectStrategy: (selectedStrategy) => set({ selectedStrategy }),
  setBacktestResult: (backtestResult) => set({ backtestResult }),
  setIsBacktesting: (isBacktesting) => set({ isBacktesting }),
  addStrategy: (strategy) => set((state) => ({ strategies: [...state.strategies, strategy] })),
  updateStrategy: (id, updates) => set((state) => ({ strategies: state.strategies.map((s) => s.id === id ? { ...s, ...updates } : s) })),
}));
