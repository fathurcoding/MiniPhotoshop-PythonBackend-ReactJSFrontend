import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, Response
from backend.features.compression import huffman, rle, lzw, arithmetic, jpeg_sim

router = APIRouter()

COMPRESSION_METHODS = {
    'huffman': huffman.apply,
    'rle': rle.apply,
    'lzw': lzw.apply,
    'arithmetic': arithmetic.apply,
    'jpeg': jpeg_sim.apply
}

@router.post("/apply")
async def apply_compression(
    file: UploadFile = File(...), 
    method: str = Form(...),
    quality: int = Form(50)
):
    if method not in COMPRESSION_METHODS:
        return Response(status_code=400, content="Invalid compression method")
        
    file_bytes = await file.read()
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    
    if img is None:
        return Response(status_code=400, content="Invalid image format")
        
    # Apply compression algorithm
    func = COMPRESSION_METHODS[method]
    result_img, orig_bits, comp_bits = func(img, quality=quality)
    
    # Calculate bytes for header response
    orig_bytes = orig_bits // 8
    comp_bytes = comp_bits // 8
    ratio = orig_bytes / comp_bytes if comp_bytes > 0 else 0
    
    # Encode result image to send back. We use PNG to ensure we don't introduce 
    # additional lossy compression artifacts during transit, so the user only sees
    # exactly what our algorithm produced.
    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")
        
    headers = {
        "X-Original-Size": str(orig_bytes),
        "X-Compressed-Size": str(comp_bytes),
        "X-Compression-Ratio": f"{ratio:.2f}",
        "Access-Control-Expose-Headers": "X-Original-Size, X-Compressed-Size, X-Compression-Ratio"
    }
        
    return Response(content=encoded_img.tobytes(), media_type="image/png", headers=headers)
