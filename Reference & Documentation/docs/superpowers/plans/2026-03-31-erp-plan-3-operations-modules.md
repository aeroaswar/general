# ERP — Plan 3: Operations Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full list + create + detail + status-update UI for all four Operations modules (Logistics, Inventory, Manufacturing, Procurement) and wire live KPI counts into the Dashboard.

**Architecture:** Each module follows the same pattern: an `app/{module}/router.py` registers four routes (GET list, POST create, GET detail, POST status), two full-page templates (`list.html`, `detail.html`) extend `base.html`, two HTMX partials (`list_partial.html`, `detail_partial.html`) are fragments with no `{% extends %}`. Viewer role can read all Operations modules; admin and manager can create/edit. Dashboard KPIs query real counts from the stub models.

**Tech Stack:** FastAPI · SQLAlchemy (existing `Shipment`, `InventoryItem`, `ProductionOrder`, `PurchaseOrder` models) · HTMX 2.0 + Alpine.js · Jinja2 · pytest

---

## Plan Context

Plan 2 is complete (57 tests passing). The sidebar already links to `/logistics`, `/inventory`, `/manufacturing`, `/procurement`. The four stub models exist in `app/modules/models.py`. No schema changes are needed — Plan 3 only adds routes, templates, and tests.

Confirmed existing models and their fields:

| Model | Table | Key fields |
|---|---|---|
| `Shipment` | `shipments` | `reference`, `origin_port`, `destination`, `cargo_type`, `weight`, `eta`, `status` (default `"pending"`) |
| `InventoryItem` | `inventory_items` | `sku`, `name`, `quantity`, `location`, `reorder_point`, `unit_cost` |
| `ProductionOrder` | `production_orders` | `reference`, `product`, `quantity`, `status` (default `"pending"`), `start_date`, `end_date` |
| `PurchaseOrder` | `purchase_orders` | `reference`, `total_amount`, `status` (default `"pending"`), `expected_date` |

Status values used in this plan:
- Shipment: `pending` → `in_transit` → `delivered` | `cancelled`
- ProductionOrder: `pending` → `in_progress` → `completed` | `cancelled`
- PurchaseOrder: `pending` → `approved` → `received` | `cancelled`

---

## File Structure

```
erp/
├── app/
│   ├── logistics/
│   │   ├── __init__.py              NEW: empty
│   │   └── router.py                NEW: GET /logistics, POST /logistics, GET /logistics/{id}, POST /logistics/{id}/status
│   ├── inventory/
│   │   ├── __init__.py              NEW: empty
│   │   └── router.py                NEW: GET /inventory, POST /inventory, GET /inventory/{id}
│   ├── manufacturing/
│   │   ├── __init__.py              NEW: empty
│   │   └── router.py                NEW: GET /manufacturing, POST /manufacturing, GET /manufacturing/{id}, POST /manufacturing/{id}/status
│   ├── procurement/
│   │   ├── __init__.py              NEW: empty
│   │   └── router.py                NEW: GET /procurement, POST /procurement, GET /procurement/{id}, POST /procurement/{id}/status
│   ├── main.py                      MODIFY: register 4 new routers
│   ├── dashboard/
│   │   └── router.py                MODIFY: live KPI counts (Task 5)
│   └── templates/
│       ├── logistics/
│       │   ├── list.html            NEW: extends base.html
│       │   ├── list_partial.html    NEW: HTMX fragment — shipment table + create form
│       │   ├── detail.html          NEW: extends base.html
│       │   └── detail_partial.html  NEW: HTMX fragment — shipment fields + status update form
│       ├── inventory/
│       │   ├── list.html            NEW: extends base.html
│       │   ├── list_partial.html    NEW: HTMX fragment — inventory table + create form
│       │   ├── detail.html          NEW: extends base.html
│       │   └── detail_partial.html  NEW: HTMX fragment — item fields
│       ├── manufacturing/
│       │   ├── list.html            NEW: extends base.html
│       │   ├── list_partial.html    NEW: HTMX fragment — production orders table + create form
│       │   ├── detail.html          NEW: extends base.html
│       │   └── detail_partial.html  NEW: HTMX fragment — order fields + status update form
│       └── procurement/
│           ├── list.html            NEW: extends base.html
│           ├── list_partial.html    NEW: HTMX fragment — purchase orders table + create form
│           ├── detail.html          NEW: extends base.html
│           └── detail_partial.html  NEW: HTMX fragment — PO fields + status update form
└── tests/
    ├── test_logistics.py            NEW: 6 tests
    ├── test_inventory.py            NEW: 5 tests
    ├── test_manufacturing.py        NEW: 6 tests
    ├── test_procurement.py          NEW: 6 tests
    └── test_dashboard_kpis.py       NEW: 2 tests
```

---

## Task 1: Logistics module

**Files:**
- Create: `erp/app/logistics/__init__.py`
- Create: `erp/app/logistics/router.py`
- Create: `erp/app/templates/logistics/list.html`
- Create: `erp/app/templates/logistics/list_partial.html`
- Create: `erp/app/templates/logistics/detail.html`
- Create: `erp/app/templates/logistics/detail_partial.html`
- Modify: `erp/app/main.py`
- Create: `erp/tests/test_logistics.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_logistics.py`:

```python
import pytest
from app.modules.models import Shipment


def test_logistics_list_accessible_by_admin(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/logistics")
    assert response.status_code == 200
    assert "logistics" in response.text.lower() or "shipment" in response.text.lower()


def test_logistics_list_accessible_by_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_lg@erp.com", password_hash=hash_password("pass"), full_name="V", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_lg@erp.com", "password": "pass"})
    response = client.get("/logistics")
    assert response.status_code == 200


def test_logistics_create_as_admin(client, admin_user, db):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post("/logistics", data={
        "reference": "SHP-PLAN3-001",
        "origin_port": "Shanghai",
        "destination": "Rotterdam",
        "cargo_type": "General",
        "weight": "5000",
        "eta": "2026-05-01",
    })
    assert response.status_code in (200, 303)
    db.expire_all()
    s = db.query(Shipment).filter(Shipment.reference == "SHP-PLAN3-001").first()
    assert s is not None
    assert s.origin_port == "Shanghai"
    assert s.status == "pending"


def test_logistics_create_blocked_for_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_lg2@erp.com", password_hash=hash_password("pass"), full_name="V2", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_lg2@erp.com", "password": "pass"})
    response = client.post("/logistics", data={"reference": "HACK"})
    assert response.status_code == 403


def test_logistics_detail(client, admin_user, db):
    s = Shipment(reference="SHP-DETAIL-1", origin_port="Hamburg", destination="New York")
    db.add(s)
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get(f"/logistics/{s.id}")
    assert response.status_code == 200
    assert "SHP-DETAIL-1" in response.text
    assert "Hamburg" in response.text


def test_logistics_status_update(client, admin_user, db):
    s = Shipment(reference="SHP-STATUS-1", status="pending")
    db.add(s)
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post(f"/logistics/{s.id}/status", data={"status": "in_transit"})
    assert response.status_code == 200
    db.expire_all()
    s = db.get(Shipment, s.id)
    assert s.status == "in_transit"
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest tests/test_logistics.py -v 2>&1 | tail -15
```

