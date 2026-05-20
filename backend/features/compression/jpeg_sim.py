import cv2
import numpy as np

def apply(image, quality=50, **kwargs):
    """
    Simulate JPEG Compression (Lossy).
    This applies the actual JPEG compression pipeline (DCT, Quantization, Huffman) 
    by encoding the image into a JPEG buffer in memory with the specified quality factor,
    and then decoding it back.
    This provides the exact visual artifacts (like 8x8 blocking) and the true compressed size.
    """
    try:
        quality = int(quality)
    except ValueError:
        quality = 50
        
    # Ensure quality is between 1 and 100
    quality = max(1, min(100, quality))
    
    # Original size in bits
    original_bits = image.size * 8
    
    # Encode to JPEG format in memory
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    success, encoded_image = cv2.imencode('.jpg', image, encode_param)
    
    if not success:
        return image, original_bits, original_bits # Fallback if encoding fails
        
    # Compressed size in bits
    total_compressed_bits = len(encoded_image) * 8
    
    # Decode back to image array to simulate the lossy effect in the UI preview
    decoded_image = cv2.imdecode(encoded_image, cv2.IMREAD_UNCHANGED)
    
    return decoded_image, original_bits, total_compressed_bits
