(()=>{
  if(window.__vedatorCustomPlayer)return;
  window.__vedatorCustomPlayer=true;

  const RATES=[1,1.25,1.5,1.75,2,.8];
  let context={type:'episodes',label:'Všetky epizódy',titles:[]};
  let currentTitle='';
  let rate=1;

  const style=document.createElement('style');
  style.textContent=`.vedator-audio-card audio{display:none!important} .vedator-custom-controls{display:grid;gap:13px;margin-top:18px} .vedator-custom-main{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;align-items:center} .vedator-custom-secondary{display:grid;grid-template-columns:1fr 1fr;gap:11px} .vedator-custom-btn{border:1px solid #d8d1ff;background:linear-gradient(180deg,#f7f5ff,#ebe7ff);color:#392b9b;border-radius:17px;min-height:56px;padding:8px 5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:inherit;font-weight:800;cursor:pointer;box-shadow:0 7px 18px rgba(91,75,219,.13);text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none} .vedator-custom-btn_active,.vedator-custom-btn.is-pressed{transform:translateY(1px)} .vedator-custom-btn:disabled{opacity:.55;cursor:not-allowed;box-shadow:none} .vedator-custom-btn.PH_7__ .vedator-custom-icon_PH_8__ .vedator-custom-label_btn_9 .vedator-custom-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om-om`;
  document.head.appendChild(style);

  function episodeNumber(title){
    const match=String(title||'').match(/\bpodcast\s+(\d+)\b/i);
    return match?Number(match[1]):null;
  }
  function episodeKey(title){
    const number=episodeNumber(title);
    return number!==null?`episode-${number}`:`tit-${String(title||'').trim().toLowerCase()}`;
  }
  function getEpisode(title){
    return typeof episodes!=='undefined'&&Array.isArray(episodes)?episodes.find(e=>episodeKey(e.title)===episodeKey(title)):null;
  }
  function visibleEpisodeTitles(){
    return [...document.querySelectorAll('#episodes article h2')].map(x=>x.textContent.trim()).filter(Boolean);
  }
  function sortEpisodeTitlesAscending(titles){
    return [...new Set(titles)].sort((a,b)=>{
      const na=episodeNumber(a),nb=episodeNumber(b);
      if(na!==null&&nb!==null)return na-nb;
      if(na!==null)return-1;
      if(nb!==null)return 1;
      return a.localeCompare(b,'cs');
    });
  }
  function setEpisodeContext(){
    let titles=visibleEpisodeTitles();
    if(!titles.length&&typeof filtered==='function'){
      try{titles=filtered().map(e=>e.title).filter(Boolean)}catch{}
    }
    const topic=typeof active==='string'?active:'Všetko';
    const query=document.querySelector('#search')?.value?.trim();
    context={
      type:'episodes',
      label:query?`Vyhľadávanie: ${query}`:(topic&&topic!=='Všetko'?`Téma: ${topic}`:'Všetky epizódy'),
      titles:sortEpisodeTitlesAscending(titles)
    };
  }
  function setSeriesContext(link){
    const card=link.closest('.series-card');
    const links=[...(card?.querySelectorAll('.series-body a')||[])];
    context={
      type:'series',
      label:card?.querySelector('summary span')?.textContent?.trim()||'Série',
      titles:links.map(a=>a.dataset.vedatorEpisodeTitle||a.querySelector('.episode-title')?.textContent||a.textContent).map(x=>String(x||'').trim()).filter(Boolean)
    };
  }
  function consumeSharedContext(){
    const shared=window.__vedatorPlaybackContext;
    if(!shared||!Array.isArray(shared.titles)||!shared.titles.length)return;
    context={type:'series',label:shared.label||'Série',titles:[...shared.titles]};
    window.__vedatorPlaybackContext=null;
  }
  function currentIndex(){return context.titles.findIndex(t=>episodeKey(t)===episodeKey(currentTitle))}

  function openEpisode(title){
    const episode=getEpisode(title);
    if(!episode?.enclosure)return false;
    const proxy=document.createElement('article');
    proxy.hidden=true;
    proxy.innerHTML='<h2></h2><div class="links"><a class="primary"></a></div>';
    proxy.querySelector('h2').textContent=episode.title;
    const play=proxy.querySelector('a');
    play.href=episode.enclosure;
    play.dataset.vedatorEpisodeTitle=episode.title;
    document.body.appendChild(proxy);
    play.click();
    proxy.remove();
    return true;
  }

  document.addEventListener('click',event=>{
    const series=event.target.closest('#series .series-body a');
    if(series){setSeriesContext(series);return}
    const play=event.target.closest('#episodes article .links .primary');
    if(play)setEpisodeContext();
  },true);

  function safeFilename(title){
    return (title||'vedatorsky-podcast').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()+'.mp3';
  }
  function formatMb(bytes){return `${(bytes/1048576).toFixed(1).replace('.',',')} MB`}

  function install(){
    const card=document.querySelector('.vedator-audio-card');
    const audio=card?.querySelector('audio');
    if(!card||!audio)return false;
    if(card.querySelector('.vedator-custom-controls'))return true;

    const controls=document.createElement('div');
    controls.className='vedator-custom-controls';
    controls.innerHTML=`
      <div class="vedator-custom-main">
        <button class="vedator-custom-btn prev" type="button" aria-label="Předchozí díl"><span class="vedator-custom-icon">◀|</span><span class="vedator-custom-label">Predchádzajúce</span></button>
        <button class="vedator-custom-btn back10" type="button" aria-label="O 10 sekund zpět"><span class="vedator-custom-icon">↶</span><span class="vedator-custom-label">-10 s</span></button>
        <button class="vedator-custom-btn main play" type="button" aria-label="Přehrát"><span class="vedator-custom-icon">▶</span><span class="vedator-custom-label">Prehrať</span></button>
        <button class="vedator-custom-btn forward10" type="button" aria-label="O 10 sekund dopředu"><span class="vedator-custom-icon">↷</span><span class="vedator-custom-label">+10 s</span></button>
        <button class="vedator-custom-btn next" type="button" aria-label="Další díl"><span class="vedator-custom-icon">|▶</span><span class="vedator-custom-label">Ďalší</span></button>
      </div>
      <div class="vedator-custom-secondary">
        <button class="vedator-custom-btn download" type="button"><span>⇩</span><span class="download-label">Odstráť</span></button>
        <button class="vedator-custom-btn speed" type="button"><span>Rýchlosť</span><span class="speed-value">1x</span></button>
      </div>`;
    audio.insertAdjacentElement('afterend',controls);

    const play=controls.querySelector('.play');
    const playIcon=play.querySelector('.vedator-custom-icon');
    const prev=controls.querySelector('.prev');
    const next=controls.querySelector('.next');
    const back10=controls.querySelector('.back10');
    const forward10=controls.querySelector('.forward10');
    const download=controls.querySelector('.download');
    const downloadLabel=controls.querySelector('.download-label');
    const speed=controls.querySelector('.speed');
    const speedValue=controls.querySelector('.speed-value');
    const titleNode=card.querySelector('.vedator-audio-card__title');
    const help=card.querySelector('.vedator-audio-card__help');

    function setText(node,value){if(node&&node.textContent!==value)node.textContent=value}
    function setPlayVisual(paused){
      setText(playIcon,paused?'▶':'Ⅱ');
      const label=paused?'Prehrať':'Zastaviť';
      if(play.getAttribute('aria-label')!==label)play.setAttribute('aria-label',label);
    }
    function sync(){
      consumeSharedContext();
      currentTitle=titleNode?.textContent?.trim()||currentTitle;
      setPlayVisual(audio.paused);
      const i=currentIndex();
      const prevDisabled=i<=0;
      const nextDisabled=i<0||i>=context.titles.length-1;
      if(prev.disabled!==prevDisabled)prev.disabled=prevDisabled;
      if(next.disabled!==nextDisabled)next.disabled=nextDisabled;
      setText(speedValue,String(rate).replace('.',',')+'×');
    }
    function relative(delta){
      consumeSharedContext();
      const i=currentIndex();
      if(i<0)return;
      const title=context.titles[i+delta];
      if(title&&openEpisode(title))queueMicrotask(sync);
    }
    function bindFast(button,handler){
      let handledAt=0;
      button.addEventListener('pointerdown',()=>button.classList.add('is-pressed'),{passive:true});
      const clear=()=>button.classList.remove('is-pressed');
      button.addEventListener('pointercancel',clear,{passive:true});
      button.addEventListener('pointerleave',clear,{passive:true});
      button.addEventListener('pointerup',event=>{
        clear();
        if(button.disabled||event.button!==0)return;
        handledAt=performance.now();
        event.preventDefault();
        handler(event);
      });
      button.addEventListener('click',event=>{
        if(performance.now()-handledAt<500){event.preventDefault();return}
        if(button.disabled)return;
        handler(event);
      });
    }
    async function downloadCurrent(){
      const url=audio.currentSrc||audio.src;
      if(!url)return;
      download.disabled=true;
      setText(downloadLabel,'Pripravím...');
      try{
        const response=await fetch(url,{mode:'cors',cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const total=Number(response.headers.get('content-length'))||0;
        const type=response.headers.get('content-type')||'audio/mpeg';
        const reader=response.body?.getReader();
        let loaded=0,blob;
        if(reader){
          const chunks=[];
          while(true){
            const {done,value}=await reader.read();
            if(done)break;
            chunks.push(value);loaded+=value.byteLength;
            if(total){
              const percent=Math.min(99,Math.floor(loaded/total*100));
              setText(downloadLabel,`Zobrať.${percent} %`);
              if(help)setText(help,`Zobrali sme${formatMb(loaded)} z ${formatMb(total)}.`);
            }else{
              setText(downloadLabel,`Zobrať.${formatMb(loaded)}`);
              if(help)setText(help,`Zobrali sme${formatMb(loaded)}.`);
            }
          }
          blob=new Blob(chunks,{type});
        }else blob=await response.blob();
        setText(downloadLabel,'- Vkladám...');
        const objectUrl=URL.createObjectURL(blob);
        const link=document.createElement('a');
        link.href=objectUrl;link.download=safeFilename(currentTitle);
        document.body.appendChild(link);link.click();link.remove();
        setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);
        if(help)setText(help,`Súbor sa stiahol (${formatMb(blob.size)}).`);
      }catch{
        if(help)setText(help,'Stažení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.');
      }finally{
        download.disabled=false;setText(downloadLabel,'Odstráť');
      }
    }

    bindFast(play,()=>{
      if(audio.paused){
        setPlayVisual(false);
        const promise=audio.play();
        if(promise?.catch)promise.catch(()=>setPlayVisual(true));
      }else{
        setPlayVisual(true);
        audio.pause();
      }
    });
    bindFast(back10,()=>{
      audio.currentTime=Math.max(0,(audio.currentTime||0)-10);
    });
    bindFast(forward10,()=>{
      audio.currentTime=Math.min(audio.duration||Infinity,(audio.currentTime||0)+10);
    });
    bindFast(prev,()=>relative(-1));
    bindFast(next,()=>relative(1));
    bindFast(download,downloadCurrent);
    bindFast(speed,()=>{
      const i=RATES.findIndex(x=>Math.abs(x-rate)<.001);
      rate=RATES[(i+1)%RATES.length];
      setText(speedValue,String(rate).replace('.',',')+'×');
      audio.playbackRate=rate;
    });

    audio.addEventListener('play',sync);
    audio.addEventListener('pause',sync);
    audio.addEventListener('loadedmetadata',()=>{audio.playbackRate=rate;sync()});
    audio.addEventListener('ratechange',()=>{rate=audio.playbackRate;sync()});
    audio.addEventListener('ended',()=>relative(1));
    if(titleNode)new MutationObserver(sync).observe(titleNode,{childList:true,characterData:true,subtree:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
    sync();
    return true;
  }

  if(!install()){
    const observer=new MutationObserver((_,self)=>{if(install())self.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
  }
})();