(()=>{
  if(window.__vedatorEpisode244Chapters)return;window.__vedatorEpisode244Chapters=true;
  const CHAPTERS=[
    {seconds:76,title:'Existujú rôzne nekonečne malé čísla?'},
    {seconds:235,title:'Na akú plochu sa dotýka dokonalá guľa dokonalého roviny?'},
    {seconds:307,title:'Ak sa lietadlo zmrzne v orientácii, poletí do vesmíru?'},
    {seconds:387,title:'Môžete fungovať v vzťahu k ezoterike?'},
    {seconds:569,title:'Ako by to vyzerala ak by sa na Mesiaci alebo vo vesmíre vybuchol atom?'},
    {seconds:761,title:'Bude anglický podcast?'},
    {seconds:848,title:'Rozdiel sa čierne diery podľa toho, ako vzniknú?'},
    {seconds:1008,title:'Sú rovnice v seriáli Veľká šplhajúca teória skutočné?'},
    {seconds:1071,title:'Môžeme poslať sondy do čiernej diery?'},
    {seconds:1178,title:'Kedy nájdeme mimozemské životy?'},
    {seconds:1322,title:'Prečo svetlo nemá hmotnosť, keď má energiu?'},
    {seconds:1435,title:'Kedy bude spoločný závod?'}
  ];
  function episodeNumber(value){return Number(String(value||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0)}
  function install(){
    const card=document.querySelector('.vedator-audio-card'),audio=card?.querySelector('audio'),title=card?.querySelector('.vedator-audio-card__title'),controls=card?.querySelector('.vedator-custom-controls');
    if(!card||!audio||!title||!controls||controls.querySelector('.vedator-244-controls'))return false;
    const row=document.createElement('div');row.className='vedátor-question-controls vedátor-244-controls';row.innerHTML='<button type="button" class="vedator-question-btn previous-question">← Predchádzajúca otázka</button><button type="button" class="vedator-question-btn next-question">Ďalšia otázka →</button>';controls.appendChild(row);
    const sync=()=>{const active=episodeNumber(title.textContent)===244;row.classList.toggle('active',active);if(!active)return;const t=audio.currentTime||0;row.querySelector('.previous-question').disabled=!CHAPTERS.some(x=>x.seconds<t-1);row.querySelector('.next-question').disabled=!CHAPTERS.some(x=>x.seconds>t+1)};
    row.querySelector('.previous-question').onclick=()=>{const t=audio.currentTime||0,a=CHAPTERS.filter(x=>x.seconds<t-1);if(a.length){audio.currentTime=a[a.length-1].seconds;audio.play().catch(()=>{})}};
    row.querySelector('.next-question').onclick=()=>{const t=audio.currentTime||0,n=CHAPTERS.find(x=>x.seconds>t+1);if(n){audio.currentTime=n.seconds;audio.play().catch(()=>{})}};
    audio.addEventListener('timeupdate',sync);new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});sync();return true;
  }
  if(!install())new MutationObserver((_,o)=>{if(install())o.disconnect()}).observe(document.body,{childList:true,subtree:true});
})();