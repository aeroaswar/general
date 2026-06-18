# ERP — Plan 2: File Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full file ingestion pipeline — drag-and-drop upload, type detection, schema analysis, column mapping preview UI, confirm import, and File Manager page — so any CSV/Excel/PDF/Image/JSON dropped anywhere in the ERP is parsed, routed to the right module, and imported live via HTMX.

**Architecture:** `POST /upload` receives a file via HTMX form, parses it, detects the target module via keyword matching, and returns an HTMX fragment showing a column mapping table. The user confirms, `POST /upload/confirm` writes rows to the appropriate module table (stub models created in this plan), and a success fragment swaps in. The drop zone is an HTMX form in `base.html` — Alpine.js handles drag-and-drop by populating the file input and triggering `htmx.trigger(form, 'submit')`. HTMX handles the actual POST and DOM swap. No manual `innerHTML` assignment in JavaScript. The File Manager (`GET /files`) lists all uploaded files with import status.

**Tech Stack:** pandas, openpyxl, pdfplumber, Pillow (file parsing) · FastAPI UploadFile · SQLAlchemy stub models for all 7 operational modules · HTMX form upload + Alpine.js drag-and-drop · Jinja2 HTMX fragments

---

## Plan Context

Plan 1 is complete (17 tests passing). The ERP has auth, JWT, RBAC, shell layout, dashboard skeleton, user management, Alembic migrations, and Docker. The sidebar already has a `/files` link. The drop zone in `dashboard/index_partial.html` is a stub — Plan 2 replaces it with a fully wired HTMX form in `base.html`.

---

## File Structure

```
erp/
├── app/
│   ├── files/
│   │   ├── __init__.py              # NEW: empty
│   │   ├── models.py                # NEW: UploadedFile (files table)
│   │   ├── parser.py                # NEW: detect_type, parse_file → ParseResult
│   │   ├── schema_analyzer.py       # NEW: detect_module, map_columns, MODULE_FIELDS
│   │   ├── importer.py              # NEW: import_rows(db, module, mapping, rows) → int
│   │   └── router.py                # NEW: POST /upload, POST /upload/confirm, GET /files
│   ├── modules/
│   │   ├── __init__.py              # NEW: empty
│   │   └── models.py                # NEW: Shipment, InventoryItem, Invoice, Employee,
│   │                                #       ProductionOrder, PurchaseOrder, Customer
│   ├── main.py                      # MODIFY: register files router
│   └── templates/
│       ├── base.html                # MODIFY: global HTMX drop zone form
│       ├── dashboard/
│       │   └── index_partial.html   # MODIFY: remove local drop zone stub
│       └── files/
│           ├── manager.html         # NEW: extends base.html
│           ├── manager_partial.html # NEW: file list table (HTMX fragment)
│           ├── mapping_preview.html # NEW: column mapping form (HTMX fragment)
│           └── import_success.html  # NEW: success confirmation (HTMX fragment)
├── alembic/versions/
│   └── <hash>_create_files_and_module_tables.py  # NEW
├── pyproject.toml                   # MODIFY: add pandas, openpyxl, pdfplumber, Pillow
└── tests/
    ├── test_file_model.py           # NEW
    ├── test_module_models.py        # NEW
    ├── test_file_parser.py          # NEW
    ├── test_schema_analyzer.py      # NEW
    └── test_upload.py               # NEW
```

---

## Task 1: Add file parsing dependencies

**Files:**
- Modify: `erp/pyproject.toml`

- [ ] **Step 1: Read `pyproject.toml` current state**

```bash
cat "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp/pyproject.toml"
```

- [ ] **Step 2: Update `pyproject.toml` — add parsing dependencies**

The full `dependencies` list should be:

```toml
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
    "pandas>=2.2.0",
    "openpyxl>=3.1.2",
    "pdfplumber>=0.11.0",
    "Pillow>=10.3.0",
]
```

- [ ] **Step 3: Install dependencies**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && uv pip install -e .
```

Expected: installs without error, shows pandas, openpyxl, pdfplumber, Pillow in output.

- [ ] **Step 4: Verify imports work**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && python -c "import pandas; import openpyxl; import pdfplumber; from PIL import Image; print('all imports OK')"
```

Expected: `all imports OK`

- [ ] **Step 5: Confirm existing tests still pass**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 17 tests pass

- [ ] **Step 6: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add pyproject.toml && git commit -m "chore: add pandas, openpyxl, pdfplumber, Pillow dependencies"
```

---

## Task 2: UploadedFile model

**Files:**
- Create: `erp/app/files/__init__.py`
- Create: `erp/app/files/models.py`
- Modify: `erp/tests/conftest.py`
- Create: `erp/tests/test_file_model.py`

- [ ] **Step 1: Create directory**

```bash
mkdir -p "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp/app/files"
touch "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp/app/files/__init__.py"
```

- [ ] **Step 2: Write `app/files/models.py`**

```python
from datetime import datetime
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class UploadedFile(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(500), nullable=False)       # stored name: uuid + original
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)               # bytes
    uploaded_by: Mapped[int] = mapped_column(Integer, nullable=False)        # user id
    module_target: Mapped[str | None] = mapped_column(String(50))
    imported_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<UploadedFile id={self.id} name={self.original_name!r} module={self.module_target!r}>"
```

- [ ] **Step 3: Write failing test**

Create `tests/test_file_model.py`:

```python
from app.files.models import UploadedFile


