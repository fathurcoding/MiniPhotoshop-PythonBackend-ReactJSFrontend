import cv2

def apply(image, **kwargs):
    """Convert BGR image to Grayscale[cite: 59]."""
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image