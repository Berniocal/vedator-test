#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SOURCE = Path(sys.argv[1]).resolve()
ROOT = Path.cwd().resolve()

URL_RE = re.compile(r'https?://[^\s\'"`<>]+')
STORAGE_RE = re.compile(r'(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*([\'\"])(.*?)\1')
SELECTOR_RE = re.compile(r'(?:querySelector(?:All)?|getElementById|getElementsByClassName)\(\s*([\'\"])(.*?)\1')
FILE_RE = re.compile(r'([\'\"])([^\'\"]+\.(?:js|css|json|webmanifest|svg|png|jpe?g|mp3|m4a|woff2?)(?:\?[^\'\"]*)?)\1', re.I)
MIME_RE = re.compile(r'([\'\"])((?:audio|video|text|application)/[a-z0-9.+-]+(?:;\s*charset=[a-z0-9-]+)?)\1', re.I)
EVENT_RE = re.compile(r'\.addEventListener\(\s*([\'\"])(.*?)\1')
ATTRIBUTE_RE = re.compile(r'(?:setAttribute|getAttribute|hasAttribute|removeAttribute)\(\s*([\'\"])(.*?)\1')


def protected_values(text: str) -> set[str]:
    values = set(URL_RE.findall(text))
    values.update(value for _, value in STORAGE_RE.findall(text))
    values.update(value for _, value in SELECTOR_RE.findall(text))
    values.update(value for _, value in FILE_RE.findall(text))
    values.update(value for _, value in MIME_RE.findall(text))
    values.update(value for _, value in EVENT_RE.findall(text))
    values.update(value for _, value in ATTRIBUTE_RE.findall(text))
    return values


def code_like(value: str) -> bool:
    stripped = value.strip()
    if not stripped:
        return True
    if stripped.startswith(('http://','https://','#','.','data:','blob:')):
        return True
    if re.fullmatch(r'[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+', stripped, re.I):
        return True
    if re.fullmatch(r'[a-z][a-z0-9_-]*\[[^\]]+\]', stripped, re.I):
        return True
    if re.fullmatch(r'(?:audio|video|text|application)/[a-z0-9.+-]+(?:;\s*charset=[a-z0-9-]+)?', stripped, re.I):
        return True
    if re.search(r'\.(?:js|css|json|webmanifest|svg|png|jpe?g|mp3|m4a)(?:\?|$)', stripped, re.I):
        return True
    return False


def main() -> None:
    overrides = json.loads((ROOT / 'locales' / 'manual-overrides.json').read_text('utf-8'))
    removed = []
    for lang in ('cs','sk'):
        reviewed_sources = set(overrides.get(lang, {}))
        path = ROOT / 'locales' / f'strings.{lang}.json'
        data = json.loads(path.read_text('utf-8'))
        cleaned = {}
        for rel, entries in data.items():
            source_path = SOURCE / rel
            protected = protected_values(source_path.read_text('utf-8')) if source_path.is_file() else set()
            kept = {}
            for source, target in entries.items():
                if source in reviewed_sources:
                    removed.append((lang, rel, source, 'reviewed override'))
                    continue
                if source in protected or code_like(source):
                    removed.append((lang, rel, source, 'technical literal'))
                    continue
                kept[source] = target
            cleaned[rel] = kept
        path.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    print(f'Removed {len(removed)} generated locale entries.')
    for lang, rel, value, reason in removed[:60]:
        print(f'  {lang}/{rel}: {value} ({reason})')

if __name__ == '__main__':
    main()
