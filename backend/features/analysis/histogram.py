# Layer: Features - Analysis
# Purpose: Calculate the histogram of an image and return as a matplotlib plot image.

import cv2
import numpy as np
import matplotlib
matplotlib.use('Agg') # Use non-interactive backend
import matplotlib.pyplot as plt
import io

def apply(image, **kwargs):
    """
    Calculate the image histogram and plot it using matplotlib.
    Returns the bytes of a PNG image containing the plot.
    """
    if image is None:
        return None

    # Set up matplotlib figure
    # Define a dark theme or light theme? Let's use a nice dark theme to match the UI!
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(4, 3), dpi=100)
    fig.patch.set_facecolor('#1e1e1e')
    ax.set_facecolor('#1e1e1e')
    
    # Optional: adjust borders/axes to look clean
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_color('#555555')
    ax.spines['left'].set_color('#555555')
    ax.tick_params(colors='#888888', labelsize=8)
    
    # Cek apakah image punya alpha channel, hapus alpha untuk histogram warna
    has_alpha = len(image.shape) == 3 and image.shape[2] == 4
    if has_alpha:
        # Ignore alpha channel for histogram
        img_data = image[:, :, :3]
    else:
        img_data = image

    # Jika gambar berwarna (3 channel: BGR)
    if len(img_data.shape) == 3:
        colors = ('b', 'g', 'r')
        for i, color in enumerate(colors):
            hist = cv2.calcHist([img_data], [i], None, [256], [0, 256])
            ax.plot(hist, color=color, linewidth=1.5, alpha=0.8)
            ax.fill_between(np.arange(256), hist.flatten(), color=color, alpha=0.1)
        ax.set_title('RGB Histogram', color='#cccccc', fontsize=10, pad=10)
        
    # Jika gambar grayscale (2D array atau 1 channel)
    else:
        hist = cv2.calcHist([img_data], [0], None, [256], [0, 256])
        ax.plot(hist, color='white', linewidth=1.5, alpha=0.8)
        ax.fill_between(np.arange(256), hist.flatten(), color='white', alpha=0.2)
        ax.set_title('Grayscale Histogram', color='#cccccc', fontsize=10, pad=10)

    ax.set_xlim([0, 256])
    ax.set_yticks([]) # Hide Y-axis numbers to save space and keep it clean
    
    plt.tight_layout()
    
    # Save figure to memory
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', transparent=True)
    plt.close(fig)
    buf.seek(0)
    
    return buf.read()