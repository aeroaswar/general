# ERP — Plan 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full ERP project with working auth (JWT + RBAC), shell layout (topbar + sidebar), and a live dashboard skeleton — deployed via Docker, tested end-to-end.

**Architecture:** FastAPI serves Jinja2-rendered HTML pages and HTMX fragments. SQLAlchemy manages the database (SQLite locally, Postgres in production). JWT is stored in an HttpOnly cookie and verified by FastAPI dependencies on every route. Tailwind CSS is loaded from CDN — no build step.

**Tech Stack:** Python 3.12, FastAPI, Jinja2, HTMX 2.0, Alpine.js, Tailwind CSS (CDN), SQLAlchemy 2.x, Alembic, python-jose, bcrypt, pydantic-settings, pytest, httpx

---

## Plan Decomposition (4 plans total)

| Plan | Scope |
|---|---|
| **Plan 1 (this)** | Project scaffold · Docker · DB · Auth · Shell layout · Dashboard skeleton |
| Plan 2 | File ingestion: upload · type detection · schema analyzer · column mapping UI · import |
| Plan 3 | Logistics · Inventory · Manufacturing · Procurement modules |
| Plan 4 | Finance · CRM · HR & Payroll · Reports & Analytics |

Each plan builds on the previous. Complete Plan 1 before starting Plan 2.

---

## File Structure

```
erp/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app factory, router registration
│   ├── config.py                  # Settings (env vars via pydantic-settings)
│   ├── database.py                # SQLAlchemy engine, session, Base
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py              # User SQLAlchemy model
│   │   ├── service.py             # hash_password, verify_password, create_token, decode_token
│   │   ├── dependencies.py        # get_current_user, require_role FastAPI deps
│   │   └── router.py              # GET /login, POST /login, POST /logout
│   ├── dashboard/
│   │   └── router.py              # GET /, GET /dashboard
│   └── templates/
│       ├── base.html              # Shell: topbar + sidebar + main content slot
│       ├── auth/
│       │   └── login.html
│       ├── dashboard/
│       │   └── index.html
│       └── partials/
│           ├── _topbar.html
│           └── _sidebar.html
├── static/
│   └── (empty — CDN only, no build)
├── uploads/                       # Created at runtime
├── tests/
│   ├── conftest.py                # TestClient, test DB, fixtures
│   ├── test_auth.py               # Auth service unit tests
│   └── test_routes.py             # Route integration tests
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── Dockerfile
├── docker-compose.yml             # Local: SQLite
├── docker-compose.prod.yml        # Cloud: Postgres + nginx
├── seed.py                        # Creates default admin user
├── pyproject.toml
├── .env.example
└── .gitignore
```

---

## Task 1: Project scaffold & dependencies

**Files:**
- Create: `erp/pyproject.toml`
- Create: `erp/.env.example`
- Create: `erp/.gitignore`
- Create: `erp/app/__init__.py`
- Create: `erp/app/main.py`
- Create: `erp/tests/conftest.py`

- [ ] **Step 1: Create the project directory**

```bash
mkdir -p erp/app/auth erp/app/dashboard erp/app/templates/auth \
  erp/app/templates/dashboard erp/app/templates/partials \
  erp/static erp/uploads erp/tests erp/alembic/versions
touch erp/app/__init__.py erp/app/auth/__init__.py erp/app/dashboard/__init__.py
```

- [ ] **Step 2: Write `pyproject.toml`**

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "erp"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.111.0",
    "uvicorn[standard]>=0.29.0",
    "jinja2>=3.1.4",
    "python-multipart>=0.0.9",
    "sqlalchemy>=2.0.30",
    "alembic>=1.13.1",
    "pydantic-settings>=2.3.0",
    "python-jose[cryptography]>=3.3.0",
    "bcrypt>=4.1.3",
    "itsdangerous>=2.2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.2.0",
    "pytest-asyncio>=0.23.7",
    "httpx>=0.27.0",
]
```

- [ ] **Step 3: Write `.env.example`**

```env
SECRET_KEY=change-me-to-a-random-32-char-string
DATABASE_URL=sqlite:///./erp.db
# For production Postgres:
# DATABASE_URL=postgresql://user:password@db:5432/erp
ENVIRONMENT=development
```

- [ ] **Step 4: Write `.gitignore`**

```gitignore
.env
__pycache__/
*.pyc
.venv/
erp.db
uploads/
.coverage
htmlcov/
```

- [ ] **Step 5: Write minimal `app/main.py` (enough to import)**

```python
from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    return app

