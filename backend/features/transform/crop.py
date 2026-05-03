# Layer: Features - Transform
# Purpose: Image cropping.

import numpy as np

def apply(image: np.ndarray, start_x: int, start_y: int, end_x: int, end_y: int) -> np.ndarray:
    """Crop the image based on coordinates."""
    h, w = image.shape[:2]
    
    # Ensure coordinates are within bounds
    x1 = max(0, min(start_x, end_x))
    y1 = max(0, min(start_y, end_y))
    x2 = min(w, max(start_x, end_x))
    y2 = min(h, max(start_y, end_y))
    
    if x1 == x2 or y1 == y2:
        return image, 0, 0 # Invalid crop area
        
    return image[y1:y2, x1:x2], x1, y1