def test_uploaded_file_model_fields(db):
    f = UploadedFile(
        filename="abc123_shipments.csv",
        original_name="shipments.csv",
        mime_type="text/csv",
        size=1024,
        uploaded_by=1,
        module_target="logistics",
    )
    db.add(f)
    db.commit()
    db.refresh(f)

    assert f.id is not None
    assert f.original_name == "shipments.csv"
    assert f.imported_at is None
    assert f.module_target == "logistics"
```

- [ ] **Step 4: Run to confirm it fails**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_file_model.py -v
```

Expected: FAIL — `no such table: files`

- [ ] **Step 5: Register model with test DB — add import to `tests/conftest.py`**

Read `tests/conftest.py`, then add after the existing imports:

```python
from app.files.models import UploadedFile  # noqa: F401 — registers table with Base
```

- [ ] **Step 6: Run test again**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_file_model.py -v
```

Expected: PASS

- [ ] **Step 7: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 18 tests pass

- [ ] **Step 8: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/files/ tests/conftest.py tests/test_file_model.py && git commit -m "feat: add UploadedFile model (files table)"
```

---

## Task 3: Module stub models

**Files:**
- Create: `erp/app/modules/__init__.py`
- Create: `erp/app/modules/models.py`
- Modify: `erp/tests/conftest.py`
- Create: `erp/tests/test_module_models.py`

- [ ] **Step 1: Create directory**

```bash
mkdir -p "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp/app/modules"
touch "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp/app/modules/__init__.py"
```

- [ ] **Step 2: Write `app/modules/models.py`**

```python
from datetime import datetime
from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str | None] = mapped_column(String(100))
    origin_port: Mapped[str | None] = mapped_column(String(100))
    destination: Mapped[str | None] = mapped_column(String(100))
    cargo_type: Mapped[str | None] = mapped_column(String(100))
    weight: Mapped[float | None] = mapped_column(Float)
    eta: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str | None] = mapped_column(String(100))
    name: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[int | None] = mapped_column(Integer)
    location: Mapped[str | None] = mapped_column(String(100))
    reorder_point: Mapped[int | None] = mapped_column(Integer)
    unit_cost: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str | None] = mapped_column(String(100))
    amount: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str | None] = mapped_column(String(10))
    due_date: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="pending")
    pdf_path: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    department: Mapped[str | None] = mapped_column(String(100))
    position: Mapped[str | None] = mapped_column(String(100))
    salary: Mapped[float | None] = mapped_column(Float)
    start_date: Mapped[str | None] = mapped_column(String(50))
    photo_path: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str | None] = mapped_column(String(100))
    product: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    start_date: Mapped[str | None] = mapped_column(String(50))
    end_date: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str | None] = mapped_column(String(100))
    total_amount: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    expected_date: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="prospect")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

- [ ] **Step 3: Write failing tests**

Create `tests/test_module_models.py`:

```python
from app.modules.models import (
    Customer, Employee, InventoryItem, Invoice,
    ProductionOrder, PurchaseOrder, Shipment,
)


def test_shipment_model(db):
    s = Shipment(reference="SHP001", origin_port="Shanghai", destination="Rotterdam", eta="2026-04-15")
    db.add(s)
    db.commit()
    db.refresh(s)
    assert s.id is not None
    assert s.status == "pending"


def test_inventory_item_model(db):
    item = InventoryItem(sku="SKU-001", name="Widget A", quantity=100, location="Rack-A1")
    db.add(item)
    db.commit()
    db.refresh(item)
    assert item.id is not None
    assert item.quantity == 100


def test_customer_model(db):
    c = Customer(name="Acme Corp", email="info@acme.com")
    db.add(c)
    db.commit()
    db.refresh(c)
    assert c.id is not None
    assert c.status == "prospect"
```

- [ ] **Step 4: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_module_models.py -v
```

Expected: FAIL — `no such table: shipments`

- [ ] **Step 5: Register module models with test DB — add to `tests/conftest.py`**

Read `tests/conftest.py`, then add after the `UploadedFile` import line:

```python
from app.modules.models import (  # noqa: F401 — registers tables with Base
    Customer, Employee, InventoryItem, Invoice,
    ProductionOrder, PurchaseOrder, Shipment,
)
```

- [ ] **Step 6: Run tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_module_models.py -v
```

Expected: 3 tests PASS

- [ ] **Step 7: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 21 tests pass

- [ ] **Step 8: Generate and apply Alembic migration**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && alembic revision --autogenerate -m "create files and module tables"
```

Then apply:

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && alembic upgrade head
```

Expected: `Running upgrade ... -> <hash>, create files and module tables`

- [ ] **Step 9: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/modules/ tests/conftest.py tests/test_module_models.py alembic/ && git commit -m "feat: add module stub models and migration (shipments, inventory, invoices, employees, production_orders, purchase_orders, customers)"
```

---

## Task 4: File parser service

**Files:**
- Create: `erp/app/files/parser.py`
- Create: `erp/tests/test_file_parser.py`

- [ ] **Step 1: Write failing tests first**

Create `tests/test_file_parser.py`:

```python
import io
import json
from app.files.parser import detect_type, parse_file


def test_detect_type_csv():
    assert detect_type("data.csv") == "csv"


def test_detect_type_excel():
    assert detect_type("report.xlsx") == "excel"
    assert detect_type("old.xls") == "excel"


def test_detect_type_pdf():
    assert detect_type("invoice.pdf") == "pdf"


def test_detect_type_image():
    assert detect_type("photo.jpg") == "image"
    assert detect_type("pic.jpeg") == "image"
    assert detect_type("icon.png") == "image"
    assert detect_type("banner.webp") == "image"


def test_detect_type_json():
    assert detect_type("data.json") == "json"


def test_detect_type_unknown():
    assert detect_type("mystery.bin") == "unknown"


def test_parse_csv_basic():
    csv_bytes = b"reference,origin_port,eta\nSHP001,Shanghai,2026-04-15\nSHP002,Rotterdam,2026-05-01"
    result = parse_file(csv_bytes, "shipments.csv")
    assert result.file_type == "csv"
    assert result.columns == ["reference", "origin_port", "eta"]
    assert len(result.rows) == 2
    assert result.rows[0]["reference"] == "SHP001"


def test_parse_csv_empty():
    csv_bytes = b"col1,col2\n"
    result = parse_file(csv_bytes, "empty.csv")
    assert result.file_type == "csv"
    assert result.columns == ["col1", "col2"]
    assert result.rows == []


def test_parse_json_list():
    data = [{"sku": "A", "quantity": 10}, {"sku": "B", "quantity": 20}]
    result = parse_file(json.dumps(data).encode(), "items.json")
    assert result.file_type == "json"
    assert result.columns == ["sku", "quantity"]
    assert len(result.rows) == 2
    assert result.rows[0]["sku"] == "A"


def test_parse_json_dict():
    data = {"name": "Acme", "email": "info@acme.com"}
    result = parse_file(json.dumps(data).encode(), "customer.json")
    assert result.file_type == "json"
    assert result.columns == ["name", "email"]
    assert len(result.rows) == 1


def test_parse_image():
    from PIL import Image
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 80), color=(255, 0, 0))
    img.save(buf, format="PNG")
    result = parse_file(buf.getvalue(), "photo.png")
    assert result.file_type == "image"
    assert "width" in result.columns
    assert result.rows[0]["width"] == 100
    assert result.rows[0]["height"] == 80
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_file_parser.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'app.files.parser'`

- [ ] **Step 3: Write `app/files/parser.py`**

```python
import io
import json
import math
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ParseResult:
    file_type: str       # "csv", "excel", "pdf", "image", "json", "unknown"
    columns: list[str]
    rows: list[dict]
    raw_text: str = ""   # extracted text for PDFs


def detect_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".csv":
        return "csv"
    if ext in (".xlsx", ".xls"):
        return "excel"
    if ext == ".pdf":
        return "pdf"
    if ext in (".jpg", ".jpeg", ".png", ".webp"):
        return "image"
    if ext == ".json":
        return "json"
    return "unknown"


def _clean_rows(rows: list[dict]) -> list[dict]:
    """Replace float NaN with None so rows are JSON-safe."""
    return [
        {k: (None if isinstance(v, float) and math.isnan(v) else v) for k, v in row.items()}
        for row in rows
    ]


def parse_file(content: bytes, filename: str) -> ParseResult:
    file_type = detect_type(filename)

    if file_type == "csv":
        import pandas as pd
        df = pd.read_csv(io.BytesIO(content))
        return ParseResult(
            file_type="csv",
            columns=list(df.columns),
            rows=_clean_rows(df.to_dict(orient="records")),
        )

    if file_type == "excel":
        import pandas as pd
        df = pd.read_excel(io.BytesIO(content))
        return ParseResult(
            file_type="excel",
            columns=list(df.columns),
            rows=_clean_rows(df.to_dict(orient="records")),
        )

    if file_type == "json":
        data = json.loads(content)
        if isinstance(data, list) and data and isinstance(data[0], dict):
            columns = list(data[0].keys())
            rows = [r for r in data if isinstance(r, dict)]
        elif isinstance(data, dict):
            columns = list(data.keys())
            rows = [data]
        else:
            columns, rows = [], []
        return ParseResult(file_type="json", columns=columns, rows=rows)

    if file_type == "pdf":
        import pdfplumber
        parts: list[str] = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                parts.append(page.extract_text() or "")
        return ParseResult(file_type="pdf", columns=[], rows=[], raw_text="\n".join(parts))

    if file_type == "image":
        from PIL import Image
        img = Image.open(io.BytesIO(content))
        return ParseResult(
            file_type="image",
            columns=["filename", "width", "height", "format"],
            rows=[{"filename": filename, "width": img.width, "height": img.height, "format": img.format}],
        )

    return ParseResult(file_type="unknown", columns=[], rows=[])
```

- [ ] **Step 4: Run tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_file_parser.py -v
```

Expected: all PASS

- [ ] **Step 5: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 31 tests pass

- [ ] **Step 6: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/files/parser.py tests/test_file_parser.py && git commit -m "feat: add file parser (CSV, Excel, JSON, PDF, image)"
```

---

## Task 5: Schema analyzer

**Files:**
- Create: `erp/app/files/schema_analyzer.py`
- Create: `erp/tests/test_schema_analyzer.py`

- [ ] **Step 1: Write failing tests first**

Create `tests/test_schema_analyzer.py`:

