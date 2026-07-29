#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlsplit

from bs4 import BeautifulSoup

from generate_explicit_locales_v2 import scan_js_literals

SOURCE = Path(sys.argv[1]).resolve()
ROOT = Path.cwd().resolve()
ALLOWED_EXTRA = {'language-switch.css','language-switch.js'}
TRANSLATABLE = {'.js','.html','.json','.webmanifest'}
BAD_TEXT = {
    'Dobre, dobre, dobre, dobre, dobre, dobre, dobre.',
    'Veľké trpaslíky',
    'aplikácia/javascript',
    "./episód-${n}- summary.js",
    'Hľadať česky alebo slovenský',
    'Opäť sa nabíja',
    'Podcast vedátora  podľa tém',
}
URL_RE = re.compile(r'https?://[^\s\'"`<>]+')
STORAGE_RE = re.compile(r'(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*([\'\"])(.*?)\1')
SELECTOR_RE = re.compile(r'(?:querySelector(?:All)?|getElementById|getElementsByClassName)\(\s*([\'\"])(.*?)\1')
FILE_RE = re.compile(r'([\'\"])([^\'\"]+\.(?:js|css|json|webmanifest|svg|png|jpe?g|mp3|m4a|woff2?)(?:\?[^\'\"]*)?)\1',re.I)
MIME_RE = re.compile(r'([\'\"])((?:audio|video|text|application)/[a-z0-9.+-]+(?:;\s*charset=[a-z0-9-]+)?)\1',re.I)
ASSETS_RE = re.compile(r'const\s+ASSETS\s*=\s*\[(.*?)\]\s*;',re.S)
QUOTED_RE = re.compile(r'([\'\"])(.*?)\1',re.S)


def files(root: Path) -> set[str]:
    return {p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and '.github' not in p.parts}


