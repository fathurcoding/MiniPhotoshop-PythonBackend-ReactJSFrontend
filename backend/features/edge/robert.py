import cv2
import numpy as np

def apply(image, **kwargs):
    """Apply Robert Cross edge detection using manual kernels."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # Robert Cross Kernels
    kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
    kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
    
    # Apply kernels
    robert_x = cv2.filter2D(gray, -1, kernel_x)
    robert_y = cv2.filter2D(gray, -1, kernel_y)
    
    # Combine results
    result = cv2.addWeighted(robert_x, 0.5, robert_y, 0.5, 0)
    return result
