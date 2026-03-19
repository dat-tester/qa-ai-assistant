"""
QA Pipeline - Individual Step Functions
Each step can be called independently.
"""

import os
import asyncio
import httpx

MODEL = "gpt-4o"

# ── LLM ───────────────────────────────────────────────────────────────────────

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
    async with httpx.AsyncClient(timeout=90.0) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers, json=body,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def mock_llm(prompt: str) -> str:
    await asyncio.sleep(0.4)
    p = prompt.lower()
    if "qa analyst" in p:   return MOCK_ANALYST
    if "qa lead" in p:      return MOCK_LEAD
    if "estimator" in p:    return MOCK_ESTIMATION
    if "selector" in p:     return MOCK_SELECTORS
    if "playwright" in p:   return MOCK_PLAYWRIGHT
    if "selenium" in p:     return MOCK_AUTOMATION
    return "Mock response."


# ── STEP 1: QA ANALYST ────────────────────────────────────────────────────────

async def qa_analyst(requirement: str, url: str = "") -> str:
    url_ctx = f"\nTarget URL: {url}" if url else ""
    prompt = f"""You are a QA Analyst. Generate detailed test cases for the requirement below.

Requirement:
{requirement}{url_ctx}

Output ONLY a markdown table:
| ID | Title | Preconditions | Steps | Expected Result | Priority |

Include positive, negative, and edge cases. Return only the table."""
    return await call_llm(prompt)


# ── STEP 2: QA LEAD ───────────────────────────────────────────────────────────

async def qa_lead(requirement: str, analyst_output: str) -> str:
    prompt = f"""You are a QA Lead reviewing test cases.

Requirement: {requirement}

Analyst Test Cases:
{analyst_output}

Tasks: remove duplicates, fix unclear steps, add missing edge cases, improve coverage.

Return ONLY the improved markdown table:
| ID | Title | Preconditions | Steps | Expected Result | Priority |"""
    return await call_llm(prompt)


# ── STEP 3: QA ESTIMATOR ──────────────────────────────────────────────────────

async def qa_estimator(requirement: str, lead_output: str) -> str:
    prompt = f"""You are a QA Estimator.

Requirement: {requirement}

Test Cases:
{lead_output}

Output estimation in this exact format:

### Estimation Summary
- **Total Time (hours):**
- **Complexity:** Low / Medium / High

### Breakdown
| Activity | Hours |
|----------|-------|
| Test Design | X |
| Manual Testing | X |
| Automation (Selenium) | X |
| Automation (Playwright) | X |
| Debugging | X |
| Reporting | X |
| **Total** | **X** |

### Risks
- Risk 1

### Assumptions
- Assumption 1

Return only markdown."""
    return await call_llm(prompt)


# ── STEP 4: QA SELECTOR ───────────────────────────────────────────────────────

async def qa_selector(html_content: str, url: str = "", page_name: str = "Page") -> str:
    max_len = 12000
    html = html_content[:max_len] + "\n...[truncated]" if len(html_content) > max_len else html_content
    url_ctx = f"Page URL: {url}\n" if url else ""
    class_name = page_name.replace(' ', '').replace('-', '').replace('/', '')

    prompt = f"""You are a QA Automation Engineer. Extract ALL selectors from this HTML.

{url_ctx}
HTML:
{html}

Prefer: ID > data-testid > name > CSS > XPath.

Output as Python class usable in Selenium AND Playwright:

# ============================================================
# PAGE SELECTORS: {page_name}
# URL: {url or 'N/A'}
# ============================================================

from selenium.webdriver.common.by import By

class {class_name}Selectors:

    # --- Form Inputs ---
    EMAIL_INPUT    = (By.ID, "email")       # Selenium
    PASSWORD_INPUT = (By.ID, "password")    # Selenium

    # --- Playwright equivalents ---
    # email_input    = "#email"
    # password_input = "#password"

    # --- Buttons ---
    LOGIN_BUTTON   = (By.ID, "login-btn")

    # --- Messages ---
    ERROR_MSG      = (By.CSS_SELECTOR, "[data-testid='error']")

# ============================================================
# REFERENCE TABLE
# ============================================================
# Element        | Selenium               | Playwright
# ---------------|------------------------|------------------
# Email Input    | (By.ID, "email")       | "#email"

List ALL elements found. Return only Python code."""
    return await call_llm(prompt)


# ── STEP 5: QA ENGINEER (SELENIUM) ───────────────────────────────────────────

