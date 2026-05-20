import cv2
import numpy as np
import math

def apply(image, **kwargs):
    """
    Simulate Arithmetic Coding.
    Arithmetic coding approaches the theoretical Shannon entropy limit.
    To avoid extremely slow arbitrary-precision float math in Python,
    we calculate the exact entropy of the image and use it to define 
    the optimal compressed size, which is what Arithmetic Coding achieves.
    Returns the visually lossless image and stats.
    """
    flat_image = image.flatten()
    
    if len(flat_image) == 0:
        return image, 0, 0
        
    original_bits = len(flat_image) * 8
    
    # Calculate frequencies and probabilities
    unique, counts = np.unique(flat_image, return_counts=True)
    probabilities = counts / len(flat_image)
    
    # Calculate Shannon Entropy: H = -sum(p * log2(p))
    entropy = -np.sum(probabilities * np.log2(probabilities))
    
    # Arithmetic coding achieves near-entropy size.
    # Total bits = Entropy * Number of symbols
    total_compressed_bits = int(np.ceil(entropy * len(flat_image)))
    
    # Add a small constant overhead for the probability table (header)
    table_overhead_bits = len(unique) * (8 + 32) # 8-bit symbol + 32-bit frequency
    total_compressed_bits += table_overhead_bits
    
    return image, original_bits, total_compressed_bits
