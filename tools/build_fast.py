#!/usr/bin/env python3
"""Resilient entry point for the complete Czech/Slovak localization build.

The original application tree is still copied one-to-one. This wrapper adds:
- a JavaScript scanner that skips regex literals,
- context-aware filtering of technical JavaScript strings,
- faster greedy translation,
- translation-memory checkpoints after every batch,
- one-language-at-a-time builds,
- safe locale-specific service workers and PWA manifests,
- a root redirect plus a cleanup service worker for old prototype caches.
"""
from __future__ import annotations

import html
import json
import os
import re
from pathlib import Path
from typing import Iterable

import build_localized as build

_REGEX_PREFIX_WORDS = {
    "return", "throw", "case", "delete", "void", "typeof", "instanceof",
    "in", "of", "yield", "await", "else", "do", "new",
}
_REGEX_PREFIX_CHARS = set("([{:;,=!?&|+-*%^~<>")
_TECHNICAL_CALL_RE = re.compile(
    r"(?:querySelector(?:All)?|getElementById|getElementsByClassName|"
    r"localStorage\.(?:getItem|setItem|removeItem)|"
    r"sessionStorage\.(?:getItem|setItem|removeItem)|"
    r"fetch|import|matchMedia|addEventListener|removeEventListener|"
    r"setAttribute|getAttribute|hasAttribute|new\s+URL|"
    r"classList\.(?:add|remove|toggle|contains))\s*\(\s*$"
)
_CODE_LIKE_RE = re.compile(
    r"(?:=>|\.join\s*\(|\b(?:const|let|var|function|return|querySelector|"
    r"localStorage|sessionStorage|dataset)\b)"
)
_MANUAL_TEXTS = {key[2] for key in build.MANUAL}


def _safe_visible(text: str) -> bool:
    if not build._vedator_original_looks_user_visible(text):
        return False
    value = html.unescape(text).strip()
    if value in {"use strict", "use asm"}:
        return False
    if _CODE_LIKE_RE.search(value):
        return False
    return True


if not hasattr(build, "_vedator_original_looks_user_visible"):
    build._vedator_original_looks_user_visible = build.looks_user_visible
build.looks_user_visible = _safe_visible


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


def _should_translate_js_string(code: str, start: int, end: int, value: str) -> bool:
    stripped = value.strip()
    if stripped in _MANUAL_TEXTS:
        return True
    if not build.looks_user_visible(value):
        return False
    before = code[max(0, start - 140):start]
    after = code[end:min(len(code), end + 40)]
    if _TECHNICAL_CALL_RE.search(before):
        return False
    if re.search(r"\bcase\s*$", before):
        return False
    if after.lstrip().startswith(":"):
        return False
    if re.fullmatch(r"(?:[a-z]{2}(?:-[A-Z]{2})?|text/[a-z0-9.+-]+|application/[a-z0-9.+-]+)", stripped):
        return False
    return True


def _translate_js(code: str, translator: build.Translator, target: str, default_source: str) -> str:
    found = _find_js_strings(code)
    candidates: list[str] = []
    selected: set[tuple[int, int]] = set()
    for start, end, _, value in found:
        if not _should_translate_js_string(code, start, end, value):
            continue
        selected.add((start, end))
        if "<" in value and ">" in value:
            candidates.extend(build.collect_markup_segments(value))
        else:
            candidates.append(value)
    mapping = translator.translate_many(candidates, target, default_source)
    replacements: list[tuple[int, int, str]] = []
    for start, end, kind, value in found:
        if (start, end) not in selected:
            continue
        translated = build.apply_markup_mapping(value, mapping) if "<" in value and ">" in value else mapping.get(value, value)
        if translated == value:
            continue
        replacement = translated.replace("`", "\\`") if kind == "`segment" else build.encode_js_string(translated, kind)
        replacements.append((start, end, replacement))
    for start, end, replacement in reversed(replacements):
        code = code[:start] + replacement + code[end:]
    return code


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


