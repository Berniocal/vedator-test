(()=>{
  if(window.__vedatorEpisode179Chapters)return;window.__vedatorEpisode179Chapters=true;
  const CHAPTERS=[105,273,389,549,707,878,1060,1146,1296,1436,1556,1677];
  const episodeNumber=value=>Number(String(value||'').match(/\b(?:podcast\s*)?(\d{2,4})\b/i)?.[1]||0);
  function install(){
    const card=document.querySelector('.vedator-audio-card'),audio=card?.querySelector('audio'),title=card?.querySelector('.vedator-audio-card__title'),row=card?.querySelector('.vedator-question-controls');
    if(!audio||!title||!row||row.dataset.episode179Bound)return false;
    row.dataset.episode179Bound='1';
    const sync=()=>{if(episodeNumber(title.textContent)!==179)return;const t=audio.currentTime||0;const previous=row.querySelector('.previous-question'),next=row.querySelector('.next-question');if(previous)previous.disabled=!CHAPTERS.some(x=>x<t-1);if(next)next.disabled=!CHAPTERS.some(x=>x>t+1)};
    row.addEventListener('click',event=>{if(episodeNumber(title.textContent)!==179)return;const button=event.target.closest('.vedator-question-btn');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const t=audio.currentTime||0;const target=button.classList.contains('previous-question')?[...CHAPTERS].reverse().find(x=>x<t-1):CHAPTERS.find(x=>x>t+1);if(Number.isFinite(target)){audio.currentTime=target;audio.play().catch(()=>{});sync()}},true);
    audio.addEventListener('timeupdate',sync);new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});sync();return true;
  }
  if(!install())new MutationObserver((_,o)=>{if(install())o.disconnect()}).observe(document.body,{childList:true,subtree:true});
})();