# Layer: Routes
# Purpose: Expose analysis features as API endpoints. Connects HTTP requests to feature logic.

from fastapi import APIRouter, UploadFile, File
from backend.features.analysis import histogram

router = APIRouter()

@router.post("/histogram")
async def calculate_histogram(file: UploadFile = File(...)):
    # Call corresponding feature.apply()
    # histogram.apply(image_data)
    return {"message": "Histogram calculated (placeholder)"}
