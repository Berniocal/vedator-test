#!/usr/bin/env python3
"""Fast preflight checks that run before the expensive translation model."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

import build_fast

REQUIRED = {
    "index.html",
    "sw.js",
    "episodes.json",
    "manifest.webmanifest",
    "questions-view.js",
}
ASSETS_RE = re.compile(r"const\s+ASSETS\s*=\s*\[(.*?)\]\s*;", re.S)
QUOTED_RE = re.compile(r"(['\"])(.*?)\1", re.S)


class DummyTranslator:
    def translate_many(self, texts, target, default_source="cs"):
        return {text: "VEDATOR TEST TEXT" for text in texts}


def check_node(path: Path) -> None:
    result = subprocess.run(
        ["node", "--check", str(path)],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if result.returncode:
        raise RuntimeError(f"JavaScript syntax failed for {path}:\n{result.stdout}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    source = args.source.resolve()

    missing = sorted(name for name in REQUIRED if not (source / name).is_file())
    if missing:
        raise SystemExit(f"Missing required source files: {missing}")

    for path in sorted(source.rglob("*")):
        if not path.is_file() or ".git" in path.parts or ".github" in path.parts:
            continue
        if path.suffix in {".json", ".webmanifest"}:
            try:
                json.loads(path.read_text("utf-8"))
            except Exception as exc:
                raise SystemExit(f"Invalid JSON before translation: {path}: {exc}") from exc
        if path.suffix == ".js":
            check_node(path)

    sw_text = (source / "sw.js").read_text("utf-8")
    match = ASSETS_RE.search(sw_text)
    if not match:
        raise SystemExit("Could not find const ASSETS in source sw.js")
    assets = [value for _, value in QUOTED_RE.findall(match.group(1))]
    missing_assets = []
    for value in assets:
        if value in {"./", ""} or re.match(r"^(?:https?:|data:|blob:)", value):
            continue
        clean = value.split("?", 1)[0].lstrip("./")
        if clean and not (source / clean).is_file():
            missing_assets.append(value)
    if missing_assets:
        raise SystemExit(f"Source service worker references missing assets: {missing_assets}")

    dummy = DummyTranslator()
    for path in sorted(source.rglob("*.js")):
        if ".git" in path.parts or ".github" in path.parts:
            continue
        code = path.read_text("utf-8")
        found = build_fast._find_js_strings(code)
        ranges = [(start, end) for start, end, _, _ in found]
        if ranges != sorted(ranges) or any(a_end > b_start for (_, a_end), (b_start, _) in zip(ranges, ranges[1:])):
            raise SystemExit(f"Overlapping or unsorted JavaScript string ranges: {path}")
        transformed = build_fast._translate_js(code, dummy, "sk", "cs")
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
            handle.write(transformed)
            temp_path = Path(handle.name)
        try:
            check_node(temp_path)
        except Exception as exc:
            raise SystemExit(f"Scanner preflight failed for {path}: {exc}") from exc
        finally:
            temp_path.unlink(missing_ok=True)

    print(f"Source preflight passed for {sum(1 for item in source.rglob('*') if item.is_file())} files.")


if __name__ == "__main__":
    main()
