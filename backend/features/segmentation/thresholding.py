import cv2
import numpy as np

def apply(image, **kwargs):
    """
    Threshold-based segmentation (Otsu's binarization).
    Extracts the foreground by generating a binary mask and applying it to the original image.
    """
    # Convert to grayscale
    if len(image.shape) == 3:
        if image.shape[2] == 4:
            gray = cv2.cvtColor(image, cv2.COLOR_BGRA2GRAY)
        else:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    # Apply Otsu's thresholding to get mask
    _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # In some cases, foreground is white, background is black. 
    # If the corners of the mask are white, it might be inverted.
    # Let's assume white in mask means foreground.
    
    # Extract foreground
    # To support transparent background, we convert the result to BGRA
    if len(image.shape) == 3:
        if image.shape[2] == 4:
            b, g, r, a = cv2.split(image)
        else:
            b, g, r = cv2.split(image)
        # Use mask as alpha channel directly where 255 is opaque, 0 is transparent
        result = cv2.merge((b, g, r, mask))
    else:
        # If already grayscale, just add an alpha channel
        result = cv2.cvtColor(image, cv2.COLOR_GRAY2BGRA)
        result[:, :, 3] = mask
        
    return result
