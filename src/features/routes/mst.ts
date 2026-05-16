import type { City } from '../visited/types';
import type { RouteEdge } from './types';

const EARTH_RADIUS_KM = 6371;

export function buildMinimumSpanningTree(cities: City[]): RouteEdge[] {
  if (cities.length <= 1) {
    return [];
  }

  const visited = new Array<boolean>(cities.length).fill(false);
  const bestDistance = new Array<number>(cities.length).fill(Number.POSITIVE_INFINITY);
  const bestFrom = new Array<number>(cities.length).fill(-1);
  const edges: RouteEdge[] = [];
  const locations = cities.map((city) => ({
    lat: toRadians(city.location.lat),
    lon: toRadians(city.location.lon),
    cosLat: Math.cos(toRadians(city.location.lat))
  }));
  let currentIndex = 0;

  for (let edgeCount = 0; edgeCount < cities.length - 1; edgeCount += 1) {
    visited[currentIndex] = true;

    for (let toIndex = 0; toIndex < cities.length; toIndex += 1) {
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
    for (let index = 0; index < cities.length; index += 1) {
      if (!visited[index] && bestDistance[index] < nextDistance) {
        nextIndex = index;
        nextDistance = bestDistance[index];
      }
    }

    if (nextIndex === -1) {
      break;
    }

    edges.push({
      fromCityId: cities[bestFrom[nextIndex]].id,
      toCityId: cities[nextIndex].id,
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
