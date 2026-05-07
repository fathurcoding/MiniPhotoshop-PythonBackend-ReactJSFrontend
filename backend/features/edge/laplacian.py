import cv2
import numpy as np

def apply(image, ksize=3, **kwargs):
    """Apply Laplacian edge detection."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # Apply Laplacian
    laplacian = cv2.Laplacian(gray, cv2.CV_64F, ksize=int(ksize))
    
    # Convert back to uint8
    result = cv2.convertScaleAbs(laplacian)
    return result
