import cv2

def apply(image, kernel_size=5, sigma=1.0, **kwargs):
    """
    Apply Gaussian blur filter to the image.
    kernel_size: ukuran ganjil dari frontend
    sigma: standar deviasi untuk distribusi gaussian
    """
    size = int(kernel_size)
    if size % 2 == 0:
        size += 1  # Ukuran kernel harus ganjil di OpenCV
    return cv2.GaussianBlur(image, (size, size), float(sigma))