(()=>{
  if(window.__vedatorEpisode313Summary)return;
  window.__vedatorEpisode313Summary=true;

  const QUESTIONS=[
    {time:'1:52',title:'Jak fungují permanentní magnety?',points:['Atomy mají magnetické momenty vznikající například spinem a pohybem elektronů.','Magnet vzniká, když se tyto malé magnetické momenty v materiálu převážně zarovnají.','Permanentní magnet nečerpá energii z okolí; jde o stabilní uspořádání částic.']},
    {time:'3:01',title:'Proč lidé věří v plochou Zemi?',points:['Konspirační teorie mohou dávat pocit výjimečnosti a intelektuální nadřazenosti.','Velká část internetových skupin může být spíš humor než skutečná víra.','Dezinformace a uzavřené internetové bubliny ale udržují malé jádro skutečných zastánců.']},
    {time:'5:13',title:'Jak dlouho trvá cesta na Mars?',points:['Při vhodné vzájemné poloze Země a Marsu trvá cesta přibližně půl roku.','Vhodná startovací okna se opakují zhruba jednou za dva roky.','První lidské mise mohou být kvůli složité logistice návratu jednosměrné.']},
    {time:'7:12',title:'Může černá díra pohltit něco většího než ona sama?',points:['Ano, černé díry běžně pohlcují objekty větší než jejich horizont událostí.','Zmiňují případy, kdy černá díra narušila a postupně pohltila hvězdu.','Přirovnávají ji k obřímu kompresoru, který hmotu postupně nasává a stlačuje.']},
    {time:'9:02',title:'Co je to guľový blesk?',points:['Běžný blesk vzniká přeskokem elektrického náboje.','Kulový blesk bývá popisován jako samostatná plazmová koule, ale jeho existence nebyla spolehlivě prokázána.','Krátké světelné jevy po úderu blesku mohou pozorovateli připomínat kulové vzplanutí.']},
    {time:'10:29',title:'Proč má nalévání horké vody jiný zvuk než studené?',points:['Rozdíl souvisí s odlišným chováním bublinek při různých teplotách.','Horká voda vytváří více drobných bublinek, které tlumí vysoké frekvence, a zvuk proto působí dutěji.','Rozdíl lze doma zkoumat pomocí spektrogramu zvuku.']},
    {time:'12:19',title:'Podcastové aplikace',points:['Google Podcasty už neexistují.','Samuel používá Spotify a Jozef Apple Podcasts.','Zmiňují také vlastní Vedátorskou aplikaci.']},
    {time:'15:21',title:'Kolik váží Slunce a jak hvězdy hubnou?',points:['Slunce má hmotnost přibližně 2 × 10³⁰ kg.','Hvězdy během života ztrácejí malé procento hmotnosti výrony látky a přeměnou hmoty na energii.','Největší úbytek nastává v závěrečných fázích života hvězdy.']},
    {time:'17:45',title:'Kolik práce stojí odpověď na jednu otázku?',points:['Většina odpovědí vychází z témat, kterým se už dříve věnovali.','Jen několik otázek vyžaduje krátké dohledání konkrétních informací.']},
    {time:'18:38',title:'Můžeme čerpat energii ze středu Země?',points:['Přímo ze středu Země zatím ne; nejhlubší vrt dosahuje jen přibližně 12 km.','Geotermální energii lze využívat už v mnohem menších hloubkách.','V blízkosti jádra jsou teplota a tlak příliš vysoké pro současné materiály a technologie.']},
    {time:'19:10',title:'Jak funguje fotovoltaika?',points:['Fotony uvolní elektrony v materiálu a elektrické pole je přinutí procházet obvodem, čímž vzniká proud.','Princip souvisí s fotoelektrickým jevem, který vysvětlil Einstein.','Velký prostor ke zlepšení je hlavně ve vývoji účinnějších materiálů.']},
    {time:'21:15',title:'Můžeme jednou žít na Měsíci?',points:['Ano, spíše ale v dočasných výzkumných základnách než v běžných městech.','Hlavními problémy jsou kosmické záření, ostrý regolit a chybějící atmosféra.','Výhodou může být vodní led a velmi dobré podmínky pro obří radioteleskopy.']},
    {time:'24:08',title:'Co právě čtou?',points:['Doporučují knihy Odvaha být neobľúbený, Wheel of Time, Za horizontom udalostí a Červenákovy detektivky.','Zmiňují také audioknihy.','Baví je sci-fi a fantasy zasazené do známých reálií.']}
  ];

  function isEpisode313(article){return /\bpodcast\s+313\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode313(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');details.className='episode-summary';
    const summary=document.createElement('summary');summary.textContent='Shrnutí dílu';
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