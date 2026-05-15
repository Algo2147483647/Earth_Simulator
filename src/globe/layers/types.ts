import * as Cesium from 'cesium';

export type GlobeLayer<TState> = {
  mount(viewer: Cesium.Viewer): void;
  update(state: TState): void;
  unmount(): void;
};