```python
from app.files.schema_analyzer import MODULE_FIELDS, detect_module, map_columns


def test_detect_module_logistics():
    assert detect_module(["shipment_id", "origin_port", "eta"]) == "logistics"


def test_detect_module_inventory():
    assert detect_module(["sku", "quantity", "warehouse", "location"]) == "inventory"


def test_detect_module_finance():
    assert detect_module(["invoice", "amount", "due_date"]) == "finance"


def test_detect_module_hr():
    assert detect_module(["employee", "salary", "department"]) == "hr"


def test_detect_module_manufacturing():
    assert detect_module(["production", "bom", "work_order"]) == "manufacturing"


def test_detect_module_procurement():
    assert detect_module(["supplier", "purchase_order", "vendor"]) == "procurement"


def test_detect_module_crm():
    assert detect_module(["customer", "lead", "pipeline"]) == "crm"


def test_detect_module_unknown():
    assert detect_module(["foo", "bar", "baz"]) == "unknown"


def test_detect_module_picks_highest_score():
    # logistics has more matching keywords than inventory
    assert detect_module(["shipment", "port", "cargo", "sku"]) == "logistics"


def test_map_columns_exact_match():
    mapping = map_columns(["origin_port", "destination", "eta"], "logistics")
    assert mapping["origin_port"] == "origin_port"
    assert mapping["destination"] == "destination"
    assert mapping["eta"] == "eta"


def test_map_columns_unmatched_becomes_skip():
    mapping = map_columns(["totally_unknown_col"], "logistics")
    assert mapping["totally_unknown_col"] == "skip"


def test_map_columns_partial_match():
    # "port" is substring of "origin_port" — should match something
    mapping = map_columns(["port"], "logistics")
    assert mapping["port"] != "skip"


def test_module_fields_all_modules_present():
    required = {"logistics", "inventory", "finance", "hr", "manufacturing", "procurement", "crm"}
    assert required.issubset(set(MODULE_FIELDS.keys()))
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_schema_analyzer.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Write `app/files/schema_analyzer.py`**

```python
MODULE_KEYWORDS: dict[str, set[str]] = {
    "logistics": {"shipment", "port", "cargo", "vessel", "eta", "origin", "transshipment", "bl_number"},
    "inventory": {"sku", "stock", "quantity", "warehouse", "location", "reorder", "batch"},
    "finance": {"invoice", "payment", "amount", "tax", "currency", "due_date", "po_number"},
    "hr": {"employee", "salary", "department", "position", "attendance", "leave"},
    "manufacturing": {"production", "bom", "work_order", "material", "yield", "machine"},
    "procurement": {"supplier", "purchase_order", "receiving", "vendor", "lead_time"},
    "crm": {"customer", "lead", "contract", "deal", "pipeline", "crm"},
}

MODULE_FIELDS: dict[str, list[str]] = {
    "logistics": ["reference", "origin_port", "destination", "cargo_type", "weight", "eta", "status"],
    "inventory": ["sku", "name", "quantity", "location", "reorder_point", "unit_cost"],
    "finance": ["reference", "amount", "currency", "due_date", "status"],
    "hr": ["full_name", "department", "position", "salary", "start_date"],
    "manufacturing": ["reference", "product", "quantity", "status", "start_date", "end_date"],
    "procurement": ["reference", "total_amount", "status", "expected_date"],
    "crm": ["name", "email", "phone", "status"],
    "unknown": [],
}


