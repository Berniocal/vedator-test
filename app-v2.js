(()=>{
  if(window.__vedatorV2)return;
  window.__vedatorV2=true;

  const PROGRESS_KEY='vedatorPlaybackProgressV1';
  const PLAYLISTS_KEY='vedator-user-playlists-v1';
  const COLLECTION_KEY='vedatorCollectionProgressV1';
  const OFFLINE_INDEX_KEY='vedatorOfflineAudioIndexV1';
  const LANGUAGE_KEY='vedator-ui-language-v1';
  const OFFLINE_CACHE='vedator-offline-audio-v1';
  const REF_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const LEGACY_FAQ_ORDER=[340,337,332,326,319,313,300,295,289,284,278,272,270,263,257,248,244,226,218,211,203,190,179,170,158,143,133,128,119,112,100,89,82,17,26,35,51,60,69,75,138,346];

  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const readJson=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}};
  const writeJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random().toString(36).slice(2);
  const initialLanguage=()=>{try{return localStorage.getItem(LANGUAGE_KEY)==='cz'?'cz':'sk'}catch{return'sk'}};

  const state={
    data:null,view:'episodes',query:'',language:initialLanguage(),
    progress:{},playlists:[],collectionProgress:{},offlineIndex:{},
    legacyQuestions:[],questionRefByKey:new Map(),
    current:null,context:null,lastSavedSecond:-1,
    speed:1,blobUrls:new Map(),editor:null
  };

  const sk=()=>state.language==='sk';
  const text=(cz,skValue)=>sk()?skValue:cz;
  const contentLang=()=>sk()?'sk':'cs';
  const fmtDate=v=>{try{return new Intl.DateTimeFormat(sk()?'sk-SK':'cs-CZ',{day:'numeric',month:'numeric',year:'numeric'}).format(new Date(v))}catch{return String(v||'')}};
  const fmtTime=value=>{
    const total=Math.max(0,Math.floor(Number(value)||0)),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
    return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;
  };

  function safeProgress(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}
  function safePlaylists(value){return Array.isArray(value)?value:[]}
  function loadUserData(){
    state.progress=safeProgress(readJson(PROGRESS_KEY,{}));
    state.playlists=safePlaylists(readJson(PLAYLISTS_KEY,[]));
    state.collectionProgress=safeProgress(readJson(COLLECTION_KEY,{}));
    state.offlineIndex=safeProgress(readJson(OFFLINE_INDEX_KEY,{}));
  }

  function episodeCopy(episode){
    const copy=episode?.i18n?.[contentLang()];
    return {title:copy?.title||episode?.title||'',description:copy?.description||episode?.description||''};
  }
  function questionCopy(question){
    const copy=question?.i18n?.[contentLang()];
    return {title:copy?.title||question?.title||'',points:Array.isArray(copy?.points)?copy.points:(question?.points||[])};
  }
  function seriesLabel(series){return series?.i18n?.[contentLang()]||series?.name||text('Série','Séria')}
  function allEpisodeSearch(episode){
    const cs=episode?.i18n?.cs||{},skCopy=episode?.i18n?.sk||{};
    return norm(`${episode?.number||''} ${episode?.title||''} ${episode?.description||''} ${cs.title||''} ${cs.description||''} ${skCopy.title||''} ${skCopy.description||''}`);
  }
  function allQuestionSearch(question){
    const cs=question?.i18n?.cs||{},skCopy=question?.i18n?.sk||{};
    return norm(`${question?.episode||''} ${question?.title||''} ${(question?.points||[]).join(' ')} ${cs.title||''} ${(cs.points||[]).join(' ')} ${skCopy.title||''} ${(skCopy.points||[]).join(' ')}`);
  }

  function episodeKey(number){return `episode-${Number(number)||0}`}
  function episodeByNumber(number){return state.data?.episodes?.find(e=>Number(e.number)===Number(number))||null}
  function episodeStatus(number){
    const record=state.progress[episodeKey(number)];
    if(!record)return null;
    if(record.completed)return {kind:'done',label:text('✓ Poslechnuto','✓ Vypočuté')};
    if(Number(record.currentTime)>10){
      const percent=Number(record.duration)>0?Math.min(100,Math.round(Number(record.currentTime)/Number(record.duration)*100)):0;
      return {kind:'progress',label:`▶ ${text('Rozposloucháno','Rozpočúvané')}${percent?` · ${percent} %`:''}`};
    }
    return null;
  }
  function playLabel(number){
    const record=state.progress[episodeKey(number)];
    if(!record)return text('Přehrát','Prehrať');
    if(record.completed)return record.replaying&&Number(record.currentTime)>10?`${text('Pokračovat znovu','Pokračovať znova')} ${fmtTime(record.currentTime)}`:text('Přehrát znovu','Prehrať znova');
    if(Number(record.currentTime)>10)return`${text('Pokračovat','Pokračovať')} ${fmtTime(record.currentTime)}`;
    return text('Přehrát','Prehrať');
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
      const episode=episodeByNumber(decoded);if(!episode)return null;
      return {type:'e',ref,episode,title:episodeCopy(episode).title,subtitle:`${text('Díl','Diel')} ${episode.number}`,start:0};
    }
    const question=state.legacyQuestions[decoded-2048];
    if(!question)return null;
    const episode=episodeByNumber(question.episode),copy=questionCopy(question);
    return episode?{type:'q',ref,episode,question,title:copy.title,subtitle:`${text('Díl','Diel')} ${question.episode} • ${question.sourceTime||question.time||''}`,start:Number(question.seconds)||0}:null;
  }

  function cardEpisode(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number);
    return `<article class="card searchable" data-episode="${Number(episode.number)||0}" data-search="${esc(allEpisodeSearch(episode))}">
      <div class="meta">${text('Díl','Diel')} ${episode.number||'–'} • ${esc(fmtDate(episode.date))}</div>
      <h2>${esc(copy.title)}</h2>
      <div class="listen-status ${status?.kind||''}">${status?esc(status.label):''}</div>
      <p>${esc(copy.description)}</p>
      <div class="actions"><button type="button" class="play" data-episode="${Number(episode.number)||0}" data-seconds="">${esc(playLabel(episode.number))}</button>${episode.link?`<a class="secondary" href="${esc(episode.link)}">${text('Detail','Detail')}</a>`:''}</div>
    </article>`;
  }

  function cardQuestion(question,label=null){
    const ref=qRef(question),copy=questionCopy(question),metaLabel=label||text('Díl','Diel');
    return `<article class="card searchable" data-question="${question.episode}:${question.order}" data-search="${esc(allQuestionSearch(question))}">
      <div class="meta">${metaLabel} ${question.episode} • ${esc(question.sourceTime||question.time||'')}</div>
      <h2>${esc(copy.title)}</h2>
      <ul>${copy.points.map(point=>`<li>${esc(point)}</li>`).join('')}</ul>
      <div class="actions"><button type="button" class="play" data-episode="${question.episode}" data-seconds="${Number(question.seconds)||0}" data-ref="${esc(ref)}">${text('Přehrát','Prehrať')}</button></div>
    </article>`;
  }

  function normalizeNonQuestion(item,episode,order){
    return {episode:Number(episode),order,time:item?.time||'0:00',sourceTime:item?.time||'0:00',seconds:Number(item?.seconds)||parseTime(item?.time),title:item?.title||`${text('Položka','Položka')} ${order+1}`,points:Array.isArray(item?.points)?item.points:[]};
  }
  function flattenNonQuestions(data){
    const out=[];
    for(const [episode,languages] of Object.entries(data?.nonquestions?.episodes||{})){
      const items=languages?.[contentLang()]||languages?.cs||languages?.sk||[];
      items.forEach((item,order)=>out.push(normalizeNonQuestion(item,episode,order)));
    }
    return out.sort((a,b)=>b.episode-a.episode||a.order-b.order);
  }
  function nonQuestionSearch(item,episode,order){
    const languages=state.data?.nonquestions?.episodes?.[String(episode)]||{};
    const csItem=languages.cs?.[order]||{},skItem=languages.sk?.[order]||{};
    return norm(`${episode} ${item.title||''} ${(item.points||[]).join(' ')} ${csItem.title||''} ${(csItem.points||[]).join(' ')} ${skItem.title||''} ${(skItem.points||[]).join(' ')}`);
  }
  function parseTime(value){
    const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
    if(!parts)return 0;
    return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
  }

  function renderEpisodes(){
    $('#episodes-v2').innerHTML=state.data.episodes.map(cardEpisode).join('');
  }
  function refreshEpisodeCard(number){
    const episode=episodeByNumber(number),old=$(`#episodes-v2 article[data-episode="${Number(number)}"]`);
    if(!episode||!old)return;
    const host=document.createElement('div');host.innerHTML=cardEpisode(episode);old.replaceWith(host.firstElementChild);
  }
  function seriesContext(series,index){
    const items=series.episodes.map(number=>{
      const episode=episodeByNumber(number);
      return episode?{id:`episode:${episode.number}`,episode,start:0,ref:epRef(episode.number)}:null;
    }).filter(Boolean);
    return {type:'series',id:`series:${norm(series.name)}`,label:seriesLabel(series),items,index};
  }
  function renderSeries(){
    const byNumber=new Map(state.data.episodes.map(e=>[Number(e.number),e]));
    $('#series-v2').innerHTML=state.data.series.map((series,seriesIndex)=>{
      const eps=series.episodes.map(n=>byNumber.get(Number(n))).filter(Boolean),label=seriesLabel(series);
      const search=norm(`${series.i18n?.cs||series.name} ${series.i18n?.sk||''} ${eps.map(e=>allEpisodeSearch(e)).join(' ')}`);
      return `<details class="series searchable" data-series-index="${seriesIndex}" data-search="${esc(search)}"><summary><strong>${esc(label)}</strong><span>${eps.length} ${text('dílů','dielov')}</span></summary><ol>${eps.map((e,index)=>`<li><button type="button" class="series-item" data-series-index="${seriesIndex}" data-item-index="${index}">${text('Díl','Diel')} ${e.number}: ${esc(episodeCopy(e).title)}</button></li>`).join('')}</ol></details>`;
    }).join('');
  }
  function renderQuestions(){$('#questions-v2').innerHTML=state.data.questions.map(question=>cardQuestion(question)).join('')}
  function renderNonQuestions(){
    const items=flattenNonQuestions(state.data);
    $('#nonquestions-v2').innerHTML=items.map(item=>{
      const html=cardQuestion(item,text('Díl','Diel'));
      return html.replace(`data-search="${esc(allQuestionSearch(item))}"`,`data-search="${esc(nonQuestionSearch(item,item.episode,item.order))}"`);
    }).join('');
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
      box.innerHTML=`<div class="playlist-toolbar"><strong>${text('Moje playlisty','Moje playlisty')}</strong><button class="playlist-add" type="button" aria-label="${text('Nový playlist','Nový playlist')}">+</button></div><div class="empty">${text('Zatím nemáte žádný playlist.','Zatiaľ nemáte žiadny playlist.')}</div>`;
      return;
    }
    box.innerHTML=`<div class="playlist-toolbar"><strong>${text('Moje playlisty','Moje playlisty')}</strong><button class="playlist-add" type="button" aria-label="${text('Nový playlist','Nový playlist')}">+</button></div><div class="grid">${state.playlists.map(playlist=>{
      const items=playlistRefs(playlist).map(itemInfo).filter(Boolean);
      const search=norm(`${playlist.name} ${items.map(item=>`${item.title} ${item.subtitle}`).join(' ')}`);
      return `<details class="playlist-card searchable" data-id="${esc(playlist.id)}" data-search="${esc(search)}"><summary><span class="playlist-title">${esc(playlist.name||'Playlist')}</span><span class="playlist-count">${items.length} ${text('položek','položiek')}</span><span class="playlist-actions"><button type="button" class="icon-button edit" title="${text('Upravit','Upraviť')}">✎</button><button type="button" class="icon-button share" title="${text('Sdílet','Zdieľať')}">🔗</button><button type="button" class="icon-button delete" title="${text('Smazat','Zmazať')}">🗑</button></span></summary><ol class="playlist-items">${items.length?items.map((item,index)=>`<li class="playlist-item"><button type="button" class="playlist-open" data-item-index="${index}" data-ref="${esc(item.ref)}"><b>${esc(item.title)}</b><br><small>${esc(item.subtitle)}</small></button></li>`).join(''):`<li class="empty">${text('Playlist je prázdný.','Playlist je prázdny.')}</li>`}</ol></details>`;
    }).join('')}</div>`;
  }

  function renderData(){
    const listened=Object.values(state.progress).filter(x=>x?.completed).length;
    const inProgress=Object.values(state.progress).filter(x=>x&&!x.completed&&Number(x.currentTime)>10).length;
    $('#data-v2').innerHTML=`<div class="data-grid">
      <article class="data-card"><h2>${text('Tvoje data','Tvoje dáta')}</h2><p>${listened} ${text('poslechnutých','vypočutých')}, ${inProgress} ${text('rozposlouchaných epizod','rozpočúvaných epizód')} a ${state.playlists.length} ${text('playlistů','playlistov')}.</p><div class="data-actions"><button class="primary-button data-export" type="button">${text('Stáhnout zálohu','Stiahnuť zálohu')}</button><button class="secondary-button data-import" type="button">${text('Načíst zálohu','Načítať zálohu')}</button></div><p class="data-note">${text('V2 používá stejné formáty dat jako původní aplikace. Při samotném otevření této stránky se stará data nepřepisují ani nepřevádějí.','V2 používa rovnaké formáty dát ako pôvodná aplikácia. Pri samotnom otvorení tejto stránky sa staré dáta neprepisujú ani nekonvertujú.')}</p></article>
      <article class="data-card"><h2>${text('Smazání dat','Zmazanie dát')}</h2><p>${text('Odstraní data Vedátoru uložená v tomto zařízení včetně offline kopií.','Odstráni dáta Vedátora uložené v tomto zariadení vrátane offline kópií.')}</p><button class="danger-button data-clear" type="button">${text('Smazat veškerá data','Zmazať všetky dáta')}</button><p class="data-note">${text('Tato akce proběhne pouze po dalším výslovném potvrzení.','Táto akcia prebehne iba po ďalšom výslovnom potvrdení.')}</p></article>
    </div>`;
  }

  function applyStaticUi(){
    document.documentElement.lang=sk()?'sk':'cs';
    document.title=text('Vedátorský podcast – V2','Vedátorský podcast – V2');
    const eyebrow=$('#eyebrow-v2'),heading=$('#heading-v2'),search=$('#search-v2');
    if(eyebrow)eyebrow.textContent=text('Radikální testovací V2','Radikálna testovacia V2');
    if(heading)heading.textContent=text('Vedátorský podcast','Vedátorský podcast');
    if(search)search.placeholder=text('Hledat v právě otevřené záložce…','Hľadať v práve otvorenej záložke…');
    const labels={episodes:text('Epizody','Epizódy'),series:text('Série','Série'),questions:text('Otázky','Otázky'),nonquestions:text('Neotázky','Neotázky'),playlists:'Playlisty',data:text('Moje data','Moje dáta')};
    $$('.tab-v2').forEach(button=>{if(labels[button.dataset.view])button.textContent=labels[button.dataset.view]});
    $$('.language-v2 button[data-lang]').forEach(button=>{
      const active=button.dataset.lang===state.language;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
    });
  }
  function rerenderLanguage(){
    renderEpisodes();renderSeries();renderQuestions();renderNonQuestions();renderPlaylists();renderData();
    applyStaticUi();filterActive();syncPlayer();
  }
  function setLanguage(next){
    const language=next==='sk'?'sk':'cz';if(state.language===language)return;
    state.language=language;try{localStorage.setItem(LANGUAGE_KEY,language)}catch{}
    rerenderLanguage();
    window.dispatchEvent(new CustomEvent('vedatorlanguagechange',{detail:{language}}));
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
    const cards=[...active.querySelectorAll('.searchable')];let shown=0;
    cards.forEach(card=>{const ok=!q||String(card.dataset.search||'').includes(q);card.classList.toggle('filtered-out',!ok);if(ok)shown++});
    if(state.view==='episodes')$('#count-v2').textContent=q?`${shown} ${text('nalezených epizod','nájdených epizód')}`:`${state.data.episodes.length} ${text('epizod','epizód')}`;
    else if(state.view==='questions')$('#count-v2').textContent=q?`${shown} ${text('nalezených otázek','nájdených otázok')}`:`${state.data.questions.length} ${text('otázek','otázok')}`;
    else if(state.view==='nonquestions')$('#count-v2').textContent=q?`${shown} ${text('nalezených položek','nájdených položiek')}`:`${active.dataset.count||shown} ${text('neotázek','neotázok')}`;
    else if(state.view==='series')$('#count-v2').textContent=q?`${shown} ${text('nalezených sérií','nájdených sérií')}`:`${state.data.series.length} ${text('sérií','sérií')}`;
    else if(state.view==='playlists')$('#count-v2').textContent=q?`${shown} ${text('nalezených playlistů','nájdených playlistov')}`:`${state.playlists.length} ${text('playlistů','playlistov')}`;
    else $('#count-v2').textContent=text('Lokální data','Lokálne dáta');
  }

  function currentOfflineRecord(){const key=state.current?episodeKey(state.current.episode.number):'';return key?state.offlineIndex[key]||null:null}
  async function offlineBlobUrl(record){
    if(!record?.cacheUrl||!('caches'in window))return'';
    if(state.blobUrls.has(record.key))return state.blobUrls.get(record.key);
    const cache=await caches.open(OFFLINE_CACHE),response=await cache.match(record.cacheUrl);if(!response)return'';
    const url=URL.createObjectURL(await response.blob());state.blobUrls.set(record.key,url);return url;
  }
  async function playbackUrl(episode){
    const record=state.offlineIndex[episodeKey(episode.number)];
    if(record){try{const blob=await offlineBlobUrl(record);if(blob)return blob}catch{}}
    return episode.enclosure;
  }

  function playerNodes(){return{shell:$('#player-v2'),audio:$('#audio-v2'),title:$('#player-title-v2'),sub:$('#player-sub-v2'),play:$('#player-play-v2'),prev:$('#player-prev-v2'),next:$('#player-next-v2'),speed:$('#player-speed-v2'),seek:$('#player-seek-v2'),current:$('#player-current-v2'),duration:$('#player-duration-v2'),help:$('#player-help-v2'),download:$('#player-download-v2'),offline:$('#player-offline-v2')}}
  function syncPlayer(){
    const n=playerNodes(),audio=n.audio,current=state.current;
    if(!current){n.shell.classList.add('hidden');return}
    n.shell.classList.remove('hidden');n.title.textContent=episodeCopy(current.episode).title;
    n.sub.textContent=state.context?`${state.context.type==='series'?text('Série','Séria'):'Playlist'}: ${state.context.label}`:`${text('Díl','Diel')} ${current.episode.number}`;
    n.play.textContent=audio.paused?text('Přehrát','Prehrať'):text('Pauza','Pauza');
    n.prev.title=text('Předchozí','Predchádzajúca');n.next.title=text('Další','Ďalšia');
    n.speed.textContent=`${String(state.speed).replace('.',',')}×`;n.prev.disabled=!state.context||state.context.index<=0;n.next.disabled=!state.context||state.context.index>=state.context.items.length-1;
    n.download.textContent=text('⇩ MP3','⇩ MP3');n.download.href=current.episode.enclosure||'#';
    n.offline.textContent=currentOfflineRecord()?text('✓ Offline','✓ Offline'):text('📱 Offline','📱 Offline');
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:0,time=Number.isFinite(audio.currentTime)?audio.currentTime:0;
    n.seek.max=String(Math.max(1,Math.floor(duration||1)));if(document.activeElement!==n.seek)n.seek.value=String(Math.min(Number(n.seek.max),Math.max(0,Math.floor(time))));
    n.current.textContent=fmtTime(n.seek.value);n.duration.textContent=duration?fmtTime(duration):'–:––';
    $('#player-playlist-v2').textContent=text('＋ Playlist','＋ Playlist');$('#player-close-v2').title=text('Zavřít','Zavrieť');
  }
  function saveCollectionProgress(time,duration,completed){
    const context=state.context,item=context?.items?.[context.index];if(!context||!item)return;
    const collection=state.collectionProgress[context.id]&&typeof state.collectionProgress[context.id]==='object'?state.collectionProgress[context.id]:{type:context.type,label:context.label,lastItemId:'',updatedAt:0,items:{}};
    collection.items=collection.items&&typeof collection.items==='object'?collection.items:{};
    const start=Math.max(0,Number(item.start)||0),end=duration>start?duration:0,span=end>start?end-start:0;
    const percent=completed?100:(span?Math.max(0,Math.min(100,(time-start)/span*100)):0),id=item.id,previous=collection.items[id]||{};
    collection.items[id]={title:item.question?questionCopy(item.question).title:episodeCopy(item.episode).title,currentTime:time,duration,start,end:end||null,percent:Math.max(Number(previous.percent)||0,percent),completed:Boolean(previous.completed)||completed,updatedAt:Date.now()};
    collection.lastItemId=id;collection.label=context.label;collection.type=context.type;collection.updatedAt=Date.now();state.collectionProgress[context.id]=collection;writeJson(COLLECTION_KEY,state.collectionProgress);
  }
  function saveProgress(force=false,ended=false){
    const n=playerNodes(),audio=n.audio,current=state.current;if(!current||audio.readyState===0)return;
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Number(state.progress[current.key]?.duration)||0,time=ended&&duration>0?duration:Number(audio.currentTime)||0,second=Math.floor(time);
    if(!force&&state.lastSavedSecond>=0&&Math.abs(second-state.lastSavedSecond)<5)return;state.lastSavedSecond=second;
    const previous=state.progress[current.key]||{},completed=Boolean(previous.completed)||(ended||(duration>0&&(time/duration>=.9||duration-time<=120)));
    state.progress[current.key]={currentTime:time,duration,completed,replaying:Boolean(previous.completed)&&!ended,title:episodeCopy(current.episode).title,updatedAt:Date.now()};
    writeJson(PROGRESS_KEY,state.progress);saveCollectionProgress(time,duration,completed);refreshEpisodeCard(current.episode.number);
  }
  async function openPlayback(episode,{start=null,context=null,itemRef=''}={}){
    if(!episode?.enclosure)return;saveProgress(true,false);
    const n=playerNodes(),audio=n.audio,key=episodeKey(episode.number),record=state.progress[key]||{};state.context=context;let target=start;
    if(target===null&&Number(record.currentTime)>10&&(!record.completed||record.replaying))target=Number(record.currentTime);
    if(target===null&&record.completed){state.progress[key]={...record,currentTime:0,replaying:true,updatedAt:Date.now()};writeJson(PROGRESS_KEY,state.progress);target=0}
    state.current={episode,key,itemRef:itemRef||epRef(episode.number)};state.lastSavedSecond=-1;audio.pause();audio.src=await playbackUrl(episode);audio.playbackRate=state.speed;
    n.help.textContent=target>0?`${text('Načítám od','Načítavam od')} ${fmtTime(target)}…`:text('Pozice se průběžně ukládá do tohoto zařízení.','Pozícia sa priebežne ukladá do tohto zariadenia.');
    audio.addEventListener('loadedmetadata',()=>{if(state.current?.key!==key)return;if(Number.isFinite(target)&&target>0){try{audio.currentTime=Math.min(target,Math.max(0,(audio.duration||target)-1))}catch{}}syncPlayer();audio.play().catch(()=>{n.help.textContent=target>0?`${text('Pozice','Pozícia')} ${fmtTime(target)} ${text('je připravená. Klepněte na Přehrát.','je pripravená. Klepnite na Prehrať.')}`:text('Klepněte na Přehrát.','Klepnite na Prehrať.')})},{once:true});
    audio.load();n.shell.classList.remove('hidden');syncPlayer();audio.play().catch(()=>{});
  }
  function closePlayer(){saveProgress(true,false);const n=playerNodes();n.audio.pause();n.audio.removeAttribute('src');n.audio.load();state.current=null;state.context=null;n.shell.classList.add('hidden')}
  function navigateContext(delta){const context=state.context;if(!context)return;const index=context.index+delta;if(index<0||index>=context.items.length)return;const next={...context,index},item=next.items[index];openPlayback(item.episode,{start:item.start||0,context:next,itemRef:item.ref||epRef(item.episode.number)})}
  function changeSpeed(){const speeds=[1,1.25,1.5,1.75,2,.75],i=speeds.indexOf(state.speed);state.speed=speeds[(i+1)%speeds.length];playerNodes().audio.playbackRate=state.speed;syncPlayer()}

  function playlistEditorHtml(){
    const editor=state.editor,mode=editor.mode,q=norm(editor.query),selected=new Set(editor.draft);
    const draftRows=editor.draft.map((ref,index)=>{const item=itemInfo(ref);if(!item)return'';return `<div class="editor-row" data-ref="${esc(ref)}"><span class="editor-move"><button type="button" class="move-up" ${index?'':'disabled'}>▲</button><button type="button" class="move-down" ${index===editor.draft.length-1?'disabled':''}>▼</button></span><span><b>${esc(item.title)}</b><br><small>${esc(item.subtitle)}</small></span><button type="button" class="editor-remove">✕</button></div>`}).join('')||`<div class="empty">${text('Playlist je prázdný.','Playlist je prázdny.')}</div>`;
    let source;
    if(mode==='e')source=state.data.episodes.map(episode=>({ref:epRef(episode.number),title:episodeCopy(episode).title,sub:`${text('Díl','Diel')} ${episode.number}`,search:allEpisodeSearch(episode)}));
    else source=state.legacyQuestions.map(question=>({ref:qRef(question),title:questionCopy(question).title,sub:`${text('Díl','Diel')} ${question.episode} • ${question.sourceTime||question.time}`,search:allQuestionSearch(question)}));
    source=source.filter(x=>!q||norm(x.search).includes(q)).slice(0,350);
    return `<div class="modal-box"><div class="modal-head"><strong>${text('Upravit playlist','Upraviť playlist')}</strong><button type="button" class="icon-button editor-close">✕</button></div><div class="modal-body"><div class="editor-switch"><button type="button" data-mode="e" class="${mode==='e'?'active':''}">${text('Epizody','Epizódy')}</button><button type="button" data-mode="q" class="${mode==='q'?'active':''}">${text('Otázky','Otázky')}</button></div><div class="editor-columns"><section><h3>${text('Přidané položky','Pridané položky')}</h3><div class="editor-list draft-list">${draftRows}</div></section><section><h3>${mode==='e'?text('Přidat epizody','Pridať epizódy'):text('Přidat otázky','Pridať otázky')}</h3><input class="modal-search editor-search" value="${esc(editor.query)}" placeholder="${text('Hledat…','Hľadať…')}"><div class="editor-list source-list">${source.map(x=>`<label class="editor-choice" data-ref="${esc(x.ref)}"><input type="checkbox" ${selected.has(x.ref)?'checked':''}><span><b>${esc(x.title)}</b><br><small>${esc(x.sub)}</small></span></label>`).join('')||`<div class="empty">${text('Nic nenalezeno.','Nič nenájdené.')}</div>`}</div></section></div></div><div class="modal-foot"><button type="button" class="secondary-button editor-cancel">${text('Zrušit','Zrušiť')}</button><button type="button" class="primary-button editor-save">${text('Uložit','Uložiť')}</button></div></div>`;
  }
  function openPlaylistEditor(id){const playlist=state.playlists.find(p=>String(p.id)===String(id));if(!playlist)return;state.editor={id:String(id),draft:playlistRefs(playlist),mode:'e',query:''};const modal=$('#playlist-editor-v2');modal.innerHTML=playlistEditorHtml();modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false')}
  function closePlaylistEditor(){state.editor=null;const modal=$('#playlist-editor-v2');modal.classList.add('hidden');modal.innerHTML='';modal.setAttribute('aria-hidden','true')}
  function rerenderEditor(){const modal=$('#playlist-editor-v2');if(!state.editor)return;modal.innerHTML=playlistEditorHtml()}
  function savePlaylistEditor(){const index=state.playlists.findIndex(p=>String(p.id)===String(state.editor?.id));if(index>=0){state.playlists[index]={...state.playlists[index],items:[...state.editor.draft]};writeJson(PLAYLISTS_KEY,state.playlists)}closePlaylistEditor();renderPlaylists()}
  function newPlaylist(){const name=prompt(text('Název nového playlistu:','Názov nového playlistu:'))?.trim();if(!name)return;if(state.playlists.some(p=>norm(p.name)===norm(name)))return alert(text('Playlist s tímto názvem už existuje.','Playlist s týmto názvom už existuje.'));const playlist={id:uid(),name,items:[]};state.playlists.push(playlist);writeJson(PLAYLISTS_KEY,state.playlists);renderPlaylists();openPlaylistEditor(playlist.id)}

  function b64e(value){const bytes=new TextEncoder().encode(value);let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  function b64d(value){let textValue=String(value).replace(/-/g,'+').replace(/_/g,'/');while(textValue.length%4)textValue+='=';return new TextDecoder().decode(Uint8Array.from(atob(textValue),c=>c.charCodeAt(0)))}
  async function sharePlaylist(playlist){
    const items=playlistRefs(playlist).join(''),payload=b64e(JSON.stringify({v:3,n:playlist.name,x:items})),url=new URL(location.href);url.hash=`playlist=${payload}`;
    try{if(navigator.share)await navigator.share({url:url.href});else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url.href);alert(text('Odkaz byl zkopírován.','Odkaz bol skopírovaný.'))}else prompt(text('Zkopírujte odkaz:','Skopírujte odkaz:'),url.href)}catch(error){if(error?.name!=='AbortError')prompt(text('Zkopírujte odkaz:','Skopírujte odkaz:'),url.href)}
  }
  function importSharedPlaylist(){
    const match=location.hash.match(/(?:^#|&)playlist=([^&]+)/);if(!match)return;
    try{
      const data=JSON.parse(b64d(match[1]));let items=[];
      if(data?.v===3&&typeof data.x==='string'&&data.x.length%2===0)for(let i=0;i<data.x.length;i+=2)items.push(data.x.slice(i,i+2));
      else if(data?.v===2&&typeof data.e==='string')for(let i=0;i<data.e.length;i+=2)items.push(data.e.slice(i,i+2));
      else if(Array.isArray(data?.i))items=data.i.map(normalizePlaylistRef).filter(Boolean);else return;
      const base=String(data.n||text('Sdílený playlist','Zdieľaný playlist')).trim();if(!confirm(`${text('Uložit sdílený playlist','Uložiť zdieľaný playlist')} „${base}“?`))return;
      let name=base,n=2;while(state.playlists.some(p=>norm(p.name)===norm(name)))name=`${base} (${n++})`;state.playlists.push({id:uid(),name,items});writeJson(PLAYLISTS_KEY,state.playlists);history.replaceState(null,'',location.pathname+location.search);setView('playlists');
    }catch(error){console.warn('Neplatný playlistový odkaz',error)}
  }

  function openPlaylistPicker(){
    if(!state.current)return;const ref=state.current.itemRef||epRef(state.current.episode.number),modal=$('#playlist-picker-v2');
    modal.innerHTML=`<div class="modal-box" style="width:min(480px,100%)"><div class="modal-head"><strong>${text('Přidat do playlistu','Pridať do playlistu')}</strong><button type="button" class="icon-button picker-close">✕</button></div><div class="modal-body picker-list">${state.playlists.length?state.playlists.map(p=>`<label class="picker-row"><input type="checkbox" data-id="${esc(p.id)}" ${playlistRefs(p).includes(ref)?'checked':''}><span>${esc(p.name)}</span></label>`).join(''):`<div class="empty">${text('Zatím nemáte žádný playlist.','Zatiaľ nemáte žiadny playlist.')}</div>`}</div><div class="modal-foot"><button type="button" class="secondary-button picker-new">＋ ${text('Nový playlist','Nový playlist')}</button><button type="button" class="secondary-button picker-cancel">${text('Zrušit','Zrušiť')}</button><button type="button" class="primary-button picker-save">${text('Uložit','Uložiť')}</button></div></div>`;
    modal.dataset.ref=ref;modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
  }
  function closePlaylistPicker(){const modal=$('#playlist-picker-v2');modal.classList.add('hidden');modal.innerHTML='';delete modal.dataset.ref;modal.setAttribute('aria-hidden','true')}
  function savePlaylistPicker(){const modal=$('#playlist-picker-v2'),ref=modal.dataset.ref;if(!ref)return closePlaylistPicker();const chosen=new Set([...modal.querySelectorAll('input[data-id]:checked')].map(input=>String(input.dataset.id)));for(const playlist of state.playlists){let items=playlistRefs(playlist).filter(item=>item!==ref);if(chosen.has(String(playlist.id)))items.push(ref);playlist.items=items}writeJson(PLAYLISTS_KEY,state.playlists);closePlaylistPicker();if(state.view==='playlists')renderPlaylists()}

  async function toggleOffline(){
    const current=state.current;if(!current)return;const key=episodeKey(current.episode.number),record=state.offlineIndex[key],n=playerNodes();
    if(record){
      if(!confirm(text('Smazat offline kopii této epizody?','Zmazať offline kópiu tejto epizódy?')))return;
      try{const cache=await caches.open(OFFLINE_CACHE);await cache.delete(record.cacheUrl);const blobUrl=state.blobUrls.get(key);if(blobUrl)URL.revokeObjectURL(blobUrl);state.blobUrls.delete(key);delete state.offlineIndex[key];writeJson(OFFLINE_INDEX_KEY,state.offlineIndex);n.help.textContent=text('Offline kopie byla smazána.','Offline kópia bola zmazaná.')}catch{n.help.textContent=text('Offline kopii se nepodařilo smazat.','Offline kópiu sa nepodarilo zmazať.')}syncPlayer();return;
    }
    if(!('caches'in window)){n.help.textContent=text('Offline ukládání tento prohlížeč nepodporuje.','Offline ukladanie tento prehliadač nepodporuje.');return}
    const url=current.episode.enclosure;if(!url)return;n.offline.disabled=true;n.help.textContent=text('Ukládám epizodu offline…','Ukladám epizódu offline…');
    try{
      try{await navigator.storage?.persist?.()}catch{}
      const response=await fetch(url,{mode:'cors',cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const blob=await response.blob(),cacheUrl=new URL(`./__vedator_offline_audio__/${encodeURIComponent(key)}.mp3`,location.href).href,cache=await caches.open(OFFLINE_CACHE);
      await cache.put(cacheUrl,new Response(blob,{status:200,headers:{'Content-Type':response.headers.get('content-type')||blob.type||'audio/mpeg','Content-Length':String(blob.size),'Accept-Ranges':'bytes','X-Vedator-Original-Url':url}}));
      state.offlineIndex[key]={key,title:episodeCopy(current.episode).title,number:Number(current.episode.number),originalUrl:url,cacheUrl,size:blob.size,type:blob.type||'audio/mpeg',savedAt:Date.now()};writeJson(OFFLINE_INDEX_KEY,state.offlineIndex);n.help.textContent=`${text('Epizoda je uložená offline','Epizóda je uložená offline')} (${(blob.size/1048576).toFixed(1).replace('.',',')} MB).`;
    }catch(error){console.warn(error);n.help.textContent=text('Offline uložení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.','Offline uloženie sa nepodarilo. Skontrolujte pripojenie a skúste to znova.')}finally{n.offline.disabled=false;syncPlayer()}
  }

  function exportData(){
    const payload={app:'vedator',formatVersion:1,exportedAt:new Date().toISOString(),data:{playbackProgress:safeProgress(readJson(PROGRESS_KEY,{})),playlists:safePlaylists(readJson(PLAYLISTS_KEY,[]))}};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`vedator-zaloha-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function validateBackup(value){if(!value||typeof value!=='object'||value.app!=='vedator'||value.formatVersion!==1)throw new Error(text('Tento soubor není podporovaná záloha Vedátoru.','Tento súbor nie je podporovaná záloha Vedátora.'));if(!value.data||typeof value.data!=='object'||!value.data.playbackProgress||typeof value.data.playbackProgress!=='object'||Array.isArray(value.data.playbackProgress)||!Array.isArray(value.data.playlists))throw new Error(text('Záloha nemá platná data.','Záloha nemá platné dáta.'));return value.data}
  async function importBackup(file){
    try{const data=validateBackup(JSON.parse(await file.text())),progressCount=Object.keys(data.playbackProgress).length,playlistCount=data.playlists.length;if(!confirm(`${text('Načíst zálohu','Načítať zálohu')} ${text('s','s')} ${progressCount} ${text('epizodami','epizódami')} ${text('a','a')} ${playlistCount} ${text('playlisty','playlistami')}?\n\n${text('Současný průběh poslechu a playlisty budou nahrazeny.','Súčasný priebeh počúvania a playlisty budú nahradené.')}`))return;writeJson(PROGRESS_KEY,data.playbackProgress);writeJson(PLAYLISTS_KEY,data.playlists);loadUserData();rerenderLanguage();$('#status-v2').textContent=text('Záloha byla načtena.','Záloha bola načítaná.')}catch(error){$('#status-v2').textContent=error instanceof SyntaxError?text('Soubor není platný JSON.','Súbor nie je platný JSON.'):error.message;$('#status-v2').classList.add('error')}finally{$('#data-file-v2').value=''}
  }
  async function clearAllData(){
    if(!confirm(text('Opravdu chcete smazat veškerá data aplikace Vedátor v tomto zařízení?\n\nTuto akci nelze vrátit zpět.','Naozaj chcete zmazať všetky dáta aplikácie Vedátor v tomto zariadení?\n\nTúto akciu nemožno vrátiť späť.')))return;closePlayer();
    try{const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.toLowerCase().startsWith('vedator'))keys.push(key)}keys.forEach(key=>localStorage.removeItem(key))}catch{}
    try{const keys=[];for(let i=0;i<sessionStorage.length;i++){const key=sessionStorage.key(i);if(key?.toLowerCase().startsWith('vedator'))keys.push(key)}keys.forEach(key=>sessionStorage.removeItem(key))}catch{}
    try{await caches.delete(OFFLINE_CACHE)}catch{}state.language='sk';loadUserData();rerenderLanguage();$('#status-v2').textContent=text('Veškerá data aplikace byla smazána.','Všetky dáta aplikácie boli zmazané.');
  }

  function bind(){
    $$('.tab-v2').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $$('.language-v2 button[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
    $('#search-v2').addEventListener('input',event=>{state.query=event.target.value;filterActive()});
    document.addEventListener('click',event=>{
      const play=event.target.closest?.('.play');
      if(play){const episode=episodeByNumber(Number(play.dataset.episode)),seconds=play.dataset.seconds===''?null:Number(play.dataset.seconds)||0;if(episode)openPlayback(episode,{start:seconds,itemRef:play.dataset.ref||epRef(episode.number)});return}
      const seriesItem=event.target.closest?.('.series-item');
      if(seriesItem){const series=state.data.series[Number(seriesItem.dataset.seriesIndex)],index=Number(seriesItem.dataset.itemIndex)||0,context=seriesContext(series,index),item=context.items[index];if(item)openPlayback(item.episode,{start:item.start,context,itemRef:item.ref});return}
      if(event.target.closest?.('.playlist-add'))return newPlaylist();
      const playlistCard=event.target.closest?.('.playlist-card');
      if(playlistCard){
        const playlist=state.playlists.find(p=>String(p.id)===String(playlistCard.dataset.id));if(!playlist)return;
        if(event.target.closest('.edit')){event.preventDefault();openPlaylistEditor(playlist.id);return}
        if(event.target.closest('.share')){event.preventDefault();sharePlaylist(playlist);return}
        if(event.target.closest('.delete')){event.preventDefault();if(confirm(`${text('Smazat playlist','Zmazať playlist')} „${playlist.name}“?`)){state.playlists=state.playlists.filter(p=>String(p.id)!==String(playlist.id));writeJson(PLAYLISTS_KEY,state.playlists);renderPlaylists()}return}
        const itemButton=event.target.closest('.playlist-open');if(itemButton){event.preventDefault();const index=Number(itemButton.dataset.itemIndex)||0,context=playlistContext(playlist,index),item=context.items[index];if(item)openPlayback(item.episode,{start:item.start,context,itemRef:item.ref});return}
      }
      if(event.target.closest?.('.data-export'))return exportData();if(event.target.closest?.('.data-import'))return $('#data-file-v2').click();if(event.target.closest?.('.data-clear'))return clearAllData();
    });

    const editorModal=$('#playlist-editor-v2');
    editorModal.addEventListener('click',event=>{
      if(event.target===editorModal||event.target.closest('.editor-close')||event.target.closest('.editor-cancel'))return closePlaylistEditor();if(!state.editor)return;
      const mode=event.target.closest('[data-mode]');if(mode){state.editor.mode=mode.dataset.mode;state.editor.query='';rerenderEditor();return}
      const row=event.target.closest('.editor-row[data-ref]');if(row){const index=state.editor.draft.indexOf(row.dataset.ref);if(index<0)return;if(event.target.closest('.editor-remove'))state.editor.draft.splice(index,1);else if(event.target.closest('.move-up')&&index>0)[state.editor.draft[index-1],state.editor.draft[index]]=[state.editor.draft[index],state.editor.draft[index-1]];else if(event.target.closest('.move-down')&&index<state.editor.draft.length-1)[state.editor.draft[index+1],state.editor.draft[index]]=[state.editor.draft[index],state.editor.draft[index+1]];rerenderEditor();return}
      if(event.target.closest('.editor-save'))return savePlaylistEditor();
    });
    editorModal.addEventListener('input',event=>{if(event.target.matches('.editor-search')&&state.editor){state.editor.query=event.target.value;rerenderEditor()}});
    editorModal.addEventListener('change',event=>{const choice=event.target.closest('.editor-choice[data-ref]');if(!choice||!state.editor)return;const ref=choice.dataset.ref;if(event.target.checked){if(!state.editor.draft.includes(ref))state.editor.draft.push(ref)}else state.editor.draft=state.editor.draft.filter(item=>item!==ref);rerenderEditor()});

    const picker=$('#playlist-picker-v2');picker.addEventListener('click',event=>{if(event.target===picker||event.target.closest('.picker-close')||event.target.closest('.picker-cancel'))return closePlaylistPicker();if(event.target.closest('.picker-save'))return savePlaylistPicker();if(event.target.closest('.picker-new')){closePlaylistPicker();newPlaylist()}});
    const n=playerNodes();n.play.addEventListener('click',()=>{if(n.audio.paused)n.audio.play().catch(()=>{});else n.audio.pause();syncPlayer()});n.prev.addEventListener('click',()=>navigateContext(-1));n.next.addEventListener('click',()=>navigateContext(1));n.speed.addEventListener('click',changeSpeed);$('#player-playlist-v2').addEventListener('click',openPlaylistPicker);n.offline.addEventListener('click',toggleOffline);$('#player-close-v2').addEventListener('click',closePlayer);n.seek.addEventListener('input',()=>{n.current.textContent=fmtTime(n.seek.value)});n.seek.addEventListener('change',()=>{if(state.current){try{n.audio.currentTime=Number(n.seek.value)||0}catch{}saveProgress(true,false)}});n.audio.addEventListener('play',syncPlayer);n.audio.addEventListener('pause',()=>{saveProgress(true,false);syncPlayer()});n.audio.addEventListener('timeupdate',()=>{syncPlayer();saveProgress(false,false)});n.audio.addEventListener('durationchange',syncPlayer);n.audio.addEventListener('loadeddata',syncPlayer);n.audio.addEventListener('ended',()=>{saveProgress(true,true);syncPlayer()});window.addEventListener('pagehide',()=>saveProgress(true,false));document.addEventListener('visibilitychange',()=>{if(document.hidden)saveProgress(true,false)});$('#data-file-v2').addEventListener('change',()=>{const file=$('#data-file-v2').files?.[0];if(file)importBackup(file)});
  }


  /* V2_QUESTION_EXPERIENCE_V1 */
  const QUESTION_TOPICS={
    all:{cs:'Vše',sk:'Všetko',keys:[]},
    space:{cs:'Vesmír',sk:'Vesmír',keys:['vesmir','hvezd','hviezd','planet','galaxi','slunce','slnko','mesic','mesiac','jupiter','kosmolog','rozpin']},
    blackholes:{cs:'Černé díry',sk:'Čierne diery',keys:['cerna dira','cierna diera','hawking','singularit']},
    quantum:{cs:'Kvantová fyzika',sk:'Kvantová fyzika',keys:['kvant','superpoz','spleten','previazan','orbital','wimp','vakuu','vakua']},
    relativity:{cs:'Relativita a gravitace',sk:'Relativita a gravitácia',keys:['relativ','gravit','casoprostor','casopriestor','rychlost svetla']},
    math:{cs:'Matematika',sk:'Matematika',keys:['matemat','prvocisl','nekonec','paradox','entrop','laplace','tri teles']},
    bio:{cs:'Biologie a medicína',sk:'Biológia a medicína',keys:['vitamin','gen','gmo','mozek','mozog','spanek','zrcadlov','cvicit']},
    tech:{cs:'Technologie',sk:'Technológie',keys:['pocitac','mikrovln','gps','bater','vodik','auto','klavesnic','tiktok','kryptom','teleskop','webb']},
    earth:{cs:'Země a příroda',sk:'Zem a príroda',keys:['zeme','ocean','ledovec','sopk','tornado','pocasi','vzduch','mrak','atmosfer']},
    chemistry:{cs:'Chemie',sk:'Chémia',keys:['atom','molekul','prvek','prvok','helium','deuter','voda','jogurt','zlato','metan','oxid uhlicity']},
    other:{cs:'Ostatní',sk:'Ostatné',keys:['podcast','jazyk','wikipedia','anime','videohry','recept','motiv','pravo','plochozem']}
  };
  const questionUi={qTopic:'all',nTopic:'all',qSort:'new',nSort:'new',qOpen:new Set(),nOpen:new Set(),installed:false,deepProcessing:false};
  const currentTopic=view=>QUESTION_TOPICS[view==='questions'?questionUi.qTopic:questionUi.nTopic]||QUESTION_TOPICS.all;
  const viewSort=view=>view==='questions'?questionUi.qSort:questionUi.nSort;
  const itemId=(item,prefix='q')=>prefix+':'+Number(item.episode)+':'+Number(item.order);
  const copyForViewItem=(item,view)=>view==='questions'?questionCopy(item):{title:String(item.title||''),points:Array.isArray(item.points)?item.points:[]};
  const itemSearchText=(item,view)=>view==='questions'?allQuestionSearch(item):nonQuestionSearch(item,item.episode,item.order);
  const queryTerms=()=>norm(state.query.trim()).split(/\s+/).filter(Boolean);
  function itemMatchLevel(item,view){
    const terms=queryTerms();if(!terms.length)return 0;
    const copy=copyForViewItem(item,view),title=norm(copy.title),answer=norm(copy.points.join(' ')),episode=String(item.episode);
    if(terms.every(term=>title.includes(term)||episode.includes(term)))return 0;
    if(terms.some(term=>title.includes(term)||episode.includes(term)))return 1;
    if(terms.every(term=>answer.includes(term)))return 2;
    if(terms.every(term=>(title+' '+answer).includes(term)||episode.includes(term)))return 3;
    return 99;
  }
  function itemMatchesTopic(item,view){
    const topic=currentTopic(view);if(!topic.keys.length)return true;
    const content=itemSearchText(item,view);return topic.keys.some(key=>content.includes(norm(key)));
  }
  function topicKeysForItem(item,view){
    const content=itemSearchText(item,view);
    return Object.entries(QUESTION_TOPICS).filter(([key,t])=>key!=='all'&&t.keys.some(term=>content.includes(norm(term)))).slice(0,3).map(([key])=>key);
  }
  function visibleItems(view){
    const all=view==='questions'?state.data.questions:flattenNonQuestions(state.data),mode=viewSort(view);
    return all.filter(item=>itemMatchesTopic(item,view)&&itemMatchLevel(item,view)<99).map(item=>({item,match:itemMatchLevel(item,view)})).sort((a,b)=>a.match-b.match||(mode==='old'?a.item.episode-b.item.episode:b.item.episode-a.item.episode)||a.item.order-b.item.order).map(x=>x.item);
  }
  function repairMathText(value){
    return String(value||'')
      .replace(/\(0,\^\)/g,'0 °C')
      .replace(/\(0,\^=273\{,\}15,\)/g,'0 °C = 273,15 K')
      .replace(/\(546\{,\}3,\)/g,'546,3 K')
      .replace(/\(273,\^\)/g,'273 °C')
      .replace(/\(0,\)/g,'0 K')
      .replace(/\(-273\{,\}15,\^\)/g,'−273,15 °C')
      .replace(/\(-459\{,\}67,\^\)/g,'−459,67 °F')
      .replace(/\(-300\^\)/g,'−300 °F');
  }
  function highlightHtml(value,topic){
    const raw=repairMathText(value),terms=[...new Set([...queryTerms(),...(topic?.keys||[]).map(norm)])].filter(Boolean).sort((a,b)=>b.length-a.length);
    if(!terms.length)return esc(raw).replace(/([A-Za-z0-9]+)\s*\^\s*\{?(-?\d+)\}?/g,'$1<sup>$2</sup>');
    const normalized=norm(raw),ranges=[];
    for(const term of terms){let at=0;while((at=normalized.indexOf(term,at))>=0){ranges.push([at,at+term.length]);at+=Math.max(1,term.length)}}
    ranges.sort((a,b)=>a[0]-b[0]||b[1]-a[1]);const merged=[];
    for(const range of ranges){const last=merged.at(-1);if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);else merged.push([...range])}
    let out='',pos=0;for(const [a,b] of merged){out+=esc(raw.slice(pos,a))+'<mark>'+esc(raw.slice(a,b))+'</mark>';pos=b}out+=esc(raw.slice(pos));
    return out.replace(/([A-Za-z0-9]+)\s*\^\s*\{?(-?\d+)\}?/g,'$1<sup>$2</sup>');
  }
  function topicLabel(key){const t=QUESTION_TOPICS[key]||QUESTION_TOPICS.all;return sk()?t.sk:t.cs}
  function questionToolbar(view){
    const selected=view==='questions'?questionUi.qTopic:questionUi.nTopic,sort=viewSort(view);
    return '<div class="question-tools" data-tools="'+view+'"><div class="question-topics">'+Object.keys(QUESTION_TOPICS).map(key=>'<button type="button" class="question-topic '+(key===selected?'active':'')+'" data-topic="'+key+'">'+esc(topicLabel(key))+'</button>').join('')+'</div><select class="question-sort" aria-label="'+esc(text('Řazení','Zoradenie'))+'"><option value="new" '+(sort==='new'?'selected':'')+'>'+esc(text('Nejnovější','Najnovšie'))+'</option><option value="old" '+(sort==='old'?'selected':'')+'>'+esc(text('Nejstarší','Najstaršie'))+'</option></select></div>';
  }
  function shareButton(kind,value){return '<button type="button" class="deep-share" data-kind="'+kind+'" data-value="'+esc(value)+'" title="'+esc(text('Sdílet odkaz','Zdieľať odkaz'))+'" aria-label="'+esc(text('Sdílet odkaz','Zdieľať odkaz'))+'">🔗</button>'}
  function enhancedQuestionCard(item,view){
    const prefix=view==='questions'?'q':'n',id=itemId(item,prefix),open=(view==='questions'?questionUi.qOpen:questionUi.nOpen).has(id),copy=copyForViewItem(item,view),topic=currentTopic(view),ref=view==='questions'?qRef(item):'',deep=view==='questions'?Number(item.episode)+':'+Number(item.order):Number(item.episode)+':'+Number(item.order);
    const tags=topicKeysForItem(item,view).map(key=>'<span class="tag">'+esc(topicLabel(key))+'</span>').join('');
    return '<article class="card searchable question-card '+(open?'open':'')+'" data-item="'+esc(id)+'" data-search="'+esc(itemSearchText(item,view))+'"><div class="meta">'+text('Díl','Diel')+' '+item.episode+' • '+esc(item.sourceTime||item.time||'')+'</div><h2>'+highlightHtml(copy.title,topic)+'</h2><div class="question-answer"><ul>'+copy.points.map(point=>'<li>'+highlightHtml(point,topic)+'</li>').join('')+'</ul></div><div class="tags">'+tags+'</div><div class="actions"><button type="button" class="play" data-episode="'+item.episode+'" data-seconds="'+(Number(item.seconds)||0)+'" data-ref="'+esc(ref)+'">'+text('Přehrát','Prehrať')+'</button><button type="button" class="question-more">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>'+shareButton(view==='questions'?'question':'nonquestion',deep)+'</div></article>';
  }
  function renderQuestions(){
    const items=visibleItems('questions');$('#questions-v2').innerHTML=questionToolbar('questions')+items.map(item=>enhancedQuestionCard(item,'questions')).join('');$('#questions-v2').dataset.visible=String(items.length);queueQuestionMoreCheck('questions');
  }
  function renderNonQuestions(){
    const all=flattenNonQuestions(state.data),items=visibleItems('nonquestions');$('#nonquestions-v2').innerHTML=questionToolbar('nonquestions')+items.map(item=>enhancedQuestionCard(item,'nonquestions')).join('');$('#nonquestions-v2').dataset.count=String(all.length);$('#nonquestions-v2').dataset.visible=String(items.length);queueQuestionMoreCheck('nonquestions');
  }
  function questionCountLabel(view,count,filtered){
    if(view==='questions')return filtered?count+' '+text('nalezených otázek','nájdených otázok'):count+' '+text('otázek','otázok');
    return filtered?count+' '+text('nalezených neotázek','nájdených neotázok'):count+' '+text('neotázek','neotázok');
  }
  function filterActive(){
    const q=norm(state.query.trim()),active=$('.view-v2[data-view="'+state.view+'"]');if(!active)return;
    if(state.view==='questions'||state.view==='nonquestions'){
      if(state.view==='questions')renderQuestions();else renderNonQuestions();
      const selected=currentTopic(state.view),filtered=Boolean(q)||selected!==QUESTION_TOPICS.all,count=Number(active.dataset.visible)||0,total=state.view==='questions'?state.data.questions.length:Number(active.dataset.count)||0;
      $('#count-v2').textContent=questionCountLabel(state.view,filtered?count:total,filtered);return;
    }
    const cards=[...active.querySelectorAll('.searchable')];let shown=0;cards.forEach(card=>{const ok=!q||String(card.dataset.search||'').includes(q);card.classList.toggle('filtered-out',!ok);if(ok)shown++});
    if(state.view==='episodes')$('#count-v2').textContent=q?shown+' '+text('nalezených epizod','nájdených epizód'):state.data.episodes.length+' '+text('epizod','epizód');
    else if(state.view==='series')$('#count-v2').textContent=q?shown+' '+text('nalezených sérií','nájdených sérií'):state.data.series.length+' '+text('sérií','sérií');
    else if(state.view==='playlists')$('#count-v2').textContent=q?shown+' '+text('nalezených playlistů','nájdených playlistov'):state.playlists.length+' '+text('playlistů','playlistov');
    else $('#count-v2').textContent=text('Lokální data','Lokálne dáta');
  }
  function queueQuestionMoreCheck(view){
    requestAnimationFrame(()=>{const root=view==='questions'?$('#questions-v2'):$('#nonquestions-v2');root?.querySelectorAll('.question-card').forEach(card=>{const answer=card.querySelector('.question-answer'),button=card.querySelector('.question-more');if(!answer||!button)return;button.classList.toggle('hidden',!card.classList.contains('open')&&answer.scrollHeight<=answer.clientHeight+2)})});
  }
  function hashText(value){let hash=2166136261;for(const char of String(value||'')){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return(hash>>>0).toString(36)}
  function slug(value){return norm(value).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
  function oldEpisodeKey(episode){return Number(episode?.number||0)+'-'+hashText(episode?.id||episode?.link||episode?.enclosure||episode?.title||'')}
  function oldSeriesKey(series){const signature=(series?.episodes||[]).map(number=>oldEpisodeKey(episodeByNumber(number))).sort().join('|');return hashText(signature)+'.'+slug(series?.name||'serie')}
  async function shareDeep(kind,value){
    const url=new URL(location.href);url.hash=kind+'='+encodeURIComponent(value);
    try{if(navigator.share){await navigator.share({url:url.href});return}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url.href);alert(text('Odkaz byl zkopírován.','Odkaz bol skopírovaný.'));return}}catch(error){if(error?.name==='AbortError')return}
    prompt(text('Zkopírujte odkaz:','Skopírujte odkaz:'),url.href);
  }
  function enhanceDeepShareButtons(){
    $('#episodes-v2')?.querySelectorAll('article[data-episode]').forEach(card=>{const actions=card.querySelector('.actions'),number=Number(card.dataset.episode);if(actions&&!actions.querySelector('.deep-share'))actions.insertAdjacentHTML('beforeend',shareButton('episode',String(number)))});
    $('#series-v2')?.querySelectorAll('.series[data-series-index]').forEach(card=>{const summary=card.querySelector('summary'),index=Number(card.dataset.seriesIndex),series=state.data.series[index];if(summary&&series&&!summary.querySelector('.deep-share'))summary.insertAdjacentHTML('beforeend',shareButton('series',slug(series.name)))});
  }
  function markDeepTarget(element){if(!element)return false;$$('.deep-target').forEach(node=>node.classList.remove('deep-target'));element.classList.add('deep-target');element.open=true;try{element.scrollIntoView({behavior:'smooth',block:'center'})}catch{}setTimeout(()=>element.classList.remove('deep-target'),3600);return true}
  function findEpisodeFromDeep(value){const raw=String(value||''),number=Number(/^\d+$/.test(raw)?raw:raw.split('-')[0]);return episodeByNumber(number)}
  async function processDeepLink(){
    if(questionUi.deepProcessing)return;const raw=location.hash.replace(/^#/,'');if(!raw)return;const params=new URLSearchParams(raw),entry=[...params.entries()].find(([key])=>['episode','question','nonquestion','series'].includes(key));if(!entry)return;
    questionUi.deepProcessing=true;try{
      const [kind,value]=entry;
      if(kind==='episode'){
        const episode=findEpisodeFromDeep(value);if(!episode)return;setView('episodes');state.query='';$('#search-v2').value='';filterActive();markDeepTarget($('#episodes-v2 article[data-episode="'+episode.number+'"]'));return;
      }
      if(kind==='question'||kind==='nonquestion'){
        const view=kind==='question'?'questions':'nonquestions';let episode=0,order=-1,secondsValue=-1;const direct=String(value).match(/^(\d+):(\d+)$/),legacy=String(value).match(/^(.+)@(\d+)$/);
        if(direct){episode=Number(direct[1]);order=Number(direct[2])}else if(legacy){episode=Number(String(legacy[1]).split('-')[0]);secondsValue=Number(legacy[2])}else return;
        setView(view);state.query='';$('#search-v2').value='';if(view==='questions')questionUi.qTopic='all';else questionUi.nTopic='all';filterActive();
        let item;if(view==='questions')item=state.data.questions.find(x=>Number(x.episode)===episode&&(order>=0?Number(x.order)===order:Number(x.seconds)===secondsValue));else item=flattenNonQuestions(state.data).find(x=>Number(x.episode)===episode&&(order>=0?Number(x.order)===order:Number(x.seconds)===secondsValue));
        if(item)markDeepTarget($("[data-item='"+itemId(item,view==='questions'?'q':'n')+"']"));return;
      }
      if(kind==='series'){
        const target=decodeURIComponent(value),index=state.data.series.findIndex(series=>slug(series.name)===target||oldSeriesKey(series)===target||oldSeriesKey(series).split('.')[0]===target.split('.')[0]);if(index<0)return;setView('series');state.query='';$('#search-v2').value='';filterActive();markDeepTarget($('#series-v2 .series[data-series-index="'+index+'"]'));
      }
    }finally{questionUi.deepProcessing=false}
  }
  function installEnhancedQuestionUi(){
    if(questionUi.installed)return;questionUi.installed=true;
    const style=document.createElement('style');style.dataset.v2QuestionExperience='1';style.textContent='.question-tools{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:2px}.question-topics{display:flex;gap:7px;overflow:auto;padding:2px 0}.question-topic{white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--ink);padding:7px 10px;cursor:pointer}.question-topic.active{background:var(--accent2);border-color:#8b7ee8;color:#392b9b;font-weight:800}.question-sort{border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);padding:8px;flex:0 0 auto}.question-answer{line-height:1.48;max-height:7.7em;overflow:hidden}.question-card.open .question-answer{max-height:none}.question-answer ul{margin:.4rem 0;padding-left:1.15rem}.question-answer li{margin:.22rem 0}.question-more,.deep-share{border:1px solid var(--line)!important;background:#fff!important;color:var(--ink)!important;flex:0 0 auto!important}.deep-share{min-width:42px!important}.question-card mark{background:#ffe56b;color:#171717;border-radius:3px;padding:0 .08em}.question-card sup{font-size:.75em}.deep-target{outline:3px solid var(--accent)!important;outline-offset:4px;animation:v2DeepPulse 1.2s ease-in-out 2}@keyframes v2DeepPulse{50%{box-shadow:0 0 0 9px rgba(91,75,219,.2)}}@media(max-width:700px){.question-tools{align-items:flex-start;flex-direction:column}.question-sort{width:100%}}';document.head.append(style);
    document.addEventListener('click',event=>{
      const topicButton=event.target.closest?.('.question-topic');if(topicButton){const tools=topicButton.closest('.question-tools'),view=tools?.dataset.tools;if(view==='questions')questionUi.qTopic=topicButton.dataset.topic;else if(view==='nonquestions')questionUi.nTopic=topicButton.dataset.topic;filterActive();return}
      const more=event.target.closest?.('.question-more');if(more){const card=more.closest('.question-card'),id=card?.dataset.item,set=state.view==='questions'?questionUi.qOpen:questionUi.nOpen;if(!id)return;if(set.has(id))set.delete(id);else set.add(id);card.classList.toggle('open',set.has(id));more.textContent=set.has(id)?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac');queueQuestionMoreCheck(state.view);return}
      const share=event.target.closest?.('.deep-share');if(share){event.preventDefault();event.stopPropagation();shareDeep(share.dataset.kind,share.dataset.value);return}
    });
    document.addEventListener('change',event=>{const sort=event.target.closest?.('.question-sort');if(!sort)return;const view=sort.closest('.question-tools')?.dataset.tools;if(view==='questions')questionUi.qSort=sort.value;else if(view==='nonquestions')questionUi.nSort=sort.value;filterActive()});
    window.addEventListener('hashchange',processDeepLink);window.addEventListener('vedatorlanguagechange',()=>{enhanceDeepShareButtons();filterActive()});enhanceDeepShareButtons();processDeepLink();
  }
  window.addEventListener('vedator-v2-ready',()=>{installEnhancedQuestionUi();enhanceDeepShareButtons();processDeepLink()});

  async function start(){
    const status=$('#status-v2');
    try{
      const response=await fetch('./content-v2.json',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);state.data=await response.json();
      buildLegacyQuestionIndex();loadUserData();applyStaticUi();renderEpisodes();renderSeries();renderQuestions();renderNonQuestions();renderPlaylists();renderData();bind();setView('episodes');
      status.textContent=`${text('V2 načtena','V2 načítaná')}: ${state.data.episodes.length} ${text('epizod','epizód')}, ${state.data.questions.length} ${text('otázek','otázok')}.`;
      document.documentElement.dataset.vedatorV2Ready='1';window.dispatchEvent(new CustomEvent('vedator-v2-ready',{detail:{episodes:state.data.episodes.length,questions:state.data.questions.length,playlists:state.playlists.length,language:state.language}}));setTimeout(importSharedPlaylist,0);
    }catch(error){status.textContent=`${text('V2 se nepodařilo načíst','V2 sa nepodarilo načítať')}: ${error.message}`;status.classList.add('error');console.error(error)}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();