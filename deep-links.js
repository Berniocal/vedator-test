(()=>{
  if(window.__vedatorDeepLinks)return;
  window.__vedatorDeepLinks=true;

  const HASH_TYPES=new Set(['episode','question','series']);
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const hashText=value=>{
    let hash=2166136261;
    for(const char of String(value||'')){
      hash^=char.charCodeAt(0);
      hash=Math.imul(hash,16777619);
    }
    return (hash>>>0).toString(36);
  };
  const seconds=value=>{
    const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
    if(!parts)return -1;
    return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
  };
  const episodeList=()=>{try{return Array.isArray(episodes)?episodes:[]}catch(_){return[]}};
  const episodeKey=episode=>`${Number(episode?.number)||0}-${hashText(episode?.id||episode?.link||episode?.enclosure||episode?.title||'')}`;
  const seriesKey=group=>{
    const signature=(group?.items||[]).map(episodeKey).sort().join('|');
    return `${hashText(signature)}.${normalize(group?.name||'serie')}`;
  };
  const isSlovak=()=>{
    try{return String(window.vedatorUiLanguage?.()||'').toLowerCase().startsWith('sk')}catch(_){return document.documentElement.lang.toLowerCase().startsWith('sk')}
  };
  const labels=()=>isSlovak()?{
    share:'Zdieľať odkaz',copied:'Odkaz bol skopírovaný.',copy:'Skopírujte odkaz:',episode:'Epizóda',question:'Otázka',series:'Séria'
  }:{
    share:'Sdílet odkaz',copied:'Odkaz byl zkopírován.',copy:'Zkopírujte odkaz:',episode:'Epizoda',question:'Otázka',series:'Série'
  };

  const style=document.createElement('style');
  style.textContent=`
    .vedator-deep-share{flex:0 0 42px!important;width:42px;min-width:42px;border:1px solid var(--line);border-radius:10px;background:transparent;color:var(--ink);font:inherit;font-weight:800;cursor:pointer;padding:9px 7px;line-height:1}
    .vedator-deep-share:hover{border-color:var(--accent);color:var(--accent)}
    .series-card>summary .vedator-deep-share{flex:0 0 36px!important;width:36px;min-width:36px;padding:7px 5px;margin-left:2px}
    .vedator-deep-link-target{outline:3px solid var(--accent)!important;outline-offset:4px;animation:vedatorDeepLinkPulse 1.25s ease-in-out 2}
    @keyframes vedatorDeepLinkPulse{0%,100%{box-shadow:0 0 0 0 rgba(91,75,219,0)}50%{box-shadow:0 0 0 9px rgba(91,75,219,.2)}}
  `;
  document.head.appendChild(style);

  function episodeForArticle(article){
    const title=article?.querySelector('h2')?.textContent?.trim();
    if(!title)return null;
    const list=episodeList();
    const exact=list.find(item=>String(item.title||'').trim()===title);
    if(exact)return exact;
    const number=Number(title.match(/\bpodcast\s+(\d+)\b/i)?.[1]);
    const candidates=list.filter(item=>Number(item.number)===number);
    return candidates.length===1?candidates[0]:candidates.find(item=>normalize(item.title)===normalize(title))||candidates[0]||null;
  }

  function questionInfo(card){
    const meta=card?.querySelector('.faq-meta')?.textContent||'';
    const episode=Number(meta.match(/(?:Díl|Diel)\s+(\d+)/i)?.[1]);
    const time=seconds(meta.split('•').pop());
    if(!episode||time<0)return null;
    const item=episodeList().find(entry=>Number(entry.number)===episode);
    return item?{episode:item,time,title:card.querySelector('h2')?.textContent?.trim()||''}:null;
  }

  function currentSeriesGroups(){
    try{return typeof seriesGroups==='function'?seriesGroups():[]}catch(_){return[]}
  }

  function setButtonLabel(button){
    const text=labels().share;
    button.title=text;
    button.setAttribute('aria-label',text);
  }

  function enhanceEpisodes(){
    document.querySelectorAll('#episodes article .links').forEach(links=>{
      const article=links.closest('article');
      if(!article||article.classList.contains('faq-question-card'))return;
      let button=links.querySelector('.vedator-deep-share[data-kind="episode"]');
      if(!button){
        button=document.createElement('button');
        button.type='button';button.className='vedator-deep-share';button.dataset.kind='episode';button.textContent='🔗';
        links.appendChild(button);
      }
      const episode=episodeForArticle(article);
      if(episode){button.dataset.value=episodeKey(episode);button.dataset.shareTitle=episode.title||''}
      setButtonLabel(button);
    });
  }

  function enhanceQuestions(){
    document.querySelectorAll('#questions .faq-question-card .links').forEach(links=>{
      const card=links.closest('.faq-question-card');
      let button=links.querySelector('.vedator-deep-share[data-kind="question"]');
      if(!button){
        button=document.createElement('button');
        button.type='button';button.className='vedator-deep-share';button.dataset.kind='question';button.textContent='🔗';
        links.appendChild(button);
      }
      const info=questionInfo(card);
      if(info){button.dataset.value=`${episodeKey(info.episode)}@${info.time}`;button.dataset.shareTitle=info.title}
      setButtonLabel(button);
    });
  }

  function enhanceSeries(){
    const groups=currentSeriesGroups();
    document.querySelectorAll('#series .series-card').forEach((card,index)=>{
      const summary=card.querySelector(':scope>summary');
      if(!summary)return;
      let button=summary.querySelector('.vedator-deep-share[data-kind="series"]');
      if(!button){
        button=document.createElement('button');
        button.type='button';button.className='vedator-deep-share';button.dataset.kind='series';button.textContent='🔗';
        summary.appendChild(button);
      }
      const group=groups[index];
      const name=summary.querySelector('span:first-child')?.textContent?.trim()||group?.name||'';
      if(group){button.dataset.value=seriesKey(group);button.dataset.shareTitle=name}
      setButtonLabel(button);
    });
  }

  let enhanceTimer=0;
  function enhance(){
    enhanceTimer=0;
    enhanceEpisodes();enhanceQuestions();enhanceSeries();
  }
  function scheduleEnhance(){
    if(enhanceTimer)return;
    enhanceTimer=requestAnimationFrame(enhance);
  }
  new MutationObserver(records=>{
    if(records.some(record=>record.addedNodes.length||record.removedNodes.length))scheduleEnhance();
  }).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',scheduleEnhance);
  window.addEventListener('vedatorepisodetranslationsready',scheduleEnhance);
  scheduleEnhance();

  async function share(kind,value,title){
    if(!HASH_TYPES.has(kind)||!value)return;
    const strings=labels();
    const url=new URL(location.href);
    url.hash=`${kind}=${encodeURIComponent(value)}`;
    try{
      if(navigator.share){
        await navigator.share({url:url.href});
        return;
      }
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(url.href);
        alert(strings.copied);
        return;
      }
    }catch(error){
      if(error?.name==='AbortError')return;
    }
    prompt(strings.copy,url.href);
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('.vedator-deep-share');
    if(!button)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    share(button.dataset.kind,button.dataset.value,button.dataset.shareTitle);
  },true);

  const wait=(test,timeout=12000)=>new Promise(resolve=>{
    const start=Date.now();
    const check=()=>{
      let result=null;
      try{result=test()}catch(_){}
      if(result){resolve(result);return}
      if(Date.now()-start>=timeout){resolve(null);return}
      setTimeout(check,80);
    };
    check();
  });

  function clickTab(view){
    const tab=document.querySelector(`.tabs .tab[data-view="${view}"]`);
    if(tab&&!tab.classList.contains('active'))tab.click();
    return tab;
  }

  function selectAllTopic(){
    const topics=document.querySelector('#topics');
    const first=topics?.querySelector('.topic');
    if(first&&!first.classList.contains('active'))first.click();
  }

  function setSearch(value){
    const input=document.querySelector('#search');
    if(!input)return;
    input.value=String(value||'');
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function markTarget(element){
    document.querySelectorAll('.vedator-deep-link-target').forEach(node=>node.classList.remove('vedator-deep-link-target'));
    element.classList.add('vedator-deep-link-target');
    element.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>element.classList.remove('vedator-deep-link-target'),3600);
  }

  function episodeFromKey(key){
    const exact=episodeList().find(item=>episodeKey(item)===key);
    if(exact)return exact;
    const number=Number(String(key).split('-')[0]);
    return episodeList().find(item=>Number(item.number)===number)||null;
  }

  async function openEpisode(key){
    const episode=await wait(()=>episodeFromKey(key));
    if(!episode)return false;
    await wait(()=>clickTab('episodes'));
    selectAllTopic();setSearch(episode.number);
    const article=await wait(()=>[...document.querySelectorAll('#episodes article')].find(node=>{
      const item=episodeForArticle(node);
      return item&&episodeKey(item)===episodeKey(episode);
    }));
    if(!article)return false;
    markTarget(article);return true;
  }

  async function openQuestion(value){
    const match=String(value).match(/^(.+)@(\d+)$/);
    if(!match)return false;
    const episode=await wait(()=>episodeFromKey(match[1]));
    if(!episode)return false;
    const targetTime=Number(match[2]);
    await wait(()=>clickTab('questions'));
    setSearch(episode.number);
    for(let attempt=0;attempt<45;attempt++){
      const card=[...document.querySelectorAll('#questions .faq-question-card')].find(node=>{
        const info=questionInfo(node);
        return info&&Number(info.episode.number)===Number(episode.number)&&info.time===targetTime;
      });
      if(card){markTarget(card);return true}
      const sentinel=document.querySelector('#questions .faq-sentinel');
      if(sentinel)sentinel.scrollIntoView({block:'center'});
      await new Promise(resolve=>setTimeout(resolve,180));
    }
    return false;
  }

  async function openSeries(key){
    await wait(()=>clickTab('series'));
    const card=await wait(()=>{
      const groups=currentSeriesGroups();
      const targetHash=String(key).split('.')[0];
      const index=groups.findIndex(group=>seriesKey(group).split('.')[0]===targetHash);
      if(index<0)return null;
      return document.querySelectorAll('#series .series-card')[index]||null;
    });
    if(!card)return false;
    card.open=true;
    card.dispatchEvent(new Event('toggle'));
    markTarget(card);return true;
  }

  let processingHash='';
  async function processHash(){
    const raw=location.hash.replace(/^#/,'');
    if(!raw||raw===processingHash)return;
    const params=new URLSearchParams(raw);
    const entry=[...params.entries()].find(([key])=>HASH_TYPES.has(key));
    if(!entry)return;
    processingHash=raw;
    const [kind,value]=entry;
    if(kind==='episode')await openEpisode(value);
    else if(kind==='question')await openQuestion(value);
    else if(kind==='series')await openSeries(value);
  }

  window.addEventListener('hashchange',processHash);
  setTimeout(processHash,500);
})();