app = create_app()
```

- [ ] **Step 6: Write `tests/conftest.py`**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()
```

- [ ] **Step 7: Install dependencies**

```bash
cd erp
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
```

- [ ] **Step 8: Verify import works**

```bash
python -c "from app.main import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold erp project structure and dependencies"
```

---

## Task 2: Config & database

**Files:**
- Create: `erp/app/config.py`
- Create: `erp/app/database.py`

- [ ] **Step 1: Write `app/config.py`**

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    secret_key: str = "dev-secret-key-change-in-production"
    database_url: str = "sqlite:///./erp.db"
    environment: str = "development"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
```

- [ ] **Step 2: Write `app/database.py`**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 3: Write failing test**

```python
# tests/test_database.py
from app.database import engine, Base

def test_engine_connects():
    with engine.connect() as conn:
        assert conn is not None

def test_base_metadata_exists():
    assert Base.metadata is not None
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
pytest tests/test_database.py -v
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add app/config.py app/database.py tests/test_database.py
git commit -m "feat: add config and database setup"
```

---

## Task 3: User model & auth service

**Files:**
- Create: `erp/app/auth/models.py`
- Create: `erp/app/auth/service.py`
- Create: `erp/tests/test_auth.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_auth.py
import pytest
from app.auth.service import hash_password, verify_password, create_access_token, decode_access_token

def test_hash_password_produces_different_hash_each_time():
    h1 = hash_password("secret")
    h2 = hash_password("secret")
    assert h1 != h2

def test_verify_password_correct():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed) is True

def test_verify_password_wrong():
    hashed = hash_password("mypassword")
    assert verify_password("wrongpassword", hashed) is False

def test_create_and_decode_token():
    token = create_access_token({"sub": "user@example.com", "role": "admin"})
    payload = decode_access_token(token)
    assert payload["sub"] == "user@example.com"
    assert payload["role"] == "admin"

def test_decode_invalid_token_raises():
    with pytest.raises(Exception):
        decode_access_token("not.a.valid.token")
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pytest tests/test_auth.py -v
```

Expected: ImportError — `app.auth.service` does not exist yet

- [ ] **Step 3: Write `app/auth/models.py`**

```python
from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="viewer")
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 4: Write `app/auth/service.py`**

```python
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt
from app.config import settings

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
pytest tests/test_auth.py -v
```

Expected: 5 passed

- [ ] **Step 6: Commit**

```bash
git add app/auth/models.py app/auth/service.py tests/test_auth.py
git commit -m "feat: add User model and auth service (hash, JWT)"
```

---

## Task 4: Auth dependencies & login/logout routes

**Files:**
- Create: `erp/app/auth/dependencies.py`
- Create: `erp/app/auth/router.py`
- Create: `erp/app/templates/auth/login.html`
- Modify: `erp/app/main.py`

- [ ] **Step 1: Write failing route tests**

```python
# tests/test_routes.py
import pytest
from tests.conftest import TestingSessionLocal
from app.auth.models import User
from app.auth.service import hash_password

@pytest.fixture
def admin_user():
    db = TestingSessionLocal()
    user = User(
        email="admin@erp.com",
        password_hash=hash_password("admin123"),
        full_name="Admin User",
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

def test_get_login_page(client):
    response = client.get("/login")
    assert response.status_code == 200
    assert "login" in response.text.lower()

def test_login_with_valid_credentials(client, admin_user):
    response = client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    assert response.status_code in (200, 302)
    assert "erp_token" in response.cookies or response.headers.get("location") == "/dashboard"

def test_login_with_invalid_credentials(client, admin_user):
    response = client.post("/login", data={"email": "admin@erp.com", "password": "wrongpass"})
    assert response.status_code == 200
    assert "invalid" in response.text.lower() or "incorrect" in response.text.lower()

def test_dashboard_requires_auth(client):
    response = client.get("/dashboard", follow_redirects=False)
    assert response.status_code == 302
    assert "/login" in response.headers["location"]

def test_dashboard_accessible_when_logged_in(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert "dashboard" in response.text.lower()
```

