(()=>{
  if(window.__vedatorNonQuestionsView)return;
  window.__vedatorNonQuestionsView=true;

  const DATA_VERSION='20260808-v1';
  const CACHE_KEY=`vedatorNonQuestionsData:${DATA_VERSION}`;
  const BATCH=20;
  const MAP={
    'Vše':[],
    'Vesmír':['vesmir','hvezd','hviezd','planet','galaxi','slunce','slnko','mesic','mesiac','jupiter','kosmolog','rozpin'],
    'Černé díry':['cerna dira','cierna diera','hawking','singularit'],
    'Kvantová fyzika':['kvant','superpoz','spleten','previazan','orbital','wimp','vakuu','vakua'],
    'Relativita a gravitace':['relativ','gravit','casoprostor','casopriestor','rychlost svetla'],
    'Matematika':['matemat','prvocisl','nekonec','paradox','entrop','laplace','tri teles'],
    'Biologie a medicína':['vitamin','gen','gmo','mozek','mozog','spánek','spanek','zrcadlov','cvičit','cvicit'],
    'Technologie':['pocitac','počítač','mikrovln','gps','bater','vodik','vodík','auto','klavesnic','klávesnic','tiktok','kryptom','teleskop','webb'],
    'Země a příroda':['zeme','země','ocean','ledovec','sopk','tornado','počas','pocasi','vzduch','mrak','atmosfer'],
    'Chemie':['atom','molekul','prvek','prvok','helium','deuter','voda','jogurt','zlato','metan','oxid uhlicity','oxid uhličitý'],
    'Ostatní':['podcast','jazyk','wikipedia','anime','videohry','recept','motiv','právo','pravo','plochozem']
  };

  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const sec=value=>{
    const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
    if(!parts)return 0;
    return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
  };
  const language=()=>{
    try{
      const value=String(window.vedatorUiLanguage?.()||'').toLowerCase();
      if(value.startsWith('sk'))return 'sk';
      if(value==='cz'||value.startsWith('cs'))return 'cs';
    }catch{}
    return String(document.documentElement.lang||'cs').toLowerCase().startsWith('sk')?'sk':'cs';
  };

  let installed=false;
  let active=false;
  let topic='Vše';
  let data=null;
  let all=[];
  let shown=[];
  let rendered=0;
  let loadingPromise=null;
  let io=null;
  let tab=null;
  let view=null;
  let ntopics=null;
  let sort=null;
  let search=null;
  let count=null;
  let episodesBox=null;
  let seriesBox=null;

  function readCache(){
    try{
      const saved=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      if(saved?.version!==DATA_VERSION||!saved?.episodes||typeof saved.episodes!=='object')return null;
      return saved;
    }catch{return null}
  }

  function saveCache(payload){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(payload))}catch{}
  }

  function acceptPayload(payload){
    if(payload?.version!==DATA_VERSION||!payload?.episodes||typeof payload.episodes!=='object')return false;
    data=payload;
    saveCache(payload);
    rebuildAll();
    return true;
  }

  function loadData(){
    if(data)return Promise.resolve(data);
    const cached=readCache();
    if(cached){
      data=cached;
      rebuildAll();
      return Promise.resolve(data);
    }
    if(loadingPromise)return loadingPromise;
    loadingPromise=new Promise(resolve=>{
      let settled=false;
      const finish=()=>{
        if(settled)return;
        settled=true;
        window.removeEventListener('vedatornonquestionsdataready',onReady);
        const payload=window.__vedatorNonQuestionsDataPayload;
        resolve(acceptPayload(payload)?data:null);
      };
      const fail=()=>{
        if(settled)return;
        settled=true;
        window.removeEventListener('vedatornonquestionsdataready',onReady);
        resolve(null);
      };
      const onReady=()=>finish();
      window.addEventListener('vedatornonquestionsdataready',onReady,{once:true});
      const existing=document.querySelector(`script[data-vedator-nonquestions-data="${DATA_VERSION}"]`);
      if(existing){
        if(window.__vedatorNonQuestionsDataPayload)finish();
        else{
          existing.addEventListener('load',finish,{once:true});
          existing.addEventListener('error',fail,{once:true});
        }
        return;
      }
      const script=document.createElement('script');
      script.src=`./nonquestions-data.js?v=${encodeURIComponent(DATA_VERSION)}`;
      script.async=true;
      script.dataset.vedatorNonquestionsData=DATA_VERSION;
      script.addEventListener('load',()=>{if(!data)finish()},{once:true});
      script.addEventListener('error',fail,{once:true});
      document.head.appendChild(script);
    }).finally(()=>{loadingPromise=null});
    return loadingPromise;
  }

  function rebuildAll(){
    all=[];
    if(!data?.episodes)return;
    const lang=language();
    for(const [episodeValue,translations] of Object.entries(data.episodes)){
      const episode=Number(episodeValue);
      const items=translations?.[lang]||translations?.cs||translations?.sk||[];
      items.forEach((item,order)=>{
        all.push({
          episode,
          order,
          time:String(item?.time||'0:00'),
          title:String(item?.title||`Neotázka ${order+1}`),
          points:Array.isArray(item?.points)?item.points.map(point=>String(point||'').trim()).filter(Boolean):[]
        });
      });
    }
  }

  const terms=()=>norm(search?.value?.trim()).split(/\s+/).filter(Boolean);
  const titleText=item=>norm(item.title);
  const answerText=item=>norm(item.points.join(' '));
  const text=item=>`${titleText(item)} ${answerText(item)}`;
  const highlightTerms=()=>[...new Set([...terms(),...(topic==='Vše'?[]:(MAP[topic]||[]).map(norm))])].sort((a,b)=>b.length-a.length);

  function matchLevel(item){
    const values=terms();
    if(!values.length)return 0;
    const title=titleText(item),answer=answerText(item),episode=String(item.episode);
    if(values.every(value=>title.includes(value)||episode.includes(value)))return 0;
    if(values.some(value=>title.includes(value)||episode.includes(value)))return 1;
    if(values.every(value=>answer.includes(value)))return 2;
    if(values.every(value=>`${title} ${answer}`.includes(value)||episode.includes(value)))return 3;
    return 99;
  }

  function matches(item){
    const content=text(item);
    return (topic==='Vše'||(MAP[topic]||[]).some(value=>content.includes(norm(value))))&&matchLevel(item)<99;
  }

  function computeShown(){
    const mode=sort?.value||'new';
    return all
      .filter(matches)
      .map(item=>({...item,match:matchLevel(item)}))
      .sort((a,b)=>a.match-b.match||(mode==='old'?a.episode-b.episode:b.episode-a.episode)||a.order-b.order);
  }

  function hi(value){
    const raw=String(value),values=highlightTerms();
    if(!values.length)return esc(raw);
    const normalized=norm(raw),ranges=[];
    for(const value of values){
      if(!value)continue;
      let at=0;
      while((at=normalized.indexOf(value,at))>=0){
        ranges.push([at,at+value.length]);
        at+=Math.max(1,value.length);
      }
    }
    ranges.sort((a,b)=>a[0]-b[0]||b[1]-a[1]);
    const merged=[];
    for(const range of ranges){
      const last=merged.at(-1);
      if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);
      else merged.push([...range]);
    }
    let output='',position=0;
    for(const [start,end] of merged){
      output+=esc(raw.slice(position,start))+`<mark>${esc(raw.slice(start,end))}</mark>`;
      position=end;
    }
    return output+esc(raw.slice(position));
  }

  function categoryHtml(item){
    return Object.entries(MAP)
      .filter(([name,values])=>name!=='Vše'&&values.some(value=>text(item).includes(norm(value))))
      .slice(0,3)
      .map(([name])=>`<span class="tag">${esc(name)}</span>`)
      .join('');
  }

  function card(item,index){
    return `<article class="faq-question-card nonquestion-card" data-i="${index}">
      <div class="date faq-meta">Díl ${item.episode} • ${esc(item.time)}</div>
      <h2>${hi(item.title)}</h2>
      <div class="desc faq-answer"><ul>${item.points.map(point=>`<li>${hi(point)}</li>`).join('')}</ul></div>
      <div class="tags">${categoryHtml(item)}</div>
      <div class="links"><button class="faq-play" type="button">Přehrát</button><button class="faq-more" type="button">Číst více</button></div>
    </article>`;
  }

  function countLabel(number,filtered=false){
    const sk=language()==='sk';
    if(!filtered){
      if(number===1)return `${number} neotázka`;
      if(number>=2&&number<=4)return `${number} neotázky`;
      return `${number} ${sk?'neotázok':'neotázek'}`;
    }
    if(number===1)return sk?'1 nájdená neotázka':'1 nalezená neotázka';
    if(number>=2&&number<=4)return sk?`${number} nájdené neotázky`:`${number} nalezené neotázky`;
    return sk?`${number} nájdených neotázok`:`${number} nalezených neotázek`;
  }

  function updateCount(){
    if(!active||!count)return;
    const filtered=terms().length>0||topic!=='Vše';
    count.textContent=countLabel(filtered?shown.length:all.length,filtered);
  }

  function checkMore(){
    requestAnimationFrame(()=>{
      view?.querySelectorAll('.nonquestion-card').forEach(cardNode=>{
        const answer=cardNode.querySelector('.faq-answer'),button=cardNode.querySelector('.faq-more');
        if(!answer||!button)return;
        button.classList.toggle('hidden',answer.scrollHeight<=answer.clientHeight+2);
      });
      window.dispatchEvent(new Event('vedatorcontentchange'));
    });
  }

  function observeSentinel(){
    io?.disconnect();
    const sentinel=view?.querySelector('.nonquestion-sentinel');
    if(!active||!sentinel||rendered>=shown.length)return;
    io=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting))appendBatch();
    },{rootMargin:'500px 0px'});
    io.observe(sentinel);
  }

  function appendBatch(){
    if(!view)return;
    view.querySelector('.nonquestion-sentinel')?.remove();
    const end=Math.min(rendered+BATCH,shown.length);
    if(end>rendered)view.insertAdjacentHTML('beforeend',shown.slice(rendered,end).map((item,index)=>card(item,rendered+index)).join(''));
    rendered=end;
    if(rendered<shown.length)view.insertAdjacentHTML('beforeend','<div class="nonquestion-sentinel" aria-hidden="true"></div>');
    checkMore();
    observeSentinel();
  }

  function filter(){
    if(!view)return;
    shown=computeShown();
    rendered=0;
    view.innerHTML='';
    updateCount();
    if(!shown.length){
      view.innerHTML=`<div class="status">${language()==='sk'?'Nič som nenašiel.':'Nic jsem nenašel.'}</div>`;
      return;
    }
    appendBatch();
  }

  function episodeFor(number){
    try{
      if(Array.isArray(episodes)){
        const found=episodes.find(item=>Number(item.number)===Number(number));
        if(found)return found;
      }
    }catch{}
    try{
      const saved=JSON.parse(localStorage.getItem('vedatorEpisodes')||'[]');
      return Array.isArray(saved)?saved.find(item=>Number(item.number)===Number(number))||null:null;
    }catch{return null}
  }

  function play(index){
    const item=shown[index];
    const episode=episodeFor(item?.episode);
    if(!item||!episode?.enclosure)return;
    window.__vedatorQuestionContext=null;
    window.__vedatorRequestedStart={episode:item.episode,time:sec(item.time),createdAt:Date.now()};
    const proxy=document.createElement('article');
    proxy.hidden=true;
    const heading=document.createElement('h2');
    heading.textContent=episode.title||`Podcast ${item.episode}`;
    const links=document.createElement('div');
    links.className='links';
    const button=document.createElement('a');
    button.className='primary';
    button.href=episode.enclosure;
    button.dataset.vedatorEpisodeTitle=heading.textContent;
    button.textContent='Přehrát';
    links.appendChild(button);
    proxy.append(heading,links);
    document.body.appendChild(proxy);
    button.click();
    proxy.remove();
  }

  function deactivateQuestions(){
    const episodesTab=document.querySelector('.tabs .tab[data-view="episodes"]');
    if(!episodesTab)return;
    const original=episodesTab.onclick;
    try{
      episodesTab.onclick=null;
      episodesTab.dispatchEvent(new MouseEvent('click',{bubbles:false,cancelable:false}));
    }finally{episodesTab.onclick=original}
  }

  function hideOtherViews(){
    episodesBox?.classList.add('hidden');
    seriesBox?.classList.add('hidden');
    document.querySelector('#questions')?.classList.add('hidden');
    document.querySelector('.vedator-playlist-view')?.classList.remove('active');
    document.querySelector('.vedator-data-view')?.classList.remove('active');
    document.querySelectorAll('.topics').forEach(node=>node.classList.add('hidden'));
    document.querySelector('#episodeSort')?.classList.add('hidden');
    document.querySelector('#seriesSort')?.classList.add('hidden');
    document.querySelector('#questionSort')?.classList.add('hidden');
  }

  async function show(){
    if(!installed)return;
    deactivateQuestions();
    active=true;
    window.__vedatorActiveView='nonquestions';
    document.querySelectorAll('.tabs .tab').forEach(node=>node.classList.toggle('active',node===tab));
    hideOtherViews();
    view.classList.remove('hidden');
    ntopics.classList.remove('hidden');
    sort.classList.remove('hidden');
    count.textContent=language()==='sk'?'Načítavam neotázky…':'Načítám neotázky…';
    const loaded=await loadData();
    if(!active)return;
    if(!loaded){
      count.textContent=language()==='sk'?'Neotázky sa nepodarilo načítať.':'Neotázky se nepodařilo načíst.';
      view.innerHTML=`<div class="status">${language()==='sk'?'Dáta neotázok nie sú dostupné.':'Data neotázek nejsou dostupná.'}</div>`;
      return;
    }
    rebuildAll();
    filter();
  }

  function hide(){
    if(!installed)return;
    active=false;
    io?.disconnect();
    view?.classList.add('hidden');
    ntopics?.classList.add('hidden');
    sort?.classList.add('hidden');
  }

  function install(){
    if(installed)return true;
    const tabs=document.querySelector('.tabs');
    const questionsTab=tabs?.querySelector('.tab[data-view="questions"]');
    const playlistsTab=tabs?.querySelector('.tab[data-view="playlists"]');
    episodesBox=document.querySelector('#episodes');
    seriesBox=document.querySelector('#series');
    search=document.querySelector('#search');
    count=document.querySelector('#count');
    if(!tabs||!questionsTab||!playlistsTab||!episodesBox||!seriesBox||!search||!count)return false;

    tab=document.createElement('button');
    tab.type='button';
    tab.className='tab';
    tab.dataset.view='nonquestions';
    tab.textContent='Neotázky';
    playlistsTab.before(tab);

    ntopics=document.createElement('div');
    ntopics.className='topics hidden nonquestions-topics';
    ntopics.innerHTML=Object.keys(MAP).map((name,index)=>`<button class="topic${index?'':' active'}" data-topic="${esc(name)}">${esc(name)}</button>`).join('');
    document.querySelector('#topics')?.after(ntopics);

    view=document.createElement('section');
    view.id='nonquestions';
    view.className='grid hidden';
    const questionsView=document.querySelector('#questions');
    (questionsView||seriesBox).after(view);

    sort=document.createElement('select');
    sort.id='nonquestionSort';
    sort.className='sort hidden';
    sort.innerHTML='<option value="new">Nejnovější</option><option value="old">Nejstarší</option>';
    (document.querySelector('#questionSort')||document.querySelector('#seriesSort')||document.querySelector('#episodeSort'))?.after(sort);

    const style=document.createElement('style');
    style.textContent='#nonquestions .nonquestion-card{min-height:260px}#nonquestions .faq-meta{color:var(--muted);font-size:.85rem}#nonquestions .faq-answer{line-height:1.48}#nonquestions .faq-question-card.open .faq-answer{display:block;-webkit-line-clamp:unset}#nonquestions .faq-answer ul{margin:0;padding-left:1.2rem}#nonquestions .faq-answer li{margin:.22rem 0}#nonquestions .links button{flex:1;text-align:center;border-radius:10px;padding:9px;font:inherit;font-weight:700;cursor:pointer;min-width:0}#nonquestions .faq-play{border:0;background:var(--accent);color:#fff}#nonquestions .faq-more{border:1px solid var(--line);background:#fff;color:var(--ink)}#nonquestions .faq-more.hidden{display:none}#nonquestions mark{background:#ffe56b;color:#171717;border-radius:3px;padding:0 .08em}.nonquestion-sentinel{grid-column:1/-1;min-height:1px}html.theme-dark #nonquestions .faq-more{background:transparent;color:var(--ink)}';
    document.head.appendChild(style);

    tab.addEventListener('click',event=>{event.preventDefault();void show()});
    document.addEventListener('click',event=>{
      const other=event.target.closest?.('.tabs .tab');
      if(other&&other!==tab)hide();
    });

    search.addEventListener('input',event=>{
      if(!active)return;
      event.stopImmediatePropagation();
      if(data)filter();
    },true);
    sort.addEventListener('change',()=>{if(active&&data)filter()});
    ntopics.addEventListener('click',event=>{
      const button=event.target.closest('.topic');
      if(!button)return;
      topic=button.dataset.topic||'Vše';
      ntopics.querySelectorAll('.topic').forEach(node=>node.classList.toggle('active',node===button));
      if(active&&data)filter();
    });
    view.addEventListener('click',event=>{
      const cardNode=event.target.closest('.nonquestion-card');
      if(!cardNode)return;
      if(event.target.closest('.faq-more')){
        cardNode.classList.toggle('open');
        event.target.textContent=cardNode.classList.contains('open')?'Číst méně':'Číst více';
        window.dispatchEvent(new Event('vedatorcontentchange'));
      }else if(event.target.closest('.faq-play'))play(Number(cardNode.dataset.i));
    });

    window.addEventListener('vedatorlanguagechange',()=>{
      if(data)rebuildAll();
      if(active&&data)filter();
    });

    installed=true;
    return true;
  }

  if(!install()){
    const tabs=document.querySelector('.tabs');
    if(tabs){
      const observer=new MutationObserver(()=>{
        if(!install())return;
        observer.disconnect();
      });
      observer.observe(tabs,{childList:true,subtree:true});
    }
  }
})();
