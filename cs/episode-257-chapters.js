(()=>{
  if(window.__vedatorEpisode257Chapters)return;window.__vedatorEpisode257Chapters=true;
  const CHAPTERS=[
    {seconds:84,title:'Točí se hvězdy kolem něčeho?'},
    {seconds:147,title:'Kdo dělá grafiku k podcastu?'},
    {seconds:225,title:'Když se srazí dvě částice téměř rychlostí světla'},
    {seconds:320,title:'Diracova hypotéza velkých čísel'},
    {seconds:518,title:'Je kvantový stav jen naše neznalost?'},
    {seconds:650,title:'Proč je někdy vidět Měsíc ve dne'},
    {seconds:757,title:'Jak buňka ví, který řetězec DNA má číst'},
    {seconds:862,title:'Kdy zanikne lidstvo'},
    {seconds:1113,title:'Jak stíhají práci, sport, čtení a popularizaci'},
    {seconds:1263,title:'Nápady na epizody: Dysonova sféra, guľový blesk, plocha Země'},
    {seconds:1328,title:'Jaká je nejvyšší teplota vzduchu'},
    {seconds:1387,title:'Knižní tipy'}
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