Expected: FAIL — `404` on `/logistics`

- [ ] **Step 3: Create `app/logistics/__init__.py`**

Empty file:

```python
```

- [ ] **Step 4: Create `app/logistics/router.py`**

```python
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.auth.models import User
from app.database import get_db
from app.modules.models import Shipment

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

STATUSES = ["pending", "in_transit", "delivered", "cancelled"]


def _render_list(request: Request, db: Session, current_user: User) -> HTMLResponse:
    shipments = db.query(Shipment).order_by(Shipment.id.desc()).all()
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "logistics/list_partial.html" if is_htmx else "logistics/list.html"
    return templates.TemplateResponse(request, template, {
        "shipments": shipments,
        "current_user": current_user,
        "active": "logistics",
    })


@router.get("/logistics", response_class=HTMLResponse)
def logistics_list(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _render_list(request, db, current_user)


@router.post("/logistics", response_class=HTMLResponse)
def logistics_create(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
    reference: str = Form(""),
    origin_port: str = Form(""),
    destination: str = Form(""),
    cargo_type: str = Form(""),
    weight: str = Form(""),
    eta: str = Form(""),
):
    shipment = Shipment(
        reference=reference or None,
        origin_port=origin_port or None,
        destination=destination or None,
        cargo_type=cargo_type or None,
        weight=float(weight) if weight else None,
        eta=eta or None,
    )
    db.add(shipment)
    db.commit()

    if request.headers.get("HX-Request") == "true":
        return _render_list(request, db, current_user)
    return RedirectResponse("/logistics", status_code=303)


@router.get("/logistics/{shipment_id}", response_class=HTMLResponse)
def logistics_detail(
    shipment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        return HTMLResponse("<p class='text-red-600 p-6'>Shipment not found.</p>", status_code=404)
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "logistics/detail_partial.html" if is_htmx else "logistics/detail.html"
    return templates.TemplateResponse(request, template, {
        "shipment": shipment,
        "statuses": STATUSES,
        "current_user": current_user,
        "active": "logistics",
    })


@router.post("/logistics/{shipment_id}/status", response_class=HTMLResponse)
def logistics_status(
    shipment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
    status: str = Form(...),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        return HTMLResponse("<p class='text-red-600 p-6'>Shipment not found.</p>", status_code=404)
    if status not in STATUSES:
        return HTMLResponse("<p class='text-red-600 p-6'>Invalid status.</p>", status_code=400)
    shipment.status = status
    db.commit()
    return templates.TemplateResponse(request, "logistics/detail_partial.html", {
        "shipment": shipment,
        "statuses": STATUSES,
        "current_user": current_user,
        "active": "logistics",
    })
```

- [ ] **Step 5: Create `app/templates/logistics/list.html`**

```html
{% extends "base.html" %}
{% block title %}Logistics &mdash; AeroERP{% endblock %}
{% block content %}
{% include "logistics/list_partial.html" %}
{% endblock %}
```

- [ ] **Step 6: Create `app/templates/logistics/list_partial.html`**

