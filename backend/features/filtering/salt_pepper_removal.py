import cv2

def apply(image, **kwargs):
    """
    Noise removal khusus untuk salt & pepper.
    Secara teknis menggunakan Median Filter dengan ukuran kernel optimal (3x3).
    """
    return cv2.medianBlur(image, 3)