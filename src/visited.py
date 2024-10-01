import folium
import json
import pandas as pd
import os

def readVisitedTxt(url = './visited.txt'):
    cities_df = pd.read_excel('./cities.xlsx')
    city_info = {}
    
    with open(url, 'r', encoding='utf-8') as file:
        for line in file:
            city_name = line.strip()  # 去掉行末的换行符
            city_data = cities_df[cities_df['name'] == city_name]

            if not city_data.empty:
                # 获取城市的纬度和经度
                latitude = city_data['latitude'].values[0]
                longitude = city_data['longitude'].values[0]

                # 构建城市信息字典
                city_info[city_name] = {
                    "coordinates": [latitude, longitude],
                    "attractions": []
                }

    json_data = json.dumps(city_info, ensure_ascii=False, indent=2)

    with open(os.path.splitext(url)[0] + ".json", 'w', encoding='utf-8') as json_file:
        json_file.write(json_data)


def readVisitedJson(url = './visited.json'):
    with open(url, 'r', encoding='utf-8') as file:
        cities_data = json.load(file)

    m = folium.Map(location=[35, 110], zoom_start=4)

    for city, data in cities_data.items():
        coordinates = data['coordinates']
        attractions_list = data['attractions']

        folium.Marker(coordinates, tooltip=city).add_to(m)
        
        # 添加标记
        if all(isinstance(item, str) for item in attractions_list):
            attractions = ', '.join(attractions_list)
        
        # 添加GeoJSON图层
        for attraction in attractions_list:
            if isinstance(attraction, dict) and 'geojson' in attraction:
                geojson_data = attraction['geojson']
                folium.GeoJson(
                    geojson_data, 
                    name=attraction['name'], 
                    tooltip=attraction['name']  # 添加鼠标悬停提示
                ).add_to(m)

    m.save(os.path.splitext(url)[0] + ".html")

if __name__ == "__main__":
    readVisitedTxt()
    readVisitedJson()
    readVisitedJson('./visited_poi.json')