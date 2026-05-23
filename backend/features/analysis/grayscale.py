import cv2

def apply(image, **kwargs):
    """Convert BGR image to Grayscale[cite: 59]."""
    if len(image.shape) == 3:
        if image.shape[2] == 4:
            return cv2.cvtColor(image, cv2.COLOR_BGRA2GRAY)
        else:
            return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image