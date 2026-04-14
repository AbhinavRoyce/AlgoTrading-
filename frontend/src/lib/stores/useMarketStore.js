import { create } from 'zustand';

export const useMarketStore = create((set) => ({
  tickers: [], selectedTicker: 'AAPL', assetClass: 'stocks', priceUpdates: {},
  setTickers: (tickers) => set({ tickers }),
  setSelectedTicker: (selectedTicker) => set({ selectedTicker }),
  setAssetClass: (assetClass) => set({ assetClass }),
  updatePrice: (update) => set((state) => ({
    priceUpdates: { ...state.priceUpdates, [update.symbol]: update },
    tickers: state.tickers.map((t) => t.symbol === update.symbol ? { ...t, price: update.price, change: update.change, changePercent: update.changePercent } : t),
  })),
}));
