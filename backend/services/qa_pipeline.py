"""
QA Pipeline Service
-------------------
Uses OpenAI GPT-4o if OPENAI_API_KEY is set or passed from frontend.
Falls back to mock data if no key is provided.
"""

import os
import asyncio
import httpx

MODEL = "gpt-4o"

# ── LLM CALL ──────────────────────────────────────────────────────────────────

async def call_llm(prompt: str) -> str:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return await mock_llm(prompt)

    headers = {
        "Authorization": f"Bearer {api_key}",
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
    elif "selector" in p or "html" in p:
        return MOCK_SELECTORS
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


async def analyze_selectors(html_content: str, page_name: str, openai_key: str = "") -> str:
    if openai_key:
        os.environ["OPENAI_API_KEY"] = openai_key

    max_len = 12000
    html_truncated = html_content[:max_len] + "\n... [truncated]" if len(html_content) > max_len else html_content

    prompt = f"""You are a QA Automation Engineer specializing in Selenium WebDriver.

Analyze the following HTML source code from the "{page_name}" page and extract ALL useful selectors for test automation.

HTML:
{html_truncated}

For each interactive or important element, provide the best selector.
Prefer selectors in this order: ID > data-testid > name > CSS class > XPath.

Format your response as a Python Page Object class like this:

# ============================================================
# PAGE OBJECT: {page_name}
# ============================================================

from selenium.webdriver.common.by import By

class {page_name.replace(' ', '')}Page:

    # --- Form Inputs ---
    EMAIL_INPUT    = (By.ID, "email")           # Email input field
    PASSWORD_INPUT = (By.ID, "password")        # Password input field

    # --- Buttons ---
    LOGIN_BUTTON   = (By.ID, "login-btn")       # Submit / Login button

    # --- Messages ---
    ERROR_MSG      = (By.CSS_SELECTOR, "[data-testid='error']")  # Error message

# ============================================================
# SELECTOR REFERENCE TABLE
# ============================================================
# Element              | Type              | Locator
# ---------------------|-------------------|---------------------------
# Email Input          | By.ID             | "email"
# Password Input       | By.ID             | "password"
# Login Button         | By.ID             | "login-btn"

List ALL selectors you can find including:
- All form inputs (text, email, password, select, checkbox, radio, textarea)
- All buttons and submit elements
- All links and navigation items
- Error / success / warning messages
- Modal dialogs and overlays
- Tables and list elements
- Any element with id, data-testid, name, or unique class

Return ONLY the Python code. No explanation outside code comments."""

    return await call_llm(prompt)


# ── MAIN PIPELINE ─────────────────────────────────────────────────────────────

async def run_pipeline(requirement: str, openai_key: str = "") -> dict:
    if openai_key:
        os.environ["OPENAI_API_KEY"] = openai_key

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
| TC-003 | Account locks after 5 failed attempts | Registered account exists | 1. Enter wrong password 5 times | Account locked message shown | High |
| TC-004 | Remember Me persists session | Valid credentials | 1. Login with Remember Me 2. Close browser 3. Reopen | User still logged in | High |
| TC-005 | Login with empty email | App accessible | 1. Leave email blank 2. Click Login | Validation error shown | High |
| TC-006 | Login with empty password | App accessible | 1. Leave password blank 2. Click Login | Validation error shown | High |"""

MOCK_LEAD = """| ID | Title | Preconditions | Steps | Expected Result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-001 | Successful login with valid credentials | Registered account exists; app accessible | 1. Go to login page 2. Enter valid email 3. Enter correct password 4. Click Login | User redirected to dashboard; session created | High |
| TC-002 | Login fails with incorrect password | Registered account exists | 1. Enter valid email 2. Enter wrong password 3. Click Login | Generic error shown; no password hint | High |
| TC-003 | No lockout before 5th failed attempt | Registered account; 0 prior failures | 1. Enter wrong password 4 times | Account still accessible | High |
| TC-004 | Account locks on 5th failed attempt | Registered account; 0 prior failures | 1. Enter wrong password 5 times | Account locked; lock message shown | High |
| TC-005 | Locked account blocks correct password | Account is locked | 1. Enter correct credentials 2. Click Login | Login denied; lock message shown | High |
| TC-006 | Remember Me sets persistent cookie | Valid credentials | 1. Login with Remember Me 2. Close browser 3. Reopen | Persistent cookie; user logged in | High |
| TC-007 | Without Remember Me session expires | Valid credentials | 1. Login without Remember Me 2. Close browser 3. Reopen | User redirected to login | Medium |
| TC-008 | Empty email shows validation error | App accessible | 1. Leave email blank 2. Click Login | Inline error: Email is required | High |
| TC-009 | Empty password shows validation error | App accessible | 1. Leave password blank 2. Click Login | Inline error: Password is required | High |
| TC-010 | SQL injection in email field | App accessible | 1. Enter SQL payload 2. Click Login | Login fails; no SQL error exposed | High |"""

MOCK_ESTIMATION = """### Estimation Summary
- **Total Time (hours):** 28.5
- **Complexity:** Medium-High

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
- Account lockout requires reset between test runs
- Session persistence tests may vary across browsers
- Security tests may be blocked by WAF in staging

### Assumptions
- Test account can be freely created and reset
- Chrome latest is the primary test browser
- Test environment mirrors production auth logic"""

MOCK_AUTOMATION = '''import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

VALID_EMAIL = "user@example.com"
VALID_PASS = "ValidPass123!"
WRONG_PASS = "WrongPass999!"

class LoginPage:
    URL = "https://example.com/login"
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-btn")
    ERROR_MSG = (By.CSS_SELECTOR, "[data-testid=\'error-message\']")
    LOCK_MSG = (By.CSS_SELECTOR, "[data-testid=\'lock-message\']")
    DASHBOARD = (By.CSS_SELECTOR, "[data-testid=\'dashboard-header\']")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(self.URL)

    def login(self, email, password):
        self.open()
        self.wait.until(EC.visibility_of_element_located(self.EMAIL_INPUT)).send_keys(email)
        self.driver.find_element(*self.PASSWORD_INPUT).send_keys(password)
        self.driver.find_element(*self.LOGIN_BUTTON).click()

    def get_error(self):
        return self.wait.until(EC.visibility_of_element_located(self.ERROR_MSG)).text

    def is_dashboard_visible(self):
        try:
            self.wait.until(EC.visibility_of_element_located(self.DASHBOARD))
            return True
        except Exception:
            return False

@pytest.fixture
def driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    d = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)
    yield d
    d.quit()

@pytest.fixture
def page(driver):
    return LoginPage(driver)

def test_valid_login(page):
    page.login(VALID_EMAIL, VALID_PASS)
    assert page.is_dashboard_visible()

def test_wrong_password(page):
    page.login(VALID_EMAIL, WRONG_PASS)
    assert "Invalid" in page.get_error()

def test_account_lockout(page):
    for _ in range(5):
        page.login(VALID_EMAIL, WRONG_PASS)
    lock = page.wait.until(EC.visibility_of_element_located(LoginPage.LOCK_MSG)).text
    assert "locked" in lock.lower()'''

MOCK_SELECTORS = '''# ============================================================
# PAGE OBJECT: Login Page (MOCK - Add OpenAI key for real analysis)
# ============================================================

from selenium.webdriver.common.by import By

class LoginPage:

    # --- Form Inputs ---
    EMAIL_INPUT     = (By.ID, "email")               # Email input field
    PASSWORD_INPUT  = (By.ID, "password")            # Password input field
    REMEMBER_ME     = (By.ID, "remember-me")         # Remember me checkbox

    # --- Buttons ---
    LOGIN_BUTTON    = (By.ID, "login-btn")           # Submit / Login button
    FORGOT_PASSWORD = (By.CSS_SELECTOR, "a.forgot")  # Forgot password link

    # --- Messages ---
    ERROR_MSG       = (By.CSS_SELECTOR, "[data-testid=\'error-message\']")
    SUCCESS_MSG     = (By.CSS_SELECTOR, "[data-testid=\'success-message\']")
    LOCK_MSG        = (By.CSS_SELECTOR, "[data-testid=\'lock-message\']")

    # --- Navigation ---
    REGISTER_LINK   = (By.CSS_SELECTOR, "a[href=\'/register\']")
    LOGO            = (By.CSS_SELECTOR, ".logo")

    # --- Post Login ---
    DASHBOARD       = (By.CSS_SELECTOR, "[data-testid=\'dashboard-header\']")

# ============================================================
# SELECTOR REFERENCE TABLE
# ============================================================
# Element              | Type              | Locator
# ---------------------|-------------------|---------------------------
# Email Input          | By.ID             | "email"
# Password Input       | By.ID             | "password"
# Remember Me          | By.ID             | "remember-me"
# Login Button         | By.ID             | "login-btn"
# Error Message        | By.CSS_SELECTOR   | "[data-testid=\'error-message\']"
# Lock Message         | By.CSS_SELECTOR   | "[data-testid=\'lock-message\']"
# Dashboard Header     | By.CSS_SELECTOR   | "[data-testid=\'dashboard-header\']"
'''
