import cv2
import numpy as np
import os
import urllib.request
from typing import Tuple

# Paths for the models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
PROTOTXT_PATH = os.path.join(MODEL_DIR, "MobileNetSSD_deploy.prototxt")
MODEL_PATH = os.path.join(MODEL_DIR, "MobileNetSSD_deploy.caffemodel")

# URLs for downloading MobileNetSSD if they don't exist
PROTOTXT_URL = "https://raw.githubusercontent.com/chuanqi305/MobileNet-SSD/master/voc/MobileNetSSD_deploy.prototxt"
MODEL_URL = "https://huggingface.co/spaces/Imran606/cds/resolve/main/MobileNetSSD_deploy.caffemodel"

# MobileNetSSD Classes
CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

# Gunakan seed agar warna selalu konsisten untuk tiap kelas
np.random.seed(42)
COLORS = np.random.uniform(0, 255, size=(len(CLASSES), 3))

def ensure_model_exists():
    """Ensure that the model files exist, download if not."""
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    if not os.path.exists(PROTOTXT_PATH):
        print("Downloading MobileNetSSD prototxt...")
        urllib.request.urlretrieve(PROTOTXT_URL, PROTOTXT_PATH)
        
    if not os.path.exists(MODEL_PATH):
        print("Downloading MobileNetSSD caffemodel...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)

def detect_objects_pretrained(image_bytes: bytes) -> Tuple[bool, bytes]:
    """
    Mendeteksi objek menggunakan OpenCV's DNN module dan MobileNet-SSD.
    Menggambar bounding boxes pada gambar dan mereturn byte gambar hasil.
    """
    try:
        ensure_model_exists()
        
        # Load the network
        net = cv2.dnn.readNetFromCaffe(PROTOTXT_PATH, MODEL_PATH)
        
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return False, b"Invalid image"
            
        (h, w) = image.shape[:2]
        
        # Preprocess image to a blob (ukuran 300x300 sesuai kebutuhan MobileNet-SSD)
        blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 0.007843, (300, 300), 127.5)
        
        # Pass the blob through the network
        net.setInput(blob)
        detections = net.forward()
        
        # Loop over the detections
        for i in np.arange(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            
            # Filter deteksi dengan confidence > 50%
            if confidence > 0.5:
                idx = int(detections[0, 0, i, 1])
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (startX, startY, endX, endY) = box.astype("int")
                
                # Gambar kotak dan teks pada gambar
                label = f"{CLASSES[idx]}: {confidence * 100:.2f}%"
                cv2.rectangle(image, (startX, startY), (endX, endY), COLORS[idx], 2)
                y = startY - 15 if startY - 15 > 15 else startY + 15
                cv2.putText(image, label, (startX, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)
                
        # Encode kembali ke format JPEG
        _, encoded_img = cv2.imencode('.jpg', image)
        return True, encoded_img.tobytes()
        
    except Exception as e:
        return False, str(e).encode('utf-8')
