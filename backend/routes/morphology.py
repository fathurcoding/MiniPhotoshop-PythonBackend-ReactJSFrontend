import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from backend.features.morphology import morphology_logic

router = APIRouter()


def process_morph_image(file_bytes, operation, **kwargs):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        return Response(status_code=400, content="Invalid image format")

    if operation == "erosion":
        result_img = morphology_logic.apply_erosion(img, **kwargs)
    elif operation == "dilation":
        result_img = morphology_logic.apply_dilation(img, **kwargs)
    else:
        return Response(status_code=400, content="Invalid morphological operation")

    success, encoded_img = cv2.imencode(".png", result_img)
    if not success:
        return Response(status_code=500, content="Failed to encode image")

    return Response(content=encoded_img.tobytes(), media_type="image/png")


@router.post("/erosion")
async def apply_erosion(
    file: UploadFile = File(...),
    kernel_size: int = Form(3),
    shape: str = Form("rect"),
    iterations: int = Form(1),
):
    file_bytes = await file.read()
    return process_morph_image(
        file_bytes,
        "erosion",
        kernel_size=kernel_size,
        shape=shape,
        iterations=iterations,
    )


@router.post("/dilation")
async def apply_dilation(
    file: UploadFile = File(...),
    kernel_size: int = Form(3),
    shape: str = Form("rect"),
    iterations: int = Form(1),
):
    file_bytes = await file.read()
    return process_morph_image(
        file_bytes,
        "dilation",
        kernel_size=kernel_size,
        shape=shape,
        iterations=iterations,
    )
