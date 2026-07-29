#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from bs4 import BeautifulSoup

import generate_explicit_locales as base
import generate_explicit_locales_v2 as scanner
import generate_explicit_locales_v3 as nllb
import generate_explicit_locales_v4 as staged
import generate_explicit_locales_v5 as resumable  # patches staged.checkpoint to include memory

base.decode_js_strings = scanner.scan_js_literals
base.MT = nllb.NLLBContentTranslator


def description_nodes(value: str) -> list[str]:
    soup = BeautifulSoup(value or '', 'html.parser')
    return [
        str(node)
        for node in soup.find_all(string=True)
        if base.safe_candidate(str(node), 'episodes.json', False)
    ]


def apply_description(value: str, mapping: dict[str, str]) -> str:
    soup = BeautifulSoup(value or '', 'html.parser')
    for node in list(soup.find_all(string=True)):
        original = str(node)
        translated = mapping.get(original)
        if translated is not None and translated != original:
            node.replace_with(translated)
    return str(soup)


def translate_in_resumable_chunks(mt, values: list[str], source: str, target: str, label: str) -> dict[str, str]:
    unique = list(dict.fromkeys(values))
    result: dict[str, str] = {}
    chunk_size = 200
    for offset in range(0, len(unique), chunk_size):
        chunk = unique[offset:offset + chunk_size]
        result.update(mt.many(chunk, source, target))
        staged.checkpoint(
            ['locales/translation-memory.json'],
            f'Checkpoint {label} translation memory {min(offset + len(chunk), len(unique))}/{len(unique)}',
        )
    return result


def generate_episodes(mt) -> None:
    source = json.loads((base.SOURCE / 'episodes.json').read_text('utf-8'))
    episodes = source['episodes']
    sk_path = base.OUT / 'episodes.sk.json'
    cs_path = base.OUT / 'episodes.cs.json'
    sk_path.write_text(json.dumps(source, ensure_ascii=False, indent=2) + '\n', 'utf-8')

    titles = [episode.get('title', '') for episode in episodes if episode.get('title')]
    segments: list[str] = []
    for episode in episodes:
        segments.extend(description_nodes(episode.get('description', '')))

    print(f'Unique source titles: {len(set(titles))}; unique description segments: {len(set(segments))}', flush=True)
    title_map = translate_in_resumable_chunks(mt, titles, 'sk', 'cs', 'episode titles')
    segment_map = translate_in_resumable_chunks(mt, segments, 'sk', 'cs', 'episode descriptions')

    localized = []
    for episode in episodes:
        item = dict(episode)
        item['title'] = title_map.get(episode.get('title', ''), episode.get('title', ''))
        item['description'] = apply_description(episode.get('description', ''), segment_map)
        localized.append(item)

    target = {**source, 'episodes': localized}
    cs_path.write_text(json.dumps(target, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    staged.checkpoint(
        ['locales/episodes.sk.json', 'locales/episodes.cs.json', 'locales/translation-memory.json'],
        'Complete explicit Czech and Slovak episode data',
    )
    print(f'Explicit episode data complete: {len(localized)} episodes.', flush=True)


base.generate_episodes = generate_episodes

if __name__ == '__main__':
    base.main()
