import cv2
import numpy as np

def apply(image, hue_shift=0, saturation_scale=1.0, **kwargs):
    """Transformasi ruang warna HSV untuk manipulasi Hue dan Saturation sederhana[cite: 61, 63]."""
    if len(image.shape) != 3:
        return image
        
    # Transformasi ke ruang warna HSV
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = cv2.split(hsv)
    
    # Geser nilai Hue (Range OpenCV: 0-179)
    h = (h + float(hue_shift)) % 180
    
    # Skala nilai Saturation (Manipulasi array channel) [cite: 64]
    s = s * float(saturation_scale)
    s = np.clip(s, 0, 255)
    
    hsv_merged = cv2.merge([h, s, v]).astype(np.uint8)
    return cv2.cvtColor(hsv_merged, cv2.COLOR_HSV2BGR)