```html
{% set active = "logistics" %}
<div x-data="{ open: false }">
  <div class="flex items-center justify-between mb-5">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Logistics &amp; Shipping</h1>
      <p class="text-slate-500 text-sm mt-1">{{ shipments | length }} shipment{{ 's' if shipments | length != 1 else '' }}</p>
    </div>
    {% if current_user.role in ('admin', 'manager') %}
    <button @click="open = !open"
      class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
      + New Shipment
    </button>
    {% endif %}
  </div>

  {% if current_user.role in ('admin', 'manager') %}
  <div x-show="open" class="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
    <h2 class="font-semibold text-slate-900 mb-4">New Shipment</h2>
    <form hx-post="/logistics" hx-target="#main-content" hx-push-url="/logistics"
      class="grid grid-cols-2 gap-3">
      <input name="reference" type="text" placeholder="Reference (e.g. SHP-001)"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="origin_port" type="text" placeholder="Origin port"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="destination" type="text" placeholder="Destination"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="cargo_type" type="text" placeholder="Cargo type"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="weight" type="number" step="0.1" placeholder="Weight (kg)"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="eta" type="date"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div class="col-span-2 flex gap-2 justify-end pt-1">
        <button type="button" @click="open = false"
          class="text-slate-500 text-sm px-4 py-2 hover:text-slate-700">Cancel</button>
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          Save Shipment
        </button>
      </div>
    </form>
  </div>
  {% endif %}

  {% if shipments %}
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-slate-900 text-white">
        <tr>
          <th class="text-left px-5 py-3 font-semibold">Reference</th>
          <th class="text-left px-5 py-3 font-semibold">Origin</th>
          <th class="text-left px-5 py-3 font-semibold">Destination</th>
          <th class="text-left px-5 py-3 font-semibold">ETA</th>
          <th class="text-left px-5 py-3 font-semibold">Status</th>
          <th class="px-5 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {% for s in shipments %}
        {% set sc = {'pending': 'bg-amber-100 text-amber-700', 'in_transit': 'bg-blue-100 text-blue-700', 'delivered': 'bg-green-100 text-green-700', 'cancelled': 'bg-red-100 text-red-500'} %}
        <tr class="border-t border-slate-100 hover:bg-slate-50">
          <td class="px-5 py-3 font-mono text-xs text-slate-700">{{ s.reference or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-600">{{ s.origin_port or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-600">{{ s.destination or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-500 text-xs">{{ s.eta or '&mdash;' }}</td>
          <td class="px-5 py-3">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold {{ sc.get(s.status, 'bg-slate-100 text-slate-600') }}">
              {{ s.status | replace('_', ' ') | capitalize }}
            </span>
          </td>
          <td class="px-5 py-3 text-right">
            <a href="/logistics/{{ s.id }}"
              hx-get="/logistics/{{ s.id }}" hx-target="#main-content" hx-push-url="true"
              class="text-blue-600 text-xs hover:underline">View</a>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% else %}
  <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
    <p class="text-4xl mb-3">🚢</p>
    <p class="text-slate-600 font-medium">No shipments yet</p>
    <p class="text-slate-400 text-sm mt-1">Drop a CSV or create a shipment manually</p>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 7: Create `app/templates/logistics/detail.html`**

```html
{% extends "base.html" %}
{% block title %}Shipment {{ shipment.reference or shipment.id }} &mdash; AeroERP{% endblock %}
{% block content %}
{% include "logistics/detail_partial.html" %}
{% endblock %}
```

- [ ] **Step 8: Create `app/templates/logistics/detail_partial.html`**

```html
{% set active = "logistics" %}
<div class="mb-4">
  <a href="/logistics" hx-get="/logistics" hx-target="#main-content" hx-push-url="true"
    class="text-blue-600 text-sm hover:underline">&larr; Back to Logistics</a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">
        {{ shipment.reference or 'Shipment #' ~ shipment.id }}
      </h1>
      {% set sc = {'pending': 'bg-amber-100 text-amber-700', 'in_transit': 'bg-blue-100 text-blue-700', 'delivered': 'bg-green-100 text-green-700', 'cancelled': 'bg-red-100 text-red-500'} %}
      <span class="px-2.5 py-1 rounded-full text-sm font-semibold {{ sc.get(shipment.status, 'bg-slate-100 text-slate-600') }}">
        {{ shipment.status | replace('_', ' ') | capitalize }}
      </span>
    </div>
    <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Reference</dt>
        <dd class="font-medium text-slate-900">{{ shipment.reference or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Origin Port</dt>
        <dd class="font-medium text-slate-900">{{ shipment.origin_port or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Destination</dt>
        <dd class="font-medium text-slate-900">{{ shipment.destination or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Cargo Type</dt>
        <dd class="font-medium text-slate-900">{{ shipment.cargo_type or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Weight</dt>
        <dd class="font-medium text-slate-900">{{ (shipment.weight | string ~ ' kg') if shipment.weight else '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">ETA</dt>
        <dd class="font-medium text-slate-900">{{ shipment.eta or '&mdash;' }}</dd>
      </div>
    </dl>
  </div>

  {% if current_user.role in ('admin', 'manager') %}
  <div class="bg-white rounded-xl border border-slate-200 p-6">
    <h2 class="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">Update Status</h2>
    <form hx-post="/logistics/{{ shipment.id }}/status"
      hx-target="#main-content" hx-swap="innerHTML">
      <select name="status"
        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3">
        {% for st in statuses %}
        <option value="{{ st }}" {% if shipment.status == st %}selected{% endif %}>
          {{ st | replace('_', ' ') | capitalize }}
        </option>
        {% endfor %}
      </select>
      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
        Update Status
      </button>
    </form>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 9: Register logistics router in `app/main.py`**

Read `app/main.py`, then update it to:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router
from app.auth.admin_router import router as admin_router
from app.dashboard.router import router as dashboard_router
from app.files.router import router as files_router
from app.logistics.router import router as logistics_router


def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(dashboard_router)
    app.include_router(files_router)
    app.include_router(logistics_router)
    return app


app = create_app()
```

- [ ] **Step 10: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest -v 2>&1 | tail -20
```

Expected: 63 tests pass (57 + 6 new)

- [ ] **Step 11: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/logistics/ app/templates/logistics/ app/main.py tests/test_logistics.py && git commit -m "feat: add Logistics module (list, create, detail, status update)"
```

---

## Task 2: Inventory module

**Files:**
- Create: `erp/app/inventory/__init__.py`
- Create: `erp/app/inventory/router.py`
- Create: `erp/app/templates/inventory/list.html`
- Create: `erp/app/templates/inventory/list_partial.html`
- Create: `erp/app/templates/inventory/detail.html`
- Create: `erp/app/templates/inventory/detail_partial.html`
- Modify: `erp/app/main.py`
- Create: `erp/tests/test_inventory.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_inventory.py`:

```python
from app.modules.models import InventoryItem


def test_inventory_list_accessible_by_admin(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/inventory")
    assert response.status_code == 200
    assert "inventory" in response.text.lower()


def test_inventory_list_accessible_by_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_inv@erp.com", password_hash=hash_password("pass"), full_name="V", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_inv@erp.com", "password": "pass"})
    response = client.get("/inventory")
    assert response.status_code == 200


def test_inventory_create_as_admin(client, admin_user, db):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post("/inventory", data={
        "sku": "SKU-PLAN3-001",
        "name": "Widget Alpha",
        "quantity": "200",
        "location": "Rack-B3",
        "reorder_point": "50",
        "unit_cost": "12.50",
    })
    assert response.status_code in (200, 303)
    db.expire_all()
    item = db.query(InventoryItem).filter(InventoryItem.sku == "SKU-PLAN3-001").first()
    assert item is not None
    assert item.quantity == 200
    assert item.location == "Rack-B3"


def test_inventory_create_blocked_for_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_inv2@erp.com", password_hash=hash_password("pass"), full_name="V2", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_inv2@erp.com", "password": "pass"})
    response = client.post("/inventory", data={"sku": "HACK"})
    assert response.status_code == 403


def test_inventory_detail(client, admin_user, db):
    item = InventoryItem(sku="SKU-DETAIL-1", name="Detail Widget", quantity=100, location="Rack-A1")
    db.add(item)
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get(f"/inventory/{item.id}")
    assert response.status_code == 200
    assert "SKU-DETAIL-1" in response.text
    assert "Detail Widget" in response.text
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest tests/test_inventory.py -v 2>&1 | tail -10
```

Expected: FAIL — 404 on `/inventory`

- [ ] **Step 3: Create `app/inventory/__init__.py`**

Empty file.

- [ ] **Step 4: Create `app/inventory/router.py`**

```python
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.auth.models import User
from app.database import get_db
from app.modules.models import InventoryItem

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


def _render_list(request: Request, db: Session, current_user: User) -> HTMLResponse:
    items = db.query(InventoryItem).order_by(InventoryItem.id.desc()).all()
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "inventory/list_partial.html" if is_htmx else "inventory/list.html"
    return templates.TemplateResponse(request, template, {
        "items": items,
        "current_user": current_user,
        "active": "inventory",
    })


@router.get("/inventory", response_class=HTMLResponse)
def inventory_list(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _render_list(request, db, current_user)


@router.post("/inventory", response_class=HTMLResponse)
def inventory_create(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
    sku: str = Form(""),
    name: str = Form(""),
    quantity: str = Form(""),
    location: str = Form(""),
    reorder_point: str = Form(""),
    unit_cost: str = Form(""),
):
    item = InventoryItem(
        sku=sku or None,
        name=name or None,
        quantity=int(quantity) if quantity else None,
        location=location or None,
        reorder_point=int(reorder_point) if reorder_point else None,
        unit_cost=float(unit_cost) if unit_cost else None,
    )
    db.add(item)
    db.commit()

    if request.headers.get("HX-Request") == "true":
        return _render_list(request, db, current_user)
    return RedirectResponse("/inventory", status_code=303)


@router.get("/inventory/{item_id}", response_class=HTMLResponse)
def inventory_detail(
    item_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.get(InventoryItem, item_id)
    if not item:
        return HTMLResponse("<p class='text-red-600 p-6'>Item not found.</p>", status_code=404)
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "inventory/detail_partial.html" if is_htmx else "inventory/detail.html"
    low_stock = (
        item.quantity is not None
        and item.reorder_point is not None
        and item.quantity <= item.reorder_point
    )
    return templates.TemplateResponse(request, template, {
        "item": item,
        "low_stock": low_stock,
        "current_user": current_user,
        "active": "inventory",
    })
```

- [ ] **Step 5: Create `app/templates/inventory/list.html`**

```html
{% extends "base.html" %}
{% block title %}Inventory &mdash; AeroERP{% endblock %}
{% block content %}
{% include "inventory/list_partial.html" %}
{% endblock %}
```

- [ ] **Step 6: Create `app/templates/inventory/list_partial.html`**

```html
{% set active = "inventory" %}
<div x-data="{ open: false }">
  <div class="flex items-center justify-between mb-5">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Inventory &amp; Warehouse</h1>
      <p class="text-slate-500 text-sm mt-1">{{ items | length }} item{{ 's' if items | length != 1 else '' }}</p>
    </div>
    {% if current_user.role in ('admin', 'manager') %}
    <button @click="open = !open"
      class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
      + New Item
    </button>
    {% endif %}
  </div>

  {% if current_user.role in ('admin', 'manager') %}
  <div x-show="open" class="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
    <h2 class="font-semibold text-slate-900 mb-4">New Inventory Item</h2>
    <form hx-post="/inventory" hx-target="#main-content" hx-push-url="/inventory"
      class="grid grid-cols-3 gap-3">
      <input name="sku" type="text" placeholder="SKU"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="name" type="text" placeholder="Product name"
        class="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="quantity" type="number" placeholder="Qty"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="location" type="text" placeholder="Location (e.g. Rack-A1)"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="reorder_point" type="number" placeholder="Reorder point"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="unit_cost" type="number" step="0.01" placeholder="Unit cost"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div class="col-span-3 flex gap-2 justify-end pt-1">
        <button type="button" @click="open = false"
          class="text-slate-500 text-sm px-4 py-2 hover:text-slate-700">Cancel</button>
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          Save Item
        </button>
      </div>
    </form>
  </div>
  {% endif %}

  {% if items %}
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-slate-900 text-white">
        <tr>
          <th class="text-left px-5 py-3 font-semibold">SKU</th>
          <th class="text-left px-5 py-3 font-semibold">Name</th>
          <th class="text-left px-5 py-3 font-semibold">Qty</th>
          <th class="text-left px-5 py-3 font-semibold">Location</th>
          <th class="text-left px-5 py-3 font-semibold">Unit Cost</th>
          <th class="text-left px-5 py-3 font-semibold">Stock</th>
          <th class="px-5 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {% for it in items %}
        {% set low = it.quantity is not none and it.reorder_point is not none and it.quantity <= it.reorder_point %}
        <tr class="border-t border-slate-100 hover:bg-slate-50">
          <td class="px-5 py-3 font-mono text-xs text-slate-700">{{ it.sku or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-800 font-medium">{{ it.name or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-700 font-semibold">{{ it.quantity if it.quantity is not none else '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-500 text-xs">{{ it.location or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-500 text-xs">{{ ('$' ~ it.unit_cost) if it.unit_cost else '&mdash;' }}</td>
          <td class="px-5 py-3">
            {% if low %}
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Low Stock</span>
            {% else %}
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">OK</span>
            {% endif %}
          </td>
          <td class="px-5 py-3 text-right">
            <a href="/inventory/{{ it.id }}"
              hx-get="/inventory/{{ it.id }}" hx-target="#main-content" hx-push-url="true"
              class="text-blue-600 text-xs hover:underline">View</a>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% else %}
  <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
    <p class="text-4xl mb-3">📦</p>
    <p class="text-slate-600 font-medium">No inventory items yet</p>
    <p class="text-slate-400 text-sm mt-1">Drop a CSV or add an item manually</p>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 7: Create `app/templates/inventory/detail.html`**

```html
{% extends "base.html" %}
{% block title %}{{ item.sku or 'Item' }} &mdash; AeroERP{% endblock %}
{% block content %}
{% include "inventory/detail_partial.html" %}
{% endblock %}
```

- [ ] **Step 8: Create `app/templates/inventory/detail_partial.html`**

```html
{% set active = "inventory" %}
<div class="mb-4">
  <a href="/inventory" hx-get="/inventory" hx-target="#main-content" hx-push-url="true"
    class="text-blue-600 text-sm hover:underline">&larr; Back to Inventory</a>
</div>

<div class="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-xl font-bold text-slate-900">{{ item.name or 'Item #' ~ item.id }}</h1>
    {% if low_stock %}
    <span class="px-2.5 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600">Low Stock</span>
    {% else %}
    <span class="px-2.5 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">In Stock</span>
    {% endif %}
  </div>
  <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
    <div>
      <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">SKU</dt>
      <dd class="font-medium text-slate-900 font-mono">{{ item.sku or '&mdash;' }}</dd>
    </div>
    <div>
      <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Quantity</dt>
      <dd class="font-bold text-slate-900 text-lg">{{ item.quantity if item.quantity is not none else '&mdash;' }}</dd>
    </div>
    <div>
      <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Location</dt>
      <dd class="font-medium text-slate-900">{{ item.location or '&mdash;' }}</dd>
    </div>
    <div>
      <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Reorder Point</dt>
      <dd class="font-medium text-slate-900">{{ item.reorder_point if item.reorder_point is not none else '&mdash;' }}</dd>
    </div>
    <div>
      <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Unit Cost</dt>
      <dd class="font-medium text-slate-900">{{ ('$' ~ item.unit_cost) if item.unit_cost else '&mdash;' }}</dd>
    </div>
  </dl>
</div>
```

- [ ] **Step 9: Register inventory router in `app/main.py`**

Read `app/main.py` (which already has logistics_router). Add inventory import and include:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router
from app.auth.admin_router import router as admin_router
from app.dashboard.router import router as dashboard_router
from app.files.router import router as files_router
from app.logistics.router import router as logistics_router
from app.inventory.router import router as inventory_router


def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(dashboard_router)
    app.include_router(files_router)
    app.include_router(logistics_router)
    app.include_router(inventory_router)
    return app


app = create_app()
```

- [ ] **Step 10: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest -v 2>&1 | tail -20
```

Expected: 68 tests pass (63 + 5 new)

- [ ] **Step 11: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/inventory/ app/templates/inventory/ app/main.py tests/test_inventory.py && git commit -m "feat: add Inventory module (list, create, detail, low-stock badge)"
```

---

## Task 3: Manufacturing module

**Files:**
- Create: `erp/app/manufacturing/__init__.py`
- Create: `erp/app/manufacturing/router.py`
- Create: `erp/app/templates/manufacturing/list.html`
- Create: `erp/app/templates/manufacturing/list_partial.html`
- Create: `erp/app/templates/manufacturing/detail.html`
- Create: `erp/app/templates/manufacturing/detail_partial.html`
- Modify: `erp/app/main.py`
- Create: `erp/tests/test_manufacturing.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_manufacturing.py`:

```python
from app.modules.models import ProductionOrder


def test_manufacturing_list_accessible_by_admin(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/manufacturing")
    assert response.status_code == 200
    assert "manufacturing" in response.text.lower() or "production" in response.text.lower()


def test_manufacturing_list_accessible_by_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_mfg@erp.com", password_hash=hash_password("pass"), full_name="V", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_mfg@erp.com", "password": "pass"})
    response = client.get("/manufacturing")
    assert response.status_code == 200


def test_manufacturing_create_as_admin(client, admin_user, db):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post("/manufacturing", data={
        "reference": "PO-PLAN3-001",
        "product": "Gear Assembly",
        "quantity": "50",
        "start_date": "2026-04-01",
        "end_date": "2026-04-15",
    })
    assert response.status_code in (200, 303)
    db.expire_all()
    order = db.query(ProductionOrder).filter(ProductionOrder.reference == "PO-PLAN3-001").first()
    assert order is not None
    assert order.product == "Gear Assembly"
    assert order.status == "pending"


def test_manufacturing_create_blocked_for_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_mfg2@erp.com", password_hash=hash_password("pass"), full_name="V2", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_mfg2@erp.com", "password": "pass"})
    response = client.post("/manufacturing", data={"reference": "HACK"})
    assert response.status_code == 403


def test_manufacturing_detail(client, admin_user, db):
    order = ProductionOrder(reference="PO-DETAIL-1", product="Widget Body", quantity=100)
    db.add(order)
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get(f"/manufacturing/{order.id}")
    assert response.status_code == 200
    assert "PO-DETAIL-1" in response.text
    assert "Widget Body" in response.text


def test_manufacturing_status_update(client, admin_user, db):
    order = ProductionOrder(reference="PO-STATUS-1", status="pending")
    db.add(order)
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post(f"/manufacturing/{order.id}/status", data={"status": "in_progress"})
    assert response.status_code == 200
    db.expire_all()
    order = db.get(ProductionOrder, order.id)
    assert order.status == "in_progress"
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest tests/test_manufacturing.py -v 2>&1 | tail -10
```

Expected: FAIL — 404 on `/manufacturing`

- [ ] **Step 3: Create `app/manufacturing/__init__.py`**

Empty file.

- [ ] **Step 4: Create `app/manufacturing/router.py`**

```python
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.auth.models import User
from app.database import get_db
from app.modules.models import ProductionOrder

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

STATUSES = ["pending", "in_progress", "completed", "cancelled"]


def _render_list(request: Request, db: Session, current_user: User) -> HTMLResponse:
    orders = db.query(ProductionOrder).order_by(ProductionOrder.id.desc()).all()
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "manufacturing/list_partial.html" if is_htmx else "manufacturing/list.html"
    return templates.TemplateResponse(request, template, {
        "orders": orders,
        "current_user": current_user,
        "active": "manufacturing",
    })


@router.get("/manufacturing", response_class=HTMLResponse)
def manufacturing_list(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _render_list(request, db, current_user)


@router.post("/manufacturing", response_class=HTMLResponse)
def manufacturing_create(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
    reference: str = Form(""),
    product: str = Form(""),
    quantity: str = Form(""),
    start_date: str = Form(""),
    end_date: str = Form(""),
):
    order = ProductionOrder(
        reference=reference or None,
        product=product or None,
        quantity=int(quantity) if quantity else None,
        start_date=start_date or None,
        end_date=end_date or None,
    )
    db.add(order)
    db.commit()

    if request.headers.get("HX-Request") == "true":
        return _render_list(request, db, current_user)
    return RedirectResponse("/manufacturing", status_code=303)


@router.get("/manufacturing/{order_id}", response_class=HTMLResponse)
def manufacturing_detail(
    order_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(ProductionOrder, order_id)
    if not order:
        return HTMLResponse("<p class='text-red-600 p-6'>Order not found.</p>", status_code=404)
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "manufacturing/detail_partial.html" if is_htmx else "manufacturing/detail.html"
    return templates.TemplateResponse(request, template, {
        "order": order,
        "statuses": STATUSES,
        "current_user": current_user,
        "active": "manufacturing",
    })


@router.post("/manufacturing/{order_id}/status", response_class=HTMLResponse)
def manufacturing_status(
    order_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
    status: str = Form(...),
):
    order = db.get(ProductionOrder, order_id)
    if not order:
        return HTMLResponse("<p class='text-red-600 p-6'>Order not found.</p>", status_code=404)
    if status not in STATUSES:
        return HTMLResponse("<p class='text-red-600 p-6'>Invalid status.</p>", status_code=400)
    order.status = status
    db.commit()
    return templates.TemplateResponse(request, "manufacturing/detail_partial.html", {
        "order": order,
        "statuses": STATUSES,
        "current_user": current_user,
        "active": "manufacturing",
    })
```

- [ ] **Step 5: Create `app/templates/manufacturing/list.html`**

```html
{% extends "base.html" %}
{% block title %}Manufacturing &mdash; AeroERP{% endblock %}
{% block content %}
{% include "manufacturing/list_partial.html" %}
{% endblock %}
```

- [ ] **Step 6: Create `app/templates/manufacturing/list_partial.html`**

```html
{% set active = "manufacturing" %}
<div x-data="{ open: false }">
  <div class="flex items-center justify-between mb-5">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Manufacturing</h1>
      <p class="text-slate-500 text-sm mt-1">{{ orders | length }} production order{{ 's' if orders | length != 1 else '' }}</p>
    </div>
    {% if current_user.role in ('admin', 'manager') %}
    <button @click="open = !open"
      class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
      + New Order
    </button>
    {% endif %}
  </div>

  {% if current_user.role in ('admin', 'manager') %}
  <div x-show="open" class="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
    <h2 class="font-semibold text-slate-900 mb-4">New Production Order</h2>
    <form hx-post="/manufacturing" hx-target="#main-content" hx-push-url="/manufacturing"
      class="grid grid-cols-2 gap-3">
      <input name="reference" type="text" placeholder="Reference (e.g. PO-001)"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="product" type="text" placeholder="Product name"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="quantity" type="number" placeholder="Quantity"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div></div>
      <input name="start_date" type="date"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="end_date" type="date"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div class="col-span-2 flex gap-2 justify-end pt-1">
        <button type="button" @click="open = false"
          class="text-slate-500 text-sm px-4 py-2 hover:text-slate-700">Cancel</button>
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          Save Order
        </button>
      </div>
    </form>
  </div>
  {% endif %}

  {% if orders %}
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-slate-900 text-white">
        <tr>
          <th class="text-left px-5 py-3 font-semibold">Reference</th>
          <th class="text-left px-5 py-3 font-semibold">Product</th>
          <th class="text-left px-5 py-3 font-semibold">Qty</th>
          <th class="text-left px-5 py-3 font-semibold">Start</th>
          <th class="text-left px-5 py-3 font-semibold">End</th>
          <th class="text-left px-5 py-3 font-semibold">Status</th>
          <th class="px-5 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {% for o in orders %}
        {% set sc = {'pending': 'bg-amber-100 text-amber-700', 'in_progress': 'bg-blue-100 text-blue-700', 'completed': 'bg-green-100 text-green-700', 'cancelled': 'bg-red-100 text-red-500'} %}
        <tr class="border-t border-slate-100 hover:bg-slate-50">
          <td class="px-5 py-3 font-mono text-xs text-slate-700">{{ o.reference or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-800 font-medium">{{ o.product or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-700">{{ o.quantity if o.quantity is not none else '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-500 text-xs">{{ o.start_date or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-500 text-xs">{{ o.end_date or '&mdash;' }}</td>
          <td class="px-5 py-3">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold {{ sc.get(o.status, 'bg-slate-100 text-slate-600') }}">
              {{ o.status | replace('_', ' ') | capitalize }}
            </span>
          </td>
          <td class="px-5 py-3 text-right">
            <a href="/manufacturing/{{ o.id }}"
              hx-get="/manufacturing/{{ o.id }}" hx-target="#main-content" hx-push-url="true"
              class="text-blue-600 text-xs hover:underline">View</a>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% else %}
  <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
    <p class="text-4xl mb-3">🏭</p>
    <p class="text-slate-600 font-medium">No production orders yet</p>
    <p class="text-slate-400 text-sm mt-1">Drop a CSV or create an order manually</p>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 7: Create `app/templates/manufacturing/detail.html`**

```html
{% extends "base.html" %}
{% block title %}{{ order.reference or 'Order' }} &mdash; AeroERP{% endblock %}
{% block content %}
{% include "manufacturing/detail_partial.html" %}
{% endblock %}
```

- [ ] **Step 8: Create `app/templates/manufacturing/detail_partial.html`**

```html
{% set active = "manufacturing" %}
<div class="mb-4">
  <a href="/manufacturing" hx-get="/manufacturing" hx-target="#main-content" hx-push-url="true"
    class="text-blue-600 text-sm hover:underline">&larr; Back to Manufacturing</a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">
        {{ order.reference or 'Order #' ~ order.id }}
      </h1>
      {% set sc = {'pending': 'bg-amber-100 text-amber-700', 'in_progress': 'bg-blue-100 text-blue-700', 'completed': 'bg-green-100 text-green-700', 'cancelled': 'bg-red-100 text-red-500'} %}
      <span class="px-2.5 py-1 rounded-full text-sm font-semibold {{ sc.get(order.status, 'bg-slate-100 text-slate-600') }}">
        {{ order.status | replace('_', ' ') | capitalize }}
      </span>
    </div>
    <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Reference</dt>
        <dd class="font-medium text-slate-900">{{ order.reference or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Product</dt>
        <dd class="font-medium text-slate-900">{{ order.product or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Quantity</dt>
        <dd class="font-bold text-slate-900 text-lg">{{ order.quantity if order.quantity is not none else '&mdash;' }}</dd>
      </div>
      <div></div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Start Date</dt>
        <dd class="font-medium text-slate-900">{{ order.start_date or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">End Date</dt>
        <dd class="font-medium text-slate-900">{{ order.end_date or '&mdash;' }}</dd>
      </div>
    </dl>
  </div>

  {% if current_user.role in ('admin', 'manager') %}
  <div class="bg-white rounded-xl border border-slate-200 p-6">
    <h2 class="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">Update Status</h2>
    <form hx-post="/manufacturing/{{ order.id }}/status"
      hx-target="#main-content" hx-swap="innerHTML">
      <select name="status"
        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3">
        {% for st in statuses %}
        <option value="{{ st }}" {% if order.status == st %}selected{% endif %}>
          {{ st | replace('_', ' ') | capitalize }}
        </option>
        {% endfor %}
      </select>
      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
        Update Status
      </button>
    </form>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 9: Register manufacturing router in `app/main.py`**

Read `app/main.py` (currently has logistics + inventory). Add manufacturing:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router
from app.auth.admin_router import router as admin_router
from app.dashboard.router import router as dashboard_router
from app.files.router import router as files_router
from app.logistics.router import router as logistics_router
from app.inventory.router import router as inventory_router
from app.manufacturing.router import router as manufacturing_router


def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(dashboard_router)
    app.include_router(files_router)
    app.include_router(logistics_router)
    app.include_router(inventory_router)
    app.include_router(manufacturing_router)
    return app


app = create_app()
```

- [ ] **Step 10: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest -v 2>&1 | tail -20
```

Expected: 74 tests pass (68 + 6 new)

- [ ] **Step 11: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/manufacturing/ app/templates/manufacturing/ app/main.py tests/test_manufacturing.py && git commit -m "feat: add Manufacturing module (list, create, detail, status update)"
```

---

## Task 4: Procurement module

**Files:**
- Create: `erp/app/procurement/__init__.py`
- Create: `erp/app/procurement/router.py`
- Create: `erp/app/templates/procurement/list.html`
- Create: `erp/app/templates/procurement/list_partial.html`
- Create: `erp/app/templates/procurement/detail.html`
- Create: `erp/app/templates/procurement/detail_partial.html`
- Modify: `erp/app/main.py`
- Create: `erp/tests/test_procurement.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_procurement.py`:

```python
from app.modules.models import PurchaseOrder


def test_procurement_list_accessible_by_admin(client, admin_user):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/procurement")
    assert response.status_code == 200
    assert "procurement" in response.text.lower() or "purchase" in response.text.lower()


def test_procurement_list_accessible_by_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_proc@erp.com", password_hash=hash_password("pass"), full_name="V", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_proc@erp.com", "password": "pass"})
    response = client.get("/procurement")
    assert response.status_code == 200


def test_procurement_create_as_admin(client, admin_user, db):
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post("/procurement", data={
        "reference": "PO-PROC-001",
        "total_amount": "15000.00",
        "expected_date": "2026-05-15",
    })
    assert response.status_code in (200, 303)
    db.expire_all()
    po = db.query(PurchaseOrder).filter(PurchaseOrder.reference == "PO-PROC-001").first()
    assert po is not None
    assert po.total_amount == 15000.0
    assert po.status == "pending"


def test_procurement_create_blocked_for_viewer(client, db):
    from app.auth.models import User
    from app.auth.service import hash_password
    viewer = User(email="viewer_proc2@erp.com", password_hash=hash_password("pass"), full_name="V2", role="viewer")
    db.add(viewer)
    db.commit()
    client.post("/login", data={"email": "viewer_proc2@erp.com", "password": "pass"})
    response = client.post("/procurement", data={"reference": "HACK"})
    assert response.status_code == 403


def test_procurement_detail(client, admin_user, db):
    po = PurchaseOrder(reference="PO-DETAIL-1", total_amount=8500.0, expected_date="2026-06-01")
    db.add(po)
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get(f"/procurement/{po.id}")
    assert response.status_code == 200
    assert "PO-DETAIL-1" in response.text


def test_procurement_status_update(client, admin_user, db):
    po = PurchaseOrder(reference="PO-STATUS-1", status="pending")
    db.add(po)
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.post(f"/procurement/{po.id}/status", data={"status": "approved"})
    assert response.status_code == 200
    db.expire_all()
    po = db.get(PurchaseOrder, po.id)
    assert po.status == "approved"
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest tests/test_procurement.py -v 2>&1 | tail -10
```

Expected: FAIL — 404 on `/procurement`

- [ ] **Step 3: Create `app/procurement/__init__.py`**

Empty file.

- [ ] **Step 4: Create `app/procurement/router.py`**

```python
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.auth.models import User
from app.database import get_db
from app.modules.models import PurchaseOrder

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

STATUSES = ["pending", "approved", "received", "cancelled"]


def _render_list(request: Request, db: Session, current_user: User) -> HTMLResponse:
    orders = db.query(PurchaseOrder).order_by(PurchaseOrder.id.desc()).all()
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "procurement/list_partial.html" if is_htmx else "procurement/list.html"
    return templates.TemplateResponse(request, template, {
        "orders": orders,
        "current_user": current_user,
        "active": "procurement",
    })


@router.get("/procurement", response_class=HTMLResponse)
def procurement_list(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _render_list(request, db, current_user)


@router.post("/procurement", response_class=HTMLResponse)
def procurement_create(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
    reference: str = Form(""),
    total_amount: str = Form(""),
    expected_date: str = Form(""),
):
    order = PurchaseOrder(
        reference=reference or None,
        total_amount=float(total_amount) if total_amount else None,
        expected_date=expected_date or None,
    )
    db.add(order)
    db.commit()

    if request.headers.get("HX-Request") == "true":
        return _render_list(request, db, current_user)
    return RedirectResponse("/procurement", status_code=303)


@router.get("/procurement/{order_id}", response_class=HTMLResponse)
def procurement_detail(
    order_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(PurchaseOrder, order_id)
    if not order:
        return HTMLResponse("<p class='text-red-600 p-6'>Purchase order not found.</p>", status_code=404)
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "procurement/detail_partial.html" if is_htmx else "procurement/detail.html"
    return templates.TemplateResponse(request, template, {
        "order": order,
        "statuses": STATUSES,
        "current_user": current_user,
        "active": "procurement",
    })


@router.post("/procurement/{order_id}/status", response_class=HTMLResponse)
def procurement_status(
    order_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
    status: str = Form(...),
):
    order = db.get(PurchaseOrder, order_id)
    if not order:
        return HTMLResponse("<p class='text-red-600 p-6'>Order not found.</p>", status_code=404)
    if status not in STATUSES:
        return HTMLResponse("<p class='text-red-600 p-6'>Invalid status.</p>", status_code=400)
    order.status = status
    db.commit()
    return templates.TemplateResponse(request, "procurement/detail_partial.html", {
        "order": order,
        "statuses": STATUSES,
        "current_user": current_user,
        "active": "procurement",
    })
```

- [ ] **Step 5: Create `app/templates/procurement/list.html`**

```html
{% extends "base.html" %}
{% block title %}Procurement &mdash; AeroERP{% endblock %}
{% block content %}
{% include "procurement/list_partial.html" %}
{% endblock %}
```

- [ ] **Step 6: Create `app/templates/procurement/list_partial.html`**

```html
{% set active = "procurement" %}
<div x-data="{ open: false }">
  <div class="flex items-center justify-between mb-5">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Procurement</h1>
      <p class="text-slate-500 text-sm mt-1">{{ orders | length }} purchase order{{ 's' if orders | length != 1 else '' }}</p>
    </div>
    {% if current_user.role in ('admin', 'manager') %}
    <button @click="open = !open"
      class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
      + New PO
    </button>
    {% endif %}
  </div>

  {% if current_user.role in ('admin', 'manager') %}
  <div x-show="open" class="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
    <h2 class="font-semibold text-slate-900 mb-4">New Purchase Order</h2>
    <form hx-post="/procurement" hx-target="#main-content" hx-push-url="/procurement"
      class="grid grid-cols-3 gap-3">
      <input name="reference" type="text" placeholder="Reference (e.g. PO-001)"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="total_amount" type="number" step="0.01" placeholder="Total amount"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <input name="expected_date" type="date"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div class="col-span-3 flex gap-2 justify-end pt-1">
        <button type="button" @click="open = false"
          class="text-slate-500 text-sm px-4 py-2 hover:text-slate-700">Cancel</button>
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          Save PO
        </button>
      </div>
    </form>
  </div>
  {% endif %}

  {% if orders %}
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-slate-900 text-white">
        <tr>
          <th class="text-left px-5 py-3 font-semibold">Reference</th>
          <th class="text-left px-5 py-3 font-semibold">Total Amount</th>
          <th class="text-left px-5 py-3 font-semibold">Expected</th>
          <th class="text-left px-5 py-3 font-semibold">Status</th>
          <th class="px-5 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {% for o in orders %}
        {% set sc = {'pending': 'bg-amber-100 text-amber-700', 'approved': 'bg-blue-100 text-blue-700', 'received': 'bg-green-100 text-green-700', 'cancelled': 'bg-red-100 text-red-500'} %}
        <tr class="border-t border-slate-100 hover:bg-slate-50">
          <td class="px-5 py-3 font-mono text-xs text-slate-700">{{ o.reference or '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-800 font-semibold">{{ ('$' ~ '%.2f' | format(o.total_amount)) if o.total_amount else '&mdash;' }}</td>
          <td class="px-5 py-3 text-slate-500 text-xs">{{ o.expected_date or '&mdash;' }}</td>
          <td class="px-5 py-3">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold {{ sc.get(o.status, 'bg-slate-100 text-slate-600') }}">
              {{ o.status | capitalize }}
            </span>
          </td>
          <td class="px-5 py-3 text-right">
            <a href="/procurement/{{ o.id }}"
              hx-get="/procurement/{{ o.id }}" hx-target="#main-content" hx-push-url="true"
              class="text-blue-600 text-xs hover:underline">View</a>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% else %}
  <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
    <p class="text-4xl mb-3">🛒</p>
    <p class="text-slate-600 font-medium">No purchase orders yet</p>
    <p class="text-slate-400 text-sm mt-1">Drop a CSV or create a PO manually</p>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 7: Create `app/templates/procurement/detail.html`**

```html
{% extends "base.html" %}
{% block title %}{{ order.reference or 'PO' }} &mdash; AeroERP{% endblock %}
{% block content %}
{% include "procurement/detail_partial.html" %}
{% endblock %}
```

- [ ] **Step 8: Create `app/templates/procurement/detail_partial.html`**

```html
{% set active = "procurement" %}
<div class="mb-4">
  <a href="/procurement" hx-get="/procurement" hx-target="#main-content" hx-push-url="true"
    class="text-blue-600 text-sm hover:underline">&larr; Back to Procurement</a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">
        {{ order.reference or 'PO #' ~ order.id }}
      </h1>
      {% set sc = {'pending': 'bg-amber-100 text-amber-700', 'approved': 'bg-blue-100 text-blue-700', 'received': 'bg-green-100 text-green-700', 'cancelled': 'bg-red-100 text-red-500'} %}
      <span class="px-2.5 py-1 rounded-full text-sm font-semibold {{ sc.get(order.status, 'bg-slate-100 text-slate-600') }}">
        {{ order.status | capitalize }}
      </span>
    </div>
    <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Reference</dt>
        <dd class="font-medium text-slate-900">{{ order.reference or '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Total Amount</dt>
        <dd class="font-bold text-slate-900 text-lg">{{ ('$' ~ '%.2f' | format(order.total_amount)) if order.total_amount else '&mdash;' }}</dd>
      </div>
      <div>
        <dt class="text-slate-500 text-xs uppercase tracking-wide mb-1">Expected Date</dt>
        <dd class="font-medium text-slate-900">{{ order.expected_date or '&mdash;' }}</dd>
      </div>
    </dl>
  </div>

  {% if current_user.role in ('admin', 'manager') %}
  <div class="bg-white rounded-xl border border-slate-200 p-6">
    <h2 class="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">Update Status</h2>
    <form hx-post="/procurement/{{ order.id }}/status"
      hx-target="#main-content" hx-swap="innerHTML">
      <select name="status"
        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3">
        {% for st in statuses %}
        <option value="{{ st }}" {% if order.status == st %}selected{% endif %}>
          {{ st | capitalize }}
        </option>
        {% endfor %}
      </select>
      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
        Update Status
      </button>
    </form>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 9: Register procurement router and finalize `app/main.py`**

Read `app/main.py` (currently has logistics + inventory + manufacturing). Replace with the final version including all 4 new routers:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.auth.router import router as auth_router
from app.auth.admin_router import router as admin_router
from app.dashboard.router import router as dashboard_router
from app.files.router import router as files_router
from app.logistics.router import router as logistics_router
from app.inventory.router import router as inventory_router
from app.manufacturing.router import router as manufacturing_router
from app.procurement.router import router as procurement_router


def create_app() -> FastAPI:
    app = FastAPI(title="AeroERP")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(dashboard_router)
    app.include_router(files_router)
    app.include_router(logistics_router)
    app.include_router(inventory_router)
    app.include_router(manufacturing_router)
    app.include_router(procurement_router)
    return app


app = create_app()
```

- [ ] **Step 10: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest -v 2>&1 | tail -20
```

Expected: 80 tests pass (74 + 6 new)

- [ ] **Step 11: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/procurement/ app/templates/procurement/ app/main.py tests/test_procurement.py && git commit -m "feat: add Procurement module (list, create, detail, status update)"
```

---

## Task 5: Live dashboard KPIs

**Files:**
- Modify: `erp/app/dashboard/router.py`
- Create: `erp/tests/test_dashboard_kpis.py`

The dashboard currently shows `"—"` placeholder KPI values. This task replaces them with live counts from the database.

- [ ] **Step 1: Write failing tests**

Create `tests/test_dashboard_kpis.py`:

```python
from app.modules.models import Shipment, ProductionOrder, Invoice, PurchaseOrder


def test_dashboard_kpi_active_shipments(client, admin_user, db):
    db.add(Shipment(reference="KPI-SHP-1", status="in_transit"))
    db.add(Shipment(reference="KPI-SHP-2", status="pending"))
    db.add(Shipment(reference="KPI-SHP-3", status="delivered"))
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/dashboard")
    assert response.status_code == 200
    # 2 active shipments (pending + in_transit), not 3
    assert "2" in response.text


def test_dashboard_kpi_open_pos(client, admin_user, db):
    db.add(PurchaseOrder(reference="KPI-PO-1", status="pending"))
    db.add(PurchaseOrder(reference="KPI-PO-2", status="approved"))
    db.add(PurchaseOrder(reference="KPI-PO-3", status="received"))
    db.commit()
    client.post("/login", data={"email": "admin@erp.com", "password": "admin123"})
    response = client.get("/dashboard")
    assert response.status_code == 200
    # 2 open POs (pending + approved), not 3
    assert "2" in response.text
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest tests/test_dashboard_kpis.py -v 2>&1 | tail -10
```

Expected: FAIL — dashboard still shows `"—"` not real counts.

- [ ] **Step 3: Update `app/dashboard/router.py`**

Read `app/dashboard/router.py`, then replace the entire file with:

```python
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.database import get_db
from app.modules.models import ProductionOrder, PurchaseOrder, Shipment

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


def _build_kpis(db: Session) -> list[dict]:
    active_shipments = db.query(Shipment).filter(
        Shipment.status.in_(["pending", "in_transit"])
    ).count()
    production_orders = db.query(ProductionOrder).filter(
        ProductionOrder.status.in_(["pending", "in_progress"])
    ).count()
    open_pos = db.query(PurchaseOrder).filter(
        PurchaseOrder.status.in_(["pending", "approved"])
    ).count()
    return [
        {"label": "Active Shipments", "value": str(active_shipments), "change": "Live count", "up": True},
        {"label": "Production Orders", "value": str(production_orders), "change": "Live count", "up": True},
        {"label": "Revenue (Month)", "value": "—", "change": "Plan 4", "up": True},
        {"label": "Open POs", "value": str(open_pos), "change": "Live count", "up": True},
    ]


@router.get("/", response_class=HTMLResponse)
@router.get("/dashboard", response_class=HTMLResponse)
def dashboard(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_htmx = request.headers.get("HX-Request") == "true"
    template = "dashboard/index_partial.html" if is_htmx else "dashboard/index.html"
    return templates.TemplateResponse(request, template, {
        "current_user": current_user,
        "kpis": _build_kpis(db),
        "active": "dashboard",
    })
```

- [ ] **Step 4: Run tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest tests/test_dashboard_kpis.py -v 2>&1 | tail -10
```

Expected: 2 tests PASS

- [ ] **Step 5: Run all tests**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && source .venv/bin/activate && PYTHONPATH=. pytest -v 2>&1 | tail -10
```

Expected: 82 tests pass (80 + 2 new)

- [ ] **Step 6: Commit**

```bash
cd "/Users/aeroaswar/Library/Mobile Documents/com~apple~CloudDocs/AI/erp" && git add app/dashboard/router.py tests/test_dashboard_kpis.py && git commit -m "feat: live KPI counts on dashboard (active shipments, production orders, open POs)"
```

---

## What's next

Plan 3 complete. The ERP now has:
- **Logistics** — shipments list/create/detail, status workflow (pending → in_transit → delivered)
- **Inventory** — items list/create/detail, low-stock badge (qty ≤ reorder_point)
- **Manufacturing** — production orders list/create/detail, status workflow (pending → in_progress → completed)
- **Procurement** — purchase orders list/create/detail, status workflow (pending → approved → received)
- **Dashboard** — live KPI counts from real DB queries

**Next: Plan 4** — Business modules (Finance, CRM & Sales, HR & Payroll) + Reports page with cross-module chart data.
