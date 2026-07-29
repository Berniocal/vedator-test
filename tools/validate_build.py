#!/usr/bin/env python3
"""Validate generated locale trees before they can be merged or deployed."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

from bs4 import BeautifulSoup

TRANSLATABLE_SUFFIXES = {".js", ".html", ".json", ".webmanifest"}
ALLOWED_EXTRA = {"language-switch.css", "language-switch.js"}
ASSETS_RE = re.compile(r"const\s+ASSETS\s*=\s*\[(.*?)\]\s*;", re.S)
QUOTED_RE = re.compile(r"(['\"])(.*?)\1", re.S)
URL_RE = re.compile(r"https?://[^\s'\"`<>]+")
STORAGE_RE = re.compile(
    r"(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*(['\"])(.*?)\1"
)
SELECTOR_RE = re.compile(
    r"(?:querySelector(?:All)?|getElementById|getElementsByClassName)\(\s*(['\"])(.*?)\1"
)
FILE_STRING_RE = re.compile(
    r"(['\"])([^'\"]+\.(?:js|css|json|webmanifest|svg|png|jpe?g|mp3|m4a|woff2?)(?:\?[^'\"]*)?)\1",
    re.I,
)


def node_check(path: Path) -> None:
    result = subprocess.run(
        ["node", "--check", str(path)],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if result.returncode:
        raise RuntimeError(f"JavaScript syntax failed for {path}:\n{result.stdout}")


def tree_files(root: Path) -> set[str]:
    return {
        path.relative_to(root).as_posix()
        for path in root.rglob("*")
        if path.is_file() and ".git" not in path.parts and ".github" not in path.parts
    }


def tag_signatures(path: Path, remove_language_switch: bool = False) -> list[tuple]:
    soup = BeautifulSoup(path.read_text("utf-8"), "html.parser")
    if remove_language_switch:
        for tag in soup.find_all(["link", "script"]):
            ref = tag.get("href") or tag.get("src") or ""
            if "language-switch." in ref:
                tag.decompose()
    result = []
    for tag in soup.find_all(True):
        result.append(
            (
                tag.name,
                tag.get("id"),
                tuple(tag.get("class", [])),
                tag.get("type"),
                tag.get("data-view"),
                tag.get("data-lang"),
            )
        )
    return result


def local_reference(value: str) -> str | None:
    value = value.strip()
    if not value or value.startswith(("#", "data:", "blob:", "mailto:", "tel:", "javascript:")):
        return None
    parts = urlsplit(value)
    if parts.scheme or parts.netloc:
        return None
    path = parts.path
    if not path or path.endswith("/"):
        return None
    return path.lstrip("./")


def validate_html_refs(root: Path, path: Path) -> None:
    soup = BeautifulSoup(path.read_text("utf-8"), "html.parser")
    for tag in soup.find_all(True):
        for attr in ("src", "href"):
            value = tag.get(attr)
            if not isinstance(value, str):
                continue
            rel = local_reference(value)
            if rel and not (path.parent / rel).resolve().is_file():
                raise RuntimeError(f"Missing local HTML reference in {path}: {value}")


def validate_sw(root: Path, lang: str) -> None:
    path = root / "sw.js"
    text = path.read_text("utf-8")
    if "slovak-ui.js" in text:
        raise RuntimeError(f"Legacy DOM translator is still present in {path}")
    if "language-switch.css" not in text or "language-switch.js" not in text:
        raise RuntimeError(f"Language switch is not cached by {path}")
    if "VEDATOR_LOCALE_CACHE_GUARD" not in text:
        raise RuntimeError(f"Locale cache guard is missing in {path}")
    if f"-{lang}'" not in text and f'-{lang}"' not in text:
        raise RuntimeError(f"Locale cache suffix -{lang} is missing in {path}")

    match = ASSETS_RE.search(text)
    if not match:
        raise RuntimeError(f"Could not find ASSETS in {path}")
    assets = [value for _, value in QUOTED_RE.findall(match.group(1))]
    for value in assets:
        if value in {"", "./"}:
            continue
        rel = local_reference(value)
        if rel and not (root / rel).is_file():
            raise RuntimeError(f"Missing cached asset in {path}: {value}")

    for _, value in FILE_STRING_RE.findall(text):
        rel = local_reference(value)
        if rel and not (root / rel).is_file():
            raise RuntimeError(f"Service worker references a missing local file: {path}: {value}")


def technical_sets(text: str) -> dict[str, set[str]]:
    return {
        "urls": set(URL_RE.findall(text)),
        "storage": {value for _, value in STORAGE_RE.findall(text)},
        "selectors": {value for _, value in SELECTOR_RE.findall(text)},
        "files": {value for _, value in FILE_STRING_RE.findall(text)},
    }


def compare_technical_strings(source: Path, target: Path) -> None:
    if source.name == "sw.js":
        return
    source_sets = technical_sets(source.read_text("utf-8"))
    target_sets = technical_sets(target.read_text("utf-8"))
    for name in ("urls", "storage", "selectors", "files"):
        if source_sets[name] != target_sets[name]:
            missing = sorted(source_sets[name] - target_sets[name])
            added = sorted(target_sets[name] - source_sets[name])
            raise RuntimeError(
                f"Technical {name} changed in {target}: missing={missing[:10]} added={added[:10]}"
            )


def validate_locale(source: Path, root: Path, lang: str) -> None:
    source_files = tree_files(source)
    target_files = tree_files(root)
    missing = sorted(source_files - target_files)
    extras = sorted(target_files - source_files - ALLOWED_EXTRA)
    if missing:
        raise RuntimeError(f"{lang}: files missing from one-to-one copy: {missing}")
    if extras:
        raise RuntimeError(f"{lang}: unexpected generated files: {extras}")

    required = {
        "index.html",
        "sw.js",
        "episodes.json",
        "manifest.webmanifest",
        "questions-view.js",
        "language-switch.css",
        "language-switch.js",
    }
    absent = sorted(name for name in required if not (root / name).is_file())
    if absent:
        raise RuntimeError(f"{lang}: required generated files are missing: {absent}")

    for rel in sorted(source_files):
        src = source / rel
        dst = root / rel
        if src.suffix == ".css" or src.suffix not in TRANSLATABLE_SUFFIXES:
            if src.read_bytes() != dst.read_bytes():
                raise RuntimeError(f"{lang}: design/binary file changed unexpectedly: {rel}")
        if src.suffix in {".js", ".html"}:
            compare_technical_strings(src, dst)

    if tag_signatures(source / "index.html") != tag_signatures(root / "index.html", remove_language_switch=True):
        raise RuntimeError(f"{lang}: index.html DOM structure differs from the original")

    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix == ".js":
            node_check(path)
            if "VEDATOR TEST TEXT" in path.read_text("utf-8"):
                raise RuntimeError(f"Preflight sentinel leaked into {path}")
        elif path.suffix in {".json", ".webmanifest"}:
            try:
                json.loads(path.read_text("utf-8"))
            except Exception as exc:
                raise RuntimeError(f"Invalid generated JSON {path}: {exc}") from exc
        elif path.suffix == ".html":
            validate_html_refs(root, path)

    html = (root / "index.html").read_text("utf-8")
    if not re.search(rf"<html\b[^>]*\blang=['\"]{lang}['\"]", html, re.I):
        raise RuntimeError(f"{lang}: incorrect html lang")
    expected_locale = "sk-SK" if lang == "sk" else "cs-CZ"
    if expected_locale not in html:
        raise RuntimeError(f"{lang}: Intl date locale {expected_locale} is missing")
    if "slovak-ui.js" in html:
        raise RuntimeError(f"{lang}: legacy DOM translator is directly loaded by index.html")

    manifest = json.loads((root / "manifest.webmanifest").read_text("utf-8"))
    expected_manifest = {"lang": lang, "start_url": "./", "scope": "../", "id": "../"}
    for key, value in expected_manifest.items():
        if manifest.get(key) != value:
            raise RuntimeError(f"{lang}: manifest {key}={manifest.get(key)!r}, expected {value!r}")

    validate_sw(root, lang)


def validate_root(repo: Path) -> None:
    for name in ("index.html", "sw.js", "manifest.webmanifest", "icon.svg"):
        if not (repo / name).is_file():
            raise RuntimeError(f"Root deployment file is missing: {name}")
    node_check(repo / "sw.js")
    sw = (repo / "sw.js").read_text("utf-8")
    if "OLD_CACHE" not in sw or "registration.unregister" not in sw:
        raise RuntimeError("Root cleanup service worker is not configured")
    root_manifest = json.loads((repo / "manifest.webmanifest").read_text("utf-8"))
    if root_manifest.get("scope") != "./" or root_manifest.get("start_url") != "./":
        raise RuntimeError("Root manifest scope/start_url is incorrect")
    validate_html_refs(repo, repo / "index.html")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("locales", nargs="+")
    args = parser.parse_args()

    source = args.source.resolve()
    repo = Path.cwd().resolve()

    for lang in args.locales:
        if lang not in {"sk", "cs"}:
            raise SystemExit(f"Unsupported locale: {lang}")
        validate_locale(source, (repo / lang).resolve(), lang)

    validate_root(repo)
    memory = repo / "translations" / "memory.json"
    if not memory.is_file() or memory.stat().st_size < 10:
        raise RuntimeError("Translation memory checkpoint is missing or empty")

    print("Generated build validation passed for: " + ", ".join(args.locales))


if __name__ == "__main__":
    main()
