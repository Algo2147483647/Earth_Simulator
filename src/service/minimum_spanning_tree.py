import heapq
from spherical_geometry import great_circle_distance

def weight_function(point1, point2):
    r = 6371  # 地球半径，单位为公里
    distance = great_circle_distance(r, point1[0], point1[1], point2[0], point2[1])
    return distance

def prim(points):
    n = len(points)
    if n == 0:
        return [], 0

    mst = []
    total_weight = 0
    visited = [False] * n
    min_heap = [(0, 0)]  # (权重, 起始点)
    prev_node = [-1] * n  # 记录每个节点的前驱节点
    min_weights = [float('inf')] * n  # 每个节点的最小权重

    min_weights[0] = 0  # 起始点的权重为0

    while min_heap:
        weight, u = heapq.heappop(min_heap)
        if visited[u]:
            continue
        visited[u] = True
        total_weight += weight

        if prev_node[u] != -1:  # 只记录真正的边
            mst.append((prev_node[u], u, weight))

        for v in range(n):
            if not visited[v] and u != v:  # 确保不访问自己
                edge_weight = weight_function(points[u], points[v])
                if edge_weight < min_weights[v]:  # 只有更小的权重才更新
                    min_weights[v] = edge_weight
                    heapq.heappush(min_heap, (edge_weight, v))
                    prev_node[v] = u  # 更新前驱节点

    return mst, total_weight
