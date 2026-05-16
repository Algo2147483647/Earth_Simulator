import { create } from 'zustand';

type GlobeState = {
  showPoints: boolean;
  showRoutes: boolean;
  showGrid: boolean;
  showDayNight: boolean;
  measureMode: boolean;
  selectedCityId?: string;
  flyToCityRequest: number;
  flyToAllRequest: number;
  setShowPoints: (visible: boolean) => void;
  setShowRoutes: (visible: boolean) => void;
  setShowGrid: (visible: boolean) => void;
  setShowDayNight: (visible: boolean) => void;
  setMeasureMode: (active: boolean) => void;
  setSelectedCityId: (cityId?: string) => void;
  requestFlyToCity: (cityId: string) => void;
  requestFlyToAll: () => void;
};

export const useGlobeStore = create<GlobeState>((set) => ({
  showPoints: true,
  showRoutes: true,
  showGrid: true,
  showDayNight: true,
  measureMode: false,
  selectedCityId: undefined,
  flyToCityRequest: 0,
  flyToAllRequest: 0,
  setShowPoints: (visible) => set({ showPoints: visible }),
  setShowRoutes: (visible) => set({ showRoutes: visible }),
  setShowGrid: (visible) => set({ showGrid: visible }),
  setShowDayNight: (visible) => set({ showDayNight: visible }),
  setMeasureMode: (active) => set({ measureMode: active }),
  setSelectedCityId: (cityId) => set({ selectedCityId: cityId }),
  requestFlyToCity: (cityId) =>
    set((state) => ({
      selectedCityId: cityId,
      flyToCityRequest: state.flyToCityRequest + 1
    })),
  requestFlyToAll: () => set((state) => ({ flyToAllRequest: state.flyToAllRequest + 1 }))
}));