async def qa_automation(requirement: str, lead_output: str, selector_output: str, url: str = "") -> str:
    base_url = url or "https://example.com"
    prompt = f"""You are a QA Automation Engineer (Selenium).

Requirement: {requirement}
Base URL: {base_url}

Test Cases:
{lead_output}

Selectors (from HTML analysis — use these exactly):
{selector_output}

Generate complete Python + Pytest + Selenium POM code.
- Use the selectors above — do NOT invent new ones
- Use {base_url} as the base URL
- Page Object class with provided selectors
- Test functions covering all test cases
- WebDriverWait for waits
- Pytest fixtures for setup/teardown

Return ONLY raw Python code. No markdown fences."""
    return await call_llm(prompt)


# ── STEP 6: QA PLAYWRIGHT ────────────────────────────────────────────────────

async def qa_playwright(requirement: str, lead_output: str, selector_output: str, url: str = "") -> str:
    base_url = url or "https://example.com"
    prompt = f"""You are a QA Playwright Engineer (Python + Playwright).

Requirement: {requirement}
Base URL: {base_url}

Test Cases:
{lead_output}

Selectors (from HTML analysis — use these exactly):
{selector_output}

Generate complete Python + Pytest + Playwright POM code.
- Use the selectors above — do NOT invent new ones
- Use {base_url} as the base URL
- Use playwright.sync_api
- Page Object class with provided selectors
- Test functions covering all test cases
- Use expect() for assertions
- Pytest fixtures (page, browser, context)
- Install: pip install pytest-playwright && playwright install

Return ONLY raw Python code. No markdown fences."""
    return await call_llm(prompt)


# ── MOCK DATA ─────────────────────────────────────────────────────────────────

MOCK_ANALYST = """| ID | Title | Preconditions | Steps | Expected Result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-001 | Successful login with valid credentials | Registered account exists | 1. Go to login page 2. Enter valid email 3. Enter correct password 4. Click Login | User redirected to dashboard | High |
| TC-002 | Login fails with incorrect password | Registered account exists | 1. Enter valid email 2. Enter wrong password 3. Click Login | Error message shown | High |
| TC-003 | Account locks after 5 failed attempts | Registered account | 1. Enter wrong password 5 times | Account locked message shown | High |
| TC-004 | Remember Me persists session | Valid credentials | 1. Login with Remember Me 2. Close browser 3. Reopen | User still logged in | High |
| TC-005 | Login with empty email | App accessible | 1. Leave email blank 2. Click Login | Validation error shown | High |
| TC-006 | Login with empty password | App accessible | 1. Leave password blank 2. Click Login | Validation error shown | High |"""

MOCK_LEAD = """| ID | Title | Preconditions | Steps | Expected Result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-001 | Successful login | Account exists; app accessible | 1. Go to login 2. Enter valid email 3. Enter correct password 4. Click Login | Dashboard shown; session created | High |
| TC-002 | Wrong password shows error | Account exists | 1. Enter valid email 2. Enter wrong password 3. Click Login | Generic error; no password hint | High |
| TC-003 | No lockout before 5th attempt | 0 prior failures | 1. Enter wrong password 4 times | Account still accessible | High |
| TC-004 | Account locks on 5th attempt | 0 prior failures | 1. Enter wrong password 5 times | Account locked; lock message shown | High |
| TC-005 | Locked account blocks correct password | Account locked | 1. Enter correct credentials 2. Click Login | Login denied; lock message shown | High |
| TC-006 | Remember Me sets persistent cookie | Valid credentials | 1. Login with Remember Me 2. Close browser 3. Reopen | Persistent cookie; user logged in | High |
| TC-007 | Session expires without Remember Me | Valid credentials | 1. Login without Remember Me 2. Close and reopen | User redirected to login | Medium |
| TC-008 | Empty email shows validation error | App accessible | 1. Leave email blank 2. Click Login | Email is required error | High |
| TC-009 | Empty password shows validation error | App accessible | 1. Leave password blank 2. Click Login | Password is required error | High |
| TC-010 | SQL injection blocked | App accessible | 1. Enter SQL payload in email 2. Click Login | Login fails safely | High |"""

MOCK_ESTIMATION = """### Estimation Summary
- **Total Time (hours):** 36.0
- **Complexity:** Medium-High

### Breakdown
| Activity | Hours |
|----------|-------|
| Test Design | 3.0 |
| Manual Testing | 7.5 |
| Automation (Selenium) | 10.0 |
| Automation (Playwright) | 8.0 |
| Debugging | 5.0 |
| Reporting | 2.5 |
| **Total** | **36.0** |

### Risks
- Account lockout requires reset between test runs
- Session tests vary across browsers

### Assumptions
- Test account can be freely reset
- Chrome latest is primary browser"""

