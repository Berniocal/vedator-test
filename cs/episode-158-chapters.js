(()=>{
  if(window.__vedatorEpisode158Chapters)return;window.__vedatorEpisode158Chapters=true;
  const CHAPTERS=[55,77,134,235,325,418,501,566,614,665,715,881,975,1057,1149,1324,1421,1538,1883,1991,2162,2264,2351,2394,2500,2614,2847,2886,2965,3015,3042,3088,3211,3251,3310,3355,3408,3469,3596,3682,3796,3909,3967,4065,4259,4327,4481,4539,4663,4706,4796,4986,5052,5131,5190,5265,5317,5511,5582,5637,5683,5746,5804,5963,6025,6086,6401,6539,6690,6725,6852,6966,7042];
  const episodeNumber=value=>Number(String(value||'').match(/\b(?:podcast\s*)?(\d{2,4})\b/i)?.[1]||0);
  function install(){
    const card=document.querySelector('.vedator-audio-card'),audio=card?.querySelector('audio'),title=card?.querySelector('.vedator-audio-card__title'),row=card?.querySelector('.vedator-question-controls');
    if(!audio||!title||!row||row.dataset.episode158Bound)return false;
    row.dataset.episode158Bound='1';
    const sync=()=>{if(episodeNumber(title.textContent)!==158)return;const t=audio.currentTime||0;const previous=row.querySelector('.previous-question'),next=row.querySelector('.next-question');if(previous)previous.disabled=!CHAPTERS.some(x=>x<t-1);if(next)next.disabled=!CHAPTERS.some(x=>x>t+1)};
    row.addEventListener('click',event=>{if(episodeNumber(title.textContent)!==158)return;const button=event.target.closest('.vedator-question-btn');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const t=audio.currentTime||0;const target=button.classList.contains('previous-question')?[...CHAPTERS].reverse().find(x=>x<t-1):CHAPTERS.find(x=>x>t+1);if(Number.isFinite(target)){audio.currentTime=target;audio.play().catch(()=>{});sync()}},true);
    audio.addEventListener('timeupdate',sync);new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});sync();return true;
  }
  if(!install())new MutationObserver((_,o)=>{if(install())o.disconnect()}).observe(document.body,{childList:true,subtree:true});
})();