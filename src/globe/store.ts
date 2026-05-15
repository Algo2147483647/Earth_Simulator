import { create } from 'zustand';

type GlobeState = {
  showVisitedPoints: boolean;
  showRoutes: boolean;
  showGrid: boolean;
  selectedCityId?: string;
  flyToCityRequest: number;
  flyToAllRequest: number;
  setShowVisitedPoints: (visible: boolean) => void;
  setShowRoutes: (visible: boolean) => void;
  setShowGrid: (visible: boolean) => void;
  setSelectedCityId: (cityId?: string) => void;
  requestFlyToCity: (cityId: string) => void;
  requestFlyToAll: () => void;
};

export const useGlobeStore = create<GlobeState>((set) => ({
  showVisitedPoints: true,
  showRoutes: true,
  showGrid: true,
  selectedCityId: undefined,
  flyToCityRequest: 0,
  flyToAllRequest: 0,
  setShowVisitedPoints: (visible) => set({ showVisitedPoints: visible }),
  setShowRoutes: (visible) => set({ showRoutes: visible }),
  setShowGrid: (visible) => set({ showGrid: visible }),
  setSelectedCityId: (cityId) => set({ selectedCityId: cityId }),
  requestFlyToCity: (cityId) =>
    set((state) => ({
      selectedCityId: cityId,
      flyToCityRequest: state.flyToCityRequest + 1
    })),
  requestFlyToAll: () => set((state) => ({ flyToAllRequest: state.flyToAllRequest + 1 }))
}));
