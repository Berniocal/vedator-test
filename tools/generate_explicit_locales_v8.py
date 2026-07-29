#!/usr/bin/env python3
from __future__ import annotations

import json
import re

from bs4 import BeautifulSoup

import generate_explicit_locales_v7 as reviewed

base = reviewed.staged.base
scanner = reviewed.staged.scanner
checkpoint = reviewed.staged.staged.checkpoint
_original_detect_language = base.detect_language

SK_WORDS = {
    'prečo','ako','čo','ktorý','ktorá','ktoré','ktorí','môže','môžu','môžeme','môžete','dokáže','dokážu',
    'existujú','akými','koľko','vznikli','zaniknú','vďaka','všetko','nájdete','epizóda','epizódy','diel',
    'dielu','ďalší','ďalšia','ďalšie','ľudia','vedci','čierne','hviezdy','rýchlosť','našej','sme','ste',
    'nie','sú','sa','svetlo','vesmíre','slnečnej','planéty','otázky','zhrnutie','počúvať','prehrávanie',
}
CS_WORDS = {
    'proč','jak','co','který','která','které','kteří','může','mohou','můžeme','můžete','dokáže','dokážou',
    'existují','jakými','kolik','vznikly','zaniknou','díky','všechno','najdete','epizoda','epizody','díl',
    'dílu','další','lidé','vědci','černé','hvězdy','rychlost','naší','jsme','jste','není','jsou','se',
    'světlo','vesmíru','sluneční','planety','otázky','shrnutí','poslouchat','přehrávání',
}
WORD_RE = re.compile(r"[A-Za-zÁ-ž]+", re.UNICODE)


def detect_language(text: str, default: str='cs') -> str:
    lowered = text.lower()
    words = {word.lower() for word in WORD_RE.findall(lowered)}
    sk = len(words & SK_WORDS) + 3 * len(re.findall(r'[ľĺŕôä]', lowered))
    cs = len(words & CS_WORDS) + 3 * len(re.findall(r'[řěů]', lowered))
    if sk > cs:
        return 'sk'
    if cs > sk:
        return 'cs'
    return _original_detect_language(text, default)


base.detect_language = detect_language


def clean_map(data: dict) -> dict:
    cleaned = {}
    for rel, entries in data.items():
        if not isinstance(entries, dict):
            continue
        cleaned[rel] = {
            source: target
            for source, target in entries.items()
            if not ('<' in source or '>' in source or '<' in str(target) or '>' in str(target))
        }
    return cleaned


def candidates_for(path) -> list[str]:
    rel = path.name
    text = path.read_text('utf-8')
    summary = bool(base.SUMMARY_RE.fullmatch(rel))
    values: list[str] = []
    if path.suffix == '.js':
        for _, _, _, value in scanner.scan_js_literals(text):
            if '<' in value or '>' in value:
                continue
            if base.safe_candidate(value, rel, summary):
                values.append(value)
    else:
        soup = BeautifulSoup(text, 'html.parser')
        for node in soup.find_all(string=True):
            if node.parent and node.parent.name not in {'style', 'script'} and base.safe_candidate(str(node), rel):
                values.append(str(node))
        for tag in soup.find_all(True):
            for attr in ('placeholder','title','aria-label','alt'):
                value = tag.get(attr)
                if isinstance(value, str) and base.safe_candidate(value, rel):
                    values.append(value)
        for script in soup.find_all('script'):
            for _, _, _, value in scanner.scan_js_literals(script.string or ''):
                if '<' in value or '>' in value:
                    continue
                if base.safe_candidate(value, rel, False):
                    values.append(value)
    return list(dict.fromkeys(values))


def generate_string_maps(mt) -> None:
    paths = [base.SOURCE / 'index.html'] + sorted(base.SOURCE.glob('*.js'))
    maps = {'cs': {}, 'sk': {}}
    for lang in maps:
        path = base.OUT / f'strings.{lang}.json'
        if path.exists():
            maps[lang] = clean_map(json.loads(path.read_text('utf-8')))

    processed = 0
    for path in paths:
        rel = path.name
        candidates = candidates_for(path)
        if not candidates:
            continue

        changed = False
        for target in ('cs','sk'):
            existing = maps[target].setdefault(rel, {})
            for value in candidates:
                if existing.get(value) == value and detect_language(value, 'cs') != target:
                    existing.pop(value, None)
            missing = [value for value in candidates if value not in existing]
            by_source = {'cs': [], 'sk': []}
            for value in missing:
                by_source[detect_language(value, 'cs')].append(value)
            for source_lang, values in by_source.items():
                if not values:
                    continue
                translated = mt.many(values, source_lang, target)
                for value in values:
                    existing[value] = translated[value]
                    changed = True
            (base.OUT / f'strings.{target}.json').write_text(
                json.dumps(maps[target], ensure_ascii=False, indent=2) + '\n',
                'utf-8',
            )

        processed += 1
        print(f'text-only explicit map: {rel} ({len(candidates)} candidates)', flush=True)
        if changed and processed % 5 == 0:
            checkpoint(
                ['locales/strings.cs.json','locales/strings.sk.json','locales/translation-memory.json'],
                f'Checkpoint safe text-only UI and summary maps after {processed} files',
            )

    checkpoint(
        ['locales/strings.cs.json','locales/strings.sk.json','locales/translation-memory.json'],
        'Complete safe text-only UI, question, summary and chapter maps',
    )


base.generate_string_maps = generate_string_maps

if __name__ == '__main__':
    base.main()
