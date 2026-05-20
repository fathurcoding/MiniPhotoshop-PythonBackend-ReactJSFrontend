import cv2
import numpy as np

def apply(image, target_channel='R', **kwargs):
    """
    Channel splitting (R, G, B)[cite: 60].
    Mengembalikan visualisasi warna channel array yang dimanipulasi[cite: 64].
    """
    if len(image.shape) != 3:
        return image # Gambar sudah grayscale, tidak bisa displit
        
    b, g, r = cv2.split(image)
    blank = np.zeros_like(b)
    
    # Manipulasi channel array untuk menampilkan warna visual aslinya
    if target_channel == 'R':
        return cv2.merge([blank, blank, r])
    elif target_channel == 'G':
        return cv2.merge([blank, g, blank])
    elif target_channel == 'B':
        return cv2.merge([b, blank, blank])
        
    return image