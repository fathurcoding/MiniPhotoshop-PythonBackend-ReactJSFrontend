# Layer: Routes
# Purpose: Expose enhancement features as API endpoints. Connects HTTP requests to feature logic.

from fastapi import APIRouter, UploadFile, File
from backend.features.enhancement import brightness, contrast, histogram_eq

router = APIRouter()

@router.post("/brightness")
async def apply_brightness(file: UploadFile = File(...)):
    # Call corresponding feature.apply()
    # brightness.apply(image_data)
    return {"message": "Brightness enhancement applied (placeholder)"}

@router.post("/contrast")
async def apply_contrast(file: UploadFile = File(...)):
    return {"message": "Contrast enhancement applied (placeholder)"}

@router.post("/histogram_eq")
async def apply_histogram_eq(file: UploadFile = File(...)):
    return {"message": "Histogram equalization applied (placeholder)"}
