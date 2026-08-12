(()=>{
  if(window.__vedatorEpisode344SummaryInteractive)return;
  window.__vedatorEpisode344SummaryInteractive=true;

  const selector='.episode-summary[data-vedator-episode344-summary="1"]';

  function parseTime(value){
    const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
    if(!parts)return null;
    return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
  }

  function formatTime(value){
    const seconds=Math.max(0,Math.floor(Number(value)||0));
    const hours=Math.floor(seconds/3600);
    const minutes=Math.floor(seconds%3600/60);
    const rest=seconds%60;
    return hours
      ?`${hours}:${String(minutes).padStart(2,'0')}:${String(rest).padStart(2,'0')}`
      :`${minutes}:${String(rest).padStart(2,'0')}`;
  }

  function isSlovak(){
    try{return window.vedatorUiLanguage?.()==='sk'}catch{return document.documentElement.lang?.toLowerCase().startsWith('sk')}
  }

  function enhanceTime(node){
    if(!node?.matches?.('.summary-time')||!node.closest(selector))return;
    let seconds=parseTime(node.textContent);
    if(!Number.isFinite(seconds))return;

    const previousPreroll=Number(node.dataset.vedatorPreroll||0);
    if(previousPreroll>0){
      seconds+=previousPreroll;
      node.textContent=formatTime(seconds);
    }

    node.dataset.vedatorPreroll='0';
    node.dataset.vedatorEpisode344Seconds=String(seconds);
    node.setAttribute('role','button');
    node.tabIndex=0;
    node.style.cursor='pointer';
    node.title=isSlovak()?'Prehrať od tohto času':'Přehrát od tohoto času';
  }

  function enhance(root=document){
    if(root.matches?.(`${selector} .summary-time`))enhanceTime(root);
    root.querySelectorAll?.(`${selector} .summary-time`).forEach(enhanceTime);
    document.querySelectorAll(`${selector} .summary-note`).forEach(note=>{
      note.textContent=isSlovak()
        ?'Kliknutím na čas sa epizóda spustí priamo od daného miesta.'
        :'Kliknutím na čas se epizoda spustí přímo od daného místa.';
    });
  }

  function playFrom(node,event){
    const details=node.closest(selector);
    const article=details?.closest('article');
    const play=article?.querySelector('.links .primary');
    const seconds=Number(node.dataset.vedatorEpisode344Seconds);
    if(!play||!Number.isFinite(seconds))return;

    event?.preventDefault();
    event?.stopPropagation();
    window.__vedatorQuestionContext=null;
    window.__vedatorRequestedStart={episode:344,time:seconds,createdAt:Date.now()};
    play.click();
  }

  document.addEventListener('click',event=>{
    const node=event.target.closest?.(`${selector} .summary-time`);
    if(node)playFrom(node,event);
  });

  document.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const node=event.target.closest?.(`${selector} .summary-time`);
    if(!node)return;
    playFrom(node,event);
  });

  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType===1)enhance(node);
      }
    }
  }).observe(document.body,{childList:true,subtree:true});

  window.addEventListener('vedatorlanguagechange',()=>queueMicrotask(()=>enhance(document)));
  enhance(document);
})();
