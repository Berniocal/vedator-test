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

  /* V2_EPISODE_EXPERIENCE_V1 */
  function episodeSummaryItems(number){
    const questions=(state.data?.questions||[]).filter(item=>Number(item.episode)===Number(number)).map(item=>{
      const copy=questionCopy(item);
      return {type:'question',episode:Number(number),order:Number(item.order)||0,time:item.sourceTime||item.time||'',seconds:Number(item.seconds)||0,title:copy.title,points:copy.points,ref:qRef(item)};
    });
    if(questions.length)return questions;
    return flattenNonQuestions(state.data).filter(item=>Number(item.episode)===Number(number)).map(item=>({type:'nonquestion',episode:Number(number),order:Number(item.order)||0,time:item.sourceTime||item.time||'',seconds:Number(item.seconds)||0,title:item.title,points:item.points||[],ref:''}));
  }
  function episodeProgress(number){
    const record=state.progress[episodeKey(number)]||{},duration=Number(record.duration)||0,current=Number(record.currentTime)||0;
    const percent=record.completed?100:(duration>0?Math.max(0,Math.min(100,Math.round(current/duration*100))):0);
    return {record,duration,current,percent,active:Boolean(record.completed)||current>10};
  }
  function episodeProgressHtml(number){
    const info=episodeProgress(number);if(!info.active)return'';
    const timeLabel=info.duration>0?fmtTime(info.current)+' / '+fmtTime(info.duration):fmtTime(info.current);
    return '<div class="episode-progress-v2"><progress max="100" value="'+info.percent+'"></progress><span>'+esc(timeLabel)+'</span></div>';
  }
  function episodeSummaryHtml(episode){
    const items=episodeSummaryItems(episode.number);if(!items.length)return'';
    const label=items.length===1?text('1 kapitola','1 kapitola'):items.length+' '+text('kapitol','kapitol');
    return '<details class="episode-summary-v2"><summary><span>'+esc(text('Shrnutí dílu','Zhrnutie dielu'))+'</span><small>'+esc(label)+'</small></summary><div class="episode-summary-body-v2">'+items.map(item=>'<section class="episode-chapter-v2"><div class="episode-chapter-head-v2"><button type="button" class="play episode-chapter-play-v2" data-episode="'+item.episode+'" data-seconds="'+item.seconds+'" data-ref="'+esc(item.ref)+'">▶ '+esc(item.time||fmtTime(item.seconds))+'</button><strong>'+esc(item.title)+'</strong></div>'+(item.points?.length?'<ul>'+item.points.map(point=>'<li>'+esc(point)+'</li>').join('')+'</ul>':'')+'</section>').join('')+'</div></details>';
  }
  function seriesProgressInfo(series){
    const episodes=(series?.episodes||[]).map(number=>episodeByNumber(number)).filter(Boolean),total=episodes.length;
    const records=episodes.map(episode=>({episode,record:state.progress[episodeKey(episode.number)]||{}}));
    const completed=records.filter(item=>item.record.completed).length;
    let resumeIndex=-1;
    const collection=state.collectionProgress['series:'+norm(series?.name||'')];
    if(collection?.lastItemId){
      const last=records.findIndex(item=>'episode:'+item.episode.number===collection.lastItemId);
      if(last>=0){
        if(!records[last].record.completed)resumeIndex=last;
        else if(last+1<records.length)resumeIndex=last+1;
      }
    }
    if(resumeIndex<0)resumeIndex=records.findIndex(item=>!item.record.completed&&Number(item.record.currentTime)>10);
    if(resumeIndex<0)resumeIndex=records.findIndex(item=>!item.record.completed);
    if(resumeIndex<0)resumeIndex=0;
    const percent=total?Math.round(completed/total*100):0;
    const started=records.some(item=>item.record.completed||Number(item.record.currentTime)>10);
    const finished=total>0&&completed===total;
    return {episodes,records,total,completed,percent,resumeIndex,started,finished};
  }
  function seriesResumeLabel(info){
    if(info.finished)return text('Přehrát znovu','Prehrať znova');
    if(info.started)return text('Pokračovat v sérii','Pokračovať v sérii');
    return text('Začít sérii','Začať sériu');
  }
  function seriesProgressLabel(info){return info.completed+' / '+info.total+' '+text('poslechnuto','vypočuté')}
  function refreshSeriesProgress(){
    $$('#series-v2 .series[data-series-index]').forEach(card=>{
      const index=Number(card.dataset.seriesIndex),series=state.data?.series?.[index];if(!series)return;
      const info=seriesProgressInfo(series),label=card.querySelector('.series-progress-label-v2'),progress=card.querySelector('.series-progress-bar-v2'),resume=card.querySelector('.series-resume-v2');
      if(label)label.textContent=seriesProgressLabel(info);if(progress)progress.value=info.percent;
      if(resume){resume.textContent=seriesResumeLabel(info);resume.dataset.itemIndex=String(info.resumeIndex)}
      card.querySelectorAll('.series-item-status-v2[data-episode]').forEach(node=>{const status=episodeStatus(Number(node.dataset.episode));node.textContent=status?.kind==='done'?'✓':status?.kind==='progress'?'▶':'';node.title=status?.label||''});
    });
  }
  function installEpisodeExperienceStyles(){
    if(document.querySelector('style[data-v2-episode-experience]'))return;
    const style=document.createElement('style');style.dataset.v2EpisodeExperience='1';style.textContent='.episode-progress-v2{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;margin:.15rem 0 .65rem;color:var(--muted);font-size:.78rem}.episode-progress-v2 progress,.series-progress-bar-v2{width:100%;height:7px;accent-color:var(--accent)}.episode-summary-v2{margin:.55rem 0 .8rem;border:1px solid var(--line);border-radius:12px;background:#fafaff}.episode-summary-v2>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;cursor:pointer;font-weight:800;list-style:none;color:#392b9b}.episode-summary-v2>summary::-webkit-details-marker{display:none}.episode-summary-v2>summary small{font-weight:600;color:var(--muted)}.episode-summary-body-v2{padding:0 10px 8px}.episode-chapter-v2{padding:9px 0;border-top:1px solid var(--line)}.episode-chapter-head-v2{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:start}.episode-chapter-play-v2{border:0!important;background:var(--accent2)!important;color:#392b9b!important;padding:5px 7px!important;min-width:68px!important;flex:0 0 auto!important}.episode-chapter-v2 ul{margin:.45rem 0 0;padding-left:1.2rem}.episode-chapter-v2 li{margin:.2rem 0;line-height:1.4}.series-progress-summary-v2{display:flex;gap:8px;align-items:center;color:var(--muted);font-size:.78rem;white-space:nowrap}.series-progress-box-v2{padding:0 0 12px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.series-progress-main-v2{display:grid;gap:4px}.series-resume-v2{border:0;border-radius:10px;background:var(--accent);color:white;padding:8px 11px;font-weight:800;cursor:pointer}.series-item{display:flex!important;gap:7px;align-items:flex-start}.series-item-status-v2{width:1.1rem;flex:0 0 1.1rem;color:var(--ok);font-weight:900}@media(max-width:700px){.episode-chapter-head-v2{grid-template-columns:1fr}.episode-chapter-play-v2{justify-self:start}.series-progress-box-v2{grid-template-columns:1fr}.series-resume-v2{width:100%}}';document.head.append(style);
  }

  function cardEpisode(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number);
    return `<article class="card searchable" data-episode="${Number(episode.number)||0}" data-search="${esc(allEpisodeSearch(episode))}">
      <div class="meta">${text('Díl','Diel')} ${episode.number||'–'} • ${esc(fmtDate(episode.date))}</div>
      <h2>${esc(copy.title)}</h2>
      <div class="listen-status ${status?.kind||''}">${status?esc(status.label):''}</div>
      ${episodeProgressHtml(episode.number)}
      <p>${esc(copy.description)}</p>
      ${episodeSummaryHtml(episode)}
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
      const eps=series.episodes.map(n=>byNumber.get(Number(n))).filter(Boolean),label=seriesLabel(series),info=seriesProgressInfo(series);
      const search=norm(`${series.i18n?.cs||series.name} ${series.i18n?.sk||''} ${eps.map(e=>allEpisodeSearch(e)).join(' ')}`);
      return `<details class="series searchable" data-series-index="${seriesIndex}" data-search="${esc(search)}"><summary><strong>${esc(label)}</strong><span class="series-progress-summary-v2"><span>${eps.length} ${text('dílů','dielov')}</span><span class="series-progress-label-v2">${esc(seriesProgressLabel(info))}</span></span></summary><div class="series-progress-box-v2"><div class="series-progress-main-v2"><progress class="series-progress-bar-v2" max="100" value="${info.percent}"></progress><small>${esc(info.finished?text('Série je dokončená.','Séria je dokončená.'):text('Průběh se ukládá automaticky.','Priebeh sa ukladá automaticky.'))}</small></div><button type="button" class="series-resume-v2" data-series-index="${seriesIndex}" data-item-index="${info.resumeIndex}">${esc(seriesResumeLabel(info))}</button></div><ol>${eps.map((e,index)=>{const status=episodeStatus(e.number);return `<li><button type="button" class="series-item" data-series-index="${seriesIndex}" data-item-index="${index}"><span class="series-item-status-v2" data-episode="${e.number}" title="${esc(status?.label||'')}">${status?.kind==='done'?'✓':status?.kind==='progress'?'▶':''}</span><span>${text('Díl','Diel')} ${e.number}: ${esc(episodeCopy(e).title)}</span></button></li>`}).join('')}</ol></details>`;
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
    const labels={episodes:text('Epizody','Epizódy'),series:text('Série','Série'),questions:text('Otázky','Otázky'),nonquestions:text('Neotázky','Neotázky'),ask:text('Zeptej se','Spýtaj sa'),playlists:'Playlisty',data:text('Moje data','Moje dáta')};
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
    n.play.textContent=audio.paused?'▶':'❚❚';n.play.title=audio.paused?text('Přehrát','Prehrať'):text('Pauza','Pauza');n.play.setAttribute('aria-label',n.play.title);
    n.prev.title=text('Předchozí','Predchádzajúca');n.next.title=text('Další','Ďalšia');
    n.speed.textContent=`${String(state.speed).replace('.',',')}×`;n.prev.disabled=!state.context||state.context.index<=0;n.next.disabled=!state.context||state.context.index>=state.context.items.length-1;
    if(!n.download.dataset.busy)n.download.textContent=text('⇩ MP3','⇩ MP3');n.download.removeAttribute('href');n.download.setAttribute('role','button');
    if(!n.offline.dataset.busy)n.offline.textContent=currentOfflineRecord()?text('✓ Offline','✓ Offline'):text('📱 Offline','📱 Offline');
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
    writeJson(PROGRESS_KEY,state.progress);saveCollectionProgress(time,duration,completed);refreshEpisodeCard(current.episode.number);if(force||completed!==Boolean(previous.completed)){refreshSeriesProgress();refreshPlaylistProgress()}
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
    const url=current.episode.enclosure;if(!url)return;n.offline.disabled=true;n.offline.dataset.busy='1';n.offline.textContent=text('Offline 0 %','Offline 0 %');n.help.textContent=text('Ukládám epizodu offline…','Ukladám epizódu offline…');
    try{
      try{await navigator.storage?.persist?.()}catch{}
      const response=await fetch(url,{mode:'cors',cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const total=Number(response.headers.get('content-length'))||0,type=response.headers.get('content-type')||'audio/mpeg',reader=response.body?.getReader();let blob,loaded=0;
      if(reader){const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;if(total){const percent=Math.min(99,Math.floor(loaded/total*100));n.offline.textContent='Offline '+percent+' %';n.help.textContent=text('Ukládám offline: ','Ukladám offline: ')+finalFormatMb(loaded)+' / '+finalFormatMb(total)}else{n.offline.textContent=text('Ukládám…','Ukladám…');n.help.textContent=text('Ukládám offline: ','Ukladám offline: ')+finalFormatMb(loaded)}}blob=new Blob(chunks,{type})}else blob=await response.blob();n.offline.textContent='Offline 100 %';
      const cacheUrl=new URL(`./__vedator_offline_audio__/${encodeURIComponent(key)}.mp3`,location.href).href,cache=await caches.open(OFFLINE_CACHE);
      await cache.put(cacheUrl,new Response(blob,{status:200,headers:{'Content-Type':type||blob.type||'audio/mpeg','Content-Length':String(blob.size),'Accept-Ranges':'bytes','X-Vedator-Original-Url':url}}));
      state.offlineIndex[key]={key,title:episodeCopy(current.episode).title,number:Number(current.episode.number),originalUrl:url,cacheUrl,size:blob.size,type:blob.type||'audio/mpeg',savedAt:Date.now()};writeJson(OFFLINE_INDEX_KEY,state.offlineIndex);n.help.textContent=`${text('Epizoda je uložená offline','Epizóda je uložená offline')} (${(blob.size/1048576).toFixed(1).replace('.',',')} MB).`;
    }catch(error){console.warn(error);n.help.textContent=text('Offline uložení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.','Offline uloženie sa nepodarilo. Skontrolujte pripojenie a skúste to znova.')}finally{delete n.offline.dataset.busy;n.offline.disabled=false;syncPlayer()}
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
    try{await caches.delete(OFFLINE_CACHE)}catch{}state.language='sk';applyTheme(systemPreferredTheme(),false);loadUserData();rerenderLanguage();$('#status-v2').textContent=text('Veškerá data aplikace byla smazána.','Všetky dáta aplikácie boli zmazané.');
  }

  function bind(){
    $$('.tab-v2').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $$('.language-v2 button[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
    $('#search-v2').addEventListener('input',event=>{if(state.view==='ask'){askUi.draft=event.target.value;return}state.query=event.target.value;filterActive()});
    $('#search-v2').addEventListener('keydown',event=>{if(state.view==='ask'&&event.key==='Enter'){event.preventDefault();submitAsk()}});
    $('#ask-submit-v2').addEventListener('click',submitAsk);
    document.addEventListener('click',event=>{
      const play=event.target.closest?.('.play');
      if(play){const episode=episodeByNumber(Number(play.dataset.episode)),seconds=play.dataset.seconds===''?null:Number(play.dataset.seconds)||0;if(episode)openPlayback(episode,{start:seconds,itemRef:play.dataset.ref||epRef(episode.number)});return}
      const seriesResume=event.target.closest?.('.series-resume-v2');
      if(seriesResume){const series=state.data.series[Number(seriesResume.dataset.seriesIndex)],index=Number(seriesResume.dataset.itemIndex)||0,context=seriesContext(series,index),item=context.items[index];if(item)openPlayback(item.episode,{start:null,context,itemRef:item.ref});return}
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
    if(questionUi.deepProcessing)return;if(location.hash==='#ask'){setView('ask');return}const raw=location.hash.replace(/^#/,'');if(!raw)return;const params=new URLSearchParams(raw),entry=[...params.entries()].find(([key])=>['episode','question','nonquestion','series'].includes(key));if(!entry)return;
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


  /* V2_UI_EXPERIENCE_V1 */
  const THEME_KEY='vedator-ui-theme-v1';
  function systemPreferredTheme(){
    try{return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{return'light'}
  }
  function storedTheme(){
    try{const saved=localStorage.getItem(THEME_KEY);return saved==='dark'||saved==='light'?saved:''}catch{return''}
  }
  function currentTheme(){
    const html=document.documentElement.dataset.theme;
    return html==='dark'||html==='light'?html:(storedTheme()||systemPreferredTheme());
  }
  function updateThemeButton(){
    const button=$('#theme-toggle-v2');if(!button)return;
    const dark=currentTheme()==='dark';
    const label=dark?text('Přepnout na světlý režim','Prepnúť na svetlý režim'):text('Přepnout na tmavý režim','Prepnúť na tmavý režim');
    button.textContent=dark?'☀':'☾';button.title=label;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(dark));
  }
  function updateBackTopLabel(){
    const button=$('#back-top-v2');if(!button)return;
    const label=text('Nahoru','Nahor');button.title=label;button.setAttribute('aria-label',label);
  }
  function applyTheme(theme,persist=true){
    const next=theme==='dark'?'dark':'light';document.documentElement.dataset.theme=next;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=next==='dark'?'#0b0e16':'#151b2f';
    if(persist){try{localStorage.setItem(THEME_KEY,next)}catch{}}
    updateThemeButton();
    window.dispatchEvent(new CustomEvent('vedatorthemechange',{detail:{theme:next}}));
  }
  function updateBackTopVisibility(){
    const button=$('#back-top-v2');if(!button)return;
    button.classList.toggle('hidden',Number(window.scrollY||0)<650);
  }
  function installUiExperience(){
    if(document.documentElement.dataset.v2UiInstalled==='1')return;
    document.documentElement.dataset.v2UiInstalled='1';
    applyTheme(storedTheme()||currentTheme(),false);updateBackTopLabel();updateBackTopVisibility();
    $('#theme-toggle-v2')?.addEventListener('click',()=>applyTheme(currentTheme()==='dark'?'light':'dark',true));
    $('#back-top-v2')?.addEventListener('click',()=>{
      let behavior='smooth';try{if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)behavior='auto'}catch{}
      try{window.scrollTo({top:0,behavior})}catch{window.scrollTo?.(0,0)}
    });
    window.addEventListener('scroll',updateBackTopVisibility,{passive:true});
    window.addEventListener('vedatorlanguagechange',()=>{updateThemeButton();updateBackTopLabel()});
    try{
      const media=window.matchMedia?.('(prefers-color-scheme: dark)');
      media?.addEventListener?.('change',event=>{if(!storedTheme())applyTheme(event.matches?'dark':'light',false)});
    }catch{}
  }


  /* V2_FULL_PARITY_V1 */
  const PARITY_BATCH=20;
  const PARITY_SORT_KEY='vedatorSortPreferencesV1';
  const PARITY_MATH_EPISODES=new Set([91,93,98,113,115,116,117,118,156,181,198,201,216,249,282,286,328,329,336]);
  const EPISODE_TOPICS={
    all:{cs:'Vše',sk:'Všetko',keys:[]},
    faq:{cs:'FAQ',sk:'FAQ',keys:['faq','dobre otazky']},
    alien:{cs:'Mimozemský život',sk:'Mimozemský život',keys:['mimozem','astrobiolog','exoplanet','civiliz','biosignat']},
    cosmology:{cs:'Kosmologie',sk:'Kozmológia',keys:['kozmolog','kosmolog','velky tresk','rozpin','casopriestor']},
    darkenergy:{cs:'Temná energie',sk:'Tmavá energia',keys:['tmava energia','temna energie','dark energy']},
    blackholes:{cs:'Černé díry',sk:'Čierne diery',keys:['cierna diera','cerna dira','cierne diery','cerne diry','black hole']},
    quantum:{cs:'Kvantová fyzika',sk:'Kvantová fyzika',keys:['kvant','superpoz','previazan','provazan']},
    relativity:{cs:'Relativita',sk:'Relativita',keys:['relativit','dilatacia casu','rychlost svetla']},
    astronomy:{cs:'Astronomie',sk:'Astronómia',keys:['hviezd','hvezd','planet','galaxi','teleskop','slnko','slunce','mesiac','mesic','mars','jupiter']},
    bio:{cs:'Biologie a medicína',sk:'Biológia a medicína',keys:['bunk','mozog','mozek','gen','evol','virus','bakter','sperm','vajic','alzheimer','dopamin']},
    math:{cs:'Matematika',sk:'Matematika',keys:['matemat','geometri','fraktal','nekonec','chaos','pravdepodob']},
    tech:{cs:'Technologie a AI',sk:'Technológie a AI',keys:['umela inteligencia','umela inteligence','internet','pocitac','robot','algoritm']},
    earth:{cs:'Země a příroda',sk:'Zem a príroda',keys:['zemetrasen','sopk','tornad','hurikan','klima','ocean','geolog']},
    chemistry:{cs:'Chemie a materiály',sk:'Chémia a materiály',keys:['chem','molekul','atom','prvok','prvek','helium','material']},
    society:{cs:'Společnost a psychologie',sk:'Spoločnosť a psychológia',keys:['socialne siete','socialni site','psychol','spolocnost','spolecnost','moral','radikaliz','ekonom','peniaz','penez']}
  };
  const EPISODE_QUERY_EQUIV=[['cerna dira','cierna diera'],['cerne diry','cierne diery'],['cernych der','ciernych dier'],['temna energie','tmava energia'],['temna hmota','tmava hmota'],['umela inteligence','umela inteligencia'],['slunce','slnko'],['mesic','mesiac'],['hvezda','hviezda'],['hvezdy','hviezdy'],['mozek','mozog'],['zivot ve vesmiru','zivot vo vesmire'],['casoprostor','casopriestor'],['spolecnost','spolocnost'],['socialni site','socialne siete'],['penize','peniaze']];
  const parityPrefs=readJson(PARITY_SORT_KEY,{});
  const parityUi={episodeTopic:'all',episodeSort:parityPrefs.episode||'new',seriesSort:parityPrefs.series||'count',observers:new Map(),generations:new Map(),mediaTick:0,installed:false};

  function parityTopicLabel(topic){return esc(sk()?topic.sk:topic.cs)}
  function expandedEpisodeQuery(value){
    const base=norm(value);if(!base)return[];const out=new Set([base]);
    for(let pass=0;pass<3;pass++)for(const current of [...out])for(const group of EPISODE_QUERY_EQUIV)for(const sourceValue of group){
      const src=norm(sourceValue),at=current.indexOf(src);if(at<0)continue;
      for(const target of group)out.add(current.slice(0,at)+norm(target)+current.slice(at+src.length));
    }
    return [...out];
  }
  function episodeSearchParts(episode){
    const cs=episode?.i18n?.cs||{},skCopy=episode?.i18n?.sk||{};
    return {titles:norm([episode?.title,cs.title,skCopy.title].filter(Boolean).join(' ')),descriptions:norm([episode?.description,cs.description,skCopy.description].filter(Boolean).join(' '))};
  }
  function episodeMatchLevel(episode,queries){
    if(!queries.length)return 0;const parts=episodeSearchParts(episode);
    if(queries.some(query=>parts.titles.includes(query)))return 0;
    if(queries.some(query=>query.split(' ').every(word=>parts.titles.includes(word))))return 1;
    if(queries.some(query=>parts.descriptions.includes(query)))return 2;
    if(queries.some(query=>query.split(' ').every(word=>parts.descriptions.includes(word))))return 3;
    return 99;
  }
  function episodeCategoryKeys(episode){
    const content=allEpisodeSearch(episode),result=[];
    for(const [key,topic] of Object.entries(EPISODE_TOPICS)){
      if(key==='all')continue;
      if(topic.keys.some(value=>content.includes(norm(value))))result.push(key);
    }
    if(PARITY_MATH_EPISODES.has(Number(episode.number))&&!result.includes('math'))result.push('math');
    return result;
  }
  function episodeTagHtml(episode){const keys=episodeCategoryKeys(episode);const labels=keys.length?keys.map(key=>parityTopicLabel(EPISODE_TOPICS[key])):[esc(text('Ostatní','Ostatné'))];return '<div class="tags parity-tags">'+labels.map(label=>'<span class="tag">'+label+'</span>').join('')+'</div>'}
  function shortParityDescription(value){const raw=String(value||'').trim();if(raw.length<=440)return raw;return raw.slice(0,437).replace(/\s+\S*$/,'')+'…'}
  function listenRank(episode,sort){
    const status=episodeStatus(episode.number)?.kind||'unheard';
    const orders={started:{progress:0,unheard:1,done:2},completed:{done:0,progress:1,unheard:2},unheard:{unheard:0,progress:1,done:2}};
    return orders[sort]?.[status]??0;
  }
  function sortedParityEpisodes(){
    const queries=expandedEpisodeQuery(state.query.trim()),topic=EPISODE_TOPICS[parityUi.episodeTopic]||EPISODE_TOPICS.all;
    const topicQueries=topic.keys.flatMap(expandedEpisodeQuery),sort=parityUi.episodeSort;
    const items=(state.data?.episodes||[]).map(episode=>({episode,searchMatch:episodeMatchLevel(episode,queries),topicMatch:episodeMatchLevel(episode,topicQueries)})).filter(item=>{
      if(queries.length&&item.searchMatch>=99)return false;
      if(parityUi.episodeTopic==='math'&&!PARITY_MATH_EPISODES.has(Number(item.episode.number)))return false;
      if(topicQueries.length&&item.topicMatch>=99)return false;
      return true;
    });
    items.sort((a,b)=>{
      if(topicQueries.length&&a.topicMatch!==b.topicMatch)return a.topicMatch-b.topicMatch;
      if(queries.length&&a.searchMatch!==b.searchMatch)return a.searchMatch-b.searchMatch;
      if(['started','completed','unheard'].includes(sort)){
        const difference=listenRank(a.episode,sort)-listenRank(b.episode,sort);if(difference)return difference;
      }
      if(sort==='old')return new Date(a.episode.date)-new Date(b.episode.date);
      if(sort==='number')return(Number(b.episode.number)||0)-(Number(a.episode.number)||0);
      return new Date(b.episode.date)-new Date(a.episode.date)||(Number(b.episode.number)||0)-(Number(a.episode.number)||0);
    });
    return items.map(item=>item.episode);
  }

  function cardEpisode(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number);
    return '<article class="card searchable episode-card-v2" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+esc(copy.title)+'</h2>'+
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<p class="desc-v2">'+esc(shortParityDescription(copy.description))+'</p>'+episodeTagHtml(episode)+episodeSummaryHtml(episode)+
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+
      (episode.link?'<a class="secondary" href="'+esc(episode.link)+'">'+text('Detail','Detail')+'</a>':'')+shareButton('episode',String(episode.number))+'</div></article>';
  }

  function parityDeepIndex(view,items){
    const raw=location.hash.replace(/^#/,'');if(!raw)return-1;const params=new URLSearchParams(raw);
    if(view==='episodes'&&params.has('episode')){const number=Number(String(params.get('episode')).split('-')[0]);return items.findIndex(item=>Number(item.number)===number)}
    if(view==='questions'&&params.has('question')){const match=String(params.get('question')).match(/^(\d+):(\d+)$/);return match?items.findIndex(item=>Number(item.episode)===Number(match[1])&&Number(item.order)===Number(match[2])):-1}
    if(view==='nonquestions'&&params.has('nonquestion')){const match=String(params.get('nonquestion')).match(/^(\d+):(\d+)$/);return match?items.findIndex(item=>Number(item.episode)===Number(match[1])&&Number(item.order)===Number(match[2])):-1}
    return-1;
  }
  function disconnectParityObserver(view){const observer=parityUi.observers.get(view);if(observer)observer.disconnect();parityUi.observers.delete(view)}
  function mountParityBatch(view,container,items,renderer,afterAppend){
    disconnectParityObserver(view);const generation=(parityUi.generations.get(view)||0)+1;parityUi.generations.set(view,generation);container.replaceChildren();
    if(!items.length){container.innerHTML='<div class="empty parity-empty">'+text('Nic jsem nenašel.','Nič som nenašiel.')+'</div>';return}
    let rendered=0;const deepIndex=parityDeepIndex(view,items),firstCount=Math.max(PARITY_BATCH,deepIndex>=0?deepIndex+1:0);
    const sentinel=document.createElement('button');sentinel.type='button';sentinel.className='parity-sentinel';
    const append=(amount=PARITY_BATCH)=>{
      if(parityUi.generations.get(view)!==generation)return;const end=Math.min(rendered+(rendered===0?firstCount:amount),items.length);
      const html=items.slice(rendered,end).map((item,index)=>renderer(item,rendered+index)).join('');sentinel.insertAdjacentHTML('beforebegin',html);rendered=end;
      afterAppend?.(container);if(rendered>=items.length){sentinel.remove();disconnectParityObserver(view);return}
      sentinel.textContent=text('Zobrazeno','Zobrazené')+' '+rendered+' / '+items.length+' · '+text('načíst další','načítať ďalšie');
    };
    container.appendChild(sentinel);sentinel.addEventListener('click',()=>append());append();
    if(rendered<items.length&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))append()},{rootMargin:'650px 0px'});observer.observe(sentinel);parityUi.observers.set(view,observer)}
  }

  function renderEpisodes(){
    const items=sortedParityEpisodes(),container=$('#episodes-v2');if(!container)return;
    mountParityBatch('episodes',container,items,item=>cardEpisode(item));
    $('#count-v2').textContent=(state.query.trim()||parityUi.episodeTopic!=='all')?text('Nalezeno ','Nájdených ')+items.length+' / '+state.data.episodes.length:state.data.episodes.length+' '+text('epizod','epizód');
  }
  function refreshEpisodeCard(number){
    if(state.view==='episodes'&&['started','completed','unheard'].includes(parityUi.episodeSort)){renderEpisodes();return}
    const episode=episodeByNumber(number),old=$('#episodes-v2 article[data-episode="'+Number(number)+'"]');if(!episode||!old)return;const host=document.createElement('div');host.innerHTML=cardEpisode(episode);old.replaceWith(host.firstElementChild);
  }

  function questionToolbar(){return''}
  function renderQuestions(){
    const items=visibleItems('questions'),container=$('#questions-v2');container.dataset.visible=String(items.length);
    mountParityBatch('questions',container,items,item=>enhancedQuestionCard(item,'questions'),root=>{queueQuestionMoreCheck('questions');parityTypeset(root)});
  }
  function renderNonQuestions(){
    const all=flattenNonQuestions(state.data),items=visibleItems('nonquestions'),container=$('#nonquestions-v2');container.dataset.count=String(all.length);container.dataset.visible=String(items.length);
    mountParityBatch('nonquestions',container,items,item=>enhancedQuestionCard(item,'nonquestions'),root=>{queueQuestionMoreCheck('nonquestions');parityTypeset(root)});
  }

  function seriesFirstDate(series){return Math.min(...series.episodes.map(number=>new Date(episodeByNumber(number)?.date||0).getTime()).filter(Number.isFinite))}
  function sortedParitySeries(){
    const query=norm(state.query.trim());let groups=(state.data?.series||[]).map((series,index)=>({series,index}));
    if(query)groups=groups.filter(({series})=>norm(seriesLabel(series)+' '+series.episodes.map(number=>allEpisodeSearch(episodeByNumber(number))).join(' ')).includes(query));
    groups.sort((a,b)=>parityUi.seriesSort==='alpha'?seriesLabel(a.series).localeCompare(seriesLabel(b.series),sk()?'sk':'cs'):parityUi.seriesSort==='first'?seriesFirstDate(a.series)-seriesFirstDate(b.series):b.series.episodes.length-a.series.episodes.length||seriesLabel(a.series).localeCompare(seriesLabel(b.series),sk()?'sk':'cs'));
    return groups;
  }
  function parityPersonName(episode){return episodeCopy(episode).title.replace(/^Vedátorský podcast\s*\d+\s*[–—-]?\s*/i,'').trim()}
  function ensureParitySeriesBody(card){
    if(!card||card.dataset.bodyLoaded==='1')return;const index=Number(card.dataset.seriesIndex),series=state.data.series[index];if(!series)return;card.dataset.bodyLoaded='1';
    const list=series.episodes.map((number,itemIndex)=>{const episode=episodeByNumber(number);if(!episode)return'';const status=episodeStatus(number),copy=episodeCopy(episode);return '<li><button type="button" class="series-item" data-series-index="'+index+'" data-item-index="'+itemIndex+'"><span class="series-item-status-v2" data-episode="'+number+'" title="'+esc(status?.label||'')+'">'+(status?.kind==='done'?'✓':status?.kind==='progress'?'▶':'')+'</span><span>'+(series.people?'<strong class="person-name-v2">'+esc(parityPersonName(episode))+'</strong><small class="episode-title-v2">'+esc(copy.title)+'</small>':text('Díl','Diel')+' '+number+': '+esc(copy.title))+'</span></button></li>'}).join('');
    const body=document.createElement('ol');body.className='parity-series-body';body.innerHTML=list;card.appendChild(body);
  }
  function renderSeries(){
    const groups=sortedParitySeries(),box=$('#series-v2');box.replaceChildren();
    for(const {series,index} of groups){const info=seriesProgressInfo(series),details=document.createElement('details');details.className='series searchable';details.dataset.seriesIndex=String(index);details.dataset.search=norm(seriesLabel(series));details.innerHTML='<summary><strong>'+esc(seriesLabel(series))+'</strong><span class="series-progress-summary-v2"><span>'+series.episodes.length+' '+text('dílů','dielov')+'</span><span class="series-progress-label-v2">'+esc(seriesProgressLabel(info))+'</span></span>'+shareButton('series',slug(series.name))+'</summary><div class="series-progress-box-v2"><div class="series-progress-main-v2"><progress class="series-progress-bar-v2" max="100" value="'+info.percent+'"></progress><small>'+esc(info.finished?text('Série je dokončená.','Séria je dokončená.'):text('Průběh se ukládá automaticky.','Priebeh sa ukladá automaticky.'))+'</small></div><button type="button" class="series-resume-v2" data-series-index="'+index+'" data-item-index="'+info.resumeIndex+'">'+esc(seriesResumeLabel(info))+'</button></div>';box.appendChild(details)}
    $('#count-v2').textContent=groups.length+' '+text('sérií','sérií');
  }

  function parityQuestionTopics(view){return QUESTION_TOPICS}
  function activeParityTopic(view){return view==='episodes'?parityUi.episodeTopic:view==='questions'?questionUi.qTopic:view==='nonquestions'?questionUi.nTopic:'all'}
  function setActiveParityTopic(view,key){if(view==='episodes')parityUi.episodeTopic=key;else if(view==='questions')questionUi.qTopic=key;else if(view==='nonquestions')questionUi.nTopic=key}
  function parityTopicSet(view){return view==='episodes'?EPISODE_TOPICS:parityQuestionTopics(view)}
  function parityControlLabel(topic){return sk()?(topic.sk||topic.cs):(topic.cs||topic.sk)}
  function paritySortOptions(view){
    if(view==='episodes')return[['new',text('Nejnovější','Najnovšie')],['old',text('Nejstarší','Najstaršie')],['number',text('Podle čísla dílu','Podľa čísla dielu')],['started',text('Rozposlouchané první','Rozpočúvané prvé')],['completed',text('Poslechnuté první','Vypočuté prvé')],['unheard',text('Neposlechnuté první','Nevypočuté prvé')]];
    if(view==='series')return[['count',text('Podle počtu dílů','Podľa počtu dielov')],['alpha',text('Podle abecedy','Podľa abecedy')],['first',text('Podle stáří prvního dílu','Podľa veku prvého dielu')]];
    if(view==='questions'||view==='nonquestions')return[['new',text('Nejnovější','Najnovšie')],['old',text('Nejstarší','Najstaršie')]];
    return[];
  }
  function currentParitySort(view){return view==='episodes'?parityUi.episodeSort:view==='series'?parityUi.seriesSort:view==='questions'?questionUi.qSort:view==='nonquestions'?questionUi.nSort:''}
  function setParitySort(view,value){
    if(view==='episodes')parityUi.episodeSort=value;else if(view==='series')parityUi.seriesSort=value;else if(view==='questions')questionUi.qSort=value;else if(view==='nonquestions')questionUi.nSort=value;
    writeJson(PARITY_SORT_KEY,{episode:parityUi.episodeSort,series:parityUi.seriesSort,question:questionUi.qSort,nonquestion:questionUi.nSort});
  }
  function syncParityControls(){
    const topics=$('#parity-topics-v2'),sort=$('#parity-sort-v2');if(!topics||!sort)return;const view=state.view,set=parityTopicSet(view),showTopics=['episodes','questions','nonquestions'].includes(view);
    topics.classList.toggle('hidden',!showTopics);topics.replaceChildren();
    if(showTopics)for(const [key,topic] of Object.entries(set)){const button=document.createElement('button');button.type='button';button.className='topic-v2'+(activeParityTopic(view)===key?' active':'');button.dataset.topic=key;button.textContent=parityControlLabel(topic);topics.appendChild(button)}
    const options=paritySortOptions(view);sort.classList.toggle('hidden',!options.length);sort.innerHTML=options.map(([value,label])=>'<option value="'+value+'">'+esc(label)+'</option>').join('');if(options.length)sort.value=currentParitySort(view);
  }

  function filterActive(){
    const active=$('.view-v2[data-view="'+state.view+'"]');if(!active)return;
    syncParityControls();
    syncAskSearchControls();
    if(state.view==='ask'){renderAsk();return}
    if(state.view==='episodes'){renderEpisodes();return}
    if(state.view==='questions'){renderQuestions();const filtered=Boolean(state.query.trim())||questionUi.qTopic!=='all',count=Number(active.dataset.visible)||0;$('#count-v2').textContent=questionCountLabel('questions',filtered?count:state.data.questions.length,filtered);return}
    if(state.view==='nonquestions'){renderNonQuestions();const filtered=Boolean(state.query.trim())||questionUi.nTopic!=='all',count=Number(active.dataset.visible)||0,total=Number(active.dataset.count)||0;$('#count-v2').textContent=questionCountLabel('nonquestions',filtered?count:total,filtered);return}
    if(state.view==='series'){renderSeries();return}
    const query=norm(state.query.trim()),cards=[...active.querySelectorAll('.searchable')];let shown=0;cards.forEach(card=>{const ok=!query||String(card.dataset.search||'').includes(query);card.classList.toggle('filtered-out',!ok);if(ok)shown++});
    if(state.view==='playlists')$('#count-v2').textContent=query?shown+' '+text('nalezených playlistů','nájdených playlistov'):state.playlists.length+' '+text('playlistů','playlistov');else $('#count-v2').textContent=text('Lokální data','Lokálne dáta');
  }
  function setView(view){
    if(state.view==='ask')askUi.draft=$('#search-v2').value;
    $('#search-v2').value=view==='ask'?askUi.draft:state.query;
    state.view=view;$$('.tab-v2').forEach(button=>button.classList.toggle('active',button.dataset.view===view));$$('.view-v2').forEach(node=>node.classList.toggle('hidden',node.dataset.view!==view));
    if(view==='playlists')renderPlaylists();if(view==='data'){loadUserData();renderData()}if(view==='questions'||view==='nonquestions')ensureParityMathJax();filterActive();
  }

  function parityTypeset(root){if(window.MathJax?.typesetPromise)window.MathJax.typesetPromise([root]).catch(()=>{})}
  function ensureParityMathJax(){
    if(window.MathJax?.typesetPromise||document.querySelector('script[data-v2-mathjax]'))return;
    window.MathJax={tex:{inlineMath:[['\\(','\\)']],processEscapes:true},options:{skipHtmlTags:['script','noscript','style','textarea','pre','code']}};
    const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';script.async=true;script.dataset.v2Mathjax='1';script.onload=()=>parityTypeset($('.view-v2:not(.hidden)'));document.head.appendChild(script);
  }

  function seekParity(delta){const audio=$('#audio-v2');if(!audio)return;const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Infinity;audio.currentTime=Math.max(0,Math.min(duration,(Number(audio.currentTime)||0)+delta));saveProgress(true,false);syncPlayer()}
  function installParityMediaSession(){
    if(!('mediaSession'in navigator))return;const audio=$('#audio-v2');if(!audio)return;
    try{navigator.mediaSession.setActionHandler('seekbackward',details=>seekParity(-(details.seekOffset||10)))}catch{}
    try{navigator.mediaSession.setActionHandler('seekforward',details=>seekParity(details.seekOffset||10))}catch{}
    try{navigator.mediaSession.setActionHandler('previoustrack',()=>seekParity(-10))}catch{}
    try{navigator.mediaSession.setActionHandler('nexttrack',()=>seekParity(10))}catch{}
    try{navigator.mediaSession.setActionHandler('seekto',details=>{if(typeof details.seekTime==='number'){audio.currentTime=Math.max(0,Math.min(audio.duration||Infinity,details.seekTime));saveProgress(true,false)}})}catch{}
    const update=()=>{
      if(!state.current)return;try{if(typeof MediaMetadata!=='undefined')navigator.mediaSession.metadata=new MediaMetadata({title:episodeCopy(state.current.episode).title,artist:'Vedátorský podcast',album:text('Vedátorský podcast','Vedátorský podcast')})}catch{}
      try{if(audio.duration>0&&Number.isFinite(audio.duration))navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate||1,position:Math.min(audio.duration,Math.max(0,audio.currentTime||0))})}catch{}
    };
    audio.addEventListener('play',update);audio.addEventListener('loadedmetadata',update);audio.addEventListener('durationchange',update);audio.addEventListener('timeupdate',()=>{const now=Date.now();if(now-parityUi.mediaTick>3000){parityUi.mediaTick=now;update()}});
  }

  function installParitySwipe(){
    const MIN_DISTANCE=85,MAX_DURATION=900,RATIO=1.55,interactive='a,button,input,select,textarea,label,audio,video,[contenteditable="true"],[role="button"],[data-no-swipe]';let start=null;
    const blocked=target=>{const element=target instanceof Element?target:null;if(!element||element.closest(interactive)||element.closest('.tabs,.parity-topics-v2,.actions,.episode-summary-v2,.modal-v2'))return true;for(let node=element;node&&node!==document.body;node=node.parentElement){const style=getComputedStyle(node);if((style.overflowX==='auto'||style.overflowX==='scroll')&&node.scrollWidth>node.clientWidth+4)return true}return false};
    document.addEventListener('touchstart',event=>{if(event.touches.length!==1||blocked(event.target)){start=null;return}const touch=event.touches[0];start={x:touch.clientX,y:touch.clientY,time:performance.now(),id:touch.identifier}},{passive:true});
    document.addEventListener('touchend',event=>{if(!start||event.changedTouches.length!==1){start=null;return}const gesture=start,touch=event.changedTouches[0];start=null;if(touch.identifier!==gesture.id)return;const dx=touch.clientX-gesture.x,dy=touch.clientY-gesture.y;if(performance.now()-gesture.time>MAX_DURATION||Math.abs(dx)<MIN_DISTANCE||Math.abs(dx)<Math.abs(dy)*RATIO)return;const tabs=$$('.tab-v2').filter(tab=>!tab.disabled&&!tab.classList.contains('hidden'));const index=tabs.findIndex(tab=>tab.classList.contains('active')),next=index+(dx<0?1:-1);if(next<0||next>=tabs.length)return;tabs[next].click();tabs[next].scrollIntoView({block:'nearest',inline:'center'})},{passive:true});
    document.addEventListener('touchcancel',()=>{start=null},{passive:true});
  }

  async function refreshParityContent(){
    const button=$('#parity-refresh-v2'),status=$('#status-v2');if(button)button.disabled=true;status.textContent=text('Kontroluji nová data…','Kontrolujem nové dáta…');
    try{const response=await fetch('./content-v2.json?v='+Date.now(),{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);const next=await response.json();if(!Array.isArray(next.episodes)||!Array.isArray(next.questions))throw new Error('Neplatný datový balík');state.data=next;buildLegacyQuestionIndex();loadUserData();rerenderLanguage();setView(state.view);status.textContent=text('Data jsou aktuální.','Dáta sú aktuálne.')}catch(error){status.textContent=text('Aktualizace se nepodařila: ','Aktualizácia sa nepodarila: ')+error.message}finally{if(button)button.disabled=false}
  }

  function installFullParityUi(){
    if(parityUi.installed)return;parityUi.installed=true;
    const style=document.createElement('style');style.dataset.v2FullParity='1';style.textContent='.controls{grid-template-columns:minmax(0,1fr) auto!important}.parity-refresh-v2{border:0;border-radius:12px;background:var(--accent);color:#fff;padding:0 15px;font-weight:800;cursor:pointer}.parity-topics-v2{display:flex;gap:8px;overflow-x:auto;padding:10px 0 1px;scrollbar-width:thin}.topic-v2{white-space:nowrap;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 12px;cursor:pointer}.topic-v2.active{background:var(--accent2);border-color:#8b7ee8;color:#392b9b;font-weight:800}html.theme-dark .topic-v2.active{color:#c4b5fd}.parity-sort-v2{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:10px;padding:8px;max-width:240px}.tags{display:flex!important;flex-wrap:wrap!important;gap:6px!important;margin:12px 0!important;min-height:0!important}.tag{display:inline-flex!important;align-items:center!important;width:auto!important;font-size:.76rem!important;background:#eef2ff!important;color:#3730a3!important;border:1px solid #c7d2fe!important;border-radius:999px!important;padding:4px 8px!important;line-height:1.2!important}html.theme-dark .tag{background:rgba(91,75,219,.24)!important;color:#c4b5fd!important;border-color:rgba(167,139,250,.5)!important}.desc-v2{line-height:1.48;color:var(--text-soft);display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}.episode-card-v2{min-height:260px}.parity-sentinel{grid-column:1/-1;width:100%;border:1px dashed var(--line);border-radius:12px;background:var(--card-soft);color:var(--muted);padding:13px;cursor:pointer}.parity-empty{grid-column:1/-1}.parity-series-body{margin:.2rem 0 .9rem;padding-left:1.35rem}.parity-series-body li{padding:.28rem 0}.person-name-v2{display:block}.episode-title-v2{display:block;color:var(--muted);font-size:.8rem}.skip-ten-v2{min-width:48px}.series>summary .deep-share{margin-left:4px}.series>summary{align-items:center}.series-progress-summary-v2{margin-left:auto}.question-card .tags{margin-top:auto}.question-card .actions{margin-top:0}@media(max-width:700px){.controls{grid-template-columns:1fr!important}.parity-refresh-v2{padding:11px}.parity-sort-v2{width:100%;max-width:none}.status-row{align-items:stretch}.series-progress-summary-v2{flex-direction:column;align-items:flex-end;gap:1px}}';document.head.appendChild(style);
    const panel=$('.panel'),tabs=panel?.querySelector('.tabs');if(tabs&&!$('#parity-topics-v2')){const topics=document.createElement('div');topics.id='parity-topics-v2';topics.className='parity-topics-v2';tabs.insertAdjacentElement('afterend',topics)}
    const statusRow=$('.status-row');if(statusRow&&!$('#parity-sort-v2')){const sort=document.createElement('select');sort.id='parity-sort-v2';sort.className='parity-sort-v2';statusRow.appendChild(sort)}
    const controls=$('.controls');if(controls&&!$('#parity-refresh-v2')){const button=document.createElement('button');button.id='parity-refresh-v2';button.type='button';button.className='parity-refresh-v2';button.textContent=text('Znovu načíst','Znovu načítať');controls.appendChild(button)}
    const playerControls=$('.player-controls');if(playerControls&&!$('#player-back10-v2')){const back=document.createElement('button');back.id='player-back10-v2';back.type='button';back.className='skip-ten-v2';back.textContent='−10';const forward=document.createElement('button');forward.id='player-forward10-v2';forward.type='button';forward.className='skip-ten-v2';forward.textContent='+10';const play=$('#player-play-v2');play?.insertAdjacentElement('beforebegin',back);play?.insertAdjacentElement('afterend',forward)}
    $('#parity-topics-v2')?.addEventListener('click',event=>{const button=event.target.closest('.topic-v2[data-topic]');if(!button)return;setActiveParityTopic(state.view,button.dataset.topic);filterActive()});
    $('#parity-sort-v2')?.addEventListener('change',event=>{setParitySort(state.view,event.target.value);filterActive()});
    $('#parity-refresh-v2')?.addEventListener('click',refreshParityContent);$('#player-back10-v2')?.addEventListener('click',()=>seekParity(-10));$('#player-forward10-v2')?.addEventListener('click',()=>seekParity(10));
    document.addEventListener('toggle',event=>{const card=event.target.closest?.('#series-v2 .series[data-series-index]');if(card?.open)ensureParitySeriesBody(card)},true);
    window.addEventListener('vedatorlanguagechange',()=>{const refresh=$('#parity-refresh-v2');if(refresh)refresh.textContent=text('Znovu načíst','Znovu načítať');syncParityControls()});
    window.addEventListener('storage',event=>{if(event.key===PARITY_SORT_KEY){const prefs=readJson(PARITY_SORT_KEY,{});parityUi.episodeSort=prefs.episode||parityUi.episodeSort;parityUi.seriesSort=prefs.series||parityUi.seriesSort;filterActive()}else if(event.key===PROGRESS_KEY&&state.view==='episodes'&&['started','completed','unheard'].includes(parityUi.episodeSort)){loadUserData();renderEpisodes()}});
    installParityMediaSession();installParitySwipe();syncParityControls();
  }


  /* V2_PLAYLIST_PARITY_V1 */
  const playlistParity={installed:false,drag:null};
  function playlistProgressInfo(playlist){
    const refs=playlistRefs(playlist),items=refs.map((ref,index)=>({ref,index,info:itemInfo(ref),id:'ref:'+ref})).filter(item=>item.info),total=items.length;
    const collection=state.collectionProgress['playlist:'+playlist.id]||{},records=collection.items&&typeof collection.items==='object'?collection.items:{};
    const recordFor=item=>records[item.id]||{};
    const completed=items.filter(item=>recordFor(item).completed).length;
    const heard=items.filter(item=>{const record=recordFor(item);return record.completed||Number(record.percent)>0||Number(record.currentTime)>Number(record.start||item.info.start||0)+3}).length;
    const progressSum=items.reduce((sum,item)=>{const record=recordFor(item);return sum+(record.completed?100:Math.max(0,Math.min(100,Number(record.percent)||0)))},0);
    const percent=total?Math.round(progressSum/total):0;
    let resumeIndex=-1;
    if(collection.lastItemId){const last=items.findIndex(item=>item.id===collection.lastItemId);if(last>=0){if(!recordFor(items[last]).completed)resumeIndex=last;else if(last+1<items.length)resumeIndex=items.slice(last+1).findIndex(item=>!recordFor(item).completed)+last+1}}
    if(resumeIndex<0||resumeIndex>=items.length||recordFor(items[resumeIndex])?.completed)resumeIndex=items.findIndex(item=>!recordFor(item).completed&&Number(recordFor(item).currentTime)>Number(recordFor(item).start||item.info.start||0)+3);
    if(resumeIndex<0)resumeIndex=items.findIndex(item=>!recordFor(item).completed);
    if(resumeIndex<0)resumeIndex=0;
    const started=heard>0,finished=total>0&&completed===total;
    return {items,records,total,completed,heard,percent,resumeIndex,started,finished};
  }
  function playlistResumeLabel(info){if(info.finished)return text('Přehrát playlist znovu','Prehrať playlist znova');if(info.started)return text('Pokračovat v playlistu','Pokračovať v playliste');return text('Začít playlist','Začať playlist')}
  function playlistItemStatus(info,item){const record=info.records[item.id]||{};if(record.completed)return{symbol:'✓',kind:'done',label:text('Poslechnuto','Vypočuté'),percent:100};const percent=Math.max(0,Math.min(100,Number(record.percent)||0));if(percent>0||Number(record.currentTime)>Number(record.start||item.info.start||0)+3)return{symbol:'▶',kind:'progress',label:text('Rozposloucháno','Rozpočúvané'),percent};return{symbol:'',kind:'',label:'',percent:0}}
  function playlistResumeStart(playlist,context,index){const collection=state.collectionProgress['playlist:'+playlist.id]||{},item=context.items[index],record=collection.items?.[item?.id]||{};if(item&&!record.completed&&Number(record.currentTime)>Number(item.start||0)+1)return Number(record.currentTime);return Number(item?.start)||0}
  function renderPlaylists(){
    state.playlists=safePlaylists(readJson(PLAYLISTS_KEY,state.playlists));const box=$('#playlists-v2');
    if(!state.playlists.length){box.innerHTML='<div class="playlist-toolbar"><strong>'+text('Moje playlisty','Moje playlisty')+'</strong><button class="playlist-add" type="button" aria-label="'+text('Nový playlist','Nový playlist')+'">+</button></div><div class="empty">'+text('Zatím nemáte žádný playlist.','Zatiaľ nemáte žiadny playlist.')+'</div>';return}
    box.innerHTML='<div class="playlist-toolbar"><strong>'+text('Moje playlisty','Moje playlisty')+'</strong><button class="playlist-add" type="button" aria-label="'+text('Nový playlist','Nový playlist')+'">+</button></div><div class="grid">'+state.playlists.map(playlist=>{
      const refs=playlistRefs(playlist),items=refs.map(itemInfo).filter(Boolean),progress=playlistProgressInfo(playlist),search=norm(playlist.name+' '+items.map(item=>item.title+' '+item.subtitle).join(' '));
      const stateClass=progress.finished?' complete':progress.started?' active':'';
      return '<details class="playlist-card searchable'+stateClass+'" data-id="'+esc(playlist.id)+'" data-search="'+esc(search)+'"><summary><span class="playlist-title">'+esc(playlist.name||'Playlist')+'</span><span class="playlist-count">'+items.length+' '+text('položek','položiek')+'</span><span class="playlist-actions"><button type="button" class="icon-button edit" title="'+text('Upravit','Upraviť')+'">✎</button><button type="button" class="icon-button share" title="'+text('Sdílet','Zdieľať')+'">🔗</button><button type="button" class="icon-button delete" title="'+text('Smazat','Zmazať')+'">🗑</button></span></summary>'+
        (progress.total?'<div class="playlist-progress-box-v2"><div class="playlist-progress-main-v2"><progress max="100" value="'+progress.percent+'"></progress><small>'+progress.completed+' / '+progress.total+' '+text('poslechnuto','vypočuté')+' · '+progress.percent+' %</small></div><button type="button" class="playlist-resume-v2" data-id="'+esc(playlist.id)+'" data-item-index="'+progress.resumeIndex+'">'+esc(playlistResumeLabel(progress))+'</button></div>':'')+
        '<ol class="playlist-items">'+(items.length?refs.map((ref,index)=>{const item=itemInfo(ref);if(!item)return'';const status=playlistItemStatus(progress,progress.items.find(x=>x.ref===ref)||{id:'ref:'+ref,info:item});return '<li class="playlist-item '+status.kind+'"><button type="button" class="playlist-open" data-item-index="'+index+'" data-ref="'+esc(ref)+'"><span class="playlist-item-status-v2" title="'+esc(status.label)+'">'+status.symbol+'</span><span class="playlist-item-copy-v2" style="--playlist-item-progress:'+status.percent+'%"><b>'+esc(item.title)+'</b><br><small>'+esc(item.subtitle)+'</small></span></button></li>'}).join(''):'<li class="empty">'+text('Playlist je prázdný.','Playlist je prázdny.')+'</li>')+'</ol></details>';
    }).join('')+'</div>';
  }
  function refreshPlaylistProgress(){if(state.view==='playlists')renderPlaylists()}
  function enhancePlaylistEditorMobile(){
    const modal=$('#playlist-editor-v2'),box=modal?.querySelector('.modal-box'),columns=box?.querySelector('.editor-columns');if(!box||!columns)return;
    box.classList.add('playlist-editor-mobile-v2');let tabs=box.querySelector('.playlist-editor-work-tabs-v2');
    if(!tabs){tabs=document.createElement('div');tabs.className='playlist-editor-work-tabs-v2';tabs.innerHTML='<button type="button" data-editor-section="added"></button><button type="button" data-editor-section="add"></button>';columns.before(tabs)}
    const count=state.editor?.draft?.length||0,mode=state.editor?.mode==='q'?'q':'e';
    tabs.querySelector('[data-editor-section="added"]').textContent=text('Přidané','Pridané')+' ('+count+')';tabs.querySelector('[data-editor-section="add"]').textContent=mode==='q'?text('Přidat otázky','Pridať otázky'):text('Přidat epizody','Pridať epizódy');
    if(!box.dataset.editorSection)box.dataset.editorSection=count?'added':'add';tabs.querySelectorAll('button').forEach(button=>button.classList.toggle('active',button.dataset.editorSection===box.dataset.editorSection));
  }
  function playlistDragTarget(clientY,row){const rows=[...row.parentElement.querySelectorAll('.editor-row[data-ref]')].filter(candidate=>candidate!==row);let target=rows.length;for(let index=0;index<rows.length;index++){const rect=rows[index].getBoundingClientRect();if(clientY<rect.top+rect.height/2){target=index;break}}return target}
  function installPlaylistParity(){
    if(playlistParity.installed)return;playlistParity.installed=true;
    const style=document.createElement('style');style.dataset.v2PlaylistParity='1';style.textContent='.playlist-card.active>.playlist-title,.playlist-card.active summary .playlist-title{color:#d97706}.playlist-card.complete>.playlist-title,.playlist-card.complete summary .playlist-title{color:var(--ok)}.playlist-progress-box-v2{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:0 0 12px}.playlist-progress-main-v2{display:grid;gap:4px;color:var(--muted)}.playlist-progress-main-v2 progress{width:100%;height:7px;accent-color:var(--accent)}.playlist-resume-v2{border:0;border-radius:10px;background:var(--accent);color:#fff;padding:9px 12px;font-weight:800;cursor:pointer}.playlist-open{display:grid!important;grid-template-columns:1.2rem minmax(0,1fr);gap:7px;align-items:start}.playlist-item-status-v2{font-weight:900;color:var(--ok);padding-top:1px}.playlist-item.progress .playlist-item-status-v2{color:#d97706}.playlist-item-copy-v2{min-width:0}.playlist-item.progress .playlist-item-copy-v2 b{background:linear-gradient(90deg,var(--ok) 0 var(--playlist-item-progress),var(--ink) var(--playlist-item-progress) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}.playlist-editor-work-tabs-v2{display:none}.editor-row.dragging-v2{opacity:.92;border-color:var(--accent);box-shadow:0 10px 30px rgba(0,0,0,.3)}@media(max-width:700px){.playlist-progress-box-v2{grid-template-columns:1fr}.playlist-resume-v2{width:100%}.playlist-editor-work-tabs-v2{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 0 10px}.playlist-editor-work-tabs-v2 button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:10px;padding:8px;font-weight:800}.playlist-editor-work-tabs-v2 button.active{background:var(--accent2);border-color:var(--accent);color:var(--accent)}.playlist-editor-mobile-v2[data-editor-section="added"] .editor-columns>section:nth-child(2),.playlist-editor-mobile-v2[data-editor-section="add"] .editor-columns>section:nth-child(1){display:none}.playlist-editor-mobile-v2 .editor-columns{grid-template-columns:1fr}.playlist-editor-mobile-v2 .editor-move{position:relative;width:32px;height:34px;cursor:grab;touch-action:none}.playlist-editor-mobile-v2 .editor-move button{display:none}.playlist-editor-mobile-v2 .editor-move:before,.playlist-editor-mobile-v2 .editor-move:after{content:"";position:absolute;left:7px;width:18px;height:2px;background:var(--muted);border-radius:999px}.playlist-editor-mobile-v2 .editor-move:before{top:12px}.playlist-editor-mobile-v2 .editor-move:after{top:20px}}';document.head.appendChild(style);
    const modal=$('#playlist-editor-v2');if(modal){document.addEventListener('click',event=>{if(event.target.closest?.('.playlist-card .edit'))setTimeout(enhancePlaylistEditorMobile,0)});modal.addEventListener('input',()=>setTimeout(enhancePlaylistEditorMobile,0));modal.addEventListener('change',()=>setTimeout(enhancePlaylistEditorMobile,0));modal.addEventListener('click',event=>{const tab=event.target.closest('[data-editor-section]');if(tab){const box=modal.querySelector('.playlist-editor-mobile-v2');if(box){box.dataset.editorSection=tab.dataset.editorSection;enhancePlaylistEditorMobile()}return}});modal.addEventListener('pointerdown',event=>{const handle=event.target.closest('.editor-move'),row=handle?.closest('.editor-row[data-ref]');if(!row||!state.editor)return;if(event.pointerType==='mouse'&&event.button!==0)return;const rows=[...row.parentElement.querySelectorAll('.editor-row[data-ref]')],from=rows.indexOf(row);if(from<0)return;playlistParity.drag={ref:row.dataset.ref,from,row};row.classList.add('dragging-v2');try{handle.setPointerCapture(event.pointerId)}catch{}});window.addEventListener('pointerup',event=>{const drag=playlistParity.drag;if(!drag||!state.editor)return;playlistParity.drag=null;drag.row.classList.remove('dragging-v2');const target=playlistDragTarget(event.clientY,drag.row),draft=[...state.editor.draft],from=draft.indexOf(drag.ref);if(from<0)return;const [ref]=draft.splice(from,1);draft.splice(Math.max(0,Math.min(target,draft.length)),0,ref);state.editor.draft=draft;rerenderEditor();enhancePlaylistEditorMobile()})}
    document.addEventListener('click',event=>{const resume=event.target.closest('.playlist-resume-v2');if(!resume)return;event.preventDefault();const playlist=state.playlists.find(item=>String(item.id)===String(resume.dataset.id));if(!playlist)return;const index=Number(resume.dataset.itemIndex)||0,context=playlistContext(playlist,index),item=context.items[index];if(item)openPlayback(item.episode,{start:playlistResumeStart(playlist,context,index),context,itemRef:item.ref})});
    window.addEventListener('vedatorlanguagechange',()=>{refreshPlaylistProgress();enhancePlaylistEditorMobile()});
  }

  /* V2_MOBILE_DEEP_POLISH_V2 */
  const mobileHighlightWordChar=char=>/[a-z0-9]/.test(char||'');
  function mobileNormalizedTextWithMap(value){
    const textValue=String(value||'');let normalized='';const map=[];
    for(let i=0;i<textValue.length;i++){const part=norm(textValue[i]);normalized+=part;for(let j=0;j<part.length;j++)map.push(i)}
    return {textValue,normalized,map};
  }
  function mobileValidOccurrence(textValue,index,term){
    const before=textValue[index-1]||'',after=textValue[index+term.length]||'';
    if(mobileHighlightWordChar(before))return false;
    if(term.includes(' ')||term.length<=3)return !mobileHighlightWordChar(after);
    return true;
  }
  function mobileHighlightRanges(value,terms){
    const {textValue,normalized,map}=mobileNormalizedTextWithMap(value),ranges=[];
    for(const rawTerm of terms){
      const term=norm(rawTerm).trim();if(term.length<2)continue;let from=0;
      while(from<normalized.length){
        const index=normalized.indexOf(term,from);if(index<0)break;
        if(mobileValidOccurrence(normalized,index,term)){
          const start=map[index],end=(map[index+term.length-1]??start)+1;
          if(!ranges.some(range=>start<range.end&&end>range.start))ranges.push({start,end});
        }
        from=index+Math.max(1,term.length);
      }
    }
    return {textValue,ranges:ranges.sort((a,b)=>a.start-b.start)};
  }
  function mobileHighlightHtml(value,terms){
    const raw=repairMathText(value),{textValue,ranges}=mobileHighlightRanges(raw,terms);
    if(!ranges.length)return esc(textValue).replace(/([A-Za-z0-9]+)\s*\^\s*\{?(-?\d+)\}?/g,'$1<sup>$2</sup>');
    let out='',position=0;
    for(const range of ranges){
      if(range.start>position)out+=esc(textValue.slice(position,range.start));
      out+='<mark class="vedator-match">'+esc(textValue.slice(range.start,range.end))+'</mark>';position=range.end;
    }
    if(position<textValue.length)out+=esc(textValue.slice(position));
    return out.replace(/([A-Za-z0-9]+)\s*\^\s*\{?(-?\d+)\}?/g,'$1<sup>$2</sup>');
  }
  function mobileQuestionHighlightTerms(topic){
    const query=norm(state.query.trim());
    if(query)return [...new Set([query,...query.split(/\s+/)].filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
    return [...new Set((topic?.keys||[]).map(norm).filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
  }
  highlightHtml=function(value,topic){return mobileHighlightHtml(value,mobileQuestionHighlightTerms(topic))};

  function mobileEpisodeHighlightTerms(){
    const query=state.query.trim();
    if(query){
      const variants=expandedEpisodeQuery(query);
      return [...new Set(variants.flatMap(value=>[value,...value.split(/\s+/)]).map(norm).filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
    }
    const topic=EPISODE_TOPICS[parityUi.episodeTopic]||EPISODE_TOPICS.all;
    return [...new Set((topic.keys||[]).map(norm).filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
  }
  function mobileEpisodeExcerpt(value,terms){
    const raw=String(value||'').replace(/\s+/g,' ').trim();if(!raw)return'';
    if(!terms.length)return shortParityDescription(raw);
    const {ranges}=mobileHighlightRanges(raw,terms);if(!ranges.length)return shortParityDescription(raw);
    const first=ranges[0];let start=Math.max(0,first.start-115),end=Math.min(raw.length,Math.max(first.end+185,start+440));
    while(start>0&&!/\s/.test(raw[start-1]))start--;while(end<raw.length&&!/\s/.test(raw[end]))end++;
    return (start>0?'…':'')+raw.slice(start,end).trim()+(end<raw.length?'…':'');
  }
  cardEpisode=function(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number),terms=mobileEpisodeHighlightTerms(),description=mobileEpisodeExcerpt(copy.description,terms);
    return '<article class="card searchable episode-card-v2" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+mobileHighlightHtml(copy.title,terms)+'</h2>'+
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<p class="desc-v2">'+mobileHighlightHtml(description,terms)+'</p>'+episodeTagHtml(episode)+episodeSummaryHtml(episode)+
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+
      (episode.link?'<a class="secondary" href="'+esc(episode.link)+'">'+text('Detail','Detail')+'</a>':'')+shareButton('episode',String(episode.number))+'</div></article>';
  };

  const mobileOriginalSyncPlayer=syncPlayer;
  syncPlayer=function(){
    mobileOriginalSyncPlayer();const n=playerNodes();
    if(state.current&&state.context?.type==='episodes')n.sub.textContent=state.context.label;
    if(state.current){n.download.removeAttribute('href');n.download.setAttribute('role','button');n.download.title=text('Stáhnout MP3','Stiahnuť MP3')}
  };
  const mobileOriginalSaveCollectionProgress=saveCollectionProgress;
  saveCollectionProgress=function(time,duration,completed){if(state.context?.type==='episodes')return;return mobileOriginalSaveCollectionProgress(time,duration,completed)};

  function mobileEpisodePlaybackContext(episode){
    const episodes=parityUi.episodeTopic==='all'&&!state.query.trim()?sortedParityEpisodes().slice().sort((a,b)=>(Number(a.number)||0)-(Number(b.number)||0)):sortedParityEpisodes();
    const items=episodes.map(item=>({id:'episode:'+item.number,episode:item,start:0,ref:epRef(item.number)}));
    const index=items.findIndex(item=>Number(item.episode.number)===Number(episode.number));if(index<0)return null;
    const topic=EPISODE_TOPICS[parityUi.episodeTopic]||EPISODE_TOPICS.all;
    const label=state.query.trim()?text('Hledání','Hľadanie')+': '+state.query.trim():parityUi.episodeTopic!=='all'?text('Téma','Téma')+': '+parityControlLabel(topic):text('Epizody','Epizódy');
    return {type:'episodes',id:'episodes',label,items,index};
  }

  function mobileSafeMp3Filename(title){return (title||'vedatorsky-podcast').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()+'.mp3'}
  const mobileFormatMb=bytes=>((Number(bytes)||0)/1048576).toFixed(1).replace('.',',')+' MB';
  async function downloadCurrentMp3(){
    const current=state.current,n=playerNodes();if(!current||n.download.dataset.busy)return;const url=n.audio.currentSrc||current.episode.enclosure;if(!url)return;
    n.download.dataset.busy='1';n.download.setAttribute('aria-disabled','true');n.download.textContent=text('Připravuji…','Pripravujem…');n.help.textContent=text('Připravuji stažení MP3…','Pripravujem stiahnutie MP3…');
    try{
      const response=await fetch(url,{mode:'cors',cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
      const total=Number(response.headers.get('content-length'))||0,type=response.headers.get('content-type')||'audio/mpeg',reader=response.body?.getReader();let loaded=0,blob;
      if(reader){
        const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;if(total){const percent=Math.min(99,Math.floor(loaded/total*100));n.download.textContent=text('Stahuji ','Sťahujem ')+percent+' %';n.help.textContent=text('Staženo ','Stiahnuté ')+mobileFormatMb(loaded)+' '+text('z','z')+' '+mobileFormatMb(total)+'.'}else{n.download.textContent=text('Stahuji…','Sťahujem…');n.help.textContent=text('Staženo ','Stiahnuté ')+mobileFormatMb(loaded)+'.'}}
        blob=new Blob(chunks,{type});
      }else blob=await response.blob();
      n.download.textContent=text('Ukládám…','Ukladám…');const objectUrl=URL.createObjectURL(blob),link=document.createElement('a');link.href=objectUrl;link.download=mobileSafeMp3Filename(episodeCopy(current.episode).title);document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);n.help.textContent=text('MP3 bylo staženo','MP3 bolo stiahnuté')+' ('+mobileFormatMb(blob.size)+').'
    }catch(error){console.warn('MP3 download failed',error);n.help.textContent=text('Stažení MP3 se nepodařilo. Zkontrolujte připojení a zkuste to znovu.','Stiahnutie MP3 sa nepodarilo. Skontrolujte pripojenie a skúste to znova.')}finally{delete n.download.dataset.busy;n.download.removeAttribute('aria-disabled');syncPlayer()}
  }

  document.addEventListener('click',event=>{
    const play=event.target.closest?.('.episode-card-v2 > .actions .play');if(!play)return;const episode=episodeByNumber(Number(play.dataset.episode));if(!episode)return;
    event.preventDefault();event.stopImmediatePropagation();const seconds=play.dataset.seconds===''?null:Number(play.dataset.seconds)||0;openPlayback(episode,{start:seconds,context:mobileEpisodePlaybackContext(episode),itemRef:play.dataset.ref||epRef(episode.number)});
  },true);
  $('#player-download-v2')?.addEventListener('click',event=>{event.preventDefault();downloadCurrentMp3()});
  $('#audio-v2')?.addEventListener('ended',()=>{if(state.context&&state.context.index<state.context.items.length-1)setTimeout(()=>navigateContext(1),0)});

  /* V2_FINAL_UI_FAQ_GUIDE_V1 */
  const finalFormatMb=bytes=>((Number(bytes)||0)/1048576).toFixed(1).replace('.',',')+' MB';
  let finalInstallPrompt=null;
  function finalIsStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true}
  function finalInstallLabel(){return text('Instalovat','Inštalovať')}
  function finalSyncInstallButton(){const button=$('#install-v2');if(!button)return;button.textContent=finalInstallLabel();button.classList.toggle('hidden',finalIsStandalone())}
  async function finalInstallV2(){
    if(finalIsStandalone())return;
    if(finalInstallPrompt){const prompt=finalInstallPrompt;finalInstallPrompt=null;await prompt.prompt();try{await prompt.userChoice}catch{}finalSyncInstallButton();return}
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent||'');
    alert(ios?text('V Safari klepni na Sdílet a potom Přidat na plochu.','V Safari klepni na Zdieľať a potom Pridať na plochu.'):text('Pokud se instalační dialog neotevře, použij nabídku prohlížeče a zvol Nainstalovat aplikaci nebo Přidat na plochu.','Ak sa inštalačný dialóg neotvorí, použi ponuku prehliadača a zvoľ Nainštalovať aplikáciu alebo Pridať na plochu.'));
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();finalInstallPrompt=event;finalSyncInstallButton()});
  window.addEventListener('appinstalled',()=>{finalInstallPrompt=null;finalSyncInstallButton()});

  function finalCollectionNorm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/Hledání mimozemského života/gi,'Hľadanie mimozemského života').replace(/Rozhovory o vesmíru/gi,'Rozhovory o vesmíre').replace(/(?:Žiji|Žiju) vědu/gi,'Žijem vedu').replace(/Genetický speciál/gi,'Genetický špeciál').replace(/Vedátorský speciál/gi,'Vedátorský špeciál').replace(/Nobelovy ceny/gi,'Nobelove ceny').replace(/[^a-z0-9]+/g,' ').trim()}
  function finalCollectionRecord(ids){for(const id of ids){const record=state.collectionProgress[id];if(record&&typeof record==='object')return record}return null}
  function finalSeriesCollection(series){return finalCollectionRecord(['series:'+norm(series.name),'series:'+finalCollectionNorm(series.name),'series:'+finalCollectionNorm(seriesLabel(series))])}
  function finalSeriesItemRecord(collection,episode){if(!collection)return null;let absolute='';try{absolute=new URL(episode.enclosure,location.href).href}catch{}return collection.items?.['episode:'+episode.number]||collection.items?.['audio:'+absolute]||null}
  function finalHeard(record,start=0){return Boolean(record&&(record.completed||Number(record.percent)>0||Number(record.currentTime)>Number(record.start??start)+3))}
  function finalPercent(record,start=0){if(!record)return 0;if(record.completed)return 100;const direct=Number(record.percent);if(Number.isFinite(direct)&&direct>0)return Math.max(1,Math.min(99,Math.round(direct)));const duration=Number(record.duration)||0,current=Number(record.currentTime)||0,from=Number(record.start??start)||0;return duration>from?Math.max(1,Math.min(99,Math.round((current-from)/(duration-from)*100))):1}
  function finalClearCollectionNode(node){if(!node)return;node.classList.remove('v2-collection-progress-text','v2-collection-complete-text');node.style.removeProperty('--vedator-progress')}
  function finalApplyCollectionNode(node,record,start=0){finalClearCollectionNode(node);if(!finalHeard(record,start))return;if(record.completed){node.classList.add('v2-collection-complete-text');return}node.classList.add('v2-collection-progress-text');node.style.setProperty('--vedator-progress',finalPercent(record,start)+'%')}
  function finalSetCollectionTitle(title,items,recordFor){if(!title)return;title.classList.remove('v2-collection-title-active','v2-collection-title-complete');const heard=items.filter(item=>finalHeard(recordFor(item)));const complete=items.length>0&&items.every(item=>recordFor(item)?.completed);if(complete)title.classList.add('v2-collection-title-complete');else if(heard.length)title.classList.add('v2-collection-title-active')}
  function decorateLegacyCollectionsV2(){
    $$('#series-v2 .series[data-series-index]').forEach(card=>{const series=state.data?.series?.[Number(card.dataset.seriesIndex)];if(!series)return;const collection=finalSeriesCollection(series),items=(series.episodes||[]).map(number=>episodeByNumber(number)).filter(Boolean),recordFor=episode=>finalSeriesItemRecord(collection,episode);finalSetCollectionTitle(card.querySelector('summary strong'),items,recordFor);card.querySelectorAll('.series-item[data-item-index]').forEach(button=>{const episode=items[Number(button.dataset.itemIndex)];if(!episode)return;const copy=button.querySelector('span:last-child'),nodes=copy?.querySelectorAll('.person-name-v2,.episode-title-v2')||[];if(nodes.length)nodes.forEach(node=>finalApplyCollectionNode(node,recordFor(episode)));else finalApplyCollectionNode(copy,recordFor(episode))})});
    $$('#playlists-v2 .playlist-card[data-id]').forEach(card=>{const playlist=state.playlists.find(item=>String(item.id)===String(card.dataset.id));if(!playlist)return;const collection=state.collectionProgress['playlist:'+playlist.id]||null,refs=playlistRefs(playlist),recordFor=ref=>collection?.items?.['ref:'+ref]||null;finalSetCollectionTitle(card.querySelector('.playlist-title'),refs,recordFor);card.querySelectorAll('.playlist-open[data-ref]').forEach(button=>finalApplyCollectionNode(button.querySelector('b'),recordFor(button.dataset.ref),itemInfo(button.dataset.ref)?.start||0))});
  }
  const finalRenderSeries=renderSeries;renderSeries=function(...args){const result=finalRenderSeries(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalEnsureSeriesBody=ensureParitySeriesBody;ensureParitySeriesBody=function(...args){const result=finalEnsureSeriesBody(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalRenderPlaylists=renderPlaylists;renderPlaylists=function(...args){const result=finalRenderPlaylists(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalRefreshSeries=refreshSeriesProgress;refreshSeriesProgress=function(...args){const result=finalRefreshSeries(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalRefreshPlaylists=refreshPlaylistProgress;refreshPlaylistProgress=function(...args){const result=finalRefreshPlaylists(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  document.addEventListener('toggle',()=>queueMicrotask(decorateLegacyCollectionsV2),true);
  window.addEventListener('vedatorlanguagechange',()=>{finalSyncInstallButton();queueMicrotask(decorateLegacyCollectionsV2)});
  function installFinalUiV2(){document.querySelector('#parity-refresh-v2')?.remove();$('#install-v2')?.addEventListener('click',finalInstallV2);finalSyncInstallButton();queueMicrotask(decorateLegacyCollectionsV2)}

  function createAskSearchEngine(){
    // Bundled from Berniocal/faq: synonyms.js, synonyms-extra.js, app-core.js.
    // An isolated map object keeps the FAQ engine out of the global namespace.
    const searchScope={};
'use strict';

/*
  Mapy významově stejných formulací pro vyhledávání Vedátoru.
  Vychází z opakujících se formulací v otázkách i neotázkách:
  lidová otázka -> odborný pojem v názvu nebo odpovědi.
*/
searchScope.VEDATOR_SEARCH_MAPS = {
  equivalents: [
    // --- Veličiny a číselné dotazy ---
    ['hmotnost', ['hmotnost','hmotnosti','hmotnostní','hmotnostny','hmotnosť','hmotnosti','váha','vaha','váží','vazi','vážit','vazit','váži','vazi','vážia','vazia','kg','kilogram','kilogramy','kilogramů','kilogramu','kilogramov','mass']],
    ['trvani', ['trvání','trvani','trvanie','doba','trvá','trva','trvají','trvaji','trvajú','trvaju','doba trvání','doba trvania','čas trvání','cas trvani','čas trvania','cas trvania','duration']],
    ['vzdalenost', ['vzdálenost','vzdalenost','vzdialenosť','vzdialenost','daleko','vzdálený','vzdaleny','vzdialený','vzdialeny','distance']],
    ['rychlost', ['rychlost','rýchlosť','rychlostí','rychlosti','rýchlosťou','rychle','rýchlo','speed','velocity']],
    ['vek', ['věk','vek','stáří','stari','starý','stary','stará','stara','staré','stare','vek člověka','vek cloveka','age']],
    ['velikost', ['velikost','veľkosť','velkost','velký','velky','velká','velka','velké','velke','rozměr','rozmer','rozměry','rozmery','rozměrech','rozmeroch','size','dimensions']],
    ['delka', ['délka','delka','dĺžka','dlzka','dlouhý','dlouhy','dlouhá','dlouha','dlhý','dlhy','length']],
    ['vyska', ['výška','vyska','výšce','vysce','vysoký','vysoky','vysoká','vysoka','height']],
    ['hloubka', ['hloubka','hĺbka','hlbka','hluboký','hluboky','hlboký','hlboky','depth']],
    ['sirka', ['šířka','sirka','šířce','sirce','široký','siroky','width']],
    ['plocha', ['plocha','rozloha','povrchová plocha','povrchova plocha','area']],
    ['objem', ['objem','objemu','litr','litry','litrů','litru','liter','litrov','volume']],
    ['teplota', ['teplota','teploty','teplotě','teplote','stupně','stupne','stupňů','stupnu','celsius','celsia','temperature']],
    ['pocet', ['počet','pocet','množství','mnozstvi','množstvo','mnozstvo','number','amount']],
    ['frekvence', ['frekvence','frekvencia','četnost','cetnost','často','casto','hertz','hz','frequency']],
    ['cena', ['cena','ceny','náklady','naklady','cost','price']],
    ['spotreba', ['spotřeba','spotreba','spotřebuje','spotrebuje','spotřebují','spotrebuju','consumption']],
    ['produkce', ['produkce','produkcia','produkovať','produkovat','produkuje','vyprodukuje','vyprodukují','vyprodukuju','production']],

    // --- Typ informace / význam otázky ---
    ['slozeni', ['složení','slozeni','zloženie','zlozenie','součást','soucast','součásti','soucasti','súčasť','sucast','část','cast','části','casti','častí','casti','složka','slozka','skládá','sklada','skladajú','skladaju','tvoří','tvori','obsahuje','komponenta','component','composition']],
    ['material', ['materiál','material','materiálu','materialu','vyrobený','vyrobeny','vyrobená','vyrobena','made of']],
    ['princip', ['princip','principem','mechanismus','mechanizmus','funguje','fungování','fungovani','fungovanie','pracuje','working principle']],
    ['ucel', ['účel','ucel','slouží','slouzi','slúži','sluzi','funkce','funkcia','využití','vyuziti','využitie','vyuzitie','použití','pouziti','purpose']],
    ['definice', ['definice','definícia','definicia','znamená','znamena','význam','vyznam','definition','meaning']],
    ['pricina', ['příčina','pricina','príčina','důvod','duvod','dôvod','zpusobuje','způsobuje','spôsobuje','cause','reason']],
    ['vznik', ['vznik','vzniká','vznika','vznikají','vznikaji','vznikajú','vznikaju','vytvoření','vytvoreni','formování','formovani','formation','origin process']],
    ['poloha', ['poloha','umístění','umisteni','umiestnenie','nachází','nachazi','nachádza','nachadza','location']],
    ['rozdil', ['rozdíl','rozdil','rozdiel','liší','lisi','líši','odlišnost','odlisnost','porovnání','porovnani','srovnání','srovnani','difference','comparison']],
    ['moznost', ['možnost','moznost','možné','mozne','lze','dokáže','dokaze','dokážu','dokazu','possible','possibility']],
    ['dusledek', ['důsledek','dusledek','dôsledok','následek','nasledek','následok','nasledok','consequence','result']],
    ['mereni', ['měření','mereni','meranie','změřit','zmerit','merať','merat','measurement']],
    ['vypocet', ['výpočet','vypocet','výpočet','spočítat','spocitat','vypočítat','vypocitat','počítať','pocitat','calculation']],
    ['nazev', ['název','nazev','názov','nazov','jmenuje','volá','vola','pojmenování','pojmenovani','name']],
    ['puvod', ['původ','puvod','pôvod','pochází','pochazi','pochádza','pochadza','origin']],
    ['vliv', ['vliv','vplyv','ovlivňuje','ovlivnuje','ovplyvňuje','ovplyvnuje','působí','pusobi','effect','influence']],
    ['metoda', ['metoda','způsob','zpusob','spôsob','sposob','postup','method','procedure']],

    // --- Odborné a jazykové ekvivalence ---
    ['cerna dira', ['černá díra','cerna dira','černé díry','cerne diry','černých děr','cernych der','čierna diera','cierna diera','čierne diery','cierne diery','black hole','black holes']],
    ['vesmir', ['vesmír','vesmir','kosmos','kozmos','universe','cosmos']],
    ['hvezda', ['hvězda','hvezda','hvězdy','hvezdy','hviezda','hviezdy','star','stars']],
    ['slunce', ['slunce','sluneční','slunecni','slnko','slnečný','slnecny','sun','solar']],
    ['mesic', ['měsíc','mesic','měsíční','mesicni','mesiac','mesačný','mesacny','moon','lunar']],
    ['zeme', ['země','zeme','zemský','zemsky','zem','earth','terrestrial']],
    ['casoprostor', ['časoprostor','casoprostor','časopriestor','casopriestor','spacetime']],
    ['umela inteligence', ['umělá inteligence','umela inteligence','umelá inteligencia','umela inteligencia','AI','artificial intelligence']],
    ['svetlo', ['světlo','svetlo','světelný','svetelny','svetelný','light']],
    ['foton', ['foton','fotony','fotonový','fotonovy','fotón','fotóny','photon','photons']],
    ['kvantum', ['kvantum','kvanta','kvantový','kvantovy','kvantová fyzika','kvantova fyzika','quantum']],
    ['gravitace', ['gravitace','gravitační','gravitacni','gravitácia','gravitacia','gravitačný','gravitacny','gravity']],
    ['relativita', ['relativita','relativistický','relativisticky','relativity']],
    ['elektromagneticke zareni', ['elektromagnetické záření','elektromagneticke zareni','elektromagnetické vlnění','elektromagneticke vlneni','elektromagnetické žiarenie','elektromagneticke ziarenie','electromagnetic radiation']],
    ['zareni', ['záření','zareni','žiarenie','ziarenie','radiation']],
    ['optika', ['optika','optický','opticky','optics']],
    ['vlna', ['vlna','vlny','vlnová','vlnova','vlnenie','vlnění','wave','waves']],
    ['energie', ['energie','energia','energy']],
    ['elektron', ['elektron','elektrony','elektrón','elektróny','electron','electrons']],
    ['proton', ['proton','protony','protón','protóny','protons']],
    ['neutron', ['neutron','neutrony','neutrón','neutróny','neutrons']],
    ['kvark', ['kvark','kvarky','quark','quarks']],
    ['atom', ['atom','atomy','atóm','atómy','atoms']],
    ['molekula', ['molekula','molekuly','molekulární','molekularni','molecule','molecules']],
    ['castice', ['částice','castice','častica','castica','particle','particles']],
    ['jadro', ['jádro','jadro','jaderný','jaderny','jadrový','jadrovy','nucleus','nuclear']],
    ['magnet', ['magnet','magnetický','magneticky','magnetic']],
    ['elektrina', ['elektřina','elektrina','elektrický','elektricky','electricity','electric']],
    ['zvuk', ['zvuk','zvukový','zvukovy','sound']],
    ['evoluce', ['evoluce','evoluční','evolucni','evolúcia','evolucia','evolution']],
    ['gen', ['gen','geny','genetický','geneticky','gene','genes','genetics']],
    ['dna', ['DNA','deoxyribonukleová kyselina','deoxyribonukleova kyselina']],
    ['bunka', ['buňka','bunka','buňky','bunky','cell','cells']],
    ['klima', ['klima','klimatický','klimaticky','klimatická změna','klimaticka zmena','climate']],
    ['sklenikovy efekt', ['skleníkový efekt','sklenikovy efekt','skleníkový plyn','sklenikovy plyn','greenhouse effect']],
    ['co2', ['CO2','oxid uhličitý','oxid uhlicity','carbon dioxide']],
    ['pocitac', ['počítač','pocitac','počítače','pocitace','computer','computers']],
    ['algoritmus', ['algoritmus','algoritmy','algorithm','algorithms']],
    ['neuronova sit', ['neuronová síť','neuronova sit','neurónová sieť','neuronova siet','neural network']],
    ['laser', ['laser','lasery','laserový','laserovy']],
    ['horizont udalosti', ['horizont událostí','horizont udalosti','horizont udalostí','event horizon']],
    ['singularita', ['singularita','singularity']],
    ['hawkingovo zareni', ['Hawkingovo záření','hawkingovo zareni','Hawkingovo žiarenie','hawking radiation']],
    ['galaxie', ['galaxie','galaxia','galaxy','galaxies']],
    ['planeta', ['planeta','planety','planetární','planetarni','planetárny','planetarny','planet','planets']],
    ['orbita', ['oběžná dráha','obezna draha','orbita','orbitální dráha','orbitalni draha','obežná dráha','orbit']],
    ['rychlost svetla', ['rychlost světla','rychlost svetla','rýchlosť svetla','speed of light']],
    ['velky tresk', ['velký třesk','velky tresk','veľký tresk','big bang']],
    ['temna hmota', ['temná hmota','temna hmota','tmavá hmota','tmava hmota','dark matter']],
    ['temna energie', ['temná energie','temna energie','tmavá energia','tmava energia','dark energy']],
    ['slunecni soustava', ['sluneční soustava','slunecni soustava','slnečná sústava','slnecna sustava','solar system']],
    ['mlecna draha', ['Mléčná dráha','mlecna draha','Mliečna cesta','mliecna cesta','Milky Way']],
    ['druzice', ['družice','druzice','satelit','satelity','satellite','satellites']],
    ['exoplaneta', ['exoplaneta','exoplanety','extrasolární planeta','extrasolarni planeta','exoplanet']]
  ],

  // Fráze se vyhodnocují především u dotazu. Díky nim se nemíchá např. "jak dlouho" s "jak dlouhý".
  queryPhrases: [
    ['hmotnost', ['kolik váží','kolik vazi','koľko váži','kolko vazi','jakou má hmotnost','jakou ma hmotnost','akú má hmotnosť','aku ma hmotnost','jaká je hmotnost','jaka je hmotnost']],
    ['trvani', ['jak dlouho','ako dlho','za jak dlouho','za ako dlho','jakou dobu','akú dobu','kolik času','kolko casu']],
    ['vzdalenost', ['jak daleko','ako ďaleko','ako daleko','v jaké vzdálenosti','v jake vzdalenosti','v akej vzdialenosti']],
    ['rychlost', ['jak rychle','ako rýchlo','ako rychlo','jakou rychlostí','jakou rychlosti','akou rýchlosťou','akou rychlostou']],
    ['vek', ['jak starý','jak stary','jak stará','jak stara','ako starý','ako stary','ako stará','ako stara','jaký má věk','jaky ma vek','aký má vek','aky ma vek']],
    ['velikost', ['jak velký','jak velky','jak velká','jak velka','jak velké','jak velke','ako veľký','ako velky','ako veľká','ako velka','jaké má rozměry','jake ma rozmery']],
    ['delka', ['jak dlouhý','jak dlouhy','jak dlouhá','jak dlouha','ako dlhý','ako dlhy','ako dlhá','ako dlha','jakou má délku','jakou ma delku','akú má dĺžku','aku ma dlzku']],
    ['vyska', ['jak vysoký','jak vysoky','jak vysoká','jak vysoka','ako vysoký','ako vysoky','ako vysoká','ako vysoka','jakou má výšku','jakou ma vysku']],
    ['hloubka', ['jak hluboký','jak hluboky','jak hluboká','jak hluboka','ako hlboký','ako hlboky','jaká je hloubka','jaka je hloubka']],
    ['sirka', ['jak široký','jak siroky','jak široká','jak siroka','ako široký','ako siroky','jakou má šířku','jakou ma sirku']],
    ['plocha', ['jak velkou plochu','jaká je plocha','jaka je plocha','jaká je rozloha','jaka je rozloha','aká je rozloha','aka je rozloha']],
    ['objem', ['jaký má objem','jaky ma objem','aký má objem','aky ma objem','kolik litrů','kolik litru','koľko litrov','kolko litrov']],
    ['teplota', ['jakou má teplotu','jakou ma teplotu','jaká je teplota','jaka je teplota','akú má teplotu','aku ma teplotu','aká je teplota','aka je teplota','kolik stupňů','kolik stupnu','koľko stupňov','kolko stupnov']],
    ['pocet', ['kolik je','koľko je','kolko je','kolik existuje','koľko existuje','kolko existuje','jaký je počet','jaky je pocet','aký je počet','aky je pocet']],
    ['frekvence', ['jak často','ako často','ako casto','s jakou frekvencí','s jakou frekvenci','s akou frekvenciou']],
    ['cena', ['kolik stojí','kolik stoji','koľko stojí','kolko stoji','jaká je cena','jaka je cena','aká je cena','aka je cena']],
    ['spotreba', ['kolik spotřebuje','kolik spotrebuje','koľko spotrebuje','jaká je spotřeba','jaka je spotreba','aká je spotreba','aka je spotreba']],
    ['produkce', ['kolik vyprodukuje','kolik vyrobí','kolik vyrobi','koľko vyprodukuje','koľko vyrobí','kolko vyrobi']],
    ['slozeni', ['z jakých částí','z jakych casti','z akých častí','z akych casti','z čeho se skládá','z ceho se sklada','z čoho sa skladá','z coho sa sklada','co obsahuje','čo obsahuje','co je součástí','co je soucasti','čo je súčasťou','co tvori','co tvoří']],
    ['material', ['z čeho je','z ceho je','z čoho je','z coho je','z jakého materiálu','z jakeho materialu','z akého materiálu','z akeho materialu','z čeho je vyroben','z ceho je vyroben']],
    ['princip', ['jak funguje','jak fungují','jak funguji','ako funguje','ako fungujú','ako funguju','na jakém principu','na jakem principu','na akom princípe','na akom principe']],
    ['ucel', ['k čemu slouží','k cemu slouzi','na co slouží','na co slouzi','na čo slúži','na co sluzi','k čemu se používá','k cemu se pouziva','na čo sa používa','na co sa pouziva']],
    ['definice', ['co je','co je to','čo je','co znamena','co znamená','čo znamená','co se rozumí','co se rozumi']],
    ['pricina', ['proč','prečo','z jakého důvodu','z jakeho duvodu','z akého dôvodu','z akeho dovodu','co způsobuje','co zpusobuje','čo spôsobuje','co je příčinou','co je pricinou']],
    ['vznik', ['jak vzniká','jak vznika','jak vznikají','jak vznikaji','ako vzniká','ako vznika','ako vznikajú','ako vznikaju','jak se vytvoří','jak se vytvori','ako sa vytvorí']],
    ['poloha', ['kde je','kde se nachází','kde se nachazi','kde sa nachádza','kde sa nachadza','kde leží','kde lezi']],
    ['rozdil', ['jaký je rozdíl','jaky je rozdil','aký je rozdiel','aky je rozdiel','rozdíl mezi','rozdil mezi','rozdiel medzi','v čem se liší','v cem se lisi','v čom sa líši','v com sa lisi']],
    ['moznost', ['je možné','je mozne','je možné aby','dá se','da se','dá sa','da sa','může','môže','moze','lze']],
    ['dusledek', ['co se stane','co se stane když','co se stane kdyz','co by se stalo','čo sa stane','co sa stane','co by sa stalo','jaký bude následek','jaky bude nasledek']],
    ['mereni', ['jak se měří','jak se meri','ako sa meria','jak změřit','jak zmerit','ako zmerať','ako zmerat']],
    ['vypocet', ['jak se počítá','jak se pocita','ako sa počíta','ako sa pocita','jak spočítat','jak spocitat','jak vypočítat','jak vypocitat']],
    ['nazev', ['jak se jmenuje','jak se to jmenuje','ako sa volá','ako sa vola','jaký je název','jaky je nazev','aký je názov','aky je nazov']],
    ['puvod', ['odkud pochází','odkud pochazi','odkiaľ pochádza','odkial pochadza','jaký má původ','jaky ma puvod','aký má pôvod','aky ma povod']],
    ['vliv', ['jak ovlivňuje','jak ovlivnuje','ako ovplyvňuje','ako ovplyvnuje','jaký má vliv','jaky ma vliv','aký má vplyv','aky ma vplyv']],
    ['metoda', ['jak se dá','jak se da','ako sa dá','ako sa da','jak lze','jak můžeme','jak muzeme','ako môžeme','ako mozeme']]
  ],

  // Příbuzné, ale ne totožné pojmy. Používají se až jako slabší fallback.
  semanticEdges: [
    ['foton','svetlo',.78],['foton','elektromagneticke zareni',.68],['foton','kvantum',.64],['foton','zareni',.62],['foton','energie',.50],['foton','vlna',.46],['foton','optika',.54],
    ['svetlo','optika',.78],['svetlo','elektromagneticke zareni',.72],['svetlo','vlna',.68],['svetlo','laser',.63],['svetlo','rychlost svetla',.58],
    ['cerna dira','gravitace',.86],['cerna dira','relativita',.82],['cerna dira','casoprostor',.80],['cerna dira','horizont udalosti',.94],['cerna dira','singularita',.91],['cerna dira','hawkingovo zareni',.82],['cerna dira','galaxie',.50],['cerna dira','hvezda',.56],
    ['gravitace','relativita',.79],['gravitace','casoprostor',.78],['gravitace','orbita',.68],['gravitace','planeta',.58],['gravitace','hvezda',.55],
    ['relativita','casoprostor',.88],['relativita','rychlost svetla',.72],
    ['kvantum','castice',.78],['kvantum','atom',.67],['kvantum','elektron',.68],['kvantum','foton',.64],['kvantum','vlna',.60],
    ['castice','elektron',.80],['castice','proton',.80],['castice','neutron',.80],['castice','kvark',.78],['castice','foton',.62],['castice','jadro',.55],
    ['atom','elektron',.80],['atom','proton',.73],['atom','neutron',.73],['atom','molekula',.72],['atom','jadro',.68],
    ['elektromagneticke zareni','zareni',.92],['elektromagneticke zareni','vlna',.82],['elektromagneticke zareni','svetlo',.72],
    ['vesmir','galaxie',.78],['vesmir','hvezda',.75],['vesmir','planeta',.70],['vesmir','velky tresk',.62],['vesmir','temna hmota',.58],['vesmir','temna energie',.58],
    ['galaxie','hvezda',.72],['planeta','orbita',.72],['planeta','hvezda',.58],['slunecni soustava','planeta',.82],['slunecni soustava','slunce',.84],['mlecna draha','galaxie',.95],['druzice','orbita',.68],['exoplaneta','planeta',.90],
    ['evoluce','gen',.68],['evoluce','dna',.60],['gen','dna',.88],['gen','bunka',.62],['dna','bunka',.66],
    ['klima','sklenikovy efekt',.78],['klima','co2',.70],['klima','teplota',.60],['sklenikovy efekt','co2',.80],
    ['umela inteligence','algoritmus',.80],['umela inteligence','neuronova sit',.78],['umela inteligence','pocitac',.62],['algoritmus','pocitac',.58],
    // blízké veličiny / formulace, které nejsou totožné
    ['velikost','delka',.72],['velikost','vyska',.66],['velikost','sirka',.66],['velikost','plocha',.48],['velikost','objem',.48],
    ['frekvence','trvani',.24],['pricina','vliv',.55],['slozeni','material',.78],['princip','metoda',.42]
  ]
};

'use strict';
/* Velké rozšíření odborných synonym, jazykových ekvivalentů a významů dotazů. */
(()=>{
  const M=searchScope.VEDATOR_SEARCH_MAPS;if(!M)return;
  const parseEq=text=>text.trim().split(/\n+/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#')).map(line=>{const [key,forms='']=line.split('|');return[key.trim(),forms.split(';').map(x=>x.trim()).filter(Boolean)]});
  const parseEdges=text=>text.trim().split(/\n+/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#')).map(line=>{const [a,b,w]=line.split('|');return[a.trim(),b.trim(),Number(w)]});

  M.equivalents.push(...parseEq(`
