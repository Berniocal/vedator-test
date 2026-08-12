(()=>{
  if(window.__vedatorPersistentPerformanceCache)return;
  window.__vedatorPersistentPerformanceCache=true;

  const STORAGE_KEY='vedatorEpisodeSearchCacheV1';
  const MAX_RECORDS=430;
  let records={};
  let flushTimer=0;
  let warmTimer=0;
  let warmIndex=0;
  let warmSource=null;

  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    if(saved&&typeof saved==='object'&&!Array.isArray(saved))records=saved;
  }catch{}

  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const getEpisodes=()=>{try{return Array.isArray(episodes)?episodes:[]}catch{return[]}};
  const currentLanguage=()=>{
    try{return String(window.vedatorUiLanguage?.()||document.documentElement.lang||'cs').toLowerCase().slice(0,2)}catch{return'cs'}
  };
  const episodeKey=episode=>String(episode?.number??episode?.id??episode?.link??episode?.title??'');

  function hash(value){
    const text=String(value||'');
    let result=2166136261;
    for(let i=0;i<text.length;i++){
      result^=text.charCodeAt(i);
      result=Math.imul(result,16777619);
    }
    return (result>>>0).toString(36);
  }

  function signature(episode){
    return hash(`${currentLanguage()}\u0000${episode?.title||''}\u0000${episode?.description||''}\u0000${episode?.date||''}`);
  }

  function scheduleFlush(){
    if(flushTimer)return;
    flushTimer=setTimeout(()=>{
      flushTimer=0;
      try{
        const entries=Object.entries(records);
        if(entries.length>MAX_RECORDS){
          entries.sort((a,b)=>(b[1]?.used||0)-(a[1]?.used||0));
          records=Object.fromEntries(entries.slice(0,MAX_RECORDS));
        }
        localStorage.setItem(STORAGE_KEY,JSON.stringify(records));
      }catch{}
    },500);
  }

  function plainDescription(value){
    const box=document.createElement('div');
    box.innerHTML=String(value||'');
    return (box.textContent||'').replace(/\s+/g,' ').trim();
  }

  function metadata(episode){
    const key=episodeKey(episode);
    const sig=signature(episode);
    const saved=records[key];
    if(saved?.signature===sig){
      saved.used=Date.now();
      return saved;
    }

    const plain=plainDescription(episode?.description);
    let cats=[];
    try{cats=typeof categories==='function'?categories(episode):[]}catch{}
    if(!Array.isArray(cats))cats=[];
    const next={
      signature:sig,
      titleNorm:normalize(episode?.title),
      descNorm:normalize(plain),
      plain,
      cats,
      dateTs:episode?.date?new Date(episode.date).getTime()||0:0,
      used:Date.now()
    };
    records[key]=next;
    scheduleFlush();
    return next;
  }

  function prepareQueries(values){
    return (values||[]).map(value=>{
      const raw=normalize(value);
      return {raw,words:raw.split(' ').filter(Boolean)};
    }).filter(query=>query.raw);
  }

  function match(meta,queries){
    if(!queries.length)return 0;
    if(queries.some(query=>meta.titleNorm.includes(query.raw)))return 0;
    if(queries.some(query=>query.words.every(word=>meta.titleNorm.includes(word))))return 1;
    if(queries.some(query=>meta.descNorm.includes(query.raw)))return 2;
    if(queries.some(query=>query.words.every(word=>meta.descNorm.includes(word))))return 3;
    return 99;
  }

  function install(){
    let previous;
    try{previous=filtered}catch{return false}
    if(typeof previous!=='function')return false;
    if(previous.__vedatorPersistentFilter)return true;

    const persistentFiltered=function(){
      let currentTopic='Vše';
      try{currentTopic=active}catch{}
      if(currentTopic==='Matematika')return previous();

      const searchValue=document.querySelector('#search')?.value||'';
      let searchQueries=[],topicQueries=[];
      try{searchQueries=expandedQuery(searchValue)}catch{}
      try{topicQueries=selectedTopicQueries()}catch{}
      const preparedSearch=prepareQueries(searchQueries);
      const preparedTopics=prepareQueries(topicQueries);
      const result=[];

      for(const episode of getEpisodes()){
        const meta=metadata(episode);
        const searchMatch=match(meta,preparedSearch);
        if(preparedSearch.length&&searchMatch>=99)continue;
        const topicMatch=match(meta,preparedTopics);
        if(preparedTopics.length&&topicMatch>=99)continue;
        result.push({...episode,cats:meta.cats,searchMatch,topicMatch,__vedatorDateTs:meta.dateTs});
      }
      return result;
    };
    persistentFiltered.__vedatorPersistentFilter=true;
    persistentFiltered.__vedatorOriginal=previous;
    try{filtered=persistentFiltered}catch{}
    window.filtered=persistentFiltered;
    return true;
  }

  function warm(deadline){
    warmTimer=0;
    const source=getEpisodes();
    if(source!==warmSource){warmSource=source;warmIndex=0}
    const started=performance.now();
    while(warmIndex<source.length){
      metadata(source[warmIndex++]);
      const hasBudget=deadline&&typeof deadline.timeRemaining==='function'?deadline.timeRemaining()>3:performance.now()-started<7;
      if(!hasBudget)break;
    }
    if(warmIndex<source.length)scheduleWarm();
  }

  function scheduleWarm(reset=false){
    if(reset){warmSource=null;warmIndex=0}
    if(warmTimer)return;
    if('requestIdleCallback'in window)warmTimer=requestIdleCallback(warm,{timeout:1200});
    else warmTimer=setTimeout(()=>warm(null),60);
  }

  const start=()=>{
    if(!install())setTimeout(start,100);
    scheduleWarm();
  };
  start();
  window.addEventListener('vedatorlanguagechange',()=>scheduleWarm(true));
  window.addEventListener('vedatorepisodetranslationsready',()=>scheduleWarm(true));
  window.addEventListener('pagehide',()=>{
    if(flushTimer){clearTimeout(flushTimer);flushTimer=0}
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(records))}catch{}
  });
})();
