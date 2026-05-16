import * as Cesium from 'cesium';
import type { City } from '../../features/visited/types';
import type { GlobeLayer } from './types';

type VisitedPointsState = {
  cities: City[];
  visible: boolean;
  selectedCityId?: string;
};

export function createVisitedPointsLayer(onSelectCity: (cityId?: string) => void): GlobeLayer<VisitedPointsState> {
  let viewer: Cesium.Viewer | undefined;
  let dataSource: Cesium.CustomDataSource | undefined;
  let handler: Cesium.ScreenSpaceEventHandler | undefined;

  return {
    mount(nextViewer) {
      viewer = nextViewer;
      dataSource = new Cesium.CustomDataSource('visited-cities');
      viewer.dataSources.add(dataSource);

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer?.scene.pick(movement.position);
        const cityId = picked?.id?.properties?.cityId?.getValue();
        if (typeof cityId === 'string') {
          onSelectCity(cityId);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    update({ cities, visible, selectedCityId }) {
      if (!dataSource) {
        return;
      }

      dataSource.show = visible;
      dataSource.entities.removeAll();

      for (const city of cities) {
        const selected = city.id === selectedCityId;
        dataSource.entities.add({
          id: `city-${city.id}`,
          name: city.name,
          position: Cesium.Cartesian3.fromDegrees(city.location.lon, city.location.lat, city.location.height ?? 0),
          properties: {
            cityId: city.id
          },
          point: {
            pixelSize: selected ? 14 : 9,
            color: selected ? Cesium.Color.fromCssColorString('#ffcf5a') : Cesium.Color.fromCssColorString('#ff5a5f'),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.88),
            outlineWidth: selected ? 3 : 1,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: {
            text: city.name,
            font: selected ? '600 15px sans-serif' : '13px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -22),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, selected ? 6_000_000 : 2_500_000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
      }

      viewer?.scene.requestRender();
    },

    unmount() {
      handler?.destroy();
      if (viewer && dataSource) {
        viewer.dataSources.remove(dataSource, true);
      }
      handler = undefined;
      dataSource = undefined;
      viewer = undefined;
    }
  };
}
