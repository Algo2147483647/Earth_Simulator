import { useEffect, useState } from 'react';
import type { City } from './types';

type VisitedCitiesState = {
  cities: City[];
  loading: boolean;
  error?: string;
};

export function useVisitedCities() {
  const [state, setState] = useState<VisitedCitiesState>({
    cities: [],
    loading: true
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/data/visited-cities.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<City[]>;
      })
      .then((cities) => {
        if (!cancelled) {
          setState({ cities, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            cities: [],
            loading: false,
            error: error instanceof Error ? error.message : '城市数据加载失败'
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
