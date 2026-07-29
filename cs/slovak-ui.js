(()=>{
  if(window.__vedatorSlovakUi)return;
  window.__vedatorSlovakUi=true;

  const exact=new Map([
    ['Vše','Vše'],['Epizody','Epizody'],['Série','Série'],['Playlisty','Playlisty'],
    ['Mimozemský život','Mimozemský život'],['Kosmologie','Kozmológia'],['Temná energie','Tmavá energia'],
    ['Černé díry','Černé díry'],['Kvantová fyzika','Kvantová fyzika'],['Relativita','Relativita'],
    ['Astronomie','Astronómia'],['Biologie a medicína','Biológia a medicína'],['Matematika','Matematika'],
    ['Technologie a AI','Technológie a AI'],['Země a příroda','Země a příroda'],['Chemie a materiály','Chemie a materiály'],
    ['Společnost a psychologie','Společnost a psychologie'],['Přehrát','Přehrát'],['Číst více','Čítať viac'],
    ['Číst méně','Čítať menej'],['Nejnovější','Najnovšie'],['Nejstarší','Najstaršie'],
    ['Podle čísla dílu','Podle čísla díla'],['Podle počtu dílů','Počet dílů'],
    ['Podle abecedy','Podle abecedy'],['Podle stáří prvního dílu','Podle věku prvního díla'],
    ['Načítám epizody…','Čtu epizody...'],['Načítám katalog…','Načítavam katalóg…'],
    ['Moje playlisty','Moje playlisty'],['Playlist je prázdný.','Playlist je prázdny.'],
    ['Instalovat','Inštalovať'],['Předchozí','Předchozí'],['Další','Další'],['Stáhnout','Sníhání'],
    ['Rychlost','Rýchlosť'],['Pozastavit','Pozastaviť']
  ]);

  const attrMap=new Map([
    ['Hledat česky nebo slovensky: černé/čierne díry, vesmír…','Hledat slovensky: Černá díra, vesmír...'],
    ['Předchozí díl','Předchozí díl'],['Další díl','Další díl'],['Přehrát','Přehrát'],
    ['Pozastavit','Pozastaviť'],['O 10 sekund zpět','O 10 vteřin zpátky.'],['O 10 sekund dopředu','O 10 sekúnd dopredu']
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