def _resilient_translate_many(
    self: build.Translator,
    texts: Iterable[str],
    target: str,
    default_source: str = "sk",
) -> dict[str, str]:
    unique = list(dict.fromkeys(text for text in texts if build.looks_user_visible(text)))
    result: dict[str, str] = {}
    groups: dict[str, list[tuple[str, build.ProtectedText]]] = {"sk": [], "cs": []}

    for original in unique:
        source = build.detect_language(original, default_source)
        if source == target:
            result[original] = original
            continue
        manual = build.MANUAL.get((source, target, original.strip()))
        if manual is not None:
            result[original] = original.replace(original.strip(), manual)
            continue
        key = self.key(source, target, original)
        if key in self.memory:
            result[original] = self.memory[key]
            continue
        groups[source].append((original, build.protect(original)))

    if any(groups.values()):
        self._load_model()

    for source, entries in groups.items():
        if not entries:
            continue
        assert self.tokenizer is not None and self.model is not None and self.torch is not None
        self.tokenizer.src_lang = build.SOURCES[source]
        forced = self.tokenizer.convert_tokens_to_ids(build.TARGETS[target])
        batch_size = 12

        for offset in range(0, len(entries), batch_size):
            batch = entries[offset:offset + batch_size]
            encoded = self.tokenizer(
                [item.protected for _, item in batch],
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512,
            )
            with self.torch.no_grad():
                generated = self.model.generate(
                    **encoded,
                    forced_bos_token_id=forced,
                    max_new_tokens=512,
                )
            outputs = self.tokenizer.batch_decode(generated, skip_special_tokens=True)

            for (original, item), translated in zip(batch, outputs):
                translated = build.restore(translated, item.values)
                if not translated.strip():
                    translated = original
                result[original] = translated
                self.memory[self.key(source, target, original)] = translated

            build.save_memory(self.memory)
            print(
                f"translated {target}: {min(offset + len(batch), len(entries))}/{len(entries)} from {source}",
                flush=True,
            )

    return result


def _patch_locale_runtime(root: Path, lang: str) -> None:
    index = root / "index.html"
    if index.exists():
        text = index.read_text("utf-8")
        text = re.sub(
            r"Intl\.DateTimeFormat\((['\"])cs-CZ\1",
            lambda match: f"Intl.DateTimeFormat({match.group(1)}{'sk-SK' if lang == 'sk' else 'cs-CZ'}{match.group(1)}",
            text,
        )
        if lang == "sk":
            text = re.sub(
                r"(localeCompare\([^,]+,\s*)(['\"])cs\2",
                r"\1'sk'",
                text,
            )
        index.write_text(text, "utf-8")

    manifest = root / "manifest.webmanifest"
    if manifest.exists():
        data = json.loads(manifest.read_text("utf-8"))
        data["lang"] = lang
        data["start_url"] = "./"
        data["scope"] = "../"
        data["id"] = "../"
        manifest.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")

    switch_css = root / "language-switch.css"
    switch_css.write_text(
        ".vedator-header-actions{display:flex;align-items:center;gap:8px;margin-left:auto}"
        ".vedator-language-switch{display:flex;gap:4px;padding:4px;border:1px solid rgba(255,255,255,.35);"
        "border-radius:12px;background:rgba(255,255,255,.1)}"
        ".vedator-language-switch button{border:0;border-radius:8px;padding:7px 9px;background:transparent;"
        "color:#fff;font-weight:850;cursor:pointer}"
        ".vedator-language-switch button.active{background:#fff;color:#241b58}"
        "@media(max-width:550px){.vedator-header-actions{gap:6px}.vedator-language-switch button{padding:6px 8px;font-size:.78rem}}"
        "\n",
        "utf-8",
    )
    switch_js = root / "language-switch.js"
    switch_js.write_text(
        """(()=>{const current=document.documentElement.lang.startsWith('cs')?'cs':'sk';"""
        """const mount=()=>{if(document.querySelector('.vedator-language-switch'))return;"""
        """const row=document.querySelector('.header-row');if(!row)return;"""
        """let actions=row.querySelector('.vedator-header-actions');const install=document.querySelector('#installApp');"""
        """if(!actions){actions=document.createElement('div');actions.className='vedator-header-actions';row.appendChild(actions);if(install)actions.appendChild(install)}"""
        """const box=document.createElement('div');box.className='vedator-language-switch';box.setAttribute('role','group');"""
        """box.setAttribute('aria-label',current==='cs'?'Jazyk aplikace':'Jazyk aplikácie');"""
        """box.innerHTML='<button type=\"button\" data-lang=\"sk\">SK</button><button type=\"button\" data-lang=\"cs\">CZ</button>';"""
        """box.querySelectorAll('button').forEach(button=>{button.classList.toggle('active',button.dataset.lang===current);"""
        """button.onclick=()=>{const next=button.dataset.lang;if(next===current)return;localStorage.setItem('vedator-language',next);"""
        """const url=new URL(location.href);const changed=url.pathname.replace(/\\/(?:cs|sk)(?:\\/index\\.html)?\\/?$/,`/${next}/`);"""
        """url.pathname=changed===url.pathname?url.pathname.replace(/\\/?$/,`/${next}/`):changed;location.href=url.href}});"""
        """actions.insertBefore(box,install&&install.parentElement===actions?install:null)};"""
        """if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount()})();\n""",
        "utf-8",
    )

    sw = root / "sw.js"
    if sw.exists():
        text = sw.read_text("utf-8")
        text = text.replace("'slovak-ui.js',", "").replace(",'slovak-ui.js'", "").replace("'slovak-ui.js'", "")
        text = re.sub(r",\s*,", ",", text)
        old = ".filter(k=>k!==CACHE)"
        guard = (
            ".filter(k=>k!==CACHE&&"
            f"(!/-(?:sk|cs)$/.test(k)||k.endsWith('-{lang}')))"
            "/*VEDATOR_LOCALE_CACHE_GUARD*/"
        )
        if old in text:
            text = text.replace(old, guard, 1)
        if "VEDATOR_LOCALE_CACHE_GUARD" not in text:
            raise RuntimeError(f"Could not patch locale cache cleanup in {sw}")
        if "language-switch.css" not in text or "language-switch.js" not in text:
            raise RuntimeError(f"Language switch assets are not cached in {sw}")
        if "slovak-ui.js" in text:
            raise RuntimeError(f"Legacy DOM translator is still injected by {sw}")
        sw.write_text(text, "utf-8")


