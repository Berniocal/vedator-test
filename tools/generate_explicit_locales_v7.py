#!/usr/bin/env python3
from __future__ import annotations

from bs4 import BeautifulSoup

import generate_explicit_locales_v6 as staged

# Exact reviewed translations that must win even when the source text contains
# non-breaking spaces or line breaks around it.
REVIEWED_CS = {
    'Otázky nám môžete nahrávať tu': 'Otázky nám můžete nahrávat zde',
    'Všetko ostatné nájdete tu': 'Všechno ostatní najdete zde',
    'Podcastové hrnčeky a ponožky nájdete na stránke': 'Podcastové hrnky a ponožky najdete na stránce',
    'Podcast vzniká v spolupráci so SME.': 'Podcast vzniká ve spolupráci se SME.',
    'Bonusové epizódy a extra obsah k podcastom nájdete na': 'Bonusové epizody a další obsah k podcastům najdete na',
    'Samuelova nová kniha už je v predaji': 'Samuelova nová kniha je již v prodeji',
    'Kniha Dominiky - Cesta do mozgu a späť:': 'Kniha Dominiky – Cesta do mozku a zpět:',
    'Video spomínané v epizóde:': 'Video zmíněné v epizodě:',
    'Galéria Webbovho teleskopu:': 'Galerie Webbova teleskopu:',
    'Čo v skutočnosti signalizuje hladina Antimüllerovho hormónu?': 'Co ve skutečnosti signalizuje hladina Antimüllerova hormonu?',
}

staged.base.MANUAL.setdefault('cs', {}).update(REVIEWED_CS)


def preserve_outer_whitespace(original: str, replacement: str) -> str:
    left = original[: len(original) - len(original.lstrip())]
    right = original[len(original.rstrip()):]
    return left + replacement + right


def apply_description(value: str, mapping: dict[str, str]) -> str:
    soup = BeautifulSoup(value or '', 'html.parser')
    for node in list(soup.find_all(string=True)):
        original = str(node)
        stripped = original.strip()
        if stripped in REVIEWED_CS:
            rebuilt = preserve_outer_whitespace(original, REVIEWED_CS[stripped])
        else:
            rebuilt = ''.join(mapping.get(part, part) for part in staged.text_parts(original))
        # Final deterministic correction for a known model spelling artefact.
        rebuilt = rebuilt.replace('antirmellerova hormonu', 'Antimüllerova hormonu')
        rebuilt = rebuilt.replace('AntimRllerova hormonu', 'Antimüllerova hormonu')
        if rebuilt != original:
            node.replace_with(rebuilt)
    return str(soup)


# v6 functions resolve apply_description from their own module globals.
staged.apply_description = apply_description

if __name__ == '__main__':
    staged.base.main()
