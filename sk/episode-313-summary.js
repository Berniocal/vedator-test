(()=>{
  if(window.__vedatorEpisode313Summary)return;
  window.__vedatorEpisode313Summary=true;

  const QUESTIONS=[
    {time:'1:52',title:'Ako fungujú trvalé magnety?',points:['Atomy mají magnetické momenty vznikající například spinem a pohybem elektronů.','Magnet vzniká, keď sa tieto malé magnetické momenty vo materiáli väčšinou vyrovnávajú.','Stály magnet nevyužíva energiu z okolia; je to stabilné usporiadanie častíc.']},
    {time:'3:01',title:'Prečo ľudia veria v plochotu Zeme?',points:['Konspirační teorie mohou dávat pocit výjimečnosti a intelektuální nadřazenosti.','Velká část internetových skupin může být spíš humor než skutečná víra.','Dezinformace a uzavřené internetové bubliny ale udržují malé jádro skutečných zastánců.']},
    {time:'5:13',title:'Ako dlho trvá cesta na Mars?',points:['Při vhodné vzájemné poloze Země a Marsu trvá cesta přibližně půl roku.','Vhodná startovací okna se opakují zhruba jednou za dva roky.','První lidské mise mohou být kvůli složité logistice návratu jednosměrné.']},
    {time:'7:12',title:'Môže čierna diera pochlať niečo väčšie ako sama?',points:['Áno, čierne diery obvykle pohlcujú objekty väčšie ako ich horizont udalostí.','Vravia, že čierna diera roztratila a postupne pohltila hviezdu.','Prirovnávajú ju k obrovskému kompresoru, ktorý postupne absorbuje a stlačuje hmotu.']},
    {time:'9:02',title:'Co je to guľový blesk?',points:['Běžný blesk vzniká přeskokem elektrického náboje.','Blahový blesk je často popisovaný ako samostatný plazmatický blesk, ale jeho existencia nebola spoľahlivo dokázaná.','Krátké světelné jevy po úderu blesku mohou pozorovateli připomínat kulové vzplanutí.']},
    {time:'10:29',title:'Prečo má varené vody iný zvuk ako studené?',points:['Rozdíl souvisí s odlišným chováním bublinek při různých teplotách.','Horúca voda vytvára viac drobných bublin, ktoré tlmučia vysoké frekvencie, a zvuk je tak prázdnejší.','Rozdíl lze doma zkoumat pomocí spektrogramu zvuku.']},
    {time:'12:19',title:'Podcastové aplikácie',points:['Google Podcasty už neexistují.','Samuel používá Spotify a Jozef Apple Podcasts.','Zmiňují také vlastní Vedátorskou aplikaci.']},
    {time:'15:21',title:'Ako váži Slnko a ako sú hviezdy chudé?',points:['Slnko má hmotnosť približne 2 × 1030 kg.','Hvězdy během života ztrácejí malé procento hmotnosti výrony látky a přeměnou hmoty na energii.','Největší úbytek nastává v závěrečných fázích života hvězdy.']},
    {time:'17:45',title:'Koľko práce stojí odpoveď na jednu otázku?',points:['Väčšina odpovedí je založená na témach, ktoré sa už predtým zaoberali.','Jen několik otázek vyžaduje krátké dohledání konkrétních informací.']},
    {time:'18:38',title:'Môžeme čerpať energiu z centra Zem?',points:['Neprostredne od centra Zem, zatiaľ; najhlbšia diera dosahuje len približne 12 km.','Geotermální energii lze využívat už v mnohem menších hloubkách.','V blízkosti jádra jsou teplota a tlak příliš vysoké pro současné materiály a technologie.']},
    {time:'19:10',title:'Ako funguje fotovoltaica?',points:['Fotóny uvoľňujú elektróny v materiáli a elektrické pole ich prinúti prejsť okruhom, čo vytvára prúd.','Princip súvisí s fotonáčkou, ktorú vysvetlil Einstein.','Velký prostor ke zlepšení je hlavně ve vývoji účinnějších materiálů.']},
    {time:'21:15',title:'Môžeme niekedy žiť na Mesiaci?',points:['Áno, ale skôr na dočasných výskumných základniach ako v bežných mestách.','Hlavné problémy sú kozmické žiarenie, ostré regulity a chýbajúca atmosféra.','Výhodou může být vodní led a velmi dobré podmínky pro obří radioteleskopy.']},
    {time:'24:08',title:'Čo práve čítajú?',points:['Doporučují knihy Odvaha být neobľúbený, Wheel of Time, Za horizontom udalostí a Červenákovy detektivky.','Zmiňují také audioknihy.','Baví je sci-fi a fantasy zasazené do známých reálií.']}
  ];

  function isEpisode313(article){return /\bpodcast\s+313\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode313(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');details.className='episode-summary';
    const summary=document.createElement('summary');summary.textContent='Zhrnutie diely';
    const body=document.createElement('div');body.className='episode-summary-body';
    for(const item of QUESTIONS){
      const block=document.createElement('div');block.className='summary-block';
      const time=document.createElement('div');time.className='summary-time';time.textContent=item.time;
      const title=document.createElement('div');title.className='summary-title';title.textContent=item.title;
      const list=document.createElement('ul');
      for(const point of item.points){const li=document.createElement('li');li.textContent=point;list.appendChild(li)}
      block.append(time,title,list);body.appendChild(block);
    }
    const note=document.createElement('div');note.className='summary-note';note.textContent='Kliknutím na čas se epizoda spustí přímo u dané otázky.';
    body.appendChild(note);details.append(summary,body);article.appendChild(details);
  }
  const episodes=document.querySelector('#episodes');if(!episodes)return;
  episodes.querySelectorAll('article').forEach(install);
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches?.('article'))install(node);node.querySelectorAll?.('article').forEach(install)}}).observe(episodes,{childList:true});
})();