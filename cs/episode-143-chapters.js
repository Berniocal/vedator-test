(()=>{
  if(window.__vedatorEpisode143Chapters)return;window.__vedatorEpisode143Chapters=true;
  const CHAPTERS=[108,233,368,489,578,711,786,946,1072,1209];
  const episodeNumber=value=>Number(String(value||'').match(/\b(?:podcast\s*)?(\d{2,4})\b/i)?.[1]||0);
  function install(){
    const card=document.querySelector('.vedator-audio-card'),audio=card?.querySelector('audio'),title=card?.querySelector('.vedator-audio-card__title'),row=card?.querySelector('.vedator-question-controls');
    if(!audio||!title||!row||row.dataset.episode143Bound)return false;
    row.dataset.episode143Bound='1';
    const sync=()=>{if(episodeNumber(title.textContent)!==143)return;const t=audio.currentTime||0;const previous=row.querySelector('.previous-question'),next=row.querySelector('.next-question');if(previous)previous.disabled=!CHAPTERS.some(x=>x<t-1);if(next)next.disabled=!CHAPTERS.some(x=>x>t+1)};
    row.addEventListener('click',event=>{if(episodeNumber(title.textContent)!==143)return;const button=event.target.closest('.vedator-question-btn');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const t=audio.currentTime||0;const target=button.classList.contains('previous-question')?[...CHAPTERS].reverse().find(x=>x<t-1):CHAPTERS.find(x=>x>t+1);if(Number.isFinite(target)){audio.currentTime=target;audio.play().catch(()=>{});sync()}},true);
    audio.addEventListener('timeupdate',sync);new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});sync();return true;
  }
  if(!install())new MutationObserver((_,o)=>{if(install())o.disconnect()}).observe(document.body,{childList:true,subtree:true});
})();