(()=>{
  if(window.__vedatorMediaSessionSkip)return;
  window.__vedatorMediaSessionSkip=true;
  if(!('mediaSession'in navigator))return;

  function install(){
    const audio=document.querySelector('.vedator-audio-card audio');
    if(!audio)return false;

    const seek=delta=>{
      const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Infinity;
      audio.currentTime=Math.max(0,Math.min(duration,audio.currentTime+delta));
    };

    try{navigator.mediaSession.setActionHandler('seekbackward',details=>seek(-(details.seekOffset||10)))}catch(error){}
    try{navigator.mediaSession.setActionHandler('seekforward',details=>seek(details.seekOffset||10))}catch(error){}
    try{navigator.mediaSession.setActionHandler('previoustrack',()=>seek(-10))}catch(error){}
    try{navigator.mediaSession.setActionHandler('nexttrack',()=>seek(10))}catch(error){}
    try{navigator.mediaSession.setActionHandler('seekto',details=>{
      if(typeof details.seekTime!=='number')return;
      const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Infinity;
      audio.currentTime=Math.max(0,Math.min(duration,details.seekTime));
    })}catch(error){}
    return true;
  }

  if(!install())new MutationObserver((_,observer)=>{if(install())observer.disconnect()}).observe(document.body,{childList:true,subtree:true});
})();

