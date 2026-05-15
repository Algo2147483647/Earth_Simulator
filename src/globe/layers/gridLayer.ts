import * as Cesium from 'cesium';
import type { GlobeLayer } from './types';

type GridLayerState = {
  visible: boolean;
};

export function createGridLayer(): GlobeLayer<GridLayerState> {
  let viewer: Cesium.Viewer | undefined;
  let dataSource: Cesium.CustomDataSource | undefined;
  let initialized = false;

  return {
    mount(nextViewer) {
      viewer = nextViewer;
      dataSource = new Cesium.CustomDataSource('lat-lon-grid');
      viewer.dataSources.add(dataSource);
    },

    update({ visible }) {
      if (!dataSource) {
        return;
      }

      dataSource.show = visible;
      if (initialized) {
        return;
      }

      const material = Cesium.Color.WHITE.withAlpha(0.18);
      for (let lat = -80; lat <= 80; lat += 10) {
        dataSource.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(makeParallel(lat)),
            width: lat === 0 ? 1.4 : 0.7,
            arcType: Cesium.ArcType.GEODESIC,
            material
          }
        });
      }

      for (let lon = -180; lon <= 180; lon += 10) {
        dataSource.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(makeMeridian(lon)),
            width: lon === 0 ? 1.4 : 0.7,
            arcType: Cesium.ArcType.GEODESIC,
            material
          }
        });
      }

      initialized = true;
    },

    unmount() {
      if (viewer && dataSource) {
        viewer.dataSources.remove(dataSource, true);
      }
      initialized = false;
      dataSource = undefined;
      viewer = undefined;
    }
  };
}

function makeParallel(lat: number) {
  const values: number[] = [];
  for (let lon = -180; lon <= 180; lon += 2) {
    values.push(lon, lat);
  }
  return values;
}

function makeMeridian(lon: number) {
  const values: number[] = [];
  for (let lat = -90; lat <= 90; lat += 2) {
    values.push(lon, lat);
  }
  return values;
}
