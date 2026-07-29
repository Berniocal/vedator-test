(()=>{
  if(window.__vedatorViewLayoutFix)return;
  window.__vedatorViewLayoutFix=true;

  const topics=document.querySelector('#topics');
  const tabs=document.querySelector('.tabs');
  if(!topics||!tabs)return;

  function isEpisodesTab(tab){
    if(!tab)return false;
    const view=String(tab.dataset.view||'').toLowerCase();
    const text=String(tab.textContent||'').trim().toLowerCase();
    return view==='episodes'||text==='epizódy'||text==='epizody';
  }

  function sync(){
    const show=isEpisodesTab(tabs.querySelector('.tab.active'));
    topics.classList.toggle('hidden',!show);
    topics.hidden=!show;
    topics.style.display=show?'':'none';
    topics.setAttribute('aria-hidden',String(!show));
  }

  tabs.addEventListener('click',()=>setTimeout(sync,0));
  new MutationObserver(sync).observe(tabs,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
  sync();
})();