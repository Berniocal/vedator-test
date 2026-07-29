#!/usr/bin/env python3
"""Rebuild both locale trees from the saved translation memory only.

This intentionally refuses to load the translation model. It is used after a
validator or runtime-patching fix so an already translated checkpoint can be
recreated in minutes instead of retranslating for hours.
"""
from __future__ import annotations

import build_safe as safe


def _no_model(self) -> None:
    raise RuntimeError(
        "Translation memory is missing a required visible string. "
        "Run the full localization workflow explicitly."
    )


safe.build.Translator._load_model = _no_model

if __name__ == "__main__":
    safe.fast._main()