# mechanika a veličiny
zrychleni|zrychlení;zrýchlenie;akcelerace;acceleration
sila|síla;force
prace|práce;mechanická práce;mechanická práca;work
vykon|výkon;příkon;príkon;power
hybnost|hybnost;momentum
moment hybnosti|moment hybnosti;úhlová hybnost;angular momentum
tlak|tlak;pressure;pascal
hustota|hustota;měrná hmotnost;density
vztlak|vztlak;vztlaková síla;buoyancy
treni|tření;trenie;friction
pruznost|pružnost;elasticita;elasticity
setrvacnost|setrvačnost;zotrvačnosť;inertia
rotace|rotace;otáčení;rotácia;rotation
moment sily|moment síly;krouticí moment;točivý moment;torque
teziste|těžiště;ťažisko;centrum hmotnosti;center of mass
volny pad|volný pád;voľný pád;free fall
odpor prostredi|odpor prostředí;odpor vzduchu;aerodynamický odpor;drag;air resistance
terminalni rychlost|terminální rychlost;ustálená pádová rychlost;terminal velocity
kineticka energie|kinetická energie;pohybová energie;kinetic energy
potencialni energie|potenciální energie;polohová energie;potential energy
mechanicka energie|mechanická energie;mechanical energy
zakon zachovani energie|zákon zachování energie;zachování energie;conservation of energy
zakon zachovani hybnosti|zákon zachování hybnosti;zachování hybnosti;conservation of momentum

