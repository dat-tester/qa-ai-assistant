"""
QA Pipeline Service
-------------------
Uses the Anthropic Claude API if ANTHROPIC_API_KEY is set in environment.
Falls back to intelligent mock responses if no key is provided.
"""

import os
import asyncio
import httpx

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MODEL = "claude-opus-4-5"

# ── LLM CALL ─────────────────────────────────────────────────────────────────

async def call_llm(prompt: str) -> str:
    """Call Anthropic Claude API or return mock response."""
    if not ANTHROPIC_API_KEY:
        return await mock_llm(prompt)

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    body = {
        "model": MODEL,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}],
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages", headers=headers, json=body
        )
        resp.raise_for_status()
        data = resp.json()
        return data["content"][0]["text"]


async def mock_llm(prompt: str) -> str:
    """Return realistic mock output based on which pipeline step is being called."""
    await asyncio.sleep(0.4)  # Simulate network latency

    p = prompt.lower()

    if "qa analyst" in p:
        return MOCK_ANALYST
    elif "qa lead" in p:
        return MOCK_LEAD
    elif "qa estimator" in p or "estimation" in p:
        return MOCK_ESTIMATION
    elif "qa automation" in p or "selenium" in p:
        return MOCK_AUTOMATION
    return "Mock response: unable to determine step."


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
- Create a Page Object class (pages/page.py)
- Create a test file (tests/test_suite.py)
- Use explicit waits (WebDriverWait)
- Use fixtures for driver setup/teardown
- Use parametrize where applicable
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
| TC-001 | Successful login with valid credentials | Registered account exists; app is accessible | 1. Navigate to login page 2. Enter valid email 3. Enter correct password 4. Click Login | User redirected to dashboard; session created | High |
| TC-002 | Login fails with incorrect password | Registered account exists | 1. Navigate to login page 2. Enter valid email 3. Enter wrong password 4. Click Login | Generic error message shown | High |
| TC-003 | Login fails with unregistered email | No account for this email | 1. Navigate to login page 2. Enter unregistered email 3. Enter any password 4. Click Login | Generic error message shown | High |
| TC-004 | Account locks after 5 failed attempts | Registered account; 0 prior failures | 1. Enter valid email + wrong password 2. Repeat 5 times | Account locked on 5th attempt; lock message shown | High |
| TC-005 | Locked account blocks correct password | Account is locked | 1. Enter valid credentials 2. Click Login | Login denied; lock message displayed | High |
| TC-006 | Remember Me persists session | Valid credentials; Remember Me available | 1. Login with Remember Me checked 2. Close browser 3. Reopen and navigate to app | User still logged in | High |
| TC-007 | Session expires without Remember Me | Valid credentials | 1. Login without Remember Me 2. Close browser 3. Reopen app | User redirected to login | Medium |
| TC-008 | Empty email shows validation error | App accessible | 1. Leave email blank 2. Enter any password 3. Click Login | Validation error: "Email is required" | High |
| TC-009 | Empty password shows validation error | App accessible | 1. Enter valid email 2. Leave password blank 3. Click Login | Validation error: "Password is required" | High |
| TC-010 | SQL injection in email field | App accessible | 1. Enter `' OR '1'='1` 2. Enter any password 3. Click Login | Login fails; no SQL error exposed | High |
| TC-011 | Invalid email format | App accessible | 1. Enter `user@` 2. Enter password 3. Click Login | Validation error: "Enter a valid email" | Medium |
| TC-012 | Whitespace-only input | App accessible | 1. Enter spaces in both fields 2. Click Login | Fields treated as empty; validation errors shown | Low |"""

MOCK_LEAD = """| ID | Title | Preconditions | Steps | Expected Result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-001 | Successful login with valid credentials | Registered account exists; app is accessible | 1. Go to login page 2. Enter valid email 3. Enter correct password 4. Click Login | User redirected to dashboard; authenticated session created | High |
| TC-002 | Login fails with incorrect password | Registered account exists | 1. Go to login page 2. Enter valid email 3. Enter wrong password 4. Click Login | Generic error: "Invalid email or password" shown; no password hint | High |
| TC-003 | Login fails with unregistered email | No account for this email | 1. Go to login page 2. Enter unregistered email 3. Enter any password 4. Click Login | Same generic error as TC-002 (no user enumeration) | High |
| TC-004 | No lockout before 5th failed attempt | Registered account; 0 prior failures | 1. Enter valid email + wrong password 2. Repeat 4 times | Account still accessible after 4 failures | High |
| TC-005 | Account locks on 5th consecutive failed attempt | Registered account; 0 prior failures | 1. Enter valid email + wrong password 2. Repeat 5 times | Account locked on 5th attempt; lock notification displayed | High |
| TC-006 | Locked account blocks correct credentials | Account is locked | 1. Enter valid email + correct password 2. Click Login | Login denied; "Account is locked. Contact support." shown | High |
| TC-007 | Remember Me sets persistent session cookie | Valid credentials | 1. Login with Remember Me checked 2. Close browser 3. Reopen app | Persistent auth cookie set; user remains logged in | High |
| TC-008 | Without Remember Me — no persistent cookie | Valid credentials | 1. Login without Remember Me 2. Close browser 3. Reopen app | No persistent cookie; user redirected to login | Medium |
| TC-009 | Empty email field shows validation error | App accessible | 1. Leave email blank 2. Enter any password 3. Click Login | Inline error: "Email is required" | High |
| TC-010 | Empty password field shows validation error | App accessible | 1. Enter valid email 2. Leave password blank 3. Click Login | Inline error: "Password is required" | High |
| TC-011 | Both fields empty shows both validation errors | App accessible | 1. Leave both fields blank 2. Click Login | Both inline errors displayed simultaneously | Medium |
| TC-012 | Invalid email format blocked client-side | App accessible | 1. Enter `user@` or `plaintext` 2. Enter password 3. Click Login | Validation error: "Enter a valid email address"; form not submitted | Medium |
| TC-013 | SQL injection in email field | App accessible | 1. Enter `' OR '1'='1` in email 2. Enter any password 3. Click Login | Login fails gracefully; no SQL errors; no unauthorized access | High |
| TC-014 | XSS payload in email field | App accessible | 1. Enter `<script>alert(1)</script>` 2. Click Login | Input sanitized; no script executes; error shown | High |
| TC-015 | Password field masks characters | App accessible | 1. Go to login page 2. Type into password field | Characters displayed as dots/asterisks | Medium |
| TC-016 | Whitespace-only input treated as empty | App accessible | 1. Enter spaces in both fields 2. Click Login | Whitespace trimmed; validation errors shown | Low |
| TC-017 | Excessively long email handled gracefully | App accessible | 1. Enter 500+ character string in email 2. Click Login | Graceful error shown; no crash or timeout | Low |
| TC-018 | Failed counter resets after successful login | 3 prior failed attempts | 1. Login successfully 2. Log out 3. Fail 3 more times | Counter reset; no lockout after 3 new failures | Medium |"""

MOCK_ESTIMATION = """### Estimation Summary
- **Total Time (hours):** 28.5
- **Complexity:** Medium–High

