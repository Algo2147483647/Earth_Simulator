import { create } from 'zustand';

type GlobeState = {
  showPoints: boolean;
  showRoutes: boolean;
  showGrid: boolean;
  showDayNight: boolean;
  measureMode: boolean;
  selectedPointId?: string;
  flyToPointRequest: number;
  flyToAllRequest: number;
  setShowPoints: (visible: boolean) => void;
  setShowRoutes: (visible: boolean) => void;
  setShowGrid: (visible: boolean) => void;
  setShowDayNight: (visible: boolean) => void;
  setMeasureMode: (active: boolean) => void;
  setSelectedPointId: (pointId?: string) => void;
  requestFlyToPoint: (pointId: string) => void;
  requestFlyToAll: () => void;
};

export const useGlobeStore = create<GlobeState>((set) => ({
  showPoints: true,
  showRoutes: true,
  showGrid: true,
  showDayNight: true,
  measureMode: false,
  selectedPointId: undefined,
  flyToPointRequest: 0,
  flyToAllRequest: 0,
  setShowPoints: (visible) => set({ showPoints: visible }),
  setShowRoutes: (visible) => set({ showRoutes: visible }),
  setShowGrid: (visible) => set({ showGrid: visible }),
  setShowDayNight: (visible) => set({ showDayNight: visible }),
  setMeasureMode: (active) => set({ measureMode: active }),
  setSelectedPointId: (pointId) => set({ selectedPointId: pointId }),
  requestFlyToPoint: (pointId) =>
    set((state) => ({
      selectedPointId: pointId,
      flyToPointRequest: state.flyToPointRequest + 1
    })),
  requestFlyToAll: () => set((state) => ({ flyToAllRequest: state.flyToAllRequest + 1 }))
}));
