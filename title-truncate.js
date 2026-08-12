(()=>{
  if(window.__vedatorTitleTruncate)return;
  window.__vedatorTitleTruncate=true;

  const style=document.createElement('style');
  style.textContent=`
    .series-card>summary>span:first-child,
    details.vedator-playlist-card>summary .vedator-playlist-title{
      flex:1;
      min-width:0;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .series-card[open]>summary>span:first-child,
    details.vedator-playlist-card[open]>summary .vedator-playlist-title{
      overflow:visible;
      text-overflow:clip;
      white-space:normal;
      overflow-wrap:anywhere;
    }

    .vedator-series-started-persisted:not(.vedator-collection-title-complete){
      color:#d97706!important;
    }
    html.theme-dark .vedator-series-started-persisted:not(.vedator-collection-title-complete){
      color:#fbbf24!important;
    }
    .vedator-playlist-sort{max-width:230px}
    @media(max-width:650px){.vedator-playlist-sort{max-width:190px}}
  `;
  document.head.appendChild(style);

  const COLLECTION_PROGRESS_KEY='vedatorCollectionProgressV1';
  const STARTED_SERIES_KEY='vedatorStartedSeriesV1';
  const SORT_PREFERENCES_KEY='vedatorSortPreferencesV1';
  const PLAYLIST_SORT_KEY='vedatorPlaylistSortPreferenceV1';
  const PLAYLISTS_KEY='vedator-user-playlists-v1';
  const STATUS_SORTS=new Set(['started','completed','unheard']);
  const STATUS_OPTIONS=[
    ['started','Rozposlouchané první'],
    ['completed','Poslechnuté první'],
    ['unheard','Neposlechnuté první']
  ];
  const STATUS_ORDER={
    started:{started:0,unheard:1,completed:2},
    completed:{completed:0,started:1,unheard:2},
    unheard:{unheard:0,started:1,completed:2}
  };
  let startedSeries=loadObject(STARTED_SERIES_KEY);
  let refreshQueued=false;
  let refreshAttempts=0;
  let playlistSortScheduled=false;

  function loadObject(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch(_){return {}}
  }

  function loadArray(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'[]');
      return Array.isArray(value)?value:[];
    }catch(_){return []}
  }

  function saveStartedSeries(){
    try{localStorage.setItem(STARTED_SERIES_KEY,JSON.stringify(startedSeries))}catch(_){}
  }

  function norm(value){
    return String(value||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
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

  function seriesId(card){
    const label=card?.querySelector('summary span:first-child')?.textContent?.trim();
    return label?`series:${canonicalSeriesLabel(label)}`:'';
  }

  function groupSeriesId(group){
    return `series:${canonicalSeriesLabel(group?.name||'')}`;
  }

  function absoluteUrl(value){
    if(!value)return '';
    try{return new URL(value,location.href).href}catch(_){return String(value)}
  }

  function episodeCollectionItemId(episode){
    const media=absoluteUrl(episode?.enclosure||episode?.link||'');
    if(media)return `audio:${media}`;
    return `episode:${String(episode?.id||episode?.number||episode?.title||'')}`;
  }

  function heardRecord(record){
    return Boolean(record&&(record.completed||Number(record.percent)>0||Number(record.currentTime)>Number(record.start||0)+3));
  }

  function recordForEpisode(records,episode){
    const direct=records[episodeCollectionItemId(episode)];
    if(direct)return direct;
    const title=norm(episode?.title);
    if(!title)return null;
    return Object.values(records).find(record=>norm(record?.title)===title)||null;
  }

  function collectionStateForSeries(group,progress){
    const items=Array.isArray(group?.items)?group.items:[];
    if(!items.length)return 'unheard';
    const id=groupSeriesId(group);
    const collection=progress[id];
    const records=collection&&typeof collection.items==='object'&&collection.items?collection.items:{};
    if(items.every(item=>recordForEpisode(records,item)?.completed))return 'completed';
    if(startedSeries[id]||items.some(item=>heardRecord(recordForEpisode(records,item))))return 'started';
    return 'unheard';
  }

  function addStatusOptions(select){
    if(!select)return;
    for(const [value,label] of STATUS_OPTIONS){
      if(select.querySelector(`option[value="${value}"]`))continue;
      const option=document.createElement('option');
      option.value=value;
      option.textContent=label;
      select.appendChild(option);
    }
  }

  function installSeriesSorting(){
    const select=document.querySelector('#seriesSort');
    addStatusOptions(select);
    const preferences=loadObject(SORT_PREFERENCES_KEY);
    if(select&&STATUS_SORTS.has(preferences.series))select.value=preferences.series;

    const original=window.seriesGroups;
    if(typeof original!=='function'||original.__vedatorCollectionStatusWrapped)return;
    const wrapped=function(...args){
      const groups=original.apply(this,args);
      const sort=document.querySelector('#seriesSort')?.value;
      if(!Array.isArray(groups)||!STATUS_SORTS.has(sort))return groups;
      const progress=loadObject(COLLECTION_PROGRESS_KEY);
      return groups
        .map((group,index)=>({group,index,state:collectionStateForSeries(group,progress)}))
        .sort((a,b)=>STATUS_ORDER[sort][a.state]-STATUS_ORDER[sort][b.state]||a.index-b.index)
        .map(entry=>entry.group);
    };
    wrapped.__vedatorCollectionStatusWrapped=true;
    window.seriesGroups=wrapped;
  }

  function ensurePlaylistSort(){
    const toolbar=document.querySelector('.vedator-playlist-toolbar');
    if(!toolbar)return null;
    let select=toolbar.querySelector('.vedator-playlist-sort');
    if(!select){
      select=document.createElement('select');
      select.className='sort vedator-playlist-sort';
      select.setAttribute('aria-label','Řazení playlistů');
      select.innerHTML='<option value="default">Vlastní pořadí</option>';
      addStatusOptions(select);
      toolbar.insertBefore(select,toolbar.querySelector('.vedator-playlist-add'));
      const saved=localStorage.getItem(PLAYLIST_SORT_KEY);
      if(saved==='default'||STATUS_SORTS.has(saved))select.value=saved;
      select.addEventListener('change',()=>{
        try{localStorage.setItem(PLAYLIST_SORT_KEY,select.value)}catch(_){}
        schedulePlaylistSort();
      });
    }
    return select;
  }

  function collectionStateForPlaylist(card,progress){
    const id=card?.dataset.id;
    if(!id)return 'unheard';
    const refs=[...card.querySelectorAll('.vedator-playlist-open[data-ref]')]
      .map(button=>button.dataset.ref)
      .filter(Boolean);
    if(!refs.length)return 'unheard';
    const collection=progress[`playlist:${id}`];
    const records=collection&&typeof collection.items==='object'&&collection.items?collection.items:{};
    if(refs.every(ref=>records[`ref:${ref}`]?.completed))return 'completed';
    if(refs.some(ref=>heardRecord(records[`ref:${ref}`])))return 'started';
    return 'unheard';
  }

  function sortPlaylistCards(){
    playlistSortScheduled=false;
    const select=ensurePlaylistSort();
    const list=document.querySelector('.vedator-playlist-list');
    if(!select||!list)return;
    const cards=[...list.querySelectorAll(':scope > .vedator-playlist-card[data-id]')];
    if(cards.length<2)return;
    const playlists=loadArray(PLAYLISTS_KEY);
    const originalOrder=new Map(playlists.map((playlist,index)=>[String(playlist?.id),index]));
    const progress=loadObject(COLLECTION_PROGRESS_KEY);
    const sort=select.value;
    const entries=cards.map((card,index)=>({
      card,
      index:originalOrder.has(String(card.dataset.id))?originalOrder.get(String(card.dataset.id)):index,
      state:collectionStateForPlaylist(card,progress)
    }));
    entries.sort((a,b)=>{
      if(STATUS_SORTS.has(sort)){
        const difference=STATUS_ORDER[sort][a.state]-STATUS_ORDER[sort][b.state];
        if(difference)return difference;
      }
      return a.index-b.index;
    });
    if(entries.every((entry,index)=>entry.card===cards[index]))return;
    const fragment=document.createDocumentFragment();
    entries.forEach(entry=>fragment.appendChild(entry.card));
    list.appendChild(fragment);
  }

  function schedulePlaylistSort(){
    if(playlistSortScheduled)return;
    playlistSortScheduled=true;
    requestAnimationFrame(sortPlaylistCards);
  }

  function migrateCollectionProgress(){
    const progress=loadObject(COLLECTION_PROGRESS_KEY);
    let changed=false;
    for(const [id,record] of Object.entries(progress)){
      if(!id.startsWith('series:')||startedSeries[id])continue;
      const items=record&&typeof record==='object'&&record.items&&typeof record.items==='object'?record.items:{};
      if(record?.started||record?.lastItemId||Object.keys(items).length){
        startedSeries[id]=true;
        changed=true;
      }
    }
    if(changed)saveStartedSeries();
  }

  function markSeriesStarted(card){
    const id=seriesId(card);
    if(!id||startedSeries[id])return;
    startedSeries[id]=true;
    saveStartedSeries();
    decorateStartedSeries();
  }

  function decorateStartedSeries(){
    document.querySelectorAll('#series .series-card').forEach(card=>{
      const title=card.querySelector('summary span:first-child');
      if(!title)return;
      title.classList.toggle('vedator-series-started-persisted',Boolean(startedSeries[seriesId(card)]));
    });
  }

  function dispatchCollectionRefresh(){
    if(!window.__vedatorCollectionProgress)return false;
    let event;
    try{
      event=new StorageEvent('storage',{
        key:COLLECTION_PROGRESS_KEY,
        newValue:localStorage.getItem(COLLECTION_PROGRESS_KEY),
        storageArea:localStorage,
        url:location.href
      });
    }catch(_){
      event=new Event('storage');
      Object.defineProperty(event,'key',{value:COLLECTION_PROGRESS_KEY});
    }
    window.dispatchEvent(event);
    return true;
  }

  function refreshCollectionProgress(){
    refreshQueued=false;
    decorateStartedSeries();
    schedulePlaylistSort();
    if(!dispatchCollectionRefresh()){
      if(refreshAttempts++<100)setTimeout(queueCollectionRefresh,80);
      return;
    }
    refreshAttempts=0;
    setTimeout(dispatchCollectionRefresh,60);
    setTimeout(dispatchCollectionRefresh,220);
  }

  function queueCollectionRefresh(){
    if(refreshQueued)return;
    refreshQueued=true;
    requestAnimationFrame(refreshCollectionProgress);
  }

  function observeView(view){
    if(!view||view.dataset.vedatorCollectionRefreshObserved==='1')return;
    view.dataset.vedatorCollectionRefreshObserved='1';
    new MutationObserver(()=>{
      queueCollectionRefresh();
      schedulePlaylistSort();
    }).observe(view,{
      attributes:true,
      attributeFilter:['class'],
      childList:true
    });
  }

  function installObservers(){
    observeView(document.querySelector('#series'));
    const playlistView=document.querySelector('.vedator-playlist-view');
    observeView(playlistView);
    observeView(playlistView?.querySelector('.vedator-playlist-list'));
    ensurePlaylistSort();
  }

  window.addEventListener('click',event=>{
    const seriesLink=event.target.closest?.('#series .series-card .series-body a');
    if(seriesLink)markSeriesStarted(seriesLink.closest('.series-card'));

    const tab=event.target.closest?.('.tab[data-view="series"],.tab[data-view="playlists"]');
    if(!tab)return;
    queueCollectionRefresh();
    if(tab.dataset.view==='playlists')schedulePlaylistSort();
    setTimeout(queueCollectionRefresh,80);
    setTimeout(queueCollectionRefresh,300);
  },true);

  window.addEventListener('storage',event=>{
    if(event.key===STARTED_SERIES_KEY){
      startedSeries=loadObject(STARTED_SERIES_KEY);
      decorateStartedSeries();
      return;
    }
    if(event.key===PLAYLIST_SORT_KEY){
      const select=ensurePlaylistSort();
      const saved=localStorage.getItem(PLAYLIST_SORT_KEY);
      if(select&&(saved==='default'||STATUS_SORTS.has(saved)))select.value=saved;
      schedulePlaylistSort();
      return;
    }
    if(event.key===COLLECTION_PROGRESS_KEY){
      migrateCollectionProgress();
      decorateStartedSeries();
      schedulePlaylistSort();
      if(event.isTrusted&&STATUS_SORTS.has(document.querySelector('#seriesSort')?.value)&&typeof window.renderSeries==='function')window.renderSeries();
    }
  });
  window.addEventListener('vedatorcontentchange',queueCollectionRefresh);
  window.addEventListener('vedatorepisodetranslationsready',queueCollectionRefresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueCollectionRefresh()});

  migrateCollectionProgress();
  installSeriesSorting();
  installObservers();
  new MutationObserver(()=>{
    installSeriesSorting();
    installObservers();
    queueCollectionRefresh();
  }).observe(document.body,{childList:true});

  queueCollectionRefresh();
  schedulePlaylistSort();
  setTimeout(queueCollectionRefresh,500);
})();