- [ ] **Step 2: Run to confirm they fail**

```bash
pytest tests/test_routes.py -v
```

Expected: errors — routes not defined yet

- [ ] **Step 3: Write `app/auth/dependencies.py`**

```python
from fastapi import Cookie, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.service import decode_access_token
from app.auth.models import User

def get_current_user(erp_token: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> User:
    if not erp_token:
        raise HTTPException(status_code=status.HTTP_302_FOUND, headers={"Location": "/login"})
    try:
        payload = decode_access_token(erp_token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_302_FOUND, headers={"Location": "/login"})
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_302_FOUND, headers={"Location": "/login"})
    return user

def require_role(*roles: str):
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return checker
```

- [ ] **Step 4: Write `app/auth/router.py`**

```python
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.models import User
from app.auth.service import verify_password, create_access_token

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("auth/login.html", {"request": request, "error": None})

@router.post("/login")
def login(request: Request, email: str = Form(), password: str = Form(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return templates.TemplateResponse(
            "auth/login.html",
            {"request": request, "error": "Invalid email or password"},
            status_code=400,
        )
    token = create_access_token({"sub": user.email, "role": user.role})
    response = RedirectResponse(url="/dashboard", status_code=302)
    response.set_cookie("erp_token", token, httponly=True, samesite="lax")
    return response

@router.post("/logout")
def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("erp_token")
    return response
```

- [ ] **Step 5: Write `app/templates/auth/login.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AeroERP — Login</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen">
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 w-full max-w-sm">
    <h1 class="text-2xl font-bold text-slate-900 mb-1">AeroERP</h1>
    <p class="text-slate-500 text-sm mb-8">Sign in to your account</p>

    {% if error %}
    <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
      {{ error }}
    </div>
    {% endif %}

    <form method="post" action="/login" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input type="email" name="email" required
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@company.com">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input type="password" name="password" required
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors">
        Sign in
      </button>
    </form>
  </div>
</body>
</html>
```

- [ ] **Step 6: Update `app/main.py` to register the auth router**

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router

def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    return app

app = create_app()
```

- [ ] **Step 7: Run route tests**

```bash
pytest tests/test_routes.py -v
```

Expected: 5 passed

- [ ] **Step 8: Commit**

```bash
git add app/auth/ app/templates/auth/ app/main.py tests/test_routes.py
git commit -m "feat: add login/logout routes, JWT cookie auth, and login page"
```

---

## Task 5: Base shell layout (topbar + sidebar)

**Files:**
- Create: `erp/app/templates/base.html`
- Create: `erp/app/templates/partials/_topbar.html`
- Create: `erp/app/templates/partials/_sidebar.html`
- Create: `erp/app/dashboard/router.py`
- Create: `erp/app/templates/dashboard/index.html`
- Modify: `erp/app/main.py`

- [ ] **Step 1: Write `app/templates/partials/_topbar.html`**

```html
<header class="bg-blue-800 text-white flex items-center justify-between px-6 h-14 flex-shrink-0">
  <span class="font-extrabold text-lg tracking-tight">AERO<span class="text-blue-300">ERP</span></span>
  <div class="flex items-center gap-5 text-sm">
    <span class="cursor-pointer hover:text-blue-200">🔍</span>
    <span class="cursor-pointer hover:text-blue-200">🔔</span>
    <span class="bg-blue-300 text-blue-900 font-bold rounded-full w-8 h-8 flex items-center justify-center text-xs">
      {{ current_user.full_name[:2].upper() }}
    </span>
    <form method="post" action="/logout" class="inline">
      <button class="text-blue-300 hover:text-white text-xs">Sign out</button>
    </form>
  </div>
