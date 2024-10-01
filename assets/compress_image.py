from PIL import Image
Image.MAX_IMAGE_PIXELS = 1000000000  # 10亿像素
def compress_image(input_file_path, output_file_path):
    # 打开图片
    img = Image.open(input_file_path)
    new_size = (img.size[0]//2, img.size[1]//2)
    img_resized = img.resize(new_size)

    # 保存压缩后的图片
    img_resized.save(output_file_path, "PNG")

# 使用示例
compress_image("Blue_Marble_2002.png", "earth.png")
