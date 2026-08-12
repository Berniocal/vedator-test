(()=>{
  if(window.__vedatorOfflineSwitchFix)return;
  window.__vedatorOfflineSwitchFix=true;

  const CACHE='vedator-offline-audio-v1';
  const INDEX_KEY='vedatorOfflineAudioIndexV1';
  const blobUrls=new Map();

  const loadIndex=()=>{
    try{
      const value=JSON.parse(localStorage.getItem(INDEX_KEY)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return {}}
  };
  const saveIndex=index=>{try{localStorage.setItem(INDEX_KEY,JSON.stringify(index))}catch{}};
  const episodeNumber=title=>Number(String(title||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0);
  const episodeKey=title=>{
    const number=episodeNumber(title);
    return number?`episode-${number}`:'';
  };
  const currentTitle=()=>document.querySelector('.vedator-audio-card__title')?.textContent?.trim()||'';
  const currentEpisode=title=>{
    const number=episodeNumber(title);
    try{return number&&Array.isArray(episodes)?episodes.find(item=>Number(item.number)===number)||null:null}catch{return null}
  };
  const recordForTitle=title=>{
    const key=episodeKey(title);
    return key?loadIndex()[key]||null:null;
  };
  const formatMb=bytes=>`${(Number(bytes||0)/1048576).toFixed(1).replace('.',',')} MB`;
  const setHelp=text=>{
    const help=document.querySelector('.vedator-audio-card__help');
    if(help)help.textContent=text;
  };

  async function blobUrlFor(record){
    if(!record)return '';
    const existing=blobUrls.get(record.key);
    if(existing)return existing;
    const cache=await caches.open(CACHE);
    const response=await cache.match(record.cacheUrl);
    if(!response)return '';
    const blob=await response.blob();
    const url=URL.createObjectURL(blob);
    blobUrls.set(record.key,url);
    return url;
  }

  function replayWithBlob(play,blobUrl){
    const oldHref=play.getAttribute('href');
    const oldOfflineFlag=play.dataset.vedatorOfflineReplay;
    play.dataset.vedatorOfflineSwitchReplay='1';
    play.dataset.vedatorOfflineReplay='1';
    play.setAttribute('href',blobUrl);
    try{play.click()}finally{
      queueMicrotask(()=>{
        if(oldHref===null)play.removeAttribute('href');else play.setAttribute('href',oldHref);
        delete play.dataset.vedatorOfflineSwitchReplay;
        if(oldOfflineFlag===undefined)delete play.dataset.vedatorOfflineReplay;
        else play.dataset.vedatorOfflineReplay=oldOfflineFlag;
      });
    }
  }

  function playLinkForRecord(record){
    const number=Number(record?.number)||episodeNumber(record?.title);
    for(const article of document.querySelectorAll('#episodes article')){
      const title=article.querySelector('h2')?.textContent?.trim()||'';
      if(number&&episodeNumber(title)===number){
        const play=article.querySelector('.links .primary');
        if(play)return play;
      }
    }
    return null;
  }

  function reopenCurrent(record,blobUrl,time,wasPaused){
    const number=Number(record?.number)||episodeNumber(record?.title);
    if(number)window.__vedatorRequestedStart={episode:number,time:Math.max(0,Number(time)||0),createdAt:Date.now()};
    let play=playLinkForRecord(record),proxy=null;
    if(!play){
      const box=document.querySelector('#episodes');
      if(!box)return;
      proxy=document.createElement('article');
      proxy.hidden=true;
      proxy.innerHTML='<h2></h2><div class="links"><a class="primary"></a></div>';
      proxy.querySelector('h2').textContent=record.title||`Podcast ${number||''}`;
      play=proxy.querySelector('a');
      box.appendChild(proxy);
    }
    const audio=document.querySelector('.vedator-audio-card audio');
    if(wasPaused&&audio)audio.addEventListener('play',()=>{try{audio.pause()}catch{}},{once:true});
    replayWithBlob(play,blobUrl);
    queueMicrotask(()=>proxy?.remove());
  }

  function syncButton(){
    const button=document.querySelector('.vedator-offline-btn');
    if(!button)return;
    const label=button.querySelector('.vedator-offline-label');
    const saved=Boolean(recordForTitle(currentTitle()));
    button.classList.toggle('saved',saved);
    button.disabled=false;
    if(label)label.textContent=saved?'✓ Offline':'Uložit offline';
    button.title=saved?'Epizoda je uložená pro poslech bez internetu':'Uložit epizodu do této aplikace pro poslech bez internetu';
  }

  async function saveCurrent(button,title){
    const episode=currentEpisode(title);
    const originalUrl=episode?.enclosure||'';
    if(!originalUrl){setHelp('Zdroj této epizody se nepodařilo určit.');return}
    const key=episodeKey(title);
    const cacheUrl=new URL(`./__vedator_offline_audio__/${encodeURIComponent(key)}.mp3`,location.href).href;
    const label=button.querySelector('.vedator-offline-label');
    const audio=document.querySelector('.vedator-audio-card audio');
    const time=Number(audio?.currentTime)||0;
    const wasPaused=audio?audio.paused:true;
    button.disabled=true;
    if(label)label.textContent='Připravuji…';
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
          chunks.push(value);loaded+=value.byteLength;
          if(label)label.textContent=total?`${Math.min(99,Math.floor(loaded/total*100))} %`:formatMb(loaded);
          setHelp(total?`Ukládám offline: ${formatMb(loaded)} z ${formatMb(total)}.`:`Ukládám offline: ${formatMb(loaded)}.`);
        }
        blob=new Blob(chunks,{type});
      }else blob=await response.blob();
      const cache=await caches.open(CACHE);
      await cache.put(cacheUrl,new Response(blob,{status:200,headers:{
        'Content-Type':type||blob.type||'audio/mpeg',
        'Content-Length':String(blob.size),
        'Accept-Ranges':'bytes',
        'X-Vedator-Original-Url':originalUrl
      }}));
      const index=loadIndex();
      const record=index[key]={key,title:episode.title||title,number:Number(episode.number)||episodeNumber(title),originalUrl,cacheUrl,size:blob.size,type:type||blob.type||'audio/mpeg',savedAt:Date.now()};
      saveIndex(index);
      const old=blobUrls.get(key);if(old)try{URL.revokeObjectURL(old)}catch{}
      const blobUrl=URL.createObjectURL(blob);blobUrls.set(key,blobUrl);
      setHelp(`Epizoda je uložená offline (${formatMb(blob.size)}).`);
      reopenCurrent(record,blobUrl,time,wasPaused);
    }catch(error){
      console.warn('Offline uložení se nepodařilo',error);
      setHelp(error?.name==='QuotaExceededError'?'Pro offline uložení není v zařízení dostatek místa.':'Offline uložení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.');
    }finally{button.disabled=false;syncButton()}
  }

  async function removeCurrent(button,record){
    if(!confirm('Smazat offline kopii této epizody?'))return;
    button.disabled=true;
    try{
      const cache=await caches.open(CACHE);await cache.delete(record.cacheUrl);
      const index=loadIndex();delete index[record.key];saveIndex(index);
      const url=blobUrls.get(record.key);if(url)try{URL.revokeObjectURL(url)}catch{};blobUrls.delete(record.key);
      setHelp('Offline kopie byla smazána. Epizodu lze dál přehrávat přes internet.');
    }catch(error){console.warn('Offline kopii se nepodařilo smazat',error);setHelp('Offline kopii se nepodařilo smazat.')}
    finally{button.disabled=false;syncButton()}
  }

  window.addEventListener('click',event=>{
    const button=event.target?.closest?.('.vedator-offline-btn');
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    const title=currentTitle();
    const record=recordForTitle(title);
    void (record?removeCurrent(button,record):saveCurrent(button,title));
  },true);

  window.addEventListener('click',event=>{
    const play=event.target?.closest?.('.links .primary');
    if(!play||play.dataset.vedatorOfflineSwitchReplay==='1')return;
    const title=play.closest('article')?.querySelector('h2')?.textContent?.trim()||'';
    const record=recordForTitle(title);
    if(!record){
      const old=play.dataset.vedatorOfflineReplay;
      play.dataset.vedatorOfflineReplay='1';
      queueMicrotask(()=>{if(old===undefined)delete play.dataset.vedatorOfflineReplay;else play.dataset.vedatorOfflineReplay=old});
      return;
    }
    event.preventDefault();event.stopImmediatePropagation();
    void (async()=>{
      try{
        const blobUrl=await blobUrlFor(record);
        if(!blobUrl){
          const index=loadIndex();delete index[record.key];saveIndex(index);syncButton();
          setHelp('Offline kopie této epizody už v zařízení není.');
          return;
        }
        replayWithBlob(play,blobUrl);
      }catch(error){console.warn('Offline epizodu se nepodařilo otevřít',error);setHelp('Offline kopii se nepodařilo otevřít. Zkuste aplikaci zavřít a znovu otevřít.')}
    })();
  },true);

  function installSync(){
    const button=document.querySelector('.vedator-offline-btn');
    const title=document.querySelector('.vedator-audio-card__title');
    const audio=document.querySelector('.vedator-audio-card audio');
    if(!button||!title)return false;
    if(!title.__vedatorOfflineStrictObserver){
      title.__vedatorOfflineStrictObserver=true;
      new MutationObserver(()=>setTimeout(syncButton,0)).observe(title,{childList:true,characterData:true,subtree:true});
    }
    if(audio&&!audio.__vedatorOfflineStrictEvents){
      audio.__vedatorOfflineStrictEvents=true;
      for(const name of ['emptied','loadstart','loadedmetadata','canplay','error'])audio.addEventListener(name,()=>setTimeout(syncButton,0));
    }
    setTimeout(syncButton,0);
    return true;
  }
  if(!installSync())new MutationObserver((_,observer)=>{if(installSync())observer.disconnect()}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',()=>setTimeout(syncButton,0));
  window.addEventListener('pagehide',()=>{for(const url of blobUrls.values())try{URL.revokeObjectURL(url)}catch{};blobUrls.clear()});
})();
