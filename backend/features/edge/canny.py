import cv2


def apply(image, threshold1=100, threshold2=200, **kwargs):
    """Apply Canny edge detection to the image."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    edges = cv2.Canny(gray, float(threshold1), float(threshold2))
    return edges
