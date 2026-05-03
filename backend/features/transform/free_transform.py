import cv2
import numpy as np

def apply_free_transform(img: np.ndarray, x: float, y: float, scaleX: float, scaleY: float, rotation_deg: float) -> np.ndarray:
    """
    Applies an affine transformation mimicking CSS `transform-origin: center`
    Order of CSS operations: translate(x, y) rotate(deg) scale(sx, sy)
    This means we apply:
    1. Translate to origin (-cx, -cy)
    2. Scale
    3. Rotate
    4. Translate back to center (cx, cy)
    5. Translate by (x, y)
    """
    h, w = img.shape[:2]
    cx, cy = w / 2.0, h / 2.0

    # 1. Translate to origin
    T_origin = np.array([
        [1, 0, -cx],
        [0, 1, -cy],
        [0, 0, 1]
    ], dtype=np.float64)

    # 2. Scale
    S = np.array([
        [scaleX, 0, 0],
        [0, scaleY, 0],
        [0, 0, 1]
    ], dtype=np.float64)

    # 3. Rotate
    rad = np.deg2rad(rotation_deg)
    cos = np.cos(rad)
    sin = np.sin(rad)
    R = np.array([
        [cos, -sin, 0],
        [sin, cos, 0],
        [0, 0, 1]
    ], dtype=np.float64)

    # 4. Translate back
    T_inv_origin = np.array([
        [1, 0, cx],
        [0, 1, cy],
        [0, 0, 1]
    ], dtype=np.float64)

    # 5. Global Translation
    T_global = np.array([
        [1, 0, x],
        [0, 1, y],
        [0, 0, 1]
    ], dtype=np.float64)

    # Compose the matrices: M = T_global * T_inv_origin * R * S * T_origin
    # In matrix math, operations are applied right-to-left
    M = T_global @ T_inv_origin @ R @ S @ T_origin

    # We need a 2x3 matrix for warpAffine
    M_2x3 = M[:2, :]

    # Decide interpolation based on scaling
    interp = cv2.INTER_LINEAR
    if scaleX < 1.0 or scaleY < 1.0:
        # If shrinking, INTER_AREA is better to prevent moiré patterns
        interp = cv2.INTER_AREA
    if scaleX > 2.0 or scaleY > 2.0:
        # If heavily enlarging, CUBIC is softer
        interp = cv2.INTER_CUBIC

    # Apply warpAffine, keeping the original image dimensions
    result = cv2.warpAffine(img, M_2x3, (w, h), flags=interp, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))

    return result