# kmity, vlny a optika
perioda|perioda;doba kmitu;period
kmitani|kmitání;oscilace;oscilácia;vibrace;oscillation
rezonance|rezonance;resonance
amplituda|amplituda;výchylka;amplitude
vlnova delka|vlnová délka;vlnová dĺžka;wavelength
interference|interference;skládání vln;interference vln
difrakce|difrakce;ohyb vln;ohyb světla;diffraction
polarizace|polarizace;polarizácia;polarization
odraz|odraz;reflexe;reflection
lom|lom;refrakce;refraction
index lomu|index lomu;refrakční index;refractive index
disperze|disperze;rozklad světla;dispersion
spektrum|spektrum;spektroskopie;spectrum;spectroscopy
doppleruv jev|Dopplerův jev;Dopplerov jev;doppler effect

# elektřina a magnetismus
elektricky proud|elektrický proud;elektrický prúd;proud;prúd;current;ampér
napeti|napětí;napätie;voltage;volt
odpor|elektrický odpor;odpor vodiče;rezistence;resistance;ohm
vodivost|vodivost;konduktivita;conductivity
elektricky naboj|elektrický náboj;náboj;charge;coulomb
elektricke pole|elektrické pole;electric field
magneticke pole|magnetické pole;magnetic field
elektromagnetismus|elektromagnetismus;elektromagnetizmus;electromagnetism
indukce|elektromagnetická indukce;indukce;indukcia;electromagnetic induction
kapacita|kapacita;elektrická kapacita;capacitance;farad
kondenzator|kondenzátor;capacitor
civka|cívka;induktor;inductor;coil
transformator|transformátor;transformer
stridavy proud|střídavý proud;striedavý prúd;AC;alternating current
stejnosmerny proud|stejnosměrný proud;jednosmerný prúd;DC;direct current