</header>
```

- [ ] **Step 2: Write `app/templates/partials/_sidebar.html`**

```html
<nav class="bg-slate-900 w-52 flex-shrink-0 flex flex-col py-4 gap-0.5 overflow-y-auto">
  <p class="text-slate-500 text-xs font-bold uppercase tracking-widest px-4 pt-2 pb-1">Overview</p>
  <a href="/dashboard" hx-get="/dashboard" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-none transition-colors {% if active == 'dashboard' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>📊</span> Dashboard
  </a>
  <a href="/reports" hx-get="/reports" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'reports' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>📈</span> Reports
  </a>

  <p class="text-slate-500 text-xs font-bold uppercase tracking-widest px-4 pt-4 pb-1">Operations</p>
  <a href="/logistics" hx-get="/logistics" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'logistics' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>🚢</span> Logistics
  </a>
  <a href="/manufacturing" hx-get="/manufacturing" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'manufacturing' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>🏭</span> Manufacturing
  </a>
  <a href="/inventory" hx-get="/inventory" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'inventory' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>📦</span> Inventory
  </a>
  <a href="/procurement" hx-get="/procurement" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'procurement' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>🛒</span> Procurement
  </a>

  <p class="text-slate-500 text-xs font-bold uppercase tracking-widest px-4 pt-4 pb-1">Business</p>
  <a href="/finance" hx-get="/finance" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'finance' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>💰</span> Finance
  </a>
  <a href="/crm" hx-get="/crm" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'crm' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>🤝</span> CRM & Sales
  </a>
  <a href="/hr" hx-get="/hr" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'hr' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>👥</span> HR & Payroll
  </a>

  <p class="text-slate-500 text-xs font-bold uppercase tracking-widest px-4 pt-4 pb-1">System</p>
  <a href="/files" hx-get="/files" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'files' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>📂</span> File Manager
  </a>
  {% if current_user.role == 'admin' %}
  <a href="/settings" hx-get="/settings" hx-target="#main-content" hx-push-url="true"
    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {% if active == 'settings' %}bg-blue-700 text-white font-semibold{% endif %}">
    <span>⚙️</span> Settings
  </a>
  {% endif %}
</nav>
```

- [ ] **Step 3: Write `app/templates/base.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}AeroERP{% endblock %}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/htmx.org@2.0.0"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-slate-50 flex flex-col h-screen overflow-hidden">

  {% include "partials/_topbar.html" %}

  <div class="flex flex-1 overflow-hidden">
    {% include "partials/_sidebar.html" %}

    <main id="main-content" class="flex-1 overflow-y-auto p-6">
      {% block content %}{% endblock %}
    </main>
  </div>

</body>
</html>
```

- [ ] **Step 4: Write `app/templates/dashboard/index.html`**

```html
{% extends "base.html" %}
{% set active = "dashboard" %}
{% block title %}Dashboard — AeroERP{% endblock %}

{% block content %}
<div class="mb-6">
  <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
  <p class="text-slate-500 text-sm mt-1">Welcome back, {{ current_user.full_name }}</p>
</div>

<!-- KPI Cards -->
<div class="grid grid-cols-4 gap-4 mb-6">
  {% for kpi in kpis %}
  <div class="bg-white rounded-xl border border-slate-200 p-5">
    <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">{{ kpi.label }}</p>
    <p class="text-3xl font-extrabold text-slate-900">{{ kpi.value }}</p>
    <p class="text-xs mt-1 {% if kpi.up %}text-green-600{% else %}text-red-500{% endif %}">
      {{ kpi.change }}
    </p>
  </div>
  {% endfor %}
</div>

<!-- Charts placeholder (populated in Plan 4) -->
<div class="grid grid-cols-3 gap-4 mb-6">
  <div class="col-span-2 bg-white rounded-xl border border-slate-200 p-5 h-48 flex items-center justify-center">
    <p class="text-slate-400 text-sm">Shipment chart — coming in Plan 3</p>
  </div>
  <div class="bg-white rounded-xl border border-slate-200 p-5 h-48 flex items-center justify-center">
    <p class="text-slate-400 text-sm">Inventory chart — coming in Plan 3</p>
  </div>
</div>

