"""
QA Pipeline Service
-------------------
Sử dụng OpenAI GPT-4 nếu OPENAI_API_KEY được set.
Fallback về mock data nếu không có key.
"""

import os
import asyncio
import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL = "gpt-4o"  # hoặc "gpt-4-turbo", "gpt-3.5-turbo" nếu muốn rẻ hơn

# ── LLM CALL ──────────────────────────────────────────────────────────────────

async def call_llm(prompt: str) -> str:
    if not OPENAI_API_KEY:
        return await mock_llm(prompt)

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 4096,
        "temperature": 0.3,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=body,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def mock_llm(prompt: str) -> str:
    await asyncio.sleep(0.4)
    p = prompt.lower()
    if "qa analyst" in p:
        return MOCK_ANALYST
    elif "qa lead" in p:
        return MOCK_LEAD
    elif "qa estimator" in p or "estimation" in p:
        return MOCK_ESTIMATION
    elif "qa automation" in p or "selenium" in p:
        return MOCK_AUTOMATION
    return "Mock response."


# ── PIPELINE STEPS ────────────────────────────────────────────────────────────

async def qa_analyst(requirement: str) -> str:
    prompt = f"""You are a QA Analyst. Analyze the following requirement and generate detailed test cases.

Requirement:
{requirement}

Output ONLY a markdown table with these columns:
| ID | Title | Preconditions | Steps | Expected Result | Priority |

Include positive cases, negative cases, and edge cases.
Be clear, concise, and professional. Return only the markdown table, no other text."""
    return await call_llm(prompt)


async def qa_lead(requirement: str, analyst_output: str) -> str:
    prompt = f"""You are a QA Lead reviewing test cases written by a QA Analyst.

Original Requirement:
{requirement}

Analyst's Test Cases:
{analyst_output}

Your tasks:
- Remove duplicates
- Fix unclear steps
- Add missing edge cases
- Improve coverage

Return ONLY the final improved markdown table with the same columns:
| ID | Title | Preconditions | Steps | Expected Result | Priority |

No explanation, no preamble — just the improved table."""
    return await call_llm(prompt)


async def qa_estimator(requirement: str, lead_output: str) -> str:
    prompt = f"""You are a QA Test Manager and Estimator.

Requirement:
{requirement}

Final Test Cases:
{lead_output}

Produce a testing effort estimation in this exact markdown format:

### Estimation Summary
- **Total Time (hours):**
- **Complexity:** (Low / Medium / High)

### Breakdown
| Activity | Hours |
|----------|-------|
| Test Design | X |
| Manual Testing | X |
| Automation Scripting | X |
| Debugging & Stabilization | X |
| Reporting | X |
| **Total** | **X** |

### Risks
- Risk 1
- Risk 2

### Assumptions
- Assumption 1
- Assumption 2

Return only the markdown content, no other text."""
    return await call_llm(prompt)


async def qa_automation(requirement: str, lead_output: str) -> str:
    prompt = f"""You are a QA Automation Engineer.

Requirement:
{requirement}

Test Cases to Automate:
{lead_output}

Generate complete Python Pytest + Selenium automation code using Page Object Model (POM).

Requirements:
- Create a Page Object class
- Create a test file
- Use explicit waits (WebDriverWait)
- Use fixtures for driver setup/teardown
- Follow best practices
- Code must be runnable

Return ONLY raw Python code. No markdown fences, no explanation."""
    return await call_llm(prompt)


# ── MAIN PIPELINE ─────────────────────────────────────────────────────────────

async def run_pipeline(requirement: str) -> dict:
    analyst_out = await qa_analyst(requirement)
    lead_out = await qa_lead(requirement, analyst_out)
    estimation_out, automation_out = await asyncio.gather(
        qa_estimator(requirement, lead_out),
        qa_automation(requirement, lead_out),
    )
    return {
        "analyst": analyst_out,
        "lead": lead_out,
        "estimation": estimation_out,
        "automation": automation_out,
    }


# ── MOCK DATA ─────────────────────────────────────────────────────────────────

MOCK_ANALYST = """| ID | Title | Preconditions | Steps | Expected Result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-001 | Successful login with valid credentials | Registered account exists | 1. Go to login page 2. Enter valid email 3. Enter correct password 4. Click Login | User redirected to dashboard | High |
| TC-002 | Login fails with incorrect password | Registered account exists | 1. Enter valid email 2. Enter wrong password 3. Click Login | Error message shown | High |
| TC-003 | Account locks after 5 failed attempts | Registered account exists | 1. Enter wrong password 5 times | Account locked message shown | High |"""

MOCK_LEAD = """| ID | Title | Preconditions | Steps | Expected Result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-001 | Successful login with valid credentials | Registered account exists; app accessible | 1. Go to login page 2. Enter valid email 3. Enter correct password 4. Click Login | User redirected to dashboard; session created | High |
| TC-002 | Login fails with incorrect password | Registered account exists | 1. Enter valid email 2. Enter wrong password 3. Click Login | Generic error shown; no password hint | High |
| TC-003 | Account locks on 5th failed attempt | Registered account; 0 prior failures | 1. Enter wrong password 5 times | Account locked on 5th attempt | High |"""

MOCK_ESTIMATION = """### Estimation Summary
- **Total Time (hours):** 28.5
- **Complexity:** Medium–High

### Breakdown
| Activity | Hours |
|----------|-------|
| Test Design | 3.0 |
| Manual Testing | 7.5 |
| Automation Scripting | 12.0 |
| Debugging | 3.5 |
| Reporting | 2.5 |
| **Total** | **28.5** |

### Risks
- Account lockout requires reset between runs
- Session tests may vary across browsers

### Assumptions
- Test account can be freely reset
- Chrome latest is primary browser"""

MOCK_AUTOMATION = '''import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def login(self, email, password):
        self.driver.get("https://example.com/login")
        self.wait.until(EC.visibility_of_element_located((By.ID, "email"))).send_keys(email)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.ID, "login-btn").click()

@pytest.fixture
def driver():
    d = webdriver.Chrome()
    yield d
    d.quit()

def test_valid_login(driver):
    page = LoginPage(driver)
    page.login("user@example.com", "ValidPass123!")
    assert "dashboard" in driver.current_url'''