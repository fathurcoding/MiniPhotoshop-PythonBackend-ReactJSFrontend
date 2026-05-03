import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response

from backend.features.transform import rotate, resize, crop, translate, flip

router = APIRouter()

def process_image(file_bytes, func, **kwargs):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")
        
    result = func(img, **kwargs)
    
    shift_x, shift_y = 0, 0
    if isinstance(result, tuple) and len(result) == 3:
        result_img, shift_x, shift_y = result
    else:
        result_img = result
    
    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")
        
    headers = {
        "X-Shift-X": str(shift_x),
        "X-Shift-Y": str(shift_y),
        "Access-Control-Expose-Headers": "X-Shift-X, X-Shift-Y"
    }
        
    return Response(content=encoded_img.tobytes(), media_type="image/png", headers=headers)

@router.post("/rotate")
async def apply_rotate(file: UploadFile = File(...), degree: float = Form(...)):
    file_bytes = await file.read()
    return process_image(file_bytes, rotate.apply, degree=degree)

@router.post("/resize")
async def apply_resize(
    file: UploadFile = File(...), 
    width: int = Form(...), 
    height: int = Form(...),
    tx: float = Form(0),
    ty: float = Form(0)
):
    file_bytes = await file.read()
    return process_image(file_bytes, resize.apply, width=width, height=height, tx=tx, ty=ty)

@router.post("/crop")
async def apply_crop(
    file: UploadFile = File(...), 
    startX: int = Form(...), 
    startY: int = Form(...), 
    endX: int = Form(...), 
    endY: int = Form(...)
):
    file_bytes = await file.read()
    return process_image(file_bytes, crop.apply, start_x=startX, start_y=startY, end_x=endX, end_y=endY)

@router.post("/translate")
async def apply_translate(file: UploadFile = File(...), tx: float = Form(...), ty: float = Form(...)):
    file_bytes = await file.read()
    return process_image(file_bytes, translate.apply, tx=tx, ty=ty)

@router.post("/flip")
async def apply_flip(file: UploadFile = File(...), direction: str = Form(...)):
    file_bytes = await file.read()
    return process_image(file_bytes, flip.apply, direction=direction)
