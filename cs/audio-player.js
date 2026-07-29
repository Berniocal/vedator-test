(()=>{
  if(window.__vedatorAudioPlayer)return;
  window.__vedatorAudioPlayer=true;

  const STORAGE_KEY='vedatorPlaybackProgressV1';
  let progress={};
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    if(saved&&typeof saved==='object')progress=saved;
  }catch{progress={}}

  const modal=document.createElement('section');
  modal.className='vedator-audio-modal';
  modal.hidden=true;
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.innerHTML=`
    <div class="vedator-audio-modal__shell">
      <div class="vedator-audio-modal__bar">
        <button class="vedator-audio-modal__back" type="button" aria-label="Zavřít">←</button>
        <div class="vedator-audio-modal__title">Vedátorský podcast</div>
      </div>
      <div class="vedator-audio-modal__content">
        <div class="vedator-audio-card">
          <div class="vedator-audio-card__kicker">Vedátorský podcast</div>
          <div class="vedator-audio-card__title"></div>
          <div class="vedator-audio-seek-box">
            <div class="vedator-audio-seek-label">Přesný posun v epizodě</div>
            <input class="vedator-audio-seek" type="range" min="0" max="1" value="0" step="1" disabled aria-label="Pozice v epizodě">
            <div class="vedator-audio-seek-times"><span class="vedator-audio-current">0:00</span><span class="vedator-audio-duration">–:––</span></div>
          </div>
          <audio controls playsinline preload="metadata"></audio>
          <p class="vedator-audio-card__help">Pozice se ukládá do tohoto zařízení. Při příštím spuštění bude epizoda pokračovat od posledního místa.</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const back=modal.querySelector('.vedator-audio-modal__back');
  const barTitle=modal.querySelector('.vedator-audio-modal__title');
  const cardTitle=modal.querySelector('.vedator-audio-card__title');
  const help=modal.querySelector('.vedator-audio-card__help');
  const audio=modal.querySelector('audio');
  const seek=modal.querySelector('.vedator-audio-seek');
  const currentTimeLabel=modal.querySelector('.vedator-audio-current');
  const durationLabel=modal.querySelector('.vedator-audio-duration');

  let historyEntry=false,currentKey='',currentTitle='',currentUrl='',currentSession=0,lastSavedSecond=-1;
  let restoreTarget=null,restoreTimer=0,isUserSeeking=false,allowBackwardSaveUntil=0,currentArticle=null;

  const visible=()=>!modal.hidden;
  const episodeTitle=element=>element.closest('article')?.querySelector('h2')?.textContent?.trim()||'Vedátorský podcast';
  const episodeNumber=title=>Number(String(title||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0);
  const episodeKey=title=>{
    const number=String(title||'').match(/\bpodcast\s+(\d+)\b/i)?.[1];
    return number?`episode-${number}`:`title-${String(title||'').trim().toLowerCase()}`;
  };
  const absoluteUrl=url=>{try{return new URL(url,location.href).href}catch{return url}};
  const formatTime=seconds=>{
    const total=Math.max(0,Math.floor(Number(seconds)||0));
    const hours=Math.floor(total/3600),minutes=Math.floor((total%3600)/60),secs=total%60;
    return hours?`${hours}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`:`${minutes}:${String(secs).padStart(2,'0')}`;
  };
  const isCompleted=(time,duration,ended=false)=>ended||(duration>0&&(time/duration>=.9||duration-time<=120));
  const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};

  function persistProgress(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress))}catch{}}
  function clearRestore(){if(restoreTimer){clearTimeout(restoreTimer);restoreTimer=0}restoreTarget=null}

  function updateSeekDisplay(usePreview=false){
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:0;
    if(duration>0){seek.disabled=false;seek.max=String(Math.floor(duration));setText(durationLabel,formatTime(duration))}
    else{seek.disabled=true;seek.max='1';setText(durationLabel,'–:––')}
    if(!isUserSeeking&&!usePreview){
      const value=Number.isFinite(audio.currentTime)?audio.currentTime:0;
      const next=String(Math.min(Number(seek.max)||1,Math.max(0,Math.floor(value))));
      if(seek.value!==next)seek.value=next;
    }
    setText(currentTimeLabel,formatTime(Number(seek.value)||0));
  }

  function decorateArticle(article){
    if(!article)return;
    const title=article.querySelector('h2')?.textContent?.trim();
    const play=article.querySelector('.links .primary');
    if(!title||!play)return;
    const record=progress[episodeKey(title)];
    let badge=article.querySelector('.vedator-listen-status');
    if(!record||(!record.completed&&record.currentTime<10)){
      badge?.remove();article.classList.remove('vedator-listened','vedator-in-progress');setText(play,'Přehrát');return;
    }
    if(!badge){badge=document.createElement('div');badge.className='vedator-listen-status';article.querySelector('h2')?.insertAdjacentElement('afterend',badge)}
    const percent=record.duration>0?Math.min(100,Math.round(record.currentTime/record.duration*100)):0;
    if(record.completed){
      badge.className='vedator-listen-status completed';setText(badge,'✓ Poslechnuto');
      article.classList.add('vedator-listened');article.classList.remove('vedator-in-progress');
      setText(play,record.replaying&&record.currentTime>10?`Pokračovat znovu ${formatTime(record.currentTime)}`:'Přehrát znovu');
    }else{
      badge.className='vedator-listen-status in-progress';setText(badge,`▶ Rozposloucháno${percent?` · ${percent} %`:''}`);
      article.classList.add('vedator-in-progress');article.classList.remove('vedator-listened');
      setText(play,`Pokračovat ${formatTime(record.currentTime)}`);
    }
  }
  function decorateArticles(){document.querySelectorAll('#episodes article').forEach(decorateArticle)}

  function saveCurrentProgress(force=false,ended=false){
    if(!currentKey||isUserSeeking||audio.seeking||audio.readyState===0)return;
    if(currentUrl&&audio.currentSrc&&absoluteUrl(currentUrl)!==audio.currentSrc)return;
    const previous=progress[currentKey]||{};
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:(previous.duration||0);
    const time=ended&&duration>0?duration:audio.currentTime;
    if(!Number.isFinite(time)||time<0)return;
    if(restoreTarget!==null&&time<restoreTarget-4)return;
    if(previous.currentTime>30&&time<previous.currentTime-15&&Date.now()>allowBackwardSaveUntil&&!ended)return;
    const second=Math.floor(time);
    if(!force&&lastSavedSecond>=0&&Math.abs(second-lastSavedSecond)<5)return;
    lastSavedSecond=second;
    const wasCompleted=Boolean(previous.completed);
    progress[currentKey]={
      currentTime:time,duration,
      completed:wasCompleted||isCompleted(time,duration,ended),
      replaying:wasCompleted?!ended:false,
      title:currentTitle,updatedAt:Date.now()
    };
    persistProgress();
    decorateArticle(currentArticle);
  }

  function cancelAutomaticRestore(message='Automatické pokračování bylo zrušeno ručním posunem.'){if(restoreTarget===null)return;clearRestore();setText(help,message)}
  function resetAudio(save=true){
    if(save)saveCurrentProgress(true);currentSession+=1;clearRestore();audio.onloadedmetadata=null;audio.onerror=null;
    try{audio.pause()}catch{}audio.muted=false;audio.removeAttribute('src');audio.load();
    currentKey='';currentTitle='';currentUrl='';currentArticle=null;lastSavedSecond=-1;isUserSeeking=false;
    seek.disabled=true;seek.value='0';setText(currentTimeLabel,'0:00');setText(durationLabel,'–:––');
  }
  function attemptPlay(session,hasTarget,target){
    const promise=audio.play();
    if(promise&&typeof promise.catch==='function')promise.catch(()=>{if(session!==currentSession)return;setText(help,hasTarget?`Pozice ${formatTime(target)} je připravena. Klepněte na přehrávání.`:'Klepněte na tlačítko přehrávání v přehrávači.')});
  }

  function openAudio(url,title,article){
    if(!url)return;resetAudio(true);
    const session=++currentSession,key=episodeKey(title),number=episodeNumber(title);let record=progress[key];
    const request=window.__vedatorRequestedStart;
    const requestedStart=request&&request.episode===number&&Number.isFinite(request.time)&&Date.now()-(request.createdAt||0)<5000?Math.max(0,request.time):null;
    if(requestedStart!==null)delete window.__vedatorRequestedStart;
    const resumeReplay=Boolean(record?.completed&&record.replaying&&record.currentTime>10);
    if(record?.completed&&!resumeReplay&&requestedStart===null){
      progress[key]={currentTime:0,duration:record.duration||0,completed:true,replaying:true,title,updatedAt:Date.now()};
      persistProgress();record=progress[key];allowBackwardSaveUntil=Date.now()+5000;
    }
    const shouldResume=Boolean(requestedStart===null&&record&&record.currentTime>10&&(!record.completed||record.replaying));
    const initialTarget=requestedStart!==null?requestedStart:(shouldResume?record.currentTime:null);
    const hasInitialTarget=initialTarget!==null;
    if(requestedStart!==null)allowBackwardSaveUntil=Date.now()+10000;
    currentTitle=title;currentKey=key;currentUrl=url;currentArticle=article||null;lastSavedSecond=-1;
    setText(barTitle,title);setText(cardTitle,title);
    setText(help,hasInitialTarget?`Načítá se od ${formatTime(initialTarget)}…`:'Pozice se ukládá do tohoto zařízení.');
    if(!visible()){modal.hidden=false;document.body.classList.add('vedator-audio-open');history.pushState({vedatorAudio:true},'');historyEntry=true}
    audio.muted=hasInitialTarget;
    audio.onloadedmetadata=()=>{
      if(session!==currentSession||currentKey!==key)return;updateSeekDisplay();
      if(hasInitialTarget&&Number.isFinite(audio.duration)&&audio.duration>0){
        const target=Math.min(initialTarget,Math.max(0,audio.duration-1));restoreTarget=target;
        try{audio.currentTime=target;seek.value=String(Math.floor(target));updateSeekDisplay(true)}catch{clearRestore();audio.muted=false;setText(help,'Požadovanou pozici se nepodařilo načíst. Můžete se posunout ručně.')}
        restoreTimer=setTimeout(()=>{if(session!==currentSession||restoreTarget===null)return;clearRestore();audio.muted=false;setText(help,'Automatický posun trval příliš dlouho. Ruční posun je plně dostupný.')},4000);
      }else{clearRestore();audio.muted=false;setText(help,'Pozice se ukládá do tohoto zařízení.')}
    };
    audio.onerror=()=>{if(session!==currentSession)return;clearRestore();audio.muted=false;setText(help,'Zvuk se nepodařilo načíst. Zkuste epizodu zavřít a spustit znovu.')};
    audio.src=url;audio.load();attemptPlay(session,hasInitialTarget,initialTarget||0);
    if('mediaSession'in navigator&&'MediaMetadata'in window)navigator.mediaSession.metadata=new MediaMetadata({title,artist:'Vedátorský podcast'});
  }

  function commitManualSeek(){
    if(seek.disabled||!currentKey)return;
    const target=Math.max(0,Math.min(Number(seek.max)||0,Number(seek.value)||0));
    cancelAutomaticRestore();allowBackwardSaveUntil=Date.now()+4000;
    try{audio.currentTime=target}catch{}isUserSeeking=false;setText(currentTimeLabel,formatTime(target));setText(help,`Posunuto na ${formatTime(target)}.`);
  }
  function hideAudio(){resetAudio(true);modal.hidden=true;document.body.classList.remove('vedator-audio-open')}
  function requestClose(){if(historyEntry)history.back();else hideAudio()}

  seek.addEventListener('pointerdown',()=>{isUserSeeking=true;cancelAutomaticRestore()});
  seek.addEventListener('touchstart',()=>{isUserSeeking=true;cancelAutomaticRestore()},{passive:true});
  seek.addEventListener('input',()=>{isUserSeeking=true;cancelAutomaticRestore();updateSeekDisplay(true)});
  seek.addEventListener('change',commitManualSeek);seek.addEventListener('pointerup',commitManualSeek);seek.addEventListener('touchend',commitManualSeek,{passive:true});
  seek.addEventListener('keyup',event=>{if(['ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key))commitManualSeek()});
  audio.addEventListener('durationchange',updateSeekDisplay);audio.addEventListener('loadeddata',updateSeekDisplay);
  audio.addEventListener('timeupdate',()=>{updateSeekDisplay();saveCurrentProgress(false)});
  audio.addEventListener('seeked',()=>{if(restoreTarget!==null){const target=restoreTarget;clearRestore();audio.muted=false;setText(help,`Pokračuje od ${formatTime(target)}. Pozice se průběžně ukládá.`)}isUserSeeking=false;updateSeekDisplay();saveCurrentProgress(true)});
  audio.addEventListener('pause',()=>saveCurrentProgress(true));audio.addEventListener('ended',()=>saveCurrentProgress(true,true));
  window.addEventListener('pagehide',()=>saveCurrentProgress(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)saveCurrentProgress(true)});
  back.addEventListener('click',requestClose);
  window.addEventListener('popstate',()=>{if(visible()){historyEntry=false;hideAudio()}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&visible())requestClose()});
  document.addEventListener('click',event=>{
    const play=event.target.closest('.links .primary');if(!play)return;
    const url=play.getAttribute('href')||play.dataset.url;if(!url)return;
    event.preventDefault();event.stopPropagation();openAudio(url,episodeTitle(play),play.closest('#episodes article'));
  },true);
  const episodesBox=document.querySelector('#episodes');
  if(episodesBox)new MutationObserver(()=>requestAnimationFrame(decorateArticles)).observe(episodesBox,{childList:true});
  decorateArticles();
})();