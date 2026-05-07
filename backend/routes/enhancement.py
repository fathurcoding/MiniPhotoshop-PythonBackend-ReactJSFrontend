import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from backend.features.enhancement import brightness, contrast, histogram_eq, threshold

router = APIRouter()

def process_enhanced_image(file_bytes, func, **kwargs):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")
        
    result_img = func(img, **kwargs)
    
    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")
        
    return Response(content=encoded_img.tobytes(), media_type="image/png")

@router.post("/brightness")
async def apply_brightness(file: UploadFile = File(...), value: float = Form(...)):
    # Placeholder implementation if needed, but keeping existing logic structure
    return {"message": "Brightness functionality implementation required"}

@router.post("/contrast")
async def apply_contrast(file: UploadFile = File(...), value: float = Form(...)):
    return {"message": "Contrast functionality implementation required"}

@router.post("/threshold")
async def apply_threshold(
    file: UploadFile = File(...), 
    threshold_value: float = Form(128),
    method: str = Form('manual')
):
    file_bytes = await file.read()
    return process_enhanced_image(file_bytes, threshold.apply, threshold_value=threshold_value, method=method)

@router.post("/histogram_eq")
async def apply_histogram_eq(file: UploadFile = File(...)):
    return {"message": "Histogram equalization functionality implementation required"}