def detect_module(columns: list[str]) -> str:
    """Return the best-matching module name, or 'unknown'."""
    scores: dict[str, int] = {
        module: sum(
            1 for kw in keywords
            if any(kw in col.lower().replace(" ", "_") for col in columns)
        )
        for module, keywords in MODULE_KEYWORDS.items()
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "unknown"


def map_columns(columns: list[str], module: str) -> dict[str, str]:
    """Return {csv_column: erp_field} best-effort mapping."""
    erp_fields = MODULE_FIELDS.get(module, [])
    mapping: dict[str, str] = {}
    for col in columns:
        col_norm = col.lower().replace(" ", "_")
        if col_norm in erp_fields:
            mapping[col] = col_norm
        else:
            match = next(
                (f for f in erp_fields if f in col_norm or col_norm in f),
                None,
            )
            mapping[col] = match if match else "skip"
    return mapping
```

- [ ] **Step 4: Run tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_schema_analyzer.py -v
```

Expected: all PASS

- [ ] **Step 5: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 44 tests pass

- [ ] **Step 6: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/files/schema_analyzer.py tests/test_schema_analyzer.py && git commit -m "feat: add schema analyzer (module detection + column mapping)"
```

---

## Task 6: Upload route + mapping preview UI

**Files:**
- Create: `erp/app/files/router.py` (POST /upload only)
- Create: `erp/app/templates/files/mapping_preview.html`
- Modify: `erp/app/main.py`
- Create: `erp/tests/test_upload.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_upload.py`:

```python
import io
from app.files.models import UploadedFile


def test_upload_csv_returns_mapping_preview(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    csv_bytes = b"reference,origin_port,destination,eta\nSHP001,Shanghai,Rotterdam,2026-04-15"
    response = client.post(
        "/upload",
        files={"file": ("shipments.csv", io.BytesIO(csv_bytes), "text/csv")},
    )
    assert response.status_code == 200
    assert "logistics" in response.text.lower()
    assert "origin_port" in response.text
    assert "reference" in response.text


def test_upload_saves_file_record(client, admin_user, db):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    csv_bytes = b"sku,quantity,location\nSKU001,50,Rack-A1"
    client.post(
        "/upload",
        files={"file": ("inventory.csv", io.BytesIO(csv_bytes), "text/csv")},
    )
    db.expire_all()
    record = db.query(UploadedFile).filter(UploadedFile.original_name == "inventory.csv").first()
    assert record is not None
    assert record.module_target == "inventory"
    assert record.imported_at is None


def test_upload_requires_login(client):
    csv_bytes = b"col1,col2\n1,2"
    response = client.post(
        "/upload",
        files={"file": ("data.csv", io.BytesIO(csv_bytes), "text/csv")},
        follow_redirects=False,
    )
    assert response.status_code == 302
    assert "/login" in response.headers["location"]


def test_upload_json_file(client, admin_user):
    import json
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    data = [{"shipment": "SHP001", "port": "Shanghai", "cargo": "Electronics"}]
    response = client.post(
        "/upload",
        files={"file": ("ships.json", io.BytesIO(json.dumps(data).encode()), "application/json")},
    )
    assert response.status_code == 200
    assert "logistics" in response.text.lower() or "shipment" in response.text.lower()
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_upload.py -v
```

Expected: FAIL — 404 (route not defined)

- [ ] **Step 3: Create templates directory**

```bash
mkdir -p "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp/app/templates/files"
```

- [ ] **Step 4: Write `app/templates/files/mapping_preview.html`**

This is an HTMX fragment — does NOT extend `base.html`. The form uses `hx-post` so it submits via HTMX and swaps back into `#upload-result`.

```html
<div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
  <div class="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
    <div>
      <p class="font-semibold text-sm">{{ file_name }}</p>
      <p class="text-slate-400 text-xs mt-0.5">
        Detected module:
        <span class="text-blue-300 font-semibold capitalize">{{ module }}</span>
        &middot; {{ total_rows }} row{{ 's' if total_rows != 1 else '' }}
        &middot; {{ file_type | upper }}
      </p>
    </div>
    <button type="button"
      onclick="document.getElementById('upload-result').textContent=''"
      class="text-slate-400 hover:text-white text-lg leading-none" aria-label="Dismiss">
      &times;
    </button>
  </div>

  <form hx-post="/upload/confirm" hx-target="#upload-result" hx-swap="innerHTML">
    <input type="hidden" name="file_id" value="{{ file_id }}">
    <input type="hidden" name="module" value="{{ module }}">

    <table class="w-full text-sm">
      <thead class="bg-slate-50 border-b border-slate-200">
        <tr>
          <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-1/2">CSV Column</th>
          <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-1/2">Maps to ERP Field</th>
        </tr>
      </thead>
      <tbody>
        {% for col in columns %}
        <tr class="border-t border-slate-100 hover:bg-slate-50">
          <td class="px-5 py-2.5">
            <span class="font-mono text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded">{{ col }}</span>
            <input type="hidden" name="col_{{ loop.index0 }}" value="{{ col }}">
          </td>
          <td class="px-5 py-2.5">
            <select name="field_{{ loop.index0 }}"
              class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-full
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="skip">— skip —</option>
              {% for field in erp_fields %}
              <option value="{{ field }}" {% if mapping.get(col) == field %}selected{% endif %}>
                {{ field }}
              </option>
              {% endfor %}
            </select>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>

    <div class="px-5 py-4 flex items-center gap-3 bg-slate-50 border-t border-slate-100">
      <button type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
        Confirm Import
      </button>
      <button type="button"
        onclick="document.getElementById('upload-result').textContent=''"
        class="text-slate-500 text-sm hover:text-slate-700 px-3 py-2">
        Cancel
      </button>
      <span class="text-xs text-slate-400 ml-auto">
        {{ total_rows }} row{{ 's' if total_rows != 1 else '' }}
        &rarr; <span class="font-semibold capitalize">{{ module }}</span>
      </span>
    </div>
  </form>
</div>
```

- [ ] **Step 5: Write `app/files/router.py`**

```python
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.database import get_db
from app.files.models import UploadedFile
from app.files.parser import parse_file
from app.files.schema_analyzer import MODULE_FIELDS, detect_module, map_columns

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")
UPLOAD_DIR = Path("uploads")


@router.post("/upload", response_class=HTMLResponse)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    filename = file.filename or "upload"
    result = parse_file(content, filename)

    UPLOAD_DIR.mkdir(exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{filename}"
    (UPLOAD_DIR / stored_name).write_bytes(content)

    module = detect_module(result.columns)
    db_file = UploadedFile(
        filename=stored_name,
        original_name=filename,
        mime_type=file.content_type or "application/octet-stream",
        size=len(content),
        uploaded_by=current_user.id,
        module_target=module,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    mapping = map_columns(result.columns, module)
    erp_fields = MODULE_FIELDS.get(module, [])

    return templates.TemplateResponse(
        request,
        "files/mapping_preview.html",
        {
            "file_id": db_file.id,
            "file_name": filename,
            "file_type": result.file_type,
            "module": module,
            "columns": result.columns,
            "mapping": mapping,
            "erp_fields": erp_fields,
            "rows_preview": result.rows[:5],
            "total_rows": len(result.rows),
            "current_user": current_user,
        },
    )
```

- [ ] **Step 6: Register router in `app/main.py`**

Read `app/main.py`, then update to:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router
from app.auth.admin_router import router as admin_router
from app.dashboard.router import router as dashboard_router
from app.files.router import router as files_router


def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(dashboard_router)
    app.include_router(files_router)
    return app


app = create_app()
```

- [ ] **Step 7: Run tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_upload.py -v
```

Expected: 4 tests PASS

- [ ] **Step 8: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 48 tests pass

- [ ] **Step 9: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/files/router.py app/templates/files/mapping_preview.html app/main.py tests/test_upload.py && git commit -m "feat: add upload route with column mapping preview"
```

---

## Task 7: Confirm import + importer + global drop zone

**Files:**
- Create: `erp/app/files/importer.py`
- Modify: `erp/app/files/router.py` (add POST /upload/confirm)
- Create: `erp/app/templates/files/import_success.html`
- Modify: `erp/app/templates/base.html` (global HTMX drop zone)
- Modify: `erp/app/templates/dashboard/index_partial.html` (remove local stub)

- [ ] **Step 1: Write failing tests for confirm import**

Add these to `tests/test_upload.py` (at the bottom of the file):

```python
def test_confirm_import_inserts_rows_and_marks_imported(client, admin_user, db):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})

    csv_bytes = b"reference,origin_port,destination,eta\nSHP001,Shanghai,Rotterdam,2026-04-15\nSHP002,Hamburg,Felixstowe,2026-04-20"
    client.post("/upload", files={"file": ("shipments.csv", io.BytesIO(csv_bytes), "text/csv")})

    db.expire_all()
    db_file = db.query(UploadedFile).filter(UploadedFile.original_name == "shipments.csv").first()
    assert db_file is not None

    confirm_resp = client.post(
        "/upload/confirm",
        data={
            "file_id": str(db_file.id),
            "module": "logistics",
            "col_0": "reference",  "field_0": "reference",
            "col_1": "origin_port", "field_1": "origin_port",
            "col_2": "destination", "field_2": "destination",
            "col_3": "eta",         "field_3": "eta",
        },
    )
    assert confirm_resp.status_code == 200
    assert "2" in confirm_resp.text or "imported" in confirm_resp.text.lower()

    from app.modules.models import Shipment
    db.expire_all()
    shipments = db.query(Shipment).all()
    assert len(shipments) == 2
    assert any(s.reference == "SHP001" for s in shipments)

    db.expire_all()
    db_file = db.get(UploadedFile, db_file.id)
    assert db_file.imported_at is not None


