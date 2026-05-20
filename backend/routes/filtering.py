# Layer: Routes
# Purpose: Expose filtering features as API endpoints. Connects HTTP requests to feature logic.

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
# Import tambahan filter salt_pepper_removal yang baru kita buat
from backend.features.filtering import gaussian, median, salt_pepper_removal

router = APIRouter()

def process_filtered_image(file_bytes, func, **kwargs):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")
        
    result_img = func(img, **kwargs)
    
    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")
        
    return Response(content=encoded_img.tobytes(), media_type="image/png")

@router.post("/gaussian")
async def apply_gaussian(
    file: UploadFile = File(...), 
    kernel_size: float = Form(5), 
    sigma: float = Form(1.0)
):
    file_bytes = await file.read()
    return process_filtered_image(file_bytes, gaussian.apply, kernel_size=kernel_size, sigma=sigma)

@router.post("/median")
async def apply_median(
    file: UploadFile = File(...), 
    kernel_size: float = Form(5)
):
    file_bytes = await file.read()
    return process_filtered_image(file_bytes, median.apply, kernel_size=kernel_size)

@router.post("/noise_removal")
async def apply_noise_removal(file: UploadFile = File(...)):
    file_bytes = await file.read()
    return process_filtered_image(file_bytes, salt_pepper_removal.apply)