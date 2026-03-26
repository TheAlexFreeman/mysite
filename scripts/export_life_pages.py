from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import sys
import textwrap


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from life.pattern_catalog import parse_life_catalog


DOCS_DIR = ROOT / "docs"
LIFE_TEMPLATE = ROOT / "life" / "templates" / "life" / "index.html"
PATTERN_SOURCE = ROOT / "patterns.life"
BASE_STATIC_DIR = ROOT / "base" / "static" / "base"
LIFE_STATIC_DIR = ROOT / "life" / "static" / "life"


def _extract_block(template_text: str, block_name: str) -> str:
    match = re.search(
        rf"{{% block {re.escape(block_name)} %}}(.*?){{% endblock {re.escape(block_name)} %}}",
        template_text,
        re.DOTALL,
    )
    if not match:
        raise RuntimeError(
            f"Unable to find '{{% block {block_name} %}}' in {LIFE_TEMPLATE}"
        )
    return match.group(1).strip()


def _extract_inline_script(template_text: str) -> str:
    matches = re.findall(
        r"<script type=\"text/javascript\">(.*?)</script>",
        template_text,
        re.DOTALL,
    )
    if not matches:
        raise RuntimeError(
            f"Unable to find inline Life bootstrap script in {LIFE_TEMPLATE}"
        )
    return matches[-1].strip()


def _render_index_html(content_html: str, inline_script: str) -> str:
    return textwrap.dedent(
        f"""\
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="theme-color" content="#4e49d1" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <link rel="stylesheet" href="./static/base/style/base.css" />
            <link rel="stylesheet" href="./static/base/style/layout/centered.css" />
            <link rel="stylesheet" href="./static/life/style/grid.css" />
            <link rel="stylesheet" href="./static/life/style/input.css" />
            <link rel="stylesheet" href="./static/life/style/menu.css" />

            <link rel="apple-touch-icon" sizes="180x180" href="./static/base/favicon/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="./static/base/favicon/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="./static/base/favicon/favicon-16x16.png" />
            <link rel="manifest" href="./static/base/favicon/site.webmanifest" />

            <title>Life</title>
          </head>
          <body>
            <header>
              <div id="image-and-name">
                <img src="./static/base/images/NarcissusInverted.jpg" alt="Logo" />
                <div>
                  <h1 id="pagename">The Alex Freeman</h1>
                  <h3 id="tagline">Official Web Presence</h3>
                </div>
              </div>

              <nav style="float: right">
                <ul>
                  <li><a href="./">Life</a></li>
                </ul>
              </nav>
            </header>

            <div id="page-title">
              <h1>Life</h1>
            </div>

            <div id="banner">
              <img src="./static/base/images/IslayHillSunrise-scaled.jpg" alt="Sunrise banner" />
              <caption>
                <p class="caption">Conway's Game of Life</p>
              </caption>
            </div>

            <main>
              <section class="centered">
        {content_html}
              </section>
            </main>

            <footer>
              <span id="copyright">
                <p>&copy; 2024 The Alex Freeman</p>
              </span>
            </footer>

            <script>
              window.LIFE_API_CONFIG = {{
                catalogUri: "./catalog.json",
                persistenceDisabled: true,
              }};
            </script>
            <script src="./static/base/scripts/base.js"></script>
            <script src="./static/life/scripts/points.js"></script>
            <script src="./static/life/scripts/game.js"></script>
            <script src="./static/life/scripts/grid.js"></script>
            <script src="./static/life/scripts/board.js"></script>
            <script src="./static/life/scripts/api.js"></script>
            <script src="./static/life/scripts/input.js"></script>
            <script src="./static/life/scripts/menu.js"></script>
            <script type="text/javascript">
        {inline_script}
            </script>
          </body>
        </html>
        """
    )


def _copy_static_tree(source: Path, destination: Path) -> None:
    shutil.copytree(source, destination, dirs_exist_ok=True)


def build_docs() -> None:
    template_text = LIFE_TEMPLATE.read_text(encoding="utf-8")
    content_html = _extract_block(template_text, "content")
    inline_script = _extract_inline_script(template_text)
    catalog = parse_life_catalog(PATTERN_SOURCE.read_text(encoding="utf-8"))

    if DOCS_DIR.exists():
        shutil.rmtree(DOCS_DIR)

    (DOCS_DIR / "static").mkdir(parents=True, exist_ok=True)
    _copy_static_tree(BASE_STATIC_DIR, DOCS_DIR / "static" / "base")
    _copy_static_tree(LIFE_STATIC_DIR, DOCS_DIR / "static" / "life")

    (DOCS_DIR / "catalog.json").write_text(
        json.dumps(catalog, indent=2),
        encoding="utf-8",
    )
    (DOCS_DIR / "index.html").write_text(
        _render_index_html(content_html, inline_script),
        encoding="utf-8",
    )
    (DOCS_DIR / ".nojekyll").write_text("", encoding="utf-8")


if __name__ == "__main__":
    build_docs()
    print(f"Exported Life frontend to {DOCS_DIR}")
