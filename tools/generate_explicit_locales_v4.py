#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

import generate_explicit_locales as base
import generate_explicit_locales_v2 as scanner
import generate_explicit_locales_v3 as nllb

base.decode_js_strings = scanner.scan_js_literals
base.MT = nllb.NLLBContentTranslator


def checkpoint(paths: list[str], message: str) -> None:
    if os.environ.get('VEDATOR_GIT_CHECKPOINT') != '1':
        return
    subprocess.run(['git', 'add', *paths], check=True)
    quiet = subprocess.run(['git', 'diff', '--cached', '--quiet']).returncode == 0
    if quiet:
        return
    subprocess.run(['git', 'commit', '-m', message + ' [skip ci]'], check=True)
    subprocess.run(['git', 'push', 'origin', 'HEAD:proper-i18n'], check=True)


def write_episode_partial(source: dict, completed: dict[int, dict], path: Path) -> None:
    ordered = []
    for episode in source['episodes']:
        number = int(episode.get('number') or -1)
        if number in completed:
            ordered.append(completed[number])
    data = {**source, 'episodes': ordered}
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', 'utf-8')


def generate_episodes(mt) -> None:
    source = json.loads((base.SOURCE / 'episodes.json').read_text('utf-8'))
    sk_path = base.OUT / 'episodes.sk.json'
    cs_path = base.OUT / 'episodes.cs.json'
    sk_path.write_text(json.dumps(source, ensure_ascii=False, indent=2) + '\n', 'utf-8')

    completed: dict[int, dict] = {}
    if cs_path.exists():
        existing = json.loads(cs_path.read_text('utf-8'))
        completed = {int(item.get('number') or -1): item for item in existing.get('episodes', [])}

    newly_done = 0
    for index, episode in enumerate(source['episodes'], start=1):
        number = int(episode.get('number') or -1)
        if number in completed:
            continue
        item = dict(episode)
        item['title'] = mt.many([episode['title']], 'sk', 'cs')[episode['title']]
        item['description'] = base.translate_html_fragment(episode.get('description', ''), mt, 'sk', 'cs')
        completed[number] = item
        newly_done += 1
        write_episode_partial(source, completed, cs_path)
        print(f'episodes cs complete: {len(completed)}/{len(source["episodes"])}', flush=True)
        if newly_done % 20 == 0:
            checkpoint(['locales/episodes.sk.json', 'locales/episodes.cs.json'], f'Checkpoint explicit episode translations {len(completed)}/388')

    write_episode_partial(source, completed, cs_path)
    checkpoint(['locales/episodes.sk.json', 'locales/episodes.cs.json'], 'Complete explicit Czech and Slovak episode data')


def generate_string_maps(mt) -> None:
    paths = [base.SOURCE / 'index.html'] + sorted(base.SOURCE.glob('*.js'))
    maps = {'cs': {}, 'sk': {}}
    for lang in maps:
        path = base.OUT / f'strings.{lang}.json'
        if path.exists():
            maps[lang] = json.loads(path.read_text('utf-8'))

    processed = 0
    for path in paths:
        rel = path.name
        text = path.read_text('utf-8')
        is_summary = bool(base.SUMMARY_RE.fullmatch(rel))
        candidates: list[str] = []
        if path.suffix == '.js':
            for _, _, _, value in scanner.scan_js_literals(text):
                if base.safe_candidate(value, rel, is_summary):
                    candidates.append(value)
        else:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(text, 'html.parser')
            for node in soup.find_all(string=True):
                if node.parent and node.parent.name not in {'style', 'script'} and base.safe_candidate(str(node), rel):
                    candidates.append(str(node))
            for tag in soup.find_all(True):
                for attr in ('placeholder', 'title', 'aria-label', 'alt'):
                    value = tag.get(attr)
                    if isinstance(value, str) and base.safe_candidate(value, rel):
                        candidates.append(value)
            for script in soup.find_all('script'):
                for _, _, _, value in scanner.scan_js_literals(script.string or ''):
                    if base.safe_candidate(value, rel, False):
                        candidates.append(value)

        candidates = list(dict.fromkeys(candidates))
        if not candidates:
            continue

        changed = False
        for target in ('cs', 'sk'):
            existing = maps[target].setdefault(rel, {})
            missing = [value for value in candidates if value not in existing]
            by_source = {'cs': [], 'sk': []}
            for value in missing:
                by_source[base.detect_language(value, 'cs')].append(value)
            for source_lang, values in by_source.items():
                if not values:
                    continue
                plain = [value for value in values if not ('<' in value and '>' in value)]
                translated = mt.many(plain, source_lang, target)
                for value in values:
                    if '<' in value and '>' in value:
                        existing[value] = base.translate_html_fragment(value, mt, source_lang, target)
                    else:
                        existing[value] = translated[value]
                    changed = True
            (base.OUT / f'strings.{target}.json').write_text(json.dumps(maps[target], ensure_ascii=False, indent=2) + '\n', 'utf-8')

        processed += 1
        print(f'explicit string map: {rel} ({len(candidates)} candidates)', flush=True)
        if changed and processed % 5 == 0:
            checkpoint(['locales/strings.cs.json', 'locales/strings.sk.json'], f'Checkpoint explicit UI and summary maps after {processed} files')

    checkpoint(['locales/strings.cs.json', 'locales/strings.sk.json'], 'Complete explicit UI, summary and chapter maps')


base.generate_episodes = generate_episodes
base.generate_string_maps = generate_string_maps

if __name__ == '__main__':
    base.main()
