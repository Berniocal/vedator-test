(()=>{
  if(window.__vedatorScientistTitleFix)return;
  window.__vedatorScientistTitleFix=true;

  const series=document.querySelector('#series');
  if(!series)return;

  function apply(){
    series.querySelectorAll('.series-card').forEach(card=>{
      const summaryText=(card.querySelector('summary')?.textContent||'').toLowerCase();
      if(!summaryText.includes('vědci')&&!summaryText.includes('vedci'))return;

      card.querySelectorAll('li').forEach(item=>{
        const episodeLink=[...item.querySelectorAll('a')].find(link=>/podcast\s+107\b/i.test(link.textContent||''));
        if(!episodeLink)return;

        let name=item.querySelector('.person-name');
        if(!name){
          name=document.createElement('span');
          name.className='person-name';
          item.insertBefore(name,item.firstChild);
        }
        name.textContent='John von Neumann';
      });
    });
  }

  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  observer.observe(series,{childList:true,subtree:true});
  apply();
})();
