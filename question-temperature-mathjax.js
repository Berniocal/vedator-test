(()=>{
  if(window.__vedatorQuestionTemperatureMathJax)return;
  window.__vedatorQuestionTemperatureMathJax=true;

  const ITEMS=[
    {
      cs:'Když je dnes (0,^) a zítra má být dvakrát tepleji, kolik bude?',
      sk:'Keď je dnes (0,^) a zajtra má byť dvakrát teplejšie, koľko bude?',
      csMath:'Když je dnes \\(0\\,^{\\circ}\\mathrm{C}\\) a zítra má být dvakrát tepleji, kolik bude?',
      skMath:'Keď je dnes \\(0\\,^{\\circ}\\mathrm{C}\\) a zajtra má byť dvakrát teplejšie, koľko bude?'
    },
    {
      cs:'V absolutní stupnici je (0,^=273{,}15,), takže dvojnásobná teplota by byla (546{,}3,), tedy asi (273,^).',
      sk:'V absolútnej stupnici je (0,^=273{,}15,), takže dvojnásobná teplota by bola (546{,}3,), teda približne (273,^).',
      csMath:'V absolutní stupnici je \\(0\\,^{\\circ}\\mathrm{C}=273{,}15\\,\\mathrm{K}\\), takže dvojnásobná teplota by byla \\(546{,}3\\,\\mathrm{K}\\), tedy asi \\(273\\,^{\\circ}\\mathrm{C}\\).',
      skMath:'V absolútnej stupnici je \\(0\\,^{\\circ}\\mathrm{C}=273{,}15\\,\\mathrm{K}\\), takže dvojnásobná teplota by bola \\(546{,}3\\,\\mathrm{K}\\), teda približne \\(273\\,^{\\circ}\\mathrm{C}\\).'
    },
    {
      cs:'Jde o nejnižší možnou termodynamickou teplotu, (0,).',
      sk:'Ide o najnižšiu možnú termodynamickú teplotu, (0,).',
      csMath:'Jde o nejnižší možnou termodynamickou teplotu, \\(0\\,\\mathrm{K}\\).',
      skMath:'Ide o najnižšiu možnú termodynamickú teplotu, \\(0\\,\\mathrm{K}\\).'
    },
    {
      cs:'Odpovídá hodnotě (-273{,}15,^), ale přibližně (-459{,}67,^), takže ve Fahrenheitově stupnici mohou existovat teploty pod (-300^).',
      sk:'Zodpovedá hodnote (-273{,}15,^), ale približne (-459{,}67,^), takže vo Fahrenheitovej stupnici môžu existovať teploty pod (-300^).',
      csMath:'Odpovídá hodnotě \\(-273{,}15\\,^{\\circ}\\mathrm{C}\\), ve Fahrenheitově stupnici přibližně \\(-459{,}67\\,^{\\circ}\\mathrm{F}\\), takže v ní mohou existovat teploty pod \\(-300\\,^{\\circ}\\mathrm{F}\\).',
      skMath:'Zodpovedá hodnote \\(-273{,}15\\,^{\\circ}\\mathrm{C}\\), vo Fahrenheitovej stupnici približne \\(-459{,}67\\,^{\\circ}\\mathrm{F}\\), takže v nej môžu existovať teploty pod \\(-300\\,^{\\circ}\\mathrm{F}\\).'
    }
  ];

  const selector='.faq-question-card h2, .faq-question-card li, .summary-title, .episode-summary li';
  const normalize=value=>String(value||'').replace(/\s+/g,' ').trim();
  const plain=new Map();
  ITEMS.forEach((item,index)=>{
    plain.set(normalize(item.cs),index);
    plain.set(normalize(item.sk),index);
  });

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

  const style=document.createElement('style');
  style.textContent='.faq-question-card mjx-container[jax="CHTML"],.episode-summary mjx-container[jax="CHTML"]{font-size:1em!important;margin:0 .06em!important;color:inherit}';
  document.head.append(style);

  let mathJaxPromise=null,renderScheduled=false,scanScheduled=false;
  const pending=new Set();
  function ensureMathJax(){
    if(window.MathJax?.typesetPromise)return Promise.resolve(window.MathJax);
    if(mathJaxPromise)return mathJaxPromise;
    const existing=document.querySelector('script[data-vedator-mathjax]');
    if(existing){
      mathJaxPromise=new Promise((resolve,reject)=>{
        if(window.MathJax?.typesetPromise){resolve(window.MathJax);return}
        existing.addEventListener('load',()=>resolve(window.MathJax),{once:true});
        existing.addEventListener('error',reject,{once:true});
      });
      return mathJaxPromise;
    }
    window.MathJax={tex:{inlineMath:[['\\(','\\)']],processEscapes:true},options:{skipHtmlTags:['script','noscript','style','textarea','pre','code']}};
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async=true;
    script.dataset.vedatorMathjax='1';
    mathJaxPromise=new Promise((resolve,reject)=>{
      script.addEventListener('load',()=>resolve(window.MathJax),{once:true});
      script.addEventListener('error',reject,{once:true});
    });
    document.head.append(script);
    return mathJaxPromise;
  }
  function queueTypeset(element){
    pending.add(element);
    if(renderScheduled)return;
    renderScheduled=true;
    requestAnimationFrame(async()=>{
      renderScheduled=false;
      const nodes=[...pending].filter(node=>node.isConnected);
      pending.clear();
      if(!nodes.length)return;
      try{
        await ensureMathJax();
        await window.MathJax.typesetPromise(nodes);
      }catch(_){}
    });
  }
  function render(element,index,targetLanguage){
    const item=ITEMS[index];
    if(!item)return;
    const prefix=element.dataset.vedatorTemperatureMathPrefix||'';
    const next=prefix+(targetLanguage==='sk'?item.skMath:item.csMath);
    try{window.MathJax?.typesetClear?.([element])}catch(_){}
    element.dataset.vedatorTemperatureMath=String(index);
    if(element.textContent!==next)element.textContent=next;
    queueTypeset(element);
  }
  function scan(force=false){
    const targetLanguage=language();
    document.querySelectorAll(selector).forEach(element=>{
      const marked=element.dataset.vedatorTemperatureMath;
      if(marked!==undefined){
        if(force)render(element,Number(marked),targetLanguage);
        return;
      }
      const raw=element.textContent||'';
      const prefix=/^\s*Otázka:\s*/i.exec(raw);
      const body=normalize(prefix?raw.slice(prefix[0].length):raw);
      const index=plain.get(body);
      if(index===undefined)return;
      element.dataset.vedatorTemperatureMathPrefix=prefix?.[0]||'';
      render(element,index,targetLanguage);
    });
  }
  function scheduleScan(force=false){
    if(force){requestAnimationFrame(()=>scan(true));return}
    if(scanScheduled)return;
    scanScheduled=true;
    requestAnimationFrame(()=>{scanScheduled=false;scan(false)});
  }

  scan(false);
  const contentRoot=document.querySelector('main')||document.documentElement;
  new MutationObserver(records=>{
    if(records.some(record=>record.addedNodes.length||record.type==='characterData'))scheduleScan(false);
  }).observe(contentRoot,{childList:true,subtree:true,characterData:true});
  window.addEventListener('vedatorlanguagechange',()=>scheduleScan(true));
})();

