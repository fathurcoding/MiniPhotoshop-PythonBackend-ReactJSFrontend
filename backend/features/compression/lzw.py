import cv2
import numpy as np

def apply(image, **kwargs):
    """
    Simulate Lempel-Ziv-Welch (LZW) compression to calculate compression ratio.
    Returns the visually lossless image and stats.
    """
    # LZW can be slow in Python for very large images (e.g. 4K). 
    # To keep the API responsive while still demonstrating the concept and ratio,
    # we will run it on the actual pixels, but if it takes too long we might need a timeout.
    
    flat_image = image.flatten().tolist()
    
    # Original size in bits
    original_bits = len(flat_image) * 8
    
    if len(flat_image) == 0:
        return image, 0, 0

    # Initialize dictionary with all possible 8-bit values (0-255)
    dict_size = 256
    dictionary = {tuple([i]): i for i in range(dict_size)}
    
    w = tuple()
    compressed_codes_count = 0
    total_compressed_bits = 0
    current_code_length = 9
    next_bump = 512
    
    for pixel in flat_image:
        wc = w + (pixel,)
        if wc in dictionary:
            w = wc
        else:
            compressed_codes_count += 1
            total_compressed_bits += current_code_length
            
            # Add wc to the dictionary.
            # Typical LZW for images (like GIF) caps dictionary at 12 bits (4096)
            if dict_size < 4096:
                dictionary[wc] = dict_size
                dict_size += 1
                if dict_size == next_bump:
                    current_code_length += 1
                    next_bump *= 2
            
            w = (pixel,)
    
    if w:
        compressed_codes_count += 1
        total_compressed_bits += current_code_length
        
    # We return the exact same image (lossless) but with the calculated stats
    return image, original_bits, total_compressed_bits
