(()=>{
  if(window.__vedatorQuestionControlsStability)return;
  window.__vedatorQuestionControlsStability=true;

  for(const src of ['./episode-170-summary.js','./episode-170-chapters.js','./episode-158-summary.js','./episode-158-chapters.js','./episode-143-summary.js','./episode-143-chapters.js','./episode-133-summary.js','./episode-133-chapters.js','./episode-128-summary.js','./episode-128-chapters.js','./episode-119-summary.js','./episode-119-chapters.js','./episode-112-summary.js','./episode-100-summary.js','./episode-89-summary.js','./episode-82-summary.js']){
    if(document.querySelector(`text[src="${src}"]`))continue;
    const script=document.createElement('script');script.src=src;script.defer=true;document.head.appendChild(script);
  }

  const FAQ_EPISODES=new Set([82,89,100,112,119,128,133,143,158,170,179,190,203,211,218,226,244,248,257,263,270,272,278,284,289,295,300,313,319,326,332,337,340]);
  const SPECIAL={190:'vedator-190-218-226-controls',218:'vedator-190-218-226-controls',226:'vedator-190-218-226-controls',244:'vedator-244-controls'};
  const style=document.createElement('style');
  style.textContent='.vedator-question-controls{display:none!important}.vedator-question-controls.vedator-faq-visible{display:grid!important}';
  document.head.appendChild(style);

  function episodeNumber(value){
    return Number(String(value||'').match(/\b(?:podcast\s*)?(\d{2,4})\b/i)?.[1]||0);
  }

  function parseTime(value){
    const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0]?.split(':').map(Number);
    if(!parts)return null;
    return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
  }

  function chooseRow(number,rows){
    const special=SPECIAL[number];
    if(special)return rows.find(row=>row.classList.contains(special))||rows[0]||null;
    return rows.find(row=>!row.classList.contains('vedator-190-218-226-controls')&&!row.classList.contains('vedator-244-controls'))||rows[0]||null;
  }

  function articleFor(number){
    return [...document.querySelectorAll('#episodes article')].find(article=>episodeNumber(article.querySelector('h2')?.textContent)===number)||null;
  }

  function chaptersFor(number){
    const article=articleFor(number);
    if(!article)return [];
    return [...new Set([...article.querySelectorAll('.episode-summary .summary-time')]
      .map(node=>parseTime(node.textContent))
      .filter(Number.isFinite))].sort((a,b)=>a-b);
  }

  function playerState(){
    const card=document.querySelector('.vedator-audio-card');
    const title=card?.querySelector('.vedator-audio-card__title');
    const audio=card?.querySelector('audio');
    const rows=[...(card?.querySelectorAll('.vedator-question-controls')||[])];
    const number=episodeNumber(title?.textContent);
    return {card,title,audio,rows,number};
  }

  function sync(){
    const {card,title,audio,rows,number}=playerState();
    if(!card||!title||!rows.length)return false;
    const chosen=FAQ_EPISODES.has(number)?chooseRow(number,rows):null;
    rows.forEach(row=>row.classList.toggle('vedator-faq-visible',row===chosen));
    if(chosen&&audio&&!window.__vedatorQuestionContext){
      const chapters=chaptersFor(number),time=audio.currentTime||0;
      const previous=chosen.querySelector('.previous-question');
      const next=chosen.querySelector('.next-question');
      if(previous)previous.disabled=!chapters.some(chapter=>chapter<time-1);
      if(next)next.disabled=!chapters.some(chapter=>chapter>time+1);
    }
    return true;
  }

  document.addEventListener('click',event=>{
    const normalPlay=event.target.closest('#episodes article .links .primary');
    if(normalPlay&&!event.target.closest('.episode-summary'))window.__vedatorQuestionContext=null;
  },true);

  document.addEventListener('click',event=>{
    const block=event.target.closest('#episodes article .episode-summary .summary-block');
    if(!block)return;
    const article=block.closest('article');
    const number=episodeNumber(article?.querySelector('h2')?.textContent);
    if(!FAQ_EPISODES.has(number))return;
    const seconds=parseTime(block.querySelector('.summary-time')?.textContent);
    const play=article.querySelector('.links .primary');
    if(!Number.isFinite(seconds)||!play)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.__vedatorQuestionContext=null;
    window.__vedatorRequestedStart={episode:number,time:seconds,createdAt:Date.now()};
    play.click();
    requestAnimationFrame(sync);
  },true);

  document.addEventListener('click',event=>{
    const button=event.target.closest('.vedator-question-btn');
    if(!button||window.__vedatorQuestionContext)return;
    const {audio,number}=playerState();
    if(!audio||!FAQ_EPISODES.has(number))return;
    const chapters=chaptersFor(number);
    if(!chapters.length)return;
    const time=audio.currentTime||0;
    const target=button.classList.contains('previous-question')
      ? [...chapters].reverse().find(chapter=>chapter<time-1)
      : chapters.find(chapter=>chapter>time+1);
    event.preventDefault();
    event.stopImmediatePropagation();
    if(Number.isFinite(target)){
      audio.currentTime=target;
      audio.play().catch(()=>{});
      requestAnimationFrame(sync);
    }
  },true);

  let titleObserver=null;
  function install(){
    const title=document.querySelector('.vedator-audio-card__title');
    if(!title||!sync())return false;
    titleObserver?.disconnect();
    titleObserver=new MutationObserver(sync);
    titleObserver.observe(title,{childList:true,characterData:true,subtree:true});
    return true;
  }

  if(!install()){
    const observer=new MutationObserver(()=>{if(install())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
  }

  new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('play',sync,true);
  document.addEventListener('loadedmetadata',sync,true);
  document.addEventListener('timeupdate',sync,true);
  setInterval(sync,350);
})();