<!-- File Drop Zone -->
<div
  hx-encoding="multipart/form-data"
  hx-post="/files/upload"
  hx-target="#upload-result"
  x-data="{ dragging: false }"
  @dragover.prevent="dragging = true"
  @dragleave.prevent="dragging = false"
  @drop.prevent="dragging = false"
  class="border-2 border-dashed rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-colors"
  :class="dragging ? 'border-blue-400 bg-blue-50' : 'border-blue-200 bg-blue-50/50'">
  <span class="text-3xl">📂</span>
  <div>
    <p class="text-blue-700 font-semibold text-sm">Drop files here to import data</p>
    <p class="text-slate-500 text-xs mt-0.5">CSV, Excel, PDF, Images, JSON — ERP auto-detects schema and updates modules</p>
  </div>
</div>
<div id="upload-result"></div>
{% endblock %}
```

- [ ] **Step 5: Write `app/dashboard/router.py`**

```python
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.auth.dependencies import get_current_user
from app.auth.models import User

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

PLACEHOLDER_KPIS = [
    {"label": "Active Shipments", "value": "—", "change": "No data yet", "up": True},
    {"label": "Production Orders", "value": "—", "change": "No data yet", "up": True},
    {"label": "Revenue (Month)", "value": "—", "change": "No data yet", "up": True},
    {"label": "Open POs", "value": "—", "change": "No data yet", "up": True},
]

@router.get("/", response_class=HTMLResponse)
@router.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, current_user: User = Depends(get_current_user)):
    return templates.TemplateResponse("dashboard/index.html", {
        "request": request,
        "current_user": current_user,
        "kpis": PLACEHOLDER_KPIS,
    })
```

- [ ] **Step 6: Update `app/main.py`**

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router
from app.dashboard.router import router as dashboard_router

def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    app.include_router(dashboard_router)
    return app

app = create_app()
```

- [ ] **Step 7: Run all tests**

```bash
pytest -v
```

Expected: all tests pass

- [ ] **Step 8: Smoke test in browser**

```bash
uvicorn app.main:app --reload
```

Visit http://localhost:8000 — should redirect to /login. Log in with seed user (next task).

- [ ] **Step 9: Commit**

```bash
git add app/templates/ app/dashboard/ app/main.py
git commit -m "feat: add shell layout with topbar, sidebar, and dashboard skeleton"
```

---

## Task 6: Database migrations & seed data

**Files:**
- Create: `erp/alembic.ini`
- Modify: `erp/alembic/env.py`
- Create: `erp/seed.py`

- [ ] **Step 1: Initialise Alembic**

```bash
alembic init alembic
```

- [ ] **Step 2: Update `alembic/env.py` to use app models**

Replace the `target_metadata` section:

```python
# At the top of env.py, add:
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import Base
from app.config import settings
from app.auth.models import User  # import all models so Alembic sees them

# Replace the existing target_metadata line with:
target_metadata = Base.metadata

# Replace the existing config.set_main_option line with:
config.set_main_option("sqlalchemy.url", settings.database_url)
```

- [ ] **Step 3: Generate and apply the first migration**

```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

Expected: `erp.db` created with `users` table

- [ ] **Step 4: Write `seed.py`**

```python
#!/usr/bin/env python
"""Creates a default admin user. Run once after first migration."""
from app.database import SessionLocal
from app.auth.models import User
from app.auth.service import hash_password

def seed():
    db = SessionLocal()
    existing = db.query(User).filter(User.email == "admin@erp.local").first()
    if existing:
        print("Admin user already exists — skipping seed.")
        db.close()
        return
    admin = User(
        email="admin@erp.local",
        password_hash=hash_password("admin123"),
        full_name="Admin",
        role="admin",
    )
    db.add(admin)
    db.commit()
    print("Created admin user: admin@erp.local / admin123")
    db.close()

if __name__ == "__main__":
    seed()
```

- [ ] **Step 5: Run seed**

```bash
python seed.py
```

Expected: `Created admin user: admin@erp.local / admin123`

- [ ] **Step 6: Test login in browser**

```bash
uvicorn app.main:app --reload
```

Go to http://localhost:8000/login, sign in with `admin@erp.local` / `admin123`. You should land on the dashboard with topbar and all sidebar items visible.

- [ ] **Step 7: Commit**

```bash
git add alembic/ alembic.ini seed.py
git commit -m "feat: add Alembic migrations and admin seed user"
```

---

## Task 7: User management (Admin Settings page)

**Files:**
- Create: `erp/app/auth/admin_router.py`
- Create: `erp/app/templates/settings/users.html`
- Modify: `erp/app/main.py`

- [ ] **Step 1: Write failing tests**

```python
# Add to tests/test_routes.py