(()=>{
  if(window.__vedatorViewStability)return;
  window.__vedatorViewStability=true;

  const tabs=document.querySelector('.tabs');
  const search=document.querySelector('#search');
  if(!tabs)return;

  let scheduled=false;
  const activeView=()=>tabs.querySelector('.tab.active')?.dataset.view||window.__vedatorActiveView||'episodes';

  function sync(){
    scheduled=false;
    const current=activeView();
    window.__vedatorActiveView=current;

    const episodes=document.querySelector('#episodes');
    const series=document.querySelector('#series');
    const questions=document.querySelector('#questions');
    const playlists=document.querySelector('.vedator-playlist-view');
    const data=document.querySelector('.vedator-data-view');
    const topics=document.querySelector('#topics');
    const questionTopics=[...document.querySelectorAll('.topics')].find(node=>node!==topics);
    const episodeSort=document.querySelector('#episodeSort');
    const seriesSort=document.querySelector('#seriesSort');
    const questionSort=document.querySelector('#questionSort');

    episodes?.classList.toggle('hidden',current!=='episodes');
    series?.classList.toggle('hidden',current!=='series');
    questions?.classList.toggle('hidden',current!=='questions');
    playlists?.classList.toggle('active',current==='playlists');
    data?.classList.toggle('active',current==='data');
    topics?.classList.toggle('hidden',current!=='episodes');
    questionTopics?.classList.toggle('hidden',current!=='questions');
    episodeSort?.classList.toggle('hidden',current!=='episodes');
    seriesSort?.classList.toggle('hidden',current!=='series');
    questionSort?.classList.toggle('hidden',current!=='questions');
  }

  function scheduleSync(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(sync);
  }

  tabs.addEventListener('click',event=>{
    const tab=event.target.closest('.tab');
    if(!tab)return;
    window.__vedatorActiveView=tab.dataset.view||'episodes';
    queueMicrotask(sync);
    requestAnimationFrame(sync);
  },true);

  new MutationObserver(scheduleSync).observe(tabs,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

  const viewObserver=new MutationObserver(()=>{
    const current=activeView();
    const visibleWrong=
      (current!=='episodes'&&!document.querySelector('#episodes')?.classList.contains('hidden'))||
      (current!=='series'&&!document.querySelector('#series')?.classList.contains('hidden'))||
      (current!=='questions'&&!document.querySelector('#questions')?.classList.contains('hidden'))||
      (current!=='playlists'&&document.querySelector('.vedator-playlist-view')?.classList.contains('active'))||
      (current!=='data'&&document.querySelector('.vedator-data-view')?.classList.contains('active'));
    if(visibleWrong)scheduleSync();
  });

  function observeViews(){
    for(const node of [document.querySelector('#episodes'),document.querySelector('#series'),document.querySelector('#questions'),document.querySelector('.vedator-playlist-view'),document.querySelector('.vedator-data-view')]){
      if(node&&node.dataset.vedatorViewObserved!=='1'){
        node.dataset.vedatorViewObserved='1';
        viewObserver.observe(node,{attributes:true,attributeFilter:['class']});
      }
    }
  }

  new MutationObserver(()=>{observeViews();scheduleSync()}).observe(tabs.parentElement||tabs,{childList:true,subtree:true});

  if(search){
    search.addEventListener('input',event=>{
      const current=activeView();
      if(current==='episodes'||current==='questions')return;
      event.stopImmediatePropagation();
    },true);
    search.addEventListener('compositionend',event=>{
      if(activeView()==='episodes')return;
      event.stopImmediatePropagation();
    },true);
  }

  observeViews();
  sync();
})();