# moderní a jaderná fyzika
radioaktivita|radioaktivita;radioaktivní rozpad;radioactivity
izotop|izotop;isotope
polo cas|poločas rozpadu;half-life
jadrena stepeni|jaderné štěpení;jadrové štiepenie;nuclear fission;fission
jadrena fuze|jaderná fúze;jadrová fúzia;nuclear fusion;fusion
neutrino|neutrino;neutríno;neutrinos
antihmota|antihmota;antimatter
hmota|hmota;materie;matter
higgsuv boson|Higgsův boson;Higgsov bozón;Higgs boson
standardni model|standardní model;štandardný model;standard model
boson|boson;bozón;bosons
fermion|fermion;fermions
supervodivost|supravodivost;supervodivost;superconductivity
plazma|plazma;plasma
vakuum|vakuum;vacuum
entropie|entropie;entropy
termodynamika|termodynamika;thermodynamics
skupenske teplo|skupenské teplo;latent heat
fazovy prechod|fázový přechod;phase transition

# astronomie a kosmologie
supernova|supernova;výbuch supernovy
neutronova hvezda|neutronová hvězda;neutrónová hviezda;neutron star
bily trpaslik|bílý trpaslík;biely trpaslík;white dwarf
cerveny obr|červený obr;červený gigant;red giant
pulsar|pulsar;pulzar
kvazar|kvazar;quasar
kosmicke zareni|kosmické záření;kozmické žiarenie;cosmic rays;cosmic radiation
slunecni vitr|sluneční vítr;slnečný vietor;solar wind
polarni zare|polární záře;severní záře;aurora;aurora borealis
zatmeni|zatmění;zatmenie;eclipse
kometa|kometa;comet
asteroid|asteroid;planetka;minor planet
meteoroid|meteoroid;meteoroidy
meteor|meteor;padající hvězda;shooting star
meteorit|meteorit;meteorite
teleskop|teleskop;dalekohled;ďalekohľad;telescope
radioteleskop|radioteleskop;rádiový dalekohled;radio telescope
cerveny posuv|červený posuv;rudý posuv;redshift
gravitacni vlna|gravitační vlna;gravitačná vlna;gravitational wave
kosmologie|kosmologie;kozmológia;cosmology
astronomie|astronomie;astronómia;astronomy
astrofyzika|astrofyzika;astrophysics
svetelny rok|světelný rok;svetelný rok;light-year;light year
parsek|parsek;parsec

