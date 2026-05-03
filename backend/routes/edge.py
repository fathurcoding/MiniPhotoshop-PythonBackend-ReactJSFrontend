# Layer: Routes
# Purpose: Expose edge detection features as API endpoints. Connects HTTP requests to feature logic.

from fastapi import APIRouter, UploadFile, File
from backend.features.edge import sobel, canny

router = APIRouter()

@router.post("/sobel")
async def apply_sobel(file: UploadFile = File(...)):
    return {"message": "Sobel edge detection applied (placeholder)"}

@router.post("/canny")
async def apply_canny(file: UploadFile = File(...)):
    return {"message": "Canny edge detection applied (placeholder)"}
