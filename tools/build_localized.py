#!/usr/bin/env python3
from __future__ import annotations

import ast
import html
import json
import os
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".source-vedator"
MEMORY_PATH = ROOT / "translations" / "memory.json"
MODEL_NAME = "facebook/nllb-200-distilled-600M"
TARGETS = {"sk": "slk_Latn", "cs": "ces_Latn"}
SOURCES = {"sk": "slk_Latn", "cs": "ces_Latn"}
COPY_EXCLUDES = {".git", ".github"}

SK_WORDS = {
    "prečo", "ako", "ktorý", "ktorá", "ktoré", "sú", "nie", "môže", "môžu", "diel", "dielu", "dielov",
    "epizóda", "epizódy", "otázka", "otázky", "odpoveď", "podľa", "všetko", "ďalší", "predchádzajúci",
    "načítať", "prehrať", "stiahnuť", "zhrnutie", "nájdených", "nič", "svetlý", "tmavý", "režim",
    "vedci", "vedkyne", "čierne", "diery", "vesmíre", "hľadanie", "spoločnosť", "príroda", "chémia",
}
CS_WORDS = {
    "proč", "jak", "který", "která", "které", "jsou", "není", "může", "mohou", "díl", "dílu", "dílů",
    "epizoda", "epizody", "otázka", "otázky", "odpověď", "podle", "vše", "další", "předchozí",
    "načíst", "přehrát", "stáhnout", "shrnutí", "nalezeno", "nic", "světlý", "tmavý", "režim",
    "vědci", "vědkyně", "černé", "díry", "vesmíru", "hledání", "společnost", "příroda", "chemie",
}

MANUAL = {
    ("cs", "sk", "Přehrát"): "Prehrať", ("sk", "cs", "Prehrať"): "Přehrát",
    ("cs", "sk", "Číst více"): "Čítať viac", ("sk", "cs", "Čítať viac"): "Číst více",
    ("cs", "sk", "Číst méně"): "Čítať menej", ("sk", "cs", "Čítať menej"): "Číst méně",
    ("cs", "sk", "Epizody"): "Epizódy", ("sk", "cs", "Epizódy"): "Epizody",
    ("cs", "sk", "Vše"): "Všetko", ("sk", "cs", "Všetko"): "Vše",
    ("cs", "sk", "Černé díry"): "Čierne diery", ("sk", "cs", "Čierne diery"): "Černé díry",
    ("cs", "sk", "Vedátorský podcast podle témat"): "Vedátorský podcast podľa tém",
    ("sk", "cs", "Vedátorský podcast podľa tém"): "Vedátorský podcast podle témat",
    ("cs", "sk", "Neoficiální tematický katalog"): "Neoficiálny tematický katalóg",
    ("sk", "cs", "Neoficiálny tematický katalóg"): "Neoficiální tematický katalog",
    ("cs", "sk", "Světlý režim"): "Svetlý režim", ("sk", "cs", "Svetlý režim"): "Světlý režim",
    ("cs", "sk", "Instalovat"): "Inštalovať", ("sk", "cs", "Inštalovať"): "Instalovat",
    ("cs", "sk", "Playlisty"): "Playlisty", ("sk", "cs", "Playlisty"): "Playlisty",
    ("cs", "sk", "Moje data"): "Moje dáta", ("sk", "cs", "Moje dáta"): "Moje data",
}

TECH_DENY = {
    "active", "hidden", "button", "click", "change", "input", "audio", "main", "dark", "light", "system",
    "episode", "episodes", "series", "questions", "playlist", "playlists", "data", "title", "description",
    "summary", "details", "article", "section", "div", "span", "label", "option", "new", "old", "number",
    "alpha", "first", "count", "true", "false", "null", "undefined", "error", "message", "loading",
}

URL_RE = re.compile(r"^(?:https?:|mailto:|tel:|data:|blob:|#|\./|\.\./|/)", re.I)
FILE_RE = re.compile(r"(?:\.(?:js|css|json|html|webmanifest|svg|png|jpg|jpeg|mp3|m4a|woff2?))(?:[?#].*)?$", re.I)
SELECTOR_RE = re.compile(r"^(?:[.#][\w-]+|\[[^\]]+\]|[\w-]+(?:[>+~ ][.#\w\[:\]-]+)+)$")
PLACEHOLDER_RE = re.compile(r"\{[^{}]+\}|\$\{[^{}]+\}|%\w|__PH_\d+__")
TAG_RE = re.compile(r"(<[^>]+>|&[A-Za-z#0-9]+;)")


