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
    if(!n.download.dataset.busy)n.download.textContent=text('⇩ MP3','⇩ MP3');n.download.removeAttribute('href');n.download.setAttribute('role','button');
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
    try{await caches.delete(OFFLINE_CACHE)}catch{}state.language='sk';applyTheme(systemPreferredTheme(),false);loadUserData();rerenderLanguage();$('#status-v2').textContent=text('Veškerá data aplikace byla smazána.','Všetky dáta aplikácie boli zmazané.');
  }

  function bind(){
    $$('.tab-v2').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $$('.language-v2 button[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
    $('#search-v2').addEventListener('input',event=>{state.query=event.target.value;filterActive()});
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
    if(state.view==='episodes'){renderEpisodes();return}
    if(state.view==='questions'){renderQuestions();const filtered=Boolean(state.query.trim())||questionUi.qTopic!=='all',count=Number(active.dataset.visible)||0;$('#count-v2').textContent=questionCountLabel('questions',filtered?count:state.data.questions.length,filtered);return}
    if(state.view==='nonquestions'){renderNonQuestions();const filtered=Boolean(state.query.trim())||questionUi.nTopic!=='all',count=Number(active.dataset.visible)||0,total=Number(active.dataset.count)||0;$('#count-v2').textContent=questionCountLabel('nonquestions',filtered?count:total,filtered);return}
    if(state.view==='series'){renderSeries();return}
    const query=norm(state.query.trim()),cards=[...active.querySelectorAll('.searchable')];let shown=0;cards.forEach(card=>{const ok=!query||String(card.dataset.search||'').includes(query);card.classList.toggle('filtered-out',!ok);if(ok)shown++});
    if(state.view==='playlists')$('#count-v2').textContent=query?shown+' '+text('nalezených playlistů','nájdených playlistov'):state.playlists.length+' '+text('playlistů','playlistov');else $('#count-v2').textContent=text('Lokální data','Lokálne dáta');
  }
  function setView(view){
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
    const episodes=sortedParityEpisodes().slice().sort((a,b)=>(Number(a.number)||0)-(Number(b.number)||0));
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

  async function start(){
    const status=$('#status-v2');
    try{
      const response=await fetch('./content-v2.json',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);state.data=await response.json();
      buildLegacyQuestionIndex();loadUserData();installEpisodeExperienceStyles();installUiExperience();installFullParityUi();installPlaylistParity();applyStaticUi();renderEpisodes();renderSeries();renderQuestions();renderNonQuestions();renderPlaylists();renderData();bind();setView('episodes');
      status.textContent=`${text('V2 načtena','V2 načítaná')}: ${state.data.episodes.length} ${text('epizod','epizód')}, ${state.data.questions.length} ${text('otázek','otázok')}.`;
      document.documentElement.dataset.vedatorV2Ready='1';window.dispatchEvent(new CustomEvent('vedator-v2-ready',{detail:{episodes:state.data.episodes.length,questions:state.data.questions.length,playlists:state.playlists.length,language:state.language}}));setTimeout(importSharedPlaylist,0);
    }catch(error){status.textContent=`${text('V2 se nepodařilo načíst','V2 sa nepodarilo načítať')}: ${error.message}`;status.classList.add('error');console.error(error)}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();