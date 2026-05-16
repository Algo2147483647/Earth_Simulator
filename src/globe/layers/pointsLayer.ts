import * as Cesium from 'cesium';
import type { Point } from '../../features/visited/types';
import type { GlobeLayer } from './types';

type PointsState = {
  points: Point[];
  visible: boolean;
  selectedPointId?: string;
};

export function createPointsLayer(onSelectPoint: (pointId?: string) => void): GlobeLayer<PointsState> {
  let viewer: Cesium.Viewer | undefined;
  let dataSource: Cesium.CustomDataSource | undefined;
  let handler: Cesium.ScreenSpaceEventHandler | undefined;

  return {
    mount(nextViewer) {
      viewer = nextViewer;
      dataSource = new Cesium.CustomDataSource('points');
      viewer.dataSources.add(dataSource);

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer?.scene.pick(movement.position);
        const pointId = picked?.id?.properties?.pointId?.getValue();
        if (typeof pointId === 'string') {
          onSelectPoint(pointId);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    update({ points, visible, selectedPointId }) {
      if (!dataSource) {
        return;
      }

      dataSource.show = visible;
      dataSource.entities.removeAll();

      for (const point of points) {
        const selected = point.id === selectedPointId;
        dataSource.entities.add({
          id: `point-${point.id}`,
          name: point.name,
          position: Cesium.Cartesian3.fromDegrees(point.location.lon, point.location.lat, point.location.height ?? 0),
          properties: {
            pointId: point.id
          },
          point: {
            pixelSize: selected ? 14 : 9,
            color: selected ? Cesium.Color.fromCssColorString('#ffcf5a') : Cesium.Color.fromCssColorString('#ff5a5f'),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.88),
            outlineWidth: selected ? 3 : 1,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: {
            text: point.name,
            font: selected ? '600 15px sans-serif' : '13px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -22),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, selected ? 6_000_000 : 2_500_000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
      }

      viewer?.scene.requestRender();
    },

    unmount() {
      handler?.destroy();
      if (viewer && dataSource) {
        viewer.dataSources.remove(dataSource, true);
      }
      handler = undefined;
      dataSource = undefined;
      viewer = undefined;
    }
  };
}
