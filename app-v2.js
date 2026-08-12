(()=>{
  if(window.__vedatorV2)return;
  window.__vedatorV2=true;

  const PROGRESS_KEY='vedatorPlaybackProgressV1';
  const PLAYLISTS_KEY='vedator-user-playlists-v1';
  const COLLECTION_KEY='vedatorCollectionProgressV1';
  const OFFLINE_INDEX_KEY='vedatorOfflineAudioIndexV1';
  const OFFLINE_CACHE='vedator-offline-audio-v1';
  const REF_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const LEGACY_FAQ_ORDER=[340,337,332,326,319,313,300,295,289,284,278,272,270,263,257,248,244,226,218,211,203,190,179,170,158,143,133,128,119,112,100,89,82,17,26,35,51,60,69,75,138,346];

  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const fmtDate=v=>{try{return new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'numeric',year:'numeric'}).format(new Date(v))}catch{return String(v||'')}};
  const fmtTime=value=>{
    const total=Math.max(0,Math.floor(Number(value)||0)),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
    return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;
  };
  const readJson=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}};
  const writeJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random().toString(36).slice(2);

  const state={
    data:null,view:'episodes',query:'',
    progress:{},playlists:[],collectionProgress:{},offlineIndex:{},
    legacyQuestions:[],questionRefByKey:new Map(),
    current:null,context:null,lastSavedSecond:-1,
    speed:1,blobUrls:new Map(),editor:null
  };

  function safeProgress(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}
  function safePlaylists(value){return Array.isArray(value)?value:[]}
  function loadUserData(){
    state.progress=safeProgress(readJson(PROGRESS_KEY,{}));
    state.playlists=safePlaylists(readJson(PLAYLISTS_KEY,[]));
    state.collectionProgress=safeProgress(readJson(COLLECTION_KEY,{}));
    state.offlineIndex=safeProgress(readJson(OFFLINE_INDEX_KEY,{}));
  }

  function episodeKey(number){return `episode-${Number(number)||0}`}
  function episodeByNumber(number){return state.data?.episodes?.find(e=>Number(e.number)===Number(number))||null}
  function episodeStatus(number){
    const record=state.progress[episodeKey(number)];
    if(!record)return null;
    if(record.completed)return {kind:'done',label:'✓ Poslechnuto'};
    if(Number(record.currentTime)>10){
      const percent=Number(record.duration)>0?Math.min(100,Math.round(Number(record.currentTime)/Number(record.duration)*100)):0;
      return {kind:'progress',label:`▶ Rozposloucháno${percent?` · ${percent} %`:''}`};
    }
    return null;
  }
  function playLabel(number){
    const record=state.progress[episodeKey(number)];
    if(!record)return'Přehrát';
    if(record.completed)return record.replaying&&Number(record.currentTime)>10?`Pokračovat znovu ${fmtTime(record.currentTime)}`:'Přehrát znovu';
    if(Number(record.currentTime)>10)return`Pokračovat ${fmtTime(record.currentTime)}`;
    return'Přehrát';
  }

  function encodeRef(number){
    const n=Number(number);
    return Number.isInteger(n)&&n>=0&&n<4096?REF_ALPHABET[(n>>6)&63]+REF_ALPHABET[n&63]:'';
  }
  function decodeRef(ref){
    const value=String(ref||'');
    if(value.length!==2)return-1;
    const high=REF_ALPHABET.indexOf(value[0]),low=REF_ALPHABET.indexOf(value[1]);
    return high<0||low<0?-1:(high<<6)|low;
  }
  const isRef=value=>typeof value==='string'&&value.length===2&&decodeRef(value)>=0;
  const epRef=number=>encodeRef(Number(number));
  const qKey=q=>`${Number(q?.episode)||0}:${Number(q?.order)||0}`;
  function buildLegacyQuestionIndex(){
    const byEpisode=new Map();
    for(const question of state.data.questions||[]){
      const episode=Number(question.episode)||0;
      if(!byEpisode.has(episode))byEpisode.set(episode,[]);
      byEpisode.get(episode).push(question);
    }
    for(const list of byEpisode.values())list.sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
    state.legacyQuestions=LEGACY_FAQ_ORDER.flatMap(episode=>byEpisode.get(episode)||[]);
    state.questionRefByKey.clear();
    state.legacyQuestions.forEach((question,index)=>state.questionRefByKey.set(qKey(question),encodeRef(2048+index)));
  }
  const qRef=question=>state.questionRefByKey.get(qKey(question))||'';
  function normalizePlaylistRef(value){
    if(isRef(value))return value;
    const match=state.data.episodes.find(e=>String(e.id||'')===String(value)||String(e.number)===String(value)||String(e.title)===String(value));
    return match?epRef(match.number):'';
  }
  function itemInfo(ref){
    const decoded=decodeRef(ref);
    if(decoded<0)return null;
    if(decoded<2048){
      const episode=episodeByNumber(decoded);
      return episode?{type:'e',ref,episode,title:episode.title,subtitle:`Díl ${episode.number}`,start:0}:null;
    }
    const question=state.legacyQuestions[decoded-2048];
    if(!question)return null;
    const episode=episodeByNumber(question.episode);
    return episode?{type:'q',ref,episode,question,title:question.title,subtitle:`Díl ${question.episode} • ${question.sourceTime||question.time||''}`,start:Number(question.seconds)||0}:null;
  }

  function cardEpisode(e){
    const status=episodeStatus(e.number);
    return `<article class="card searchable" data-episode="${Number(e.number)||0}" data-search="${esc(norm(`${e.number} ${e.title} ${e.description}`))}">
      <div class="meta">Díl ${e.number||'–'} • ${esc(fmtDate(e.date))}</div>
      <h2>${esc(e.title)}</h2>
      <div class="listen-status ${status?.kind||''}">${status?esc(status.label):''}</div>
      <p>${esc(e.description||'')}</p>
      <div class="actions"><button type="button" class="play" data-episode="${Number(e.number)||0}" data-seconds="">${esc(playLabel(e.number))}</button>${e.link?`<a class="secondary" href="${esc(e.link)}">Detail</a>`:''}</div>
    </article>`;
  }

  function cardQuestion(q,label='Díl'){
    const ref=qRef(q);
    return `<article class="card searchable" data-search="${esc(norm(`${q.episode} ${q.title} ${(q.points||[]).join(' ')}`))}">
      <div class="meta">${label} ${q.episode} • ${esc(q.sourceTime||q.time||'')}</div>
      <h2>${esc(q.title)}</h2>
      <ul>${(q.points||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
      <div class="actions"><button type="button" class="play" data-episode="${q.episode}" data-seconds="${Number(q.seconds)||0}" data-ref="${esc(ref)}">Přehrát</button></div>
    </article>`;
  }

  function flattenNonQuestions(data){
    const out=[];
    for(const [episode,languages] of Object.entries(data?.nonquestions?.episodes||{})){
      const items=languages?.cs||languages?.sk||[];
      items.forEach((item,order)=>out.push({episode:Number(episode),order,time:item.time||'0:00',sourceTime:item.time||'0:00',seconds:Number(item.seconds)||parseTime(item.time),title:item.title||`Položka ${order+1}`,points:item.points||[]}));
    }
    return out.sort((a,b)=>b.episode-a.episode||a.order-b.order);
  }
  function parseTime(value){
    const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
    if(!parts)return 0;
    return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
  }

  function renderEpisodes(){
    $('#episodes-v2').innerHTML=state.data.episodes.map(cardEpisode).join('');
    $('#count-v2').textContent=`${state.data.episodes.length} epizod`;
  }
  function refreshEpisodeCard(number){
    const episode=episodeByNumber(number),old=$(`#episodes-v2 article[data-episode="${Number(number)}"]`);
    if(!episode||!old)return;
    const host=document.createElement('div');host.innerHTML=cardEpisode(episode);
    old.replaceWith(host.firstElementChild);
  }

  function seriesContext(series,index){
    const items=series.episodes.map(number=>{
      const episode=episodeByNumber(number);
      return episode?{id:`episode:${episode.number}`,episode,start:0,ref:epRef(episode.number)}:null;
    }).filter(Boolean);
    return {type:'series',id:`series:${norm(series.name)}`,label:series.name,items,index};
  }
  function renderSeries(){
    const byNumber=new Map(state.data.episodes.map(e=>[Number(e.number),e]));
    $('#series-v2').innerHTML=state.data.series.map((series,seriesIndex)=>{
      const eps=series.episodes.map(n=>byNumber.get(Number(n))).filter(Boolean);
      const search=norm(`${series.name} ${eps.map(e=>e.title).join(' ')}`);
      return `<details class="series searchable" data-series-index="${seriesIndex}" data-search="${esc(search)}"><summary><strong>${esc(series.name)}</strong><span>${eps.length} dílů</span></summary><ol>${eps.map((e,index)=>`<li><button type="button" class="series-item" data-series-index="${seriesIndex}" data-item-index="${index}">Díl ${e.number}: ${esc(e.title)}</button></li>`).join('')}</ol></details>`;
    }).join('');
  }
  function renderQuestions(){$('#questions-v2').innerHTML=state.data.questions.map(q=>cardQuestion(q)).join('')}
  function renderNonQuestions(){
    const items=flattenNonQuestions(state.data);
    $('#nonquestions-v2').innerHTML=items.map(q=>cardQuestion(q,'Díl')).join('');
    $('#nonquestions-v2').dataset.count=String(items.length);
  }

  function playlistRefs(playlist){return (Array.isArray(playlist?.items)?playlist.items:[]).map(normalizePlaylistRef).filter(Boolean)}
  function playlistContext(playlist,index){
    const items=playlistRefs(playlist).map(ref=>{
      const info=itemInfo(ref);
      return info?{id:`ref:${ref}`,ref,episode:info.episode,start:info.start||0,question:info.question||null}:null;
    }).filter(Boolean);
    return {type:'playlist',id:`playlist:${playlist.id}`,label:playlist.name||'Playlist',items,index};
  }
  function renderPlaylists(){
    state.playlists=safePlaylists(readJson(PLAYLISTS_KEY,state.playlists));
    const box=$('#playlists-v2');
    if(!state.playlists.length){
      box.innerHTML='<div class="playlist-toolbar"><strong>Moje playlisty</strong><button class="playlist-add" type="button" aria-label="Nový playlist">+</button></div><div class="empty">Zatím nemáte žádný playlist.</div>';
      return;
    }
    box.innerHTML=`<div class="playlist-toolbar"><strong>Moje playlisty</strong><button class="playlist-add" type="button" aria-label="Nový playlist">+</button></div><div class="grid">${state.playlists.map(playlist=>{
      const items=playlistRefs(playlist).map(itemInfo).filter(Boolean);
      const search=norm(`${playlist.name} ${items.map(item=>`${item.title} ${item.subtitle}`).join(' ')}`);
      return `<details class="playlist-card searchable" data-id="${esc(playlist.id)}" data-search="${esc(search)}"><summary><span class="playlist-title">${esc(playlist.name||'Playlist')}</span><span class="playlist-count">${items.length} položek</span><span class="playlist-actions"><button type="button" class="icon-button edit" title="Upravit">✎</button><button type="button" class="icon-button share" title="Sdílet">🔗</button><button type="button" class="icon-button delete" title="Smazat">🗑</button></span></summary><ol class="playlist-items">${items.length?items.map((item,index)=>`<li class="playlist-item"><button type="button" class="playlist-open" data-item-index="${index}" data-ref="${esc(item.ref)}"><b>${esc(item.title)}</b><br><small>${esc(item.subtitle)}</small></button></li>`).join(''):'<li class="empty">Playlist je prázdný.</li>'}</ol></details>`;
    }).join('')}</div>`;
  }

  function renderData(){
    const listened=Object.values(state.progress).filter(x=>x?.completed).length;
    const inProgress=Object.values(state.progress).filter(x=>x&&!x.completed&&Number(x.currentTime)>10).length;
    $('#data-v2').innerHTML=`<div class="data-grid">
      <article class="data-card"><h2>Tvoje data</h2><p>${listened} poslechnutých, ${inProgress} rozposlouchaných epizod a ${state.playlists.length} playlistů.</p><div class="data-actions"><button class="primary-button data-export" type="button">Stáhnout zálohu</button><button class="secondary-button data-import" type="button">Načíst zálohu</button></div><p class="data-note">V2 používá stejné formáty dat jako původní aplikace. Při samotném otevření této stránky se stará data nepřepisují ani nepřevádějí.</p></article>
      <article class="data-card"><h2>Smazání dat</h2><p>Odstraní data Vedátoru uložená v tomto zařízení včetně offline kopií.</p><button class="danger-button data-clear" type="button">Smazat veškerá data</button><p class="data-note">Tato akce proběhne pouze po dalším výslovném potvrzení.</p></article>
    </div>`;
  }

  function setView(view){
    state.view=view;
    $$('.tab-v2').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    $$('.view-v2').forEach(v=>v.classList.toggle('hidden',v.dataset.view!==view));
    if(view==='playlists')renderPlaylists();
    if(view==='data'){loadUserData();renderData()}
    filterActive();
  }
  function filterActive(){
    const q=norm(state.query.trim()),active=$(`.view-v2[data-view="${state.view}"]`);
    if(!active)return;
    const cards=[...active.querySelectorAll('.searchable')];
    let shown=0;
    cards.forEach(card=>{
      const ok=!q||String(card.dataset.search||'').includes(q);
      card.classList.toggle('filtered-out',!ok);
      if(ok)shown++;
    });
    if(state.view==='episodes')$('#count-v2').textContent=q?`${shown} nalezených epizod`:`${state.data.episodes.length} epizod`;
    else if(state.view==='questions')$('#count-v2').textContent=q?`${shown} nalezených otázek`:`${state.data.questions.length} otázek`;
    else if(state.view==='nonquestions')$('#count-v2').textContent=q?`${shown} nalezených položek`:`${active.dataset.count||shown} neotázek`;
    else if(state.view==='series')$('#count-v2').textContent=q?`${shown} nalezených sérií`:`${state.data.series.length} sérií`;
    else if(state.view==='playlists')$('#count-v2').textContent=q?`${shown} nalezených playlistů`:`${state.playlists.length} playlistů`;
    else $('#count-v2').textContent='Lokální data';
  }

  function currentOfflineRecord(){
    const key=state.current?episodeKey(state.current.episode.number):'';
    return key?state.offlineIndex[key]||null:null;
  }
  async function offlineBlobUrl(record){
    if(!record?.cacheUrl||!('caches'in window))return'';
    if(state.blobUrls.has(record.key))return state.blobUrls.get(record.key);
    const cache=await caches.open(OFFLINE_CACHE),response=await cache.match(record.cacheUrl);
    if(!response)return'';
    const url=URL.createObjectURL(await response.blob());
    state.blobUrls.set(record.key,url);
    return url;
  }
  async function playbackUrl(episode){
    const record=state.offlineIndex[episodeKey(episode.number)];
    if(record){
      try{
        const blob=await offlineBlobUrl(record);
        if(blob)return blob;
      }catch{}
    }
    return episode.enclosure;
  }

  function playerNodes(){
    return{
      shell:$('#player-v2'),audio:$('#audio-v2'),title:$('#player-title-v2'),sub:$('#player-sub-v2'),
      play:$('#player-play-v2'),prev:$('#player-prev-v2'),next:$('#player-next-v2'),speed:$('#player-speed-v2'),
      seek:$('#player-seek-v2'),current:$('#player-current-v2'),duration:$('#player-duration-v2'),
      help:$('#player-help-v2'),download:$('#player-download-v2'),offline:$('#player-offline-v2')
    };
  }
  function syncPlayer(){
    const n=playerNodes(),audio=n.audio,current=state.current;
    if(!current){n.shell.classList.add('hidden');return}
    n.shell.classList.remove('hidden');
    n.title.textContent=current.episode.title;
    n.sub.textContent=state.context?`${state.context.type==='series'?'Série':'Playlist'}: ${state.context.label}`:`Díl ${current.episode.number}`;
    n.play.textContent=audio.paused?'Přehrát':'Pauza';
    n.speed.textContent=`${String(state.speed).replace('.',',')}×`;
    n.prev.disabled=!state.context||state.context.index<=0;
    n.next.disabled=!state.context||state.context.index>=state.context.items.length-1;
    n.download.href=current.episode.enclosure||'#';
    n.offline.textContent=currentOfflineRecord()?'✓ Offline':'📱 Offline';
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:0,time=Number.isFinite(audio.currentTime)?audio.currentTime:0;
    n.seek.max=String(Math.max(1,Math.floor(duration||1)));
    if(document.activeElement!==n.seek)n.seek.value=String(Math.min(Number(n.seek.max),Math.max(0,Math.floor(time))));
    n.current.textContent=fmtTime(n.seek.value);
    n.duration.textContent=duration?fmtTime(duration):'–:––';
  }
  function saveCollectionProgress(time,duration,completed){
    const context=state.context,item=context?.items?.[context.index];
    if(!context||!item)return;
    const collection=state.collectionProgress[context.id]&&typeof state.collectionProgress[context.id]==='object'?state.collectionProgress[context.id]:{type:context.type,label:context.label,lastItemId:'',updatedAt:0,items:{}};
    collection.items=collection.items&&typeof collection.items==='object'?collection.items:{};
    const start=Math.max(0,Number(item.start)||0),end=duration>start?duration:0,span=end>start?end-start:0;
    const percent=completed?100:(span?Math.max(0,Math.min(100,(time-start)/span*100)):0);
    const id=item.id;
    const previous=collection.items[id]||{};
    collection.items[id]={title:item.question?.title||item.episode.title,currentTime:time,duration,start,end:end||null,percent:Math.max(Number(previous.percent)||0,percent),completed:Boolean(previous.completed)||completed,updatedAt:Date.now()};
    collection.lastItemId=id;collection.label=context.label;collection.type=context.type;collection.updatedAt=Date.now();
    state.collectionProgress[context.id]=collection;
    writeJson(COLLECTION_KEY,state.collectionProgress);
  }
  function saveProgress(force=false,ended=false){
    const n=playerNodes(),audio=n.audio,current=state.current;
    if(!current||audio.readyState===0)return;
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Number(state.progress[current.key]?.duration)||0;
    const time=ended&&duration>0?duration:Number(audio.currentTime)||0;
    const second=Math.floor(time);
    if(!force&&state.lastSavedSecond>=0&&Math.abs(second-state.lastSavedSecond)<5)return;
    state.lastSavedSecond=second;
    const previous=state.progress[current.key]||{};
    const completed=Boolean(previous.completed)||(ended||(duration>0&&(time/duration>=.9||duration-time<=120)));
    state.progress[current.key]={currentTime:time,duration,completed,replaying:Boolean(previous.completed)&&!ended,title:current.episode.title,updatedAt:Date.now()};
    writeJson(PROGRESS_KEY,state.progress);
    saveCollectionProgress(time,duration,completed);
    refreshEpisodeCard(current.episode.number);
  }

  async function openPlayback(episode,{start=null,context=null,itemRef=''}={}){
    if(!episode?.enclosure)return;
    saveProgress(true,false);
    const n=playerNodes(),audio=n.audio,key=episodeKey(episode.number),record=state.progress[key]||{};
    state.context=context;
    let target=start;
    if(target===null&&Number(record.currentTime)>10&&(!record.completed||record.replaying))target=Number(record.currentTime);
    if(target===null&&record.completed){
      state.progress[key]={...record,currentTime:0,replaying:true,updatedAt:Date.now()};
      writeJson(PROGRESS_KEY,state.progress);
      target=0;
    }
    state.current={episode,key,itemRef:itemRef||epRef(episode.number)};
    state.lastSavedSecond=-1;
    audio.pause();
    audio.src=await playbackUrl(episode);
    audio.playbackRate=state.speed;
    n.help.textContent=target>0?`Načítám od ${fmtTime(target)}…`:'Pozice se průběžně ukládá do tohoto zařízení.';
    const onMetadata=()=>{
      if(state.current?.key!==key)return;
      if(Number.isFinite(target)&&target>0){
        try{audio.currentTime=Math.min(target,Math.max(0,(audio.duration||target)-1))}catch{}
      }
      syncPlayer();
      audio.play().catch(()=>{n.help.textContent=target>0?`Pozice ${fmtTime(target)} je připravená. Klepněte na Přehrát.`:'Klepněte na Přehrát.'});
    };
    audio.addEventListener('loadedmetadata',onMetadata,{once:true});
    audio.load();
    n.shell.classList.remove('hidden');
    syncPlayer();
    audio.play().catch(()=>{});
  }
  function closePlayer(){
    saveProgress(true,false);
    const n=playerNodes();n.audio.pause();n.audio.removeAttribute('src');n.audio.load();
    state.current=null;state.context=null;n.shell.classList.add('hidden');
  }
  function navigateContext(delta){
    const context=state.context;
    if(!context)return;
    const index=context.index+delta;
    if(index<0||index>=context.items.length)return;
    const next={...context,index},item=next.items[index];
    openPlayback(item.episode,{start:item.start||0,context:next,itemRef:item.ref||epRef(item.episode.number)});
  }
  function changeSpeed(){
    const speeds=[1,1.25,1.5,1.75,2,.75],i=speeds.indexOf(state.speed);
    state.speed=speeds[(i+1)%speeds.length];
    playerNodes().audio.playbackRate=state.speed;syncPlayer();
  }

  function playlistEditorHtml(){
    const editor=state.editor,mode=editor.mode,q=norm(editor.query),selected=new Set(editor.draft);
    const draftRows=editor.draft.map((ref,index)=>{
      const item=itemInfo(ref);if(!item)return'';
      return `<div class="editor-row" data-ref="${esc(ref)}"><span class="editor-move"><button type="button" class="move-up" ${index?'':'disabled'}>▲</button><button type="button" class="move-down" ${index===editor.draft.length-1?'disabled':''}>▼</button></span><span><b>${esc(item.title)}</b><br><small>${esc(item.subtitle)}</small></span><button type="button" class="editor-remove">✕</button></div>`;
    }).join('')||'<div class="empty">Playlist je prázdný.</div>';
    let source;
    if(mode==='e')source=state.data.episodes.map(e=>({ref:epRef(e.number),title:e.title,sub:`Díl ${e.number}`,search:`${e.number} ${e.title} ${e.description||''}`}));
    else source=state.legacyQuestions.map(question=>({ref:qRef(question),title:question.title,sub:`Díl ${question.episode} • ${question.sourceTime||question.time}`,search:`${question.episode} ${question.title} ${(question.points||[]).join(' ')}`}));
    source=source.filter(x=>!q||norm(x.search).includes(q)).slice(0,350);
    return `<div class="modal-box"><div class="modal-head"><strong>Upravit playlist</strong><button type="button" class="icon-button editor-close">✕</button></div><div class="modal-body"><div class="editor-switch"><button type="button" data-mode="e" class="${mode==='e'?'active':''}">Epizody</button><button type="button" data-mode="q" class="${mode==='q'?'active':''}">Otázky</button></div><div class="editor-columns"><section><h3>Přidané položky</h3><div class="editor-list draft-list">${draftRows}</div></section><section><h3>${mode==='e'?'Přidat epizody':'Přidat otázky'}</h3><input class="modal-search editor-search" value="${esc(editor.query)}" placeholder="Hledat…"><div class="editor-list source-list">${source.map(x=>`<label class="editor-choice" data-ref="${esc(x.ref)}"><input type="checkbox" ${selected.has(x.ref)?'checked':''}><span><b>${esc(x.title)}</b><br><small>${esc(x.sub)}</small></span></label>`).join('')||'<div class="empty">Nic nenalezeno.</div>'}</div></section></div></div><div class="modal-foot"><button type="button" class="secondary-button editor-cancel">Zrušit</button><button type="button" class="primary-button editor-save">Uložit</button></div></div>`;
  }
  function openPlaylistEditor(id){
    const playlist=state.playlists.find(p=>String(p.id)===String(id));if(!playlist)return;
    state.editor={id:String(id),draft:playlistRefs(playlist),mode:'e',query:''};
    const modal=$('#playlist-editor-v2');modal.innerHTML=playlistEditorHtml();modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
  }
  function closePlaylistEditor(){
    state.editor=null;const modal=$('#playlist-editor-v2');modal.classList.add('hidden');modal.innerHTML='';modal.setAttribute('aria-hidden','true');
  }
  function rerenderEditor(){
    const modal=$('#playlist-editor-v2');if(!state.editor)return;modal.innerHTML=playlistEditorHtml();
  }
  function savePlaylistEditor(){
    const index=state.playlists.findIndex(p=>String(p.id)===String(state.editor?.id));
    if(index>=0){state.playlists[index]={...state.playlists[index],items:[...state.editor.draft]};writeJson(PLAYLISTS_KEY,state.playlists)}
    closePlaylistEditor();renderPlaylists();
  }
  function newPlaylist(){
    const name=prompt('Název nového playlistu:')?.trim();if(!name)return;
    if(state.playlists.some(p=>norm(p.name)===norm(name)))return alert('Playlist s tímto názvem už existuje.');
    const playlist={id:uid(),name,items:[]};state.playlists.push(playlist);writeJson(PLAYLISTS_KEY,state.playlists);renderPlaylists();openPlaylistEditor(playlist.id);
  }

  function b64e(text){
    const bytes=new TextEncoder().encode(text);let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function b64d(text){
    let value=String(text).replace(/-/g,'+').replace(/_/g,'/');while(value.length%4)value+='=';
    return new TextDecoder().decode(Uint8Array.from(atob(value),c=>c.charCodeAt(0)));
  }
  async function sharePlaylist(playlist){
    const items=playlistRefs(playlist).join(''),payload=b64e(JSON.stringify({v:3,n:playlist.name,x:items})),url=new URL(location.href);
    url.hash=`playlist=${payload}`;
    try{
      if(navigator.share)await navigator.share({url:url.href});
      else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url.href);alert('Odkaz byl zkopírován.')}
      else prompt('Zkopírujte odkaz:',url.href);
    }catch(error){if(error?.name!=='AbortError')prompt('Zkopírujte odkaz:',url.href)}
  }
  function importSharedPlaylist(){
    const match=location.hash.match(/(?:^#|&)playlist=([^&]+)/);if(!match)return;
    try{
      const data=JSON.parse(b64d(match[1]));let items=[];
      if(data?.v===3&&typeof data.x==='string'&&data.x.length%2===0)for(let i=0;i<data.x.length;i+=2)items.push(data.x.slice(i,i+2));
      else if(data?.v===2&&typeof data.e==='string')for(let i=0;i<data.e.length;i+=2)items.push(data.e.slice(i,i+2));
      else if(Array.isArray(data?.i))items=data.i.map(normalizePlaylistRef).filter(Boolean);
      else return;
      const base=String(data.n||'Sdílený playlist').trim();
      if(!confirm(`Uložit sdílený playlist „${base}“?`))return;
      let name=base,n=2;while(state.playlists.some(p=>norm(p.name)===norm(name)))name=`${base} (${n++})`;
      state.playlists.push({id:uid(),name,items});writeJson(PLAYLISTS_KEY,state.playlists);
      history.replaceState(null,'',location.pathname+location.search);setView('playlists');
    }catch(error){console.warn('Neplatný playlistový odkaz',error)}
  }

  function openPlaylistPicker(){
    if(!state.current)return;
    const ref=state.current.itemRef||epRef(state.current.episode.number),modal=$('#playlist-picker-v2');
    modal.innerHTML=`<div class="modal-box" style="width:min(480px,100%)"><div class="modal-head"><strong>Přidat do playlistu</strong><button type="button" class="icon-button picker-close">✕</button></div><div class="modal-body picker-list">${state.playlists.length?state.playlists.map(p=>`<label class="picker-row"><input type="checkbox" data-id="${esc(p.id)}" ${playlistRefs(p).includes(ref)?'checked':''}><span>${esc(p.name)}</span></label>`).join(''):'<div class="empty">Zatím nemáte žádný playlist.</div>'}</div><div class="modal-foot"><button type="button" class="secondary-button picker-new">＋ Nový playlist</button><button type="button" class="secondary-button picker-cancel">Zrušit</button><button type="button" class="primary-button picker-save">Uložit</button></div></div>`;
    modal.dataset.ref=ref;modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
  }
  function closePlaylistPicker(){
    const modal=$('#playlist-picker-v2');modal.classList.add('hidden');modal.innerHTML='';delete modal.dataset.ref;modal.setAttribute('aria-hidden','true');
  }
  function savePlaylistPicker(){
    const modal=$('#playlist-picker-v2'),ref=modal.dataset.ref;if(!ref)return closePlaylistPicker();
    const chosen=new Set([...modal.querySelectorAll('input[data-id]:checked')].map(input=>String(input.dataset.id)));
    for(const playlist of state.playlists){
      let items=playlistRefs(playlist).filter(item=>item!==ref);
      if(chosen.has(String(playlist.id)))items.push(ref);
      playlist.items=items;
    }
    writeJson(PLAYLISTS_KEY,state.playlists);closePlaylistPicker();if(state.view==='playlists')renderPlaylists();
  }

  async function toggleOffline(){
    const current=state.current;if(!current)return;
    const key=episodeKey(current.episode.number),record=state.offlineIndex[key],n=playerNodes();
    if(record){
      if(!confirm('Smazat offline kopii této epizody?'))return;
      try{
        const cache=await caches.open(OFFLINE_CACHE);await cache.delete(record.cacheUrl);
        const blobUrl=state.blobUrls.get(key);if(blobUrl)URL.revokeObjectURL(blobUrl);state.blobUrls.delete(key);
        delete state.offlineIndex[key];writeJson(OFFLINE_INDEX_KEY,state.offlineIndex);n.help.textContent='Offline kopie byla smazána.';
      }catch{n.help.textContent='Offline kopii se nepodařilo smazat.'}
      syncPlayer();return;
    }
    if(!('caches'in window)){n.help.textContent='Offline ukládání tento prohlížeč nepodporuje.';return}
    const url=current.episode.enclosure;if(!url)return;
    n.offline.disabled=true;n.help.textContent='Ukládám epizodu offline…';
    try{
      try{await navigator.storage?.persist?.()}catch{}
      const response=await fetch(url,{mode:'cors',cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const blob=await response.blob(),cacheUrl=new URL(`./__vedator_offline_audio__/${encodeURIComponent(key)}.mp3`,location.href).href,cache=await caches.open(OFFLINE_CACHE);
      await cache.put(cacheUrl,new Response(blob,{status:200,headers:{'Content-Type':response.headers.get('content-type')||blob.type||'audio/mpeg','Content-Length':String(blob.size),'Accept-Ranges':'bytes','X-Vedator-Original-Url':url}}));
      state.offlineIndex[key]={key,title:current.episode.title,number:Number(current.episode.number),originalUrl:url,cacheUrl,size:blob.size,type:blob.type||'audio/mpeg',savedAt:Date.now()};
      writeJson(OFFLINE_INDEX_KEY,state.offlineIndex);n.help.textContent=`Epizoda je uložená offline (${(blob.size/1048576).toFixed(1).replace('.',',')} MB).`;
    }catch(error){console.warn(error);n.help.textContent='Offline uložení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.'}
    finally{n.offline.disabled=false;syncPlayer()}
  }

  function exportData(){
    const payload={app:'vedator',formatVersion:1,exportedAt:new Date().toISOString(),data:{playbackProgress:safeProgress(readJson(PROGRESS_KEY,{})),playlists:safePlaylists(readJson(PLAYLISTS_KEY,[]))}};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`vedator-zaloha-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function validateBackup(value){
    if(!value||typeof value!=='object'||value.app!=='vedator'||value.formatVersion!==1)throw new Error('Tento soubor není podporovaná záloha Vedátoru.');
    if(!value.data||typeof value.data!=='object'||!value.data.playbackProgress||typeof value.data.playbackProgress!=='object'||Array.isArray(value.data.playbackProgress)||!Array.isArray(value.data.playlists))throw new Error('Záloha nemá platná data.');
    return value.data;
  }
  async function importBackup(file){
    try{
      const data=validateBackup(JSON.parse(await file.text())),progressCount=Object.keys(data.playbackProgress).length,playlistCount=data.playlists.length;
      if(!confirm(`Načíst zálohu s ${progressCount} epizodami a ${playlistCount} playlisty?\n\nSoučasný průběh poslechu a playlisty budou nahrazeny.`))return;
      writeJson(PROGRESS_KEY,data.playbackProgress);writeJson(PLAYLISTS_KEY,data.playlists);loadUserData();renderEpisodes();renderPlaylists();renderData();
      $('#status-v2').textContent='Záloha byla načtena.';
    }catch(error){$('#status-v2').textContent=error instanceof SyntaxError?'Soubor není platný JSON.':error.message;$('#status-v2').classList.add('error')}
    finally{$('#data-file-v2').value=''}
  }
  async function clearAllData(){
    if(!confirm('Opravdu chcete smazat veškerá data aplikace Vedátor v tomto zařízení?\n\nTuto akci nelze vrátit zpět.'))return;
    closePlayer();
    try{
      const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.toLowerCase().startsWith('vedator'))keys.push(key)}
      keys.forEach(key=>localStorage.removeItem(key));
    }catch{}
    try{
      const keys=[];for(let i=0;i<sessionStorage.length;i++){const key=sessionStorage.key(i);if(key?.toLowerCase().startsWith('vedator'))keys.push(key)}
      keys.forEach(key=>sessionStorage.removeItem(key));
    }catch{}
    try{await caches.delete(OFFLINE_CACHE)}catch{}
    loadUserData();renderEpisodes();renderPlaylists();renderData();$('#status-v2').textContent='Veškerá data aplikace byla smazána.';
  }

  function bind(){
    $$('.tab-v2').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $('#search-v2').addEventListener('input',event=>{state.query=event.target.value;filterActive()});
    document.addEventListener('click',event=>{
      const play=event.target.closest?.('.play');
      if(play){
        const episode=episodeByNumber(Number(play.dataset.episode)),seconds=play.dataset.seconds===''?null:Number(play.dataset.seconds)||0;
        if(episode)openPlayback(episode,{start:seconds,itemRef:play.dataset.ref||epRef(episode.number)});
        return;
      }
      const seriesItem=event.target.closest?.('.series-item');
      if(seriesItem){
        const series=state.data.series[Number(seriesItem.dataset.seriesIndex)],index=Number(seriesItem.dataset.itemIndex)||0,context=seriesContext(series,index),item=context.items[index];
        if(item)openPlayback(item.episode,{start:item.start,context,itemRef:item.ref});
        return;
      }
      if(event.target.closest?.('.playlist-add'))return newPlaylist();
      const playlistCard=event.target.closest?.('.playlist-card');
      if(playlistCard){
        const playlist=state.playlists.find(p=>String(p.id)===String(playlistCard.dataset.id));if(!playlist)return;
        if(event.target.closest('.edit')){event.preventDefault();openPlaylistEditor(playlist.id);return}
        if(event.target.closest('.share')){event.preventDefault();sharePlaylist(playlist);return}
        if(event.target.closest('.delete')){event.preventDefault();if(confirm(`Smazat playlist „${playlist.name}“?`)){state.playlists=state.playlists.filter(p=>String(p.id)!==String(playlist.id));writeJson(PLAYLISTS_KEY,state.playlists);renderPlaylists()}return}
        const itemButton=event.target.closest('.playlist-open');
        if(itemButton){
          event.preventDefault();const index=Number(itemButton.dataset.itemIndex)||0,context=playlistContext(playlist,index),item=context.items[index];
          if(item)openPlayback(item.episode,{start:item.start,context,itemRef:item.ref});
          return;
        }
      }
      if(event.target.closest?.('.data-export'))return exportData();
      if(event.target.closest?.('.data-import'))return $('#data-file-v2').click();
      if(event.target.closest?.('.data-clear'))return clearAllData();
    });

    const editorModal=$('#playlist-editor-v2');
    editorModal.addEventListener('click',event=>{
      if(event.target===editorModal||event.target.closest('.editor-close')||event.target.closest('.editor-cancel'))return closePlaylistEditor();
      if(!state.editor)return;
      const mode=event.target.closest('[data-mode]');if(mode){state.editor.mode=mode.dataset.mode;state.editor.query='';rerenderEditor();return}
      const row=event.target.closest('.editor-row[data-ref]');
      if(row){
        const index=state.editor.draft.indexOf(row.dataset.ref);if(index<0)return;
        if(event.target.closest('.editor-remove'))state.editor.draft.splice(index,1);
        else if(event.target.closest('.move-up')&&index>0)[state.editor.draft[index-1],state.editor.draft[index]]=[state.editor.draft[index],state.editor.draft[index-1]];
        else if(event.target.closest('.move-down')&&index<state.editor.draft.length-1)[state.editor.draft[index+1],state.editor.draft[index]]=[state.editor.draft[index],state.editor.draft[index+1]];
        rerenderEditor();return;
      }
      if(event.target.closest('.editor-save'))return savePlaylistEditor();
    });
    editorModal.addEventListener('input',event=>{if(event.target.matches('.editor-search')&&state.editor){state.editor.query=event.target.value;rerenderEditor()}});
    editorModal.addEventListener('change',event=>{
      const choice=event.target.closest('.editor-choice[data-ref]');if(!choice||!state.editor)return;
      const ref=choice.dataset.ref;
      if(event.target.checked){if(!state.editor.draft.includes(ref))state.editor.draft.push(ref)}
      else state.editor.draft=state.editor.draft.filter(item=>item!==ref);
      rerenderEditor();
    });

    const picker=$('#playlist-picker-v2');
    picker.addEventListener('click',event=>{
      if(event.target===picker||event.target.closest('.picker-close')||event.target.closest('.picker-cancel'))return closePlaylistPicker();
      if(event.target.closest('.picker-save'))return savePlaylistPicker();
      if(event.target.closest('.picker-new')){closePlaylistPicker();newPlaylist()}
    });

    const n=playerNodes();
    n.play.addEventListener('click',()=>{if(n.audio.paused)n.audio.play().catch(()=>{});else n.audio.pause();syncPlayer()});
    n.prev.addEventListener('click',()=>navigateContext(-1));n.next.addEventListener('click',()=>navigateContext(1));
    n.speed.addEventListener('click',changeSpeed);$('#player-playlist-v2').addEventListener('click',openPlaylistPicker);
    n.offline.addEventListener('click',toggleOffline);$('#player-close-v2').addEventListener('click',closePlayer);
    n.seek.addEventListener('input',()=>{n.current.textContent=fmtTime(n.seek.value)});
    n.seek.addEventListener('change',()=>{if(state.current){try{n.audio.currentTime=Number(n.seek.value)||0}catch{}saveProgress(true,false)}});
    n.audio.addEventListener('play',syncPlayer);n.audio.addEventListener('pause',()=>{saveProgress(true,false);syncPlayer()});
    n.audio.addEventListener('timeupdate',()=>{syncPlayer();saveProgress(false,false)});
    n.audio.addEventListener('durationchange',syncPlayer);n.audio.addEventListener('loadeddata',syncPlayer);
    n.audio.addEventListener('ended',()=>{saveProgress(true,true);syncPlayer()});
    window.addEventListener('pagehide',()=>saveProgress(true,false));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)saveProgress(true,false)});
    $('#data-file-v2').addEventListener('change',()=>{const file=$('#data-file-v2').files?.[0];if(file)importBackup(file)});
  }

  async function start(){
    const status=$('#status-v2');
    try{
      const response=await fetch('./content-v2.json',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      state.data=await response.json();
      buildLegacyQuestionIndex();
      loadUserData();
      renderEpisodes();renderSeries();renderQuestions();renderNonQuestions();renderPlaylists();renderData();
      bind();setView('episodes');
      status.textContent=`V2 načtena: ${state.data.episodes.length} epizod, ${state.data.questions.length} otázek.`;
      document.documentElement.dataset.vedatorV2Ready='1';
      window.dispatchEvent(new CustomEvent('vedator-v2-ready',{detail:{episodes:state.data.episodes.length,questions:state.data.questions.length,playlists:state.playlists.length}}));
      setTimeout(importSharedPlaylist,0);
    }catch(error){
      status.textContent=`V2 se nepodařilo načíst: ${error.message}`;status.classList.add('error');console.error(error);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();