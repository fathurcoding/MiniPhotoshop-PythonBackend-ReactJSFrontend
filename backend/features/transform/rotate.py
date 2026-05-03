# Layer: Features - Transform
# Purpose: Image rotation using OpenCV Affine matrices.

import cv2
import numpy as np

def apply(image: np.ndarray, degree: float) -> np.ndarray:
    """Rotate the image by a given angle using affine transform."""
    # Ensure image has alpha channel to support transparent borders
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGRA)
    elif image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)

    h, w = image.shape[:2]
    cx, cy = w / 2.0, h / 2.0
    
    # Get rotation matrix around the center
    M = cv2.getRotationMatrix2D((cx, cy), degree, 1.0)
    
    # Calculate new bounding box dimensions to prevent clipping
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    new_w = int((h * sin) + (w * cos))
    new_h = int((h * cos) + (w * sin))
    
    # Adjust translation component to center the image in new bounding box
    M[0, 2] += (new_w / 2) - cx
    M[1, 2] += (new_h / 2) - cy
    
    # Apply affine transformation
    result = cv2.warpAffine(image, M, (new_w, new_h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0,0))
    
    shift_x = cx - (new_w / 2.0)
    shift_y = cy - (new_h / 2.0)
    
    # Auto-crop transparent borders so the canvas doesn't permanently grow
    alpha_channel = result[:, :, 3]
    coords = cv2.findNonZero(alpha_channel)
    if coords is not None:
        x, y, crop_w, crop_h = cv2.boundingRect(coords)
        result = result[y:y+crop_h, x:x+crop_w]
        shift_x += x
        shift_y += y
        
    return result, int(shift_x), int(shift_y)
