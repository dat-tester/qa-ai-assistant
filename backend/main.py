from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.qa_pipeline import (
    qa_analyst, qa_lead,
    qa_estimator, qa_selector,
    qa_automation, qa_playwright,
)
import os

app = FastAPI(title="QA AI Assistant API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def set_key(openai_key: str):
    if openai_key:
        os.environ["OPENAI_API_KEY"] = openai_key


# ── Request Models ────────────────────────────────────────────────────────────

class Step1Request(BaseModel):
    requirement: str
    url: str = ""
    openai_key: str = ""

class Step3Request(BaseModel):
    requirement: str
    lead_output: str
    openai_key: str = ""

class Step4Request(BaseModel):
    html_content: str
    url: str = ""
    page_name: str = "Page"
    openai_key: str = ""

class Step5Request(BaseModel):
    requirement: str
    url: str = ""
    lead_output: str
    selector_output: str
    openai_key: str = ""

class Step6Request(BaseModel):
    requirement: str
    url: str = ""
    lead_output: str
    selector_output: str
    openai_key: str = ""


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "version": "3.0.0"}


@app.post("/step/analyst-lead")
async def run_analyst_lead(req: Step1Request):
    """Step 1+2: Auto-run Analyst then Lead"""
    if not req.requirement.strip():
        raise HTTPException(status_code=400, detail="Requirement cannot be empty.")
    try:
        set_key(req.openai_key)
        analyst_out = await qa_analyst(req.requirement, req.url)
        lead_out    = await qa_lead(req.requirement, analyst_out)
        return {"analyst": analyst_out, "lead": lead_out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/step/estimator")
async def run_estimator(req: Step3Request):
    """Step 3: Estimation — triggered manually"""
    try:
        set_key(req.openai_key)
        result = await qa_estimator(req.requirement, req.lead_output)
        return {"estimation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/step/selector")
async def run_selector(req: Step4Request):
    """Step 4: HTML Selector analysis — triggered manually"""
    if not req.html_content.strip():
        raise HTTPException(status_code=400, detail="HTML content cannot be empty.")
    try:
        set_key(req.openai_key)
        result = await qa_selector(req.html_content, req.url, req.page_name)
        return {"selector": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/step/engineer")
async def run_engineer(req: Step5Request):
    """Step 5: Selenium code — triggered manually"""
    try:
        set_key(req.openai_key)
        result = await qa_automation(req.requirement, req.lead_output, req.selector_output, req.url)
        return {"automation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/step/playwright")
async def run_playwright(req: Step6Request):
    """Step 6: Playwright code — triggered manually"""
    try:
        set_key(req.openai_key)
        result = await qa_playwright(req.requirement, req.lead_output, req.selector_output, req.url)
        return {"playwright": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