# Země, klima a energetika
atmosfera|atmosféra;ovzduší;atmosphere
pocasi|počasí;počasie;weather
klimaticka zmena|klimatická změna;klimatická zmena;climate change
globalni oteplovani|globální oteplování;globálne otepľovanie;global warming
ozon|ozon;ozón;ozonová vrstva;ozone
ocean|oceán;moře;more;sea;ocean
ledovec|ledovec;ľadovec;glacier
sopka|sopka;vulkán;volcano
zemetreseni|zemětřesení;zemetrasenie;earthquake
deskovatektonika|desková tektonika;tektonika desek;plate tectonics
geotermalni energie|geotermální energie;geotermálna energia;geothermal energy
fosilni paliva|fosilní paliva;fossil fuels
obnovitelne zdroje|obnovitelné zdroje;renewables;renewable energy
solarni energie|solární energie;sluneční energie;solar energy
vetrna energie|větrná energie;wind energy
jadrena energie|jaderná energie;jadrová energia;nuclear energy

# chemie
chemicky prvek|chemický prvek;prvek;prvok;element;chemical element
periodicka tabulka|periodická tabulka;periodická soustava;periodic table
chemicka vazba|chemická vazba;chemical bond
ion|ion;iont;ión;ions
kyselina|kyselina;acid
zasada|zásada;báze;base;alkali
ph|pH;kyselost;acidita;alkalita
oxidace|oxidace;oxidácia;oxidation
redukce|redukce;redukcia;reduction
redox|redox;redoxní reakce;oxidačně redukční
katalyzator|katalyzátor;catalyst
chemicka reakce|chemická reakce;reakce;reaction
roztok|roztok;solution
rozpoustedlo|rozpouštědlo;solvent
rozpustena latka|rozpuštěná látka;solute
koncentrace|koncentrace;molarita;concentration;molarity
vodik|vodík;hydrogen;H2
kyslik|kyslík;oxygen;O2
dusik|dusík;nitrogen;N2
uhlik|uhlík;carbon
voda|voda;H2O;water
metan|metan;methane;CH4

