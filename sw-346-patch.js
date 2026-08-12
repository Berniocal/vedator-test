(()=>{
  if(self.__vedatorEpisode346FetchPatch)return;
  self.__vedatorEpisode346FetchPatch=true;

  const nativeFetch=self.fetch.bind(self);
  const JS_TARGETS=new Set([
    'questions-view.js',
    'playlist-patch.js',
    'questions-performance-cache.js',
    'first-load-recovery.js',
    'question-controls-stability.js',
    'episode-translations-loader.js'
  ]);

  function addNumbers(source,numbers,prepend=false){
    const values=source.split(',').map(value=>value.trim()).filter(Boolean);
    for(const number of numbers){
      if(values.includes(String(number)))continue;
      if(prepend)values.unshift(String(number));
      else values.push(String(number));
    }
    return values.join(',');
  }

  function responseFrom(response,body,contentType){
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    if(contentType)headers.set('content-type',contentType);
    return new Response(body,{
      status:response.status,
      statusText:response.statusText,
      headers
    });
  }

  function patchQuestionsView(code){
    code=code.replace(/const FAQ=\[([^\]]*)\]/,(_,items)=>`const FAQ=[${addNumbers(items,[346],true)}]`);
    code=code.replace(/TOTAL_QUESTIONS=719\b/g,'TOTAL_QUESTIONS=734');
    code=code.replace("'kryptom']", "'kryptom','fuz','fúz','iter','supravod','vytah','výťah','plachetn']");
    code=code.replace("'atmosfer']", "'atmosfer','vitr','vítr','vietor']");
    return code;
  }

  function patchPlaylist(code){
    code=code.replace(/const FAQ=\[([^\]]*)\]/,(_,items)=>{
      const final=addNumbers(items,[17,26,35,51,60,69,75,138,346]);
      return `const FAQ=[${final}]`;
    });
    return code;
  }

  function patchQuestionCache(code){
    code=code.replace(/const FAQ=\[([^\]]*)\]/,(_,items)=>`const FAQ=[${addNumbers(items,[346],true)}]`);
    code=code.replace(/const CONCURRENCY=6\b/,'const CONCURRENCY=1');
    code=code.replace("requestIdleCallback(start,{timeout:350})","requestIdleCallback(start,{timeout:1800})");
    code=code.replace('else setTimeout(start,180);','else setTimeout(start,900);');
    code=code.replace(
      "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleWarm(),{once:true});\n  else scheduleWarm();",
      "if(document.readyState==='complete')scheduleWarm();\n  else window.addEventListener('load',()=>scheduleWarm(),{once:true});"
    );
    return code;
  }

  function patchEpisodeTranslationsLoader(code){
    const original=`async function bootstrapNonQuestions(){
    await Promise.all(EXTRA_NONQUESTION_EPISODES.map(ensureExtraSummaryData));
    installExtraNonQuestionsBridge();
    loadNonQuestionsView();
  }
  bootstrapNonQuestions();`;
    const replacement=`function bootstrapNonQuestions(){
    loadNonQuestionsView();
    void Promise.all(EXTRA_NONQUESTION_EPISODES.map(ensureExtraSummaryData)).then(()=>{
      installExtraNonQuestionsBridge();
    }).catch(()=>{});
  }
  bootstrapNonQuestions();`;
    return code.replace(original,replacement);
  }

  function patchFirstLoad(code){
    const bootstrapVersion=String(self.__vedatorBootstrapVersion||self.__vedatorSwWrapperVersion||'current');
    const bootstrapKey=`vedator-bootstrap-${bootstrapVersion}`;
    code=code.replace(/const FAQ=new Set\(\[([^\]]*)\]\)/,(_,items)=>`const FAQ=new Set([${addNumbers(items,[346],true)}])`);
    code=code.replace(
      "const RETRY_KEY='vedator-first-load-recovery-v3';",
      `const RETRY_KEY='vedator-first-load-recovery-v3';\n  const BOOTSTRAP_KEY=${JSON.stringify(bootstrapKey)};`
    );
    code=code.replace(
      'async function recover(){',
      "async function recover(){\n    try{if(localStorage.getItem(BOOTSTRAP_KEY)==='1'){sessionStorage.removeItem(RETRY_KEY);return}}catch{}"
    );
    code=code.replace(
      "if(hasEnhancedUi()){\n      sessionStorage.removeItem(RETRY_KEY);",
      "if(hasEnhancedUi()){\n      try{localStorage.setItem(BOOTSTRAP_KEY,'1')}catch{}\n      sessionStorage.removeItem(RETRY_KEY);"
    );
    code=code.replace(
      "if(enhancementsAreQueued()&&await waitForEnhancedUi()){\n      sessionStorage.removeItem(RETRY_KEY);",
      "if(enhancementsAreQueued()&&await waitForEnhancedUi()){\n      try{localStorage.setItem(BOOTSTRAP_KEY,'1')}catch{}\n      sessionStorage.removeItem(RETRY_KEY);"
    );
    code=code.replace(
      '    location.replace(location.href);',
      "    try{localStorage.setItem(BOOTSTRAP_KEY,'1')}catch{}\n    location.replace(location.href);"
    );
    return code;
  }

  function patchQuestionControls(code){
    return code.replace(/const FAQ_EPISODES=new Set\(\[([^\]]*)\]\)/,(_,items)=>`const FAQ_EPISODES=new Set([${addNumbers(items,[346],true)}])`);
  }

  async function patchResponse(response,url){
    if(!response)return response;
    const contentType=response.headers.get('content-type')||'';
    const name=url.pathname.split('/').pop();

    if(contentType.includes('text/html')){
      let html=await response.text();
      if(!html.includes('startup-fast.js')){
        html=html.replace('</head>','<script src="./startup-fast.js?v=20260812-1"></script></head>');
      }
      if(!html.includes('episode-346-summary.js')){
        html=html.replace('</body>','<script src="./episode-346-summary.js" defer></script></body>');
      }
      return responseFrom(response,html,'text/html; charset=utf-8');
    }

    if(!JS_TARGETS.has(name))return response;
    let code=await response.text();
    if(name==='questions-view.js')code=patchQuestionsView(code);
    else if(name==='playlist-patch.js')code=patchPlaylist(code);
    else if(name==='questions-performance-cache.js')code=patchQuestionCache(code);
    else if(name==='episode-translations-loader.js')code=patchEpisodeTranslationsLoader(code);
    else if(name==='first-load-recovery.js')code=patchFirstLoad(code);
    else if(name==='question-controls-stability.js')code=patchQuestionControls(code);
    return responseFrom(response,code,'application/javascript; charset=utf-8');
  }

  self.fetch=async function(input,init){
    const response=await nativeFetch(input,init);
    try{
      const raw=typeof input==='string'?input:input?.url;
      const url=new URL(raw,self.location.href);
      if(url.origin!==self.location.origin)return response;
      return await patchResponse(response,url);
    }catch{
      return response;
    }
  };
})();