import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import type { Point } from '../features/points/types';
import type { RouteEdge } from '../features/routes/types';
import { createGridLayer } from './layers/gridLayer';
import { createMeasureLayer, type Measurement, type MeasurementType } from './layers/measureLayer';
import { createPointsLayer } from './layers/pointsLayer';
import { createRouteLayer } from './layers/routeLayer';

const ARCGIS_WORLD_ELEVATION_URL =
  'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer';

type CesiumViewerProps = {
  points: Point[];
  routes: RouteEdge[];
  showPoints: boolean;
  showRoutes: boolean;
  showGrid: boolean;
  showDayNight: boolean;
  measureMode: boolean;
  measurementType: MeasurementType;
  clearMeasurementRequest: number;
  selectedPointId?: string;
  flyToPointRequest: number;
  flyToAllRequest: number;
  currentLocationRequest: {
    lat: number;
    lon: number;
    request: number;
  };
  onSelectPoint: (pointId?: string) => void;
  onMeasurementChange: (measurement: Measurement) => void;
};

export function CesiumViewer({
  points,
  routes,
  showPoints,
  showRoutes,
  showGrid,
  showDayNight,
  measureMode,
  measurementType,
  clearMeasurementRequest,
  selectedPointId,
  flyToPointRequest,
  flyToAllRequest,
  currentLocationRequest,
  onSelectPoint,
  onMeasurementChange
}: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const pointsLayerRef = useRef(createPointsLayer(onSelectPoint));
  const routeLayerRef = useRef(createRouteLayer());
  const gridLayerRef = useRef(createGridLayer());
  const measureLayerRef = useRef(createMeasureLayer(onMeasurementChange));
  const currentLocationEntityRef = useRef<Cesium.Entity | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) {
      return;
    }

    Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN ?? '';
    const imageryProviderViewModels = createImageryProviderViewModels();
    const terrainProviderViewModels = createTerrainProviderViewModels();

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      imageryProviderViewModels,
      selectedImageryProviderViewModel: imageryProviderViewModels[0],
      terrainProviderViewModels,
      selectedTerrainProviderViewModel: terrainProviderViewModels[0],
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      msaaSamples: 1,
      requestRenderMode: true,
      maximumRenderTimeChange: 1
    });

    viewer.useBrowserRecommendedResolution = false;
    viewer.resolutionScale = 1;
    viewer.scene.postProcessStages.fxaa.enabled = false;
    viewer.scene.msaaSamples = 1;
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
    pointsLayerRef.current.update({ points, visible: showPoints, selectedPointId });
  }, [points, selectedPointId, showPoints]);

  useEffect(() => {
    routeLayerRef.current.update({ routes, points, visible: showRoutes });
  }, [points, routes, showRoutes]);

  useEffect(() => {
    gridLayerRef.current.update({ visible: showGrid });
  }, [showGrid]);

  useEffect(() => {
    measureLayerRef.current.update({ active: measureMode, type: measurementType, clearRequest: clearMeasurementRequest });
  }, [clearMeasurementRequest, measureMode, measurementType]);

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
    const point = points.find((item) => item.id === selectedPointId);
    if (!viewer || !point || flyToPointRequest === 0) {
      return;
    }

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(point.location.lon, point.location.lat, 600_000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      },
      duration: 1.4
    });
  }, [points, flyToPointRequest, selectedPointId]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || points.length === 0 || flyToAllRequest === 0) {
      return;
    }

    const rectangle = Cesium.Rectangle.fromDegrees(
      Math.min(...points.map((point) => point.location.lon)) - 8,
      Math.min(...points.map((point) => point.location.lat)) - 5,
      Math.max(...points.map((point) => point.location.lon)) + 8,
      Math.max(...points.map((point) => point.location.lat)) + 5
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
  }, [points, flyToAllRequest]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || currentLocationRequest.request === 0) {
      return;
    }

    const position = Cesium.Cartesian3.fromDegrees(currentLocationRequest.lon, currentLocationRequest.lat, 0);
    if (currentLocationEntityRef.current) {
      viewer.entities.remove(currentLocationEntityRef.current);
    }
    currentLocationEntityRef.current = viewer.entities.add({
      id: 'current-location',
      name: 'Current location',
      position,
      point: {
        pixelSize: 13,
        color: Cesium.Color.fromCssColorString('#5bc0eb'),
        outlineColor: Cesium.Color.WHITE.withAlpha(0.92),
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: 'Current location',
        font: '13px Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -26),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
    viewer.scene.requestRender();

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(currentLocationRequest.lon, currentLocationRequest.lat, 350_000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      },
      duration: 1.2
    });
  }, [currentLocationRequest]);

  return <div ref={containerRef} className="cesium-root" />;
}

function createImageryProviderViewModels() {
  return [
    new Cesium.ProviderViewModel({
      name: 'ArcGIS World Imagery',
      tooltip: 'High-resolution Esri ArcGIS World Imagery',
      iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/ArcGisMapServiceWorldImagery.png'),
      creationFunction: () =>
        Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        )
    }),
    new Cesium.ProviderViewModel({
      name: 'OpenStreetMap',
      tooltip: 'OpenStreetMap map tiles',
      iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
      creationFunction: () =>
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/'
        })
    }),
    new Cesium.ProviderViewModel({
      name: 'ArcGIS World Hillshade',
      tooltip: 'Elevation hillshade map from Esri ArcGIS',
      iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/ArcGisMapServiceWorldHillshade.png'),
      creationFunction: () =>
        Cesium.ArcGisMapServerImageryProvider.fromBasemapType(Cesium.ArcGisBaseMapType.HILLSHADE, {
          enablePickFeatures: false
        })
    })
  ];
}

function createTerrainProviderViewModels() {
  return [
    new Cesium.ProviderViewModel({
      name: 'WGS84 Ellipsoid',
      tooltip: 'Flat WGS84 ellipsoid terrain',
      iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/Ellipsoid.png'),
      creationFunction: () => new Cesium.EllipsoidTerrainProvider()
    }),
    new Cesium.ProviderViewModel({
      name: 'ArcGIS World Elevation',
      tooltip: 'Global 3D terrain from Esri ArcGIS World Elevation',
      iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
      creationFunction: () => Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(ARCGIS_WORLD_ELEVATION_URL)
    })
  ];
}
