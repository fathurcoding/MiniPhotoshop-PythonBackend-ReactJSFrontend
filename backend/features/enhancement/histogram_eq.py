import cv2

def apply(image, **kwargs):
    """Apply histogram equalization to the image."""
    # Jika gambar berwarna (3 channel BGR), ekualisasi komponen Luminance (Y)
    if len(image.shape) == 3:
        ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
        channels = list(cv2.split(ycrcb))
        channels[0] = cv2.equalizeHist(channels[0])
        ycrcb = cv2.merge(channels)
        return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)
    else:
        return cv2.equalizeHist(image)