def _write_root_files() -> None:
    source_icon = build.SOURCE / "icon.svg"
    if source_icon.exists():
        (build.ROOT / "icon.svg").write_bytes(source_icon.read_bytes())

    root_manifest = {
        "name": "Vedátorský podcast",
        "short_name": "Vedátor",
        "lang": "sk",
        "id": "./",
        "start_url": "./",
        "scope": "./",
        "display": "standalone",
        "background_color": "#111827",
        "theme_color": "#111827",
        "icons": [{"src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable"}],
    }
    (build.ROOT / "manifest.webmanifest").write_text(
        json.dumps(root_manifest, ensure_ascii=False, separators=(",", ":")) + "\n",
        "utf-8",
    )

    (build.ROOT / "sw.js").write_text(
        """const OLD_CACHE=/^(?:vedator-test|vedator-temata)(?!.*-(?:sk|cs)$)/;\n"""
        """self.addEventListener('install',event=>{self.skipWaiting()});\n"""
        """self.addEventListener('activate',event=>event.waitUntil((async()=>{"""
        """for(const key of await caches.keys())if(OLD_CACHE.test(key))await caches.delete(key);"""
        """await self.clients.claim();await self.registration.unregister()})()));\n""",
        "utf-8",
    )

    (build.ROOT / "index.html").write_text(
        """<!doctype html><html lang=\"sk\"><head><meta charset=\"utf-8\">"""
        """<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"""
        """<meta name=\"theme-color\" content=\"#111827\"><link rel=\"manifest\" href=\"manifest.webmanifest\">"""
        """<link rel=\"icon\" href=\"icon.svg\" type=\"image/svg+xml\"><title>Vedátorský podcast</title>"""
        """<script>(async()=>{try{if('serviceWorker'in navigator){const r=await navigator.serviceWorker.register('./sw.js',{scope:'./'});r.update().catch(()=>{})}}catch(e){}"""
        """const saved=localStorage.getItem('vedator-language');const lang=saved==='cs'?'cs':'sk';"""
        """location.replace('./'+lang+'/'+location.search+location.hash)})();</script></head><body></body></html>\n""",
        "utf-8",
    )


def _main() -> None:
    if not build.SOURCE.exists():
        raise SystemExit(f"Missing source checkout: {build.SOURCE}")

    requested = [part.strip() for part in os.environ.get("VEDATOR_LANGS", "sk,cs").split(",") if part.strip()]
    languages = [lang for lang in requested if lang in {"sk", "cs"}]
    if not languages:
        raise SystemExit("VEDATOR_LANGS must contain sk and/or cs")

    memory = build.load_memory()
    translator = build.Translator(memory)

    for lang in languages:
        target = build.ROOT / lang
        build.copy_source(target)
        build.process_tree(target, translator, lang)
        build.patch_locale_build(target, lang)
        _patch_locale_runtime(target, lang)
        build.save_memory(memory)

    _write_root_files()
    build.save_memory(memory)


build.find_template_expr_end = _find_template_expr_end
build.find_js_strings = _find_js_strings
build.translate_js = _translate_js
build.Translator._load_model = _fast_load_model
build.Translator.translate_many = _resilient_translate_many

if __name__ == "__main__":
    _main()
