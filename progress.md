
## Session 2026-04-21T16:45:38
**Task:** Please review the codebase and give me a high level overview of its architecture.


**Summary:** Here is a comprehensive high-level overview of the codebase:

---

## Architecture Overview

This is **Alex Freeman's personal website**, a Django 5.1 web application deployed on Render (previously targeting Heroku). It follows Django's standard MVT (Model-View-Template) pattern with a clean app-based structure.

---

### 🗂️ Top-Level Structure

```
mysite/          ← Django project config (settings, root URLs, WSGI/ASGI)
base/            ← Shared foundation app (base model, base templates, global static assets)
home/            ← Home/landing page app
life/            ← Conway's Game of Life interactive app
manage.py        ← Django CLI entry point
requirements.txt ← Python dependencies
Procfile         ← Deployment process definition (gunicorn + migrations)
```

---

### ⚙️ Project Config (`mysite/`)

- **`settings.py`**: Standard Django config. Notable choices:
  - Database URL is read from the `DATABASE_URL` environment variable via `dj-database-url`, targeting PostgreSQL in production.
  - A local `db.sqlite3` exists for development.
  - `SECRET_KEY` falls back to a randomly generated value if not set (not suitable for persistent sessions in production).
  - Static files are served by **WhiteNoise** with GZip/Brotli compression.
- **`urls.py`**: Three URL namespaces — Django admin (`/admin/`), home (`/`), and life (`/life/`).

---

### 🧱 `base` App — Shared Foundation

The `base` app is a **non-navigable shared library** for the rest of the project. It has no URLs or views of its own.

- **`base/models.py`** — Defines `BaseModel`, an abstract Django model that all other models should inherit from. It provides:
  - `created` and `modified` auto-timestamp fields (via `django-model-utils`)
  - A `BaseModelQuerySet` with convenience time-range filter methods
  - A `save_fields()` helper for partial updates
  - A BRIN index on `created` (efficient for time-ordered large tables in PostgreSQL)

- **`base/templates/`** — The global template hierarchy:
  - `base.html` —
