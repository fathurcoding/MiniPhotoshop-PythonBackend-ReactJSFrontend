import cv2
import numpy as np

def apply(image, ksize=3, **kwargs):
    """Apply Sobel edge detection to the image."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # Compute Sobel in X and Y directions
    grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=int(ksize))
    grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=int(ksize))
    
    # Calculate magnitude
    abs_grad_x = cv2.convertScaleAbs(grad_x)
    abs_grad_y = cv2.convertScaleAbs(grad_y)
    
    # Weighted sum to get final edge image
    sobel_combined = cv2.addWeighted(abs_grad_x, 0.5, abs_grad_y, 0.5, 0)
    
    return sobel_combined
