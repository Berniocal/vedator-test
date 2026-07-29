(()=>{
  if(window.__vedatorEpisode248Chapters)return;window.__vedatorEpisode248Chapters=true;
  const CHAPTERS=[
    {seconds:104,title:'Platí E = mc² pro tmavou hmotu a energii?'},
    {seconds:200,title:'Jak fotony přenášejí informaci'},
    {seconds:342,title:'Jaký pohon má sonda Voyager'},
    {seconds:506,title:'Jak se měří extrémní teplota částic v CERNu'},
    {seconds:595,title:'Pinokiův paradox: Můj nos teď naroste'},
    {seconds:726,title:'Co je uvnitř černé díry a proč se vyparuje'},
    {seconds:934,title:'Může být rozpínání vesmíru optický klam?'},
    {seconds:1195,title:'Důsledky nových objevů v kvantové mechanice'},
    {seconds:1322,title:'Zabije blesk v moři všechny ryby?'},
    {seconds:1468,title:'Proč se rohlík vždy převrátí blbou stranou'},
    {seconds:1587,title:'Můžu jít na Matfyz z obchodky?'},
    {seconds:1889,title:'Co si myslí o Big Bang Theory'},
    {seconds:2222,title:'Proč planety neblikají jako hvězdy'},
    {seconds:2309,title:'Proč kýchneme, když se podíváme do Slunce'}
  ];
  const episodeNumber=value=>Number(String(value||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0);
  const parseTime=value=>{const p=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0]?.split(':').map(Number);return!p?null:p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]};
  document.addEventListener('click',event=>{const block=event.target.closest('#episodes article .episode-summary .summary-block');if(!block)return;const article=block.closest('article');if(episodeNumber(article?.querySelector('h2')?.textContent)!==248)return;const seconds=parseTime(block.querySelector('.summary-time')?.textContent);const play=article.querySelector('.links .primary');if(!Number.isFinite(seconds)||!play)return;event.preventDefault();event.stopPropagation();window.__vedatorRequestedStart={episode:248,time:seconds,createdAt:Date.now()};play.click()},true);
  function install(){const card=document.querySelector('.vedator-audio-card'),audio=card?.querySelector('audio'),title=card?.querySelector('.vedator-audio-card__title'),row=card?.querySelector('.vedator-question-controls');if(!audio||!title||!row)return;const sync=()=>{if(episodeNumber(title.textContent)!==248)return;row.classList.add('active');const current=audio.currentTime||0;const previous=row.querySelector('.previous-question'),next=row.querySelector('.next-question');if(previous)previous.disabled=!CHAPTERS.some(x=>x.seconds<current-1);if(next)next.disabled=!CHAPTERS.some(x=>x.seconds>current+1)};row.addEventListener('click',event=>{if(episodeNumber(title.textContent)!==248)return;const button=event.target.closest('.vedator-question-btn');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const current=audio.currentTime||0;const target=button.classList.contains('previous-question')?[...CHAPTERS].reverse().find(x=>x.seconds<current-1):CHAPTERS.find(x=>x.seconds>current+1);if(target){audio.currentTime=target.seconds;audio.play().catch(()=>{});sync()}},true);audio.addEventListener('timeupdate',sync);new MutationObserver(sync).observe(title,{childList:true,subtree:true});sync()}
  if(!document.querySelector('.vedator-audio-card'))new MutationObserver((_,o)=>{if(document.querySelector('.vedator-audio-card')){install();o.disconnect()}}).observe(document.body,{childList:true,subtree:true});else install();
})();