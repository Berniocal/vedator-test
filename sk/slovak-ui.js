(()=>{
  if(window.__vedatorSlovakUi)return;
  window.__vedatorSlovakUi=true;

  const exact=new Map([
    ['Všetko','Všetko'],['Epizódy','Epizódy'],['Série','Série'],['Playlisty','Playlisty'],
    ['Mimozemské životy','Mimozemské životy'],['Kosmológia','Kosmológia'],['Temné energie','Temná energia'],
    ['Čierne diery','Čierne diery'],['Kvantová fyzika','Kvantová fyzika'],['Relativita','Relativita'],
    ['Astronomia','Astronomia'],['Biológia a medicína','Biológia a medicína'],['Matematika','Matematika'],
    ['Technológia a AI','Technológia a AI'],['Zem a príroda','Zem a príroda'],['Chemické látky a materiály','Chémia a materiály'],
    ['Spoločnosť a psychológia','Spoločnosť a psychológia'],['Prehrať','Prehrať'],['Čítať viac','Čítať viac'],
    ['Čítať menej','Čítať menej'],['Nová','Nová správa'],['Najstarší','Najstarší'],
    ['Podľa čísla diely','Podľa čísla dielu'],['Počet dielov','Podľa počtu dielov'],
    ['Podľa abecedy','Podľa abecedy'],['Podľa veku prvého dielu','Podľa veku prvého dielu'],
    ['Čítam epizódy...','Načítavam epizódy…'],['Čítam katalóg...','Čítam katalóg...'],
    ['Moji playlistovci','Moji playlistovci'],['Playlist je prázdný.','Playlist je prázdny.'],
    ['Inštalovať','Vstaviť'],['Predchádzajúce','Predchádzajúci'],['Ďalší','Ďalší'],['Odstráť','Stiahnuť'],
    ['Rýchlosť','Rýchlosť'],['Zastaviť','Zastaviť']
  ]);

  const attrMap=new Map([
    ['Hľadať česky alebo slovenský: čierne diery, vesmír...','Hľadať po slovensky: čierne diery, vesmír…'],
    ['Predchádzajúci článok','Predchádzajúci diel'],['Ďalšia časť','Ďalší diel'],['Prehrať','Prehrať'],
    ['Zastaviť','Zastaviť'],['10 sekúnd späť.','O 10 sekúnd späť'],['10 sekúnd vpred','10 sekúnd vpred']
  ]);

  function translateTextNode(node){
    const raw=node.nodeValue;
    const trimmed=raw?.trim();
    if(!trimmed)return;
    const translated=exact.get(trimmed);
    if(!translated||translated===trimmed)return;
    node.nodeValue=raw.replace(trimmed,translated);
  }

  function translateElement(el){
    if(el.nodeType!==1)return;
    if(el.matches('input[placeholder]')){
      const value=el.getAttribute('placeholder');
      if(attrMap.has(value))el.setAttribute('placeholder',attrMap.get(value));
    }
    for(const attr of ['aria-label','title']){
      const value=el.getAttribute?.(attr);
      if(value&&attrMap.has(value))el.setAttribute(attr,attrMap.get(value));
    }
    for(const node of el.childNodes){
      if(node.nodeType===3)translateTextNode(node);
    }
  }

  function translateCount(){
    const count=document.querySelector('#count');
    if(!count)return;
    count.textContent=count.textContent
      .replace(/\bepizod\b/g,'epizód')
      .replace(/\bdílů\b/g,'dielov')
      .replace(/\bdíl\b/g,'diel')
      .replace(/\bsérií\b/g,'sérií')
      .replace(/\bsérie\b/g,'séria');
  }

  function apply(root=document){
    root.querySelectorAll?.('button,option,strong,.topic,.tag,.tab,.status,.vedator-playlist-empty,.vedator-playlist-count,input,[aria-label],[title]').forEach(translateElement);
    translateCount();
  }

  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;observer.disconnect();apply();observer.observe(document.body,{childList:true,subtree:true,characterData:true})});
  };
  const observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  apply();
})();