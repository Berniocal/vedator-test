#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path.cwd()
SOURCE = Path(sys.argv[1]).resolve()
URL_RE = re.compile(r'https?://[^\s<>"\']+')
REPEAT_RE = re.compile(r'\b([A-Za-zÁ-ž]{3,}(?:\s+[A-Za-zÁ-ž]{3,}){0,3})(?:[\s,;:–—-]+\1){2,}\b', re.I)
FOREIGN = {
    'cs': re.compile(r'\b(?:prečo|môže|môžu|nie|sú|všetko|nájdete|epizóda|epizódy|diel|ďalší|ktorý|ktorá|ktoré|ľudia|vedci|vesmírny|čierne|hviezdy)\b', re.I),
    'sk': re.compile(r'\b(?:proč|může|mohou|není|jsou|všechno|najdete|epizoda|epizody|díl|další|který|která|které|lidé|vědci|vesmírný|černé|hvězdy)\b', re.I),
}
UNIQUE_CHARS = {'cs': re.compile(r'[ľĺŕôä]'), 'sk': re.compile(r'[řěů]')}


def visible_html(value: str) -> str:
    return BeautifulSoup(value or '', 'html.parser').get_text(' ', strip=True)


def tags(value: str) -> list[str]:
    return [tag.name for tag in BeautifulSoup(value or '', 'html.parser').find_all(True)]


def urls(value: str) -> list[str]:
    return URL_RE.findall(value or '')


def issue(report: list[dict], severity: str, where: str, message: str, source: str='', target: str=''):
    report.append({'severity': severity, 'where': where, 'message': message, 'source': source[:500], 'target': target[:500]})


def check_text(report, lang: str, where: str, source: str, target: str, html_mode=False):
    src = visible_html(source) if html_mode else source.strip()
    dst = visible_html(target) if html_mode else target.strip()
    if not dst:
        issue(report, 'error', where, 'empty translation', src, dst); return
    if html_mode:
        if tags(source) != tags(target): issue(report, 'error', where, 'HTML tag structure changed', source, target)
        if urls(source) != urls(target): issue(report, 'error', where, 'URL list changed', source, target)
    if len(src) > 25 and src == dst:
        issue(report, 'error', where, 'long source text remained untranslated', src, dst)
    if REPEAT_RE.search(dst): issue(report, 'error', where, 'repeated phrase detected', src, dst)
    foreign = FOREIGN[lang].search(dst)
    if foreign: issue(report, 'warning', where, f'probable foreign-language word: {foreign.group(0)}', src, dst)
    unique = UNIQUE_CHARS[lang].search(dst)
    if unique: issue(report, 'warning', where, f'probable foreign-language character: {unique.group(0)}', src, dst)
    src_len = max(1, len(src)); ratio = len(dst) / src_len
    if len(src) > 60 and (ratio < 0.55 or ratio > 1.8):
        issue(report, 'warning', where, f'unusual length ratio {ratio:.2f}', src, dst)


def main():
    report=[]
    original=json.loads((SOURCE/'episodes.json').read_text('utf-8'))
    for lang in ('cs','sk'):
        localized=json.loads((ROOT/'locales'/f'episodes.{lang}.json').read_text('utf-8'))
        src_by={int(x.get('number') or -1):x for x in original['episodes']}
        for item in localized.get('episodes',[]):
            number=int(item.get('number') or -1); src=src_by[number]
            if lang=='cs':
                check_text(report,lang,f'episode {number} title',src.get('title',''),item.get('title',''))
                check_text(report,lang,f'episode {number} description',src.get('description',''),item.get('description',''),True)
            else:
                # Slovak feed is the canonical source; only structural checks are needed.
                if tags(src.get('description','')) != tags(item.get('description','')): issue(report,'error',f'episode {number} sk','Slovak HTML changed')
                if urls(src.get('description','')) != urls(item.get('description','')): issue(report,'error',f'episode {number} sk','Slovak URLs changed')

        maps=json.loads((ROOT/'locales'/f'strings.{lang}.json').read_text('utf-8'))
        for path,entries in maps.items():
            for source,target in entries.items():
                if source==target: continue
                check_text(report,lang,f'{path}: {source[:80]}',source,target,'<' in source and '>' in source)

    errors=[x for x in report if x['severity']=='error']
    warnings=[x for x in report if x['severity']=='warning']
    out={'errors':len(errors),'warnings':len(warnings),'issues':report}
    (ROOT/'locales'/'quality-report.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n','utf-8')
    print(f'Quality review: {len(errors)} errors, {len(warnings)} warnings')
    if errors:
        for item in errors[:30]: print(f"ERROR {item['where']}: {item['message']}")
        raise SystemExit(1)

if __name__=='__main__': main()
