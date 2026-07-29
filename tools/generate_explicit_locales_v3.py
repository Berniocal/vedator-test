#!/usr/bin/env python3
from __future__ import annotations

import json
from typing import Iterable

import generate_explicit_locales as base
import generate_explicit_locales_v2 as scanner

base.decode_js_strings = scanner.scan_js_literals

LANG = {'cs': 'ces_Latn', 'sk': 'slk_Latn'}
MEMORY_PATH = base.OUT / 'translation-memory.json'


class NLLBContentTranslator:
    """Translate only extracted content strings; application code is never passed here."""
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.torch = None
        if MEMORY_PATH.exists():
            try:
                self.memory = json.loads(MEMORY_PATH.read_text('utf-8'))
            except Exception:
                self.memory = {}
        else:
            self.memory = {}

    @staticmethod
    def key(source: str, target: str, value: str) -> str:
        return f'{source}>{target}\u0000{value}'

    def save(self) -> None:
        MEMORY_PATH.write_text(json.dumps(self.memory, ensure_ascii=False, indent=2) + '\n', 'utf-8')

    def load(self):
        if self.model is not None:
            return
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        name = 'facebook/nllb-200-distilled-600M'
        self.tokenizer = AutoTokenizer.from_pretrained(name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(name)
        self.model.eval()
        self.torch = torch

    def many(self, values: Iterable[str], source: str, target: str) -> dict[str, str]:
        unique = list(dict.fromkeys(values))
        result: dict[str, str] = {}
        pending: list[str] = []
        for value in unique:
            manual = base.MANUAL.get(target, {}).get(value.strip())
            key = self.key(source, target, value)
            if manual is not None:
                result[value] = value.replace(value.strip(), manual)
            elif source == target:
                result[value] = value
            elif key in self.memory:
                result[value] = self.memory[key]
            else:
                pending.append(value)
        if not pending:
            return result

        self.load()
        assert self.tokenizer is not None and self.model is not None and self.torch is not None
        self.tokenizer.src_lang = LANG[source]
        forced = self.tokenizer.convert_tokens_to_ids(LANG[target])

        for offset in range(0, len(pending), 16):
            batch = pending[offset:offset + 16]
            protected, holders = [], []
            for value in batch:
                text, held = base.protect(value)
                protected.append(text)
                holders.append(held)
            encoded = self.tokenizer(
                protected,
                return_tensors='pt',
                padding=True,
                truncation=True,
                max_length=512,
            )
            with self.torch.no_grad():
                generated = self.model.generate(
                    **encoded,
                    forced_bos_token_id=forced,
                    num_beams=1,
                    max_new_tokens=512,
                )
            outputs = self.tokenizer.batch_decode(generated, skip_special_tokens=True)
            for original, translated, held in zip(batch, outputs, holders):
                restored = base.restore(translated, held).strip() or original
                result[original] = restored
                self.memory[self.key(source, target, original)] = restored
            self.save()
            print(f'content {source}>{target}: {min(offset + len(batch), len(pending))}/{len(pending)}', flush=True)
        return result


base.MT = NLLBContentTranslator

if __name__ == '__main__':
    base.main()
