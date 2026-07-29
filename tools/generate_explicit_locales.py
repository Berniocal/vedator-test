#!/usr/bin/env python3
from __future__ import annotations

import ast
import html
import json
import os
import re
import sys
from pathlib import Path
from typing import Iterable

from bs4 import BeautifulSoup

SOURCE = Path(sys.argv[1]).resolve()
OUT = Path('locales')
OUT.mkdir(exist_ok=True)

SUMMARY_RE = re.compile(r'episode-\d+(?:-\d+)*-(?:summary|chapters)\.js$')
URL_RE = re.compile(r'https?://[^\s<>"\']+')
TIME_RE = re.compile(r'^\d{1,3}:\d{2}(?::\d{2})?$')
TECH_RE = re.compile(
    r'^(?:[#.][\w-]+|[\w-]+(?:\s+[\w-]+){0,4}|[\w-]+\.(?:js|css|json|svg|webmanifest)|'
    r'(?:audio|video|text|application)/[\w.+-]+|[a-z]{2}(?:-[A-Z]{2})?|true|false|null|undefined)$'
)
EVENTS = {
    'click','change','input','submit','keydown','keyup','pointerdown','pointerup','pointercancel',
    'touchstart','touchend','ended','pause','play','timeupdate','seeked','loadedmetadata',
    'loadeddata','durationchange','visibilitychange','pagehide','popstate','ratechange','install',
    'activate','fetch','message','beforeinstallprompt','appinstalled'
}
SINGLE_WORD_UI = {
    'Přehrát','Pozastavit','Stáhnout','Zavřít','Epizody','Epizódy','Série','Playlisty','Otázky',
    'Instalovat','Inštalovať','Předchozí','Predchádzajúci','Další','Ďalší','Rychlost','Rýchlosť',
    'Vše','Všetko','Nejnovější','Najnovšie','Nejstarší','Najstaršie','Matematika','FAQ',
    'Ukládám…','Připravuji…','Hotovo','Zrušit','Uložit','Smazat','Sdílet','Importovat','Exportovat'
}

MANUAL = {
    'cs': {
        'Neoficiálny tematický katalóg':'Neoficiální tematický katalog',
        'Vedátorský podcast podľa tém':'Vedátorský podcast podle tém',
        'Čítať viac':'Číst více','Čítať menej':'Číst méně','Svetlý režim':'Světlý režim',
        'Tmavý režim':'Tmavý režim','Moje dáta':'Moje data','Lokálna záloha dát':'Místní záloha dat',
        'Import bol zrušený.':'Import byl zrušen.','Záloha bola úspešne načítaná. Aplikácia sa obnoví…':'Záloha byla úspěšně načtena. Aplikace se obnoví…',
    },
    'sk': {
        'Neoficiální tematický katalog':'Neoficiálny tematický katalóg',
        'Vedátorský podcast podle témat':'Vedátorský podcast podľa tém',
        'Instalovat':'Inštalovať','Znovu načíst':'Znova načítať','Epizody':'Epizódy',
        'Načítám epizody…':'Načítavam epizódy…','Načítám katalog…':'Načítavam katalóg…',
        'Nejnovější':'Najnovšie','Nejstarší':'Najstaršie','Podle čísla dílu':'Podľa čísla dielu',
        'Podle počtu dílů':'Podľa počtu dielov','Podle abecedy':'Podľa abecedy',
        'Podle stáří prvního dílu':'Podľa dátumu prvého dielu','Přehrát':'Prehrať',
        'Přehrát znovu':'Prehrať znova','Pozastavit':'Pozastaviť','Zavřít':'Zavrieť',
        'Stáhnout':'Stiahnuť','Předchozí díl':'Predchádzajúci diel','Další díl':'Ďalší diel',
        'O 10 sekund zpět':'O 10 sekúnd späť','O 10 sekund dopředu':'O 10 sekúnd dopredu',
        'Číst více':'Čítať viac','Číst méně':'Čítať menej','Světlý režim':'Svetlý režim',
        'Tmavý režim':'Tmavý režim','Pozice v epizodě':'Pozícia v epizóde',
        'Pozice se ukládá do tohoto zařízení.':'Pozícia sa ukladá v tomto zariadení.',
        '✓ Poslechnuto':'✓ Vypočuté','Moje data':'Moje dáta','Místní záloha dat':'Lokálna záloha dát',
    }
}


