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
              <p>{loading ? '加载城市数据...' : sourceName ? `${cities.length} 个城市 · ${sourceName}` : '未加载城市数据'}</p>
            </div>
          ) : null}
          <button
            type="button"
            className="icon-button panel-toggle"
            aria-label={panelCollapsed ? '展开配置栏' : '折叠配置栏'}
            title={panelCollapsed ? '展开配置栏' : '折叠配置栏'}
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
                <span>数据</span>
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
                选择 JSON
              </button>
            </section>

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
                <input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} />
              </label>
              <label className="toggle-row">
                <span className="toggle-label-with-icon">
                  <SunMoon aria-hidden="true" />
                  晨昏光照
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
                  地图测距
                </span>
                <input
                  type="checkbox"
                  checked={measureMode}
                  onChange={(event) => setMeasureMode(event.target.checked)}
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
                <button type="button" disabled={cities.length === 0} onClick={requestFlyToAll}>
                  <Map aria-hidden="true" />
                  全部
                </button>
                <button type="button" disabled={!selectedCity} onClick={() => selectedCity && requestFlyToCity(selectedCity.id)}>
                  <LocateFixed aria-hidden="true" />
                  定位
                </button>
              </div>
            </section>

            <section className="city-card">
              <div className="section-title">
                <Ruler aria-hidden="true" />
                <span>测距</span>
              </div>
              <p>{measureMode ? `左键取点，右键清空 · ${measurement.points} 点` : '开启地图测距后在地图上取点'}</p>
              <strong className="measurement-value">{formatDistance(measurement.distanceKm)}</strong>
              <button
                type="button"
                className="wide-button subtle-button"
                disabled={measurement.points === 0}
                onClick={() => setClearMeasurementRequest((request) => request + 1)}
              >
                <Trash2 aria-hidden="true" />
                清空测距
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