MOCK_SELECTORS = """# ============================================================
# PAGE SELECTORS: Login Page (MOCK — add OpenAI key for real analysis)
# ============================================================

from selenium.webdriver.common.by import By

class LoginPageSelectors:

    # --- Form Inputs ---
    EMAIL_INPUT     = (By.ID, "email")
    PASSWORD_INPUT  = (By.ID, "password")
    REMEMBER_ME     = (By.ID, "remember-me")

    # --- Buttons ---
    LOGIN_BUTTON    = (By.ID, "login-btn")
    FORGOT_PASSWORD = (By.CSS_SELECTOR, "a.forgot")

    # --- Messages ---
    ERROR_MSG       = (By.CSS_SELECTOR, "[data-testid='error-message']")
    LOCK_MSG        = (By.CSS_SELECTOR, "[data-testid='lock-message']")

    # --- Playwright locators ---
    # email_input     = "#email"
    # password_input  = "#password"
    # login_button    = "#login-btn"
    # error_msg       = "[data-testid='error-message']"

# ============================================================
# REFERENCE TABLE
# ============================================================
# Element         | Selenium                                    | Playwright
# ----------------|---------------------------------------------|---------------------------
# Email Input     | (By.ID, "email")                           | "#email"
# Password Input  | (By.ID, "password")                        | "#password"
# Login Button    | (By.ID, "login-btn")                       | "#login-btn"
# Error Message   | (By.CSS_SELECTOR, "[data-testid='error']") | "[data-testid='error']"
"""

MOCK_AUTOMATION = """import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

BASE_URL    = "https://example.com"
VALID_EMAIL = "user@example.com"
VALID_PASS  = "ValidPass123!"
WRONG_PASS  = "WrongPass999!"

class LoginPage:
    EMAIL_INPUT    = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON   = (By.ID, "login-btn")
    ERROR_MSG      = (By.CSS_SELECTOR, "[data-testid='error-message']")
    LOCK_MSG       = (By.CSS_SELECTOR, "[data-testid='lock-message']")
    DASHBOARD      = (By.CSS_SELECTOR, "[data-testid='dashboard-header']")

    def __init__(self, driver):
        self.driver = driver
        self.wait   = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(f"{BASE_URL}/login")

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
def page(driver): return LoginPage(driver)

def test_valid_login(page):
    page.login(VALID_EMAIL, VALID_PASS)
    assert page.is_dashboard_visible()

def test_wrong_password(page):
    page.login(VALID_EMAIL, WRONG_PASS)
    assert "Invalid" in page.get_error()

def test_lockout(page):
    for _ in range(5): page.login(VALID_EMAIL, WRONG_PASS)
    lock = page.wait.until(EC.visibility_of_element_located(LoginPage.LOCK_MSG)).text
    assert "locked" in lock.lower()"""

MOCK_PLAYWRIGHT = """# pip install pytest-playwright && playwright install chromium

import pytest
from playwright.sync_api import Page, expect

BASE_URL    = "https://example.com"
VALID_EMAIL = "user@example.com"
VALID_PASS  = "ValidPass123!"
WRONG_PASS  = "WrongPass999!"

class LoginPage:
    def __init__(self, page: Page):
        self.page           = page
        self.email_input    = page.locator("#email")
        self.password_input = page.locator("#password")
        self.login_button   = page.locator("#login-btn")
        self.remember_me    = page.locator("#remember-me")
        self.error_msg      = page.locator("[data-testid='error-message']")
        self.lock_msg       = page.locator("[data-testid='lock-message']")
        self.dashboard      = page.locator("[data-testid='dashboard-header']")

    def navigate(self):
        self.page.goto(f"{BASE_URL}/login")

    def login(self, email, password, remember=False):
        self.navigate()
        self.email_input.fill(email)
        self.password_input.fill(password)
        if remember: self.remember_me.check()
        self.login_button.click()

@pytest.fixture
def login_page(page: Page): return LoginPage(page)

def test_valid_login(login_page):
    login_page.login(VALID_EMAIL, VALID_PASS)
    expect(login_page.dashboard).to_be_visible()

def test_wrong_password(login_page):
    login_page.login(VALID_EMAIL, WRONG_PASS)
    expect(login_page.error_msg).to_contain_text("Invalid")

def test_lockout(login_page):
    for _ in range(5): login_page.login(VALID_EMAIL, WRONG_PASS)
    expect(login_page.lock_msg).to_be_visible()
    expect(login_page.lock_msg).to_contain_text("locked")"""
