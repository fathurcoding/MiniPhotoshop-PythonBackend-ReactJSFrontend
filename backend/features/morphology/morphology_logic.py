import cv2
import numpy as np

def apply_erosion(image, kernel_size=3, shape='rect', iterations=1, **kwargs):
    """Apply erosion to the image."""
    kernel = get_structuring_element(int(kernel_size), shape)
    result = cv2.erode(image, kernel, iterations=int(iterations))
    return result

def apply_dilation(image, kernel_size=3, shape='rect', iterations=1, **kwargs):
    """Apply dilation to the image."""
    kernel = get_structuring_element(int(kernel_size), shape)
    result = cv2.dilate(image, kernel, iterations=int(iterations))
    return result

def get_structuring_element(size, shape):
    """Create a structuring element (kernel) for morphology."""
    if shape == 'cross':
        return cv2.getStructuringElement(cv2.MORPH_CROSS, (size, size))
    elif shape == 'ellipse':
        return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (size, size))
    else: # Default: rectangular
        return cv2.getStructuringElement(cv2.MORPH_RECT, (size, size))
