(()=>{
  if(window.__vedatorUiCleanup)return;
  window.__vedatorUiCleanup=true;

  function updateUi(){
    const refresh=document.querySelector('#refresh');
    if(refresh)refresh.remove();

    const controls=document.querySelector('.controls');
    if(controls){
      controls.style.gridTemplateColumns='1fr';
    }

    const seriesTab=document.querySelector('.tab[data-view="series"]');
    const topics=document.querySelector('#topics');
    if(topics){
      const seriesActive=seriesTab?.classList.contains('active');
      topics.classList.toggle('hidden',Boolean(seriesActive));
    }
  }

  document.addEventListener('click',event=>{
    if(event.target.closest('.tab'))setTimeout(updateUi,0);
  },true);

  new MutationObserver(updateUi).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  updateUi();
})();