(()=>{
  if(window.__vedatorStartedPlaylistColor)return;
  window.__vedatorStartedPlaylistColor=true;

  const STARTED_KEY='vedatorStartedPlaylistsV1';
  const PROGRESS_KEY='vedatorCollectionProgressV1';
  const PLAYLISTS_KEY='vedator-user-playlists-v1';
  const REF_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let started=loadObject(STARTED_KEY);
  let completionQueued=false;

  const style=document.createElement('style');
  style.textContent=`
    .vedator-playlist-started-persisted:not(.vedator-collection-title-complete){color:#d97706!important}
    html.theme-dark .vedator-playlist-started-persisted:not(.vedator-collection-title-complete){color:#fbbf24!important}
    .vedator-collection-title-complete{color:#15803d!important}
    html.theme-dark .vedator-collection-title-complete{color:#4ade80!important}
  `;
  document.head.appendChild(style);

  function loadObject(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return {}}
  }

  function loadArray(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'[]');
      return Array.isArray(value)?value:[];
    }catch{return []}
  }

  function save(){
    try{localStorage.setItem(STARTED_KEY,JSON.stringify(started))}catch{}
  }

  function norm(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }

  function absoluteUrl(value){
    try{return new URL(value,location.href).href}catch{return String(value||'')}
  }

  function episodesList(){
    try{return Array.isArray(episodes)?episodes:[]}catch{return []}
  }

  function encodeNumber(value){
    const number=Number(value);
    return Number.isInteger(number)&&number>=0&&number<4096
      ?REF_ALPHABET[(number>>6)&63]+REF_ALPHABET[number&63]
      :'';
  }

  function normalizePlaylistRef(value){
    if(typeof value==='string'&&value.length===2&&REF_ALPHABET.includes(value[0])&&REF_ALPHABET.includes(value[1]))return value;
    const episode=episodesList().find(item=>String(item?.id||item?.number||item?.title||'')===String(value));
    return episode?encodeNumber(episode.number):'';
  }

  function playlistKey(card){
    const id=String(card?.dataset.id||'').trim();
    return id?`playlist:${id}`:'';
  }

  function canonicalSeriesLabel(value){
    return norm(String(value||'')
      .replace(/Hledání mimozemského života/gi,'Hľadanie mimozemského života')
      .replace(/Rozhovory o vesmíru/gi,'Rozhovory o vesmíre')
      .replace(/(?:Žiji|Žiju) vědu/gi,'Žijem vedu')
      .replace(/Genetický speciál/gi,'Genetický špeciál')
      .replace(/Vedátorský speciál/gi,'Vedátorský špeciál')
      .replace(/Nobelovy ceny/gi,'Nobelove ceny'));
  }

  function seriesKey(card){
    const label=card?.querySelector('summary span:first-child')?.textContent?.trim();
    return label?`series:${canonicalSeriesLabel(label)}`:'';
  }

  function episodeItemId(episode){
    const media=absoluteUrl(episode?.enclosure||episode?.link||'');
    if(media)return `audio:${media}`;
    return `episode:${String(episode?.id||episode?.number||episode?.title||'')}`;
  }

  function recordForEpisode(records,episode){
    const direct=records[episodeItemId(episode)];
    if(direct)return direct;
    const title=norm(episode?.title);
    if(!title)return null;
    return Object.values(records).find(record=>norm(record?.title)===title)||null;
  }

  function mark(card){
    const key=playlistKey(card);
    if(!key||started[key])return;
    started[key]=true;
    save();
    decorateCard(card);
  }

  function decorateCard(card){
    const title=card?.querySelector('.vedator-playlist-title');
    if(!title)return;
    title.classList.toggle('vedator-playlist-started-persisted',Boolean(started[playlistKey(card)]));
  }

  function playlistIsComplete(card,progress,playlists){
    const id=String(card?.dataset.id||'');
    const playlist=playlists.find(item=>String(item?.id)===id);
    const refs=(playlist?.items||[]).map(normalizePlaylistRef).filter(Boolean);
    if(!refs.length)return false;
    const records=progress[`playlist:${id}`]?.items||{};
    return refs.every(ref=>records[`ref:${ref}`]?.completed===true);
  }

  function completedSeries(progress){
    let groups=[];
    try{if(typeof window.seriesGroups==='function')groups=window.seriesGroups()||[]}catch{}
    const result=new Set();
    for(const group of groups){
      const items=Array.isArray(group?.items)?group.items:[];
      if(!items.length)continue;
      const key=`series:${canonicalSeriesLabel(group?.name||'')}`;
      const records=progress[key]?.items||{};
      if(items.every(item=>recordForEpisode(records,item)?.completed===true))result.add(key);
    }
    return result;
  }

  function decorateCompletedCollections(){
    completionQueued=false;
    const progress=loadObject(PROGRESS_KEY);
    const playlists=loadArray(PLAYLISTS_KEY);
    const completeSeries=completedSeries(progress);

    document.querySelectorAll('#series .series-card').forEach(card=>{
      const title=card.querySelector('summary span:first-child');
      if(title)title.classList.toggle('vedator-collection-title-complete',completeSeries.has(seriesKey(card)));
    });

    document.querySelectorAll('.vedator-playlist-list .vedator-playlist-card[data-id]').forEach(card=>{
      const title=card.querySelector('.vedator-playlist-title');
      if(title)title.classList.toggle('vedator-collection-title-complete',playlistIsComplete(card,progress,playlists));
    });
  }

  function scheduleCompletionDecoration(){
    if(completionQueued)return;
    completionQueued=true;
    requestAnimationFrame(decorateCompletedCollections);
  }

  function isSlovak(){
    try{
      if(typeof window.vedatorUiLanguage==='function')return window.vedatorUiLanguage()!=='cz';
    }catch{}
    return document.documentElement.lang!=='cs';
  }

  function translateCollectionButtons(){
    const sk=isSlovak();
    document.querySelectorAll('.vedator-collection-continue').forEach(button=>{
      const raw=button.textContent.trim();
      let next='';
      if(/^(?:Začít sérii|Začať sériu)$/i.test(raw))next=sk?'Začať sériu':'Začít sérii';
      else if(/^(?:Pokračovat v sérii|Pokračovať v sérii)$/i.test(raw))next=sk?'Pokračovať v sérii':'Pokračovat v sérii';
      else if(/^(?:Začít playlist|Začať playlist)$/i.test(raw))next=sk?'Začať playlist':'Začít playlist';
      else if(/^(?:Pokračovat v playlistu|Pokračovať v playliste)$/i.test(raw))next=sk?'Pokračovať v playliste':'Pokračovat v playlistu';
      if(next&&button.textContent!==next)button.textContent=next;
    });
  }

  function addSlovakEpisodeAliases(){
    document.querySelectorAll('.vedator-playlist-open[data-ref] .vedator-item-sub').forEach(subtitle=>{
      if(subtitle.querySelector('.vedator-playlist-episode-alias'))return;
      const match=subtitle.textContent.match(/\bDiel\s*(\d+)/i);
      if(!match)return;
      const alias=document.createElement('span');
      alias.className='vedator-playlist-episode-alias';
      alias.hidden=true;
      alias.textContent=` Díl ${match[1]}`;
      subtitle.appendChild(alias);
    });
  }

  function decorateAll(){
    addSlovakEpisodeAliases();
    document.querySelectorAll('.vedator-playlist-list .vedator-playlist-card[data-id]').forEach(decorateCard);
    translateCollectionButtons();
  }

  function migrateExistingProgress(){
    const progress=loadObject(PROGRESS_KEY);
    let changed=false;
    for(const [key,record] of Object.entries(progress)){
      if(!key.startsWith('playlist:')||started[key])continue;
      const items=record&&typeof record==='object'&&record.items&&typeof record.items==='object'?record.items:{};
      if(record?.started||record?.lastItemId||Object.keys(items).length){
        started[key]=true;
        changed=true;
      }
    }
    if(changed)save();
  }

  const markFromEvent=event=>{
    const item=event.target.closest?.('.vedator-playlist-open[data-ref]');
    if(item)mark(item.closest('.vedator-playlist-card[data-id]'));
  };
  document.addEventListener('pointerdown',markFromEvent,true);
  document.addEventListener('click',markFromEvent,true);

  window.addEventListener('storage',event=>{
    if(event.key===STARTED_KEY){
      started=loadObject(STARTED_KEY);
      decorateAll();
    }else if(event.key===PROGRESS_KEY){
      migrateExistingProgress();
      decorateAll();
      scheduleCompletionDecoration();
    }else if(event.key===PLAYLISTS_KEY){
      scheduleCompletionDecoration();
    }
  });
  window.addEventListener('vedatorcontentchange',()=>{
    decorateAll();
    scheduleCompletionDecoration();
  });
  window.addEventListener('vedatorlanguagechange',decorateAll);

  const collectionNodeAdded=node=>node?.nodeType===1&&(
    node.matches?.('.series-card,.vedator-playlist-card,#series,.vedator-playlist-list')||
    node.querySelector?.('.series-card,.vedator-playlist-card')
  );
  const observer=new MutationObserver(records=>{
    if(records.some(record=>record.addedNodes.length||record.removedNodes.length))decorateAll();
    if(records.some(record=>[...record.addedNodes].some(collectionNodeAdded)))scheduleCompletionDecoration();
  });
  observer.observe(document.body,{childList:true,subtree:true});

  migrateExistingProgress();
  decorateAll();
  scheduleCompletionDecoration();
})();
