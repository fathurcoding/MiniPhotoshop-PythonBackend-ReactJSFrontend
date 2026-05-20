import cv2

def apply(image, brightness_value=0, **kwargs):
    """
    Adjust the brightness of the image.
    brightness_value: kisaran -255 sampai 255 dari slider frontend
    """
    # Pastikan nilai bertipe float/int sebelum masuk ke OpenCV
    value = int(brightness_value)
    return cv2.convertScaleAbs(image, alpha=1.0, beta=value)