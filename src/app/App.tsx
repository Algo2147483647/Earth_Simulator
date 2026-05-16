import {
  FileJson,
  Globe2,
  LocateFixed,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Ruler,
  Search,
  Settings2,
  SunMoon,
  Trash2
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { buildMinimumSpanningTree } from '../features/routes/mst';
import { useVisitedCities } from '../features/visited/useVisitedCities';
import { CesiumViewer } from '../globe/CesiumViewer';
import type { Measurement } from '../globe/layers/measureLayer';
import { useGlobeStore } from '../globe/store';

export function App() {
  const { cities, loading, error, sourceName, loadCitiesFromFile } = useVisitedCities();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement>({ points: 0, distanceKm: 0 });
  const [clearMeasurementRequest, setClearMeasurementRequest] = useState(0);
  const {
    showVisitedPoints,
    showRoutes,
    showGrid,
    showDayNight,
    measureMode,
    selectedCityId,
    setShowVisitedPoints,
    setShowRoutes,
    setShowGrid,
    setShowDayNight,
    setMeasureMode,
    setSelectedCityId,
    flyToCityRequest,
    flyToAllRequest,
    requestFlyToCity,
    requestFlyToAll
  } = useGlobeStore();

  const routes = useMemo(() => buildMinimumSpanningTree(cities), [cities]);
  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const trimmedQuery = query.trim();
  const visibleCities = trimmedQuery ? cities.filter((city) => city.name.includes(trimmedQuery)) : cities;
  const totalDistance = routes.reduce((sum, routeEdge) => sum + routeEdge.distanceKm, 0);

  return (
    <main className="app-shell">
      <CesiumViewer
        cities={cities}
        routes={routes}
        showVisitedPoints={showVisitedPoints}
        showRoutes={showRoutes}
        showGrid={showGrid}
        showDayNight={showDayNight}
        measureMode={measureMode}
        clearMeasurementRequest={clearMeasurementRequest}
        selectedCityId={selectedCityId}
        flyToCityRequest={flyToCityRequest}
        flyToAllRequest={flyToAllRequest}
        onSelectCity={setSelectedCityId}
        onMeasurementChange={setMeasurement}
      />

      <aside className={panelCollapsed ? 'side-panel collapsed' : 'side-panel'}>
        <section className="brand-row">
          <Globe2 aria-hidden="true" />
          {!panelCollapsed ? (
            <div>
              <h1>Earth Simulator</h1>
              <p>{loading ? 'Loading city data...' : sourceName ? `${cities.length} cities - ${sourceName}` : 'No city data loaded'}</p>
            </div>
          ) : null}
          <button
            type="button"
            className="icon-button panel-toggle"
            aria-label={panelCollapsed ? 'Expand settings panel' : 'Collapse settings panel'}
            title={panelCollapsed ? 'Expand settings panel' : 'Collapse settings panel'}
            onClick={() => setPanelCollapsed((collapsed) => !collapsed)}
          >
            {panelCollapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </button>
        </section>

        {!panelCollapsed ? (
          <>
            {error ? <p className="error-text">{error}</p> : null}

            <section className="control-section">
              <div className="section-title">
                <FileJson aria-hidden="true" />
                <span>Data</span>
              </div>
              <input
                ref={fileInputRef}
                className="hidden-file-input"
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void loadCitiesFromFile(file);
                    setSelectedCityId(undefined);
                  }
                  event.target.value = '';
                }}
              />
              <button type="button" className="wide-button" onClick={() => fileInputRef.current?.click()}>
                <FileJson aria-hidden="true" />
                Select JSON
              </button>
            </section>

            <section className="control-section">
              <div className="section-title">
                <Settings2 aria-hidden="true" />
                <span>Layers</span>
              </div>
              <label className="toggle-row">
                <span>Visited cities</span>
                <input
                  type="checkbox"
                  checked={showVisitedPoints}
                  onChange={(event) => setShowVisitedPoints(event.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>Minimum spanning tree</span>
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(event) => setShowRoutes(event.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>Coordinate grid</span>
                <input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} />
              </label>
              <label className="toggle-row">
                <span className="toggle-label-with-icon">
                  <SunMoon aria-hidden="true" />
                  Day-night lighting
                </span>
                <input
                  type="checkbox"
                  checked={showDayNight}
                  onChange={(event) => setShowDayNight(event.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span className="toggle-label-with-icon">
                  <Ruler aria-hidden="true" />
                  Map measuring
                </span>
                <input
                  type="checkbox"
                  checked={measureMode}
                  onChange={(event) => setMeasureMode(event.target.checked)}
                />
              </label>
            </section>

            <section className="metrics-grid" aria-label="Statistics">
              <div>
                <span>Cities</span>
                <strong>{cities.length}</strong>
              </div>
              <div>
                <span>Edges</span>
                <strong>{routes.length}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{Math.round(totalDistance).toLocaleString()} km</strong>
              </div>
            </section>

            <section className="control-section">
              <div className="button-row">
                <button type="button" disabled={cities.length === 0} onClick={requestFlyToAll}>
                  <Map aria-hidden="true" />
                  All
                </button>
                <button type="button" disabled={!selectedCity} onClick={() => selectedCity && requestFlyToCity(selectedCity.id)}>
                  <LocateFixed aria-hidden="true" />
                  Locate
                </button>
              </div>
            </section>

            <section className="city-card">
              <div className="section-title">
                <Ruler aria-hidden="true" />
                <span>Measure</span>
              </div>
              <p>{measureMode ? `Left-click to add points, right-click to clear - ${measurement.points} points` : 'Enable map measuring, then click the map to add points'}</p>
              <strong className="measurement-value">{formatDistance(measurement.distanceKm)}</strong>
              <button
                type="button"
                className="wide-button subtle-button"
                disabled={measurement.points === 0}
                onClick={() => setClearMeasurementRequest((request) => request + 1)}
              >
                <Trash2 aria-hidden="true" />
                Clear measurement
              </button>
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
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cities" />
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
                    <small>
                      {city.location.lat.toFixed(2)} / {city.location.lon.toFixed(2)}
                    </small>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </aside>
    </main>
  );
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
}
