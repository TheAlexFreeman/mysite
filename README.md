# Alex Freeman's Personal Site

My official web presence.

## Static Life Export

To build a GitHub Pages-ready static export of the Life frontend into `docs/`, run:

```bash
c:/Users/iam/Main/Code/Personal/mysite/.venv/Scripts/python.exe scripts/export_life_pages.py
```

The export rebuilds `docs/`, copies the required base and Life static assets, generates `docs/catalog.json` from `patterns.life`, and writes a standalone `docs/index.html` that fetches the catalog without Django.

