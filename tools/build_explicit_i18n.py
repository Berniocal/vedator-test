#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString

from generate_explicit_locales_v2 import scan_js_literals

SOURCE = Path(sys.argv[1]).resolve()
ROOT = Path.cwd().resolve()
LOCALES = ROOT / 'locales'


def encode_js(value: str, quote: str) -> str:
    value = value.replace('\\', '\\\\').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
    value = value.replace(quote, '\\' + quote).replace('</script', '<\\/script')
    return quote + value + quote


def apply_js(text: str, mapping: dict[str, str]) -> str:
    replacements: list[tuple[int, int, str]] = []
    for start, end, kind, value in scan_js_literals(text):
        translated = mapping.get(value)
        if translated is None or translated == value:
            continue
        if kind == 'template':
            replacement = translated.replace('`', '\\`').replace('${', '\\${')
        else:
            replacement = encode_js(translated, kind)
        replacements.append((start, end, replacement))
    for start, end, replacement in reversed(replacements):
        text = text[:start] + replacement + text[end:]
    return text


def apply_html(text: str, mapping: dict[str, str], lang: str) -> str:
    script_re = re.compile(r'(<script\b[^>]*>)(.*?)(</script>)', re.I | re.S)
    scripts: list[str] = []
    def stash(match: re.Match[str]) -> str:
        scripts.append(match.group(2))
        return match.group(1) + f'__VEDATOR_SCRIPT_{len(scripts)-1}__' + match.group(3)

    soup = BeautifulSoup(script_re.sub(stash, text), 'html.parser')
    for node in list(soup.find_all(string=True)):
        if not node.parent or node.parent.name in {'style', 'script'}:
            continue
        value = str(node)
        if value in mapping:
            node.replace_with(NavigableString(mapping[value]))
    for tag in soup.find_all(True):
        for attr in ('placeholder', 'title', 'aria-label', 'alt'):
            value = tag.get(attr)
            if isinstance(value, str) and value in mapping:
                tag[attr] = mapping[value]
    if soup.html:
        soup.html['lang'] = lang
    output = str(soup)
    for index, script in enumerate(scripts):
        output = output.replace(f'__VEDATOR_SCRIPT_{index}__', apply_js(script, mapping))
    if 'language-switch.css' not in output:
        output = output.replace('</head>', '<link rel="stylesheet" href="./language-switch.css"></head>')
    if 'language-switch.js' not in output:
        output = output.replace('</body>', '<script src="./language-switch.js" defer></script></body>')
    locale = 'sk-SK' if lang == 'sk' else 'cs-CZ'
    output = re.sub(r"Intl\.DateTimeFormat\((['\"])cs-CZ\1", lambda m: f"Intl.DateTimeFormat({m.group(1)}{locale}{m.group(1)}", output)
    if lang == 'sk':
        output = re.sub(r"(localeCompare\([^,]+,\s*)(['\"])cs\2", r"\1'sk'", output)
    return output


def patch_manifest(path: Path, mapping: dict[str, str], lang: str) -> None:
    data = json.loads(path.read_text('utf-8'))
    for key in ('name', 'short_name', 'description'):
        if isinstance(data.get(key), str) and data[key] in mapping:
            data[key] = mapping[data[key]]
    data['lang'] = lang
    data['start_url'] = './'
    data['scope'] = '../'
    data['id'] = '../'
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', 'utf-8')


def patch_service_worker(path: Path, lang: str) -> None:
    text = path.read_text('utf-8')
    text = re.sub(r"const CACHE='([^']+)'", lambda m: f"const CACHE='{m.group(1)}-{lang}'", text, count=1)
    text = re.sub(r"const VERSION='([^']+)'", lambda m: f"const VERSION='{m.group(1)}-{lang}'", text, count=1)

    # The old Slovak DOM translator is deliberately not loaded in either language.
    text = text.replace("'slovak-ui.js',", '').replace(",'slovak-ui.js'", '').replace("'slovak-ui.js'", '')
    text = re.sub(r',\s*,', ',', text)

    def patch_assets(match: re.Match[str]) -> str:
        body = match.group(1)
        for value in ('language-switch.css', 'language-switch.js'):
            if f"'{value}'" not in body:
                body += f",'{value}'"
        return 'const ASSETS=[' + body.strip().strip(',') + '];'
    text = re.sub(r'const ASSETS=\[(.*?)\];', patch_assets, text, count=1, flags=re.S)

    def patch_injected(match: re.Match[str]) -> str:
        body = match.group(1)
        if "'language-switch.js'" not in body:
            body += ",'language-switch.js'"
        return 'const js=[' + body.strip().strip(',') + '];'
    text = re.sub(r'const js=\[(.*?)\];', patch_injected, text, count=1, flags=re.S)

    old = '.filter(k=>k!==CACHE)'
    guard = f".filter(k=>k!==CACHE&&(!/-(?:sk|cs)$/.test(k)||k.endsWith('-{lang}')))/*VEDATOR_LOCALE_CACHE_GUARD*/"
    if old in text:
        text = text.replace(old, guard, 1)
    if 'VEDATOR_LOCALE_CACHE_GUARD' not in text:
        raise RuntimeError(f'Could not patch cache cleanup in {path}')
    path.write_text(text, 'utf-8')


