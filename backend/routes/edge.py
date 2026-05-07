import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from backend.features.edge import canny, sobel, prewitt, robert, laplacian, log

router = APIRouter()

def process_edge_image(file_bytes, method, **kwargs):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")
        
    if method == 'canny':
        result_img = canny.apply(img, **kwargs)
    elif method == 'sobel':
        result_img = sobel.apply(img, **kwargs)
    elif method == 'prewitt':
        result_img = prewitt.apply(img, **kwargs)
    elif method == 'robert':
        result_img = robert.apply(img, **kwargs)
    elif method == 'laplacian':
        result_img = laplacian.apply(img, **kwargs)
    elif method == 'log':
        result_img = log.apply(img, **kwargs)
    else:
        return Response(status_code=400, content="Invalid edge detection method")
    
    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")
        
    return Response(content=encoded_img.tobytes(), media_type="image/png")

@router.post("/apply")
async def apply_edge(
    file: UploadFile = File(...), 
    method: str = Form(...),
    threshold1: float = Form(100),
    threshold2: float = Form(200),
    ksize: int = Form(3),
    sigma: float = Form(1.0)
):
    file_bytes = await file.read()
    return process_edge_image(
        file_bytes, 
        method, 
        threshold1=threshold1, 
        threshold2=threshold2, 
        ksize=ksize, 
        sigma=sigma
    )
