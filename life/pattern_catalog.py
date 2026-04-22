from __future__ import annotations

from functools import lru_cache
from pathlib import Path
import re

from django.conf import settings


_GRID_LINE_RE = re.compile(r"^[.*]+(?:\s+\([^)]*\))?$")
_TRAILING_METADATA_RE = re.compile(r"\s+\([^)]*\)$")
_DIVIDER_RE = re.compile(r"^[=-]{5,}$")


def _is_grid_line(line: str) -> bool:
    return bool(_GRID_LINE_RE.fullmatch(line.strip()))


def _clean_grid_line(line: str) -> str:
    return _TRAILING_METADATA_RE.sub("", line.strip())


def _format_name(name_block: str) -> str:
    aliases = [alias.strip() for alias in name_block.split(",") if alias.strip()]
    if not aliases:
        return ""
    primary, *others = aliases
    if not others:
        return primary
    return f"{primary} ({', '.join(others)})"


def _parse_header(header_lines: list[str]) -> tuple[str, str]:
    name_line = header_lines[0].strip()
    if " - " in name_line:
        name_block, description = name_line.split(" - ", 1)
        description_parts = [description.strip()]
    else:
        name_block = name_line
        description_parts = []

    description_parts.extend(line.strip() for line in header_lines[1:] if line.strip())
    description = " ".join(description_parts).strip()
    return _format_name(name_block), description


def _grid_to_points(grid_lines: list[str]) -> list[dict[str, int]]:
    points: list[dict[str, int]] = []
    for y, row in enumerate(grid_lines):
        for x, cell in enumerate(row):
            if cell == "*":
                points.append({"x": x, "y": y})
    return points


def parse_life_catalog(text: str) -> list[dict[str, object]]:
    patterns: list[dict[str, object]] = []
    blocks = text.replace("\r\n", "\n").split("\n\n")

    for block in blocks:
        raw_lines = [line.rstrip() for line in block.splitlines()]
        lines = [
            line
            for line in raw_lines
            if line.strip() and not _DIVIDER_RE.fullmatch(line.strip())
        ]
        if not lines:
            continue

        first_grid_index = next(
            (index for index, line in enumerate(lines) if _is_grid_line(line)),
            None,
        )
        if first_grid_index is None or first_grid_index == 0:
            continue

        header_lines = lines[:first_grid_index]
        grid_lines = [
            _clean_grid_line(line)
            for line in lines[first_grid_index:]
            if _is_grid_line(line)
        ]
        if not header_lines or not grid_lines:
            continue

        name, description = _parse_header(header_lines)
        if not name:
            continue

        patterns.append(
            {
                "name": name,
                "description": description,
                "points": _grid_to_points(grid_lines),
            }
        )

    return patterns


def _catalog_path() -> Path:
    return Path(settings.BASE_DIR) / "patterns.life"


@lru_cache(maxsize=1)
def load_pattern_catalog() -> list[dict[str, object]]:
    return parse_life_catalog(_catalog_path().read_text(encoding="utf-8"))
