import cv2

def apply(image, kernel_size=5, **kwargs):
    """Apply smoothing (blur) to the image."""
    size = int(kernel_size)
    if size % 2 == 0:
        size += 1  # Ukuran kernel konvolusi harus ganjil
    return cv2.blur(image, (size, size))