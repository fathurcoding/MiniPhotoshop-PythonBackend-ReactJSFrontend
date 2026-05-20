import cv2
import numpy as np

def apply(image, k=3, **kwargs):
    """
    Region-based segmentation (K-Means Clustering).
    Segments the image into K distinct colors/regions.
    """
    k = int(k)
    if k < 2:
        k = 2
        
    # K-Means works best with BGR/RGB images.
    # If image is grayscale, convert to BGR first for consistency.
    is_gray = False
    has_alpha = False
    alpha_channel = None
    
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        is_gray = True
    elif image.shape[2] == 4:
        has_alpha = True
        alpha_channel = image[:, :, 3]
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)

    # Reshape the image to a 2D array of pixels
    pixel_values = image.reshape((-1, 3))
    # Convert to float32
    pixel_values = np.float32(pixel_values)

    # Define stopping criteria for KMeans
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    
    # Perform K-Means
    _, labels, (centers) = cv2.kmeans(pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    # Convert centers back to uint8
    centers = np.uint8(centers)
    
    # Map labels to the center values
    segmented_data = centers[labels.flatten()]
    
    # Reshape back to the original image dimensions
    segmented_image = segmented_data.reshape(image.shape)
    
    if is_gray:
        # Convert back to grayscale if original was grayscale
        segmented_image = cv2.cvtColor(segmented_image, cv2.COLOR_BGR2GRAY)
    elif has_alpha:
        # Add the alpha channel back
        b, g, r = cv2.split(segmented_image)
        segmented_image = cv2.merge((b, g, r, alpha_channel))
        
    return segmented_image
