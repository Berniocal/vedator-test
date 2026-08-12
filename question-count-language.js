(()=>{
  if(window.__vedatorQuestionCountLanguage)return;
  window.__vedatorQuestionCountLanguage=true;

  const NativeMutationObserver=window.MutationObserver;
  const nativeAddEventListener=window.addEventListener.bind(window);
  const nativeRemoveEventListener=window.removeEventListener.bind(window);

  if(!window.__vedatorLanguageBatchController){
    const listeners=[];
    const translationObserverQueue=new Map();
    let generation=0;
    let translationObserverTimer=0;
    let translationObserverGeneration=0;
    let translationObserverBatching=false;

    window.__vedatorLanguageBatching=false;
    window.__vedatorTranslationObserverBatching=false;
    window.__vedatorSuppressTranslationObservers=false;

    const isTranslationScript=source=>/(?:^|\/)(?:episode-translations-|question-translations-)[^/]+\.js(?:[?#]|$)/i.test(String(source||''));

    function cancelTranslationObserverQueue(){
      clearTimeout(translationObserverTimer);
      translationObserverTimer=0;
      translationObserverQueue.clear();
      translationObserverGeneration+=1;
      translationObserverBatching=false;
      window.__vedatorTranslationObserverBatching=false;
    }

    function flushTranslationObservers(){
      translationObserverTimer=0;
      if(window.__vedatorLanguageBatching||window.__vedatorSuppressTranslationObservers){
        translationObserverQueue.clear();
        return;
      }

      const current=++translationObserverGeneration;
      const queue=[...translationObserverQueue.values()];
      translationObserverQueue.clear();
      let index=0;
      translationObserverBatching=true;
      window.__vedatorTranslationObserverBatching=true;

      const finish=()=>{
        setTimeout(()=>{
          if(current!==translationObserverGeneration)return;
          translationObserverBatching=false;
          window.__vedatorTranslationObserverBatching=false;
        },0);
      };

      const step=()=>{
        if(current!==translationObserverGeneration)return;
        const end=Math.min(index+6,queue.length);
        for(;index<end;index++){
          const entry=queue[index];
          try{entry.callback(entry.records,entry.observer)}catch(error){setTimeout(()=>{throw error},0)}
        }
        if(index<queue.length)requestAnimationFrame(step);
        else finish();
      };

      if(queue.length)requestAnimationFrame(step);
      else finish();
    }

    function scheduleTranslationObserver(callback,records,observer){
      if(window.__vedatorLanguageBatching||window.__vedatorSuppressTranslationObservers||translationObserverBatching)return;
      const existing=translationObserverQueue.get(callback);
      if(existing)existing.records.push(...records);
      else translationObserverQueue.set(callback,{callback,records:[...records],observer});
      clearTimeout(translationObserverTimer);
      translationObserverTimer=setTimeout(flushTranslationObservers,90);
    }

    window.MutationObserver=class VedatorMutationObserver extends NativeMutationObserver{
      constructor(callback){
        const translationObserver=isTranslationScript(document.currentScript?.src);
        super((records,observer)=>{
          if(window.__vedatorLanguageBatching)return;
          if(translationObserver){
            scheduleTranslationObserver(callback,records,observer);
            return;
          }
          callback(records,observer);
        });
      }
    };

    window.addEventListener=function(type,listener,options){
      if(type==='vedatorlanguagechange'&&listener){
        listeners.push({listener,options});
        return;
      }
      return nativeAddEventListener(type,listener,options);
    };

    window.removeEventListener=function(type,listener,options){
      if(type==='vedatorlanguagechange'&&listener){
        const index=listeners.findIndex(item=>item.listener===listener);
        if(index>=0)listeners.splice(index,1);
        return;
      }
      return nativeRemoveEventListener(type,listener,options);
    };

    nativeAddEventListener('vedatorlanguagechange',event=>{
      cancelTranslationObserverQueue();
      const current=++generation;
      const queue=listeners.slice();
      let index=0;
      window.__vedatorLanguageBatching=true;

      const finish=()=>{
        setTimeout(()=>{
          if(current===generation)window.__vedatorLanguageBatching=false;
        },0);
      };

      const step=()=>{
        if(current!==generation)return;
        const end=Math.min(index+4,queue.length);
        for(;index<end;index++){
          const entry=queue[index];
          try{
            if(typeof entry.listener==='function')entry.listener.call(window,event);
            else entry.listener?.handleEvent?.(event);
          }catch(error){
            setTimeout(()=>{throw error},0);
          }
          if(entry.options&&typeof entry.options==='object'&&entry.options.once){
            const originalIndex=listeners.findIndex(item=>item.listener===entry.listener);
            if(originalIndex>=0)listeners.splice(originalIndex,1);
          }
        }
        if(index<queue.length)requestAnimationFrame(step);
        else finish();
      };

      requestAnimationFrame(step);
    });

    window.__vedatorLanguageBatchController={listeners,translationObserverQueue};
  }

  const normalizeLanguage=value=>{
    const lang=String(value||'').toLowerCase();
    if(lang.startsWith('sk'))return 'sk';
    if(lang.startsWith('cs')||lang.startsWith('cz'))return 'cs';
    return '';
  };
  const language=()=>{
    try{
      const ui=normalizeLanguage(window.vedatorUiLanguage?.());
      if(ui)return ui;
    }catch(_){}
    const html=normalizeLanguage(document.documentElement.lang);
    if(html)return html;
    try{
      const stored=localStorage.getItem('vedator-ui-language-v1')||localStorage.getItem('vedator-ui-language')||localStorage.getItem('vedator-language');
      return normalizeLanguage(stored)||'cs';
    }catch(_){return 'cs'}
  };

  let episodeTranslationsReady=false;
  nativeAddEventListener('vedatorepisodetranslationsready',()=>{
    episodeTranslationsReady=true;
  });

  if(typeof matchLevel==='function'&&typeof categories==='function'&&typeof render==='function'){
    const searchDocumentCache=new WeakMap();
    const originalCategories=categories;

    const searchDocument=episode=>{
      const title=String(episode?.title||'');
      const description=String(episode?.description||'');
      const signature=`${title}\u0000${description}`;
      let cached=searchDocumentCache.get(episode);
      if(!cached||cached.signature!==signature){
        cached={
          signature,
          title:norm(title),
          description:norm(cleanHtml(description)),
          categories:null
        };
        searchDocumentCache.set(episode,cached);
      }
      return cached;
    };

    matchLevel=function(episode,queries){
      if(!queries.length)return 0;
      const document=searchDocument(episode);
      if(queries.some(query=>document.title.includes(query)))return 0;
      if(queries.some(query=>query.split(' ').every(word=>document.title.includes(word))))return 1;
      if(queries.some(query=>document.description.includes(query)))return 2;
      if(queries.some(query=>query.split(' ').every(word=>document.description.includes(word))))return 3;
      return 99;
    };

    categories=function(episode){
      const document=searchDocument(episode);
      if(document.categories)return document.categories;
      document.categories=originalCategories(episode);
      return document.categories;
    };

    const searchInput=document.querySelector('#search');
    if(searchInput){
      const immediateRender=render;
      let searchTimer=0;
      let searchFrame=0;
      let composing=false;

      const renderSearch=()=>{
        searchFrame=0;
        const suppressTranslations=episodeTranslationsReady&&language()==='cs';
        if(suppressTranslations)window.__vedatorSuppressTranslationObservers=true;
        try{immediateRender()}
        finally{
          if(suppressTranslations){
            setTimeout(()=>{
              window.__vedatorSuppressTranslationObservers=false;
            },0);
          }
        }
      };

      const scheduleSearchRender=()=>{
        clearTimeout(searchTimer);
        if(searchFrame)cancelAnimationFrame(searchFrame);
        const delay=searchInput.value.trim()?90:0;
        searchTimer=setTimeout(()=>{
          searchTimer=0;
          searchFrame=requestAnimationFrame(renderSearch);
        },delay);
      };

      searchInput.removeEventListener('input',immediateRender);
      searchInput.addEventListener('compositionstart',()=>{composing=true});
      searchInput.addEventListener('compositionend',()=>{
        composing=false;
        scheduleSearchRender();
      });
      searchInput.addEventListener('input',event=>{
        if(composing||event.isComposing)return;
        scheduleSearchRender();
      });
    }
  }

  const numberFrom=text=>Number(String(text).match(/^\s*(\d+)/)?.[1]);
  const foundPattern=/^\s*\d+\s+(?:nalezená otázka|nalezené otázky|nalezených otázek|nájdená otázka|nájdené otázky|nájdených otázok)\s*$/i;
  const totalPattern=/^\s*\d+\s+(?:otázek|otázok)\s*$/i;
  const foundLabel=(n,sk)=>{
    if(sk)return n===1?'1 nájdená otázka':n>=2&&n<=4?`${n} nájdené otázky`:`${n} nájdených otázok`;
    return n===1?'1 nalezená otázka':n>=2&&n<=4?`${n} nalezené otázky`:`${n} nalezených otázek`;
  };

  let applying=false,scheduled=false;
  function translateNode(node,sk){
    if(!node)return;
    const text=(node.textContent||'').trim();
    let next='';
    if(foundPattern.test(text))next=foundLabel(numberFrom(text),sk);
    else if(totalPattern.test(text))next=`${numberFrom(text)} ${sk?'otázok':'otázek'}`;
    else if(/^(?:Hledám|Hľadám) otázky…?$/.test(text))next=sk?'Hľadám otázky…':'Hledám otázky…';
    else if(/^(?:Načítám|Načítavam) otázky…?$/.test(text))next=sk?'Načítavam otázky…':'Načítám otázky…';
    if(next&&node.textContent!==next)node.textContent=next;
  }
  function apply(){
    if(applying)return;
    applying=true;
    try{
      const sk=language()==='sk';
      translateNode(document.querySelector('#count'),sk);
      document.querySelectorAll('.faq-loading').forEach(node=>translateNode(node,sk));
    }finally{applying=false}
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;apply()});
  }

  apply();
  new NativeMutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  nativeAddEventListener('vedatorlanguagechange',schedule);

  if(!document.querySelector('script[data-vedator-translations-158-end-143-part1]')){
    const script=document.createElement('script');
    script.src='./question-translations-158-end-143-part1.js';
    script.async=false;
    script.dataset.vedatorTranslations158End143Part1='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-143-end-138-part1]')){
    const script=document.createElement('script');
    script.src='./question-translations-143-end-138-part1.js';
    script.async=false;
    script.dataset.vedatorTranslations143End138Part1='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-138-end-133-part1]')){
    const script=document.createElement('script');
    script.src='./question-translations-138-end-133-part1.js';
    script.async=false;
    script.dataset.vedatorTranslations138End133Part1='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-128-part1]')){
    const script=document.createElement('script');
    script.src='./question-translations-128-part1.js';
    script.async=false;
    script.dataset.vedatorTranslations128Part1='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-128-end-119-part1]')){
    const script=document.createElement('script');
    script.src='./question-translations-128-end-119-part1.js';
    script.async=false;
    script.dataset.vedatorTranslations128End119Part1='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-119-end-112-part1]')){
    const script=document.createElement('script');
    script.src='./question-translations-119-end-112-part1.js';
    script.async=false;
    script.dataset.vedatorTranslations119End112Part1='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-112-part2]')){
    const script=document.createElement('script');
    script.src='./question-translations-112-part2.js';
    script.async=false;
    script.dataset.vedatorTranslations112Part2='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-100-part1]')){
    const script=document.createElement('script');
    script.src='./question-translations-100-part1.js';
    script.async=false;
    script.dataset.vedatorTranslations100Part1='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-100-part2]')){
    const script=document.createElement('script');
    script.src='./question-translations-100-part2.js';
    script.async=false;
    script.dataset.vedatorTranslations100Part2='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-translations-100-part3]')){
    const script=document.createElement('script');
    script.src='./question-translations-100-part3.js';
    script.async=false;
    script.dataset.vedatorTranslations100Part3='1';
    document.head.appendChild(script);
  }
})();
