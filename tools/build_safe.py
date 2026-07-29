#!/usr/bin/env python3
"""Safe localization entry point.

The visible application strings are localized through build_fast, but service
worker source code is always restored byte-for-byte from the original before
locale-specific cache patches are applied. This prevents MIME types, generated
file paths and injected JavaScript from being translated.
"""
from __future__ import annotations

import re
import shutil

import build_fast as fast

build = fast.build
_original_process_tree = build.process_tree
_original_should_translate = fast._should_translate_js_string

_MIME_RE = re.compile(r"^[a-z0-9.+-]+/[a-z0-9.+-]+(?:\s*;\s*[a-z0-9_-]+=[a-z0-9._-]+)*$", re.I)
_FILEISH_RE = re.compile(r"(?:^|[/\\])[^\s]+\.(?:js|css|json|webmanifest|svg|png|jpe?g|mp3|m4a|woff2?)(?:[?#].*)?$", re.I)


def _safer_should_translate(code: str, start: int, end: int, value: str) -> bool:
    if not _original_should_translate(code, start, end, value):
        return False
    stripped = value.strip()
    if _MIME_RE.fullmatch(stripped):
        return False
    if "${" in value or "__PH_" in value:
        return False
    if _FILEISH_RE.search(stripped):
        return False
    if stripped.startswith(("./", "../", "/")):
        return False
    return True


def _safe_process_tree(root, translator, target: str) -> None:
    _original_process_tree(root, translator, target)
    source_sw = build.SOURCE / "sw.js"
    if source_sw.is_file():
        shutil.copy2(source_sw, root / "sw.js")


fast._should_translate_js_string = _safer_should_translate
build.process_tree = _safe_process_tree

if __name__ == "__main__":
    fast._main()
