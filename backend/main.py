from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.qa_pipeline import run_pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequirementRequest(BaseModel):
    requirement: str

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/generate")
async def generate(req: RequirementRequest):
    if not req.requirement.strip():
        raise HTTPException(status_code=400, detail="Requirement cannot be empty.")
    try:
        result = await run_pipeline(req.requirement)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))