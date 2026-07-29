#!/usr/bin/env python3
from __future__ import annotations

import re

import review_locale_quality as base

_original_check_text = base.check_text
CS_FORBIDDEN = (
    'Otázky nám môžete nahrávať tu',
    'Všetko ostatné nájdete tu',
    'antirmeller',
    'AntimRller',
    'Vědátorský podcast',
)
SENTENCE_END_RE = re.compile(r'[.!?…](?=\s|$)')


def check_text(report, lang: str, where: str, source: str, target: str, html_mode=False):
    _original_check_text(report, lang, where, source, target, html_mode)
    src = base.visible_html(source) if html_mode else source.strip()
    dst = base.visible_html(target) if html_mode else target.strip()

    if lang == 'cs':
        lowered = dst.lower()
        for forbidden in CS_FORBIDDEN:
            if forbidden.lower() in lowered:
                base.issue(report, 'error', where, f'forbidden untranslated or malformed Czech text: {forbidden}', src, dst)

    source_sentences = len(SENTENCE_END_RE.findall(src))
    target_sentences = len(SENTENCE_END_RE.findall(dst))
    if source_sentences >= 2 and target_sentences < source_sentences:
        base.issue(
            report,
            'error',
            where,
            f'sentence count decreased from {source_sentences} to {target_sentences}',
            src,
            dst,
        )


base.check_text = check_text

if __name__ == '__main__':
    base.main()
