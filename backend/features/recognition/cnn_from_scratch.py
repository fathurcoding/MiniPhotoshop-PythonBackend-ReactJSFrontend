import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import io
import os
import cv2
import numpy as np


# Definisi Arsitektur CNN dari Nol (From Scratch)
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(SimpleCNN, self).__init__()
        # Conv Layer 1
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)
        # Conv Layer 2
        self.conv2 = nn.Conv2d(
            in_channels=16, out_channels=32, kernel_size=3, padding=1
        )
        # Conv Layer 3
        self.conv3 = nn.Conv2d(
            in_channels=32, out_channels=64, kernel_size=3, padding=1
        )

        # Max Pooling
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # Fully Connected Layers
        # Asumsi input size: 224x224
        # Setelah 3x pool (224 -> 112 -> 56 -> 28), ukuran feature map = 64 * 28 * 28 = 50176
        self.fc1 = nn.Linear(64 * 28 * 28, 512)
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = x.view(-1, 64 * 28 * 28)  # Flatten
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x


import json

# Mencoba memuat class names untuk Caltech-101 yang di-generate dari proses training
categories_path = os.path.join(os.path.dirname(__file__), 'caltech101_classes.json')
try:
    with open(categories_path, 'r') as f:
        CLASS_NAMES = json.load(f)
except:
    # Jika belum di-training atau JSON tidak ada, fallback ke dummy class
    CLASS_NAMES = [f"Objek-{i}" for i in range(101)]

# Inisialisasi Model
try:
    # Menggunakan 101 kelas (Untuk dataset Caltech-101)
    model = SimpleCNN(num_classes=101)

    # Coba muat bobot model jika sudah ada hasil training
    import os

    weights_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "models", "cnn_weights.pth"
    )
    if os.path.exists(weights_path):
        model.load_state_dict(
            torch.load(weights_path, map_location=torch.device("cpu"))
        )
        print("Berhasil memuat bobot model cnn_weights.pth")
    else:
        print(
            "Bobot model tidak ditemukan, menggunakan model acak (belum di-training)."
        )

    model.eval()  # Set ke mode evaluasi
except Exception as e:
    model = None
    print(f"Gagal memuat model: {e}")


def predict_image(image_bytes: bytes):
    """
    Menerima gambar berupa bytes, memproses dengan CNN dari nol,
    menggambar label prediksi, dan mengembalikan byte gambar.
    """
    if model is None:
        return False, b"PyTorch tidak tersedia atau gagal memuat model CNN dari nol."

    try:
        # Load image via PIL
        image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Preprocessing standard untuk CNN
        transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                ),
            ]
        )

        input_tensor = transform(image_pil).unsqueeze(0)

        # Inferensi
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = F.softmax(output[0], dim=0)
            max_prob, predicted_idx = torch.max(probabilities, 0)

            label = CLASS_NAMES[predicted_idx.item()]
            confidence = max_prob.item() * 100

        # Draw on image using OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_cv is None:
            return False, b"Invalid image"

        # Sesuaikan ukuran font dengan lebar gambar
        (h, w) = img_cv.shape[:2]
        font_scale = w / 800.0
        if font_scale < 0.5:
            font_scale = 0.5
        if font_scale > 1.5:
            font_scale = 1.5

        text = f"{label} ({confidence:.1f}%)"

        # Gambar background hitam transparan untuk teks agar lebih terbaca
        (text_w, text_h), _ = cv2.getTextSize(
            text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 2
        )
        cv2.rectangle(
            img_cv, (20, 20), (20 + text_w + 20, 20 + text_h + 20), (0, 0, 0), -1
        )
        cv2.putText(
            img_cv,
            text,
            (30, 20 + text_h + 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )

        _, encoded_img = cv2.imencode(".jpg", img_cv)
        return True, encoded_img.tobytes()

    except Exception as e:
        return False, str(e).encode("utf-8")
