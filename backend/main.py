from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.qa_pipeline import run_pipeline, analyze_selectors

app = FastAPI(title="QA AI Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequirementRequest(BaseModel):
    requirement: str
    openai_key: str = ""

class SelectorRequest(BaseModel):
    html_content: str
    page_name: str = "Page"
    openai_key: str = ""

@app.get("/")
def health():
    return {"status": "ok", "message": "QA AI Assistant API is running"}

@app.post("/generate")
async def generate(req: RequirementRequest):
    if not req.requirement.strip():
        raise HTTPException(status_code=400, detail="Requirement cannot be empty.")
    try:
        result = await run_pipeline(req.requirement, req.openai_key)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-selectors")
async def selector_analyze(req: SelectorRequest):
    if not req.html_content.strip():
        raise HTTPException(status_code=400, detail="HTML content cannot be empty.")
    try:
        result = await analyze_selectors(req.html_content, req.page_name, req.openai_key)
        return {"selectors": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