def load_memory() -> dict[str, str]:
    if MEMORY_PATH.exists():
        try:
            data = json.loads(MEMORY_PATH.read_text("utf-8"))
            if isinstance(data, dict):
                return {str(k): str(v) for k, v in data.items()}
        except Exception:
            pass
    return {}


def save_memory(memory: dict[str, str]) -> None:
    MEMORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    MEMORY_PATH.write_text(json.dumps(memory, ensure_ascii=False, indent=2, sort_keys=True) + "\n", "utf-8")


def detect_language(text: str, default: str = "sk") -> str:
    low = re.sub(r"[^\wÀ-ž]+", " ", text.lower())
    words = set(low.split())
    sk = len(words & SK_WORDS) + 3 * sum(text.count(ch) for ch in "ľĺŕôäĽĹŔÔÄ")
    cs = len(words & CS_WORDS) + 3 * sum(text.count(ch) for ch in "řŘěĚůŮ")
    if sk > cs:
        return "sk"
    if cs > sk:
        return "cs"
    return default


def looks_user_visible(text: str) -> bool:
    s = html.unescape(text).strip()
    if len(s) < 2 or not re.search(r"[A-Za-zÀ-ž]", s):
        return False
    if URL_RE.search(s) or FILE_RE.search(s):
        return False
    if SELECTOR_RE.fullmatch(s) and any(ch in s for ch in ".#[]:>+~"):
        return False
    if "localStorage" in s or "sessionStorage" in s or "querySelector" in s:
        return False
    if re.fullmatch(r"[A-Za-z_$][\w$]*(?:[-_.:][\w$]+)*", s):
        if s.lower() in TECH_DENY or s[:1].islower() or any(x in s for x in ("-", "_", ".", ":")):
            return False
    if re.fullmatch(r"[A-Z0-9_ -]+", s) and " " not in s and len(s) < 10:
        return False
    return True


@dataclass
class ProtectedText:
    protected: str
    values: list[str]


def protect(text: str) -> ProtectedText:
    values: list[str] = []
    def repl(match: re.Match[str]) -> str:
        values.append(match.group(0))
        return f"__PH_{len(values)-1}__"
    return ProtectedText(PLACEHOLDER_RE.sub(repl, text), values)


def restore(text: str, values: list[str]) -> str:
    for i, value in enumerate(values):
        text = text.replace(f"__PH_{i}__", value)
    return text


class Translator:
    def __init__(self, memory: dict[str, str]):
        self.memory = memory
        self.tokenizer = None
        self.model = None
        self.torch = None

    def _load_model(self) -> None:
        if self.model is not None:
            return
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        torch.set_num_threads(max(1, min(4, os.cpu_count() or 2)))
        self.torch = torch
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
        self.model.eval()

    def key(self, source: str, target: str, text: str) -> str:
        return f"{source}>{target}\0{text}"

    def translate_many(self, texts: Iterable[str], target: str, default_source: str = "sk") -> dict[str, str]:
        unique = list(dict.fromkeys(x for x in texts if looks_user_visible(x)))
        result: dict[str, str] = {}
        groups: dict[str, list[tuple[str, ProtectedText]]] = {"sk": [], "cs": []}
        for original in unique:
            source = detect_language(original, default_source)
            if source == target:
                result[original] = original
                continue
            manual = MANUAL.get((source, target, original.strip()))
            if manual is not None:
                result[original] = original.replace(original.strip(), manual)
                continue
            key = self.key(source, target, original)
            if key in self.memory:
                result[original] = self.memory[key]
                continue
            groups[source].append((original, protect(original)))
        if any(groups.values()):
            self._load_model()
        for source, entries in groups.items():
            if not entries:
                continue
            assert self.tokenizer is not None and self.model is not None and self.torch is not None
            self.tokenizer.src_lang = SOURCES[source]
            forced = self.tokenizer.convert_tokens_to_ids(TARGETS[target])
            batch_size = 12
            for offset in range(0, len(entries), batch_size):
                batch = entries[offset:offset + batch_size]
                encoded = self.tokenizer([item.protected for _, item in batch], return_tensors="pt", padding=True, truncation=True, max_length=512)
                with self.torch.no_grad():
                    generated = self.model.generate(**encoded, forced_bos_token_id=forced, max_new_tokens=512, num_beams=3)
                outputs = self.tokenizer.batch_decode(generated, skip_special_tokens=True)
                for (original, item), translated in zip(batch, outputs):
                    translated = restore(translated, item.values)
                    if not translated.strip():
                        translated = original
                    result[original] = translated
                    self.memory[self.key(source, target, original)] = translated
                print(f"translated {target}: {min(offset + len(batch), len(entries))}/{len(entries)} from {source}", flush=True)
        return result


