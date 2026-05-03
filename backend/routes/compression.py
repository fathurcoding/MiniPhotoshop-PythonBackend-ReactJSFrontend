# Layer: Routes
# Purpose: Expose compression features as API endpoints. Connects HTTP requests to feature logic.

from fastapi import APIRouter, UploadFile, File
from backend.features.compression import rle, huffman

router = APIRouter()

@router.post("/rle")
async def apply_rle(file: UploadFile = File(...)):
    return {"message": "RLE compression applied (placeholder)"}

@router.post("/huffman")
async def apply_huffman(file: UploadFile = File(...)):
    return {"message": "Huffman compression applied (placeholder)"}
