#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import generate_explicit_locales_v4 as staged

_original_checkpoint = staged.checkpoint


def checkpoint(paths: list[str], message: str) -> None:
    values = list(paths)
    memory = Path('locales/translation-memory.json')
    if memory.exists() and str(memory) not in values:
        values.append(str(memory))
    _original_checkpoint(values, message)


staged.checkpoint = checkpoint

if __name__ == '__main__':
    staged.base.main()
