#!/usr/bin/env python3
"""Strict build validation with correct handling of dynamic JS paths."""
from __future__ import annotations

import validate_build as base

_original_local_reference = base.local_reference
_original_validate_sw = base.validate_sw


def _static_local_reference(value: str):
    # Template literals such as ./episode-${n}-summary.js are generated at
    # runtime and cannot be checked as a literal file path.
    if "${" in value or "__PH_" in value:
        return None
    return _original_local_reference(value)


def _validate_sw(root, lang: str) -> None:
    _original_validate_sw(root, lang)
    path = root / "sw.js"
    text = path.read_text("utf-8")
    required = (
        "episode-${n}-summary.js",
        "application/javascript; charset=utf-8",
        "text/html; charset=utf-8",
        '<script src="./${f}" defer></script>',
    )
    missing = [value for value in required if value not in text]
    if missing:
        raise RuntimeError(f"Service worker technical runtime strings changed in {path}: {missing}")
    forbidden = (
        "aplikácia/javascript",
        "episód-${n}",
        "epizóda-${n}",
        '<script src="./${f}"defer></script>',
    )
    found = [value for value in forbidden if value in text]
    if found:
        raise RuntimeError(f"Translated/corrupted service worker code remains in {path}: {found}")


base.local_reference = _static_local_reference
base.validate_sw = _validate_sw

if __name__ == "__main__":
    base.main()
