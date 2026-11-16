/*
 * Independent audio/video subtitles for early Vedátor podcast episodes.
 * Episode 1: new Slovak transcript, recorded against the MP3 timeline.
 * Episode 2: edited Slovak transcript and a Czech translation.
 * Videos keep their own zero subtitle offset; MP3 has a separate adjustable
 * correction because its perceived subtitle timing differs from YouTube.
 */
(()=>{
 'use strict';
 if(window.__vedatorEpisodeSubtitlesV2)return;
 window.__vedatorEpisodeSubtitlesV2=true;

 const FILES={
   1:{sk:'./titulky/vedatorsky-podcast-1-jaderna-energie-v-dobe-klimatickych-zmen.sk.srt?v=20261116-1'},
   2:{
     sk:'./titulky/vedatorsky-podcast-2-temna-hmota.sk.srt?v=20261116-4',
     cs:'./titulky/vedatorsky-podcast-2-temna-hmota.cs.srt?v=20261116-3'
   }
 };
 const PREFERENCE_KEY='vedatorSubtitleSkEpisode2EnabledV1';
 const LANGUAGE_KEY='vedatorEpisode2SubtitleLanguageV1';
 const OFFSET_KEY='vedatorSubtitleMp3OffsetsV1';
 const CACHE_NAME='vedator-subtitles-v3';
 const players=[],loaded=new Map(),loading=new Map(),errors=new Map();
 let enabled=true,language='cs',offsets={1:0,2:1.5};
 try{
   enabled=localStorage.getItem(PREFERENCE_KEY)!=='0';
   language=localStorage.getItem(LANGUAGE_KEY)==='sk'?'sk':'cs';
   const saved=JSON.parse(localStorage.getItem(OFFSET_KEY)||'{}');
   if(saved&&typeof saved==='object')
     for(const id of [1,2])if(Number.isFinite(Number(saved[id])))offsets[id]=Math.max(-15,Math.min(15,Number(saved[id])));
 }catch(_){}

 function parseTimestamp(value){
   const m=String(value).match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
   return m?Number(m[1])*3600+Number(m[2])*60+Number(m[3])+Number(m[4])/1000:NaN;
 }
 function parseSrt(raw){
   const cues=[];
   for(const block of String(raw||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split(/\n\s*\n/)){
     const lines=block.trim().split('\n'),line=lines.findIndex(s=>s.includes('-->'));
     if(line<0)continue;
     const m=lines[line].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
     if(!m)continue;
     const start=parseTimestamp(m[1]),end=parseTimestamp(m[2]),text=lines.slice(line+1).join('\n').trim();
     if(text&&Number.isFinite(start)&&Number.isFinite(end)&&end>start)cues.push({start,end,text});
   }
   cues.sort((a,b)=>a.start-b.start);
   if(cues.length<100)throw Error('Neúplný SRT soubor titulků');
   return cues;
 }

 async function getSubtitles(episode,lang){
   const file=FILES[episode]?.[lang];
   if(!file)return [];
   const key=episode+':'+lang;
   if(loaded.has(key))return loaded.get(key);
   if(loading.has(key))return loading.get(key);
   const url=new URL(file,document.baseURI).href;
   // This SRT is generated asynchronously by GitHub Actions: do not let
   // an initial 404 become a permanent cached response in the PWA worker.
   const fetchUrl=episode===1?url+'&check='+Date.now():url;
   const promise=(async()=>{
     let response;
     try{
       response=await fetch(fetchUrl,{cache:'no-store'});
       if(!response.ok)throw Error('HTTP '+response.status);
     }catch(networkError){
       if('caches'in window){
         const cached=await caches.open(CACHE_NAME).then(cache=>cache.match(url)).catch(()=>null);
         if(cached)response=cached;
       }
       if(!response)throw networkError;
     }
     const text=await response.text(),cues=parseSrt(text);
     loaded.set(key,cues);errors.delete(key);
     if('caches'in window)caches.open(CACHE_NAME).then(cache=>cache.put(url,new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8'}}))).catch(()=>{});
     return cues;
   })().catch(error=>{errors.set(key,error);throw error}).finally(()=>loading.delete(key));
   loading.set(key,promise);
   return promise;
 }

 function activeCue(cues,seconds){
   if(!cues||!Number.isFinite(seconds))return null;
   let low=0,high=cues.length-1,found=-1;
   while(low<=high){
     const mid=(low+high)>>1;
     if(cues[mid].start<=seconds){found=mid;low=mid+1}else high=mid-1;
   }
   return found>=0&&seconds<cues[found].end?cues[found]:null;
 }
 function episodeNumber(title,audio){
   const m=String(title||'').match(/\bpodcast\s+(\d+)\b/i);
   if(m)return Number(m[1]);
   const url=String(audio?.currentSrc||audio?.src||'');
   const audioMatch=url.match(/podcast_ep(\d+)\.mp3/i);
   return audioMatch?Number(audioMatch[1]):0;
 }
 function videoMode(player){
   const controller=window.vedatorEpisodeVideoController;
   if(!controller?.getActive?.())return null;
   // The page only renders one kind of player at a time.
   if(player.root.id==='player-v2'||player.root.classList.contains('vedator-audio-modal'))
     return controller;
   return null;
 }
 function captionTime(player,episode,video){
   const seconds=video?video.getCurrentTime?.():player.audio.currentTime;
   return Math.max(0,(Number(seconds)||0)+(video?0:Number(offsets[episode]||0)));
 }
 function wantedLanguage(episode){
   const files=FILES[episode];
   return files?.[language]?language:files?.sk?'sk':'cs';
 }
 function saveOffsets(){
   try{localStorage.setItem(OFFSET_KEY,JSON.stringify(offsets))}catch(_){}
 }
 function render(player){
   if(!player.root.isConnected)return;
   const episode=episodeNumber(player.title.textContent,player.audio);
   const available=Boolean(FILES[episode]),visible=player.isVisible();
   const supported=available&&visible;
   const lang=wantedLanguage(episode);
   const video=supported?videoMode(player):null;
   player.button.hidden=!supported;
   player.langSelect.hidden=!supported;
   player.adjust.hidden=!supported||Boolean(video);
   if(!supported){player.caption.hidden=true;return}
   for(const option of player.langSelect.options)option.disabled=!FILES[episode]?.[option.value];
   player.langSelect.value=lang;
   player.button.textContent=enabled?'✓ Titulky':'Titulky';
   player.button.setAttribute('aria-pressed',String(enabled));
   player.button.title=enabled?'Vypnout vlastní titulky':'Zapnout vlastní titulky';
   const advance=Number(offsets[episode]||0);
   player.offsetLabel.textContent='MP3 '+(advance>0?'+':'')+advance.toFixed(1).replace('.',',')+' s';
   player.offsetLabel.title='Kladné číslo posune titulky dopředu; záporné později. Video není ovlivněno.';
   const box=video?.getBox?.();
   if(box){
     if(player.caption.parentElement!==box)box.appendChild(player.caption);
   }else if(player.caption.parentElement!==player.home){
     player.home.appendChild(player.caption);
   }
   if(!enabled){player.caption.hidden=true;return}
   const key=episode+':'+lang;
   const cues=loaded.get(key);
   player.caption.lang=lang;
   player.caption.hidden=false;
   if(cues){
     const cue=activeCue(cues,captionTime(player,episode,video));
     const next=cue?.text||'';
     if(player.caption.textContent!==next)player.caption.textContent=next;
     player.caption.hidden=!next;
   }else if(errors.has(key)){
     player.caption.textContent=episode===1?
       'Nový přepis prvního dílu zatím není dostupný. Zkuste stránku načíst znovu.':
       'Titulky se nepodařilo načíst.';
   }else{
     player.caption.textContent='Načítám '+(lang==='cs'?'české':'slovenské')+' titulky…';
     if(!loading.has(key))getSubtitles(episode,lang).then(renderAll).catch(renderAll);
   }
 }
 function renderAll(){players.forEach(render)}
 function toggle(){
   enabled=!enabled;
   try{localStorage.setItem(PREFERENCE_KEY,enabled?'1':'0')}catch(_){}
   renderAll();
 }
 function selectLanguage(value){
   language=value==='sk'?'sk':'cs';enabled=true;
   try{localStorage.setItem(PREFERENCE_KEY,'1');localStorage.setItem(LANGUAGE_KEY,language)}catch(_){}
   renderAll();
 }
 function advanceBy(player,delta){
   const episode=episodeNumber(player.title.textContent,player.audio);
   if(!FILES[episode])return;
   offsets[episode]=Math.max(-15,Math.min(15,Math.round((Number(offsets[episode]||0)+delta)*2)/2));
   saveOffsets();renderAll();
 }
 function installFor(root,title,audio,isVisible,insert){
   if(!root||!title||!audio||root.querySelector('.vedator-subtitle-toggle'))return;
   const button=document.createElement('button');
   button.type='button';button.className='vedator-subtitle-toggle';
   button.addEventListener('click',toggle);
   const langSelect=document.createElement('select');
   langSelect.className='vedator-subtitle-language';
   langSelect.setAttribute('aria-label','Jazyk titulků');
   langSelect.innerHTML='<option value="cs">CZ</option><option value="sk">SK</option>';
   langSelect.addEventListener('change',()=>selectLanguage(langSelect.value));
   const adjust=document.createElement('span');
   adjust.className='vedator-subtitle-adjust';
   const earlier=document.createElement('button');
   earlier.type='button';earlier.textContent='−';earlier.title='Titulky později o 0,5 sekundy';
   const offsetLabel=document.createElement('span');
   offsetLabel.className='vedator-subtitle-offset';
   const sooner=document.createElement('button');
   sooner.type='button';sooner.textContent='+';sooner.title='Titulky dříve o 0,5 sekundy';
   adjust.append(earlier,offsetLabel,sooner);
   const caption=document.createElement('div');
   caption.className='vedator-subtitle-caption';
   caption.setAttribute('aria-live','off');
   caption.setAttribute('lang','sk');
   const home=insert(button,langSelect,adjust,caption);
   const player={root,title,audio,isVisible,button,langSelect,adjust,offsetLabel,caption,home};
   earlier.addEventListener('click',()=>advanceBy(player,-.5));
   sooner.addEventListener('click',()=>advanceBy(player,.5));
   players.push(player);
   for(const name of ['timeupdate','seeked','seeking','loadedmetadata','durationchange','emptied','play','pause','ended'])
     audio.addEventListener(name,()=>render(player));
   new MutationObserver(()=>render(player)).observe(title,{childList:true,subtree:true,characterData:true});
   render(player);
 }
 function mountV2(){
   const root=document.querySelector('#player-v2'),title=root?.querySelector('#player-title-v2');
   const audio=document.querySelector('#audio-v2'),main=root?.querySelector('.player-main');
   const help=root?.querySelector('#player-help-v2');
   if(!root||!title||!audio||!main||!help)return;
   installFor(root,title,audio,()=>!root.classList.contains('hidden'),
     (button,langSelect,adjust,caption)=>{
       main.append(button,langSelect,adjust);
       const home=document.createElement('div');
       home.className='vedator-subtitle-home';
       help.insertAdjacentElement('afterend',home);
       home.appendChild(caption);
       return home;
     });
   if('ResizeObserver'in window){
     new ResizeObserver(()=>{
       if(root.classList.contains('hidden')||root.classList.contains('player-collapsed-v2'))return;
       document.body.style.setProperty('--vedator-subtitled-player-height',
         Math.ceil(root.getBoundingClientRect().height)+'px');
     }).observe(root);
   }
 }
 function mountClassic(){
   const root=document.querySelector('.vedator-audio-modal');
   const title=root?.querySelector('.vedator-audio-card__title');
   const audio=root?.querySelector('.vedator-audio-card audio');
   if(!root||!title||!audio)return false;
   installFor(root,title,audio,()=>!root.hidden,
     (button,langSelect,adjust,caption)=>{
       const controls=document.createElement('div');
       controls.className='vedator-subtitle-controls';
       controls.append(button,langSelect,adjust);
       title.insertAdjacentElement('afterend',controls);
       const home=document.createElement('div');
       home.className='vedator-subtitle-home';
       controls.insertAdjacentElement('afterend',home);
       home.appendChild(caption);
       return home;
     });
   return true;
 }
 const style=document.createElement('style');
 style.dataset.vedatorSubtitleVersion='v2';
 style.textContent=[
   '.vedator-subtitle-toggle,.vedator-subtitle-adjust button{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line,#8c95a6);background:var(--card,#fff);color:var(--ink,#182033);border-radius:9px;padding:4px 10px;font-weight:750;font-size:.76rem;cursor:pointer;min-height:30px}',
   '.vedator-subtitle-toggle[aria-pressed="true"]{border-color:var(--accent,#5b4bdb);color:var(--accent,#5b4bdb)}',
   '.vedator-subtitle-language{margin-left:6px;min-height:30px;padding:3px 8px;border-radius:9px;background:var(--card,#fff);color:var(--ink,#182033);border:1px solid var(--line,#8c95a6);font-weight:700;font-size:.76rem}',
   '.vedator-subtitle-language option:disabled{opacity:.5}',
   '.vedator-subtitle-adjust{display:inline-flex;gap:3px;align-items:center;margin-left:6px;font-size:.75rem;color:var(--muted,#657080)}',
   '.vedator-subtitle-adjust button{padding:3px 8px;font-size:1rem}',
   '.vedator-subtitle-offset{min-width:65px;text-align:center;font-variant-numeric:tabular-nums}',
   '.vedator-subtitle-controls{display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin:7px 0}',
   '.vedator-subtitle-home{grid-column:1/-1;min-width:0}',
   '.vedator-subtitle-caption{white-space:pre-line;text-align:center;line-height:1.45;background:#121827;color:#fff;padding:9px 14px;border-radius:10px;font-size:.94rem;font-weight:600;max-height:7em;overflow:auto;overflow-wrap:anywhere}',
   '.vedator-subtitle-toggle[hidden],.vedator-subtitle-language[hidden],.vedator-subtitle-adjust[hidden],.vedator-subtitle-caption[hidden]{display:none!important}',
   '.vedator-video-box .vedator-subtitle-caption{position:absolute!important;bottom:11%;left:4%;right:4%;z-index:5;color:#fff;background:rgba(0,0,0,.78);pointer-events:none;font-weight:750;font-size:clamp(.75rem,2.2vw,1.1rem);max-height:26%;overflow:hidden;text-shadow:0 1px 3px #000}',
   '@media(max-width:700px){#player-v2 .vedator-subtitle-caption{font-size:.85rem;padding:7px 10px}body:has(#player-v2:not(.hidden):not(.player-collapsed-v2)){padding-bottom:calc(var(--vedator-subtitled-player-height,255px) + 14px)!important}}'
 ].join('\n');
 document.head.appendChild(style);
 function init(){
   mountV2();
   if(!mountClassic()){
     const observer=new MutationObserver(()=>{if(mountClassic())observer.disconnect()});
     observer.observe(document.body,{childList:true,subtree:true});
   }
   for(const evt of ['vedatorlanguagechange','vedatorvideotimeupdate','vedatorvideomodechange'])
     window.addEventListener(evt,renderAll);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
