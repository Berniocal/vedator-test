(()=>{
  if(window.__vedatorEpisodeTranslationsLoader)return;
  window.__vedatorEpisodeTranslationsLoader=true;
  window.__vedatorEpisodeTranslationsReady=false;

  const VERSION='20260808-episode-343-summary-seek';
  const SOURCES=[
    ['episode-translations-347.js','data-vedator-episode-translations-347'],
    ['episode-347-summary.js','data-vedator-episode-347-summary'],
    ['episode-347-summary-interactive.js','data-vedator-episode-347-summary-interactive'],
    ['episode-345-summary.js','data-vedator-episode-345-summary'],
    ['episode-345-summary-interactive.js','data-vedator-episode-345-summary-interactive'],
    ['episode-344-summary.js','data-vedator-episode-344-summary'],
    ['episode-344-summary-interactive.js','data-vedator-episode-344-summary-interactive'],
    ['episode-343-summary.js','data-vedator-episode-343-summary'],
    ['episode-343-summary-interactive.js','data-vedator-episode-343-summary-interactive'],
    ['episode-342-summary.js','data-vedator-episode-342-summary'],
    ['episode-342-summary-interactive.js','data-vedator-episode-342-summary-interactive'],
    ['episode-341-summary.js','data-vedator-episode-341-summary'],
    ['episode-341-summary-interactive.js','data-vedator-episode-341-summary-interactive'],
    ['episode-339-summary.js','data-vedator-episode-339-summary'],
    ['episode-339-summary-interactive.js','data-vedator-episode-339-summary-interactive'],
    ['episode-338-summary.js','data-vedator-episode-338-summary'],
    ['episode-338-summary-interactive.js','data-vedator-episode-338-summary-interactive'],
    ['episode-335-summary-data-cs.js','data-vedator-episode-335-summary-data-cs'],
    ['episode-335-summary-data-sk.js','data-vedator-episode-335-summary-data-sk'],
    ['episode-335-summary.js','data-vedator-episode-335-summary'],
    ['episode-335-summary-interactive.js','data-vedator-episode-335-summary-interactive'],
    ['episode-334-summary-data-cs.js','data-vedator-episode-334-summary-data-cs'],
    ['episode-334-summary-data-sk.js','data-vedator-episode-334-summary-data-sk'],
    ['episode-334-summary.js','data-vedator-episode-334-summary'],
    ['episode-334-summary-interactive.js','data-vedator-episode-334-summary-interactive'],
    ['episode-translations-346-337.js','data-vedator-episode-translations-346-337'],
    ['episode-translations-336-330.js','data-vedator-episode-translations-336-330'],
    ['episode-translations-329-323.js','data-vedator-episode-translations-329-323'],
    ['episode-translations-322-316.js','data-vedator-episode-translations-322-316'],
    ['episode-translations-315-308.js','data-vedator-episode-translations-315-308'],
    ['episode-translations-307-300.js','data-vedator-episode-translations-307-300'],
    ['episode-translations-299-292.js','data-vedator-episode-translations-299-292'],
    ['episode-translations-291-284.js','data-vedator-episode-translations-291-284'],
    ['episode-translations-283-276.js','data-vedator-episode-translations-283-276'],
    ['episode-translations-275-268.js','data-vedator-episode-translations-275-268'],
    ['episode-translations-267-260.js','data-vedator-episode-translations-267-260'],
    ['episode-translations-259-252.js','data-vedator-episode-translations-259-252'],
    ['episode-translations-251-244.js','data-vedator-episode-translations-251-244'],
    ['episode-translations-243-236.js','data-vedator-episode-translations-243-236'],
    ['episode-translations-235-228.js','data-vedator-episode-translations-235-228'],
    ['episode-translations-227-220.js','data-vedator-episode-translations-227-220'],
    ['episode-translations-219-212.js','data-vedator-episode-translations-219-212'],
    ['episode-translations-211-204.js','data-vedator-episode-translations-211-204'],
    ['episode-translations-203-196.js','data-vedator-episode-translations-203-196'],
    ['episode-translations-195-188.js','data-vedator-episode-translations-195-188'],
    ['episode-translations-187-180.js','data-vedator-episode-translations-187-180'],
    ['episode-translations-179-172.js','data-vedator-episode-translations-179-172'],
    ['episode-translations-171-164.js','data-vedator-episode-translations-171-164'],
    ['episode-translations-163-156.js','data-vedator-episode-translations-163-156'],
    ['episode-translations-155-148.js','data-vedator-episode-translations-155-148'],
    ['episode-translations-147-140.js','data-vedator-episode-translations-147-140'],
    ['episode-translations-139-132.js','data-vedator-episode-translations-139-132'],
    ['episode-translations-131-124.js','data-vedator-episode-translations-131-124'],
    ['episode-translations-123-116.js','data-vedator-episode-translations-123-116'],
    ['episode-translations-115-108.js','data-vedator-episode-translations-115-108'],
    ['episode-translations-107-100.js','data-vedator-episode-translations-107-100'],
    ['episode-translations-99-92.js','data-vedator-episode-translations-99-92'],
    ['episode-translations-91-84.js','data-vedator-episode-translations-91-84'],
    ['episode-translations-83-76.js','data-vedator-episode-translations-83-76'],
    ['episode-translations-75-68.js','data-vedator-episode-translations-75-68'],
    ['episode-translations-67-60.js','data-vedator-episode-translations-67-60'],
    ['episode-translations-59-52.js','data-vedator-episode-translations-59-52'],
    ['episode-translations-51-44.js','data-vedator-episode-translations-51-44'],
    ['episode-translations-43-36.js','data-vedator-episode-translations-43-36'],
    ['episode-translations-35-28.js','data-vedator-episode-translations-35-28'],
    ['episode-translations-27-20.js','data-vedator-episode-translations-27-20'],
    ['episode-translations-19-12.js','data-vedator-episode-translations-19-12'],
    ['episode-translations-11-4.js','data-vedator-episode-translations-11-4'],
    ['episode-translations-3-1.js','data-vedator-episode-translations-3-1'],
    ['episode-translations-space-talks-1-7.js','data-vedator-episode-translations-space-talks-1-7'],
    ['episode-translations-space-talks-8-15.js','data-vedator-episode-translations-space-talks-8-15']
  ];

  const NONQUESTIONS_CACHE_KEY='vedatorNonQuestionsData:20260808-v1';
  const EXTRA_NONQUESTION_EPISODES=[334,335,338,339,341,342,344,345,347];
  const EXTRA_SUMMARY_DEPENDENCIES={
    334:[
      ['episode-334-summary-data-cs.js','data-vedator-episode-334-summary-data-cs'],
      ['episode-334-summary-data-sk.js','data-vedator-episode-334-summary-data-sk']
    ],
    335:[
      ['episode-335-summary-data-cs.js','data-vedator-episode-335-summary-data-cs'],
      ['episode-335-summary-data-sk.js','data-vedator-episode-335-summary-data-sk']
    ]
  };

  function mergeExtraEpisodesIntoNonQuestions(payload){
    if(!payload?.episodes||typeof payload.episodes!=='object')return false;
    let changed=false;
    for(const episode of EXTRA_NONQUESTION_EPISODES){
      const extra=window[`__vedatorEpisode${episode}SummaryData`];
      if(!extra)continue;
      payload.episodes[String(episode)]=extra;
      changed=true;
    }
    return changed;
  }

  function upgradeExtraNonQuestionsCache(){
    try{
      const saved=JSON.parse(localStorage.getItem(NONQUESTIONS_CACHE_KEY)||'null');
      if(saved?.version!=='20260808-v1'||!saved?.episodes)return;
      let changed=false;
      for(const episode of EXTRA_NONQUESTION_EPISODES){
        if(saved.episodes[String(episode)])continue;
        const extra=window[`__vedatorEpisode${episode}SummaryData`];
        if(!extra)continue;
        saved.episodes[String(episode)]=extra;
        changed=true;
      }
      if(changed)localStorage.setItem(NONQUESTIONS_CACHE_KEY,JSON.stringify(saved));
    }catch(_){}
  }

  function installExtraNonQuestionsBridge(){
    if(!window.__vedatorExtraNonQuestionsBridge){
      window.__vedatorExtraNonQuestionsBridge=true;
      window.addEventListener('vedatornonquestionsdataready',()=>{
        mergeExtraEpisodesIntoNonQuestions(window.__vedatorNonQuestionsDataPayload);
      });
    }
    mergeExtraEpisodesIntoNonQuestions(window.__vedatorNonQuestionsDataPayload);
    upgradeExtraNonQuestionsCache();
  }

  function installNonQuestionsUiOwnership(){
    const tabs=document.querySelector('.tabs');
    if(!tabs||tabs.__vedatorNonQuestionsUiOwnership)return false;
    const nonQuestionsTab=tabs.querySelector('.tab[data-view="nonquestions"]');
    const nonQuestionsTopics=document.querySelector('.nonquestions-topics');
    const episodeTopics=document.querySelector('#topics');
    const questionTopics=[...document.querySelectorAll('.panel .topics')].find(row=>
      row!==episodeTopics&&row!==nonQuestionsTopics
    );
    if(!nonQuestionsTab||!nonQuestionsTopics||!questionTopics)return false;
    tabs.__vedatorNonQuestionsUiOwnership=true;
    questionTopics.classList.add('question-topics');

    const syncTopicRows=()=>{
      const current=tabs.querySelector('.tab.active')?.dataset.view||'';
      episodeTopics?.classList.toggle('hidden',current!=='episodes');
      questionTopics.classList.toggle('hidden',current!=='questions');
      nonQuestionsTopics.classList.toggle('hidden',current!=='nonquestions');
    };

    tabs.addEventListener('click',()=>requestAnimationFrame(syncTopicRows));
    syncTopicRows();

    if(!document.querySelector('style[data-vedator-nonquestions-highlight-fix]')){
      const style=document.createElement('style');
      style.dataset.vedatorNonquestionsHighlightFix='1';
      style.textContent='#nonquestions mark{background:#ffe66b!important;color:inherit!important;border-radius:.28em;padding:.03em .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}html.theme-dark #nonquestions mark{background:#8a6d00!important;color:#fff4b3!important}';
      document.head.appendChild(style);
    }
    return true;
  }

  function prepareNonQuestionsEventPriority(){
    const search=document.querySelector('#search');
    if(!search||search.__vedatorNonQuestionsEventPriority)return;
    search.__vedatorNonQuestionsEventPriority=true;

    const nativeSearchAdd=search.addEventListener.bind(search);
    const nativeDocumentAdd=document.addEventListener.bind(document);
    let searchCaptured=false;
    let hideCaptured=false;

    const restore=()=>{
      if(!(searchCaptured&&hideCaptured))return;
      try{delete search.addEventListener}catch{}
      try{delete document.addEventListener}catch{}
      search.__vedatorNonQuestionsEventPriority='captured';
    };

    Object.defineProperty(search,'addEventListener',{
      configurable:true,
      writable:true,
      value:function(type,listener,options){
        let source='';
        try{if(typeof listener==='function')source=Function.prototype.toString.call(listener)}catch{}
        const capture=options===true||Boolean(options&&typeof options==='object'&&options.capture);
        const isNonQuestionsSearch=
          type==='input'&&capture&&
          source.includes('if(!active)return')&&
          source.includes('stopImmediatePropagation')&&
          source.includes('if(data)filter()');

        if(!isNonQuestionsSearch)return nativeSearchAdd(type,listener,options);

        nativeDocumentAdd('input',event=>{
          if(event.target!==search)return;
          listener.call(search,event);
        },true);
        searchCaptured=true;
        restore();
      }
    });

    Object.defineProperty(document,'addEventListener',{
      configurable:true,
      writable:true,
      value:function(type,listener,options){
        let source='';
        try{if(typeof listener==='function')source=Function.prototype.toString.call(listener)}catch{}
        const isNonQuestionsHide=
          type==='click'&&
          source.includes("closest?.('.tabs .tab')")&&
          source.includes('other&&other!==tab')&&
          source.includes('hide()');

        if(!isNonQuestionsHide)return nativeDocumentAdd(type,listener,options);

        nativeDocumentAdd('click',listener,true);
        hideCaptured=true;
        restore();
      }
    });
  }

  function loadNonQuestionsView(){
    if(window.__vedatorNonQuestionsView||document.querySelector('script[data-vedator-nonquestions-view]'))return;
    prepareNonQuestionsEventPriority();

    const tabs=document.querySelector('.tabs');
    let tabObserver=null;
    const finishUiInstall=()=>{
      if(!installNonQuestionsUiOwnership())return false;
      tabObserver?.disconnect();
      tabObserver=null;
      const search=document.querySelector('#search');
      if(search&&search.__vedatorNonQuestionsEventPriority!=='captured'){
        try{delete search.addEventListener}catch{}
        try{delete document.addEventListener}catch{}
      }
      return true;
    };
    if(tabs&&!finishUiInstall()){
      tabObserver=new MutationObserver(finishUiInstall);
      tabObserver.observe(tabs,{childList:true});
    }

    const script=document.createElement('script');
    script.src='./nonquestions-view.js?v=20260808-v2-search-topics';
    script.async=true;
    script.dataset.vedatorNonquestionsView='1';
    script.addEventListener('load',finishUiInstall,{once:true});
    script.addEventListener('error',()=>{
      tabObserver?.disconnect();
      const search=document.querySelector('#search');
      if(search){
        try{delete search.addEventListener}catch{}
        try{delete document.addEventListener}catch{}
      }
    },{once:true});
    document.head.appendChild(script);
  }

  async function ensureExtraSummaryData(episode){
    const dataKey=`__vedatorEpisode${episode}SummaryData`;
    if(window[dataKey])return;
    for(const [source,marker] of EXTRA_SUMMARY_DEPENDENCIES[episode]||[]){
      await loadScript(source,marker);
    }
    if(window[dataKey])return;
    return new Promise(resolve=>{
      const marker=`data-vedator-episode-${episode}-summary`;
      const existing=document.querySelector(`script[${marker}]`);
      const finish=()=>{installExtraNonQuestionsBridge();resolve()};
      if(existing){
        existing.addEventListener('load',finish,{once:true});
        existing.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,2500);
        return;
      }
      const script=document.createElement('script');
      script.src=`./episode-${episode}-summary.js?v=${VERSION}`;
      script.async=true;
      script.setAttribute(marker,'1');
      script.addEventListener('load',()=>{script.dataset.vedatorLoaded='1';finish()},{once:true});
      script.addEventListener('error',resolve,{once:true});
      document.head.appendChild(script);
      setTimeout(resolve,2500);
    });
  }

  async function bootstrapNonQuestions(){
    await Promise.all(EXTRA_NONQUESTION_EPISODES.map(ensureExtraSummaryData));
    installExtraNonQuestionsBridge();
    loadNonQuestionsView();
  }
  bootstrapNonQuestions();

  function waitForLanguageBatchController(timeout=8000){
    if(window.__vedatorLanguageBatchController)return Promise.resolve(true);
    return new Promise(resolve=>{
      const started=Date.now();
      const check=()=>{
        if(window.__vedatorLanguageBatchController){resolve(true);return}
        if(Date.now()-started>=timeout){resolve(false);return}
        setTimeout(check,50);
      };
      check();
    });
  }

  function loadScript(source,marker){
    return new Promise(resolve=>{
      const existing=document.querySelector(`script[${marker}]`);
      if(existing){
        if(existing.dataset.vedatorLoaded==='1'){resolve();return}
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,3000);return;
      }
      const script=document.createElement('script');
      script.src=`./${source}?v=${VERSION}`;
      script.async=false;
      script.setAttribute(marker,'1');
      script.addEventListener('load',()=>{script.dataset.vedatorLoaded='1';resolve()},{once:true});
      script.addEventListener('error',resolve,{once:true});
      document.head.appendChild(script);
    });
  }

  function finishWhenCatalogReady(){
    let attempts=0;
    const check=()=>{
      let dataReady=false;
      try{dataReady=Array.isArray(episodes)&&episodes.length>0}catch(_){}
      if(dataReady){
        window.__vedatorEpisodeTranslationsReady=true;
        window.dispatchEvent(new Event('vedatorepisodetranslationsready'));
        if(typeof render==='function')render();
        return;
      }
      attempts+=1;
      if(attempts<100)setTimeout(check,100);
    };
    check();
  }

  (async()=>{
    await waitForLanguageBatchController();
    for(const [source,marker] of SOURCES)await loadScript(source,marker);
    installExtraNonQuestionsBridge();
    finishWhenCatalogReady();
  })();
})();
