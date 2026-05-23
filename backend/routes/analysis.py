# Layer: Routes
# Purpose: Expose analysis and color features as API endpoints. Connects HTTP requests to feature logic.

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
# Import histogram bawaan temanmu, dan tambahkan fitur warna baru yang sudah kita buat
from backend.features.analysis import histogram, grayscale, channel_split, color_adjust

router = APIRouter()

def process_color_image(file_bytes, func, **kwargs):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")

    result_img = func(img, **kwargs)

    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")

    return Response(content=encoded_img.tobytes(), media_type="image/png")

@router.post("/histogram")
async def calculate_histogram(file: UploadFile = File(...)):
    file_bytes = await file.read()
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")
        
    png_bytes = histogram.apply(img)
    if png_bytes is None:
        return Response(status_code=500, content="Failed to generate histogram")
        
    return Response(content=png_bytes, media_type="image/png")

@router.post("/grayscale")
async def apply_grayscale(file: UploadFile = File(...)):
    file_bytes = await file.read()
    return process_color_image(file_bytes, grayscale.apply)

@router.post("/channel_split")
async def apply_channel_split(file: UploadFile = File(...), channel: str = Form('R')):
    file_bytes = await file.read()
    return process_color_image(file_bytes, channel_split.apply, target_channel=channel)

@router.post("/color_adjustment")
async def apply_color_adjustment(
    file: UploadFile = File(...), 
    hue_shift: float = Form(0), 
    saturation_scale: float = Form(1.0)
):
    file_bytes = await file.read()
    return process_color_image(file_bytes, color_adjust.apply, hue_shift=hue_shift, saturation_scale=saturation_scale)