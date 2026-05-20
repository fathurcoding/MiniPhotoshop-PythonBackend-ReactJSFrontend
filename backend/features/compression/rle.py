import cv2
import numpy as np

def apply(image, **kwargs):
    """
    Simulate Run-Length Encoding (RLE) to calculate compression ratio.
    Returns the visually lossless image and stats.
    """
    # Flatten image to 1D array of pixel values
    flat_image = image.flatten()
    
    if len(flat_image) == 0:
        return image, 0, 0
        
    # We simulate RLE where each "run" is stored as [count, value]
    # Assuming 8-bit value and 8-bit count (max run length 255)
    compressed_size_elements = 0
    current_val = flat_image[0]
    count = 1
    
    # Using a faster numpy approach or standard loop
    # For large images, pure python loop might be slow, so let's optimize slightly
    # Find indices where value changes
    diffs = np.diff(flat_image)
    change_indices = np.where(diffs != 0)[0]
    
    # Add the end of the array to calculate the last run
    change_indices = np.append(change_indices, len(flat_image) - 1)
    
    # Calculate run lengths
    run_lengths = np.diff(np.insert(change_indices, 0, -1))
    
    # Because we cap the max run length to 255 (to fit in 1 byte)
    # A run of e.g. 500 will be split into [255, val], [245, val]
    total_runs = 0
    for length in run_lengths:
        total_runs += int(np.ceil(length / 255.0))
        
    # Each run takes 2 bytes: [count, value]
    compressed_size_elements = total_runs * 2
    
    original_bits = len(flat_image) * 8
    total_compressed_bits = compressed_size_elements * 8
    
    # We return the exact same image (lossless) but with the calculated stats
    return image, original_bits, total_compressed_bits
