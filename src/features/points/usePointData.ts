import { useState } from 'react';
import type { Point } from './types';

type PointDataState = {
  points: Point[];
  loading: boolean;
  error?: string;
  sourceName?: string;
};

export function usePointData() {
  const [state, setState] = useState<PointDataState>({
    points: [],
    loading: false
  });

  async function loadPointsFromFile(file: File) {
    setState((current) => ({ ...current, loading: true, error: undefined }));

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      setState({
        points: normalizePoints(parsed),
        loading: false,
        sourceName: file.name
      });
    } catch (error: unknown) {
      setState({
        points: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load point data'
      });
    }
  }

  return {
    ...state,
    loadPointsFromFile
  };
}

function normalizePoints(input: unknown): Point[] {
  const items = Array.isArray(input) ? input : [input];
  const points = items.map((item, index) => normalizePoint(item, index));

  if (points.length === 0) {
    throw new Error('The JSON file does not contain any loadable point data');
  }

  return points;
}

function normalizePoint(item: unknown, index: number): Point {
  if (!isObject(item)) {
    throw new Error(`Item ${index + 1} is not an object`);
  }

  const location = item.location;
  if (!isObject(location)) {
    throw new Error(`Item ${index + 1} is missing location`);
  }

  const id = getText(item.id) ?? getText(item.key);
  const name = getText(item.name);
  const lat = getNumber(location.lat);
  const lon = getNumber(location.lon);
  const height = getNumber(location.height);

  if (!id) {
    throw new Error(`Item ${index + 1} is missing key or id`);
  }

  if (!name) {
    throw new Error(`Item ${index + 1} is missing name`);
  }

  if (lat === undefined || lon === undefined) {
    throw new Error(`Item ${index + 1} is missing valid lat/lon values`);
  }

  return {
    id,
    name,
    location: {
      lat,
      lon,
      ...(height === undefined ? {} : { height })
    }
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}
