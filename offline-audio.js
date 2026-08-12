(()=>{
  if(window.__vedatorOfflineAudio)return;
  window.__vedatorOfflineAudio=true;

  const CACHE='vedator-offline-audio-v1';
  const INDEX_KEY='vedatorOfflineAudioIndexV1';
  const CLEAR_NOTICE_KEY='vedatorDataClearedNoticeV1';
  const blobUrls=new Map();
  let index=loadIndex();
  let verifyStarted=false;

  function loadIndex(){
    try{
      const value=JSON.parse(localStorage.getItem(INDEX_KEY)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return {}}
  }
  function persistIndex(){
    try{localStorage.setItem(INDEX_KEY,JSON.stringify(index))}catch{}
  }
  function episodeNumber(title){
    return Number(String(title||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0);
  }
  function episodeKey(title){
    const number=episodeNumber(title);
    return number?`episode-${number}`:'';
  }
  function currentTitle(){
    return document.querySelector('.vedator-audio-card__title')?.textContent?.trim()||'';
  }
  function currentEpisode(title){
    const number=episodeNumber(title);
    try{
      if(number&&Array.isArray(episodes))return episodes.find(item=>Number(item.number)===number)||null;
    }catch{}
    return null;
  }
  function recordForTitle(title){
    const key=episodeKey(title);
    return key?index[key]||null:null;
  }
  function formatMb(bytes){
    return `${(Number(bytes||0)/1048576).toFixed(1).replace('.',',')} MB`;
  }
  function setHelp(text){
    const help=document.querySelector('.vedator-audio-card__help');
    if(help&&help.textContent!==text)help.textContent=text;
  }

  function rememberBlobUrl(key,blob){
    const old=blobUrls.get(key);
    if(old)try{URL.revokeObjectURL(old)}catch{}
    const url=URL.createObjectURL(blob);
    blobUrls.set(key,url);
    return url;
  }
  async function blobUrlFor(record){
    if(!record)return '';
    const existing=blobUrls.get(record.key);
    if(existing)return existing;
    const cache=await caches.open(CACHE);
    const response=await cache.match(record.cacheUrl);
    if(!response)return '';
    return rememberBlobUrl(record.key,await response.blob());
  }

  async function verifyIndex(){
    if(verifyStarted)return;
    verifyStarted=true;
    try{
      const cache=await caches.open(CACHE);
      let changed=false;
      for(const [key,record] of Object.entries(index)){
        if(!record?.cacheUrl||!(await cache.match(record.cacheUrl))){
          const url=blobUrls.get(key);
          if(url)try{URL.revokeObjectURL(url)}catch{}
          blobUrls.delete(key);
          delete index[key];
          changed=true;
        }
      }
      if(changed)persistIndex();
    }catch{}
    syncButton();
  }

  const style=document.createElement('style');
  style.textContent=`
    .vedator-custom-secondary{grid-template-columns:repeat(3,minmax(0,1fr))!important}
    .vedator-offline-btn.saved{border-color:#86c79a}
    html.theme-dark .vedator-offline-btn.saved{border-color:#4ade80}
    @media(max-width:550px){
      .vedator-custom-secondary{gap:7px!important}
      .vedator-custom-secondary .vedator-custom-btn{font-size:.78rem!important;padding-left:3px!important;padding-right:3px!important}
    }
  `;
  document.head.appendChild(style);

  function ensureButton(){
    const secondary=document.querySelector('.vedator-custom-secondary');
    if(!secondary)return false;
    let button=secondary.querySelector('.vedator-offline-btn');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='vedator-custom-btn vedator-offline-btn';
      button.innerHTML='<span>📱</span><span class="vedator-offline-label">Uložit offline</span>';
      const download=secondary.querySelector('.download');
      secondary.insertBefore(button,download||secondary.firstChild);
      button.addEventListener('click',handleOfflineClick);
    }
    syncButton();
    return true;
  }

  function syncButton(){
    const button=document.querySelector('.vedator-offline-btn');
    if(!button)return;
    const label=button.querySelector('.vedator-offline-label');
    const saved=Boolean(recordForTitle(currentTitle()));
    const slovak=(()=>{try{return window.vedatorUiLanguage?.()==='sk'}catch{return false}})();
    const nextLabel=saved
      ?(slovak?'✓ Uložené offline':'✓ Uloženo offline')
      :(slovak?'Uložiť offline':'Uložit offline');
    const nextTitle=saved
      ?(slovak?'Epizóda je uložená na počúvanie bez internetu':'Epizoda je uložená pro poslech bez internetu')
      :(slovak?'Uložiť epizódu do tejto aplikácie na počúvanie bez internetu':'Uložit epizodu do této aplikace pro poslech bez internetu');
    button.classList.toggle('saved',saved);
    if(!button.dataset.vedatorBusy)button.disabled=false;
    if(label&&!button.dataset.vedatorBusy&&label.textContent!==nextLabel)label.textContent=nextLabel;
    if(button.title!==nextTitle)button.title=nextTitle;
  }

  function playLinkForRecord(record){
    const number=Number(record?.number)||episodeNumber(record?.title);
    if(!number)return null;
    for(const article of document.querySelectorAll('#episodes article')){
      const title=article.querySelector('h2')?.textContent?.trim()||'';
      if(episodeNumber(title)===number){
        const play=article.querySelector('.links .primary');
        if(play)return play;
      }
    }
    return null;
  }

  function replayWithBlob(play,blobUrl){
    const oldHref=play.getAttribute('href');
    play.dataset.vedatorOfflineUnifiedReplay='1';
    play.setAttribute('href',blobUrl);
    try{play.click()}finally{
      queueMicrotask(()=>{
        if(oldHref===null)play.removeAttribute('href');else play.setAttribute('href',oldHref);
        delete play.dataset.vedatorOfflineUnifiedReplay;
      });
    }
  }

  function reopenCurrent(record,blobUrl,time,wasPaused){
    const number=Number(record?.number)||episodeNumber(record?.title);
    if(number)window.__vedatorRequestedStart={
      episode:number,
      time:Math.max(0,Number(time)||0),
      createdAt:Date.now()
    };
    let play=playLinkForRecord(record),proxy=null;
    if(!play){
      const host=document.querySelector('#episodes')||document.body;
      proxy=document.createElement('article');
      proxy.hidden=true;
      proxy.innerHTML='<h2></h2><div class="links"><a class="primary"></a></div>';
      proxy.querySelector('h2').textContent=record.title||`Podcast ${number||''}`;
      play=proxy.querySelector('a');
      host.appendChild(proxy);
    }
    const audio=document.querySelector('.vedator-audio-card audio');
    if(wasPaused&&audio)audio.addEventListener('play',()=>{try{audio.pause()}catch{}},{once:true});
    replayWithBlob(play,blobUrl);
    queueMicrotask(()=>proxy?.remove());
  }

  async function saveCurrent(button){
    const title=currentTitle();
    const episode=currentEpisode(title);
    const originalUrl=episode?.enclosure||'';
    if(!originalUrl){
      setHelp('Zdroj této epizody se nepodařilo určit.');
      return;
    }
    const key=episodeKey(title);
    if(!key){
      setHelp('Tuto epizodu zatím nelze uložit offline.');
      return;
    }
    const cacheUrl=new URL(`./__vedator_offline_audio__/${encodeURIComponent(key)}.mp3`,location.href).href;
    const label=button.querySelector('.vedator-offline-label');
    const audio=document.querySelector('.vedator-audio-card audio');
    const time=Number(audio?.currentTime)||0;
    const wasPaused=audio?audio.paused:true;

    button.dataset.vedatorBusy='1';
    button.disabled=true;
    if(label&&label.textContent!=='Připravuji…')label.textContent='Připravuji…';

    try{
      try{await navigator.storage?.persist?.()}catch{}
      const response=await fetch(originalUrl,{mode:'cors',cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const total=Number(response.headers.get('content-length'))||0;
      const type=response.headers.get('content-type')||'audio/mpeg';
      const reader=response.body?.getReader();
      let blob,loaded=0;

      if(reader){
        const chunks=[];
        while(true){
          const {done,value}=await reader.read();
          if(done)break;
          chunks.push(value);
          loaded+=value.byteLength;
          if(label){
            const next=total?`${Math.min(99,Math.floor(loaded/total*100))} %`:formatMb(loaded);
            if(label.textContent!==next)label.textContent=next;
          }
          setHelp(total?`Ukládám offline: ${formatMb(loaded)} z ${formatMb(total)}.`:`Ukládám offline: ${formatMb(loaded)}.`);
        }
        blob=new Blob(chunks,{type});
      }else{
        blob=await response.blob();
      }

      const cache=await caches.open(CACHE);
      await cache.put(cacheUrl,new Response(blob,{status:200,headers:{
        'Content-Type':type||blob.type||'audio/mpeg',
        'Content-Length':String(blob.size),
        'Accept-Ranges':'bytes',
        'X-Vedator-Original-Url':originalUrl
      }}));

      const record=index[key]={
        key,
        title:episode.title||title,
        number:Number(episode.number)||episodeNumber(title),
        originalUrl,
        cacheUrl,
        size:blob.size,
        type:type||blob.type||'audio/mpeg',
        savedAt:Date.now()
      };
      persistIndex();
      const blobUrl=rememberBlobUrl(key,blob);
      setHelp(`Epizoda je uložená offline (${formatMb(blob.size)}).`);
      reopenCurrent(record,blobUrl,time,wasPaused);
    }catch(error){
      console.warn('Offline uložení se nepodařilo',error);
      setHelp(error?.name==='QuotaExceededError'
        ?'Pro offline uložení není v zařízení dostatek místa.'
        :'Offline uložení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.');
    }finally{
      delete button.dataset.vedatorBusy;
      button.disabled=false;
      syncButton();
    }
  }

  async function removeCurrent(button,record){
    if(!confirm('Smazat offline kopii této epizody?'))return;
    const label=button.querySelector('.vedator-offline-label');
    button.dataset.vedatorBusy='1';
    button.disabled=true;
    if(label&&label.textContent!=='Mažu…')label.textContent='Mažu…';
    try{
      const cache=await caches.open(CACHE);
      await cache.delete(record.cacheUrl);
      const url=blobUrls.get(record.key);
      if(url)try{URL.revokeObjectURL(url)}catch{}
      blobUrls.delete(record.key);
      delete index[record.key];
      persistIndex();
      setHelp('Offline kopie byla smazána. Epizodu lze dál přehrávat přes internet.');
    }catch(error){
      console.warn('Offline kopii se nepodařilo smazat',error);
      setHelp('Offline kopii se nepodařilo smazat.');
    }finally{
      delete button.dataset.vedatorBusy;
      button.disabled=false;
      syncButton();
    }
  }

  async function handleOfflineClick(event){
    event.preventDefault();
    const button=this;
    const record=recordForTitle(currentTitle());
    if(record)return removeCurrent(button,record);
    return saveCurrent(button);
  }

  window.addEventListener('click',event=>{
    const play=event.target?.closest?.('.links .primary');
    if(!play||play.dataset.vedatorOfflineUnifiedReplay==='1')return;
    const title=play.closest('article')?.querySelector('h2')?.textContent?.trim()||'';
    const record=recordForTitle(title);
    if(!record)return;

    event.preventDefault();
    event.stopImmediatePropagation();

    void (async()=>{
      try{
        const blobUrl=await blobUrlFor(record);
        if(!blobUrl){
          delete index[record.key];
          persistIndex();
          syncButton();
          const oldFlag=play.dataset.vedatorOfflineUnifiedReplay;
          play.dataset.vedatorOfflineUnifiedReplay='1';
          try{play.click()}finally{
            queueMicrotask(()=>{
              if(oldFlag===undefined)delete play.dataset.vedatorOfflineUnifiedReplay;
              else play.dataset.vedatorOfflineUnifiedReplay=oldFlag;
            });
          }
          return;
        }
        replayWithBlob(play,blobUrl);
      }catch(error){
        console.warn('Offline epizodu se nepodařilo otevřít',error);
        setHelp('Offline kopii se nepodařilo otevřít. Zkuste aplikaci zavřít a znovu otevřít.');
      }
    })();
  },true);

  if(sessionStorage.getItem(CLEAR_NOTICE_KEY)==='1'){
    for(const url of blobUrls.values())try{URL.revokeObjectURL(url)}catch{}
    blobUrls.clear();
    index={};
    try{localStorage.removeItem(INDEX_KEY)}catch{}
    caches.delete(CACHE).catch(()=>{});
  }

  if(!ensureButton()){
    const observer=new MutationObserver(()=>{if(ensureButton())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
  }

  const titleNode=document.querySelector('.vedator-audio-card__title');
  if(titleNode)new MutationObserver(()=>queueMicrotask(syncButton))
    .observe(titleNode,{childList:true,characterData:true,subtree:true});

  window.addEventListener('vedatorlanguagechange',()=>queueMicrotask(syncButton));
  window.addEventListener('pagehide',()=>{
    for(const url of blobUrls.values())try{URL.revokeObjectURL(url)}catch{}
    blobUrls.clear();
  });

  verifyIndex();
})();
