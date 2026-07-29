#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from typing import Iterable

import generate_explicit_locales as base
import generate_explicit_locales_v2 as scanner

base.decode_js_strings = scanner.scan_js_literals

TARGET_TOKEN = {'cs': 'ces', 'sk': 'slk'}
MEMORY_PATH = base.OUT / 'translation-memory.json'
MODEL_NAME = 'allegro/BiDi-ces-slk'
MODEL_VERSION = 'bidi-ces-slk-v2-sentences'

base.MANUAL.setdefault('cs', {}).update({
    'Podcast vzniká v spolupráci so SME.': 'Podcast vzniká ve spolupráci se SME.',
    'Bonusové epizódy a extra obsah k podcastom nájdete na': 'Bonusové epizody a další obsah k podcastům najdete na',
    'Samuelova nová kniha už je v predaji': 'Samuelova nová kniha je již v prodeji',
    'Otázky nám môžete nahrávať tu': 'Otázky nám můžete nahrávat zde',
    'Podcastové hrnčeky a ponožky nájdete na stránke': 'Podcastové hrnky a ponožky najdete na stránce',
    'Všetko ostatné nájdete tu': 'Všechno ostatní najdete zde',
    'Kniha Dominiky - Cesta do mozgu a späť:': 'Kniha Dominiky – Cesta do mozku a zpět:',
    'Video spomínané v epizóde:': 'Video zmíněné v epizodě:',
    'Galéria Webbovho teleskopu:': 'Galerie Webbova teleskopu:',
    'O tom všetkom diskutujú Jozef a Samuel.': 'O tom všem diskutují Jozef a Samuel.',
    'O tom všetkom diskutujú Jozef, Samuel a ich hosťka Dominika Fričová.': 'O tom všem diskutují Jozef, Samuel a jejich hostka Dominika Fričová.',
})


def normalize_output(original: str, translated: str, target: str) -> str:
    result = translated.strip()
    if target == 'cs':
        result = re.sub(r'^V[ěe]dátorský podcast', 'Vedátorský podcast', result, flags=re.I)
        result = result.replace('Vedadorský podcast', 'Vedátorský podcast')
        result = result.replace('Vědátorský', 'Vedátorský')
        result = result.replace('AntimRller', 'Antimüller')
        if 'Jozef' in original:
            result = re.sub(r'\bJosef\b', 'Jozef', result)
        if 'Vedátor' in original:
            result = result.replace('Vědátor', 'Vedátor')
    return result or original


class BiDiContentTranslator:
    """Translate only extracted Czech/Slovak content; application code is never passed here."""
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
        return f'{MODEL_VERSION}:{source}>{target}\u0000{value}'

    def save(self) -> None:
        MEMORY_PATH.write_text(json.dumps(self.memory, ensure_ascii=False, indent=2) + '\n', 'utf-8')

    def load(self):
        if self.model is not None:
            return
        import torch
        from transformers import AutoTokenizer, MarianMTModel
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = MarianMTModel.from_pretrained(MODEL_NAME)
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
        prefix = f'>>{TARGET_TOKEN[target]}<< '

        for offset in range(0, len(pending), 24):
            batch = pending[offset:offset + 24]
            protected, holders = [], []
            for value in batch:
                text, held = base.protect(value)
                protected.append(prefix + text)
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
                    num_beams=1,
                    max_new_tokens=512,
                )
            outputs = self.tokenizer.batch_decode(
                generated,
                skip_special_tokens=True,
                clean_up_tokenization_spaces=True,
            )
            for original, translated, held in zip(batch, outputs, holders):
                restored = base.restore(translated, held)
                restored = normalize_output(original, restored, target)
                result[original] = restored
                self.memory[self.key(source, target, original)] = restored
            self.save()
            print(f'BiDi content {source}>{target}: {min(offset + len(batch), len(pending))}/{len(pending)}', flush=True)
        return result


NLLBContentTranslator = BiDiContentTranslator
base.MT = BiDiContentTranslator

if __name__ == '__main__':
    base.main()
