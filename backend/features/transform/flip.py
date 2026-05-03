# Layer: Features - Transform
# Purpose: Image flipping.

import cv2
import numpy as np

def apply(image: np.ndarray, direction: str) -> np.ndarray:
    """Flip the image horizontally or vertically.
    direction: 'h' for horizontal, 'v' for vertical
    """
    flipCode = 1 if direction == 'h' else 0
    return cv2.flip(image, flipCode)
