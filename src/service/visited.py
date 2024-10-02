import folium
import json
import pandas as pd
import os

import os
import json
import pandas as pd


def GetVisitedPoints():
    visitedFile = '../../assets/visited.txt'
    citiesFile = '../../assets/cities.xlsx'

    # Read cities data and create a dictionary with city names as keys
    citiesInfo = pd.read_excel(citiesFile).set_index('name')
    cityInfo = {}

    # Read visited file and process cities
    with open(visitedFile, 'r', encoding='utf-8') as file:
        visitedCities = [line.strip() for line in file]

    # Filter cities in one operation and build city info dictionary
    for cityName in visitedCities:
        if cityName in citiesInfo.index:
            cityData = citiesInfo.loc[cityName]
            cityInfo[cityName] = {
                "coordinates": [cityData['latitude'], cityData['longitude']],
                "attractions": []
            }

    # Save as JSON
    jsonData = json.dumps(cityInfo, ensure_ascii=False, indent=2)
    jsonFilePath = os.path.splitext(visitedFile)[0] + ".json"
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonFile:
        jsonFile.write(jsonData)

    return jsonData


def ReadVisitedJson(url = './visited.json'):
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
