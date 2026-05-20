import cv2
import numpy as np
import heapq
from collections import defaultdict

class HuffmanNode:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None

    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(frequencies):
    heap = [HuffmanNode(char, freq) for char, freq in frequencies.items()]
    heapq.heapify(heap)
    
    while len(heap) > 1:
        node1 = heapq.heappop(heap)
        node2 = heapq.heappop(heap)
        
        merged = HuffmanNode(None, node1.freq + node2.freq)
        merged.left = node1
        merged.right = node2
        
        heapq.heappush(heap, merged)
        
    return heap[0] if heap else None

def generate_codes(node, current_code, codes):
    if node is None:
        return
    
    if node.char is not None:
        codes[node.char] = current_code
        return
        
    generate_codes(node.left, current_code + "0", codes)
    generate_codes(node.right, current_code + "1", codes)

def apply(image, **kwargs):
    """
    Simulate Huffman compression to calculate compression ratio.
    Returns the visually lossless image and stats.
    """
    # Flatten image to 1D array of pixel values
    flat_image = image.flatten()
    
    # Calculate frequencies
    unique, counts = np.unique(flat_image, return_counts=True)
    frequencies = dict(zip(unique, counts))
    
    # Build tree and generate codes
    root = build_huffman_tree(frequencies)
    codes = {}
    generate_codes(root, "", codes)
    
    # Calculate compressed size in bits
    compressed_bits = sum(frequencies[char] * len(code) for char, code in codes.items())
    
    # Original size in bits (8 bits per pixel for grayscale, 24 for RGB)
    # Since numpy stores them as uint8, it's 8 bits per value in flat_image
    original_bits = len(flat_image) * 8
    
    # Dictionary overhead (roughly 1 byte for char, plus bits for code, but let's approximate)
    dict_overhead_bits = len(codes) * (8 + 16) # 8 bit char + avg 16 bit code
    total_compressed_bits = compressed_bits + dict_overhead_bits
    
    # We return the exact same image (lossless) but with the calculated stats
    return image, original_bits, total_compressed_bits