def node_check(path: Path) -> None:
    result=subprocess.run(['node','--check',str(path)],text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    if result.returncode: raise RuntimeError(f'JavaScript syntax failed: {path}\n{result.stdout}')


def technical(text: str) -> dict[str,set[str]]:
    return {
        'urls':set(URL_RE.findall(text)),
        'storage':{v for _,v in STORAGE_RE.findall(text)},
        'selectors':{v for _,v in SELECTOR_RE.findall(text)},
        'files':{v for _,v in FILE_RE.findall(text)},
        'mime':{v for _,v in MIME_RE.findall(text)},
    }


def compare_technical(src: Path,dst: Path) -> None:
    if src.name=='sw.js': return
    a=technical(src.read_text('utf-8')); b=technical(dst.read_text('utf-8'))
    for key in a:
        av=set(a[key]); bv=set(b[key])
        if key=='files': bv={v for v in bv if Path(v.split('?',1)[0]).name not in ALLOWED_EXTRA}
        if av!=bv:
            raise RuntimeError(f'{dst}: technical {key} changed; missing={sorted(av-bv)[:12]} added={sorted(bv-av)[:12]}')


def tag_signature(path: Path,remove_switch=False):
    soup=BeautifulSoup(path.read_text('utf-8'),'html.parser')
    if remove_switch:
        for tag in soup.find_all(['link','script']):
            ref=tag.get('href') or tag.get('src') or ''
            if 'language-switch.' in ref: tag.decompose()
    return [(t.name,t.get('id'),tuple(t.get('class',[])),t.get('type'),t.get('data-view')) for t in soup.find_all(True)]


def local_ref(value: str):
    if not value or value.startswith(('#','data:','blob:','mailto:','tel:','javascript:')): return None
    parts=urlsplit(value)
    if parts.scheme or parts.netloc or not parts.path or parts.path.endswith('/'): return None
    return parts.path.lstrip('./')


def validate_refs(root: Path,path: Path):
    soup=BeautifulSoup(path.read_text('utf-8'),'html.parser')
    for tag in soup.find_all(True):
        for attr in ('src','href'):
            value=tag.get(attr)
            if isinstance(value,str):
                rel=local_ref(value)
                if rel and not (path.parent/rel).resolve().is_file():
                    raise RuntimeError(f'Missing HTML reference in {path}: {value}')


def validate_sw(root: Path,lang: str):
    path=root/'sw.js'; text=path.read_text('utf-8')
    for bad in BAD_TEXT:
        if bad in text: raise RuntimeError(f'Known bad translation in {path}: {bad}')
    if 'slovak-ui.js' in text: raise RuntimeError(f'Legacy DOM translator still loaded in {path}')
    if 'application/javascript; charset=utf-8' not in text: raise RuntimeError(f'MIME type damaged in {path}')
    if 'VEDATOR_LOCALE_CACHE_GUARD' not in text: raise RuntimeError(f'Cache guard missing in {path}')
    if f'-{lang}\'' not in text and f'-{lang}"' not in text: raise RuntimeError(f'Locale cache suffix missing in {path}')
    match=ASSETS_RE.search(text)
    if not match: raise RuntimeError(f'ASSETS not found in {path}')
    values=[v for _,v in QUOTED_RE.findall(match.group(1))]
    for value in values:
        if value in {'','./'}: continue
        rel=local_ref(value)
        if rel and not (root/rel).is_file(): raise RuntimeError(f'Missing cached file in {path}: {value}')


def validate_maps(source: Path,root: Path,lang: str):
    mapping_path=ROOT/'locales'/f'strings.{lang}.json'
    maps=json.loads(mapping_path.read_text('utf-8')) if mapping_path.exists() else {}
    overrides=json.loads((ROOT/'locales'/'manual-overrides.json').read_text('utf-8'))[lang]
    for rel,path_map in maps.items():
        src=source/rel; dst=root/rel
        if not src.is_file() or not dst.is_file(): raise RuntimeError(f'Mapped source file missing: {rel}')
        source_values=[v for _,_,_,v in scan_js_literals(src.read_text('utf-8'))] if src.suffix=='.js' else []
        target_values=[v for _,_,_,v in scan_js_literals(dst.read_text('utf-8'))] if dst.suffix=='.js' else []
        for original,translated in path_map.items():
            if src.suffix=='.js' and original in source_values and translated not in target_values:
                raise RuntimeError(f'Explicit translation not applied in {lang}/{rel}: {original!r} -> {translated!r}')
    # Reviewed labels must be visible in the localized index whenever their source occurs in the original index.
    source_index=(source/'index.html').read_text('utf-8'); target_index=(root/'index.html').read_text('utf-8')
    for original,translated in overrides.items():
        if original in source_index and translated not in target_index:
            raise RuntimeError(f'Reviewed index translation missing ({lang}): {original!r} -> {translated!r}')


def validate_episodes(lang: str):
    original=json.loads((SOURCE/'episodes.json').read_text('utf-8'))
    localized=json.loads((ROOT/lang/'episodes.json').read_text('utf-8'))
    if original.get('count')!=388 or localized.get('count')!=original.get('count'):
        raise RuntimeError(f'{lang}: episode count mismatch')
    a=original['episodes']; b=localized['episodes']
    if len(a)!=len(b): raise RuntimeError(f'{lang}: episode list length mismatch')
    for src,dst in zip(a,b):
        for key in ('number','id','date','link','enclosure'):
            if src.get(key)!=dst.get(key): raise RuntimeError(f'{lang}: technical episode field changed for {src.get("number")}: {key}')
        if not dst.get('title') or not isinstance(dst.get('description'),str): raise RuntimeError(f'{lang}: empty localized content for {src.get("number")}')


def validate_locale(lang: str):
    root=ROOT/lang
    src_files=files(SOURCE); dst_files=files(root)
    missing=sorted(src_files-dst_files); extra=sorted(dst_files-src_files-ALLOWED_EXTRA)
    if missing: raise RuntimeError(f'{lang}: missing one-to-one files: {missing}')
    if extra: raise RuntimeError(f'{lang}: unexpected files: {extra}')
    for rel in sorted(src_files):
        src=SOURCE/rel; dst=root/rel
        if src.suffix=='.css' or src.suffix not in TRANSLATABLE:
            if src.read_bytes()!=dst.read_bytes(): raise RuntimeError(f'{lang}: design/binary changed: {rel}')
        if src.suffix in {'.js','.html'}: compare_technical(src,dst)
    if tag_signature(SOURCE/'index.html')!=tag_signature(root/'index.html',True): raise RuntimeError(f'{lang}: index DOM structure differs')
    for path in root.rglob('*'):
        if not path.is_file(): continue
        text=path.read_text('utf-8',errors='ignore')
        for bad in BAD_TEXT:
            if bad in text: raise RuntimeError(f'Known bad translation in {path}: {bad}')
        if path.suffix=='.js': node_check(path)
        elif path.suffix in {'.json','.webmanifest'}: json.loads(text)
        elif path.suffix=='.html': validate_refs(root,path)
    html=(root/'index.html').read_text('utf-8')
    if not re.search(rf'<html\b[^>]*\blang=[\'\"]{lang}[\'\"]',html,re.I): raise RuntimeError(f'{lang}: html lang missing')
    expected='sk-SK' if lang=='sk' else 'cs-CZ'
    if expected not in html: raise RuntimeError(f'{lang}: date locale missing')
    manifest=json.loads((root/'manifest.webmanifest').read_text('utf-8'))
    for key,value in {'lang':lang,'start_url':'./','scope':'../','id':'../'}.items():
        if manifest.get(key)!=value: raise RuntimeError(f'{lang}: manifest {key} invalid')
    validate_sw(root,lang); validate_maps(SOURCE,root,lang); validate_episodes(lang)


def main():
    for required in ('index.html','sw.js','manifest.webmanifest','icon.svg'):
        if not (ROOT/required).is_file(): raise RuntimeError(f'Root file missing: {required}')
    for lang in ('sk','cs'): validate_locale(lang)
    node_check(ROOT/'sw.js')
    print('Explicit Czech/Slovak localization passed strict validation.')

if __name__=='__main__': main()
