#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path.cwd().resolve()
SOURCE = Path(sys.argv[1]).resolve()
REPORT_PATH = ROOT / 'locales' / 'quality-report.json'

URL_RE = re.compile(r'https?://[^\s<>"\']+')
WORD_RE = re.compile(r"[A-Za-zÁ-ž]+", re.UNICODE)
REPEAT_RE = re.compile(
    r'\b([A-Za-zÁ-ž]{3,}(?:\s+[A-Za-zÁ-ž]{3,}){0,3})'
    r'(?:[\s,;:–—-]+\1){2,}\b',
    re.I,
)
SENTENCE_END_RE = re.compile(r'[.!?…](?=\s|$)')

SK_STRONG = {
    'prečo': 3, 'existujú': 3, 'môže': 3, 'môžu': 3, 'môžeme': 3,
    'môžete': 3, 'ktorý': 2, 'ktorá': 2, 'ktoré': 2, 'ktorí': 2,
    'všetko': 3, 'nájdete': 3, 'epizóda': 3, 'epizódy': 3, 'diel': 2,
    'dielu': 2, 'ďalší': 3, 'ďalšia': 3, 'ďalšie': 3, 'čierne': 3,
    'hviezdy': 3, 'rýchlosť': 3, 'vesmíre': 3, 'slnečnej': 3,
    'planéty': 2, 'zhrnutie': 3, 'počúvať': 3, 'prehrávanie': 3,
    'nebolo': 2, 'bolo': 1, 'vznikli': 2, 'zaniknú': 3, 'vďaka': 3,
    'ľudia': 3, 'vedci': 1, 'našej': 2, 'otázky': 1, 'svetlo': 2,
}
CS_STRONG = {
    'proč': 3, 'existují': 3, 'může': 3, 'mohou': 3, 'můžeme': 3,
    'můžete': 3, 'který': 2, 'která': 2, 'které': 2, 'kteří': 2,
    'všechno': 3, 'najdete': 3, 'epizoda': 3, 'epizody': 3, 'díl': 2,
    'dílu': 2, 'další': 3, 'černé': 3, 'hvězdy': 3, 'rychlost': 3,
    'vesmíru': 2, 'sluneční': 3, 'planety': 2, 'shrnutí': 3,
    'poslouchat': 3, 'přehrávání': 3, 'nebylo': 2, 'bylo': 1,
    'vznikly': 2, 'zaniknou': 3, 'díky': 3, 'lidé': 3, 'vědci': 1,
    'naší': 2, 'otázky': 1, 'světlo': 2,
}

KNOWN_BAD_CS = (
    'Otázky nám môžete nahrávať tu',
    'Všetko ostatné nájdete tu',
    'Podcastové hrnčeky a ponožky nájdete',
    'antirmeller',
    'AntimRller',
    'Vědátorský podcast',
    'Hľadať česky alebo slovenský',
    'Opäť sa nabíja',
    'Podcast vedátora  podľa tém',
)
KNOWN_BAD_SK = (
    'Hledat česky:',
    'Znovu načíst',
    'Číst více',
    'Číst méně',
)


def visible_html(value: str) -> str:
    return BeautifulSoup(value or '', 'html.parser').get_text(' ', strip=True)


def tag_signature(value: str) -> list[tuple[str, tuple[tuple[str, str], ...]]]:
    soup = BeautifulSoup(value or '', 'html.parser')
    result = []
    for tag in soup.find_all(True):
        # Preserve tag order and technical attributes, but ignore visible-language attrs.
        attrs = tuple(
            sorted(
                (str(key), ' '.join(val) if isinstance(val, list) else str(val))
                for key, val in tag.attrs.items()
                if key not in {'title', 'aria-label', 'alt'}
            )
        )
        result.append((tag.name, attrs))
    return result


def urls(value: str) -> list[str]:
    return URL_RE.findall(value or '')


def language_scores(value: str) -> tuple[int, int]:
    lowered = value.lower()
    words = [word.lower() for word in WORD_RE.findall(lowered)]
    sk = sum(SK_STRONG.get(word, 0) for word in words)
    cs = sum(CS_STRONG.get(word, 0) for word in words)
    sk += 4 * len(re.findall(r'[ľĺŕôä]', lowered))
    cs += 4 * len(re.findall(r'[řěů]', lowered))
    return sk, cs


def clearly_language(value: str, lang: str) -> bool:
    sk, cs = language_scores(value)
    if lang == 'sk':
        return sk >= 3 and sk >= cs + 2
    return cs >= 3 and cs >= sk + 2


def issue(
    report: list[dict],
    severity: str,
    where: str,
    message: str,
    source: str = '',
    target: str = '',
) -> None:
    report.append({
        'severity': severity,
        'where': where,
        'message': message,
        'source': source[:700],
        'target': target[:700],
    })


