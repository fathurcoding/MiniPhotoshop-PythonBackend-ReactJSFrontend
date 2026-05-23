import cv2
import numpy as np

def apply(image, hue_shift=0, saturation_scale=1.0, **kwargs):
    """Transformasi ruang warna HSV untuk manipulasi Hue dan Saturation sederhana[cite: 61, 63]."""
    if len(image.shape) != 3:
        return image
        
    has_alpha = image.shape[2] == 4
    if has_alpha:
        # Separate alpha
        alpha = image[:, :, 3]
        img_bgr = image[:, :, :3]
    else:
        img_bgr = image
        
    # Transformasi ke ruang warna HSV
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = cv2.split(hsv)
    
    # Geser nilai Hue (Range OpenCV: 0-179)
    h = (h + float(hue_shift)) % 180
    
    # Skala nilai Saturation (Manipulasi array channel) [cite: 64]
    s = s * float(saturation_scale)
    s = np.clip(s, 0, 255)
    
    hsv_merged = cv2.merge([h, s, v]).astype(np.uint8)
    bgr_result = cv2.cvtColor(hsv_merged, cv2.COLOR_HSV2BGR)
    
    if has_alpha:
        # Re-attach alpha
        b, g, r = cv2.split(bgr_result)
        return cv2.merge([b, g, r, alpha])
        
    return bgr_result