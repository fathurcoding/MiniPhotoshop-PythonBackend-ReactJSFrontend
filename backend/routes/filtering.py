# Layer: Routes
# Purpose: Expose filtering features as API endpoints. Connects HTTP requests to feature logic.

from fastapi import APIRouter, UploadFile, File
from backend.features.filtering import gaussian, median

router = APIRouter()

@router.post("/gaussian")
async def apply_gaussian(file: UploadFile = File(...)):
    return {"message": "Gaussian filter applied (placeholder)"}

@router.post("/median")
async def apply_median(file: UploadFile = File(...)):
    return {"message": "Median filter applied (placeholder)"}
