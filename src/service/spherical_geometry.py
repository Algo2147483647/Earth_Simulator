import math


def great_circle_distance(r, lat1, lon1, lat2, lon2):
    # 将角度转换为弧度
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # 计算球面距离
    delta_sigma = math.acos(math.sin(lat1_rad) * math.sin(lat2_rad) +
                            math.cos(lat1_rad) * math.cos(lat2_rad) *
                            math.cos(lon2_rad - lon1_rad))

    distance = r * delta_sigma
    return distance


