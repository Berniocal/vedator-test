(()=>{
  if(window.__vedatorUiCleanup)return;
  window.__vedatorUiCleanup=true;

  let searchElement=null;
  let committedSearchValue='';
  let searchPending=false;
  let committingSearch=false;
  let commitFrame=0;
  let viewportMaxHeight=window.visualViewport?.height||0;
  let viewportWidth=window.visualViewport?.width||0;
  let keyboardWasVisible=false;

  function uiLanguage(){
    try{
      const lang=String(window.vedatorUiLanguage?.()||document.documentElement.lang||'').toLowerCase();
      return lang.startsWith('sk')?'sk':'cs';
    }catch(_){
      return String(document.documentElement.lang||'').toLowerCase().startsWith('sk')?'sk':'cs';
    }
  }

  function ensureSearchStyles(){
    if(document.querySelector('#vedator-search-controls-styles'))return;
    const style=document.createElement('style');
    style.id='vedator-search-controls-styles';
    style.textContent=`
      .search-clear-wrap{position:relative;width:100%;min-width:0}
      .search-clear-wrap .search{padding-right:48px}
      .search-clear-button{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:36px;height:36px;display:grid;place-items:center;border:0;border-radius:999px;background:transparent;color:var(--muted,#64748b);font-size:1.65rem;line-height:1;cursor:pointer}
      .search-clear-button[hidden]{display:none}
      .search-clear-button:hover{background:var(--accent2,#ede9fe);color:var(--ink,#162033)}
      .search-clear-button:focus-visible{outline:2px solid var(--accent,#5b4bdb);outline-offset:1px}
    `;
    document.head.appendChild(style);
  }

  function updateSearchClearButton(search,button){
    const hasText=search.value.length>0;
    button.hidden=!hasText;
    button.tabIndex=hasText?0:-1;
    const label=uiLanguage()==='sk'?'Vymazať vyhľadávanie':'Smazat vyhledávání';
    button.setAttribute('aria-label',label);
    button.title=label;
  }

  function commitSearch(search){
    cancelAnimationFrame(commitFrame);
    commitFrame=0;
    if(!search?.isConnected)return;
    if(!searchPending&&search.value===committedSearchValue)return;
    searchPending=false;
    committedSearchValue=search.value;
    committingSearch=true;
    try{
      search.dispatchEvent(new Event('input',{bubbles:true,composed:true}));
    }finally{
      committingSearch=false;
    }
  }

  function requestSearchCommit(search){
    cancelAnimationFrame(commitFrame);
    commitFrame=requestAnimationFrame(()=>commitSearch(search));
  }

  function prepareDeferredSearch(search){
    if(searchElement===search)return;
    searchElement=search;
    committedSearchValue=search.value;
    searchPending=false;
    search.enterKeyHint='search';

    search.addEventListener('focus',()=>{
      const viewport=window.visualViewport;
      if(viewport){
        viewportMaxHeight=Math.max(viewportMaxHeight,viewport.height);
        viewportWidth=viewport.width;
      }
      keyboardWasVisible=false;
    });

    search.addEventListener('blur',()=>requestSearchCommit(search));
    search.addEventListener('keydown',event=>{
      if(event.key!=='Enter'||event.isComposing)return;
      event.preventDefault();
      commitSearch(search);
      search.blur();
    });
  }

  function ensureSearchControls(){
    const search=document.querySelector('#search');
    if(!search)return;

    prepareDeferredSearch(search);
    ensureSearchStyles();

    let wrap=search.parentElement;
    if(!wrap?.classList.contains('search-clear-wrap')){
      wrap=document.createElement('div');
      wrap.className='search-clear-wrap';
      search.before(wrap);
      wrap.appendChild(search);
    }

    let button=wrap.querySelector('.search-clear-button');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='search-clear-button';
      button.textContent='×';
      button.addEventListener('pointerdown',event=>event.preventDefault());
      button.addEventListener('click',()=>{
        if(!search.value)return;
        search.value='';
        searchPending=search.value!==committedSearchValue;
        updateSearchClearButton(search,button);
        requestSearchCommit(search);
      });
      wrap.appendChild(button);
    }

    updateSearchClearButton(search,button);
  }

  function updateUi(){
    const refresh=document.querySelector('#refresh');
    if(refresh)refresh.remove();

    const controls=document.querySelector('.controls');
    if(controls)controls.style.gridTemplateColumns='1fr';

    ensureSearchControls();
  }

  document.addEventListener('input',event=>{
    const search=event.target?.closest?.('#search');
    if(!search||committingSearch)return;
    const button=search.parentElement?.querySelector('.search-clear-button');
    if(button)updateSearchClearButton(search,button);
    searchPending=search.value!==committedSearchValue;
    event.stopImmediatePropagation();
  },true);

  document.addEventListener('click',event=>{
    if(event.target.closest('.tab'))queueMicrotask(updateUi);
  },true);

  window.visualViewport?.addEventListener('resize',()=>{
    const viewport=window.visualViewport;
    if(!viewport)return;

    if(Math.abs(viewport.width-viewportWidth)>80){
      viewportWidth=viewport.width;
      viewportMaxHeight=viewport.height;
      keyboardWasVisible=false;
      return;
    }

    viewportMaxHeight=Math.max(viewportMaxHeight,viewport.height);
    if(!searchElement||document.activeElement!==searchElement)return;

    const reduction=viewportMaxHeight-viewport.height;
    const openThreshold=Math.max(110,viewportMaxHeight*.18);
    const closeThreshold=Math.min(90,openThreshold*.6);

    if(reduction>openThreshold){
      keyboardWasVisible=true;
      return;
    }

    if(keyboardWasVisible&&reduction<closeThreshold){
      keyboardWasVisible=false;
      requestSearchCommit(searchElement);
    }
  });

  window.addEventListener('vedatorlanguagechange',updateUi);
  updateUi();
})();