def detect_language(text: str, default: str='cs') -> str:
    value = html.unescape(text).lower()
    sk = sum(value.count(x) for x in ('ľ','ĺ','ŕ','ô','ä','prečo','môže','ktorý','ktorá','ktoré','nie ',' sú ','sa ','všetk','ďalš','epizód','diel'))
    cs = sum(value.count(x) for x in ('ř','ě','ů','proč','může','který','která','které','není',' jsou ','se ','všech','další','epizod','díl'))
    if sk > cs: return 'sk'
    if cs > sk: return 'cs'
    return default


def safe_candidate(value: str, path: str, summary: bool=False) -> bool:
    v = html.unescape(value).strip()
    if len(v) < 2 or not re.search(r'[A-Za-zÁ-ž]', v): return False
    if v in EVENTS or TIME_RE.fullmatch(v): return False
    if v.startswith(('http://','https://','#','.')): return False
    if '${' in v or '=>' in v or '.join(' in v or 'querySelector' in v or 'localStorage' in v: return False
    if re.fullmatch(r'[a-z][a-z0-9_-]*', v) and v not in SINGLE_WORD_UI: return False
    if TECH_RE.fullmatch(v) and v not in SINGLE_WORD_UI: return False
    if summary: return True
    return bool(re.search(r'[\sÁ-ž.!?…]', v) or v in SINGLE_WORD_UI)


def decode_js_strings(code: str) -> list[tuple[int,int,str,str]]:
    out=[]; i=0; n=len(code)
    while i<n:
        c=code[i]
        if c=='/' and i+1<n and code[i+1]=='/':
            j=code.find('\n',i+2); i=n if j<0 else j+1; continue
        if c=='/' and i+1<n and code[i+1]=='*':
            j=code.find('*/',i+2); i=n if j<0 else j+2; continue
        if c in "'\"":
            q=c; start=i; i+=1
            while i<n:
                if code[i]=='\\': i+=2; continue
                if code[i]==q:
                    end=i+1
                    try: value=ast.literal_eval(code[start:end])
                    except Exception: value=None
                    if isinstance(value,str): out.append((start,end,q,value))
                    i=end; break
                i+=1
            continue
        if c=='`':
            # Template literals are intentionally not translated here. Visible text in them is handled manually.
            i+=1
            while i<n:
                if code[i]=='\\': i+=2; continue
                if code[i]=='`': i+=1; break
                i+=1
            continue
        i+=1
    return out


def protect(text: str):
    values=[]
    def repl(m): values.append(m.group(0)); return f'__URL_{len(values)-1}__'
    return URL_RE.sub(repl,text), values


def restore(text: str, values: list[str]) -> str:
    for i,v in enumerate(values): text=text.replace(f'__URL_{i}__',v)
    return text


class MT:
    def __init__(self):
        self.models={}
    def load(self, source: str, target: str):
        key=(source,target)
        if key in self.models: return self.models[key]
        from transformers import MarianMTModel, MarianTokenizer
        name=f'Helsinki-NLP/opus-mt-{source}-{target}'
        tok=MarianTokenizer.from_pretrained(name)
        model=MarianMTModel.from_pretrained(name)
        model.eval()
        self.models[key]=(tok,model)
        return tok,model
    def many(self, values: Iterable[str], source: str, target: str) -> dict[str,str]:
        unique=list(dict.fromkeys(values)); result={}
        pending=[]
        for value in unique:
            manual=MANUAL.get(target,{}).get(value.strip())
            if manual is not None:
                result[value]=value.replace(value.strip(),manual); continue
            if source==target:
                result[value]=value; continue
            pending.append(value)
        if not pending: return result
        tok,model=self.load(source,target)
        import torch
        for offset in range(0,len(pending),24):
            batch=pending[offset:offset+24]
            protected=[]; holders=[]
            for value in batch:
                p,h=protect(value); protected.append(p); holders.append(h)
            enc=tok(protected,return_tensors='pt',padding=True,truncation=True,max_length=512)
            with torch.no_grad(): gen=model.generate(**enc,num_beams=1,max_new_tokens=512)
            outputs=tok.batch_decode(gen,skip_special_tokens=True)
            for original,translated,held in zip(batch,outputs,holders):
                result[original]=restore(translated,held) or original
            print(f'{source}>{target}: {min(offset+len(batch),len(pending))}/{len(pending)}',flush=True)
        return result


