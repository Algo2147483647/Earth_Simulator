import * as Cesium from 'cesium';
import type { RouteEdge } from '../../features/routes/types';
import type { City } from '../../features/visited/types';
import type { GlobeLayer } from './types';

type RouteLayerState = {
  routes: RouteEdge[];
  cities: City[];
  visible: boolean;
};

export function createRouteLayer(): GlobeLayer<RouteLayerState> {
  let viewer: Cesium.Viewer | undefined;
  let dataSource: Cesium.CustomDataSource | undefined;

  return {
    mount(nextViewer) {
      viewer = nextViewer;
      dataSource = new Cesium.CustomDataSource('visited-routes');
      viewer.dataSources.add(dataSource);
    },

    update({ routes, cities, visible }) {
      if (!dataSource) {
        return;
      }

      const cityById = new Map(cities.map((city) => [city.id, city]));
      dataSource.show = visible;
      dataSource.entities.removeAll();

      for (const route of routes) {
        const from = cityById.get(route.fromCityId);
        const to = cityById.get(route.toCityId);
        if (!from || !to) {
          continue;
        }

        dataSource.entities.add({
          id: `route-${route.fromCityId}-${route.toCityId}`,
          name: `${from.name} - ${to.name}`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([
              from.location.lon,
              from.location.lat,
              to.location.lon,
              to.location.lat
            ]),
            width: 3,
            arcType: Cesium.ArcType.GEODESIC,
            material: new Cesium.PolylineGlowMaterialProperty({
              color: Cesium.Color.fromCssColorString('#65d6ff').withAlpha(0.72),
              glowPower: 0.1
            }),
            clampToGround: false
          }
        });
      }
    },

    unmount() {
      if (viewer && dataSource) {
        viewer.dataSources.remove(dataSource, true);
      }
      dataSource = undefined;
      viewer = undefined;
    }
  };
}