### Breakdown
| Activity | Hours |
|----------|-------|
| Test Design & Review | 3.0 |
| Manual Testing (18 cases × ~25 min) | 7.5 |
| Automation Scripting (12 cases) | 12.0 |
| Debugging & Stabilization | 3.5 |
| Reporting & Defect Logging | 2.5 |
| **Total** | **28.5** |

### Risks
- Account lockout state must be reset between runs — may require admin access or API reset endpoint
- "Remember Me" behavior varies across browsers; cross-browser testing adds unestimated time
- Security test cases (TC-013, TC-014) may be silently blocked by WAF in staging, producing false passes
- No backend access means lockout counter state cannot be directly verified — must infer from UI responses
- Session expiry timing tests depend on environment configuration and may be flaky

### Assumptions
- A dedicated test account can be freely created, locked, and reset in the test environment
- The lockout counter is resettable via an admin panel or REST API between test runs
- "Remember Me" is implemented via a persistent cookie (not in-memory session storage)
- Chrome latest is the primary test browser; cross-browser scope excluded from this cycle
- Test environment mirrors production authentication logic and security rules
- Automation covers the 12 highest-priority, UI-stable cases; security/session tests remain manual"""

MOCK_AUTOMATION = '''import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


# ── Page Object ───────────────────────────────────────────────────────────────

class LoginPage:
    URL = "https://example.com/login"

    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-btn")
    REMEMBER_ME = (By.ID, "remember-me")
    ERROR_MSG = (By.CSS_SELECTOR, "[data-testid=\'error-message\']")
    LOCK_MSG = (By.CSS_SELECTOR, "[data-testid=\'lock-message\']")
    EMAIL_ERROR = (By.CSS_SELECTOR, "[data-testid=\'email-error\']")
    PASSWORD_ERROR = (By.CSS_SELECTOR, "[data-testid=\'password-error\']")
    DASHBOARD = (By.CSS_SELECTOR, "[data-testid=\'dashboard-header\']")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(self.URL)

    def enter_email(self, value):
        el = self.wait.until(EC.visibility_of_element_located(self.EMAIL_INPUT))
        el.clear()
        el.send_keys(value)

    def enter_password(self, value):
        el = self.wait.until(EC.visibility_of_element_located(self.PASSWORD_INPUT))
        el.clear()
        el.send_keys(value)

    def click_login(self):
        self.wait.until(EC.element_to_be_clickable(self.LOGIN_BUTTON)).click()

    def toggle_remember_me(self, enable=True):
        cb = self.wait.until(EC.element_to_be_clickable(self.REMEMBER_ME))
        if cb.is_selected() != enable:
            cb.click()

    def login(self, email, password, remember=False):
        self.open()
        self.enter_email(email)
        self.enter_password(password)
        self.toggle_remember_me(remember)
        self.click_login()

    def get_text(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator)).text

    def is_dashboard_visible(self):
        try:
            self.wait.until(EC.visibility_of_element_located(self.DASHBOARD))
            return True
        except Exception:
            return False

    def is_password_masked(self):
        el = self.wait.until(EC.visibility_of_element_located(self.PASSWORD_INPUT))
        return el.get_attribute("type") == "password"


# ── Fixtures ──────────────────────────────────────────────────────────────────

VALID_EMAIL = "user@example.com"
VALID_PASS = "ValidPass123!"
WRONG_PASS = "WrongPass999!"
BAD_EMAIL = "user@"

@pytest.fixture(scope="function")
def driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    _d = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=opts
    )
    yield _d
    _d.quit()

@pytest.fixture
def page(driver):
    return LoginPage(driver)


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestSuccessfulLogin:
    def test_valid_login_shows_dashboard(self, page):
        page.login(VALID_EMAIL, VALID_PASS)
        assert page.is_dashboard_visible()


class TestLoginFailures:
    def test_wrong_password_shows_error(self, page):
        page.login(VALID_EMAIL, WRONG_PASS)
        assert "Invalid" in page.get_text(LoginPage.ERROR_MSG)

    def test_unregistered_email_shows_same_error(self, page):
        page.login("ghost@example.com", WRONG_PASS)
        assert "Invalid" in page.get_text(LoginPage.ERROR_MSG)

    def test_errors_are_identical_for_enumeration_protection(self, page):
        page.login(VALID_EMAIL, WRONG_PASS)
        err1 = page.get_text(LoginPage.ERROR_MSG)
        page.login("ghost@example.com", WRONG_PASS)
        err2 = page.get_text(LoginPage.ERROR_MSG)
        assert err1 == err2


class TestAccountLockout:
    def test_no_lock_before_fifth_attempt(self, page):
        for _ in range(4):
            page.login(VALID_EMAIL, WRONG_PASS)
        error = page.get_text(LoginPage.ERROR_MSG)
        assert "locked" not in error.lower()

    def test_locks_on_fifth_attempt(self, page):
        for _ in range(5):
            page.login(VALID_EMAIL, WRONG_PASS)
        assert "locked" in page.get_text(LoginPage.LOCK_MSG).lower()

    def test_locked_account_rejects_correct_password(self, page):
        for _ in range(5):
            page.login(VALID_EMAIL, WRONG_PASS)
        page.login(VALID_EMAIL, VALID_PASS)
        assert not page.is_dashboard_visible()


class TestValidation:
    def test_empty_email_shows_error(self, page):
        page.open()
        page.enter_password(VALID_PASS)
        page.click_login()
        assert "required" in page.get_text(LoginPage.EMAIL_ERROR).lower()

    def test_empty_password_shows_error(self, page):
        page.open()
        page.enter_email(VALID_EMAIL)
        page.click_login()
        assert "required" in page.get_text(LoginPage.PASSWORD_ERROR).lower()

    @pytest.mark.parametrize("bad", ["user@", "plaintext", "@nodomain"])
    def test_invalid_email_format(self, page, bad):
        page.open()
        page.enter_email(bad)
        page.enter_password(VALID_PASS)
        page.click_login()
        err = page.get_text(LoginPage.EMAIL_ERROR)
        assert "valid" in err.lower()

    def test_password_field_is_masked(self, page):
        page.open()
        assert page.is_password_masked()


class TestSecurity:
    def test_sql_injection_blocked(self, page):
        page.login("\'OR\'1\'=\'1", VALID_PASS)
        assert not page.is_dashboard_visible()

    def test_xss_payload_sanitized(self, page):
        page.login("<script>alert(1)</script>", VALID_PASS)
        assert "<script>" not in page.driver.page_source


class TestRememberMe:
    def test_remember_me_sets_persistent_cookie(self, page, driver):
        page.login(VALID_EMAIL, VALID_PASS, remember=True)
        cookies = {c["name"]: c for c in driver.get_cookies()}
        persistent = [
            c for c in cookies.values()
            if c.get("expiry") and c["name"] in ("auth_token", "remember_token", "session")
        ]
        assert len(persistent) > 0
'''
