import type { City } from '../visited/types';
import type { RouteEdge } from './types';

const EARTH_RADIUS_KM = 6371;

export function buildMinimumSpanningTree(cities: City[]): RouteEdge[] {
  if (cities.length <= 1) {
    return [];
  }

  const visited = new Set<number>([0]);
  const edges: RouteEdge[] = [];

  while (visited.size < cities.length) {
    let best:
      | {
          fromIndex: number;
          toIndex: number;
          distanceKm: number;
        }
      | undefined;

    for (const fromIndex of visited) {
      for (let toIndex = 0; toIndex < cities.length; toIndex += 1) {
        if (visited.has(toIndex)) {
          continue;
        }

        const distanceKm = greatCircleDistanceKm(cities[fromIndex], cities[toIndex]);
        if (!best || distanceKm < best.distanceKm) {
          best = { fromIndex, toIndex, distanceKm };
        }
      }
    }

    if (!best) {
      break;
    }

    visited.add(best.toIndex);
    edges.push({
      fromCityId: cities[best.fromIndex].id,
      toCityId: cities[best.toIndex].id,
      distanceKm: best.distanceKm
    });
  }

  return edges;
}

function greatCircleDistanceKm(from: City, to: City) {
  const fromLat = toRadians(from.location.lat);
  const toLat = toRadians(to.location.lat);
  const deltaLat = toRadians(to.location.lat - from.location.lat);
  const deltaLon = toRadians(to.location.lon - from.location.lon);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
