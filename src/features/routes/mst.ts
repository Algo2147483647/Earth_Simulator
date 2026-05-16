import type { Point } from '../points/types';
import type { RouteEdge } from './types';

const EARTH_RADIUS_KM = 6371;

export function buildMinimumSpanningTree(points: Point[]): RouteEdge[] {
  if (points.length <= 1) {
    return [];
  }

  const visited = new Array<boolean>(points.length).fill(false);
  const bestDistance = new Array<number>(points.length).fill(Number.POSITIVE_INFINITY);
  const bestFrom = new Array<number>(points.length).fill(-1);
  const edges: RouteEdge[] = [];
  const locations = points.map((point) => ({
    lat: toRadians(point.location.lat),
    lon: toRadians(point.location.lon),
    cosLat: Math.cos(toRadians(point.location.lat))
  }));
  let currentIndex = 0;

  for (let edgeCount = 0; edgeCount < points.length - 1; edgeCount += 1) {
    visited[currentIndex] = true;

    for (let toIndex = 0; toIndex < points.length; toIndex += 1) {
      if (visited[toIndex]) {
        continue;
      }

      const distanceKm = greatCircleDistanceKm(locations[currentIndex], locations[toIndex]);
      if (distanceKm < bestDistance[toIndex]) {
        bestDistance[toIndex] = distanceKm;
        bestFrom[toIndex] = currentIndex;
      }
    }

    let nextIndex = -1;
    let nextDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < points.length; index += 1) {
      if (!visited[index] && bestDistance[index] < nextDistance) {
        nextIndex = index;
        nextDistance = bestDistance[index];
      }
    }

    if (nextIndex === -1) {
      break;
    }

    edges.push({
      fromPointId: points[bestFrom[nextIndex]].id,
      toPointId: points[nextIndex].id,
      distanceKm: nextDistance
    });
    currentIndex = nextIndex;
  }

  return edges;
}

type RadianLocation = {
  lat: number;
  lon: number;
  cosLat: number;
};

function greatCircleDistanceKm(from: RadianLocation, to: RadianLocation) {
  const deltaLat = to.lat - from.lat;
  const deltaLon = to.lon - from.lon;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    from.cosLat * to.cosLat * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
