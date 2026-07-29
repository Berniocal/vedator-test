#!/usr/bin/env python3
"""Safe and faster entry point for the complete localization build.

It keeps the extraction, placeholder protection, translation memory and output
structure from build_localized.py, but uses greedy decoding and a safer
JavaScript scanner. The scanner skips regular-expression literals so quotes
inside expressions such as /[&<>"']/g can never be mistaken for UI strings.
"""
from __future__ import annotations

import build_localized as build

_REGEX_PREFIX_WORDS = {
    "return", "throw", "case", "delete", "void", "typeof", "instanceof",
    "in", "of", "yield", "await", "else", "do", "new",
}
_REGEX_PREFIX_CHARS = set("([{:;,=!?&|+-*%^~<>")


def _starts_regex(code: str, position: int) -> bool:
    """Heuristically distinguish a regex literal from division."""
    index = position - 1
    while index >= 0 and code[index].isspace():
        index -= 1
    if index < 0:
        return True
    previous = code[index]
    if previous in _REGEX_PREFIX_CHARS:
        return True
    if previous == ">":
        before = index - 1
        while before >= 0 and code[before].isspace():
            before -= 1
        return before >= 0 and code[before] == "="
    if previous.isalnum() or previous in "_$":
        start = index
        while start >= 0 and (code[start].isalnum() or code[start] in "_$"):
            start -= 1
        return code[start + 1:index + 1] in _REGEX_PREFIX_WORDS
    return False


def _skip_regex(code: str, position: int) -> int:
    """Return the first character after a JavaScript regex literal."""
    index = position + 1
    length = len(code)
    in_character_class = False
    while index < length:
        char = code[index]
        if char == "\\":
            index += 2
            continue
        if char == "[" and not in_character_class:
            in_character_class = True
            index += 1
            continue
        if char == "]" and in_character_class:
            in_character_class = False
            index += 1
            continue
        if char == "/" and not in_character_class:
            index += 1
            while index < length and code[index].isalpha():
                index += 1
            return index
        if char in "\r\n":
            return position + 1
        index += 1
    return position + 1


def _find_template_expr_end(code: str, start: int) -> int:
    depth, index, length = 1, start, len(code)
    while index < length:
        char = code[index]
        if char == "/" and index + 1 < length and code[index + 1] == "/":
            end = code.find("\n", index + 2)
            index = length if end < 0 else end + 1
            continue
        if char == "/" and index + 1 < length and code[index + 1] == "*":
            end = code.find("*/", index + 2)
            index = length if end < 0 else end + 2
            continue
        if char == "/" and _starts_regex(code, index):
            index = _skip_regex(code, index)
            continue
        if char in ("'", '"'):
            quote = char
            index += 1
            while index < length:
                if code[index] == "\\":
                    index += 2
                    continue
                if code[index] == quote:
                    index += 1
                    break
                index += 1
            continue
        if char == "`":
            index += 1
            while index < length:
                if code[index] == "\\":
                    index += 2
                    continue
                if code.startswith("${", index):
                    index = _find_template_expr_end(code, index + 2) + 1
                    continue
                if code[index] == "`":
                    index += 1
                    break
                index += 1
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return length


def _find_js_strings(code: str, base: int = 0) -> list[tuple[int, int, str, str]]:
    output: list[tuple[int, int, str, str]] = []
    index, length = 0, len(code)
    while index < length:
        char = code[index]
        if char == "/" and index + 1 < length and code[index + 1] == "/":
            end = code.find("\n", index + 2)
            index = length if end < 0 else end + 1
            continue
        if char == "/" and index + 1 < length and code[index + 1] == "*":
            end = code.find("*/", index + 2)
            index = length if end < 0 else end + 2
            continue
        if char == "/" and _starts_regex(code, index):
            index = _skip_regex(code, index)
            continue
        if char in ("'", '"'):
            quote, start = char, index
            index += 1
            while index < length:
                if code[index] == "\\":
                    index += 2
                    continue
                if code[index] == quote:
                    end = index + 1
                    decoded = build.decode_js_string(code[start:end], quote)
                    if decoded is not None:
                        output.append((base + start, base + end, quote, decoded))
                    index = end
                    break
                index += 1
            continue
        if char == "`":
            index += 1
            segment_start = index
            while index < length:
                if code[index] == "\\":
                    index += 2
                    continue
                if code.startswith("${", index):
                    if index > segment_start:
                        output.append((base + segment_start, base + index, "`segment", code[segment_start:index]))
                    expression_start = index + 2
                    expression_end = _find_template_expr_end(code, expression_start)
                    output.extend(_find_js_strings(code[expression_start:expression_end], base + expression_start))
                    index = min(length, expression_end + 1)
                    segment_start = index
                    continue
                if code[index] == "`":
                    if index > segment_start:
                        output.append((base + segment_start, base + index, "`segment", code[segment_start:index]))
                    index += 1
                    break
                index += 1
            continue
        index += 1
    return output


_original_load_model = build.Translator._load_model


def _fast_load_model(self: build.Translator) -> None:
    _original_load_model(self)
    if getattr(self.model, "_vedator_fast_generate", False):
        return
    original_generate = self.model.generate

    def fast_generate(*args, **kwargs):
        kwargs["num_beams"] = 1
        kwargs["do_sample"] = False
        return original_generate(*args, **kwargs)

    self.model.generate = fast_generate
    self.model._vedator_fast_generate = True


build.find_template_expr_end = _find_template_expr_end
build.find_js_strings = _find_js_strings
build.Translator._load_model = _fast_load_model

if __name__ == "__main__":
    build.main()
