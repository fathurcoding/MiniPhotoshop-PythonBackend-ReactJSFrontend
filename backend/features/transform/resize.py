# Layer: Features - Transform
# Purpose: Image resize using scaling.

import cv2
import numpy as np

def apply(image: np.ndarray, width: int, height: int, tx: float = 0, ty: float = 0):
    """Resize the image to absolute width and height with optional translation shift."""
    # Using INTER_AREA for shrinking, INTER_CUBIC for enlarging
    h, w = image.shape[:2]
    interp = cv2.INTER_AREA if (width < w or height < h) else cv2.INTER_CUBIC
    result = cv2.resize(image, (width, height), interpolation=interp)
    # Return result along with shifts for position consistency
    return result, tx, ty
