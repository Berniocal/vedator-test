#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import review_locale_quality_v2 as strict

_original_main = strict.base.main


def main() -> None:
    root = Path.cwd()
    for lang in ('cs','sk'):
        path = root / 'locales' / f'strings.{lang}.json'
        data = json.loads(path.read_text('utf-8'))
        for rel, entries in data.items():
            for source, target in entries.items():
                if '<' in source or '>' in source or '<' in str(target) or '>' in str(target):
                    raise RuntimeError(
                        f'{lang}/{rel}: structural HTML must never be stored as a translation pair: {source!r}'
                    )
    _original_main()


if __name__ == '__main__':
    main()