def translate_html_fragment(value: str, mt: MT, source: str, target: str) -> str:
    if '<' not in value or '>' not in value:
        return mt.many([value],source,target)[value]
    soup=BeautifulSoup(value,'html.parser')
    nodes=[node for node in soup.find_all(string=True) if safe_candidate(str(node),'html')]
    mapping=mt.many([str(n) for n in nodes],source,target)
    for node in nodes: node.replace_with(mapping.get(str(node),str(node)))
    return str(soup)


def generate_episodes(mt: MT):
    source=json.loads((SOURCE/'episodes.json').read_text('utf-8'))
    (OUT/'episodes.sk.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n','utf-8')
    target_path=OUT/'episodes.cs.json'
    if target_path.exists(): target=json.loads(target_path.read_text('utf-8'))
    else: target={**source,'episodes':[]}
    done={int(e.get('number') or -1):e for e in target.get('episodes',[])}
    result=[]
    for index,episode in enumerate(source['episodes']):
        number=int(episode.get('number') or -1)
        if number in done:
            result.append(done[number]); continue
        item=dict(episode)
        item['title']=mt.many([episode['title']],'sk','cs')[episode['title']]
        item['description']=translate_html_fragment(episode.get('description',''),mt,'sk','cs')
        result.append(item)
        target={**source,'episodes':result+[done[n] for n in done if n not in {int(x.get('number') or -1) for x in result}]}
        target_path.write_text(json.dumps(target,ensure_ascii=False,indent=2)+'\n','utf-8')
        print(f'episodes cs: {index+1}/{len(source["episodes"])}',flush=True)
    target={**source,'episodes':result}
    target_path.write_text(json.dumps(target,ensure_ascii=False,indent=2)+'\n','utf-8')


def generate_string_maps(mt: MT):
    paths=[SOURCE/'index.html']+sorted(SOURCE.glob('*.js'))
    maps={'cs':{},'sk':{}}
    for lang in maps:
        p=OUT/f'strings.{lang}.json'
        if p.exists(): maps[lang]=json.loads(p.read_text('utf-8'))
    for path in paths:
        rel=path.name; text=path.read_text('utf-8'); is_summary=bool(SUMMARY_RE.fullmatch(rel))
        candidates=[]
        if path.suffix=='.js':
            for _,_,_,value in decode_js_strings(text):
                if safe_candidate(value,rel,is_summary): candidates.append(value)
        else:
            soup=BeautifulSoup(text,'html.parser')
            for node in soup.find_all(string=True):
                if node.parent and node.parent.name not in {'style','script'} and safe_candidate(str(node),rel): candidates.append(str(node))
            for tag in soup.find_all(True):
                for attr in ('placeholder','title','aria-label','alt'):
                    value=tag.get(attr)
                    if isinstance(value,str) and safe_candidate(value,rel): candidates.append(value)
            for script in soup.find_all('script'):
                for _,_,_,value in decode_js_strings(script.string or ''):
                    if safe_candidate(value,rel,False): candidates.append(value)
        candidates=list(dict.fromkeys(candidates))
        if not candidates: continue
        for target in ('cs','sk'):
            existing=maps[target].setdefault(rel,{})
            missing=[v for v in candidates if v not in existing]
            by_source={'cs':[],'sk':[]}
            for value in missing: by_source[detect_language(value,'cs')].append(value)
            for source,values in by_source.items():
                if not values: continue
                plain=[v for v in values if not ('<' in v and '>' in v)]
                translated=mt.many(plain,source,target)
                for value in values:
                    existing[value]=translate_html_fragment(value,mt,source,target) if '<' in value and '>' in value else translated[value]
            (OUT/f'strings.{target}.json').write_text(json.dumps(maps[target],ensure_ascii=False,indent=2)+'\n','utf-8')
        print(f'string maps: {rel} ({len(candidates)})',flush=True)


def main():
    mt=MT()
    mode=os.environ.get('VEDATOR_LOCALE_STAGE','all')
    if mode in {'all','episodes'}: generate_episodes(mt)
    if mode in {'all','strings'}: generate_string_maps(mt)

if __name__=='__main__': main()
