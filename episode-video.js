/*
 * Vedátor – YouTube toggle matching the MP3 player for early episodes.
 * YouTube IFrame API is loaded only after a user clicks Video. Audio and
 * video are mutually exclusive and switching keeps the playback position.
 */
(()=>{
  'use strict';
  if(window.__vedatorEpisodeVideoV1)return;
  window.__vedatorEpisodeVideoV1=true;
  const VIDEO_IDS={1:'P_QuPTRbtc8',2:'QY9pL56nmsA'};
  const VIDEO_MODE_KEY='vedatorYoutubeEnabledV1';
  let preference=false;
  try{preference=localStorage.getItem(VIDEO_MODE_KEY)==='1'}catch(_){}
  let apiPromise=null,controller=null;

  function loadApi(){
    if(window.YT?.Player)return Promise.resolve(window.YT);
    if(apiPromise)return apiPromise;
    apiPromise=new Promise((resolve,reject)=>{
      const previous=window.onYouTubeIframeAPIReady;
      let settled=false;
      const timeout=setTimeout(()=>{if(!settled){settled=true;reject(new Error('YouTube API není dostupné'))}},15000);
      window.onYouTubeIframeAPIReady=()=>{
        try{if(typeof previous==='function')previous()}catch(_){}
        if(!settled){settled=true;clearTimeout(timeout);resolve(window.YT)}
      };
      if(!document.querySelector('script[src*="youtube.com/iframe_api"]')){
        const script=document.createElement('script');
        script.src='https://www.youtube.com/iframe_api';
        script.async=true;script.onerror=()=>{if(!settled){settled=true;clearTimeout(timeout);reject(new Error('Nepodařilo se načíst YouTube API'))}};
        document.head.appendChild(script);
      }
    });
    return apiPromise;
  }

  function playerFor(root,audio,title,button,holder,help){
    let yt=null,videoOn=false,lastEpisode=0,timer=null,ready=false;
    let pendingSeek=0,token=0;
    function episode(){
      const match=title.textContent.match(/(?:podcast|d[ií]l|diel)\s+(\d+)/i);
      if(match)return Number(match[1]);
      const source=String(audio.currentSrc||audio.src||'');
      if(/podcast_ep2\.mp3/i.test(source))return 2;
      if(/podcast_ep1\.mp3/i.test(source))return 1;
      return 0;
    }
    function visible(){return !root.hidden&&!root.classList.contains('hidden')}
    function seconds(){try{return Math.max(0,Number(yt?.getCurrentTime?.())||0)}catch{return Math.max(0,Number(audio.currentTime)||0)}}
    function reportTime(){
      if(!videoOn||!ready)return;
      const time=seconds();
      if(Number.isFinite(time)&&Math.abs((audio.currentTime||0)-time)>0.65){
        try{audio.currentTime=time}catch(_){}
      }
      window.dispatchEvent(new CustomEvent('vedatorvideotimeupdate',{detail:{episode:episode(),time}}));
      if(root.id==='player-v2'){
        const toggle=root.querySelector('#player-play-v2');
        if(toggle){
          const state=yt?.getPlayerState?.(),playing=state===window.YT?.PlayerState?.PLAYING;
          toggle.textContent=playing?'❚❚':'▶';
          toggle.title=playing?'Pozastavit YouTube':'Spustit YouTube';
        }
      }
    }
    function message(value){if(help)help.textContent=value}
    function refresh(){
      const n=episode(),available=Boolean(VIDEO_IDS[n]);
      button.disabled=!available;
      button.setAttribute('aria-disabled',String(!available));
      button.title=available?'Přepnout MP3 / YouTube':'Video pro tento díl zatím není propojené';
      button.textContent=videoOn?'✕ Video':'▶ YouTube';
      button.setAttribute('aria-pressed',String(videoOn));
      if(!available&&videoOn)void stop(false);
      if(n!==lastEpisode){
        const old=lastEpisode;lastEpisode=n;
        if(videoOn&&old!==n)void stop(false).then(()=>{if(preference&&VIDEO_IDS[n]&&visible())void start()});
        else if(preference&&VIDEO_IDS[n]&&visible()&&!videoOn)void start();
      }
    }
    async function start(){
      const n=episode(),id=VIDEO_IDS[n];
      if(!id||videoOn||!visible())return;
      const own=++token;
      const previous=Number.isFinite(audio.currentTime)?audio.currentTime:0;
      pendingSeek=Math.max(0,previous);
      audio.pause();
      videoOn=true;ready=false;
      holder.hidden=false;root.classList.add('vedator-video-active');
      refresh();window.dispatchEvent(new Event('vedatorvideomodechange'));
      message('Načítám video YouTube…');
      try{
        const YT=await loadApi();
        if(token!==own||!videoOn)return;
        const mount=holder.querySelector('.vedator-yt-target');
        mount.id='vedator-youtube-'+Math.random().toString(36).slice(2);
        yt=new YT.Player(mount.id,{
          videoId:id,width:'640',height:'360',
          playerVars:{autoplay:1,controls:1,playsinline:1,rel:0,start:Math.floor(pendingSeek),origin:location.origin,cc_load_policy:0},
          events:{
            onReady:event=>{
              if(token!==own)return;
              ready=true;
              try{event.target.seekTo(pendingSeek,true);event.target.playVideo()}catch(_){}
              message('Video YouTube – stejné místo jako MP3');
              reportTime();
              timer=setInterval(reportTime,450);
              window.dispatchEvent(new Event('vedatorvideomodechange'));
            },
            onError:()=>{
              message('YouTube video se nepodařilo přehrát. Můžete pokračovat v MP3.');
              void stop(false);
            }
          }
        });
      }catch(error){
        if(token===own){
          console.warn('YouTube API',error);message('Video nyní není dostupné, pokračuji v MP3.');
          await stop(false);audio.play().catch(()=>{});
        }
      }
    }
    async function stop(resumeAudio){
      if(!videoOn)return;
      const time=ready?seconds():pendingSeek;
      ++token;videoOn=false;ready=false;
      if(timer){clearInterval(timer);timer=null}
      if(yt){try{yt.pauseVideo();yt.destroy()}catch(_){}yt=null}
      const frame=holder.querySelector('iframe');if(frame)frame.remove();
      holder.innerHTML='<div class="vedator-yt-target"></div>';
      holder.hidden=true;root.classList.remove('vedator-video-active');
      try{audio.currentTime=time}catch(_){}
      refresh();
      window.dispatchEvent(new Event('vedatorvideomodechange'));
      if(resumeAudio){audio.play().catch(()=>message('Klepněte na Přehrát a pokračujte v MP3.'))}
    }
    button.addEventListener('click',async()=>{
      if(!VIDEO_IDS[episode()])return;
      if(videoOn){
        preference=false;try{localStorage.setItem(VIDEO_MODE_KEY,'0')}catch(_){}
        await stop(true);
      }else{
        preference=true;try{localStorage.setItem(VIDEO_MODE_KEY,'1')}catch(_){}
        await start();
      }
    });

    audio.addEventListener('loadedmetadata',refresh);
    audio.addEventListener('emptied',()=>{if(videoOn&&!VIDEO_IDS[episode()])void stop(false);refresh()});
    new MutationObserver(refresh).observe(title,{childList:true,subtree:true,characterData:true});
    if(root.id==='player-v2'){
      const play=root.querySelector('#player-play-v2');
      play?.addEventListener('click',event=>{
        if(!videoOn||!ready)return;
        event.preventDefault();event.stopImmediatePropagation();
        try{yt.getPlayerState()===YT.PlayerState.PLAYING?yt.pauseVideo():yt.playVideo()}catch(_){}
      },true);
      // Let the existing seekbar move the visible video as well.
      const seek=root.querySelector('#player-seek-v2');
      for(const type of ['input','change'])
        seek?.addEventListener(type,()=>{
          if(!videoOn)return;
          const time=Math.max(0,Number(seek.value)||0);pendingSeek=time;
          try{yt?.seekTo(time,true)}catch(_){}
        });
    }
    refresh();
    return {episode,videoActive:()=>videoOn,currentTime:seconds,getBox:()=>holder,stop,start};
  }

  function installV2(){
    const root=document.querySelector('#player-v2');
    const audio=document.querySelector('#audio-v2');
    const title=root?.querySelector('#player-title-v2');
    const download=root?.querySelector('#player-download-v2');
    const controls=root?.querySelector('.player-controls');
    if(!root||!audio||!title||!download||!controls||controls.querySelector('#player-youtube-v2'))return;
    const button=document.createElement('button');button.id='player-youtube-v2';button.type='button';
    download.insertAdjacentElement('afterend',button);
    const holder=document.createElement('div');holder.className='vedator-video-box';holder.hidden=true;
    holder.innerHTML='<div class="vedator-yt-target"></div>';
    controls.insertAdjacentElement('afterend',holder);
    controller=playerFor(root,audio,title,button,holder,root.querySelector('#player-help-v2'));
  }

  function installClassic(){
    const root=document.querySelector('.vedator-audio-modal');
    const audio=root?.querySelector('.vedator-audio-card audio');
    const title=root?.querySelector('.vedator-audio-card__title');
    if(!audio||!title||!root||root.querySelector('.vedator-classic-youtube'))return true;
    const button=document.createElement('button');button.type='button';button.className='vedator-classic-youtube';
    audio.insertAdjacentElement('afterend',button);
    const holder=document.createElement('div');holder.className='vedator-video-box';holder.hidden=true;
    holder.innerHTML='<div class="vedator-yt-target"></div>';
    button.insertAdjacentElement('afterend',holder);
    playerFor(root,audio,title,button,holder,root.querySelector('.vedator-audio-card__help'));
    return true;
  }

  const style=document.createElement('style');
  style.setAttribute('data-vedator-youtube-style','1');
  style.textContent=[
    '#player-youtube-v2,.vedator-classic-youtube{border:1px solid var(--line,#b8bfcc);background:var(--card,#fff);color:var(--ink,#172033);border-radius:10px;padding:7px 9px;font-weight:750;cursor:pointer;min-height:40px}',
    '#player-youtube-v2:disabled,.vedator-classic-youtube:disabled{opacity:.45;cursor:not-allowed}',
    '#player-youtube-v2[aria-pressed="true"],.vedator-classic-youtube[aria-pressed="true"]{color:var(--accent,#5b4bdb);border-color:var(--accent,#5b4bdb)}',
    '.vedator-video-box{grid-column:1/-1;width:100%;position:relative;margin:4px auto;max-width:750px;aspect-ratio:16/9;background:#070707;border-radius:12px;overflow:hidden}',
    '.vedator-video-box[hidden]{display:none!important}',
    '.vedator-video-box .vedator-yt-target,.vedator-video-box iframe{display:block;width:100%!important;height:100%!important;border:0}',
    '#player-v2.vedator-video-active{max-height:min(90vh,800px);overflow-y:auto}',
    '#player-v2.vedator-video-active .player-inner{overflow:visible}',
    '@media(max-width:700px){#player-v2 .player-controls{grid-template-columns:repeat(20,minmax(0,1fr))!important}',
    '#player-v2 #player-youtube-v2{grid-column:auto}',
    '@media(max-width:700px){#player-v2 #player-playlist-v2,#player-v2 #player-offline-v2,#player-v2 #player-download-v2,#player-v2 #player-speed-v2,#player-v2 #player-youtube-v2{grid-column:span 4!important;grid-row:2!important;padding:5px 2px!important;white-space:normal!important;min-width:0!important;font-size:.7rem!important}}'
  ].join('\n');
  document.head.appendChild(style);

  function install(){
    installV2();
    if(!installClassic()){
      const obs=new MutationObserver(()=>{if(installClassic())obs.disconnect()});
      obs.observe(document.body,{subtree:true,childList:true});
    }
    window.vedatorEpisodeVideoController={
      getActive:()=>Boolean(controller?.videoActive()),
      getCurrentTime:()=>controller?.currentTime()||0,
      getBox:()=>controller?.getBox()||null
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
