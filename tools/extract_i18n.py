#!/usr/bin/env python3
from __future__ import annotations

import ast
import json
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
OUT = Path('i18n-inventory')
OUT.mkdir(exist_ok=True)

ASSET_RE = re.compile(r"['\"]([^'\"]+\.(?:js|css|json|webmanifest|svg))['\"]")
HTML_TEXT_RE = re.compile(r">([^<>]+)<")
ATTR_RE = re.compile(r"(?:placeholder|title|aria-label|alt)=['\"]([^'\"]+)['\"]", re.I)

TECHNICAL = re.compile(
    r"^(?:[#.][\w-]+|[\w-]+\.(?:js|css|json|svg|webmanifest)|https?://|audio/|video/|text/|application/|"
    r"[a-z]{2}(?:-[A-Z]{2})?|[A-Z0-9_]{3,}|[\w-]+:[\w-]+)$"
)


def visible(value: str) -> bool:
    v = value.strip()
    if len(v) < 2 or TECHNICAL.search(v):
        return False
    if not re.search(r"[A-Za-zÁ-ž]", v):
        return False
    if any(token in v for token in ('=>', '.join(', 'querySelector', 'localStorage', '${', '</script>')):
        return False
    return True


def js_strings(text: str) -> list[str]:
    result: list[str] = []
    # Conservative extraction: parse only standalone quoted literals, never template literals.
    token_re = re.compile(r"(?<![\\\w])(['\"])((?:\\.|(?!\1).)*)\1", re.S)
    for m in token_re.finditer(text):
        raw = m.group(0)
        try:
            value = ast.literal_eval(raw)
        except Exception:
            continue
        if isinstance(value, str) and visible(value):
            result.append(value)
    return result

files = sorted(p for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.parts)
manifest = [p.relative_to(ROOT).as_posix() for p in files]
Path('source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', 'utf-8')

ui: dict[str, list[str]] = {}
summary_files: list[str] = []
for path in files:
    rel = path.relative_to(ROOT).as_posix()
    if path.suffix not in {'.html', '.js', '.json', '.webmanifest'}:
        continue
    text = path.read_text('utf-8')
    values: list[str] = []
    if path.suffix == '.html':
        values += [m.group(1).strip() for m in HTML_TEXT_RE.finditer(text) if visible(m.group(1))]
        values += [m.group(1).strip() for m in ATTR_RE.finditer(text) if visible(m.group(1))]
        values += js_strings(text)
    elif path.suffix == '.js':
        values += js_strings(text)
    elif path.name not in {'episodes.json'}:
        try:
            data = json.loads(text)
        except Exception:
            data = None
        def walk(x):
            if isinstance(x, str) and visible(x): values.append(x)
            elif isinstance(x, list):
                for y in x: walk(y)
            elif isinstance(x, dict):
                for y in x.values(): walk(y)
        walk(data)
    if values:
        ui[rel] = sorted(dict.fromkeys(values))
    if re.fullmatch(r'episode-\d+(?:-\d+)*-(?:summary|chapters)\.js', path.name):
        summary_files.append(rel)

Path(OUT / 'ui-source.json').write_text(json.dumps(ui, ensure_ascii=False, indent=2) + '\n', 'utf-8')
Path(OUT / 'summary-files.json').write_text(json.dumps(summary_files, ensure_ascii=False, indent=2) + '\n', 'utf-8')

# Episodes are content data, not UI code.
episodes = json.loads((ROOT / 'episodes.json').read_text('utf-8'))
Path(OUT / 'episodes.source.json').write_text(json.dumps(episodes, ensure_ascii=False, indent=2) + '\n', 'utf-8')

print(f'Files: {len(manifest)}; files with UI literals: {len(ui)}; summary files: {len(summary_files)}; episodes: {len(episodes)}')
