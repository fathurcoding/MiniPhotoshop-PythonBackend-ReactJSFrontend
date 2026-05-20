import cv2

def apply(image, kernel_size=5, **kwargs):
    """
    Apply median filter to the image.
    kernel_size: ukuran kernel ganjil (misal 3, 5, 7) dari slider frontend
    """
    size = int(kernel_size)
    if size % 2 == 0:
        size += 1  
    return cv2.medianBlur(image, size)