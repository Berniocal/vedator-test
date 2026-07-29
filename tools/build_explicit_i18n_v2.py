#!/usr/bin/env python3
from __future__ import annotations

import re

import build_explicit_i18n as base
from generate_explicit_locales_v2 import scan_js_literals


def substitute_static(value: str, mapping: dict[str, str]) -> str:
    result = value
    for source, target in sorted(mapping.items(), key=lambda item: len(item[0]), reverse=True):
        if not source or source == target or source not in result:
            continue
        if source[0].isalnum() and source[-1].isalnum():
            pattern = rf'(?<!\w){re.escape(source)}(?!\w)'
            result = re.sub(pattern, lambda _: target, result)
        else:
            result = result.replace(source, target)
    return result


def apply_js(text: str, mapping: dict[str, str]) -> str:
    replacements: list[tuple[int, int, str]] = []
    for start, end, kind, value in scan_js_literals(text):
        translated = mapping.get(value)
        if translated is None and (kind == 'template' or ('<' in value and '>' in value)):
            candidate = substitute_static(value, mapping)
            translated = candidate if candidate != value else None
        if translated is None or translated == value:
            continue
        if kind == 'template':
            replacement = translated.replace('`', '\\`').replace('${', '\\${')
        else:
            replacement = base.encode_js(translated, kind)
        replacements.append((start, end, replacement))
    for start, end, replacement in reversed(replacements):
        text = text[:start] + replacement + text[end:]
    return text


base.apply_js = apply_js

if __name__ == '__main__':
    base.main()
