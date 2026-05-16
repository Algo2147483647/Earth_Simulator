import * as Cesium from 'cesium';
import type { GlobeLayer } from './types';

export type Measurement = {
  points: number;
  distanceKm: number;
};

type MeasureLayerState = {
  active: boolean;
  clearRequest: number;
};

export function createMeasureLayer(onChange: (measurement: Measurement) => void): GlobeLayer<MeasureLayerState> {
  let viewer: Cesium.Viewer | undefined;
  let dataSource: Cesium.CustomDataSource | undefined;
  let handler: Cesium.ScreenSpaceEventHandler | undefined;
  let active = false;
  let lastClearRequest = 0;
  let positions: Cesium.Cartesian3[] = [];
  let pointerDownPosition: Cesium.Cartesian2 | undefined;
  let pointerMoved = false;

  function reset() {
    positions = [];
    dataSource?.entities.removeAll();
    onChange({ points: 0, distanceKm: 0 });
    viewer?.scene.requestRender();
  }

  function addPoint(position: Cesium.Cartesian3) {
    positions = [...positions, position];
    redraw();
  }

  function redraw() {
    if (!dataSource) {
      return;
    }

    dataSource.entities.removeAll();

    positions.forEach((position, index) => {
      dataSource?.entities.add({
        id: `measure-point-${index}`,
        position,
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString('#f9f871'),
          outlineColor: Cesium.Color.BLACK.withAlpha(0.75),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: `${index + 1}`,
          font: '600 13px sans-serif',
          fillColor: Cesium.Color.BLACK,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.85),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -22),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
    });

    if (positions.length >= 2) {
      dataSource.entities.add({
        id: 'measure-line',
        polyline: {
          positions,
          width: 3,
          arcType: Cesium.ArcType.GEODESIC,
          material: Cesium.Color.fromCssColorString('#f9f871').withAlpha(0.9),
          clampToGround: false
        }
      });

      dataSource.entities.add({
        id: 'measure-label',
        position: positions[positions.length - 1],
        label: {
          text: formatDistance(totalDistanceKm(positions)),
          font: '600 14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.72),
          backgroundPadding: new Cesium.Cartesian2(8, 5),
          pixelOffset: new Cesium.Cartesian2(0, -42),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
    }

    onChange({ points: positions.length, distanceKm: totalDistanceKm(positions) });
    viewer?.scene.requestRender();
  }

  return {
    mount(nextViewer) {
      viewer = nextViewer;
      dataSource = new Cesium.CustomDataSource('measurements');
      viewer.dataSources.add(dataSource);

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        if (!active || !viewer) {
          return;
        }

        pointerDownPosition = Cesium.Cartesian2.clone(movement.position);
        pointerMoved = false;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        if (!active || !pointerDownPosition) {
          return;
        }

        if (Cesium.Cartesian2.distance(pointerDownPosition, movement.endPosition) > 5) {
          pointerMoved = true;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        if (!active || !viewer || !pointerDownPosition) {
          pointerDownPosition = undefined;
          pointerMoved = false;
          return;
        }

        const clickPosition = movement.position;
        const clickedNearDownPosition = Cesium.Cartesian2.distance(pointerDownPosition, clickPosition) <= 5;
        pointerDownPosition = undefined;

        if (pointerMoved || !clickedNearDownPosition) {
          pointerMoved = false;
          return;
        }

        pointerMoved = false;
        const position = pickGlobePosition(viewer, clickPosition);
        if (position) {
          addPoint(position);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);

      handler.setInputAction(() => {
        if (active) {
          reset();
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },

    update(nextState) {
      active = nextState.active;
      if (dataSource) {
        dataSource.show = active || positions.length > 0;
      }

      if (nextState.clearRequest !== lastClearRequest) {
        lastClearRequest = nextState.clearRequest;
        reset();
      }
    },

    unmount() {
      handler?.destroy();
      if (viewer && dataSource) {
        viewer.dataSources.remove(dataSource, true);
      }
      handler = undefined;
      dataSource = undefined;
      viewer = undefined;
      positions = [];
      pointerDownPosition = undefined;
      pointerMoved = false;
    }
  };
}

function pickGlobePosition(viewer: Cesium.Viewer, windowPosition: Cesium.Cartesian2) {
  const ray = viewer.camera.getPickRay(windowPosition);
  if (ray) {
    const globePicked = viewer.scene.globe.pick(ray, viewer.scene);
    if (Cesium.defined(globePicked)) {
      return globePicked;
    }
  }

  return viewer.camera.pickEllipsoid(windowPosition, Cesium.Ellipsoid.WGS84);
}

function totalDistanceKm(positions: Cesium.Cartesian3[]) {
  let totalMeters = 0;

  for (let index = 1; index < positions.length; index += 1) {
    totalMeters += distanceMeters(positions[index - 1], positions[index]);
  }

  return totalMeters / 1000;
}

function distanceMeters(from: Cesium.Cartesian3, to: Cesium.Cartesian3) {
  const fromCartographic = Cesium.Cartographic.fromCartesian(from);
  const toCartographic = Cesium.Cartographic.fromCartesian(to);
  const geodesic = new Cesium.EllipsoidGeodesic(fromCartographic, toCartographic);
  return geodesic.surfaceDistance;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
}
