import fs from 'node:fs';

const FILE='app-v2.js';
let source=fs.readFileSync(FILE,'utf8');
const MARKER='/* V2_FULL_PARITY_V1 */';
if(source.includes(MARKER)){
  console.log('V2 full parity layer already present.');
  process.exit(0);
}

const block=String.raw`
  ${MARKER}
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
  const parityUi={episodeTopic:'all',episodeSort:parityPrefs.episode||'new',seriesSort:parityPrefs.series||'count',observers:new Map(),generation:0,mediaTick:0,installed:false};

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
    return result.length?result:['society'];
  }
  function episodeTagHtml(episode){return '<div class="tags parity-tags">'+episodeCategoryKeys(episode).map(key=>'<span class="tag">'+parityTopicLabel(EPISODE_TOPICS[key])+'</span>').join('')+'</div>'}
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
    disconnectParityObserver(view);const generation=++parityUi.generation;container.replaceChildren();
    if(!items.length){container.innerHTML='<div class="empty parity-empty">'+text('Nic jsem nenašel.','Nič som nenašiel.')+'</div>';return}
    let rendered=0;const deepIndex=parityDeepIndex(view,items),firstCount=Math.max(PARITY_BATCH,deepIndex>=0?deepIndex+1:0);
    const sentinel=document.createElement('button');sentinel.type='button';sentinel.className='parity-sentinel';
    const append=(amount=PARITY_BATCH)=>{
      if(generation!==parityUi.generation)return;const end=Math.min(rendered+(rendered===0?firstCount:amount),items.length);
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
`;

const startToken='\n  async function start(){';
if(!source.includes(startToken))throw new Error('start() marker not found');
source=source.replace(startToken,'\n'+block+startToken);
const oldCall='buildLegacyQuestionIndex();loadUserData();installEpisodeExperienceStyles();installUiExperience();applyStaticUi();';
const newCall='buildLegacyQuestionIndex();loadUserData();installEpisodeExperienceStyles();installUiExperience();installFullParityUi();applyStaticUi();';
if(!source.includes(oldCall))throw new Error('start install chain not found');
source=source.replace(oldCall,newCall);
fs.writeFileSync(FILE,source);
console.log('Injected full legacy parity layer into app-v2.js');
