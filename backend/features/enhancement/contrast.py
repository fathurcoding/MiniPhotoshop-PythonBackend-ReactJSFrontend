import cv2

def apply(image, contrast_value=0, **kwargs):
    """
    Adjust the contrast of the image.
    contrast_value: kisaran -127 sampai 127 dari slider frontend
    """
    value = int(contrast_value)
    if value >= 0:
        alpha = (value + 127) / 127.0
    else:
        alpha = 127.0 / (127.0 - value)
        
    return cv2.convertScaleAbs(image, alpha=alpha, beta=0)