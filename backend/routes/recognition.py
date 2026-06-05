from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import Response
import io

# Import from scratch CNN
from backend.features.recognition.cnn_from_scratch import predict_image

# Import model pretrained OpenCV
from backend.features.recognition.pretrained_fallback import detect_objects_pretrained

router = APIRouter()


@router.post("/detect")
async def detect_objects(file: UploadFile = File(...), model_type: str = Form("scratch")):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await file.read()

    if model_type == "pretrained":
        # 2. Menggunakan OpenCV MobileNet-SSD Pretrained
        success, result_bytes = detect_objects_pretrained(image_bytes)
    else:
        # 1. Menggunakan Model CNN dari Nol (From Scratch) [Default]
        success, result_bytes = predict_image(image_bytes)

    if not success:
        # Jika gagal (misal PyTorch tidak diinstall atau error lain), kembalikan error string
        error_msg = (
            result_bytes.decode("utf-8")
            if isinstance(result_bytes, bytes)
            else str(result_bytes)
        )
        raise HTTPException(status_code=500, detail=f"Recognition failed: {error_msg}")

    return Response(content=result_bytes, media_type="image/jpeg")
