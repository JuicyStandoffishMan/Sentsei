import os
from PIL import Image

def png_to_jpeg(png_path, quality=80):
    jpeg_path = png_path.rsplit('.', 1)[0] + '.jpg'
    if not os.path.isfile(jpeg_path):
        img = Image.open(png_path)
        rgb_im = img.convert('RGB')
        rgb_im.save(jpeg_path, 'JPEG', quality=quality)

        # Remove the png file
        os.remove(png_path)

def main():
    for file_name in os.listdir('.'):
        if file_name.endswith('.png'):
            png_to_jpeg(file_name)

if __name__ == '__main__':
    main()
