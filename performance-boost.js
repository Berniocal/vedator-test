(()=>{
  if(window.__vedatorPerformanceBoost)return;
  window.__vedatorPerformanceBoost=true;
  window.__vedatorHighlightPatch=true;

  const nativeAddEventListener=EventTarget.prototype.addEventListener;
  if(!EventTarget.prototype.__vedatorDeferredSeriesToggle){
    Object.defineProperty(EventTarget.prototype,'__vedatorDeferredSeriesToggle',{value:true,configurable:true});
    EventTarget.prototype.addEventListener=function(type,listener,options){
      if(type==='toggle'&&typeof listener==='function'&&this instanceof HTMLElement&&this.classList.contains('series-card')){
        const deferred=function(event){requestAnimationFrame(()=>listener.call(this,event))};
        return nativeAddEventListener.call(this,type,deferred,options);
      }
      return nativeAddEventListener.call(this,type,listener,options);
    };
  }

  const style=document.createElement('style');
  style.dataset.vedatorPerformanceStyle='1';
  style.textContent=`
    mark.vedator-match{background:#ffe66b!important;color:inherit!important;border-radius:.28em;padding:.03em .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
    html.theme-dark mark.vedator-match{background:#8a6d00!important;color:#fff4b3!important}
    .links button.vedator-read-more{flex:1;text-align:center;border-radius:10px;padding:9px;font-weight:700;border:1px solid var(--line);color:var(--ink);background:transparent;cursor:pointer}
    .links button.vedator-read-more:active{transform:translateY(1px)}
    article.vedator-description-expanded .desc{-webkit-line-clamp:unset;display:block;overflow:visible}
    article.vedator-description-expanded .desc p{margin:0 0 .9em}
    article.vedator-description-expanded .desc p:last-child{margin-bottom:0}
    article.vedator-description-expanded .desc ul,article.vedator-description-expanded .desc ol{margin:.5em 0 .9em;padding-left:1.3em}
    article.vedator-description-expanded .desc a{color:var(--accent);text-decoration:underline;overflow-wrap:anywhere}
    #episodes>article{content-visibility:auto;contain-intrinsic-size:auto 280px}
  `;
  document.head.appendChild(style);

  const metaCache=new WeakMap();
  const plainCache=new Map();
  const MAX_PLAIN_CACHE=800;
  const dateFormatter=new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'long',year:'numeric'});
  let seriesRevision=0;
  let lookupRevision=0;

  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const normalizeLoose=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const normalizeLanguage=value=>{
    const lang=String(value||'').toLowerCase();
    if(lang.startsWith('sk'))return 'sk';
    if(lang.startsWith('cs')||lang.startsWith('cz'))return 'cs';
    return '';
  };
  const language=()=>{
    try{const ui=normalizeLanguage(window.vedatorUiLanguage?.());if(ui)return ui}catch{}
    try{const stored=normalizeLanguage(localStorage.getItem('vedator-ui-language-v1')||localStorage.getItem('vedator-ui-language')||localStorage.getItem('vedator-language'));if(stored)return stored}catch{}
    return normalizeLanguage(document.documentElement.lang)||'cs';
  };
  const getEpisodes=()=>{try{return Array.isArray(episodes)?episodes:[]}catch{return[]}};

  function plainDescription(value){
    const raw=String(value||'');
    if(plainCache.has(raw))return plainCache.get(raw);
    const box=document.createElement('div');
    box.innerHTML=raw;
    const plain=(box.textContent||'').replace(/\s+/g,' ').trim();
    if(plainCache.size>=MAX_PLAIN_CACHE)plainCache.delete(plainCache.keys().next().value);
    plainCache.set(raw,plain);
    return plain;
  }

  function episodeMeta(episode){
    const title=String(episode?.title||'');
    const description=String(episode?.description||'');
    const cached=episode&&metaCache.get(episode);
    if(cached&&cached.title===title&&cached.description===description)return cached;

    const plain=plainDescription(description);
    const shortBase=plain.replace(/Podcast vzniká[\s\S]*/i,'').trim();
    const shortDescription=shortBase.length>440?shortBase.slice(0,437).replace(/\s+\S*$/,'')+'…':shortBase;
    let cats=[];
    try{cats=typeof categories==='function'?categories(episode):[]}catch{}
    if(!Array.isArray(cats))cats=[];
    const dateTs=episode?.date?new Date(episode.date).getTime():0;
    let dateLabel='';
    try{if(dateTs)dateLabel=dateFormatter.format(new Date(dateTs))}catch{}

    const next={
      title,
      description,
      plain,
      titleNorm:normalize(title),
      descNorm:normalize(plain),
      shortDescription:shortDescription||(language()==='sk'?'Popis nie je k dispozícii.':'Popis není k dispozici.'),
      cats,
      dateTs:Number.isFinite(dateTs)?dateTs:0,
      dateLabel
    };
    if(episode&&typeof episode==='object')metaCache.set(episode,next);
    return next;
  }
  window.__vedatorEpisodeMeta=episodeMeta;

  let warmSource=null,warmIndex=0,warmTimer=0;
  function warmMetadata(deadline){
    warmTimer=0;
    const source=getEpisodes();
    if(source!==warmSource){warmSource=source;warmIndex=0}
    const started=performance.now();
    while(warmIndex<source.length){
      episodeMeta(source[warmIndex++]);
      const hasIdleBudget=deadline&&typeof deadline.timeRemaining==='function'?deadline.timeRemaining()>3:performance.now()-started<8;
      if(!hasIdleBudget)break;
    }
    if(warmIndex<source.length)scheduleMetadataWarmup();
  }
  function scheduleMetadataWarmup(reset=false){
    if(reset){warmSource=null;warmIndex=0}
    if(warmTimer)return;
    if('requestIdleCallback'in window)warmTimer=requestIdleCallback(warmMetadata,{timeout:900});
    else warmTimer=setTimeout(()=>warmMetadata(null),40);
  }

  function prepareQueries(values){
    return (values||[]).map(value=>{
      const raw=normalize(value);
      return {raw,words:raw.split(' ').filter(Boolean)};
    }).filter(query=>query.raw);
  }

  function fastMatch(meta,queries){
    if(!queries.length)return 0;
    const title=meta.titleNorm,desc=meta.descNorm;
    if(queries.some(query=>title.includes(query.raw)))return 0;
    if(queries.some(query=>query.words.every(word=>title.includes(word))))return 1;
    if(queries.some(query=>desc.includes(query.raw)))return 2;
    if(queries.some(query=>query.words.every(word=>desc.includes(word))))return 3;
    return 99;
  }

  function installFilterBoost(){
    let original;
    try{original=filtered}catch{return false}
    if(typeof original!=='function')return false;
    if(original.__vedatorFastFilter)return true;

    const fastFiltered=function(){
      let currentTopic='Vše';
      try{currentTopic=active}catch{}
      if(currentTopic==='Matematika')return original();

      const searchValue=document.querySelector('#search')?.value||'';
      let searchQueries=[],topicQueries=[];
      try{searchQueries=expandedQuery(searchValue)}catch{}
      try{topicQueries=selectedTopicQueries()}catch{}
      const preparedSearch=prepareQueries(searchQueries);
      const preparedTopics=prepareQueries(topicQueries);
      const result=[];

      for(const episode of getEpisodes()){
        const meta=episodeMeta(episode);
        const searchMatch=fastMatch(meta,preparedSearch);
        if(preparedSearch.length&&searchMatch>=99)continue;
        const topicMatch=fastMatch(meta,preparedTopics);
        if(preparedTopics.length&&topicMatch>=99)continue;
        const item={...episode,cats:meta.cats,searchMatch,topicMatch,__vedatorDateTs:meta.dateTs};
        Object.defineProperty(item,'__vedatorMeta',{value:meta,enumerable:false});
        result.push(item);
      }
      return result;
    };
    fastFiltered.__vedatorFastFilter=true;
    fastFiltered.__vedatorOriginal=original;
    try{filtered=fastFiltered}catch{}
    window.filtered=fastFiltered;
    return true;
  }

  function installSeriesCache(){
    let original;
    try{original=seriesGroups}catch{return false}
    if(typeof original!=='function')return false;
    if(original.__vedatorSeriesCache)return true;
    let cachedEpisodes=null,cachedRevision=-1,cachedSort='',cachedResult=null;
    const cachedSeriesGroups=function(){
      const currentEpisodes=getEpisodes();
      const sort=document.querySelector('#seriesSort')?.value||'count';
      if(cachedResult&&cachedEpisodes===currentEpisodes&&cachedRevision===seriesRevision&&cachedSort===sort)return cachedResult;
      cachedEpisodes=currentEpisodes;
      cachedRevision=seriesRevision;
      cachedSort=sort;
      cachedResult=original();
      return cachedResult;
    };
    cachedSeriesGroups.__vedatorSeriesCache=true;
    cachedSeriesGroups.__vedatorOriginal=original;
    try{seriesGroups=cachedSeriesGroups}catch{}
    window.seriesGroups=cachedSeriesGroups;
    return true;
  }

  function wrapRenderer(name,hostSelector){
    const original=window[name];
    if(typeof original!=='function')return false;
    if(original.__vedatorFrameBoost)return true;
    let frame=0,generation=0;
    const wrapped=function(...args){
      const current=++generation;
      if(frame)cancelAnimationFrame(frame);
      const host=document.querySelector(hostSelector);
      host?.setAttribute('aria-busy','true');
      frame=requestAnimationFrame(()=>{
        frame=0;
        if(current!==generation)return;
        try{return original.apply(this,args)}finally{host?.removeAttribute('aria-busy')}
      });
    };
    wrapped.__vedatorFrameBoost=true;
    wrapped.__vedatorOriginal=original;
    window[name]=wrapped;
    try{
      if(name==='renderEpisodes')renderEpisodes=wrapped;
      else if(name==='renderSeries')renderSeries=wrapped;
    }catch{}
    return true;
  }

  function installRenderBoost(){
    const filterReady=installFilterBoost();
    const seriesReady=installSeriesCache();
    const episodesReady=wrapRenderer('renderEpisodes','#episodes');
    const seriesRenderReady=wrapRenderer('renderSeries','#series');
    if(!(filterReady&&seriesReady&&episodesReady&&seriesRenderReady))setTimeout(installRenderBoost,100);
  }

  const episodesBox=document.querySelector('#episodes');
  if(episodesBox){
    const isWordChar=char=>/[a-z0-9]/.test(char||'');
    let indexSource=null,indexRevision=-1,indexByNumber=new Map(),indexByTitle=new Map();
    let scheduledFrame=0,forceAll=true;

    function episodeIndex(){
      const source=getEpisodes();
      if(indexSource===source&&indexRevision===lookupRevision)return;
      indexSource=source;
      indexRevision=lookupRevision;
      indexByNumber=new Map();
      indexByTitle=new Map();
      for(const episode of source){
        if(episode?.number!=null)indexByNumber.set(String(episode.number),episode);
        indexByTitle.set(String(episode?.title||'').trim(),episode);
      }
    }

    function currentTerms(){
      const query=document.querySelector('#search')?.value?.trim()||'';
      if(query){
        let queries=[query];
        try{if(typeof expandedQuery==='function')queries=expandedQuery(query)}catch{}
        return [...new Set(queries.flatMap(value=>[value,...String(value).split(/\s+/)]).map(normalizeLoose).filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
      }
      try{
        if(typeof active==='string'&&active!=='Vše'&&typeof TOPICS!=='undefined'){
          const topicTerms=Array.isArray(TOPICS[active])?TOPICS[active]:[];
          return [...new Set(topicTerms.map(normalizeLoose).filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
        }
      }catch{}
      return [];
    }

    function normalizedTextWithMap(text){
      let normalized='';const map=[];
      for(let i=0;i<text.length;i++){
        const part=normalizeLoose(text[i]);
        normalized+=part;
        for(let j=0;j<part.length;j++)map.push(i);
      }
      return {normalized,map};
    }

    function validOccurrence(text,index,term){
      const before=text[index-1]||'',after=text[index+term.length]||'';
      if(isWordChar(before))return false;
      if(term.includes(' ')||term.length<=3)return !isWordChar(after);
      return true;
    }

    function rangesFor(text,terms){
      const {normalized,map}=normalizedTextWithMap(text),ranges=[];
      for(const term of terms){
        let from=0;
        while(from<normalized.length){
          const index=normalized.indexOf(term,from);
          if(index<0)break;
          if(validOccurrence(normalized,index,term)){
            const start=map[index],end=(map[index+term.length-1]??start)+1;
            if(!ranges.some(range=>start<range.end&&end>range.start))ranges.push({start,end});
          }
          from=index+Math.max(1,term.length);
        }
      }
      return ranges.sort((a,b)=>a.start-b.start);
    }

    function safeRichDescription(value){
      const source=document.createElement('div');source.innerHTML=String(value||'');
      source.querySelectorAll('script,style,iframe,object,embed,form,input,button').forEach(node=>node.remove());
      source.querySelectorAll('*').forEach(node=>{
        [...node.attributes].forEach(attr=>{const name=attr.name.toLowerCase();if(name.startsWith('on')||name==='style')node.removeAttribute(attr.name)});
        if(node.tagName==='A'){
          const href=node.getAttribute('href')||'';
          if(!/^https?:\/\//i.test(href)){node.replaceWith(document.createTextNode(node.textContent||''));return}
          node.target='_blank';node.rel='noopener noreferrer';
        }
      });
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT),texts=[];
      while(walker.nextNode())texts.push(walker.currentNode);
      const urlPattern=/(https?:\/\/[^\s<>]+)/g;
      texts.forEach(textNode=>{
        if(textNode.parentElement?.closest('a'))return;
        const text=textNode.nodeValue||'';
        urlPattern.lastIndex=0;
        if(!urlPattern.test(text))return;
        urlPattern.lastIndex=0;
        const fragment=document.createDocumentFragment();let position=0,match;
        while((match=urlPattern.exec(text))){
          if(match.index>position)fragment.append(document.createTextNode(text.slice(position,match.index)));
          const link=document.createElement('a');link.href=match[0];link.textContent=match[0];link.target='_blank';link.rel='noopener noreferrer';fragment.append(link);
          position=match.index+match[0].length;
        }
        if(position<text.length)fragment.append(document.createTextNode(text.slice(position)));
        textNode.replaceWith(fragment);
      });
      return source;
    }

    function episodeForArticle(article){
      if(article.__vedatorEpisode)return article.__vedatorEpisode;
      episodeIndex();
      const title=article.querySelector('h2')?.textContent?.trim()||'';
      const number=article.dataset.vedatorEpisodeNumber||title.match(/\bpodcast\s+(\d+)\b/i)?.[1];
      const episode=(number&&indexByNumber.get(String(number)))||indexByTitle.get(title)||null;
      if(episode)article.__vedatorEpisode=episode;
      return episode;
    }

    function excerptAroundMatch(text,terms){
      const clean=String(text||'').replace(/\s+/g,' ').trim();
      if(!clean)return language()==='sk'?'Popis nie je k dispozícii.':'Popis není k dispozici.';
      if(!terms.length)return clean.length>330?clean.slice(0,327).trimEnd()+'…':clean;
      const ranges=rangesFor(clean,terms);
      if(!ranges.length)return clean.length>330?clean.slice(0,327).trimEnd()+'…':clean;
      const first=ranges[0];let start=Math.max(0,first.start-115),end=Math.min(clean.length,Math.max(first.end+180,start+330));
      while(start>0&&!/\s/.test(clean[start-1]))start--;
      while(end<clean.length&&!/\s/.test(clean[end]))end++;
      return (start>0?'…':'')+clean.slice(start,end).trim()+(end<clean.length?'…':'');
    }

    function unwrapMarks(root){
      root.querySelectorAll('mark.vedator-match').forEach(mark=>mark.replaceWith(document.createTextNode(mark.textContent||'')));
      root.normalize();
    }

    function highlightTextNode(textNode,terms){
      const text=textNode.nodeValue||'',ranges=rangesFor(text,terms);
      if(!ranges.length)return;
      const fragment=document.createDocumentFragment();let position=0;
      for(const range of ranges){
        if(range.start>position)fragment.append(document.createTextNode(text.slice(position,range.start)));
        const mark=document.createElement('mark');mark.className='vedator-match';mark.textContent=text.slice(range.start,range.end);fragment.append(mark);position=range.end;
      }
      if(position<text.length)fragment.append(document.createTextNode(text.slice(position)));
      textNode.replaceWith(fragment);
    }

    function highlightElement(element,terms){
      const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement?.closest('mark.vedator-match')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),nodes=[];
      while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(node=>highlightTextNode(node,terms));
    }

    const readMoreLabel=expanded=>language()==='sk'?(expanded?'Čítať menej':'Čítať viac'):(expanded?'Číst méně':'Číst více');
    function prepareReadMore(article){
      const links=article.querySelector('.links');if(!links)return;
      const oldDetail=links.querySelector('a.secondary');let button=links.querySelector('.vedator-read-more');
      if(!button){
        button=document.createElement('button');button.type='button';button.className='vedator-read-more';
        if(oldDetail)oldDetail.replaceWith(button);else links.appendChild(button);
      }
      const expanded=article.dataset.descriptionExpanded==='true',next=readMoreLabel(expanded);
      if(button.textContent!==next)button.textContent=next;
      button.setAttribute('aria-expanded',String(expanded));
    }

    function applyArticle(article,terms,termKey,force=false){
      const title=article.querySelector('h2'),desc=article.querySelector('.desc');
      if(!title&&!desc)return;
      const episode=episodeForArticle(article);
      const expanded=article.dataset.descriptionExpanded==='true';
      const signature=[termKey,expanded?'1':'0',episode?.title||title?.textContent||'',episode?.description||''].join('\u001f');
      if(!force&&article.__vedatorHighlightSignature===signature)return;

      if(title)unwrapMarks(title);
      if(desc){
        unwrapMarks(desc);
        if(episode){
          const meta=episodeMeta(episode);
          article.classList.toggle('vedator-description-expanded',expanded);
          if(expanded){
            const rich=safeRichDescription(episode.description);
            desc.replaceChildren(...rich.childNodes);
          }else desc.textContent=excerptAroundMatch(meta.plain,terms);
        }
      }
      prepareReadMore(article);
      if(terms.length){if(title)highlightElement(title,terms);if(desc)highlightElement(desc,terms)}
      article.__vedatorHighlightSignature=signature;
    }

    const observer=new MutationObserver(()=>scheduleHighlight(false));
    function applyHighlights(force=false,articles=null){
      if(episodesBox.classList.contains('hidden')){forceAll=forceAll||force;return}
      observer.disconnect();
      const terms=currentTerms();
      const termKey=`${language()}|${terms.join('\u001e')}`;
      const targets=articles||episodesBox.querySelectorAll('article');
      for(const article of targets)applyArticle(article,terms,termKey,force);
      observer.observe(episodesBox,{childList:true,subtree:true});
      forceAll=false;
    }

    function scheduleHighlight(force=false){
      forceAll=forceAll||force;
      if(episodesBox.classList.contains('hidden'))return;
      if(scheduledFrame)return;
      scheduledFrame=requestAnimationFrame(()=>{
        scheduledFrame=0;
        applyHighlights(forceAll);
      });
    }

    episodesBox.addEventListener('click',event=>{
      const button=event.target.closest('.vedator-read-more');if(!button)return;
      const article=button.closest('article');if(!article)return;
      article.dataset.descriptionExpanded=String(article.dataset.descriptionExpanded!=='true');
      article.__vedatorHighlightSignature='';
      requestAnimationFrame(()=>applyHighlights(true,[article]));
    });
    document.addEventListener('click',event=>{
      if(event.target.closest?.('.tab[data-view="episodes"]'))requestAnimationFrame(()=>scheduleHighlight(true));
    },true);
    window.addEventListener('vedatorlanguagechange',()=>{seriesRevision++;lookupRevision++;scheduleMetadataWarmup(true);scheduleHighlight(true)});
    window.addEventListener('vedatorepisodetranslationsready',()=>{seriesRevision++;lookupRevision++;scheduleMetadataWarmup(true);scheduleHighlight(true)});
    window.addEventListener('vedatorcontentchange',()=>scheduleHighlight(false));
    observer.observe(episodesBox,{childList:true,subtree:true});
    scheduleHighlight(true);
  }

  scheduleMetadataWarmup();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installRenderBoost,{once:true});
  else setTimeout(installRenderBoost,0);
})();
