/*
 * Vedátor – subtitles for episode 2 (Slovak speech-recognition draft).
 * Display in either the V2 player or the classic audio modal, synchronized
 * to the actual <audio> currentTime (seeking, pauses, resume, speed changes).
 * Keep original SRT in titulky/ intact.
 */
(()=>{
  'use strict';
  if(window.__vedatorEpisodeSubtitlesV1)return;
  window.__vedatorEpisodeSubtitlesV1=true;

  const SUBTITLE_URLS={
    sk:'./titulky/vedatorsky-podcast-2-temna-hmota.sk.srt?v=20261116-4',
    cs:'./titulky/vedatorsky-podcast-2-temna-hmota.cs.srt?v=20261116-3'
  };
  const PREFERENCE_KEY='vedatorSubtitleSkEpisode2EnabledV1';
  const LANGUAGE_KEY='vedatorEpisode2SubtitleLanguageV1';
  const CACHE_NAME='vedator-subtitles-v2';
  let enabled=true,language='cs';
  const loaded={},promises={},errors={};
  try{
    enabled=localStorage.getItem(PREFERENCE_KEY)!=='0';
    language=localStorage.getItem(LANGUAGE_KEY)==='sk'?'sk':'cs';
  }catch(_){}
  const players=[];

    function parseTimestamp(value){
    const match=String(value).trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
    return match?Number(match[1])*3600+Number(match[2])*60+Number(match[3])+Number(match[4])/1000:NaN;
  }

  function parseSrt(input){
    const blocks=String(input||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split(/\n\s*\n/),result=[];
    for(const block of blocks){
      const lines=block.trim().split('\n'),at=lines.findIndex(line=>line.includes('-->'));
      if(at<0)continue;
      const times=lines[at].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
      if(!times)continue;
      const start=parseTimestamp(times[1]),end=parseTimestamp(times[2]);
      const text=lines.slice(at+1).join('\n').trim();
      if(Number.isFinite(start)&&Number.isFinite(end)&&end>start&&text)result.push({start,end,text});
    }
    result.sort((a,b)=>a.start-b.start);
    if(result.length<100)throw new Error('Neúplný soubor titulků');
    return result;
  }

  async function load(lang){
    if(loaded[lang])return loaded[lang];
    if(promises[lang])return promises[lang];
    if(errors[lang])throw errors[lang];
    const url=new URL(SUBTITLE_URLS[lang],document.baseURI).href;
    promises[lang]=(async()=>{
      try{
        const response=await fetch(url,{cache:'no-store'});
        if(!response.ok)throw new Error('HTTP '+response.status);
        const raw=await response.text();
        loaded[lang]=parseSrt(raw);
        if('caches'in window)
          caches.open(CACHE_NAME).then(cache=>cache.put(url,new Response(raw,{
            headers:{'Content-Type':'text/plain; charset=utf-8'}
          }))).catch(()=>{});
        return loaded[lang];
      }catch(error){
        if('caches'in window){
          try{
            const cached=await(await caches.open(CACHE_NAME)).match(url);
            if(cached){loaded[lang]=parseSrt(await cached.text());return loaded[lang]}
          }catch(_){}
        }
        errors[lang]=error;
        throw error;
      }
    })();
    return promises[lang];
  }

  function activeCue(list,seconds){
    if(!list||!Number.isFinite(seconds))return null;
    let lo=0,hi=list.length-1,candidate=-1;
    while(lo<=hi){
      const mid=(lo+hi)>>1;
      if(list[mid].start<=seconds){candidate=mid;lo=mid+1}else hi=mid-1;
    }
    if(candidate<0)return null;
    const cue=list[candidate];
    return seconds<cue.end?cue:null;
  }

    function episodeIsTwo(title,audio){
    return /\bpodcast\s+0?2\b/i.test(String(title||'')) ||
      /(?:^|\/)podcast_ep2\.mp3(?:[?#]|$)/i.test(String(audio?.currentSrc||audio?.src||''));
  }

  function isSlovakUi(){
    return document.querySelector('.language-v2 button[data-lang="sk"].active')!==null ||
      document.documentElement.lang==='sk';
  }

  function updateButton(button){
    button.textContent=enabled?'✓ Titulky':'Titulky';
    button.setAttribute('aria-pressed',String(enabled));
    button.setAttribute('aria-label',enabled?'Vypnout titulky':'Zapnout titulky');
    button.title='České a slovenské titulky epizody 2';
  }

  function update(player){
    if(!player.root.isConnected)return;
    const supported=player.isVisible()&&episodeIsTwo(player.title.textContent,player.audio);
    player.button.hidden=!supported;
    player.langSelect.hidden=!supported;
    player.langSelect.value=language;
    updateButton(player.button);

    const video=window.vedatorEpisodeVideoController;
    const isVideo=Boolean(supported&&video?.getActive?.());
    const box=isVideo?video.getBox?.():null;
    if(box&&player.caption.parentElement!==box)box.appendChild(player.caption);
    if(!isVideo&&player.caption.parentElement?.classList?.contains('vedator-video-box')){
      if(player.root.id==='player-v2')player.root.querySelector('#player-help-v2')?.insertAdjacentElement('afterend',player.caption);
      else player.langSelect.insertAdjacentElement('afterend',player.caption);
    }
    if(!supported||!enabled){player.caption.hidden=true;player.caption.textContent='';return}
    player.caption.setAttribute('lang',language);
    const list=loaded[language];
    if(list){
      let seconds=Number(player.audio.currentTime)||0;
      if(isVideo)seconds=video.getCurrentTime?.()??seconds;
      const cue=activeCue(list,seconds);
      player.caption.textContent=cue?.text||'';
      player.caption.hidden=!cue;
      return;
    }
    player.caption.hidden=false;
    player.caption.textContent=errors[language]?
      'Titulky se nepodařilo načíst.':
      'Načítám '+(language==='cs'?'české':'slovenské')+' titulky…';
    if(!errors[language]&&!promises[language])load(language).then(updateAll).catch(()=>updateAll());
  }

  function updateAll(){for(const player of players)update(player)}
  function toggle(){
    enabled=!enabled;
    try{localStorage.setItem(PREFERENCE_KEY,enabled?'1':'0')}catch(_){}
    updateAll();
  }

  function setLanguage(next){
    language=next==='sk'?'sk':'cs';
    try{localStorage.setItem(LANGUAGE_KEY,language)}catch(_){}
    enabled=true;try{localStorage.setItem(PREFERENCE_KEY,'1')}catch(_){}
    updateAll();
  }

    function makeControls(root,title,audio,isVisible,insertBefore){
    if(!root||!title||!audio||root.querySelector('.vedator-subtitle-toggle'))return;
    const button=document.createElement('button');
    button.type='button';button.className='vedator-subtitle-toggle';
    button.hidden=true;button.addEventListener('click',toggle);
    const caption=document.createElement('div');
    caption.className='vedator-subtitle-caption';
    caption.hidden=true;caption.setAttribute('aria-live','polite');
    caption.setAttribute('lang','sk');
    insertBefore(button,caption);
    const langSelect=document.createElement('select');
    langSelect.className='vedator-subtitle-language';
    langSelect.setAttribute('aria-label','Jazyk titulků');
    langSelect.innerHTML='<option value="cs">CZ</option><option value="sk">SK</option>';
    langSelect.value=language;
    langSelect.hidden=true;
    langSelect.addEventListener('change',()=>setLanguage(langSelect.value));
    button.insertAdjacentElement('afterend',langSelect);
    const player={root,title,audio,button,langSelect,caption,isVisible};
    players.push(player);
    for(const event of ['timeupdate','seeked','seeking','loadedmetadata','emptied','play','pause','ended'])
      audio.addEventListener(event,()=>update(player));
    new MutationObserver(()=>update(player)).observe(title,{childList:true,subtree:true,characterData:true});
    update(player);
  }

  function mountV2(){
    const root=document.querySelector('#player-v2');
    const title=root?.querySelector('#player-title-v2');
    const audio=document.querySelector('#audio-v2');
    const main=root?.querySelector('.player-main');
    if(!root||!title||!audio||!main)return;
    makeControls(root,title,audio,
      ()=>!root.classList.contains('hidden'),
      (button,caption)=>{
        main.appendChild(button);
        root.querySelector('#player-help-v2')?.insertAdjacentElement('afterend',caption);
      });
    if('ResizeObserver'in window){
      const observe=new ResizeObserver(()=>{
        if(root.classList.contains('hidden')||root.classList.contains('player-collapsed-v2'))return;
        document.body.style.setProperty('--vedator-subtitled-player-height',Math.ceil(root.getBoundingClientRect().height)+'px');
      });
      observe.observe(root);
    }
  }

  function mountClassic(){
    const root=document.querySelector('.vedator-audio-modal');
    const title=root?.querySelector('.vedator-audio-card__title');
    const audio=root?.querySelector('.vedator-audio-card audio');
    if(!root||!title||!audio)return false;
    makeControls(root,title,audio,
      ()=>!root.hidden,
      (button,caption)=>{
        title.insertAdjacentElement('afterend',button);
        button.insertAdjacentElement('afterend',caption);
      });
    return true;
  }

  const style=document.createElement('style');
  style.setAttribute('data-vedator-episode-subtitles','1');
  style.textContent=[
    '.vedator-subtitle-toggle{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line,#8c95a6);background:var(--card,#fff);color:var(--ink,#182033);border-radius:9px;padding:4px 10px;margin:5px 0 0;font-weight:750;font-size:.76rem;cursor:pointer;min-height:30px}',
    '.vedator-subtitle-toggle[aria-pressed="true"]{border-color:var(--accent,#5b4bdb);color:var(--accent,#5b4bdb)}',
    '.vedator-subtitle-toggle:focus-visible{outline:2px solid var(--accent,#5b4bdb);outline-offset:2px}',
    '.vedator-subtitle-caption{white-space:pre-line;text-align:center;line-height:1.45;background:#121827;color:#fff;padding:9px 14px;border-radius:10px;font-size:.94rem;font-weight:600;min-height:2.5em;max-height:6.5em;overflow-y:auto}',
    '.vedator-subtitle-language{margin-left:6px;min-height:30px;padding:3px 8px;border-radius:9px;background:var(--card,#fff);color:var(--ink,#182033);border:1px solid var(--line,#8c95a6);font-weight:700;font-size:.76rem}',
    '.vedator-subtitle-toggle[hidden],.vedator-subtitle-language[hidden],.vedator-subtitle-caption[hidden]{display:none!important}',
    '.vedator-video-box .vedator-subtitle-caption{position:absolute!important;bottom:11%;left:4%;right:4%;z-index:5;color:#fff;background:rgba(0,0,0,.78);pointer-events:none;font-weight:750;font-size:clamp(.75rem,2.2vw,1.1rem);max-height:26%;overflow:hidden;text-shadow:0 1px 3px #000}',
    '#player-v2 .vedator-subtitle-caption{grid-column:1/-1;min-width:0;overflow-wrap:anywhere}',
    '.vedator-audio-card .vedator-subtitle-caption{margin:8px 0 6px;overflow-wrap:anywhere}',
    '@media(max-width:700px){#player-v2 .vedator-subtitle-caption{font-size:.85rem;padding:7px 10px}body:has(#player-v2:not(.hidden):not(.player-collapsed-v2)){padding-bottom:calc(var(--vedator-subtitled-player-height,255px) + 14px)!important}}'
  ].join('\n');
  document.head.appendChild(style);

  function start(){
    mountV2();
    if(!mountClassic()){
      const observer=new MutationObserver(()=>{
        if(mountClassic())observer.disconnect();
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }
    window.addEventListener('vedatorlanguagechange',updateAll);
    window.addEventListener('vedatorvideotimeupdate',updateAll);
    window.addEventListener('vedatorvideomodechange',updateAll);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
