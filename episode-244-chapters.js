(()=>{
  if(window.__vedatorEpisode244Chapters)return;window.__vedatorEpisode244Chapters=true;
  const CHAPTERS=[
    {seconds:76,title:'Existují různá „nekonečně malá“ čísla?'},
    {seconds:235,title:'Jakou plochou se dotýká dokonalá koule dokonalé roviny?'},
    {seconds:307,title:'Kdyby letadlo zamrzlo v orientaci, vyletí do vesmíru?'},
    {seconds:387,title:'Můžete fungovat ve vztahu s ezoterikem?'},
    {seconds:569,title:'Jak by vypadal atomový výbuch na Měsíci nebo ve vesmíru?'},
    {seconds:761,title:'Bude anglická verze podcastu?'},
    {seconds:848,title:'Liší se černé díry podle toho, jak vzniknou?'},
    {seconds:1008,title:'Jsou rovnice v seriálu Teorie velkého třesku skutečné?'},
    {seconds:1071,title:'Můžeme poslat sondu do černé díry?'},
    {seconds:1178,title:'Kdy najdeme mimozemský život?'},
    {seconds:1322,title:'Proč světlo nemá hmotnost, když má energii?'},
    {seconds:1435,title:'Kdy bude společný běh?'}
  ];
  function episodeNumber(value){return Number(String(value||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0)}
  function install(){
    const card=document.querySelector('.vedator-audio-card'),audio=card?.querySelector('audio'),title=card?.querySelector('.vedator-audio-card__title'),controls=card?.querySelector('.vedator-custom-controls');
    if(!card||!audio||!title||!controls||controls.querySelector('.vedator-244-controls'))return false;
    const row=document.createElement('div');row.className='vedator-question-controls vedator-244-controls';row.innerHTML='<button type="button" class="vedator-question-btn previous-question">← Předchozí otázka</button><button type="button" class="vedator-question-btn next-question">Další otázka →</button>';controls.appendChild(row);
    const sync=()=>{const active=episodeNumber(title.textContent)===244;row.classList.toggle('active',active);if(!active)return;const t=audio.currentTime||0;row.querySelector('.previous-question').disabled=!CHAPTERS.some(x=>x.seconds<t-1);row.querySelector('.next-question').disabled=!CHAPTERS.some(x=>x.seconds>t+1)};
    row.querySelector('.previous-question').onclick=()=>{const t=audio.currentTime||0,a=CHAPTERS.filter(x=>x.seconds<t-1);if(a.length){audio.currentTime=a[a.length-1].seconds;audio.play().catch(()=>{})}};
    row.querySelector('.next-question').onclick=()=>{const t=audio.currentTime||0,n=CHAPTERS.find(x=>x.seconds>t+1);if(n){audio.currentTime=n.seconds;audio.play().catch(()=>{})}};
    audio.addEventListener('timeupdate',sync);new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});sync();return true;
  }
  if(!install())new MutationObserver((_,o)=>{if(install())o.disconnect()}).observe(document.body,{childList:true,subtree:true});
})();