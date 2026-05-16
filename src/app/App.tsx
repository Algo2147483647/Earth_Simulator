import {
  DraftingCompass,
  FileJson,
  Globe2,
  Grid3X3,
  LandPlot,
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
import { useVisitedPoints } from '../features/visited/useVisitedPoints';
import { CesiumViewer } from '../globe/CesiumViewer';
import type { Measurement, MeasurementType } from '../globe/layers/measureLayer';
import { useGlobeStore } from '../globe/store';

export function App() {
  const { points, loading, error, sourceName, loadPointsFromFile } = useVisitedPoints();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement>({ points: 0, distanceKm: 0, areaKm2: 0 });
  const [measurementType, setMeasurementType] = useState<MeasurementType>('distance');
  const [clearMeasurementRequest, setClearMeasurementRequest] = useState(0);
  const [currentLocationRequest, setCurrentLocationRequest] = useState({ lat: 0, lon: 0, request: 0 });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>();
  const {
    showPoints,
    showRoutes,
    showGrid,
    showDayNight,
    measureMode,
    selectedPointId,
    setShowPoints,
    setShowRoutes,
    setShowGrid,
    setShowDayNight,
    setMeasureMode,
    setSelectedPointId,
    flyToPointRequest,
    flyToAllRequest,
    requestFlyToPoint,
    requestFlyToAll
  } = useGlobeStore();

  const routes = useMemo(() => buildMinimumSpanningTree(points), [points]);
  const selectedPoint = points.find((point) => point.id === selectedPointId);
  const trimmedQuery = query.trim();
  const visiblePoints = trimmedQuery ? points.filter((point) => point.name.includes(trimmedQuery)) : points;
  const totalDistance = routes.reduce((sum, routeEdge) => sum + routeEdge.distanceKm, 0);

  function locateCurrentPosition() {
    if (!navigator.geolocation) {
      setLocationError('Current location is not supported by this browser');
      return;
    }

    setLocating(true);
    setLocationError(undefined);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedPointId(undefined);
        setCurrentLocationRequest((current) => ({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          request: current.request + 1
        }));
        setLocating(false);
      },
      (geoError) => {
        setLocationError(geoError.message || 'Failed to get current location');
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 30_000
      }
    );
  }

  return (
    <main className="app-shell">
      <CesiumViewer
        points={points}
        routes={routes}
        showPoints={showPoints}
        showRoutes={showRoutes}
        showGrid={showGrid}
        showDayNight={showDayNight}
        measureMode={measureMode}
        measurementType={measurementType}
        clearMeasurementRequest={clearMeasurementRequest}
        selectedPointId={selectedPointId}
        flyToPointRequest={flyToPointRequest}
        flyToAllRequest={flyToAllRequest}
        currentLocationRequest={currentLocationRequest}
        onSelectPoint={setSelectedPointId}
        onMeasurementChange={setMeasurement}
      />

      <aside className={panelCollapsed ? 'side-panel collapsed' : 'side-panel'}>
        <section className="brand-row">
          <Globe2 aria-hidden="true" />
          {!panelCollapsed ? (
            <div>
              <h1>Earth Simulator</h1>
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
            {locationError ? <p className="error-text">{locationError}</p> : null}

            <section className="panel-section">
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
                    void loadPointsFromFile(file);
                    setSelectedPointId(undefined);
                  }
                  event.target.value = '';
                }}
              />
              <button type="button" className="wide-button" onClick={() => fileInputRef.current?.click()}>
                <FileJson aria-hidden="true" />
                <span className="button-text">{loading ? 'Loading JSON...' : sourceName ?? 'Select JSON'}</span>
              </button>
            </section>

            <section className="panel-section">
              <div className="section-title">
                <Settings2 aria-hidden="true" />
                <span>Tools</span>
              </div>
              <div className="tool-button-grid">
                <button
                  type="button"
                  className={showPoints ? 'is-selected' : ''}
                  aria-pressed={showPoints}
                  onClick={() => setShowPoints(!showPoints)}
                >
                  <Globe2 aria-hidden="true" />
                  Points
                </button>
                <button
                  type="button"
                  className={showRoutes ? 'is-selected' : ''}
                  aria-pressed={showRoutes}
                  onClick={() => setShowRoutes(!showRoutes)}
                >
                  <Route aria-hidden="true" />
                  MST
                </button>
                <button
                  type="button"
                  className={showGrid ? 'is-selected' : ''}
                  aria-pressed={showGrid}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 aria-hidden="true" />
                  Grid
                </button>
                <button
                  type="button"
                  className={showDayNight ? 'is-selected' : ''}
                  aria-pressed={showDayNight}
                  onClick={() => setShowDayNight(!showDayNight)}
                >
                  <SunMoon aria-hidden="true" />
                  Light
                </button>
                <button
                  type="button"
                  className={measureMode ? 'is-selected' : ''}
                  aria-pressed={measureMode}
                  onClick={() => setMeasureMode(!measureMode)}
                >
                  <DraftingCompass aria-hidden="true" />
                  Measure
                </button>
                <button type="button" disabled={points.length === 0} onClick={requestFlyToAll}>
                  <Map aria-hidden="true" />
                  All Points
                </button>
                <button type="button" disabled={locating} onClick={locateCurrentPosition}>
                  <LocateFixed aria-hidden="true" />
                  {locating ? 'Locating' : 'Locate'}
                </button>
              </div>
            </section>

            <section className="metrics-grid" aria-label="Statistics">
              <div>
                <span>Points</span>
                <strong>{points.length}</strong>
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

            <section className="panel-card">
              <div className="section-title">
                <DraftingCompass aria-hidden="true" />
                <span>Measure</span>
                <div className="measurement-mode-switch" role="group" aria-label="Measurement type">
                  <button
                    type="button"
                    className={measurementType === 'distance' ? 'is-selected' : ''}
                    aria-label="Distance measurement"
                    title="Distance"
                    onClick={() => setMeasurementType('distance')}
                  >
                    <Ruler aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={measurementType === 'area' ? 'is-selected' : ''}
                    aria-label="Area measurement"
                    title="Area"
                    onClick={() => setMeasurementType('area')}
                  >
                    <LandPlot aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  className="icon-button section-action"
                  aria-label="Clear measurement"
                  title="Clear measurement"
                  disabled={measurement.points === 0}
                  onClick={() => setClearMeasurementRequest((request) => request + 1)}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
              <strong className="measurement-value">
                {measurementType === 'area' ? formatArea(measurement.areaKm2) : formatDistance(measurement.distanceKm)}
              </strong>
            </section>

            {selectedPoint ? (
              <section className="panel-card">
                <div className="section-title">
                  <Route aria-hidden="true" />
                  <span>{selectedPoint.name}</span>
                </div>
                <p>
                  {selectedPoint.location.lat.toFixed(4)}, {selectedPoint.location.lon.toFixed(4)}
                </p>
              </section>
            ) : null}

            <section className="point-list-section">
              <label className="search-box">
                <Search aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search points" />
              </label>
              <div className="point-list">
                {visiblePoints.map((point) => (
                  <button
                    type="button"
                    key={point.id}
                    className={point.id === selectedPointId ? 'is-selected' : ''}
                    onClick={() => {
                      setSelectedPointId(point.id);
                      requestFlyToPoint(point.id);
                    }}
                  >
                    <span>{point.name}</span>
                    <small>
                      {point.location.lat.toFixed(2)} / {point.location.lon.toFixed(2)}
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

function formatArea(areaKm2: number) {
  if (areaKm2 < 1) {
    return `${Math.round(areaKm2 * 1_000_000).toLocaleString()} m2`;
  }

  return `${areaKm2.toLocaleString(undefined, { maximumFractionDigits: 2 })} km2`;
}