def markup_parts(markup: str) -> list[tuple[str, bool]]:
    result: list[tuple[str, bool]] = []
    skip: list[str] = []
    for part in TAG_RE.split(markup):
        if not part:
            continue
        if part.startswith("<"):
            closing = re.match(r"</\s*(script|style|code|pre)\b", part, re.I)
            opening = re.match(r"<\s*(script|style|code|pre)\b", part, re.I)
            if closing and skip and skip[-1] == closing.group(1).lower():
                skip.pop()
            result.append((part, False))
            if opening and not part.rstrip().endswith("/>"):
                skip.append(opening.group(1).lower())
            continue
        result.append((part, not skip and not part.startswith("&") and looks_user_visible(part)))
    return result


def collect_markup_segments(markup: str) -> list[str]:
    return [part for part, translatable in markup_parts(markup) if translatable]


def apply_markup_mapping(markup: str, mapping: dict[str, str]) -> str:
    return "".join(mapping.get(part, part) if translatable else part for part, translatable in markup_parts(markup))


def decode_js_string(raw: str, quote: str) -> str | None:
    try:
        return ast.literal_eval(raw) if quote in ("'", '"') else None
    except Exception:
        return None


def encode_js_string(value: str, quote: str) -> str:
    value = value.replace("\\", "\\\\").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
    value = value.replace(quote, "\\" + quote).replace("</script", "<\\/script")
    return quote + value + quote


def find_template_expr_end(code: str, start: int) -> int:
    depth, i, n = 1, start, len(code)
    while i < n:
        c = code[i]
        if c == "/" and i + 1 < n and code[i + 1] == "/":
            j = code.find("\n", i + 2); i = n if j < 0 else j + 1; continue
        if c == "/" and i + 1 < n and code[i + 1] == "*":
            j = code.find("*/", i + 2); i = n if j < 0 else j + 2; continue
        if c in ("'", '"'):
            quote = c; i += 1
            while i < n:
                if code[i] == "\\": i += 2; continue
                if code[i] == quote: i += 1; break
                i += 1
            continue
        if c == "`":
            i += 1
            while i < n:
                if code[i] == "\\": i += 2; continue
                if code.startswith("${", i): i = find_template_expr_end(code, i + 2) + 1; continue
                if code[i] == "`": i += 1; break
                i += 1
            continue
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0: return i
        i += 1
    return n


def find_js_strings(code: str, base: int = 0) -> list[tuple[int, int, str, str]]:
    out: list[tuple[int, int, str, str]] = []
    i, n = 0, len(code)
    while i < n:
        c = code[i]
        if c == "/" and i + 1 < n and code[i + 1] == "/":
            j = code.find("\n", i + 2); i = n if j < 0 else j + 1; continue
        if c == "/" and i + 1 < n and code[i + 1] == "*":
            j = code.find("*/", i + 2); i = n if j < 0 else j + 2; continue
        if c in ("'", '"'):
            quote, start = c, i; i += 1
            while i < n:
                if code[i] == "\\": i += 2; continue
                if code[i] == quote:
                    end = i + 1; decoded = decode_js_string(code[start:end], quote)
                    if decoded is not None: out.append((base + start, base + end, quote, decoded))
                    i = end; break
                i += 1
            continue
        if c == "`":
            i += 1; segment_start = i
            while i < n:
                if code[i] == "\\": i += 2; continue
                if code.startswith("${", i):
                    if i > segment_start: out.append((base + segment_start, base + i, "`segment", code[segment_start:i]))
                    expr_start = i + 2; expr_end = find_template_expr_end(code, expr_start)
                    out.extend(find_js_strings(code[expr_start:expr_end], base + expr_start))
                    i = min(n, expr_end + 1); segment_start = i; continue
                if code[i] == "`":
                    if i > segment_start: out.append((base + segment_start, base + i, "`segment", code[segment_start:i]))
                    i += 1; break
                i += 1
            continue
        i += 1
    return out


