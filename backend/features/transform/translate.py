# Layer: Features - Transform
# Purpose: Image translation (geser posisi).

import cv2
import numpy as np

def apply(image: np.ndarray, tx: float, ty: float) -> np.ndarray:
    """Translate the image purely via coordinate shift without expanding the canvas."""
    # Ensure image has an alpha channel just to be consistent
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGRA)
    elif image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
        
    # The frontend handles translation via globalShift, so the image pixels 
    # themselves don't need to be padded. We just report the shift.
    return image, int(tx), int(ty)
