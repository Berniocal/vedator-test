(()=>{
  if(window.__vedatorEpisode257Chapters)return;window.__vedatorEpisode257Chapters=true;
  const CHAPTERS=[
    {seconds:84,title:'Obklopujú sa hviezdy okolo niečoho?'},
    {seconds:147,title:'Kto robí plány na podcastu?'},
    {seconds:225,title:'Keď sa dve častice stretnú takmer rýchlosťou svetla'},
    {seconds:320,title:'Diracova hypotéza veľkých čísel'},
    {seconds:518,title:'Je kvantový stav len naša nevedomosť?'},
    {seconds:650,title:'Prečo je niekedy vidieť Mesiac v deň'},
    {seconds:757,title:'Ako dokáže bunka vedieť, ktorý reťazec DNA číta'},
    {seconds:862,title:'Keď ľudstvo zmizne'},
    {seconds:1113,title:'Ako sa snažia o prácu, šport, čítanie a populárnosť'},
    {seconds:1263,title:'Dysonova sféra, guľový blesk, plocha Zeme'},
    {seconds:1328,title:'Aká je najvyššia teplota vzduchu?'},
    {seconds:1387,title:'Knižné tipy'}
  ];
  const episodeNumber=value=>Number(String(value||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0);
  const parseTime=value=>{const p=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);return!p?0:p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]};
  document.addEventListener('click',event=>{
    const block=event.target.closest('#episodes article .episode-summary .summary-block');if(!block)return;
    const article=block.closest('article');if(episodeNumber(article?.querySelector('h2')?.textContent)!==257)return;
    const play=article.querySelector('.links .primary'),time=parseTime(block.querySelector('.summary-time')?.textContent);if(!play)return;
    event.preventDefault();event.stopImmediatePropagation();
    window.__vedatorQuestionContext={items:CHAPTERS.map((x,i)=>({episode:257,time:x.seconds,end:CHAPTERS[i+1]?.seconds??Infinity})),index:Math.max(0,CHAPTERS.findIndex(x=>Math.abs(x.seconds-time)<2))};
    window.__vedatorRequestedStart={episode:257,time,createdAt:Date.now()};play.click();
  },true);
  setInterval(()=>{
    const card=document.querySelector('.vedator-audio-card'),title=card?.querySelector('.vedator-audio-card__title'),row=card?.querySelector('.vedator-question-controls');
    if(!row||!title)return;const active=episodeNumber(title.textContent)===257;row.classList.toggle('active',active||Boolean(window.__vedatorQuestionContext));
  },350);
})();