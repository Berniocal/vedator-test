#!/usr/bin/env python3
"""Fast entry point for the complete localization build.

Keeps the exact extraction, placeholder protection, translation memory and output
structure from build_localized.py. It only forces greedy decoding instead of
three-beam decoding, which is much faster for the closely related Czech and
Slovak languages.
"""
from __future__ import annotations

import build_localized as build

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


build.Translator._load_model = _fast_load_model

if __name__ == "__main__":
    build.main()
