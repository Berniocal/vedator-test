(()=>{
  if(window.__vedatorCollectionProgress)return;
  window.__vedatorCollectionProgress=true;

  const STORAGE_KEY='vedatorCollectionProgressV1';
  const HEARD_AFTER=3;
  let state=loadState();
  let active=null;
  let lastSavedSecond=-1;
  let pointerNavigationAt=0;
  let decorateScheduled=false;

  const style=document.createElement('style');
  style.textContent=`
    .vedator-collection-title-active{color:#d97706!important}
    .vedator-collection-title-complete{color:#15803d!important}
    .vedator-collection-controls{padding:10px 0 6px}
    .vedator-collection-continue{width:100%;border:0;border-radius:12px;background:var(--accent);color:#fff;padding:11px 14px;font-weight:800;cursor:pointer;box-shadow:0 7px 18px rgba(91,75,219,.18)}
    .vedator-collection-progress-text{--vedator-heard:#16a34a;--vedator-unheard:#392b9b;background:linear-gradient(90deg,var(--vedator-heard) 0 var(--vedator-progress),var(--vedator-unheard) var(--vedator-progress) 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important}
    .vedator-collection-complete-text{color:#15803d!important}
    html.theme-dark .vedator-collection-title-active{color:#fbbf24!important}
    html.theme-dark .vedator-collection-title-complete{color:#4ade80!important}
    html.theme-dark .vedator-collection-progress-text{--vedator-heard:#4ade80;--vedator-unheard:#c4b5fd}
    html.theme-dark .vedator-collection-complete-text{color:#4ade80!important}
    html.theme-dark .vedator-collection-continue{box-shadow:0 8px 20px rgba(91,78,216,.35)}
  `;
  document.head.appendChild(style);

  function loadState(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return {}}
  }
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
  function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function absoluteUrl(value){try{return new URL(value,location.href).href}catch{return String(value||'')}}
  function parseTime(value){
    const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
    if(!parts)return 0;
    return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
  }
  function episodeNumber(title){return Number(String(title||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0)}
  function getEpisodes(){try{return Array.isArray(episodes)?episodes:[]}catch{return []}}
  function getEpisodeByNumber(number){return getEpisodes().find(episode=>Number(episode.number)===Number(number))||null}
  function getEpisodeForSeriesLink(link){
    const href=absoluteUrl(link.dataset.vedatorAudioUrl||link.getAttribute('href'));
    const title=(link.dataset.vedatorEpisodeTitle||link.querySelector('.episode-title')?.textContent||link.textContent||'').trim();
    return getEpisodes().find(episode=>
      absoluteUrl(episode.enclosure)===href||
      absoluteUrl(episode.link)===href||
      episode.title===title
    )||null;
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
  function itemIdForEpisode(episode,url){
    const media=absoluteUrl(episode?.enclosure||url);
    if(media)return `audio:${media}`;
    return `episode:${String(episode?.id||episode?.link||episode?.title||url||'')}`;
  }
  function itemTitleFromSeriesLink(link){
    return String(link.dataset.vedatorEpisodeTitle||link.querySelector('.episode-title')?.textContent||link.textContent||'').trim();
  }

  function buildSeriesContext(source){
    const card=source?.matches?.('.series-card')?source:source?.closest?.('.series-card');
    if(!card)return null;
    const links=[...card.querySelectorAll('.series-body a')];
    const items=links.map(link=>{
      const episode=getEpisodeForSeriesLink(link);
      const url=episode?.enclosure||link.dataset.vedatorAudioUrl||link.getAttribute('href')||'';
      return {
        id:itemIdForEpisode(episode,url),
        title:episode?.title||itemTitleFromSeriesLink(link),
        number:Number(episode?.number)||episodeNumber(itemTitleFromSeriesLink(link)),
        url,
        start:0,
        end:null,
        element:link
      };
    }).filter(item=>item.url&&item.title);
    if(!items.length)return null;
    const label=card.querySelector('summary span')?.textContent?.trim()||'Série';
    const id=`series:${canonicalSeriesLabel(label)}`;
    const clicked=source?.closest?.('.series-body a');
    const clickedId=clicked?itemIdForEpisode(getEpisodeForSeriesLink(clicked),clicked.dataset.vedatorAudioUrl||clicked.getAttribute('href')):'';
    let index=clickedId?items.findIndex(item=>item.id===clickedId):-1;
    if(index<0)index=0;
    card.dataset.vedatorCollectionId=id;
    items.forEach(item=>item.element.dataset.vedatorCollectionItemId=item.id);
    return {type:'series',id,label,card,items,index};
  }

  function playlistEpisodeNumber(button){return Number(button.querySelector('.vedator-item-sub')?.textContent?.match(/D[ií]l\s*(\d+)/i)?.[1]||0)}
  function buildPlaylistContext(source){
    const card=source?.matches?.('.vedator-playlist-card')?source:source?.closest?.('.vedator-playlist-card');
    if(!card)return null;
    const buttons=[...card.querySelectorAll('.vedator-playlist-open[data-ref]')];
    const items=buttons.map(button=>{
      const number=playlistEpisodeNumber(button);
      const episode=getEpisodeByNumber(number);
      const subtitle=button.querySelector('.vedator-item-sub')?.textContent||'';
      const start=subtitle.includes('•')?parseTime(subtitle):0;
      return {
        id:`ref:${button.dataset.ref}`,
        title:episode?.title||button.querySelector('b')?.textContent?.trim()||button.textContent.trim(),
        displayTitle:button.querySelector('b')?.textContent?.trim()||button.textContent.trim(),
        number,
        url:episode?.enclosure||'',
        start,
        end:null,
        element:button
      };
    }).filter(item=>item.url&&item.title);
    for(const item of items){
      if(item.start<=0)continue;
      const next=items.filter(candidate=>candidate.number===item.number&&candidate.start>item.start).sort((a,b)=>a.start-b.start)[0];
      if(next)item.end=next.start;
    }
    if(!items.length)return null;
    const label=card.querySelector('.vedator-playlist-title')?.textContent?.trim()||'Playlist';
    const id=`playlist:${card.dataset.id||norm(label)}`;
    const clicked=source?.closest?.('.vedator-playlist-open[data-ref]');
    const clickedId=clicked?`ref:${clicked.dataset.ref}`:'';
    let index=clickedId?items.findIndex(item=>item.id===clickedId):-1;
    if(index<0)index=0;
    card.dataset.vedatorCollectionId=id;
    return {type:'playlist',id,label,card,items,index};
  }

  function contextFromCard(card){
    if(card?.matches('.series-card'))return buildSeriesContext(card);
    if(card?.matches('.vedator-playlist-card'))return buildPlaylistContext(card);
    return null;
  }
  function findContext(type,id){
    const selector=type==='series'?'#series .series-card':'.vedator-playlist-list .vedator-playlist-card';
    for(const card of document.querySelectorAll(selector)){
      const context=contextFromCard(card);
      if(context?.id===id)return context;
    }
    return null;
  }
  function currentItem(){return active?.items?.[active.index]||null}
  function collectionRecord(context){return state[context.id]||null}
  function itemRecord(context,item){return state[context.id]?.items?.[item.id]||null}
  function ensureCollection(context){
    const existing=state[context.id];
    if(existing&&typeof existing==='object')return existing;
    return state[context.id]={type:context.type,label:context.label,lastItemId:'',updatedAt:0,items:{}};
  }
  function requestedTime(context,item){
    const record=itemRecord(context,item);
    if(record&&!record.completed&&Number(record.currentTime)>item.start+1)return Number(record.currentTime);
    return item.start||0;
  }
  function publishSafePlayerContext(){
    if(!active)return;
    const item=currentItem();
    if(!item)return;
    window.__vedatorPlaybackContext={type:active.type,label:active.label,titles:[item.title]};
    syncNavigationButtons();
  }
  function setRequestedStart(context,item){
    window.__vedatorRequestedStart={
      episode:Number(item.number)||0,
      time:Math.max(item.start||0,requestedTime(context,item)),
      createdAt:Date.now(),
      collectionOverride:true
    };
  }
  function beginContext(context,index=context.index){
    if(!context?.items?.length)return null;
    saveActive(true,false);
    context.index=Math.max(0,Math.min(index,context.items.length-1));
    active=context;
    lastSavedSecond=-1;
    const item=currentItem();
    setRequestedStart(context,item);
    queueMicrotask(publishSafePlayerContext);
    setTimeout(publishSafePlayerContext,0);
    setTimeout(publishSafePlayerContext,120);
    syncNavigationButtons();
    return item;
  }
  function clearActive(){saveActive(true,false);active=null;lastSavedSecond=-1}

  function openProxy(item){
    if(!item?.url||!item.title)return false;
    const proxy=document.createElement('article');
    proxy.hidden=true;
    proxy.innerHTML='<h2></h2><div class="links"><a class="primary"></a></div>';
    proxy.querySelector('h2').textContent=item.title;
    const play=proxy.querySelector('a');
    play.href=item.url;
    play.dataset.vedatorEpisodeTitle=item.title;
    document.body.appendChild(proxy);
    play.click();
    proxy.remove();
    return true;
  }

  function effectiveEnd(item,duration){
    if(Number.isFinite(item.end)&&item.end>item.start)return Math.min(item.end,duration>0?duration:item.end);
    return duration>item.start?duration:0;
  }
  function calculateProgress(item,time,duration,ended){
    const start=Math.max(0,Number(item.start)||0);
    const end=effectiveEnd(item,duration);
    const span=end>start?end-start:0;
    const listened=Math.max(0,time-start);
    let percent=span>0?Math.min(100,Math.max(0,listened/span*100)):0;
    let completed=false;
    if(span>0){
      const remaining=end-time;
      completed=percent>=90||remaining<=Math.min(120,Math.max(5,span*.1));
    }
    if(ended)completed=true;
    if(completed)percent=100;
    return {start,end,listened,percent,completed};
  }
  function saveActive(force=false,ended=false){
    if(!active)return;
    const audio=document.querySelector('.vedator-audio-card audio');
    const item=currentItem();
    if(!audio||!item||audio.readyState===0)return;
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:0;
    const time=ended&&duration>0?duration:Number(audio.currentTime)||0;
    const second=Math.floor(time);
    if(!force&&lastSavedSecond>=0&&Math.abs(second-lastSavedSecond)<5)return;
    const result=calculateProgress(item,time,duration,ended);
    if(result.listened<HEARD_AFTER&&!result.completed)return;
    lastSavedSecond=second;
    const collection=ensureCollection(active);
    const previous=collection.items[item.id]||{};
    collection.items[item.id]={
      title:item.title,
      currentTime:time,
      duration,
      start:result.start,
      end:result.end||null,
      percent:Math.max(Number(previous.percent)||0,result.percent),
      completed:Boolean(previous.completed)||result.completed,
      updatedAt:Date.now()
    };
    collection.label=active.label;
    collection.lastItemId=item.id;
    collection.updatedAt=Date.now();
    persist();
    scheduleDecorate();
  }

  function refreshActive(){
    if(!active)return null;
    const currentId=currentItem()?.id;
    const fresh=findContext(active.type,active.id);
    if(!fresh)return active;
    const index=fresh.items.findIndex(item=>item.id===currentId);
    fresh.index=index>=0?index:Math.min(active.index,fresh.items.length-1);
    active=fresh;
    return active;
  }
  function navigate(delta){
    const context=refreshActive();
    if(!context)return;
    saveActive(true,false);
    const nextIndex=context.index+delta;
    if(nextIndex<0||nextIndex>=context.items.length){syncNavigationButtons();return}
    const target=context.items[nextIndex].element;
    if(target?.isConnected)target.click();
  }
  function syncNavigationButtons(){
    if(!active)return;
    const previous=document.querySelector('.vedator-custom-btn.prev');
    const next=document.querySelector('.vedator-custom-btn.next');
    const previousDisabled=active.index<=0;
    const nextDisabled=active.index>=active.items.length-1;
    if(previous&&previous.disabled!==previousDisabled)previous.disabled=previousDisabled;
    if(next&&next.disabled!==nextDisabled)next.disabled=nextDisabled;
  }

  function heardRecord(record){return record&&(record.completed||Number(record.percent)>0||Number(record.currentTime)>Number(record.start||0)+HEARD_AFTER)}
  function targetAction(context){
    const collection=collectionRecord(context);
    if(!collection)return {index:0,label:context.type==='series'?'Začít sérii':'Začít playlist'};
    const records=collection.items||{};
    let lastIndex=context.items.findIndex(item=>item.id===collection.lastItemId);
    if(lastIndex>=0&&!records[context.items[lastIndex].id]?.completed)return {index:lastIndex,label:context.type==='series'?'Pokračovat v sérii':'Pokračovat v playlistu'};
    if(lastIndex<0)lastIndex=-1;
    for(let index=lastIndex+1;index<context.items.length;index++)if(!records[context.items[index].id]?.completed)return {index,label:context.type==='series'?'Pokračovat v sérii':'Pokračovat v playlistu'};
    for(let index=0;index<context.items.length;index++)if(!records[context.items[index].id]?.completed)return {index,label:context.type==='series'?'Pokračovat v sérii':'Pokračovat v playlistu'};
    return {index:0,label:context.type==='series'?'Přehrát sérii znovu':'Přehrát playlist znovu'};
  }
  function clearProgressClasses(node){
    node?.classList.remove('vedator-collection-progress-text','vedator-collection-complete-text');
    node?.style.removeProperty('--vedator-progress');
  }
  function applyProgress(nodes,record){
    nodes.filter(Boolean).forEach(clearProgressClasses);
    if(!heardRecord(record))return;
    if(record.completed){
      nodes.filter(Boolean).forEach(node=>node.classList.add('vedator-collection-complete-text'));
      return;
    }
    const percent=Math.max(1,Math.min(99,Math.round(Number(record.percent)||0)));
    nodes.filter(Boolean).forEach(node=>{
      node.classList.add('vedator-collection-progress-text');
      node.style.setProperty('--vedator-progress',`${percent}%`);
    });
  }
  function seriesTitleNodes(link){
    const person=link.querySelector('.person-name');
    const episode=link.querySelector('.episode-title');
    if(person||episode)return [person,episode].filter(Boolean);
    let title=link.querySelector(':scope > .vedator-collection-item-title');
    if(!title){
      title=document.createElement('span');
      title.className='vedator-collection-item-title';
      title.textContent=link.textContent;
      link.textContent='';
      link.appendChild(title);
    }
    return [title];
  }
  function ensureControls(context){
    const body=context.card.querySelector(context.type==='series'?'.series-body':'.vedator-playlist-body');
    if(!body)return;
    let controls=body.querySelector(':scope > .vedator-collection-controls');
    if(!controls){
      controls=document.createElement('div');
      controls.className='vedator-collection-controls';
      const button=document.createElement('button');
      button.type='button';
      button.className='vedator-collection-continue';
      controls.appendChild(button);
      body.prepend(controls);
    }
    const action=targetAction(context);
    const button=controls.querySelector('.vedator-collection-continue');
    button.textContent=action.label;
    button.dataset.collectionId=context.id;
    button.dataset.collectionType=context.type;
    button.dataset.targetIndex=String(action.index);
  }
  function decorateContext(context){
    if(!context)return;
    const collection=collectionRecord(context);
    const records=collection?.items||{};
    const title=context.type==='series'?context.card.querySelector('summary span'):context.card.querySelector('.vedator-playlist-title');
    title?.classList.remove('vedator-collection-title-active','vedator-collection-title-complete');
    const heard=context.items.filter(item=>heardRecord(records[item.id]));
    const allComplete=context.items.length>0&&context.items.every(item=>records[item.id]?.completed);
    if(allComplete)title?.classList.add('vedator-collection-title-complete');
    else if(heard.length)title?.classList.add('vedator-collection-title-active');
    for(const item of context.items){
      const nodes=context.type==='series'?seriesTitleNodes(item.element):[item.element.querySelector('b')];
      applyProgress(nodes,records[item.id]);
    }
    ensureControls(context);
  }
  function decorateAll(){
    decorateScheduled=false;
    document.querySelectorAll('#series .series-card').forEach(card=>decorateContext(buildSeriesContext(card)));
    document.querySelectorAll('.vedator-playlist-list .vedator-playlist-card').forEach(card=>decorateContext(buildPlaylistContext(card)));
    syncNavigationButtons();
  }
  function scheduleDecorate(){
    if(decorateScheduled)return;
    decorateScheduled=true;
    requestAnimationFrame(decorateAll);
  }

  function handleContinue(button,event){
    event.preventDefault();
    event.stopImmediatePropagation();
    const type=button.dataset.collectionType;
    const id=button.dataset.collectionId;
    const context=findContext(type,id);
    if(!context)return;
    const index=Math.max(0,Math.min(Number(button.dataset.targetIndex)||0,context.items.length-1));
    context.items[index].element?.click();
  }
  function handlePlaylistItem(button,event){
    const context=buildPlaylistContext(button);
    if(!context)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const item=beginContext(context,context.index);
    if(item)openProxy(item);
  }
  function handleSeriesItem(link){
    const context=buildSeriesContext(link);
    if(context)beginContext(context,context.index);
  }
  function handleCustomNavigation(button,event){
    if(!active)return false;
    const delta=button.classList.contains('prev')?-1:1;
    if(event.type==='pointerup'){
      pointerNavigationAt=performance.now();
      event.preventDefault();
      event.stopImmediatePropagation();
      navigate(delta);
      return true;
    }
    if(event.type==='click'){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(performance.now()-pointerNavigationAt>=500)navigate(delta);
      return true;
    }
    return false;
  }

  window.addEventListener('pointerup',event=>{
    const button=event.target.closest?.('.vedator-custom-btn.prev,.vedator-custom-btn.next');
    if(button)handleCustomNavigation(button,event);
  },true);
  window.addEventListener('click',event=>{
    const navigation=event.target.closest?.('.vedator-custom-btn.prev,.vedator-custom-btn.next');
    if(navigation&&handleCustomNavigation(navigation,event))return;
    const continueButton=event.target.closest?.('.vedator-collection-continue');
    if(continueButton){handleContinue(continueButton,event);return}
    const playlistItem=event.target.closest?.('.vedator-playlist-open[data-ref]');
    if(playlistItem){handlePlaylistItem(playlistItem,event);return}
    const seriesItem=event.target.closest?.('#series .series-body a');
    if(seriesItem){handleSeriesItem(seriesItem);return}
    const episodePlay=event.target.closest?.('#episodes article .links .primary');
    if(episodePlay)clearActive();
  },true);

  const audio=()=>document.querySelector('.vedator-audio-card audio');
  function attachAudio(){
    const element=audio();
    if(!element||element.dataset.vedatorCollectionProgressBound==='1')return;
    element.dataset.vedatorCollectionProgressBound='1';
    element.addEventListener('timeupdate',()=>saveActive(false,false));
    element.addEventListener('pause',()=>saveActive(true,false));
    element.addEventListener('seeked',()=>saveActive(true,false));
    element.addEventListener('play',()=>{publishSafePlayerContext();syncNavigationButtons()});
    element.addEventListener('loadedmetadata',()=>{publishSafePlayerContext();syncNavigationButtons()});
    element.addEventListener('ended',()=>{
      if(!active)return;
      saveActive(true,true);
      const context=refreshActive();
      const next=context&&context.index<context.items.length-1?context.items[context.index+1].element:null;
      if(next)setTimeout(()=>next.click(),0);
    });
  }

  const titleNode=document.querySelector('.vedator-audio-card__title');
  if(titleNode)new MutationObserver(()=>{
    if(!active)return;
    const title=titleNode.textContent.trim();
    const context=refreshActive();
    if(!context)return;
    const current=context.items[context.index];
    if(current&&norm(current.title)===norm(title))return;
    const matches=context.items.map((item,index)=>({item,index})).filter(entry=>norm(entry.item.title)===norm(title));
    if(matches.length){
      const forward=matches.find(entry=>entry.index>=context.index);
      context.index=(forward||matches[0]).index;
      active=context;
      syncNavigationButtons();
    }
  }).observe(titleNode,{childList:true,characterData:true,subtree:true});

  new MutationObserver(()=>{
    attachAudio();
    scheduleDecorate();
    syncNavigationButtons();
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});

  window.addEventListener('storage',event=>{
    if(event.key!==STORAGE_KEY)return;
    state=loadState();
    scheduleDecorate();
  });
  window.addEventListener('vedatorcontentchange',scheduleDecorate);
  window.addEventListener('vedatorepisodetranslationsready',scheduleDecorate);
  window.addEventListener('pagehide',()=>saveActive(true,false));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveActive(true,false);else scheduleDecorate()});

  attachAudio();
  scheduleDecorate();
  setTimeout(scheduleDecorate,300);
  setTimeout(scheduleDecorate,1000);
})();