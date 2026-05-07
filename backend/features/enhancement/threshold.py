import cv2
import numpy as np

def apply(image, threshold_value=128, method='manual'):
    """
    Apply thresholding to create a binary image.
    If image is color, it will be converted to grayscale first.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    if method == 'otsu':
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    else:
        _, binary = cv2.threshold(gray, float(threshold_value), 255, cv2.THRESH_BINARY)
        
    return binary