def check_common(
    report: list[dict],
    lang: str,
    where: str,
    source: str,
    target: str,
    *,
    html_mode: bool = False,
) -> None:
    src = visible_html(source) if html_mode else (source or '').strip()
    dst = visible_html(target) if html_mode else (target or '').strip()

    if not dst:
        issue(report, 'error', where, 'empty localized text', src, dst)
        return

    if html_mode:
        if tag_signature(source) != tag_signature(target):
            issue(report, 'error', where, 'HTML tag/attribute structure changed', source, target)
        if urls(source) != urls(target):
            issue(report, 'error', where, 'URL list or order changed', source, target)

    if REPEAT_RE.search(dst):
        issue(report, 'error', where, 'repeated phrase detected', src, dst)

    known_bad = KNOWN_BAD_CS if lang == 'cs' else KNOWN_BAD_SK
    lowered = dst.lower()
    for bad in known_bad:
        if bad.lower() in lowered:
            issue(report, 'error', where, f'known malformed or untranslated text: {bad}', src, dst)

    source_sentences = len(SENTENCE_END_RE.findall(src))
    target_sentences = len(SENTENCE_END_RE.findall(dst))
    # Allow one-count punctuation differences, but reject clear sentence loss.
    if source_sentences >= 2 and target_sentences + 1 < source_sentences:
        issue(
            report,
            'error',
            where,
            f'probable omitted sentences: {source_sentences} source vs {target_sentences} target',
            src,
            dst,
        )

    opposite = 'sk' if lang == 'cs' else 'cs'
    if src == dst and len(src) >= 12 and clearly_language(src, opposite):
        issue(report, 'error', where, f'clearly {opposite} source remained untranslated', src, dst)
    elif clearly_language(dst, opposite):
        # Require a strong signal; one ambiguous word is only a warning.
        sk, cs = language_scores(dst)
        foreign = sk if lang == 'cs' else cs
        native = cs if lang == 'cs' else sk
        severity = 'error' if foreign >= 6 and foreign >= native + 3 else 'warning'
        issue(report, severity, where, f'probable remaining {opposite} wording', src, dst)

    if len(src) >= 80:
        ratio = len(dst) / max(1, len(src))
        if ratio < 0.55 or ratio > 1.85:
            issue(report, 'warning', where, f'unusual length ratio {ratio:.2f}', src, dst)


def review_episodes(report: list[dict]) -> None:
    original = json.loads((SOURCE / 'episodes.json').read_text('utf-8'))
    source_items = original.get('episodes', [])

    for lang in ('cs', 'sk'):
        localized = json.loads((ROOT / 'locales' / f'episodes.{lang}.json').read_text('utf-8'))
        target_items = localized.get('episodes', [])
        if len(source_items) != len(target_items):
            issue(report, 'error', f'episodes.{lang}.json', 'episode list length differs')
            continue

        for index, (src, dst) in enumerate(zip(source_items, target_items)):
            number = src.get('number')
            label = f'episode index {index}' + (f' / no. {number}' if number is not None else '')

            for key in ('number', 'id', 'date', 'link', 'enclosure'):
                if src.get(key) != dst.get(key):
                    issue(report, 'error', label, f'technical field changed: {key}')

            if lang == 'cs':
                check_common(
                    report,
                    'cs',
                    f'{label} title',
                    str(src.get('title', '')),
                    str(dst.get('title', '')),
                )
                check_common(
                    report,
                    'cs',
                    f'{label} description',
                    str(src.get('description', '')),
                    str(dst.get('description', '')),
                    html_mode=True,
                )
            else:
                # The Slovak feed is canonical; only integrity is required here.
                if tag_signature(str(src.get('description', ''))) != tag_signature(str(dst.get('description', ''))):
                    issue(report, 'error', f'{label} sk description', 'canonical Slovak HTML changed')
                if urls(str(src.get('description', ''))) != urls(str(dst.get('description', ''))):
                    issue(report, 'error', f'{label} sk description', 'canonical Slovak URLs changed')


def review_string_maps(report: list[dict]) -> None:
    for lang in ('cs', 'sk'):
        path = ROOT / 'locales' / f'strings.{lang}.json'
        data = json.loads(path.read_text('utf-8'))
        for rel, entries in data.items():
            if not isinstance(entries, dict):
                issue(report, 'error', f'{path.name}:{rel}', 'map entry is not an object')
                continue
            for source, target in entries.items():
                where = f'{rel}: {source[:100]}'
                if '<' in source or '>' in source or '<' in str(target) or '>' in str(target):
                    issue(report, 'error', where, 'structural HTML found in string map', source, str(target))
                    continue
                check_common(report, lang, where, source, str(target))


def main() -> None:
    report: list[dict] = []
    review_episodes(report)
    review_string_maps(report)

    errors = [item for item in report if item['severity'] == 'error']
    warnings = [item for item in report if item['severity'] == 'warning']
    payload = {'errors': len(errors), 'warnings': len(warnings), 'issues': report}
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', 'utf-8')

    print(f'Quality review v4: {len(errors)} errors, {len(warnings)} warnings')
    for item in errors[:50]:
        print(f"ERROR {item['where']}: {item['message']}")
    for item in warnings[:15]:
        print(f"WARNING {item['where']}: {item['message']}")
    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
