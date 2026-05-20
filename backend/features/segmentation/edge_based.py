import cv2
import numpy as np

def apply(image, **kwargs):
    """
    Edge-based segmentation.
    Uses Canny edge detection, finds contours, fills the contours, 
    and applies the mask to extract the object.
    """
    # Convert to grayscale for edge detection
    if len(image.shape) == 3:
        if image.shape[2] == 4:
            gray = cv2.cvtColor(image, cv2.COLOR_BGRA2GRAY)
        else:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()
        
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Detect edges using Canny
    edges = cv2.Canny(blurred, 50, 150)
    
    # Perform morphological closing to close small gaps in edges
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create an empty mask
    mask = np.zeros(gray.shape, dtype=np.uint8)
    
    # Fill the found contours on the mask
    cv2.drawContours(mask, contours, -1, (255), thickness=cv2.FILLED)
    
    # Optional: apply one more morphology opening to clean up mask edges
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Extract foreground using the mask
    if len(image.shape) == 3:
        if image.shape[2] == 4:
            b, g, r, a = cv2.split(image)
        else:
            b, g, r = cv2.split(image)
        result = cv2.merge((b, g, r, mask))
    else:
        result = cv2.cvtColor(image, cv2.COLOR_GRAY2BGRA)
        result[:, :, 3] = mask
        
    return result