def translate_js(code: str, translator: Translator, target: str, default_source: str) -> str:
    found = find_js_strings(code)
    candidates: list[str] = []
    for _, _, _, value in found:
        candidates.extend(collect_markup_segments(value)) if "<" in value and ">" in value else candidates.append(value) if looks_user_visible(value) else None
    mapping = translator.translate_many(candidates, target, default_source)
    replacements: list[tuple[int, int, str]] = []
    for start, end, kind, value in found:
        translated = apply_markup_mapping(value, mapping) if "<" in value and ">" in value else mapping.get(value, value)
        if translated == value:
            continue
        replacements.append((start, end, translated.replace("`", "\\`") if kind == "`segment" else encode_js_string(translated, kind)))
    for start, end, replacement in reversed(replacements):
        code = code[:start] + replacement + code[end:]
    return code


def translate_html_file(path: Path, translator: Translator, target: str, default_source: str) -> None:
    source = path.read_text("utf-8")
    script_pattern = re.compile(r"(<script\b[^>]*>)(.*?)(</script>)", re.I | re.S)
    scripts: list[str] = []
    def stash(match: re.Match[str]) -> str:
        scripts.append(match.group(2)); return match.group(1) + f"__VEDATOR_SCRIPT_{len(scripts)-1}__" + match.group(3)
    soup = BeautifulSoup(script_pattern.sub(stash, source), "html.parser")
    texts = [str(node) for node in soup.find_all(string=True) if node.parent and node.parent.name not in {"style", "script"} and looks_user_visible(str(node))]
    attrs: list[str] = []
    for tag in soup.find_all(True):
        for attr in ("placeholder", "title", "aria-label", "alt"):
            value = tag.get(attr)
            if isinstance(value, str) and looks_user_visible(value): attrs.append(value)
    mapping = translator.translate_many(texts + attrs, target, default_source)
    for node in soup.find_all(string=True):
        value = str(node)
        if value in mapping: node.replace_with(NavigableString(mapping[value]))
    for tag in soup.find_all(True):
        for attr in ("placeholder", "title", "aria-label", "alt"):
            value = tag.get(attr)
            if isinstance(value, str) and value in mapping: tag[attr] = mapping[value]
    if soup.html: soup.html["lang"] = target
    output = str(soup)
    for idx, script in enumerate(scripts): output = output.replace(f"__VEDATOR_SCRIPT_{idx}__", translate_js(script, translator, target, default_source))
    path.write_text(output, "utf-8")


def collect_json_strings(value, key: str, plain: list[str], markup: list[str]) -> None:
    if isinstance(value, list):
        for item in value: collect_json_strings(item, key, plain, markup)
    elif isinstance(value, dict):
        for child_key, child in value.items(): collect_json_strings(child, str(child_key), plain, markup)
    elif isinstance(value, str):
        if key in {"description", "content", "summary"} and "<" in value and ">" in value: markup.extend(collect_markup_segments(value))
        elif looks_user_visible(value): plain.append(value)


def apply_json_translations(value, key: str, plain_map: dict[str, str], markup_map: dict[str, str]):
    if isinstance(value, list): return [apply_json_translations(item, key, plain_map, markup_map) for item in value]
    if isinstance(value, dict): return {child_key: apply_json_translations(child, str(child_key), plain_map, markup_map) for child_key, child in value.items()}
    if not isinstance(value, str): return value
    if key in {"description", "content", "summary"} and "<" in value and ">" in value: return apply_markup_mapping(value, markup_map)
    return plain_map.get(value, value)