def write_switch(target: Path, lang: str) -> None:
    (target / 'language-switch.css').write_text(
        ".vedator-language-switch{display:flex;gap:3px;padding:3px;border:1px solid rgba(255,255,255,.4);border-radius:11px;background:rgba(255,255,255,.12);flex:0 0 auto}"
        ".vedator-language-switch button{border:0;border-radius:8px;padding:7px 9px;background:transparent;color:#fff;font:inherit;font-size:.82rem;font-weight:850;cursor:pointer}"
        ".vedator-language-switch button.active{background:#fff;color:#241b58}"
        "@media(max-width:550px){.vedator-language-switch button{padding:6px 7px;font-size:.74rem}}\n",
        'utf-8',
    )
    aria = 'Jazyk aplikácie' if lang == 'sk' else 'Jazyk aplikace'
    script = f"""(()=>{{
const current='{lang}';
function mount(){{
 if(document.querySelector('.vedator-language-switch'))return;
 const row=document.querySelector('.header-row');if(!row)return;
 const box=document.createElement('div');box.className='vedator-language-switch';box.setAttribute('role','group');box.setAttribute('aria-label',{json.dumps(aria, ensure_ascii=False)});
 box.innerHTML='<button type="button" data-lang="sk">SK</button><button type="button" data-lang="cs">CZ</button>';
 box.querySelectorAll('button').forEach(button=>{{button.classList.toggle('active',button.dataset.lang===current);button.addEventListener('click',()=>{{const next=button.dataset.lang;if(next===current)return;localStorage.setItem('vedator-language',next);const url=new URL(location.href);url.pathname=url.pathname.replace(/\\/(?:sk|cs)(?:\\/index\\.html)?\\/?$/,`/${{next}}/`);location.href=url.href}})}});
 const install=document.querySelector('#installApp');if(install&&install.parentElement===row)row.insertBefore(box,install);else row.appendChild(box);
}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{{once:true}});else mount();
}})();\n"""
    (target / 'language-switch.js').write_text(script, 'utf-8')


def merged_map(lang: str, path: str, strings: dict, overrides: dict) -> dict[str, str]:
    result = dict(overrides.get(lang, {}))
    result.update(strings.get(path, {}))
    # Reviewed values always win over generated drafts.
    result.update(overrides.get(lang, {}))
    return result


def build_locale(lang: str) -> None:
    target = ROOT / lang
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(SOURCE, target, ignore=shutil.ignore_patterns('.git', '.github'))

    strings_path = LOCALES / f'strings.{lang}.json'
    strings = json.loads(strings_path.read_text('utf-8')) if strings_path.exists() else {}
    overrides = json.loads((LOCALES / 'manual-overrides.json').read_text('utf-8'))

    for path in sorted(target.rglob('*')):
        if not path.is_file():
            continue
        rel = path.relative_to(target).as_posix()
        mapping = merged_map(lang, rel, strings, overrides)
        if path.suffix == '.js' and path.name != 'sw.js':
            path.write_text(apply_js(path.read_text('utf-8'), mapping), 'utf-8')
        elif path.suffix == '.html':
            path.write_text(apply_html(path.read_text('utf-8'), mapping, lang), 'utf-8')
        elif path.suffix == '.webmanifest':
            patch_manifest(path, mapping, lang)

    episodes = LOCALES / f'episodes.{lang}.json'
    if not episodes.exists():
        raise RuntimeError(f'Missing explicit episode data: {episodes}')
    shutil.copyfile(episodes, target / 'episodes.json')
    patch_service_worker(target / 'sw.js', lang)
    write_switch(target, lang)


def write_root() -> None:
    icon = SOURCE / 'icon.svg'
    if icon.exists(): shutil.copyfile(icon, ROOT / 'icon.svg')
    (ROOT / 'manifest.webmanifest').write_text(json.dumps({
        'name':'Vedátorský podcast','short_name':'Vedátor','lang':'sk','id':'./','start_url':'./','scope':'./',
        'display':'standalone','background_color':'#111827','theme_color':'#111827',
        'icons':[{'src':'icon.svg','sizes':'any','type':'image/svg+xml','purpose':'any maskable'}]
    }, ensure_ascii=False, separators=(',', ':')) + '\n', 'utf-8')
    (ROOT / 'sw.js').write_text(
        "const OLD_CACHE=/^(?:vedator-test|vedator-temata)(?!.*-(?:sk|cs)$)/;\n"
        "self.addEventListener('install',e=>self.skipWaiting());\n"
        "self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(OLD_CACHE.test(k))await caches.delete(k);await self.clients.claim();await self.registration.unregister()})()));\n",
        'utf-8')
    (ROOT / 'index.html').write_text(
        '<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111827"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg" type="image/svg+xml"><title>Vedátorský podcast</title><script>(async()=>{try{if("serviceWorker" in navigator)await navigator.serviceWorker.register("./sw.js",{scope:"./"})}catch(e){}const l=localStorage.getItem("vedator-language")==="cs"?"cs":"sk";location.replace("./"+l+"/"+location.search+location.hash)})();</script></head><body></body></html>\n',
        'utf-8')


def main() -> None:
    if not SOURCE.exists(): raise SystemExit(f'Missing source: {SOURCE}')
    for lang in ('sk','cs'): build_locale(lang)
    write_root()

if __name__ == '__main__': main()
