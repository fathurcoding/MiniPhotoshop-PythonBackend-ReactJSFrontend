import cv2
import numpy as np

def apply(image, ksize=3, sigma=1.0, **kwargs):
    """Apply Laplacian of Gaussian (LoG) edge detection."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # 1. Apply Gaussian Blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (int(ksize), int(ksize)), sigma)
    
    # 2. Apply Laplacian
    laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
    
    # Convert back to uint8
    result = cv2.convertScaleAbs(laplacian)
    return result
