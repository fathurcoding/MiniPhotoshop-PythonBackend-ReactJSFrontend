import cv2
import numpy as np

def apply(image, **kwargs):
    """Apply sharpening filter to the image using spatial convolution kernel."""
    kernel = np.array([[ 0, -1,  0],
                       [-1,  5, -1],
                       [ 0, -1,  0]])
    return cv2.filter2D(image, -1, kernel)