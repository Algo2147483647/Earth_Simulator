import tifffile
import matplotlib.pyplot as plt
import numpy as np

filename = './ETOPO_2022_v1_60s_N90W180_surface.tif'
image_data = tifffile.imread(filename)
image_data = (image_data - np.min(image_data)) / (np.max(image_data) - np.min(image_data))

image_data = image_data * 2 - 1
image_data = np.sin(image_data * np.pi / 2)
image_data = np.sin(image_data * np.pi / 2)
# 将二维数组打平成一维
flattened_data = image_data.flatten()

# 绘制直方图
plt.hist(flattened_data, bins=50)
plt.title('Histogram of Flattened Data')
plt.xlabel('Value')
plt.ylabel('Frequency')

# 显示图形
plt.show()

dpi = 100
height, width = image_data.shape
figsize = width / dpi, height / dpi
plt.figure(figsize=figsize)
plt.imshow(image_data, cmap='turbo')
plt.axis('off')
plt.savefig('elevation_map1.png', dpi=dpi, bbox_inches='tight', pad_inches=0)