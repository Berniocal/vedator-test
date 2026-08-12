(()=>{
  if(window.__vedatorQuestionCacheBoost)return;
  window.__vedatorQuestionCacheBoost=true;

  const FAQ=[340,337,332,326,319,313,300,295,289,284,278,272,270,263,257,248,244,226,218,211,203,190,179,170,158,143,138,133,128,119,112,100,89,82,75,69,60,51,35,26,17];
  const CACHE_VERSION='q719-20260804-v1';
  const CACHE_PREFIX=`vedatorQuestionEpisodeCache:${CACHE_VERSION}:`;
  const OLD_PREFIX='vedatorQuestionEpisodeCache:';
  const PREROLL=5;
  const CONCURRENCY=6;
  const watchedArticles=new WeakSet();
  const inflight=new Map();
  let warmGeneration=0;
  let warmScheduled=false;
  let episodesObserver=null;

  function language(){
    try{
      const value=String(window.vedatorUiLanguage?.()||'').toLowerCase();
      if(value==='sk'||value.startsWith('sk'))return'sk';
      if(value==='cz'||value==='cs'||value.startsWith('cs'))return'cz';
    }catch{}
    try{
      const stored=String(localStorage.getItem('vedator-ui-language-v1')||localStorage.getItem('vedator-ui-language')||'').toLowerCase();
      if(stored.startsWith('sk'))return'sk';
      if(stored.startsWith('cz')||stored.startsWith('cs'))return'cz';
    }catch{}
    return String(document.documentElement.lang||'cs').toLowerCase().startsWith('sk')?'sk':'cz';
  }

  const cacheKey=(lang,episode)=>`${CACHE_PREFIX}${lang}:${episode}`;
  const jobKey=(lang,episode)=>`${lang}:${episode}`;

  function validItems(value,episode){
    if(!Array.isArray(value)||!value.length)return null;
    const items=[];
    for(let index=0;index<value.length;index++){
      const item=value[index];
      if(!item||typeof item!=='object'||!Array.isArray(item.points))return null;
      items.push({
        episode:Number(episode),
        order:Number.isFinite(Number(item.order))?Number(item.order):index,
        time:String(item.time||'0:00'),
        endRaw:item.endRaw==null?null:String(item.endRaw),
        title:String(item.title||`Otázka ${index+1}`),
        points:item.points.map(point=>String(point||'').trim()).filter(Boolean)
      });
    }
    return items;
  }

  function readCache(episode,lang=language()){
    try{
      const saved=JSON.parse(localStorage.getItem(cacheKey(lang,episode))||'null');
      if(saved?.version!==CACHE_VERSION||saved?.language!==lang||Number(saved?.episode)!==Number(episode))return null;
      return validItems(saved.items,episode);
    }catch{return null}
  }

  function writeCache(episode,items,lang){
    const clean=validItems(items,episode);
    if(!clean||lang!==language())return clean;
    try{
      localStorage.setItem(cacheKey(lang,episode),JSON.stringify({
        version:CACHE_VERSION,
        language:lang,
        episode:Number(episode),
        savedAt:Date.now(),
        items:clean
      }));
    }catch{}
    return clean;
  }

  function pruneOldCaches(){
    try{
      const remove=[];
      for(let index=0;index<localStorage.length;index++){
        const key=localStorage.key(index)||'';
        if(key.startsWith(OLD_PREFIX)&&!key.startsWith(CACHE_PREFIX))remove.push(key);
      }
      remove.forEach(key=>localStorage.removeItem(key));
    }catch{}
  }

  function episodeNumber(article){
    const heading=article?.querySelector?.('h2')?.textContent||'';
    const number=Number(heading.match(/\bpodcast\s+(\d+)\b/i)?.[1]||0);
    return FAQ.includes(number)?number:0;
  }

  function hydrateArticle(article,items){
    if(!article?.isConnected||article.querySelector('.summary-block')||!items?.length)return;
    const details=document.createElement('details');
    details.className='episode-summary';
    const summary=document.createElement('summary');
    summary.textContent='Shrnutí dílu';
    const body=document.createElement('div');
    body.className='episode-summary-body';
    for(const item of items){
      const block=document.createElement('div');
      block.className='summary-block';
      if(item.endRaw!=null)block.dataset.end=item.endRaw;
      const time=document.createElement('div');
      time.className='summary-time';
      time.textContent=item.time;
      time.dataset.vedatorPreroll=String(PREROLL);
      const title=document.createElement('div');
      title.className='summary-title';
      title.textContent=item.title;
      const list=document.createElement('ul');
      for(const point of item.points){
        const li=document.createElement('li');
        li.textContent=point;
        list.appendChild(li);
      }
      block.append(time,title,list);
      body.appendChild(block);
    }
    details.append(summary,body);
    article.appendChild(details);
  }

  function serializeArticle(article,episode){
    const blocks=[...article.querySelectorAll('.summary-block')];
    if(!blocks.length)return null;
    return validItems(blocks.map((block,index)=>({
      episode,
      order:index,
      time:block.querySelector('.summary-time')?.textContent||'0:00',
      endRaw:block.dataset.end||null,
      title:block.querySelector('.summary-title')?.textContent||`Otázka ${index+1}`,
      points:[...block.querySelectorAll('li')].map(item=>item.textContent.trim()).filter(Boolean)
    })),episode);
  }

  function waitForSummary(article,timeout=1900){
    if(article.querySelector('.summary-block'))return Promise.resolve(true);
    return new Promise(resolve=>{
      let done=false;
      const finish=value=>{
        if(done)return;
        done=true;
        clearTimeout(timer);
        observer.disconnect();
        resolve(value);
      };
      const observer=new MutationObserver(()=>{
        if(article.querySelector('.summary-block'))finish(true);
      });
      observer.observe(article,{childList:true,subtree:true});
      const timer=setTimeout(()=>finish(Boolean(article.querySelector('.summary-block'))),timeout);
    });
  }

  async function extractFromArticle(article,episode,lang){
    const found=await waitForSummary(article);
    if(!found)return[];
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(lang!==language())return[];
    const items=serializeArticle(article,episode)||[];
    writeCache(episode,items,lang);
    return items;
  }

  function processArticle(article){
    if(!(article instanceof HTMLElement)||!article.matches('article')||!article.hidden)return;
    if(watchedArticles.has(article))return;
    const episode=episodeNumber(article);
    if(!episode||episode===300)return;
    watchedArticles.add(article);
    const lang=language();
    const cached=readCache(episode,lang);
    if(cached){
      hydrateArticle(article,cached);
      return;
    }

    const key=jobKey(lang,episode);
    const existing=inflight.get(key);
    if(existing){
      existing.then(items=>hydrateArticle(article,items)).catch(()=>{});
      return;
    }

    const job=extractFromArticle(article,episode,lang);
    inflight.set(key,job);
    job.then(items=>hydrateArticle(article,items)).catch(()=>{}).finally(()=>{
      if(inflight.get(key)===job)inflight.delete(key);
    });
  }

  function installEpisodesObserver(){
    const box=document.querySelector('#episodes');
    if(!box){setTimeout(installEpisodesObserver,50);return}
    episodesObserver?.disconnect();
    episodesObserver=new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches?.('article'))processArticle(node);
        node.querySelectorAll?.('article').forEach(processArticle);
      }
    });
    episodesObserver.observe(box,{childList:true,subtree:false});
    box.querySelectorAll('article[hidden]').forEach(processArticle);
  }

  async function prewarmEpisode(episode,lang,generation){
    if(generation!==warmGeneration||lang!==language()||episode===300||readCache(episode,lang))return;
    const key=jobKey(lang,episode);
    if(inflight.has(key)){await inflight.get(key).catch(()=>{});return}
    const box=document.querySelector('#episodes');
    if(!box)return;
    const article=document.createElement('article');
    article.hidden=true;
    article.dataset.vedatorQuestionCachePrewarm='1';
    article.setAttribute('aria-hidden','true');
    const heading=document.createElement('h2');
    heading.textContent=`Podcast ${episode}`;
    article.appendChild(heading);
    box.appendChild(article);
    processArticle(article);
    const job=inflight.get(key);
    if(job)await job.catch(()=>{});
    article.remove();
  }

  async function warmAll(generation,lang){
    if(!window.__vedatorQuestionsView||generation!==warmGeneration||lang!==language())return;
    const missing=FAQ.filter(episode=>episode!==300&&!readCache(episode,lang));
    let cursor=0;
    const worker=async()=>{
      while(generation===warmGeneration&&lang===language()){
        const index=cursor++;
        if(index>=missing.length)return;
        await prewarmEpisode(missing[index],lang,generation);
        await new Promise(resolve=>setTimeout(resolve,0));
      }
    };
    await Promise.all(Array.from({length:Math.min(CONCURRENCY,missing.length)},worker));
  }

  function scheduleWarm(reset=false){
    if(reset)warmGeneration++;
    if(warmScheduled)return;
    warmScheduled=true;
    const start=()=>{
      warmScheduled=false;
      const generation=warmGeneration;
      const lang=language();
      if(!window.__vedatorQuestionsView){setTimeout(()=>scheduleWarm(),120);return}
      void warmAll(generation,lang);
    };
    if('requestIdleCallback'in window)requestIdleCallback(start,{timeout:350});
    else setTimeout(start,180);
  }

  pruneOldCaches();
  installEpisodesObserver();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleWarm(),{once:true});
  else scheduleWarm();
  window.addEventListener('vedatorlanguagechange',()=>scheduleWarm(true));
  window.addEventListener('vedatorepisodetranslationsready',()=>scheduleWarm(true));
})();
