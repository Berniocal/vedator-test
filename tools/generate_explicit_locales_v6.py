#!/usr/bin/env python3
from __future__ import annotations

import json
import re

from bs4 import BeautifulSoup

import generate_explicit_locales as base
import generate_explicit_locales_v2 as scanner
import generate_explicit_locales_v3 as translator
import generate_explicit_locales_v4 as staged
import generate_explicit_locales_v5 as resumable  # patches staged.checkpoint to include memory

base.decode_js_strings = scanner.scan_js_literals
base.MT = translator.BiDiContentTranslator

SENTENCE_SPLIT_RE = re.compile(r'(?<=[.!?…])(\s+)')


def text_parts(value: str) -> list[str]:
    """Split visible text into sentences while preserving whitespace exactly."""
    raw = re.split(SENTENCE_SPLIT_RE, value)
    return [part for part in raw if part != '']


def translatable_parts(value: str) -> list[str]:
    return [
        part
        for part in text_parts(value)
        if not part.isspace() and base.safe_candidate(part, 'episodes.json', False)
    ]


def description_segments(value: str) -> list[str]:
    soup = BeautifulSoup(value or '', 'html.parser')
    result: list[str] = []
    for node in soup.find_all(string=True):
        result.extend(translatable_parts(str(node)))
    return result


def apply_description(value: str, mapping: dict[str, str]) -> str:
    soup = BeautifulSoup(value or '', 'html.parser')
    for node in list(soup.find_all(string=True)):
        original = str(node)
        rebuilt = ''.join(mapping.get(part, part) for part in text_parts(original))
        if rebuilt != original:
            node.replace_with(rebuilt)
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


def write_review_sample(mt, episodes: list[dict]) -> None:
    sample_source = episodes[:10]
    sample_titles = [episode.get('title', '') for episode in sample_source if episode.get('title')]
    sample_segments: list[str] = []
    for episode in sample_source:
        sample_segments.extend(description_segments(episode.get('description', '')))
    title_map = mt.many(sample_titles, 'sk', 'cs')
    segment_map = mt.many(list(dict.fromkeys(sample_segments)), 'sk', 'cs')
    sample = []
    for episode in sample_source:
        sample.append({
            'number': episode.get('number'),
            'sourceTitle': episode.get('title', ''),
            'title': title_map.get(episode.get('title', ''), episode.get('title', '')),
            'sourceDescription': episode.get('description', ''),
            'description': apply_description(episode.get('description', ''), segment_map),
            'link': episode.get('link'),
            'enclosure': episode.get('enclosure'),
        })
    path = base.OUT / 'episode-sample.cs.json'
    path.write_text(json.dumps(sample, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    staged.checkpoint(
        ['locales/episode-sample.cs.json', 'locales/translation-memory.json'],
        'Regenerate ten-episode Czech translation quality sample',
    )
    print('Ten-episode Czech quality sample saved.', flush=True)


def generate_episodes(mt) -> None:
    source = json.loads((base.SOURCE / 'episodes.json').read_text('utf-8'))
    episodes = source['episodes']
    sk_path = base.OUT / 'episodes.sk.json'
    cs_path = base.OUT / 'episodes.cs.json'
    sk_path.write_text(json.dumps(source, ensure_ascii=False, indent=2) + '\n', 'utf-8')

    write_review_sample(mt, episodes)

    titles = [episode.get('title', '') for episode in episodes if episode.get('title')]
    segments: list[str] = []
    for episode in episodes:
        segments.extend(description_segments(episode.get('description', '')))

    print(f'Unique source titles: {len(set(titles))}; unique description sentences: {len(set(segments))}', flush=True)
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