# biologie, genetika a medicína
rna|RNA;ribonukleová kyselina
chromozom|chromozom;chromosom;chromosome
genom|genom;genome
mutace|mutace;mutácia;mutation
prirodni vyber|přírodní výběr;přirozený výběr;natural selection
protein|protein;bílkovina;proteín
 enzyma|enzym;enzyme
mitochondrie|mitochondrie;mitochondria
ribozom|ribozom;ribosom;ribosome
bakterie|bakterie;baktérie;bacteria
virus|virus;viry;vírus;viruses
houba|houba;plíseň;fungus;fungi
imunita|imunita;imunitní systém;imunitný systém;immune system
vakcina|vakcína;očkování;očkovanie;vaccination;vaccine
protilatka|protilátka;antibody
hormon|hormon;hormone
mozek|mozek;mozog;brain
neuron|neuron;neurón;nerve cell
nervova soustava|nervová soustava;nervový systém;nervous system
krev|krev;krv;blood
srdce|srdce;heart
plice|plíce;pľúca;lungs
ledvina|ledvina;ledviny;oblička;kidney
jatra|játra;pečeň;liver
traveni|trávení;trávenie;digestion
metabolismus|metabolismus;metabolizmus;metabolism
spermie|spermie;spermatozoid;sperm cell
vajicko|vajíčko;oocyt;ovum;egg cell
oplodneni|oplodnění;fertilizace;fertilization
tehotenstvi|těhotenství;gravidita;pregnancy
plodnost|plodnost;fertilita;fertility
rakovina|rakovina;nádorové onemocnění;cancer
nador|nádor;tumor;tumour
infekce|infekce;infection
nemoc|nemoc;choroba;onemocnění;disease;illness
antibiotikum|antibiotikum;antibiotika;antibiotic
mikrobiom|mikrobiom;mikroflóra;microbiome
fotosynteza|fotosyntéza;photosynthesis
bunecne dychani|buněčné dýchání;cellular respiration
organismus|organismus;organizmus;organism
druh|biologický druh;species
ekosystem|ekosystém;ecosystem
spanek|spánek;spánok;sleep
vedomi|vědomí;vedomie;consciousness
pamet|paměť;pamäť;memory
stres|stres;stress
deprese|deprese;depresia;depression
uzkost|úzkost;anxiety
placebo|placebo;placebo efekt;placebo effect
bolest|bolest;pain
horecka|horečka;horúčka;fever
zanet|zánět;zápal;inflammation
prevence|prevence;prevencia;prevention
lecba|léčba;liečba;terapie;therapy;treatment
diagnoza|diagnóza;diagnosis
priznak|příznak;symptom

# technologie a AI
strojove uceni|strojové učení;machine learning;ML
hluboke uceni|hluboké učení;deep learning
generativni ai|generativní AI;generative AI
jazykovy model|jazykový model;velký jazykový model;LLM;large language model
robot|robot;robotika;robotics
internet|internet;internetová síť
web|web;WWW;world wide web;webová stránka
blockchain|blockchain;blokový řetězec
kvantovy pocitac|kvantový počítač;quantum computer;quantum computing
tranzistor|tranzistor;transistor
polovodic|polovodič;semiconductor
dioda|dioda;diode
baterie|baterie;akumulátor;battery
solarni clanek|solární článek;fotovoltaický článek;solar cell
fotovoltaika|fotovoltaika;fotovoltaický jev;photovoltaics;PV
fotoelektricky jev|fotoelektrický jev;photoelectric effect
senzor|senzor;čidlo;sensor
gps|GPS;globální polohový systém;Global Positioning System
raketa|raketa;nosná raketa;rocket;launch vehicle
kosmicka lod|kosmická loď;vesmírná loď;spacecraft;spaceship
sonda|sonda;kosmická sonda;space probe
dezinformace|dezinformace;misinformation;disinformation
konspirace|konspirace;konspirační teorie;conspiracy theory
socialni site|sociální sítě;sociálne siete;social media

# další typy významu dotazu
historie|historie;dějiny;history
objevitel|objevitel;vynálezce;discoverer;inventor
priklad|příklad;example
vyhoda|výhoda;benefit;advantage
nevyhoda|nevýhoda;drawback;disadvantage
riziko|riziko;nebezpečí;risk;danger
dukaz|důkaz;evidence;proof
pozorovani|pozorování;detekce;observation;detection
zdroj|zdroj;source
struktura|struktura;stavba;structure
funkce|funkce;role;function
`));

  M.queryPhrases.push(...parseEq(`
zrychleni|jaké má zrychlení;jak rychle zrychluje;ako rýchlo zrýchľuje
hustota|jakou má hustotu;jaká je hustota;aká je hustota
tlak|jaký je tlak;jaký tlak;aký je tlak
vykon|jaký má výkon;kolik má wattů;jaký je příkon
energie|kolik má energie;jaká je energie
elektricky proud|jaký teče proud;jak velký proud;kolik ampér
napeti|jaké je napětí;kolik voltů
odpor|jaký má odpor;kolik ohmů
perioda|jaká je perioda;jak dlouho trvá jeden kmit
vlnova delka|jaká je vlnová délka;jakou má vlnovou délku
koncentrace|jaká je koncentrace;kolik látky je v roztoku
ph|jaké má pH;jak je kyselé;jaká je kyselost
lecba|jak se léčí;ako sa lieči;jaká je léčba
prevence|jak tomu předejít;jak se tomu vyhnout;jak tomu zabránit
priznak|jaké jsou příznaky;jak se to projevuje;jaké má symptomy
diagnoza|jak se to pozná;jak se diagnostikuje;jak zjistit jestli
historie|kdy vznikl;kdy vznikla;kdy bylo objeveno;kdy byla objevena;od kdy existuje
objevitel|kdo objevil;kdo vynalezl;kdo přišel na;kto objavil
priklad|uveď příklad;jaký je příklad;například
vyhoda|jaké jsou výhody;v čem je výhoda
nevyhoda|jaké jsou nevýhody;v čem je nevýhoda
riziko|jaké je riziko;jak nebezpečné;je to nebezpečné
dukaz|jaký je důkaz;jak to víme;čím je to doloženo
pozorovani|jak to pozorovat;jak to vidět;jak se to sleduje;jak to detekovat
zdroj|odkud se bere;jaký je zdroj;z čeho pochází
struktura|jakou má strukturu;jak je uspořádaný;jak je stavěný
funkce|jakou má funkci;co dělá;jaká je jeho role
rychlost svetla|jak rychlé je světlo;jakou rychlost má světlo
svetelny rok|kolik je světelný rok;jak dlouhý je světelný rok
`));

  M.semanticEdges.push(...parseEdges(`
