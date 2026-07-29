#!/usr/bin/env python3
from __future__ import annotations

import ast
import sys

import generate_explicit_locales as base


def scan_js_literals(code: str) -> list[tuple[int, int, str, str]]:
    """Return quoted literals and static template segments without touching expressions."""
    out: list[tuple[int, int, str, str]] = []
    i, n = 0, len(code)

    def skip_string(pos: int, quote: str) -> int:
        pos += 1
        while pos < n:
            if code[pos] == '\\':
                pos += 2
                continue
            if code[pos] == quote:
                return pos + 1
            pos += 1
        return n

    def skip_regex(pos: int) -> int:
        pos += 1
        in_class = False
        while pos < n:
            c = code[pos]
            if c == '\\':
                pos += 2
                continue
            if c == '[':
                in_class = True
            elif c == ']':
                in_class = False
            elif c == '/' and not in_class:
                pos += 1
                while pos < n and code[pos].isalpha():
                    pos += 1
                return pos
            elif c in '\r\n':
                return pos
            pos += 1
        return n

    def regex_starts(pos: int) -> bool:
        j = pos - 1
        while j >= 0 and code[j].isspace():
            j -= 1
        if j < 0:
            return True
        if code[j] in '([{:;,=!?&|+-*%^~<>':
            return True
        k = j
        while k >= 0 and (code[k].isalnum() or code[k] in '_$'):
            k -= 1
        return code[k + 1:j + 1] in {'return','throw','case','delete','void','typeof','instanceof','in','of','yield','await','else','do','new'}

    def scan_template(pos: int) -> int:
        pos += 1
        segment = pos
        depth = 0
        while pos < n:
            if code[pos] == '\\':
                pos += 2
                continue
            if code.startswith('${', pos):
                if pos > segment:
                    out.append((segment, pos, 'template', code[segment:pos]))
                pos += 2
                depth = 1
                while pos < n and depth:
                    c = code[pos]
                    if c in "'\"":
                        pos = skip_string(pos, c)
                        continue
                    if c == '`':
                        pos = scan_template(pos)
                        continue
                    if c == '/' and pos + 1 < n and code[pos + 1] == '/':
                        e = code.find('\n', pos + 2)
                        pos = n if e < 0 else e + 1
                        continue
                    if c == '/' and pos + 1 < n and code[pos + 1] == '*':
                        e = code.find('*/', pos + 2)
                        pos = n if e < 0 else e + 2
                        continue
                    if c == '/' and regex_starts(pos):
                        pos = skip_regex(pos)
                        continue
                    if c == '{':
                        depth += 1
                    elif c == '}':
                        depth -= 1
                    pos += 1
                segment = pos
                continue
            if code[pos] == '`':
                if pos > segment:
                    out.append((segment, pos, 'template', code[segment:pos]))
                return pos + 1
            pos += 1
        return n

    while i < n:
        c = code[i]
        if c == '/' and i + 1 < n and code[i + 1] == '/':
            e = code.find('\n', i + 2)
            i = n if e < 0 else e + 1
            continue
        if c == '/' and i + 1 < n and code[i + 1] == '*':
            e = code.find('*/', i + 2)
            i = n if e < 0 else e + 2
            continue
        if c == '/' and regex_starts(i):
            i = skip_regex(i)
            continue
        if c in "'\"":
            start = i
            i = skip_string(i, c)
            try:
                value = ast.literal_eval(code[start:i])
            except Exception:
                value = None
            if isinstance(value, str):
                out.append((start, i, c, value))
            continue
        if c == '`':
            i = scan_template(i)
            continue
        i += 1
    return out


base.decode_js_strings = scan_js_literals

if __name__ == '__main__':
    base.main()
