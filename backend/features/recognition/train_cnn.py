import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
import os
import sys

# Tambahkan direktori root backend ke system path agar bisa import cnn_from_scratch
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from features.recognition.cnn_from_scratch import SimpleCNN


def train():
    # 1. Konfigurasi Device & Hyperparameters
    # Menggunakan GPU jika tersedia, jika tidak maka CPU (Mendukung VRAM 2GB)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Menggunakan device: {device}")

    # Batch size diatur ke 16 agar tidak menyebabkan Out of Memory di GPU 2GB VRAM.
    batch_size = 16
    # Naikkan jumlah putaran (epoch) agar model bisa belajar lebih dalam dan akurasi maksimal.
    # 15 epoch adalah angka yang cukup baik untuk mendapatkan akurasi tinggi tanpa memakan waktu berhari-hari.
    num_epochs = 15
    learning_rate = 0.001

    # 2. Persiapan Data
    # Caltech-101 memiliki beberapa gambar hitam-putih (grayscale), jadi kita harus
    # memaksa semuanya menjadi RGB (3 channel warna) agar tidak error saat dinormalisasi.
    transform = transforms.Compose(
        [
            transforms.Lambda(lambda x: x.convert('RGB')),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    print("Mempersiapkan dataset Caltech-101 (Membaca file manual)...")
    
    # Simpan dataset langsung ke folder project agar mudah dihapus (backend/dataset_caltech101)
    dataset_dir = os.path.join(backend_dir, 'dataset_caltech101')
    os.makedirs(dataset_dir, exist_ok=True)
    
    # Kita set download=False karena Anda akan mengekstrak manual. 
    # Jika foldernya benar, PyTorch akan otomatis membacanya.
    trainset = torchvision.datasets.Caltech101(root=dataset_dir, download=False, transform=transform)
    
    # Caltech101 memiliki 101 kategori benda
    num_classes = 101
    
    # Simpan daftar nama kelas (kategori) ke file json agar bisa dibaca oleh cnn_from_scratch.py
    import json
    categories_path = os.path.join(os.path.dirname(__file__), 'caltech101_classes.json')
    try:
        with open(categories_path, 'w') as f:
            json.dump(trainset.categories, f)
        print(f"Berhasil menyimpan 101 daftar kategori ke {categories_path}")
    except Exception as e:
        print(f"Gagal menyimpan kategori: {e}")
    
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=batch_size, shuffle=True, num_workers=0)
    
    # 3. Inisialisasi Model, Loss, dan Optimizer
    model = SimpleCNN(num_classes=num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    print("Mulai proses training...")

    # 4. Training Loop
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for i, data in enumerate(trainloader, 0):
            inputs, labels = data[0].to(device), data[1].to(device)

            # Zero the parameter gradients
            optimizer.zero_grad()

            # Forward + backward + optimize
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            # Hitung statistik
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

            # Print setiap 100 mini-batches
            if i % 100 == 99:
                print(
                    f"[{epoch + 1}, {i + 1:5d}] Loss: {running_loss / 100:.3f} | Acc: {100 * correct / total:.2f}%"
                )
                running_loss = 0.0

        print(
            f"Epoch {epoch + 1} Selesai. Total Accuracy: {100 * correct / total:.2f}%"
        )

    print("Training Selesai!")

    # 5. Simpan Bobot Model
    models_dir = os.path.join(backend_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    save_path = os.path.join(models_dir, "cnn_weights.pth")

    torch.save(model.state_dict(), save_path)
    print(f"Bobot model berhasil disimpan ke: {save_path}")


if __name__ == "__main__":
    train()
