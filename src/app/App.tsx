import { Globe2, LocateFixed, Map, Route, Search, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CesiumViewer } from '../globe/CesiumViewer';
import { useGlobeStore } from '../globe/store';
import { useVisitedCities } from '../features/visited/useVisitedCities';
import { buildMinimumSpanningTree } from '../features/routes/mst';

export function App() {
  const { cities, loading, error } = useVisitedCities();
  const [query, setQuery] = useState('');
  const {
    showVisitedPoints,
    showRoutes,
    showGrid,
    selectedCityId,
    setShowVisitedPoints,
    setShowRoutes,
    setShowGrid,
    setSelectedCityId,
    flyToCityRequest,
    flyToAllRequest,
    requestFlyToCity,
    requestFlyToAll
  } = useGlobeStore();

  const routes = useMemo(() => buildMinimumSpanningTree(cities), [cities]);
  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const visibleCities = cities.filter((city) => city.name.includes(query.trim()));
  const totalDistance = routes.reduce((sum, routeEdge) => sum + routeEdge.distanceKm, 0);

  return (
    <main className="app-shell">
      <CesiumViewer
        cities={cities}
        routes={routes}
        showVisitedPoints={showVisitedPoints}
        showRoutes={showRoutes}
        showGrid={showGrid}
        selectedCityId={selectedCityId}
        flyToCityRequest={flyToCityRequest}
        flyToAllRequest={flyToAllRequest}
        onSelectCity={setSelectedCityId}
      />

      <aside className="side-panel">
        <section className="brand-row">
          <Globe2 aria-hidden="true" />
          <div>
            <h1>Earth Simulator</h1>
            <p>{loading ? '加载城市数据...' : `${cities.length} 个访问城市`}</p>
          </div>
        </section>

        {error ? <p className="error-text">{error}</p> : null}

        <section className="control-section">
          <div className="section-title">
            <Settings2 aria-hidden="true" />
            <span>图层</span>
          </div>
          <label className="toggle-row">
            <span>访问城市</span>
            <input
              type="checkbox"
              checked={showVisitedPoints}
              onChange={(event) => setShowVisitedPoints(event.target.checked)}
            />
          </label>
          <label className="toggle-row">
            <span>最短连接树</span>
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(event) => setShowRoutes(event.target.checked)}
            />
          </label>
          <label className="toggle-row">
            <span>经纬网</span>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(event) => setShowGrid(event.target.checked)}
            />
          </label>
        </section>

        <section className="metrics-grid" aria-label="统计">
          <div>
            <span>城市</span>
            <strong>{cities.length}</strong>
          </div>
          <div>
            <span>连线</span>
            <strong>{routes.length}</strong>
          </div>
          <div>
            <span>总长</span>
            <strong>{Math.round(totalDistance).toLocaleString()} km</strong>
          </div>
        </section>

        <section className="control-section">
          <div className="button-row">
            <button type="button" onClick={requestFlyToAll}>
              <Map aria-hidden="true" />
              全部
            </button>
            <button type="button" disabled={!selectedCity} onClick={() => selectedCity && requestFlyToCity(selectedCity.id)}>
              <LocateFixed aria-hidden="true" />
              定位
            </button>
          </div>
        </section>

        {selectedCity ? (
          <section className="city-card">
            <div className="section-title">
              <Route aria-hidden="true" />
              <span>{selectedCity.name}</span>
            </div>
            <p>
              {selectedCity.location.lat.toFixed(4)}, {selectedCity.location.lon.toFixed(4)}
            </p>
          </section>
        ) : null}

        <section className="city-list-section">
          <label className="search-box">
            <Search aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索城市" />
          </label>
          <div className="city-list">
            {visibleCities.map((city) => (
              <button
                type="button"
                key={city.id}
                className={city.id === selectedCityId ? 'selected' : ''}
                onClick={() => {
                  setSelectedCityId(city.id);
                  requestFlyToCity(city.id);
                }}
              >
                <span>{city.name}</span>
                <small>{city.location.lat.toFixed(2)} / {city.location.lon.toFixed(2)}</small>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
