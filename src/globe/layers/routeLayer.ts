import * as Cesium from 'cesium';
import type { RouteEdge } from '../../features/routes/types';
import type { Point } from '../../features/visited/types';
import type { GlobeLayer } from './types';

type RouteLayerState = {
  routes: RouteEdge[];
  points: Point[];
  visible: boolean;
};

export function createRouteLayer(): GlobeLayer<RouteLayerState> {
  let viewer: Cesium.Viewer | undefined;
  let primitive: Cesium.Primitive | undefined;
  let routeKey = '';

  return {
    mount(nextViewer) {
      viewer = nextViewer;
    },

    update({ routes, points, visible }) {
      if (!viewer) {
        return;
      }

      const nextRouteKey = makeRouteKey(routes, points);
      if (nextRouteKey !== routeKey) {
        if (primitive) {
          viewer.scene.primitives.remove(primitive);
          primitive = undefined;
        }

        routeKey = nextRouteKey;
        if (routes.length > 0 && points.length > 0) {
          primitive = createRoutePrimitive(routes, points);
          primitive.show = visible;
          viewer.scene.primitives.add(primitive);
        }
      } else if (primitive) {
        primitive.show = visible;
      }

      viewer.scene.requestRender();
    },

    unmount() {
      if (viewer && primitive) {
        viewer.scene.primitives.remove(primitive);
      }
      primitive = undefined;
      routeKey = '';
      viewer = undefined;
    }
  };
}

function createRoutePrimitive(routes: RouteEdge[], points: Point[]) {
  const pointById = new Map(points.map((point) => [point.id, point]));
  const color = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#65d6ff').withAlpha(0.72));
  const geometryInstances: Cesium.GeometryInstance[] = [];

  for (const route of routes) {
    const from = pointById.get(route.fromPointId);
    const to = pointById.get(route.toPointId);
    if (!from || !to) {
      continue;
    }

    geometryInstances.push(
      new Cesium.GeometryInstance({
        id: `route-${route.fromPointId}-${route.toPointId}`,
        geometry: new Cesium.PolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArray([
            from.location.lon,
            from.location.lat,
            to.location.lon,
            to.location.lat
          ]),
          width: 3,
          arcType: Cesium.ArcType.GEODESIC,
          vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
        }),
        attributes: {
          color
        }
      })
    );
  }

  return new Cesium.Primitive({
    geometryInstances,
    appearance: new Cesium.PolylineColorAppearance({
      translucent: true
    }),
    asynchronous: true
  });
}

function makeRouteKey(routes: RouteEdge[], points: Point[]) {
  return [
    points.map((point) => `${point.id}:${point.location.lon}:${point.location.lat}:${point.location.height ?? 0}`).join('|'),
    routes.map((route) => `${route.fromPointId}:${route.toPointId}`).join('|')
  ].join('::');
}