def test_confirm_import_unknown_file_id_returns_error(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post(
        "/upload/confirm",
        data={"file_id": "99999", "module": "logistics"},
    )
    assert response.status_code in (200, 404)
    assert "not found" in response.text.lower()
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_upload.py::test_confirm_import_inserts_rows_and_marks_imported -v
```

Expected: FAIL — route not found

- [ ] **Step 3: Write `app/files/importer.py`**

```python
import math
from sqlalchemy.orm import Session

from app.modules.models import (
    Customer, Employee, InventoryItem, Invoice,
    ProductionOrder, PurchaseOrder, Shipment,
)

MODULE_MODELS = {
    "logistics": Shipment,
    "inventory": InventoryItem,
    "finance": Invoice,
    "hr": Employee,
    "manufacturing": ProductionOrder,
    "procurement": PurchaseOrder,
    "crm": Customer,
}


def _clean(value):
    """Replace float NaN with None."""
    if isinstance(value, float) and math.isnan(value):
        return None
    return value


def import_rows(
    db: Session,
    module: str,
    mapping: dict[str, str],
    rows: list[dict],
) -> int:
    """Insert rows into the target module table. Returns count of inserted rows."""
    model_class = MODULE_MODELS.get(module)
    if model_class is None:
        return 0

    count = 0
    for row in rows:
        kwargs = {
            erp_field: _clean(row[csv_col])
            for csv_col, erp_field in mapping.items()
            if erp_field not in ("skip", "") and csv_col in row
        }
        if kwargs:
            db.add(model_class(**kwargs))
            count += 1

    db.commit()
    return count
```

- [ ] **Step 4: Write `app/templates/files/import_success.html`**

This is an HTMX fragment — no `{% extends %}`:

```html
<div class="bg-white rounded-xl border border-green-200 p-6 shadow-sm">
  <div class="flex items-start gap-4">
    <div class="text-3xl">&#10003;</div>
    <div>
      <h3 class="font-bold text-slate-900 text-base">Import complete</h3>
      <p class="text-slate-600 text-sm mt-1">
        <span class="font-semibold">{{ imported_count }}</span>
        row{{ 's' if imported_count != 1 else '' }} imported into
        <span class="font-semibold capitalize">{{ module }}</span>
        from <span class="text-slate-500">{{ file_name }}</span>.
      </p>
      <button
        onclick="document.getElementById('upload-result').textContent=''"
        class="mt-3 text-blue-600 text-sm hover:underline">
        Dismiss
      </button>
    </div>
  </div>
</div>
```

- [ ] **Step 5: Add `POST /upload/confirm` to `app/files/router.py`**

Read the current `app/files/router.py`. Add these imports at the top of the file (after existing imports):

```python
from datetime import datetime, timezone
from app.files.importer import import_rows
```

Then add this route after the existing `upload_file` function:

```python
@router.post("/upload/confirm", response_class=HTMLResponse)
async def confirm_import(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = await request.form()
    file_id_raw = form.get("file_id", "")
    module = str(form.get("module", "unknown"))

    try:
        file_id = int(file_id_raw)
    except (ValueError, TypeError):
        return HTMLResponse("<p class='text-red-600 p-4'>Invalid file ID.</p>", status_code=400)

    db_file = db.get(UploadedFile, file_id)
    if not db_file:
        return HTMLResponse("<p class='text-red-600 p-4'>File not found.</p>", status_code=404)

    # Reconstruct column mapping from indexed form fields: col_0/field_0, col_1/field_1, ...
    mapping: dict[str, str] = {}
    i = 0
    while f"col_{i}" in form:
        csv_col = str(form[f"col_{i}"])
        erp_field = str(form.get(f"field_{i}", "skip"))
        mapping[csv_col] = erp_field
        i += 1

    file_path = UPLOAD_DIR / db_file.filename
    if not file_path.exists():
        return HTMLResponse("<p class='text-red-600 p-4'>Upload file not found on disk.</p>", status_code=404)

    content = file_path.read_bytes()
    result = parse_file(content, db_file.original_name)

    imported_count = import_rows(db, module, mapping, result.rows)

    db_file.imported_at = datetime.now(timezone.utc)
    db.commit()

    return templates.TemplateResponse(
        request,
        "files/import_success.html",
        {
            "file_name": db_file.original_name,
            "module": module,
            "imported_count": imported_count,
            "current_user": current_user,
        },
    )
```

- [ ] **Step 6: Wire up the global HTMX drop zone in `app/templates/base.html`**

Read `app/templates/base.html`, then replace the entire file with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}AeroERP{% endblock %}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/htmx.org@2.0.0"></script>
  <script src="https://unpkg.com/alpinejs@3.14.1/dist/cdn.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-slate-50 flex flex-col h-screen overflow-hidden">

  {% include "partials/_topbar.html" %}

  <div class="flex flex-1 overflow-hidden">
    {% include "partials/_sidebar.html" %}

    <main id="main-content" class="flex-1 overflow-y-auto p-6">
      {% block content %}{% endblock %}

      <!-- Global file drop zone: available on every page -->
      <div class="mt-8"
        x-data="{ dragging: false, uploading: false }"
        x-init="
          $refs.uploadForm.addEventListener('htmx:beforeRequest', () => { uploading = true; });
          $refs.uploadForm.addEventListener('htmx:afterRequest', () => { uploading = false; });
        "
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="
          dragging = false;
          const file = $event.dataTransfer.files[0];
          if (file) {
            const transfer = new DataTransfer();
            transfer.items.add(file);
            $refs.fileInput.files = transfer.files;
            htmx.trigger($refs.uploadForm, 'submit');
          }
        ">
        <form
          x-ref="uploadForm"
          hx-post="/upload"
          hx-target="#upload-result"
          hx-swap="innerHTML"
          hx-encoding="multipart/form-data"
          @click="$refs.fileInput.click()">
          <div
            :class="dragging ? 'border-blue-400 bg-blue-50' : 'border-blue-200 bg-blue-50/30'"
            class="border-2 border-dashed rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-colors"
            @click.stop>
            <span class="text-3xl" x-text="uploading ? '⏳' : '📂'"></span>
            <div>
              <p class="text-blue-700 font-semibold text-sm"
                x-text="uploading ? 'Uploading...' : 'Drop files here to import data'"></p>
              <p class="text-slate-500 text-xs mt-0.5">CSV, Excel, PDF, Images, JSON &mdash; auto-routed to the right module</p>
            </div>
            <input
              type="file"
              name="file"
              x-ref="fileInput"
              class="hidden"
              accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png,.webp,.json"
              @change="htmx.trigger($refs.uploadForm, 'submit')">
          </div>
        </form>
      </div>
      <div id="upload-result" class="mt-4"></div>
    </main>
  </div>

</body>
</html>
```

- [ ] **Step 7: Remove local drop zone stub from `app/templates/dashboard/index_partial.html`**

Read `app/templates/dashboard/index_partial.html`, then replace the entire file with (remove the drop zone section at the bottom):

```html
{% set active = "dashboard" %}
<div class="mb-6">
  <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
  <p class="text-slate-500 text-sm mt-1">Welcome back, {{ current_user.full_name }}</p>
</div>

<!-- KPI Cards -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

<!-- Charts placeholder -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
  <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 h-48 flex items-center justify-center">
    <p class="text-slate-400 text-sm">Shipment chart &mdash; coming in Plan 3</p>
  </div>
  <div class="bg-white rounded-xl border border-slate-200 p-5 h-48 flex items-center justify-center">
    <p class="text-slate-400 text-sm">Inventory chart &mdash; coming in Plan 3</p>
  </div>
</div>
```

- [ ] **Step 8: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 50 tests pass (48 + 2 new confirm tests)

- [ ] **Step 9: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/files/ app/templates/ tests/test_upload.py && git commit -m "feat: add confirm import, importer service, global HTMX drop zone"
```

---

## Task 8: File Manager page

**Files:**
- Modify: `erp/app/files/router.py` (add GET /files)
- Create: `erp/app/templates/files/manager.html`
- Create: `erp/app/templates/files/manager_partial.html`

- [ ] **Step 1: Write failing tests**

Add to `tests/test_upload.py`:

```python
def test_file_manager_accessible_by_admin(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/files")
    assert response.status_code == 200
    assert "file manager" in response.text.lower() or "files" in response.text.lower()


def test_file_manager_accessible_by_manager(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    mgr = User(email="mgr@erp.com", password_hash=hash_password("pass"), full_name="Mgr", role="manager")
    db.add(mgr)
    db.commit()
    client.post("/login", data={"email": "mgr@erp.com", "password": "pass"})
    response = client.get("/files")
    assert response.status_code == 200


def test_file_manager_blocked_for_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="v@erp.com", password_hash=hash_password("pass"), full_name="Viewer", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "v@erp.com", "password": "pass"})
    response = client.get("/files", follow_redirects=False)
    assert response.status_code == 403


def test_file_manager_shows_uploaded_files(client, admin_user, db):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    csv_bytes = b"sku,quantity\nSKU001,10"
    client.post("/upload", files={"file": ("stock.csv", io.BytesIO(csv_bytes), "text/csv")})
    response = client.get("/files")
    assert response.status_code == 200
    assert "stock.csv" in response.text
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest tests/test_upload.py::test_file_manager_accessible_by_admin -v
```

Expected: FAIL — 404

- [ ] **Step 3: Write `app/templates/files/manager.html`**

```html
{% extends "base.html" %}
{% block title %}File Manager &mdash; AeroERP{% endblock %}

{% block content %}
{% include "files/manager_partial.html" %}
{% endblock %}
```

- [ ] **Step 4: Write `app/templates/files/manager_partial.html`**

```html
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold text-slate-900">File Manager</h1>
    <p class="text-slate-500 text-sm mt-1">All uploaded files and their import status</p>
  </div>
  <span class="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
    {{ files | length }} file{{ 's' if files | length != 1 else '' }}
  </span>
</div>

{% if files %}
<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-slate-900 text-white">
      <tr>
        <th class="text-left px-5 py-3 font-semibold">File</th>
        <th class="text-left px-5 py-3 font-semibold">Type</th>
        <th class="text-left px-5 py-3 font-semibold">Module</th>
        <th class="text-left px-5 py-3 font-semibold">Size</th>
        <th class="text-left px-5 py-3 font-semibold">Status</th>
        <th class="text-left px-5 py-3 font-semibold">Uploaded</th>
      </tr>
    </thead>
    <tbody>
      {% for f in files %}
      <tr class="border-t border-slate-100 hover:bg-slate-50">
        <td class="px-5 py-3 font-medium text-slate-900">{{ f.original_name }}</td>
        <td class="px-5 py-3 text-slate-500 text-xs font-mono">
          {{ f.original_name.rsplit('.', 1)[-1].upper() if '.' in f.original_name else '&mdash;' }}
        </td>
        <td class="px-5 py-3">
          {% if f.module_target and f.module_target != 'unknown' %}
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
            {{ f.module_target }}
          </span>
          {% else %}
          <span class="text-slate-400 text-xs">&mdash;</span>
          {% endif %}
        </td>
        <td class="px-5 py-3 text-slate-500 text-xs">
          {% if f.size < 1024 %}{{ f.size }} B
          {% elif f.size < 1048576 %}{{ (f.size / 1024) | round(1) }} KB
          {% else %}{{ (f.size / 1048576) | round(1) }} MB
          {% endif %}
        </td>
        <td class="px-5 py-3">
          {% if f.imported_at %}
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Imported</span>
          {% else %}
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pending</span>
          {% endif %}
        </td>
        <td class="px-5 py-3 text-slate-400 text-xs">
          {{ f.created_at.strftime('%b %d, %Y') }}
        </td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>
{% else %}
<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
  <p class="text-4xl mb-3">&#128194;</p>
  <p class="text-slate-600 font-medium">No files uploaded yet</p>
  <p class="text-slate-400 text-sm mt-1">Drop a file anywhere to get started</p>
</div>
{% endif %}
```

- [ ] **Step 5: Add `GET /files` route to `app/files/router.py`**

Read the current `app/files/router.py`. Add `from app.auth.dependencies import require_role` to the imports at the top of the file, then add this route at the end:

```python
@router.get("/files", response_class=HTMLResponse)
def file_manager(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
):
    files = db.query(UploadedFile).order_by(UploadedFile.id.desc()).all()
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "files/manager_partial.html" if is_htmx else "files/manager.html"
    return templates.TemplateResponse(
        request,
        template,
        {
            "files": files,
            "current_user": current_user,
            "active": "files",
        },
    )
```

- [ ] **Step 6: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && pytest -v
```

Expected: 54 tests pass (50 + 4 new)

- [ ] **Step 7: Final commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/files/router.py app/templates/files/manager.html app/templates/files/manager_partial.html tests/test_upload.py && git commit -m "feat: add File Manager page (GET /files, admin + manager only)"
```

---

## What's next

Plan 2 complete. The ERP now has:
- File upload endpoint: CSV, Excel, JSON, PDF, images detected and parsed
- Schema analyzer: keyword-based module detection, auto column mapping
- Column mapping preview: HTMX form fragment, per-column ERP field dropdowns
- Confirm import: writes rows to module stub tables, marks file as imported
- Module stub tables: shipments, inventory_items, invoices, employees, production_orders, purchase_orders, customers
- Global HTMX drop zone: wired in base.html on every page, Alpine.js drag-and-drop
- File Manager: lists all uploads with import status (admin + manager only)

**Next:** Run Plan 3 (Operations Modules: Logistics, Inventory, Manufacturing, Procurement) to add full list + detail + create/edit CRUD UI for the operational modules, building on the stub models from Plan 2.
