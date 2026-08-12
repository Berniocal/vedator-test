(()=>{
  if(window.__vedatorThemeToggle)return;
  window.__vedatorThemeToggle=true;

  const SW_URL='./sw-fast.js';
  const SW_TAKEOVER_KEY='vedator-sw-fast-takeover-v209';
  const workerName=worker=>{
    if(!worker)return'';
    try{return new URL(worker.scriptURL,location.href).pathname.split('/').pop()}
    catch{return''}
  };
  const isFastWorker=worker=>workerName(worker)==='sw-fast.js';
  const waitForWorkerState=(worker,timeout=2200)=>new Promise(resolve=>{
    if(!worker||['installed','activated','redundant'].includes(worker.state)){resolve(worker?.state||'');return}
    let settled=false;
    const finish=()=>{
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      worker.removeEventListener('statechange',onState);
      resolve(worker.state||'');
    };
    const onState=()=>{if(['installed','activated','redundant'].includes(worker.state))finish()};
    const timer=setTimeout(finish,timeout);
    worker.addEventListener('statechange',onState);
  });
  const waitForControllerChange=(timeout=2200)=>new Promise(resolve=>{
    let settled=false;
    const finish=()=>{
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('controllerchange',onChange);
      resolve(navigator.serviceWorker.controller);
    };
    const onChange=()=>finish();
    const timer=setTimeout(finish,timeout);
    navigator.serviceWorker.addEventListener('controllerchange',onChange);
  });

  async function ensureCurrentWorker(){
    if(!('serviceWorker'in navigator))return;
    try{
      const initialController=navigator.serviceWorker.controller;
      const initialWasFast=isFastWorker(initialController);
      const registration=await navigator.serviceWorker.register(SW_URL,{updateViaCache:'none'});
      let sawUpdate=Boolean(registration.installing||registration.waiting);
      const onUpdate=()=>{sawUpdate=true};
      registration.addEventListener('updatefound',onUpdate,{once:true});
      await registration.update();
      if(registration.installing){
        sawUpdate=true;
        await waitForWorkerState(registration.installing);
      }
      if(registration.waiting){
        sawUpdate=true;
        registration.waiting.postMessage({type:'SKIP_WAITING'});
      }
      if(!isFastWorker(navigator.serviceWorker.controller)||sawUpdate)await waitForControllerChange();
      const nowFast=isFastWorker(navigator.serviceWorker.controller);
      if(nowFast&&(!initialWasFast||sawUpdate)&&sessionStorage.getItem(SW_TAKEOVER_KEY)!=='1'){
        sessionStorage.setItem(SW_TAKEOVER_KEY,'1');
        location.replace(location.href);
      }
    }catch(error){
      console.warn('Aktualizaci aplikace se nepodařilo zkontrolovat.',error);
    }
  }
  void ensureCurrentWorker();

  const loadBootstrapScript=(src,selector,readyFlag,dataKey)=>new Promise(resolve=>{
    if(window[readyFlag]){resolve();return}
    let script=document.querySelector(selector);
    if(script){
      let done=false;
      const finish=()=>{if(done)return;done=true;resolve()};
      script.addEventListener('load',finish,{once:true});
      script.addEventListener('error',finish,{once:true});
      setTimeout(finish,2000);
      return;
    }
    script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.dataset[dataKey]='1';
    script.onload=resolve;
    script.onerror=resolve;
    document.head.appendChild(script);
  });

  const ensureCurrentEnhancements=async()=>{
    await loadBootstrapScript('./offline-audio.js?v=20260808-4','script[src*="offline-audio.js"]','__vedatorOfflineAudio','vedatorOfflineBootstrap');
    await loadBootstrapScript('./player-actions.js?v=20260808-4','script[src*="player-actions.js"]','__vedatorPlayerActions','vedatorPlayerActionsBootstrap');
    await loadBootstrapScript('./playlist-editor-mobile.js?v=20260808-4','script[src*="playlist-editor-mobile.js"]','__vedatorPlaylistEditorMobile','vedatorPlaylistEditorBootstrap');
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void ensureCurrentEnhancements()},{once:true});
  else void ensureCurrentEnhancements();

  const STORAGE_KEY='vedatorTheme';
  const style=document.createElement('style');
  style.textContent=`
    .header-actions{display:flex;flex-direction:column;align-items:flex-end;gap:9px;min-width:138px}
    .theme-switch{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid rgba(255,255,255,.35);border-radius:12px;background:rgba(255,255,255,.1);color:#fff;font-size:.82rem;font-weight:750;cursor:pointer;user-select:none}
    .theme-switch input{position:absolute;opacity:0;pointer-events:none}
    .theme-switch__track{position:relative;flex:0 0 auto;width:38px;height:22px;border-radius:999px;background:rgba(255,255,255,.28);transition:.2s}
    .theme-switch__track::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35);transition:.2s}
    .theme-switch input:checked+.theme-switch__track{background:#8b7ee8}
    .theme-switch input:checked+.theme-switch__track::after{transform:translateX(16px)}
    .theme-switch:focus-within{outline:2px solid rgba(255,255,255,.75);outline-offset:2px}
    .vedator-header-actions{justify-content:flex-end;max-width:100%;flex-wrap:nowrap}
    .vedator-header-actions .install-app{order:0;width:auto;flex:0 1 auto}
    .vedator-header-actions .vedator-language-switch{order:1;flex:0 0 auto}

    html.theme-dark{color-scheme:dark;--bg:#0d111b;--card:#171d2a;--ink:#edf2ff;--muted:#aab4c8;--line:#30394b;--accent:#7c6ee6;--accent2:#29244b}
    html.theme-dark body{background:var(--bg);color:var(--ink)}
    html.theme-dark .panel,html.theme-dark article,html.theme-dark .series-card{background:var(--card);border-color:var(--line);box-shadow:0 8px 30px rgba(0,0,0,.25)}
    html.theme-dark .search,html.theme-dark .sort,html.theme-dark .topic,html.theme-dark .tab{background:#1d2534;color:var(--ink);border-color:var(--line)}
    html.theme-dark .topic.active,html.theme-dark .tab.active{background:#3a326d;color:#f3f0ff;border-color:#8b7ee8;box-shadow:0 0 0 1px rgba(139,126,232,.18) inset}
    html.theme-dark .search::placeholder{color:#8994a9}
    html.theme-dark .desc,html.theme-dark .episode-summary-body{color:#c8d0df}
    html.theme-dark .tag{background:#29264c;color:#c7c0ff}
    html.theme-dark .secondary{color:var(--ink);border-color:var(--line)}
    html.theme-dark .episode-summary,html.theme-dark .series-card[open]>summary{background:#1c2331;border-color:var(--line)}
    html.theme-dark .summary-title,html.theme-dark .person-name{color:var(--ink)}
    html.theme-dark .series-body a{color:#b9b0ff}
    html.theme-dark .episode-title{color:var(--muted)}
    html.theme-dark .vedator-audio-modal{background:#0d111b;color:#edf2ff}
    html.theme-dark .vedator-audio-modal__shell,html.theme-dark .vedator-audio-card{background:#171d2a;color:#edf2ff;border-color:#30394b}
    html.theme-dark .vedator-audio-modal__content{background:linear-gradient(160deg,#0d111b,#201c3a)}
    html.theme-dark .vedator-audio-card__kicker,html.theme-dark .vedator-audio-card__help,html.theme-dark .vedator-audio-seek-times{color:#aab4c8}
    html.theme-dark .vedator-audio-seek-box{background:#1c2331;border-color:#30394b}
    html.theme-dark .vedator-audio-seek-label{color:#c7c0ff}
    html.theme-dark .vedator-audio-seek::-webkit-slider-runnable-track{background:#4a426f}
    html.theme-dark .vedator-audio-seek::-moz-range-track{background:#4a426f}
    @media(max-width:550px){
      header{padding:18px 16px 14px}
      .header-row{flex-direction:column;align-items:stretch;gap:8px}
      .header-row>div:first-child{width:100%;min-width:0}
      .header-row .eyebrow{font-size:.68rem;line-height:1.2}
      .header-row h1{max-width:100%;font-size:clamp(1.65rem,7vw,1.8rem);line-height:1.04;letter-spacing:-.02em;text-wrap:balance;margin:.2rem 0 0}
      .header-actions{width:100%;min-width:0;max-width:100%;align-self:stretch;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:7px}
      .theme-switch{width:auto;min-height:38px;font-size:.78rem;padding:7px 9px}
      .vedator-header-actions{width:auto;max-width:100%;justify-content:flex-end;gap:6px}
      .vedator-header-actions .install-app{width:auto;min-height:38px;padding:7px 10px;font-size:.82rem}
    }
  `;
  document.head.appendChild(style);

  const headerRow=document.querySelector('.header-row');
  const originalInstallButton=document.querySelector('#installApp');
  if(!headerRow)return;

  let installButton=null;
  if(originalInstallButton){
    installButton=originalInstallButton.cloneNode(true);
    originalInstallButton.replaceWith(installButton);
    installButton.classList.add('hidden');
  }

  const actions=document.createElement('div');
  actions.className='header-actions';
  headerRow.appendChild(actions);

  const label=document.createElement('label');
  label.className='theme-switch';
  label.innerHTML=`<span class="theme-switch__text">Tmavý režim</span><input type="checkbox" aria-label="Tmavý režim"><span class="theme-switch__track" aria-hidden="true"></span>`;
  actions.appendChild(label);
  if(installButton)actions.appendChild(installButton);

  const checkbox=label.querySelector('input');
  const text=label.querySelector('.theme-switch__text');

  function preferredDark(){
    const stored=localStorage.getItem(STORAGE_KEY);
    if(stored==='dark')return true;
    if(stored==='light')return false;
    return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(dark,save=true){
    document.documentElement.classList.toggle('theme-dark',dark);
    checkbox.checked=dark;
    text.textContent=dark?'Světlý režim':'Tmavý režim';
    if(save){
      try{localStorage.setItem(STORAGE_KEY,dark?'dark':'light')}catch(error){}
    }
  }

  checkbox.addEventListener('change',()=>applyTheme(checkbox.checked,true));
  applyTheme(preferredDark(),false);

  if(!installButton)return;

  let deferredInstallPrompt=null;
  const userAgent=navigator.userAgent||'';
  const isIos=/iphone|ipad|ipod/i.test(userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isIosSafari=isIos&&/safari/i.test(userAgent)&&!/crios|fxios|edgios|opios/i.test(userAgent);
  const isInstalled=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;

  function updateInstallButton(){
    const available=!isInstalled()&&(Boolean(deferredInstallPrompt)||isIos);
    installButton.classList.toggle('hidden',!available);
    installButton.textContent=isIos?'Přidat na plochu':'Instalovat aplikaci';
    installButton.setAttribute('aria-label',installButton.textContent);
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredInstallPrompt=event;
    updateInstallButton();
  });

  window.addEventListener('appinstalled',()=>{
    deferredInstallPrompt=null;
    updateInstallButton();
  });

  installButton.addEventListener('click',async()=>{
    if(isInstalled()){
      updateInstallButton();
      return;
    }

    if(deferredInstallPrompt){
      const prompt=deferredInstallPrompt;
      deferredInstallPrompt=null;
      updateInstallButton();
      try{
        await prompt.prompt();
        await prompt.userChoice;
      }catch(error){
        console.warn('Instalační dialog se nepodařilo otevřít.',error);
      }
      return;
    }

    if(isIos){
      alert(isIosSafari
        ?'V Safari klepněte na Sdílet a potom na Přidat na plochu.'
        :'Pro přidání aplikace na plochu otevřete tuto stránku v Safari. Potom klepněte na Sdílet a na Přidat na plochu.');
    }
  });

  updateInstallButton();
})();
