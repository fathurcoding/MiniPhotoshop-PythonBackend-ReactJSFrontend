# Layer: Features - Analysis
# Purpose: Calculate the histogram of an image. Note: Analysis only, not enhancement.

import cv2
import numpy as np

def apply(image, **kwargs):
    """
    Calculate and return the image histogram.
    Mengembalikan data distribusi nilai piksel dalam bentuk list/dictionary 
    agar mudah di-parsing menjadi grafik oleh frontend.
    """
    if image is None:
        return {"error": "Invalid image"}

    # Jika gambar berwarna (3 channel: BGR)
    if len(image.shape) == 3:
        b_hist = cv2.calcHist([image], [0], None, [256], [0, 256]).flatten().tolist()
        g_hist = cv2.calcHist([image], [1], None, [256], [0, 256]).flatten().tolist()
        r_hist = cv2.calcHist([image], [2], None, [256], [0, 256]).flatten().tolist()
        
        return {
            "mode": "rgb",
            "r": r_hist,
            "g": g_hist,
            "b": b_hist
        }
    # Jika gambar grayscale (1 channel)
    else:
        gray_hist = cv2.calcHist([image], [0], None, [256], [0, 256]).flatten().tolist()
        return {
            "mode": "grayscale",
            "gray": gray_hist
        }