def test_settings_page_accessible_by_admin(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/settings/users")
    assert response.status_code == 200
    assert "users" in response.text.lower()

def test_settings_page_blocked_for_viewer(client):
    db = TestingSessionLocal()
    viewer = User(
        email="viewer@erp.com",
        password_hash=hash_password("pass123"),
        full_name="Viewer User",
        role="viewer",
    )
    db.add(viewer)
    db.commit()
    db.close()
    client.post("/login", data={"email": "viewer@erp.com", "password": "pass123"})
    response = client.get("/settings/users")
    assert response.status_code == 403

def test_create_user_as_admin(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post("/settings/users", data={
        "email": "newuser@erp.com",
        "full_name": "New User",
        "role": "manager",
        "password": "newpass123",
    })
    assert response.status_code in (200, 302)
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "newuser@erp.com").first()
    assert user is not None
    assert user.role == "manager"
    db.close()
```

- [ ] **Step 2: Run to confirm they fail**

```bash
pytest tests/test_routes.py::test_settings_page_accessible_by_admin -v
```

Expected: FAIL — route not defined

- [ ] **Step 3: Write `app/auth/admin_router.py`**

```python
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import require_role
from app.auth.models import User
from app.auth.service import hash_password

router = APIRouter(prefix="/settings")
templates = Jinja2Templates(directory="app/templates")

@router.get("/users", response_class=HTMLResponse)
def list_users(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    users = db.query(User).filter(User.is_active == True).all()
    return templates.TemplateResponse("settings/users.html", {
        "request": request,
        "current_user": current_user,
        "users": users,
    })

@router.post("/users")
def create_user(
    request: Request,
    email: str = Form(),
    full_name: str = Form(),
    role: str = Form(),
    password: str = Form(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    user = User(
        email=email,
        full_name=full_name,
        role=role,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    return RedirectResponse(url="/settings/users", status_code=302)
```

- [ ] **Step 4: Write `app/templates/settings/users.html`**

```html
{% extends "base.html" %}
{% set active = "settings" %}
{% block title %}Users — AeroERP{% endblock %}

{% block content %}
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold text-slate-900">User Management</h1>
    <p class="text-slate-500 text-sm mt-1">Manage team access and roles</p>
  </div>
  <button onclick="document.getElementById('new-user-form').classList.toggle('hidden')"
    class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
    + Add User
  </button>
</div>

<!-- Add user form (hidden by default) -->
<div id="new-user-form" class="hidden bg-white border border-slate-200 rounded-xl p-6 mb-6">
  <h2 class="font-semibold text-slate-900 mb-4">New User</h2>
  <form method="post" action="/settings/users" class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
      <input name="full_name" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
      <input name="email" type="email" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
      <select name="role" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="viewer">Viewer</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
      <input name="password" type="password" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
    </div>
    <div class="col-span-2">
      <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
        Create User
      </button>
    </div>
  </form>
</div>

<!-- Users table -->
<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-slate-900 text-white">
      <tr>
        <th class="text-left px-5 py-3 font-semibold">Name</th>
        <th class="text-left px-5 py-3 font-semibold">Email</th>
        <th class="text-left px-5 py-3 font-semibold">Role</th>
        <th class="text-left px-5 py-3 font-semibold">Joined</th>
      </tr>
    </thead>
    <tbody>
      {% for user in users %}
      <tr class="border-t border-slate-100 hover:bg-slate-50">
        <td class="px-5 py-3 font-medium text-slate-900">{{ user.full_name }}</td>
        <td class="px-5 py-3 text-slate-600">{{ user.email }}</td>
        <td class="px-5 py-3">
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold
            {% if user.role == 'admin' %}bg-amber-100 text-amber-700
            {% elif user.role == 'manager' %}bg-blue-100 text-blue-700
            {% else %}bg-green-100 text-green-700{% endif %}">
            {{ user.role }}
          </span>
        </td>
        <td class="px-5 py-3 text-slate-500">{{ user.created_at.strftime('%b %d, %Y') }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>
{% endblock %}
```

- [ ] **Step 5: Add admin router to `app/main.py`**

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router
from app.auth.admin_router import router as admin_router
from app.dashboard.router import router as dashboard_router

def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(dashboard_router)
    return app

app = create_app()
```

- [ ] **Step 6: Run all tests**

```bash
pytest -v
```

Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add app/auth/admin_router.py app/templates/settings/ app/main.py tests/test_routes.py
git commit -m "feat: add user management page (admin only)"
```

---

## Task 8: Docker setup

**Files:**
- Create: `erp/Dockerfile`
- Create: `erp/docker-compose.yml`
- Create: `erp/docker-compose.prod.yml`

- [ ] **Step 1: Write `Dockerfile`**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY . .

RUN mkdir -p uploads

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

- [ ] **Step 2: Write `docker-compose.yml` (local — SQLite)**

```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./erp.db:/app/erp.db
      - ./uploads:/app/uploads
    environment:
      - DATABASE_URL=sqlite:///./erp.db
      - SECRET_KEY=dev-secret-key-change-in-production
      - ENVIRONMENT=development
```

- [ ] **Step 3: Write `docker-compose.prod.yml` (cloud — Postgres + nginx)**

```yaml
services:
  app:
    build: .
    environment:
      - DATABASE_URL=postgresql://erp:${POSTGRES_PASSWORD}@db:5432/erp
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=erp
      - POSTGRES_USER=erp
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app

volumes:
  uploads:
  pgdata:
```

- [ ] **Step 4: Build and run locally**

```bash
docker compose build
docker compose up
```

Expected: server running at http://localhost:8000, login works.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml docker-compose.prod.yml
git commit -m "feat: add Docker and Docker Compose for local and cloud deployment"
```

---

## Task 9: End-to-end smoke test

- [ ] **Step 1: Write full integration test**

```python
# tests/test_e2e.py
def test_full_login_dashboard_logout_flow(client):
    from tests.conftest import TestingSessionLocal
    from app.auth.models import User
    from app.auth.service import hash_password

    # Create user
    db = TestingSessionLocal()
    user = User(email="e2e@erp.com", password_hash=hash_password("e2epass"), full_name="E2E User", role="admin")
    db.add(user)
    db.commit()
    db.close()

    # Cannot access dashboard without login
    r = client.get("/dashboard", follow_redirects=False)
    assert r.status_code == 302
    assert "/login" in r.headers["location"]

    # Login
    r = client.post("/login", data={"email": "e2e@erp.com", "password": "e2epass"})
    assert r.status_code in (200, 302)

    # Can access dashboard
    r = client.get("/dashboard")
    assert r.status_code == 200
    assert "E2E User" in r.text

    # Sidebar items are present
    assert "Logistics" in r.text
    assert "Finance" in r.text
    assert "Settings" in r.text  # admin sees Settings

    # Logout
    r = client.post("/logout", follow_redirects=False)
    assert r.status_code == 302
    assert "/login" in r.headers["location"]

    # Cannot access dashboard after logout
    r = client.get("/dashboard", follow_redirects=False)
    assert r.status_code == 302
```

- [ ] **Step 2: Run all tests one final time**

```bash
pytest -v
```

Expected: all pass

- [ ] **Step 3: Final commit**

```bash
git add tests/test_e2e.py
git commit -m "test: add end-to-end smoke test for login/dashboard/logout flow"
```

---

## What's next

Plan 1 complete. The ERP has:
- ✅ Full project structure
- ✅ Auth (JWT + bcrypt + RBAC)
- ✅ Shell layout (topbar + sidebar with all 8 module links)
- ✅ Dashboard skeleton (KPI placeholders + file drop zone)
- ✅ User management (Admin)
- ✅ Docker (local + cloud)
- ✅ Alembic migrations

**Next:** Run Plan 2 (File Ingestion) to add the adaptive file import system, then Plan 3 (Operations Modules) and Plan 4 (Business Modules + Reports).
