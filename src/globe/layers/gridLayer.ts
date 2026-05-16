import * as Cesium from 'cesium';
import type { GlobeLayer } from './types';

type GridLayerState = {
  visible: boolean;
};

export function createGridLayer(): GlobeLayer<GridLayerState> {
  let viewer: Cesium.Viewer | undefined;
  let primitive: Cesium.Primitive | undefined;

  return {
    mount(nextViewer) {
      viewer = nextViewer;
      primitive = createGridPrimitive();
      primitive.show = false;
      viewer.scene.primitives.add(primitive);
    },

    update({ visible }) {
      if (!primitive) {
        return;
      }

      primitive.show = visible;
      viewer?.scene.requestRender();
    },

    unmount() {
      if (viewer && primitive) {
        viewer.scene.primitives.remove(primitive);
      }
      primitive = undefined;
      viewer = undefined;
    }
  };
}

function createGridPrimitive() {
  const geometryInstances: Cesium.GeometryInstance[] = [];
  const regularColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE.withAlpha(0.14));
  const axisColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE.withAlpha(0.22));

  for (let lat = -80; lat <= 80; lat += 10) {
    geometryInstances.push(createLineInstance(makeParallel(lat), lat === 0 ? 1.6 : 1, lat === 0 ? axisColor : regularColor));
  }

  for (let lon = -180; lon <= 180; lon += 10) {
    geometryInstances.push(createLineInstance(makeMeridian(lon), lon === 0 ? 1.6 : 1, lon === 0 ? axisColor : regularColor));
  }

  return new Cesium.Primitive({
    geometryInstances,
    appearance: new Cesium.PolylineColorAppearance({
      translucent: true
    }),
    asynchronous: true
  });
}

function createLineInstance(
  positions: Cesium.Cartesian3[],
  width: number,
  color: Cesium.ColorGeometryInstanceAttribute
) {
  return new Cesium.GeometryInstance({
    geometry: new Cesium.PolylineGeometry({
      positions,
      width,
      arcType: Cesium.ArcType.GEODESIC,
      vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
    }),
    attributes: {
      color
    }
  });
}

function makeParallel(lat: number) {
  const positions: Cesium.Cartesian3[] = [];
  for (let lon = -180; lon <= 180; lon += 2) {
    positions.push(Cesium.Cartesian3.fromDegrees(lon, lat));
  }
  return positions;
}

function makeMeridian(lon: number) {
  const positions: Cesium.Cartesian3[] = [];
  for (let lat = -90; lat <= 90; lat += 2) {
    positions.push(Cesium.Cartesian3.fromDegrees(lon, lat));
  }
  return positions;
}
