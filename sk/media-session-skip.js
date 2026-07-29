(()=>{
  if(window.__vedatorMediaSessionSkip)return;
  window.__vedatorMediaSessionSkip=true;
  if(!('mediaSession'in navigator))return;

  function install(){
    const audio=document.querySelector('.vedator-audio-card audio');
    if(!audio)return false;

    const seek=delta=>{
      const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Infinity;
      audio.currentTime=Math.max(0,Math.min(duration,audio.currentTime+delta));
    };

    try{navigator.mediaSession.setActionHandler('seekbackward',details=>seek(-(details.seekOffset||10)))}catch(error){}
    try{navigator.mediaSession.setActionHandler('seekforward',details=>seek(details.seekOffset||10))}catch(error){}
    try{navigator.mediaSession.setActionHandler('previoustrack',()=>seek(-10))}catch(error){}
    try{navigator.mediaSession.setActionHandler('nexttrack',()=>seek(10))}catch(error){}
    try{navigator.mediaSession.setActionHandler('seekto',details=>{
      if(typeof details.seekTime!=='number')return;
      const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Infinity;
      audio.currentTime=Math.max(0,Math.min(duration,details.seekTime));
    })}catch(error){}
    return true;
  }

  if(!install())new MutationObserver((_,observer)=>{if(install())observer.disconnect()}).observe(document.body,{childList:true,subtree:true});
})();