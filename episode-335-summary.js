(()=>{
  if(window.__vedatorEpisode335Summary)return;
  window.__vedatorEpisode335Summary=true;

  const DATA={
    cs:window.__vedatorEpisode335SummaryCS||[],
    sk:window.__vedatorEpisode335SummarySK||[]
  };
  window.__vedatorEpisode335SummaryData=DATA;

  const normalizeLanguage=value=>{
    const lang=String(value||'').trim().toLowerCase();
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
      const stored=localStorage.getItem('vedator-ui-language-v1')
        ||localStorage.getItem('vedator-ui-language')
        ||localStorage.getItem('vedator-language');
      return normalizeLanguage(stored)||'cs';
    }catch(_){return 'cs'}
  };

  function isEpisode335(article){
    return /\b(?:vedátorský\s+)?podcast\s+335\b/i.test(article?.querySelector('h2')?.textContent||'');
  }

  function renderSummary(article){
    if(!isEpisode335(article))return;
    const lang=language();
    const items=DATA[lang]||DATA.cs;
    let details=article.querySelector('.episode-summary[data-vedator-episode335-summary="1"]');
    if(!details){
      if(article.querySelector('.episode-summary'))return;
      details=document.createElement('details');
      details.className='episode-summary';
      details.dataset.vedatorEpisode335Summary='1';
      const summary=document.createElement('summary');
      const body=document.createElement('div');
      body.className='episode-summary-body';
      details.append(summary,body);
      article.appendChild(details);
    }

    const summary=details.querySelector(':scope > summary');
    const body=details.querySelector(':scope > .episode-summary-body');
    if(!summary||!body)return;

    summary.textContent=lang==='sk'?'Zhrnutie dielu':'Shrnutí dílu';
    body.replaceChildren();

    for(const item of items){
      const block=document.createElement('div');
      block.className='summary-block';

      const time=document.createElement('div');
      time.className='summary-time';
      time.textContent=item.time;

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

    const note=document.createElement('div');
    note.className='summary-note';
    note.textContent=lang==='sk'
      ?'Časy označujú približný začiatok tematického bloku v podcaste.'
      :'Časy označují přibližný začátek tematického bloku v podcastu.';
    body.appendChild(note);
  }

  function installAll(root=document){
    if(root.matches?.('#episodes article'))renderSummary(root);
    root.querySelectorAll?.('#episodes article').forEach(renderSummary);
  }

  const episodes=document.querySelector('#episodes');
  if(episodes){
    installAll(episodes);
    new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType===1)installAll(node);
        }
      }
    }).observe(episodes,{childList:true,subtree:true});
  }

  window.addEventListener('vedatorlanguagechange',()=>{
    document.querySelectorAll('#episodes article').forEach(renderSummary);
  });
})();
