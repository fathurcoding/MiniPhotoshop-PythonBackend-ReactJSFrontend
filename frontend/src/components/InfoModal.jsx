import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const infoContent = {
  enhancement: {
    title: 'Image Enhancement',
    desc: 'Fitur untuk menyesuaikan pencahayaan, kontras, serta kehalusan/ketajaman gambar.',
    actions: [
      { name: 'Slider Brightness & Contrast', detail: 'Geser slider Brightness untuk menerangkan/menggelapkan gambar. Geser slider Contrast untuk membuat perbedaan warna gelap dan terang semakin mencolok. Klik "Apply Enhancements" untuk menyimpan perubahan.' },
      { name: 'Tombol Histogram Equalization', detail: 'Klik tombol ini agar sistem secara otomatis meratakan intensitas cahaya. Sangat berguna untuk gambar yang terlalu gelap atau terlalu terang (pudar) agar detailnya terlihat jelas.' },
      { name: 'Tombol Apply Smoothing', detail: 'Gunakan slider untuk mengatur besaran rata-rata piksel (misal 5x5), lalu klik tombol ini untuk melembutkan gambar.' },
      { name: 'Tombol Apply Sharpening', detail: 'Klik untuk mempertajam tepi-tepi (edge) pada gambar yang terlihat buram atau blur, sehingga detail objek menjadi lebih tegas.' }
    ]
  },
  edge_binary: {
    title: 'Edge & Binary / Morphology',
    desc: 'Mengubah gambar menjadi format hitam-putih biner, mendeteksi garis batas objek, dan mengubah bentuk geometris objek biner.',
    actions: [
      { name: 'Tombol Apply Threshold', detail: 'Ubah gambar menjadi hitam-putih. Gunakan slider (0-255) untuk batas manual. Centang kotak "Otsu" jika ingin AI mencari batas otomatis terbaik, lalu klik tombol ini.' },
      { name: 'Tombol Apply Edge Detection', detail: 'Mendeteksi garis tepi. Pilih "Edge Method", lalu pilih "Kernel Size" untuk ketebalan garis, kemudian klik tombol ini.' },
      { name: 'Pilihan Edge Method', detail: 'Sobel & Prewitt: Tepi tebal dan kasar. Robert: Garis tepi diagonal tipis. Canny: Algoritma canggih untuk tepi super halus dan akurat. Laplacian & LoG: Mencari tepi menyebar (menangkap tepi yang sangat kompleks).' },
      { name: 'Bagian Morphology (Erosion & Dilation)', detail: 'Digunakan untuk memanipulasi bentuk objek biner. Atur "Size" dan "Iterations" (jumlah pengulangan). Klik tombol "Erosion" untuk mengikis/menipiskan objek putih, atau klik "Dilation" untuk menebalkan/menyambung garis objek putih yang terputus.' },
      { name: 'Pilihan Morphology Shape', detail: 'Menentukan bentuk kuas. Rect: Bentuk Kotak (merata). Cross: Bentuk Silang (fokus horizontal-vertikal). Ellipse: Bentuk Lingkaran (paling natural dan halus).' }
    ]
  },
  restoration: {
    title: 'Image Restoration',
    desc: 'Memperbaiki gambar yang mengalami degradasi atau kerusakan akibat gangguan teknis kamera.',
    actions: [
      { name: 'Tombol Apply Gaussian Blur', detail: 'Gunakan slider "Kernel" (luas area blur) dan "Sigma" (tingkat keburaman) lalu klik tombol ini untuk memberi efek blur yang halus pada gambar.' },
      { name: 'Tombol Apply Median Filter', detail: 'Gunakan slider "Kernel" lalu klik tombol ini. Sangat ampuh untuk menghilangkan cacat seperti "Salt & Pepper noise" (bintik-bintik putih/hitam acak) secara halus.' },
      { name: 'Tombol Remove Salt & Pepper', detail: 'Klik tombol merah ini untuk menjalankan algoritma noise removal cepat (FastNlMeans) yang mencari pola berulang pada gambar untuk menghapus bintik-bintik kasar tanpa merusak ketajaman batas (edge) objek.' }
    ]
  },
  color: {
    title: 'Color Processing',
    desc: 'Manipulasi filter ruang warna dan pemisahan kanal warna pada gambar.',
    actions: [
      { name: 'Tombol To Grayscale', detail: 'Klik untuk meratakan seluruh nilai warna (Merah, Hijau, Biru) menjadi warna keabuan (hitam-putih non-biner).' },
      { name: 'Tombol Red, Green, Blue', detail: 'Klik salah satu tombol ini untuk hanya menampilkan intensitas dari satu kanal warna saja.' },
      { name: 'Slider Hue Shift', detail: 'Geser slider (-90° hingga 90°) untuk memutar roda warna. Secara instan akan mengubah warna asli objek (misal: baju merah menjadi hijau).' },
      { name: 'Slider Saturation', detail: 'Geser slider untuk mengubah tingkat kepekatan warna. Geser ke 0x untuk memudarkan warna, atau geser ke kanan untuk membuat warna sangat "ngejreng" (vibrant).' }
    ]
  },
  segmentation: {
    title: 'Image Segmentation',
    desc: 'Membagi gambar menjadi beberapa kelompok area (region) yang memiliki kemiripan warna atau pola.',
    actions: [
      { name: 'Tombol Threshold Based (Otsu)', detail: 'Menggunakan perhitungan Otsu Masking untuk memotong objek utama (foreground) dan membuang latar belakangnya menjadi hitam.' },
      { name: 'Tombol Edge Based (Canny)', detail: 'Mendeteksi kontur terluar dari objek dan menggunakan batas tersebut untuk memotong objek secara rapi dari latar belakangnya.' },
      { name: 'Tombol Apply Region Segmentation', detail: 'Tentukan jumlah kelompok warna (K Clusters) menggunakan slider, lalu klik tombol ini. Algoritma K-Means akan menyederhanakan seluruh gambar hanya menjadi K warna saja (efek seperti poster kartun).' }
    ]
  },
  machine_learning: {
    title: 'Machine Learning (CNN)',
    desc: 'Menggunakan kecerdasan buatan (Deep Learning) untuk memahami dan menebak isi dari gambar.',
    actions: [
      { name: 'Dropdown Model Type', detail: 'Pilih "CNN dari Nol" untuk menggunakan model ringan buatan kita sendiri (mengenali 101 objek dasar). Pilih "Pretrained (MobileNet-SSD)" untuk menggunakan model industri berat yang sangat pintar.' },
      { name: 'Tombol Detect Objects (CNN)', detail: 'Klik tombol ini untuk mengirim gambar ke otak AI di belakang layar. AI akan membaca piksel, menebak probabilitas kecocokan, dan menggambar kotak kuning (bounding box) beserta persentase keyakinannya tepat di atas objek.' }
    ]
  },
  histogram_analysis: {
    title: 'Histogram Analysis',
    desc: 'Grafik statistik yang menunjukkan distribusi intensitas piksel (cahaya/warna) dari sebuah citra.',
    actions: [
      { name: 'Sumbu Horizontal (X)', detail: 'Menunjukkan nilai intensitas warna, dari 0 (gelap total/hitam) di sebelah kiri, hingga 255 (terang benderang/putih) di sebelah kanan.' },
      { name: 'Sumbu Vertikal (Y)', detail: 'Menunjukkan seberapa banyak (jumlah) piksel yang memiliki nilai intensitas tersebut di dalam gambar.' },
      { name: 'Grafik Garis Warna', detail: 'Garis Merah, Hijau, dan Biru merepresentasikan sebaran masing-masing warna RGB. Garis Hitam merepresentasikan tingkat kecerahan global (Grayscale) dari gambar.' },
      { name: 'Original vs Current', detail: 'Original Image menunjukkan grafik histogram citra saat pertama kali dibuka. Current Image menunjukkan perubahan grafik setelah Anda mengaplikasikan filter (contoh: Histogram Equalization akan membuat grafik yang sebelumnya menumpuk menjadi menyebar rata).' }
    ]
  }
};

function InfoModal({ infoKey, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!infoKey || !infoContent[infoKey]) return null;

  const data = infoContent[infoKey];

  return (
    <div className="modal-overlay" onMouseDown={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-dialog"
        onMouseDown={e => e.stopPropagation()}
        style={{ maxWidth: '500px', width: '90%' }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {data.title}
          </div>
          <button className="icon-btn" onClick={onClose} style={{ padding: '4px', margin: 0, border: 'none', background: 'transparent' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-content" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-color)', marginBottom: '16px', lineHeight: 1.5 }}>
            {data.desc}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.actions.map((act, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '6px',
                borderLeft: '3px solid var(--primary-color)'
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--primary-color)' }}>
                  {act.name}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {act.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '12px 20px' }}>
          <button className="primary" onClick={onClose} style={{ width: '100%' }}>Mengerti</button>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
