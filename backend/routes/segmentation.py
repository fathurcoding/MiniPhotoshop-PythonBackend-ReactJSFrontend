import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from backend.features.segmentation import thresholding, edge_based, region_based

router = APIRouter()

def process_image(file_bytes, func, **kwargs):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")
        
    result_img = func(img, **kwargs)
    
    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")
        
    return Response(content=encoded_img.tobytes(), media_type="image/png")

@router.post("/threshold")
async def apply_segment_threshold(file: UploadFile = File(...)):
    file_bytes = await file.read()
    return process_image(file_bytes, thresholding.apply)

@router.post("/edge")
async def apply_segment_edge(file: UploadFile = File(...)):
    file_bytes = await file.read()
    return process_image(file_bytes, edge_based.apply)

@router.post("/region")
async def apply_segment_region(
    file: UploadFile = File(...),
    k: int = Form(3)
):
    file_bytes = await file.read()
    return process_image(file_bytes, region_based.apply, k=k)