sila|zrychleni|0.75
sila|hmotnost|0.58
sila|prace|0.60
prace|energie|0.86
prace|vykon|0.76
vykon|energie|0.66
rotace|moment sily|0.72
rotace|moment hybnosti|0.72
volny pad|gravitace|0.86
volny pad|zrychleni|0.72
terminalni rychlost|odpor prostredi|0.84
kineticka energie|energie|0.92
potencialni energie|energie|0.92
mechanicka energie|kineticka energie|0.82
mechanicka energie|potencialni energie|0.82
kmitani|perioda|0.82
kmitani|frekvence|0.82
kmitani|amplituda|0.74
kmitani|rezonance|0.68
vlna|vlnova delka|0.84
vlna|frekvence|0.80
vlna|perioda|0.72
vlna|interference|0.70
vlna|difrakce|0.68
svetlo|interference|0.68
svetlo|difrakce|0.68
svetlo|polarizace|0.68
svetlo|odraz|0.64
svetlo|lom|0.70
lom|index lomu|0.90
svetlo|disperze|0.62
svetlo|spektrum|0.66
doppleruv jev|frekvence|0.72
doppleruv jev|vlna|0.76
elektricky proud|napeti|0.82
elektricky proud|odpor|0.78
napeti|odpor|0.70
elektricky naboj|elektricke pole|0.84
elektricky proud|magneticke pole|0.62
elektromagnetismus|elektricke pole|0.82
elektromagnetismus|magneticke pole|0.82
indukce|magneticke pole|0.86
indukce|elektricky proud|0.68
kondenzator|kapacita|0.92
civka|indukce|0.70
transformator|stridavy proud|0.86
radioaktivita|izotop|0.82
radioaktivita|polo cas|0.84
jadrena stepeni|jadro|0.82
jadrena fuze|jadro|0.80
jadrena fuze|hvezda|0.72
higgsuv boson|standardni model|0.86
supervodivost|kvantum|0.66
termodynamika|entropie|0.82
termodynamika|teplota|0.72
supernova|hvezda|0.90
supernova|neutronova hvezda|0.74
neutronova hvezda|pulsar|0.88
cerveny obr|hvezda|0.86
bily trpaslik|hvezda|0.86
kvazar|cerna dira|0.72
kosmicke zareni|zareni|0.82
slunecni vitr|slunce|0.86
polarni zare|slunecni vitr|0.76
polarni zare|magneticke pole|0.70
zatmeni|slunce|0.60
zatmeni|mesic|0.70
kometa|slunecni soustava|0.72
asteroid|slunecni soustava|0.72
meteor|meteoroid|0.84
meteorit|meteoroid|0.84
teleskop|astronomie|0.74
radioteleskop|teleskop|0.90
cerveny posuv|vesmir|0.70
cerveny posuv|doppleruv jev|0.62
gravitacni vlna|gravitace|0.84
gravitacni vlna|relativita|0.74
kosmologie|vesmir|0.88
astrofyzika|astronomie|0.86
svetelny rok|vzdalenost|0.90
parsek|vzdalenost|0.90
chemicky prvek|periodicka tabulka|0.90
chemicky prvek|atom|0.82
chemicka vazba|atom|0.76
ion|elektron|0.72
kyselina|ph|0.84
zasada|ph|0.84
oxidace|redukce|0.90
redox|oxidace|0.92
redox|redukce|0.92
katalyzator|chemicka reakce|0.84
roztok|rozpoustedlo|0.78
roztok|rozpustena latka|0.78
roztok|koncentrace|0.72
dna|rna|0.82
dna|chromozom|0.84
dna|genom|0.80
gen|chromozom|0.84
gen|mutace|0.78
evoluce|prirodni vyber|0.88
protein|gen|0.72
protein|enzyma|0.76
mitochondrie|bunka|0.82
ribozom|protein|0.72
bakterie|mikrobiom|0.72
virus|infekce|0.80
bakterie|infekce|0.74
imunita|vakcina|0.82
imunita|protilatka|0.86
mozek|neuron|0.86
neuron|nervova soustava|0.86
srdce|krev|0.78
traveni|metabolismus|0.68
spermie|vajicko|0.72
spermie|oplodneni|0.80
vajicko|oplodneni|0.82
oplodneni|tehotenstvi|0.80
plodnost|spermie|0.72
rakovina|nador|0.92
nemoc|diagnoza|0.68
nemoc|lecba|0.68
nemoc|priznak|0.70
infekce|zanet|0.66
antibiotikum|bakterie|0.82
fotosynteza|energie|0.58
fotosynteza|co2|0.60
atmosfera|pocasi|0.80
atmosfera|klima|0.74
klimaticka zmena|klima|0.94
globalni oteplovani|klimaticka zmena|0.90
globalni oteplovani|sklenikovy efekt|0.78
ozon|atmosfera|0.72
ocean|klima|0.68
ledovec|klimaticka zmena|0.72
deskovatektonika|zemetreseni|0.82
deskovatektonika|sopka|0.80
fosilni paliva|co2|0.72
obnovitelne zdroje|solarni energie|0.72
obnovitelne zdroje|vetrna energie|0.72
jadrena energie|jadrena stepeni|0.82
strojove uceni|umela inteligence|0.90
hluboke uceni|strojove uceni|0.92
neuronova sit|hluboke uceni|0.86
generativni ai|umela inteligence|0.90
jazykovy model|generativni ai|0.84
jazykovy model|umela inteligence|0.82
robot|umela inteligence|0.62
internet|web|0.82
kvantovy pocitac|kvantum|0.82
tranzistor|polovodic|0.88
dioda|polovodic|0.86
baterie|elektrina|0.64
solarni clanek|fotovoltaika|0.94
fotovoltaika|fotoelektricky jev|0.76
fotoelektricky jev|foton|0.82
gps|druzice|0.86
raketa|kosmicka lod|0.62
sonda|kosmicka lod|0.76
dezinformace|konspirace|0.64
socialni site|dezinformace|0.58
`));
})();

'use strict';

const MAPS = searchScope.VEDATOR_SEARCH_MAPS || {equivalents:[],queryPhrases:[],semanticEdges:[]};
const state = {index:[],df:new Map(),postings:new Map(),corpusSize:1,filter:'all'};

const norm = value => String(value??'')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

const STOP = new Set(norm(`
a aby aj ale anebo ani ano asi az bez bude budou byl byla byli bylo by bych bychom byste
co coz ci do ho i jak jako je jej jeho jejich jen jenom ji jich jim jimi jinak jiz k kam kde kdy kdo
ktera ktere ktery kterou kterym kterych jaky jaka jake jakou jakem jakeho jakych kolik ku ma maji mezi mi mit mne mnou muze na nad nam nami ne nebo nech neni nez nic
o od on ona oni ono pak po pod podle pokud pro proc proto pri pred pres se si sice svoji sve svuj
ta tak take tam ten tento te tim to toto tu ty u uz v vam vami ve velmi vy z za ze priblizne zhruba asi
a ako ano bez bude budu bol bola boli bolo byt som sme ste co ci ich im inak jej jeho len medzi
ma maju moct moze nie alebo podla pokial pre preco preto pri pred cez sa svoj svoje vo zo aky aka ake aku akou akom akeho ktory ktora ktore kolko približne priblizne
`).split(/\s+/).filter(Boolean));

const SUFFIXES = `
ovymi evymi ovych evych oveho eveho ovemu evemu ovami evami ovou evou
ami emi imi omi ach ech ich och iach iami atami enami
ovani anie enie enia eniu ujeji ujici ujuci
ujeme ujete ujem uje aju ali ala alo ate eti ity oti eni ena eno ily ila ilo ete ite
skymi ckymi skeho ckeho skemu ckemu skych ckych
nosti nostiach eho iho ymi imi omu ych ou em am ym im om um
ovy ova ove ovi ovu ev sk ck y i a e u o
`.trim().split(/\s+/).map(norm).filter(Boolean).sort((a,b)=>b.length-a.length);

function stem(word){
  let w=norm(word);
  if(w.length<5)return w;
  for(const s of SUFFIXES){
    if(w.endsWith(s) && w.length-s.length>=4){w=w.slice(0,-s.length);break;}
  }
  return w;
}

const alias=new Map();
const phraseAliases=[];
for(const [canonicalRaw,forms] of MAPS.equivalents){
  const canonical=norm(canonicalRaw);
  const all=[canonicalRaw,...forms];
  alias.set(canonical,canonical);
  alias.set(stem(canonical),canonical);
  for(const formRaw of all){
    const form=norm(formRaw);
    if(!form)continue;
    if(form.includes(' ')) phraseAliases.push([form,canonical]);
    else {
      alias.set(form,canonical);
      alias.set(stem(form),canonical);
    }
  }
}
phraseAliases.sort((a,b)=>b[0].length-a[0].length);

const queryPhrases=[];
for(const [canonicalRaw,forms] of MAPS.queryPhrases){
  const canonical=norm(canonicalRaw);
  for(const formRaw of forms){
    const form=norm(formRaw);
    if(form)queryPhrases.push([form,canonical]);
  }
}
queryPhrases.sort((a,b)=>b[0].length-a[0].length);

const semanticGraph=new Map();
function addSemantic(a,b,w){
  a=canon(a);b=canon(b);
  if(!semanticGraph.has(a))semanticGraph.set(a,new Map());
  const m=semanticGraph.get(a);
  m.set(b,Math.max(m.get(b)||0,w));
}
for(const [a,b,w] of MAPS.semanticEdges){addSemantic(a,b,w);addSemantic(b,a,w*.94);}

function canon(value){
  const n=norm(value);
  return alias.get(n)||alias.get(stem(n))||stem(n);
}

function hasPhrase(haystack,phrase){
  return (` ${haystack} `).includes(` ${phrase} `);
}

function extractTerms(text,{query=false}={}){
  const normalized=norm(text);
  if(!normalized)return[];
  const out=[],seen=new Set();
  const add=(key,label,kind='word')=>{
    key=canon(key);
    if(!key||seen.has(key))return;
    seen.add(key);out.push({key,label:label||key,kind});
  };

  // Nejprve víceslovné odborné ekvivalence.
  for(const [phrase,key] of phraseAliases){
    if(hasPhrase(normalized,phrase))add(key,phrase,'phrase');
  }

  // Potom význam otázky: „kolik váží“ = hmotnost, „jak dlouho“ = trvání atd.
  if(query){
    for(const [phrase,key] of queryPhrases){
      if(hasPhrase(normalized,phrase))add(key,phrase,'intent');
    }
  }

  const tokens=normalized.split(/\s+/).filter(Boolean);
  for(const token of tokens){
    if(token.length<2||STOP.has(token))continue;
    const key=canon(token);
    if(!key||STOP.has(key))continue;
    add(key,token,'word');
  }
  return out;
}

function parseTime(value){
  const p=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
  if(!p)return 0;
  return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1];
}

function flattenData(data){
  const items=[];
  for(const q of data.questions||[]){
    const cs=q.i18n?.cs||{title:q.title||'',points:Array.isArray(q.points)?q.points:[]};
    const sk=q.i18n?.sk||{title:q.title||'',points:Array.isArray(q.points)?q.points:[]};
    items.push({
      id:`q:${q.episode}:${q.order}`,type:'question',episode:Number(q.episode)||0,order:Number(q.order)||0,
      seconds:Number(q.seconds)||0,time:q.sourceTime||q.time||'',
      cs:{title:String(cs.title||q.title||''),points:Array.isArray(cs.points)?cs.points.map(String):[]},
      sk:{title:String(sk.title||q.title||''),points:Array.isArray(sk.points)?sk.points.map(String):[]}
    });
  }
  for(const [episode,languages] of Object.entries(data.nonquestions?.episodes||{})){
    const cs=Array.isArray(languages?.cs)?languages.cs:[];
    const sk=Array.isArray(languages?.sk)?languages.sk:[];
    const count=Math.max(cs.length,sk.length);
    for(let i=0;i<count;i++){
      const a=cs[i]||sk[i]||{},b=sk[i]||cs[i]||{};
      items.push({
        id:`n:${episode}:${i}`,type:'nonquestion',episode:Number(episode)||0,order:i,
        seconds:Number(a.seconds??b.seconds)||parseTime(a.time||b.time||'0:00'),
        time:a.sourceTime||a.time||b.sourceTime||b.time||'',
        cs:{title:String(a.title||b.title||''),points:Array.isArray(a.points)?a.points.map(String):[]},
        sk:{title:String(b.title||a.title||''),points:Array.isArray(b.points)?b.points.map(String):[]}
      });
    }
  }
  return items;
}

function buildIndex(items){
  state.df=new Map();
  state.postings=new Map();
  const index=items.map((item,idx)=>{
    const title=[item.cs.title,item.sk.title].join(' ');
    const full=[item.cs.title,...item.cs.points,item.sk.title,...item.sk.points].join(' ');
    const titleTerms=extractTerms(title,{query:true});
    const bodyTerms=extractTerms(full);
    const byKey=new Map();
    for(const t of [...titleTerms,...bodyTerms])if(!byKey.has(t.key))byKey.set(t.key,t);
    const terms=[...byKey.values()];
    const termSet=new Set(terms.map(t=>t.key));
    const titleSet=new Set(titleTerms.map(t=>t.key));
    for(const key of termSet){
      state.df.set(key,(state.df.get(key)||0)+1);
      if(!state.postings.has(key))state.postings.set(key,[]);
      state.postings.get(key).push(idx);
    }
    return {item,title,full,normTitle:norm(title),normFull:norm(full),terms,termSet,titleSet};
  });
  state.corpusSize=Math.max(1,index.length);
  return index;
}

function idf(key){
  const df=state.df.get(key)||0;
  return Math.max(1,Math.min(5.2,Math.log((state.corpusSize+1)/(df+1))+1));
}

const INTENT_IMPORTANCE=new Map([
  ['hmotnost',.95],['trvani',.92],['vzdalenost',.92],['rychlost',.92],['vek',.90],
  ['velikost',.90],['delka',.92],['vyska',.92],['hloubka',.92],['sirka',.92],['plocha',.90],['objem',.90],
  ['teplota',.92],['pocet',.88],['frekvence',.90],['cena',.90],['spotreba',.90],['produkce',.88],
  ['slozeni',.72],['material',.72],['princip',.72],['ucel',.66],['definice',.45],['pricina',.66],['vznik',.70],
  ['poloha',.66],['rozdil',.72],['moznost',.52],['dusledek',.64],['mereni',.68],['vypocet',.68],
  ['nazev',.55],['puvod',.62],['vliv',.68],['metoda',.62]
]);
function queryWeight(term){
  return idf(term.key)*(term.kind==='intent'?(INTENT_IMPORTANCE.get(term.key)??.70):1);
}

function queryCandidates(qTerms,qNorm){
  const ids=new Set();
  const keys=qTerms.map(t=>t.key);
  for(const key of keys){
    for(const id of state.postings.get(key)||[])ids.add(id);
    for(const [related] of semanticGraph.get(key)||[]){
      for(const id of state.postings.get(related)||[])ids.add(id);
    }
  }

  // Přesná fráze má absolutní prioritu, proto ji dohledáme i mimo postings.
  if(qNorm.length>=3){
    state.index.forEach((e,i)=>{
      if(e.normTitle.includes(qNorm)||e.normFull.includes(qNorm))ids.add(i);
    });
  }

  // U velmi krátkého/obecného dotazu raději zkontrolujeme vše.
  if(!ids.size || ids.size<8){
    for(let i=0;i<state.index.length;i++)ids.add(i);
  }
  return ids;
}

function semanticScore(qTerms,entry){
  let weighted=0,total=0;const matches=[];
  for(const q of qTerms){
    const qw=queryWeight(q);total+=qw;
    if(entry.termSet.has(q.key))continue;
    let best=0,bestKey='';
    for(const [related,w] of semanticGraph.get(q.key)||[]){
      if(entry.termSet.has(related)&&w>best){best=w;bestKey=related;}
    }
    if(best){weighted+=qw*best;matches.push(`${q.label} → ${bestKey}`);}
  }
  return {score:total?weighted/total:0,matches};
}

function rank(query){
  const qNorm=norm(query);
  if(!qNorm)return[];
  const qTerms=extractTerms(query,{query:true});
  if(!qTerms.length)return[];
  const candidates=queryCandidates(qTerms,qNorm);
  const qWeightTotal=qTerms.reduce((s,t)=>s+queryWeight(t),0)||1;
  const results=[];

  for(const idx of candidates){
    const entry=state.index[idx],item=entry.item;
    if(state.filter!=='all'&&item.type!==state.filter)continue;

    const exactTitle=entry.normTitle.includes(qNorm);
    const exactAny=entry.normFull.includes(qNorm);
    let directWeight=0,titleWeight=0,directCount=0;
    const matched=[];
    for(const q of qTerms){
      const w=queryWeight(q);
      if(entry.termSet.has(q.key)){
        directWeight+=w;directCount++;matched.push(q.label);
        if(entry.titleSet.has(q.key))titleWeight+=w;
      }
    }
    const coverage=directWeight/qWeightTotal;
    const titleCoverage=titleWeight/qWeightTotal;
    const semantic=semanticScore(qTerms,entry);

    let tier=99,reason='';
    if(exactTitle){tier=0;reason='exact-title';}
    else if(exactAny){tier=1;reason='exact-any';}
    else if(coverage>=.78){tier=2;reason='same-meaning';}
    else if(coverage>=.42 && directCount>=1){tier=3;reason='direct';}
    else if(semantic.score>=.42){tier=4;reason='semantic';}
    else if(coverage>=.18 && directCount>=1){tier=5;reason='weak-direct';}
    else if(semantic.score>=.20){tier=6;reason='distant-semantic';}
    if(tier===99)continue;

    let score=.68*coverage+.20*titleCoverage+.12*semantic.score;
    if(exactAny)score=Math.max(score,.86);
    if(exactTitle)score=Math.max(score,.97);
    if(reason==='same-meaning')score=Math.max(score,.72+.18*titleCoverage);
    score=Math.min(1,score);
    results.push({entry,score,tier,reason,coverage,titleCoverage,semantic,matchedDirect:[...new Set(matched)]});
  }

  return results.sort((a,b)=>
    a.tier-b.tier || b.score-a.score || b.titleCoverage-a.titleCoverage ||
    b.coverage-a.coverage || b.entry.item.episode-a.entry.item.episode || a.entry.item.order-b.entry.item.order
  );
}

return {load(data){state.items=flattenData(data);state.index=buildIndex(state.items)},search(query,filter='all'){state.filter=filter;return rank(query)}};
  }


  const askUi={engine:null,data:null,draft:'',query:'',filter:'all',ranked:[],visible:30,open:new Set()};
  function askEngine(){
    if(!askUi.engine)askUi.engine=createAskSearchEngine();
    if(askUi.data!==state.data){askUi.engine.load(state.data);askUi.data=state.data;if(askUi.query)askUi.ranked=askUi.engine.search(askUi.query,askUi.filter)}
    return askUi.engine;
  }
  function askReason(result){
    const labels={
      'exact-title':text('Přesná shoda v názvu','Presná zhoda v názve'),
      'exact-any':text('Přesná shoda v textu','Presná zhoda v texte'),
      'same-meaning':text('Stejný význam / synonymum','Rovnaký význam / synonymum'),
      'direct':text('Přímá věcná shoda','Priama vecná zhoda'),
      'semantic':text('Příbuzné téma','Príbuzné téma'),
      'weak-direct':text('Slabší přímá shoda','Slabšia priama zhoda'),
      'distant-semantic':text('Vzdálenější souvislost','Vzdialenejšia súvislosť')
    };return labels[result.reason]||'';
  }
  function syncAskSearchControls(){
    const ask=state.view==='ask',search=$('#search-v2'),controls=search.closest('.controls');
    controls.classList.remove('hidden');controls.classList.toggle('ask-controls-v2',ask);
    $('#ask-submit-v2').classList.toggle('hidden',!ask);
    $('#ask-submit-v2').textContent=text('Hledat','Hľadať');
    search.placeholder=ask?text('Zadej otázku…','Zadaj otázku…'):text('Hledat v právě otevřené záložce…','Hľadať v práve otvorenej záložke…');
    search.setAttribute('aria-label',ask?text('Tvoje otázka','Tvoja otázka'):text('Vyhledávání','Vyhľadávanie'));
  }
  function renderAsk(){
    const root=$('#ask-v2');if(!root)return;
    askEngine();
    if(!root.querySelector('#ask-filters-v2')){
      root.innerHTML='<div id="ask-filters-v2" class="tabs ask-type-filters-v2"></div><p id="ask-status-v2" class="hidden" role="status" aria-live="polite"></p><div id="ask-results-v2" class="grid"></div><button id="ask-more-v2" class="secondary hidden" type="button"></button>';
      root.addEventListener('click',event=>{
        const filter=event.target.closest('[data-ask-filter]');
        if(filter){askUi.filter=filter.dataset.askFilter;if(askUi.query)askUi.ranked=askEngine().search(askUi.query,askUi.filter);askUi.visible=30;renderAsk();return}
        const more=event.target.closest('[data-ask-answer]');
        if(more){const id=more.dataset.askAnswer;if(askUi.open.has(id))askUi.open.delete(id);else askUi.open.add(id);renderAskResults();return}
        if(event.target.closest('#ask-more-v2')){askUi.visible+=30;renderAskResults()}
      });
    }
    $('#ask-filters-v2').innerHTML=[['all',text('Vše','Všetko')],['question','Otázky'],['nonquestion','Neotázky']].map(([value,label])=>'<button type="button" class="ask-filter-v2 '+(askUi.filter===value?'active':'')+'" data-ask-filter="'+value+'" aria-pressed="'+(askUi.filter===value)+'">'+label+'</button>').join('');
    renderAskResults();
  }
  function renderAskResults(){
    const noMatch=Boolean(askUi.query)&&!askUi.ranked.length;
    $('#ask-status-v2').textContent=noMatch?text('Nenašel jsem použitelnou shodu. Zkus otázku přeformulovat.','Nenašiel som použiteľnú zhodu. Skús otázku preformulovať.'):'';
    $('#ask-status-v2').classList.toggle('hidden',!noMatch);
    $('#ask-results-v2').innerHTML=askUi.ranked.slice(0,askUi.visible).map(result=>{
      const item=result.entry.item,copy=sk()?item.sk:item.cs,open=askUi.open.has(item.id),kind=item.type==='question'?'question':'nonquestion';
      const q=kind==='question'?state.data.questions.find(q=>Number(q.episode)===item.episode&&Number(q.order)===item.order):null;
      const ref=q?qRef(q):'';
      const percent=Math.max(1,Math.round(Math.min(result.reason==='semantic'?.69:result.reason==='distant-semantic'?.49:1,result.score)*100));
      return '<article class="card ask-card-v2 '+(open?'ask-open-v2':'')+'" data-ask-id="'+esc(item.id)+'"><div class="meta">'+text('Díl','Diel')+' '+item.episode+' · '+(kind==='question'?'Otázka':'Neotázka')+(item.time?' · '+esc(item.time):'')+'</div><h2>'+esc(copy.title)+'</h2><div class="ask-answer-v2"><ul>'+copy.points.map(point=>'<li>'+esc(point)+'</li>').join('')+'</ul></div><div class="tags"><span class="tag">'+esc(askReason(result))+'</span><span class="tag">'+text('Podobnost','Podobnosť')+' '+percent+' %</span></div><div class="ask-actions-v2"><button type="button" class="play" data-episode="'+item.episode+'" data-seconds="'+item.seconds+'" data-ref="'+esc(ref)+'">▶ '+text('Přehrát odpověď','Prehrať odpoveď')+'</button>'+(copy.points.length?'<button type="button" class="secondary" data-ask-answer="'+esc(item.id)+'" aria-expanded="'+open+'">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>':'')+'<a class="secondary" href="#'+kind+'='+item.episode+':'+item.order+'">'+text('Zobrazit v katalogu','Zobraziť v katalógu')+'</a></div></article>';
    }).join('');
    $('#ask-more-v2').textContent=text('Zobrazit další','Zobraziť ďalšie');
    $('#ask-more-v2').classList.toggle('hidden',askUi.visible>=askUi.ranked.length);
    if(state.view==='ask')$('#count-v2').textContent=askUi.query?askUi.ranked.length+' '+text('výsledků','výsledkov'):'';
  }
  function submitAsk(){
    if(state.view!=='ask')return;
    askUi.draft=$('#search-v2').value;askUi.query=askUi.draft.trim();askUi.visible=30;askUi.open.clear();
    askUi.ranked=askEngine().search(askUi.query,askUi.filter);renderAskResults();
  }


  async function start(){
    const status=$('#status-v2');
    try{
      const response=await fetch('./content-v2.json',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);state.data=await response.json();
      buildLegacyQuestionIndex();loadUserData();installEpisodeExperienceStyles();installUiExperience();installFullParityUi();installPlaylistParity();installFinalUiV2();applyStaticUi();renderEpisodes();renderSeries();renderQuestions();renderNonQuestions();renderPlaylists();renderData();bind();setView('episodes');
      status.textContent='';
      document.documentElement.dataset.vedatorV2Ready='1';window.dispatchEvent(new CustomEvent('vedator-v2-ready',{detail:{episodes:state.data.episodes.length,questions:state.data.questions.length,playlists:state.playlists.length,language:state.language}}));setTimeout(importSharedPlaylist,0);
    }catch(error){status.textContent=`${text('V2 se nepodařilo načíst','V2 sa nepodarilo načítať')}: ${error.message}`;status.classList.add('error');console.error(error)}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  /* V2_CARD_PLAYER_POLISH_V1 */
  const cardPolishEpisodeOpen=new Set();
  function cardPolishCutDescription(value){
    const raw=String(value||'');
    const cut=raw.search(/Podcast vzniká\s+(?:v|ve)\s+spolupráci\s+(?:so|se)\s+SME\.?/i);
    return (cut>=0?raw.slice(0,cut):raw).trim();
  }
  function cardPolishCollapsedDescription(value,terms){
    const raw=String(value||'').replace(/\s+/g,' ').trim();if(!raw)return'';
    if(state.query.trim()&&terms.length)return mobileEpisodeExcerpt(raw,terms);
    if(raw.length<=240)return raw;
    let end=240;
    while(end>180&&!/\s/.test(raw[end]||''))end--;
    if(end<=180)end=240;
    return raw.slice(0,end).trimEnd()+'…';
  }
  playLabel=function(number){
    const record=state.progress[episodeKey(number)];
    if(record&&!record.completed&&Number(record.currentTime)>10)return text('Pokračovat','Pokračovať');
    return text('Přehrát','Prehrať');
  };
  seriesResumeLabel=function(info){return info.started&&!info.finished?text('Pokračovat','Pokračovať'):text('Přehrát','Prehrať')};
  playlistResumeLabel=function(info){return info.started&&!info.finished?text('Pokračovat','Pokračovať'):text('Přehrát','Prehrať')};
  allEpisodeSearch=function(episode){
    const cs=episode?.i18n?.cs||{},skCopy=episode?.i18n?.sk||{};
    return norm(String(episode?.number||'')+' '+String(episode?.title||'')+' '+cardPolishCutDescription(episode?.description)+' '+String(cs.title||'')+' '+cardPolishCutDescription(cs.description)+' '+String(skCopy.title||'')+' '+cardPolishCutDescription(skCopy.description));
  };
  cardEpisode=function(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number),terms=mobileEpisodeHighlightTerms(),full=cardPolishCutDescription(copy.description),open=cardPolishEpisodeOpen.has(Number(episode.number)),short=cardPolishCollapsedDescription(full,terms),shown=open?full:short,canExpand=full.length>short.replace(/…$/,'').length+2;
    return '<article class="card searchable episode-card-v2 '+(open?'episode-open-v2':'')+'" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+mobileHighlightHtml(copy.title,terms)+'</h2>'+              
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<p class="desc-v2">'+mobileHighlightHtml(shown,terms)+'</p>'+episodeTagHtml(episode)+
      '<div class="episode-summary-slot-v2">'+episodeSummaryHtml(episode)+'</div>'+ 
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+ 
      (canExpand?'<button type="button" class="secondary episode-more-v2" data-episode="'+(Number(episode.number)||0)+'">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>':'')+shareButton('episode',String(episode.number))+'</div></article>';
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.episode-more-v2');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    const number=Number(button.dataset.episode)||0,episode=episodeByNumber(number),oldCard=button.closest('.episode-card-v2');
    if(!episode||!oldCard)return;
    if(cardPolishEpisodeOpen.has(number))cardPolishEpisodeOpen.delete(number);else cardPolishEpisodeOpen.add(number);
    const host=document.createElement('div');host.innerHTML=cardEpisode(episode);const nextCard=host.firstElementChild;if(nextCard)oldCard.replaceWith(nextCard);
  },true);
  const cardPolishOriginalSyncPlayer=syncPlayer;
  syncPlayer=function(...args){
    const result=cardPolishOriginalSyncPlayer(...args),audio=$('#audio-v2'),button=$('#player-play-v2');
    if(audio&&button)button.textContent=audio.paused?'▶':'Ⅱ';
    return result;
  };
  function installCardPlayerPolishStyles(){
    if(document.querySelector('style[data-v2-card-player-polish]'))return;
    const style=document.createElement('style');style.dataset.v2CardPlayerPolish='1';
    style.textContent='.player-shell{background:color-mix(in srgb,var(--card) 88%,var(--accent) 12%)!important}'+
      '.episode-summary-slot-v2{margin-top:auto;padding-top:.65rem}.episode-summary-slot-v2:empty{display:none}'+
      '.episode-summary-slot-v2 .episode-summary-v2{margin:.35rem 0 .75rem!important}.episode-card-v2 .actions{margin-top:.15rem}'+
      '#player-play-v2{letter-spacing:0!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif!important}'+
      '@media(max-width:700px){#series-v2:not(.hidden){grid-template-columns:minmax(0,1fr)!important;gap:10px!important}#series-v2 .series,#series-v2 .series[open]{grid-column:auto!important}#series-v2 .series>summary{padding:14px 0!important;display:flex!important;gap:10px!important}#series-v2 .series>summary strong{font-size:.92rem!important;line-height:1.25!important}#series-v2 .series-progress-summary-v2{font-size:.76rem!important;white-space:nowrap!important}#series-v2 .series>summary .deep-share{width:auto!important;min-width:38px!important;height:auto!important;min-height:38px!important}}';
    document.head.appendChild(style);
  }
  installCardPlayerPolishStyles();


  /* V2_LEGACY_VISUAL_PARITY_V1 */
  const legacyVisualApplyStaticUi=applyStaticUi;
  applyStaticUi=function(){
    legacyVisualApplyStaticUi();
    document.title=text('Vedátorský podcast – podle témat','Vedátorský podcast – podľa tém');
    const eyebrow=$('#eyebrow-v2'),heading=$('#heading-v2');
    if(eyebrow)eyebrow.textContent=text('Neoficiální tematický katalog','Neoficiálny tematický katalóg');
    if(heading)heading.textContent=text('Vedátorský podcast podle témat','Vedátorský podcast podľa tém');
  };

  episodeProgressHtml=function(){return''};

  function legacyVisualSyncCollapseButton(){
    const button=$('#player-close-v2');
    if(!button)return;
    button.textContent='↓';
    button.title=text('Sbalit přehrávač','Zbaliť prehrávač');
    button.setAttribute('aria-label',button.title);
  }

  function legacyVisualSetPlayerCollapsed(collapsed){
    const shell=$('#player-v2'),expand=$('#player-expand-v2');
    if(!shell)return;
    const next=Boolean(collapsed)&&!shell.classList.contains('hidden');
    shell.classList.toggle('player-collapsed-v2',next);
    document.body.classList.toggle('player-collapsed-v2',next);
    if(expand)expand.hidden=!next;
  }

  function installLegacyVisualParity(){
    if(document.querySelector('style[data-v2-legacy-visual-parity]'))return;
    const style=document.createElement('style');
    style.dataset.v2LegacyVisualParity='1';
    style.textContent=[
      '.tab-v2.active,.topic-v2.active,.question-topic.active{background:linear-gradient(180deg,#55449a,#3f307b)!important;color:#fff!important;border-color:#8f80ff!important;font-weight:800!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),0 3px 10px rgba(91,75,219,.22)!important}',
      'html[data-theme="dark"] .tab-v2.active,html[data-theme="dark"] .topic-v2.active,html[data-theme="dark"] .question-topic.active{background:linear-gradient(180deg,#51408f,#3a2c70)!important;color:#fff!important;border-color:#9788ff!important}',
      '.listen-status{display:none!important;width:max-content;max-width:100%;min-height:0!important;margin:.08rem 0 .55rem!important;padding:4px 10px!important;border-radius:999px!important;border:1px solid transparent!important;font-size:.78rem!important;font-weight:850!important;line-height:1.15!important}',
      '.listen-status.done,.listen-status.progress{display:inline-flex!important;align-items:center!important;align-self:flex-start!important;gap:4px!important}',
      '.listen-status.done{background:#dcfce7!important;color:#166534!important;border-color:#bbf7d0!important}',
      '.listen-status.progress{background:#ede9fe!important;color:#5145b5!important;border-color:#c4b5fd!important}',
      'html[data-theme="dark"] .listen-status.done{background:#dcfce7!important;color:#166534!important;border-color:#bbf7d0!important}',
      'html[data-theme="dark"] .listen-status.progress{background:#ede9fe!important;color:#5145b5!important;border-color:#c4b5fd!important}',
      '.tags{display:flex!important;flex-wrap:wrap!important;gap:7px!important;margin:12px 0!important}',
      '.tag{display:inline-flex!important;align-items:center!important;width:auto!important;padding:4px 9px!important;border-radius:999px!important;border:1px solid #c4b5fd!important;background:#ede9fe!important;color:#5145b5!important;font-size:.76rem!important;line-height:1.2!important}',
      'html[data-theme="dark"] .tag{background:#2b2649!important;color:#c4b5fd!important;border-color:#5f50bd!important}',
      '.series>summary>strong{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important;text-overflow:ellipsis!important;max-height:2.8em!important}',
      '#player-v2.player-collapsed-v2{display:none!important}',
      '#player-expand-v2{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:5200;width:48px;height:48px;border-radius:50%;border:1px solid var(--accent);background:var(--accent);color:#fff;box-shadow:var(--shadow-strong);font-size:1.35rem;font-weight:900;cursor:pointer;align-items:center;justify-content:center;padding:0}',
      '#player-expand-v2:not([hidden]){display:flex!important}',
      'body.player-collapsed-v2{padding-bottom:72px!important}',
      'body.player-collapsed-v2 .back-top-v2{bottom:76px!important}',
      '#player-close-v2{font-size:1.15rem!important;font-weight:900!important}',
      '@media(max-width:700px){#player-expand-v2{right:12px;bottom:12px;width:46px;height:46px}.series>summary>strong{max-height:2.8em!important}}'
    ].join('');
    document.head.appendChild(style);
    if(!$('#player-expand-v2')){
      const expand=document.createElement('button');
      expand.id='player-expand-v2';expand.type='button';expand.hidden=true;expand.textContent='↑';
      expand.title=text('Rozbalit přehrávač','Rozbaliť prehrávač');expand.setAttribute('aria-label',expand.title);
      document.body.appendChild(expand);
    }
    legacyVisualSyncCollapseButton();
  }

  const legacyVisualSyncPlayer=syncPlayer;
  syncPlayer=function(...args){
    const result=legacyVisualSyncPlayer(...args);
    legacyVisualSyncCollapseButton();
    const expand=$('#player-expand-v2'),shell=$('#player-v2');
    if(expand&&shell&&shell.classList.contains('hidden')){expand.hidden=true;document.body.classList.remove('player-collapsed-v2');shell.classList.remove('player-collapsed-v2')}
    return result;
  };

  const legacyVisualOpenPlayback=openPlayback;
  openPlayback=function(...args){
    legacyVisualSetPlayerCollapsed(false);
    return legacyVisualOpenPlayback(...args);
  };

  const legacyVisualClosePlayer=closePlayer;
  closePlayer=function(...args){
    legacyVisualSetPlayerCollapsed(false);
    return legacyVisualClosePlayer(...args);
  };

  document.addEventListener('click',event=>{
    const collapse=event.target.closest?.('#player-close-v2');
    if(collapse){event.preventDefault();event.stopImmediatePropagation();legacyVisualSetPlayerCollapsed(true);return}
    const expand=event.target.closest?.('#player-expand-v2');
    if(expand){event.preventDefault();event.stopImmediatePropagation();legacyVisualSetPlayerCollapsed(false)}
  },true);

  window.addEventListener('vedatorlanguagechange',()=>{
    legacyVisualSyncCollapseButton();
    const expand=$('#player-expand-v2');
    if(expand){expand.title=text('Rozbalit přehrávač','Rozbaliť prehrávač');expand.setAttribute('aria-label',expand.title)}
  });

  installLegacyVisualParity();


  /* V2_LAST_UX_FIXES_V1 */
  function lastUxFullDescription(episode){
    const lang=contentLang(),bundle=episode?.i18n?.[lang];
    return String(bundle?.fullDescription||episode?.fullDescription||episodeCopy(episode).description||'').trim();
  }
  function lastUxShortDescription(episode,terms){
    const copy=episodeCopy(episode),shortBase=cardPolishCutDescription(copy.description);
    return cardPolishCollapsedDescription(shortBase,terms);
  }
  cardEpisode=function(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number),terms=mobileEpisodeHighlightTerms(),open=cardPolishEpisodeOpen.has(Number(episode.number));
    const short=lastUxShortDescription(episode,terms),full=lastUxFullDescription(episode),shown=open?(full||short):short;
    const shownHtml=mobileHighlightHtml(shown,terms).replace(/\n/g,'<br>');
    return '<article class="card searchable episode-card-v2 '+(open?'episode-open-v2':'')+'" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+mobileHighlightHtml(copy.title,terms)+'</h2>'+              
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<p class="desc-v2">'+shownHtml+'</p>'+episodeTagHtml(episode)+
      '<div class="episode-summary-slot-v2">'+episodeSummaryHtml(episode)+'</div>'+ 
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+ 
      '<button type="button" class="secondary episode-more-v2" data-episode="'+(Number(episode.number)||0)+'" aria-expanded="'+String(open)+'">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>'+shareButton('episode',String(episode.number))+'</div></article>';
  };

  function lastUxSyncFloatingButtons(){
    const expand=$('#player-expand-v2'),back=$('#back-top-v2');
    if(expand){expand.textContent='♫ ↑';expand.title=text('Rozbalit přehrávač','Rozbaliť prehrávač');expand.setAttribute('aria-label',expand.title)}
    if(back){back.textContent='↑';back.title=text('Nahoru','Nahor');back.setAttribute('aria-label',back.title)}
  }
  const lastUxSyncPlayer=syncPlayer;
  syncPlayer=function(...args){const result=lastUxSyncPlayer(...args);lastUxSyncFloatingButtons();return result};
  window.addEventListener('vedatorlanguagechange',lastUxSyncFloatingButtons);

  function installLastUxStyles(){
    if(document.querySelector('style[data-v2-last-ux-fixes]'))return;
    const style=document.createElement('style');style.dataset.v2LastUxFixes='1';
    style.textContent=[
      '.series>summary>strong{display:block!important;flex:1 1 auto!important;min-width:0!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;-webkit-line-clamp:unset!important;-webkit-box-orient:initial!important;max-height:none!important}',
      '#player-expand-v2{width:auto!important;min-width:62px!important;padding:0 12px!important;border-radius:999px!important;font-size:1.08rem!important;letter-spacing:.03em!important}',
      '@media(max-width:700px){.status-row{font-size:1rem!important;margin:18px 2px 10px!important}.parity-sort-v2{font-size:1rem!important;min-height:46px!important;padding:10px 12px!important}.card h2{font-size:1.08rem!important}.meta{font-size:.85rem!important}#series-v2 .series>summary>strong{font-size:16px!important;line-height:1.3!important}.card p,.card li,.episode-description-v2{font-size:1rem!important;line-height:1.48!important}}'
    ].join('');
    document.head.appendChild(style);
  }
  installLastUxStyles();
  lastUxSyncFloatingButtons();


  /* V2_REAL_EPISODE_READMORE_V1 */
  function realReadMoreSanitizeHtml(value){
    const template=document.createElement('template');
    template.innerHTML=String(value||'');
    const allowed=new Set(['P','BR','A','UL','OL','LI','STRONG','B','EM','I','BLOCKQUOTE','H2','H3','H4']);
    [...template.content.querySelectorAll('*')].forEach(node=>{
      if(!allowed.has(node.tagName)){
        node.replaceWith(...node.childNodes);
        return;
      }
      const href=node.tagName==='A'?String(node.getAttribute('href')||'').trim():'';
      [...node.attributes].forEach(attr=>node.removeAttribute(attr.name));
      if(node.tagName==='A'){
        if(/^https?:\/\//i.test(href)){
          node.setAttribute('href',href);
          node.setAttribute('target','_blank');
          node.setAttribute('rel','noopener noreferrer');
        }else node.replaceWith(...node.childNodes);
      }
    });
    return template.innerHTML;
  }
  function realReadMoreRichHtml(episode){
    const lang=contentLang(),bundle=episode?.i18n?.[lang];
    return realReadMoreSanitizeHtml(bundle?.fullDescriptionHtml||episode?.fullDescriptionHtml||'');
  }
  cardEpisode=function(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number),terms=mobileEpisodeHighlightTerms(),open=cardPolishEpisodeOpen.has(Number(episode.number));
    const short=lastUxShortDescription(episode,terms),full=lastUxFullDescription(episode),rich=open?realReadMoreRichHtml(episode):'';
    const shownHtml=open?(rich||(mobileHighlightHtml(full||short,terms).replace(/\n/g,'<br>'))):mobileHighlightHtml(short,terms);
    return '<article class="card searchable episode-card-v2 '+(open?'episode-open-v2':'')+'" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+mobileHighlightHtml(copy.title,terms)+'</h2>'+              
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<div class="desc-v2 episode-description-v2">'+shownHtml+'</div>'+episodeTagHtml(episode)+
      '<div class="episode-summary-slot-v2">'+episodeSummaryHtml(episode)+'</div>'+ 
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+ 
      '<button type="button" class="secondary episode-more-v2" data-episode="'+(Number(episode.number)||0)+'" aria-expanded="'+String(open)+'">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>'+shareButton('episode',String(episode.number))+'</div></article>';
  };

  (function installRealReadMoreStyles(){
    if(document.querySelector('style[data-v2-real-readmore]'))return;
    const style=document.createElement('style');style.dataset.v2RealReadmore='1';
    style.textContent='.episode-card-v2.episode-open-v2 .desc-v2{display:block!important;-webkit-line-clamp:unset!important;-webkit-box-orient:initial!important;overflow:visible!important;max-height:none!important}.episode-card-v2.episode-open-v2 .episode-description-v2 p{margin:.8em 0}.episode-card-v2.episode-open-v2 .episode-description-v2 p:first-child{margin-top:0}.episode-card-v2.episode-open-v2 .episode-description-v2 a{color:var(--accent);text-decoration:underline;overflow-wrap:anywhere}.episode-card-v2.episode-open-v2 .episode-description-v2 ul,.episode-card-v2.episode-open-v2 .episode-description-v2 ol{padding-left:1.35em}';
    document.head.appendChild(style);
  })();

})();