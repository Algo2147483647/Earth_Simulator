import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import type { City } from '../features/visited/types';
import type { RouteEdge } from '../features/routes/types';
import { createGridLayer } from './layers/gridLayer';
import { createMeasureLayer, type Measurement } from './layers/measureLayer';
import { createRouteLayer } from './layers/routeLayer';
import { createVisitedPointsLayer } from './layers/visitedPointsLayer';

type CesiumViewerProps = {
  cities: City[];
  routes: RouteEdge[];
  showVisitedPoints: boolean;
  showRoutes: boolean;
  showGrid: boolean;
  showDayNight: boolean;
  measureMode: boolean;
  clearMeasurementRequest: number;
  selectedCityId?: string;
  flyToCityRequest: number;
  flyToAllRequest: number;
  onSelectCity: (cityId?: string) => void;
  onMeasurementChange: (measurement: Measurement) => void;
};

export function CesiumViewer({
  cities,
  routes,
  showVisitedPoints,
  showRoutes,
  showGrid,
  showDayNight,
  measureMode,
  clearMeasurementRequest,
  selectedCityId,
  flyToCityRequest,
  flyToAllRequest,
  onSelectCity,
  onMeasurementChange
}: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const pointsLayerRef = useRef(createVisitedPointsLayer(onSelectCity));
  const routeLayerRef = useRef(createRouteLayer());
  const gridLayerRef = useRef(createGridLayer());
  const measureLayerRef = useRef(createMeasureLayer(onMeasurementChange));

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) {
      return;
    }

    Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN ?? '';

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      terrainProvider: new Cesium.EllipsoidTerrainProvider()
    });

    viewer.scene.globe.enableLighting = showDayNight;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.skyAtmosphere.show = true;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(105, 35, 9_200_000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      }
    });

    viewerRef.current = viewer;
    pointsLayerRef.current.mount(viewer);
    routeLayerRef.current.mount(viewer);
    gridLayerRef.current.mount(viewer);
    measureLayerRef.current.mount(viewer);

    return () => {
      pointsLayerRef.current.unmount();
      routeLayerRef.current.unmount();
      gridLayerRef.current.unmount();
      measureLayerRef.current.unmount();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    pointsLayerRef.current.update({ cities, visible: showVisitedPoints, selectedCityId });
  }, [cities, selectedCityId, showVisitedPoints]);

  useEffect(() => {
    routeLayerRef.current.update({ routes, cities, visible: showRoutes });
  }, [cities, routes, showRoutes]);

  useEffect(() => {
    gridLayerRef.current.update({ visible: showGrid });
  }, [showGrid]);

  useEffect(() => {
    measureLayerRef.current.update({ active: measureMode, clearRequest: clearMeasurementRequest });
  }, [clearMeasurementRequest, measureMode]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    viewer.scene.globe.enableLighting = showDayNight;
    viewer.scene.requestRender();
  }, [showDayNight]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const city = cities.find((item) => item.id === selectedCityId);
    if (!viewer || !city || flyToCityRequest === 0) {
      return;
    }

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(city.location.lon, city.location.lat, 600_000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      },
      duration: 1.4
    });
  }, [cities, flyToCityRequest, selectedCityId]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || cities.length === 0 || flyToAllRequest === 0) {
      return;
    }

    const rectangle = Cesium.Rectangle.fromDegrees(
      Math.min(...cities.map((city) => city.location.lon)) - 8,
      Math.min(...cities.map((city) => city.location.lat)) - 5,
      Math.max(...cities.map((city) => city.location.lon)) + 8,
      Math.max(...cities.map((city) => city.location.lat)) + 5
    );
    viewer.camera.flyTo({
      destination: rectangle,
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      },
      duration: 1.2
    });
  }, [cities, flyToAllRequest]);

  return <div ref={containerRef} className="cesium-root" />;
}
