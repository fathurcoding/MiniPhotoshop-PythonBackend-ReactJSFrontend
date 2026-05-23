import cv2
import numpy as np

def apply(image, target_channel='R', **kwargs):
    """
    Channel splitting (R, G, B)[cite: 60].
    Mengembalikan visualisasi warna channel array yang dimanipulasi[cite: 64].
    """
    if len(image.shape) != 3:
        return image # Gambar sudah grayscale, tidak bisa displit
        
    channels = cv2.split(image)
    if len(channels) >= 3:
        b, g, r = channels[0], channels[1], channels[2]
        blank = np.zeros_like(b)
        
        # Manipulasi channel array untuk menampilkan warna visual aslinya
        if target_channel == 'R':
            color_channels = [blank, blank, r]
        elif target_channel == 'G':
            color_channels = [blank, g, blank]
        elif target_channel == 'B':
            color_channels = [b, blank, blank]
        else:
            return image
            
        if len(channels) == 4:
            color_channels.append(channels[3]) # Keep alpha channel intact
            
        return cv2.merge(color_channels)
    return image