def translate_json_file(path: Path, translator: Translator, target: str, default_source: str) -> None:
    try: value = json.loads(path.read_text("utf-8"))
    except Exception: return
    plain: list[str] = []; markup: list[str] = []
    collect_json_strings(value, "", plain, markup)
    translated = apply_json_translations(value, "", translator.translate_many(plain, target, default_source), translator.translate_many(markup, target, default_source))
    if isinstance(translated, dict) and path.suffix == ".webmanifest":
        translated["lang"] = target
        if "start_url" in translated: translated["start_url"] = "./"
    path.write_text(json.dumps(translated, ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")


def process_tree(root: Path, translator: Translator, target: str) -> None:
    for path in sorted(root.rglob("*")):
        if not path.is_file() or any(part in COPY_EXCLUDES for part in path.parts): continue
        default_source = "sk" if path.name == "episodes.json" else "cs"
        if path.suffix == ".js": path.write_text(translate_js(path.read_text("utf-8"), translator, target, default_source), "utf-8")
        elif path.suffix == ".html": translate_html_file(path, translator, target, default_source)
        elif path.suffix in {".json", ".webmanifest"}: translate_json_file(path, translator, target, default_source)


def patch_locale_build(root: Path, lang: str) -> None:
    index = root / "index.html"
    if index.exists():
        text = index.read_text("utf-8")
        if "language-switch.css" not in text: text = text.replace("</head>", '<link rel="stylesheet" href="./language-switch.css"></head>')
        if "language-switch.js" not in text: text = text.replace("</body>", '<script src="./language-switch.js" defer></script></body>')
        text = re.sub(r"<html\b([^>]*)\blang=(['\"]).*?\2", f'<html\\1lang="{lang}"', text, count=1, flags=re.I)
        index.write_text(text, "utf-8")
    (root / "language-switch.css").write_text(".vedator-language-switch{display:flex;gap:4px;padding:4px;border:1px solid rgba(255,255,255,.35);border-radius:12px;background:rgba(255,255,255,.1)}\n.vedator-language-switch button{border:0;border-radius:8px;padding:7px 9px;background:transparent;color:#fff;font-weight:850;cursor:pointer}\n.vedator-language-switch button.active{background:#fff;color:#241b58}\n@media(max-width:550px){.vedator-language-switch button{padding:6px 8px;font-size:.78rem}}\n", "utf-8")
    (root / "language-switch.js").write_text("""(()=>{const current=document.documentElement.lang.startsWith('cs')?'cs':'sk';const mount=()=>{if(document.querySelector('.vedator-language-switch'))return;const actions=document.querySelector('.header-actions')||document.querySelector('.header-row');if(!actions)return;const box=document.createElement('div');box.className='vedator-language-switch';box.setAttribute('role','group');box.setAttribute('aria-label',current==='cs'?'Jazyk aplikace':'Jazyk aplikácie');box.innerHTML='<button type=\"button\" data-lang=\"sk\">SK</button><button type=\"button\" data-lang=\"cs\">CZ</button>';box.querySelectorAll('button').forEach(button=>{button.classList.toggle('active',button.dataset.lang===current);button.onclick=()=>{const next=button.dataset.lang;localStorage.setItem('vedator-language',next);const url=new URL(location.href);url.pathname=url.pathname.replace(/\\/(?:cs|sk)\\/?$/,`/${next}/`);location.href=url.href}});actions.prepend(box)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0));else setTimeout(mount,0)})();\n""", "utf-8")
    sw = root / "sw.js"
    if sw.exists():
        text = sw.read_text("utf-8")
        text = re.sub(r"const CACHE='([^']+)'", lambda m: f"const CACHE='{m.group(1)}-{lang}'", text, count=1)
        text = re.sub(r"const VERSION='([^']+)'", lambda m: f"const VERSION='{m.group(1)}-{lang}'", text, count=1)
        text = text.replace("'questions-view.js'];", "'questions-view.js','language-switch.css','language-switch.js'];", 1)
        marker = "'questions-view.js'];"; pos = text.find(marker)
        if pos >= 0: text = text[:pos] + "'questions-view.js','language-switch.js'];" + text[pos + len(marker):]
        text = text.replace("'slovak-ui.js',", "")
        sw.write_text(text, "utf-8")


def copy_source(target: Path) -> None:
    if target.exists(): shutil.rmtree(target)
    shutil.copytree(SOURCE, target, ignore=shutil.ignore_patterns(".git", ".github"))


def main() -> None:
    if not SOURCE.exists(): raise SystemExit(f"Missing source checkout: {SOURCE}")
    memory = load_memory(); translator = Translator(memory)
    for lang in ("sk", "cs"):
        target = ROOT / lang; copy_source(target); process_tree(target, translator, lang); patch_locale_build(target, lang); save_memory(memory)
    (ROOT / "index.html").write_text("<!doctype html><html lang=\"sk\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" content=\"#111827\"><title>Vedátorský podcast</title><script>(()=>{const saved=localStorage.getItem('vedator-language');const lang=saved==='cs'?'cs':'sk';location.replace('./'+lang+'/'+location.search+location.hash)})();</script></head><body></body></html>\n", "utf-8")
    save_memory(memory)

if __name__ == "__main__": main()
