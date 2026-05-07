from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import enhancement, transform, filtering, edge, compression, analysis, morphology

app = FastAPI(title="Image Processing API", description="Modular FastAPI application for Image Processing", version="1.0.0")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production (e.g., ["http://localhost:5173"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers with their respective prefixes
app.include_router(enhancement.router, prefix="/enhancement", tags=["Enhancement"])
app.include_router(transform.router, prefix="/transform", tags=["Transform"])
app.include_router(filtering.router, prefix="/filtering", tags=["Filtering"])
app.include_router(edge.router, prefix="/edge", tags=["Edge Detection"])
app.include_router(compression.router, prefix="/compression", tags=["Compression"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(morphology.router, prefix="/morphology", tags=["Morphology"])

@app.get("/")
def root():
    return {"message": "Welcome to the Image Processing API"}
