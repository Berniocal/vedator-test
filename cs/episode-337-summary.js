(()=>{
  if(window.__vedatorEpisode337Summary)return;
  window.__vedatorEpisode337Summary=true;

  const QUESTIONS=[
    {time:'3:47',title:'Kvantová náhodnost a skryté parametry',question:'Existuje objektivní náhodnost? Nebo je to jen naše neznalost?',points:['Kvantová náhodnost není jen „neznalost“ jako u hodu kostkou.','Teorie skrytých parametrů byla testována; Bellovy nerovnosti ukazují, že kvantová náhodnost je jiná než klasická.','Experimenty jsou extrémně náročné, ale výsledky podporují skutečnou kvantovou náhodnost.','Samuel preferuje Everettovu interpretaci (Many Worlds).']},
    {time:'6:06',title:'Je ve fyzice něco úplně náhodné?',points:['Kvantová fyzika je jediná oblast, kde se zdá být náhodnost skutečná.','V Everettově interpretaci je i kvantová fyzika deterministická, jen se větví vesmíry.','Ostatní jevy jsou deterministické, pouze nemáme nekonečné množství informací.']},
    {time:'7:01',title:'Schrödingerova kočka, ale s člověkem a uspávacím plynem',question:'Co by člověk subjektivně cítil ve stavu superpozice – bdělý i spící?',points:['V Everettově interpretaci se vesmír rozdvojí.','Jedna verze člověka spí, druhá je vzhůru.','Člověk necítí obojí zároveň.','Pozorovatel při otevření krabice přejde do jedné z větví.']},
    {time:'9:18',title:'Žijeme v simulaci?',question:'Může být vlnová povaha částic způsob, jak simulace šetří paměť?',points:['Samuel tuto teorii nemá rád.','Logický problém: každá simulovaná civilizace by došla k závěru, že je simulovaná, což vede k nekonečnému regresu.','Occamova břitva: jednodušší je předpokládat, že nejsme simulace.','„Rozmazanost“ vesmíru je spíš důsledek toho, že matematické ideály jsou přesnější než realita.']},
    {time:'12:35',title:'Mimozemšťané bez gravitace: jak vysvětlit gravitaci?',question:'Jak vysvětlit gravitaci bytosti z vesmíru, kde gravitace neexistuje?',points:['Jednoduchá demonstrace: hodit předmět na zem.','Lepší vysvětlení: gravitace je pocit podobný zrychlení ve výtahu.','Gravitace je zakřivení časoprostoru hmotou.','V jejich vesmíru by existovalo zrychlení, ale ne zakřivení časoprostoru.']},
    {time:'15:14',title:'Proč vidíme stále stejnou stranu Měsíce?',points:['Měsíc rotuje stejnou rychlostí, jakou obíhá Zemi – jde o přílivové uzamčení.','Stejně jsou vzájemně uzamčeni Pluto a Charon.','Země se kdysi otáčela rychleji a den trval přibližně čtyři hodiny.','Měsíc se vzdaluje, takže v budoucnu už nebude úplné zatmění Slunce.']},
    {time:'19:40',title:'Ovlivňuje rotace Země délku letu letadla?',points:['Dominantní vliv mají větry, zejména jet stream.','Rotace Země se projeví jen nepřímo přes Coriolisovu a odstředivou sílu.','Proto bývají lety ve směru západ–východ kratší.']},
    {time:'22:44',title:'Jak funguje mikrovlnka?',points:['Mikrovlnka vytváří stojaté vlnění o frekvenci přibližně 2,4 GHz.','Voda je polární; elektrické pole její molekuly rozkmitá a tím ji ohřívá.','Proto mají mikrovlnné trouby podobné rozměry – souvisí to s vlnovou délkou.','Bez otočného talíře lze změřit vlnovou délku a dopočítat rychlost světla.']},
    {time:'27:15',title:'Když si nafoukám helium do uší, budu slyšet jinak?',points:['Ano.','V heliu je vyšší rychlost zvuku, což posune frekvence a zvuk zní výše.','Jde o stejný princip jako u heliového hlasu.']},
    {time:'28:49',title:'Proč při fouknutí na ruku jednou cítíme teplo a jindy chlad?',points:['Pomalu foukaný vzduch je teplý vzduch z plic, takže působí teple.','Rychlý proud vzduchu odfoukne teplou vrstvu u kůže a ochlazuje.','Stejný princip vysvětluje ochlazování větrem v létě.']},
    {time:'30:26',title:'Posunul se odhad věku vesmíru na 30 miliard let?',points:['Ne, stáří vesmíru zůstává přibližně 13,8 miliardy let.','Číslo 30 miliard se týká vzdáleností nejvzdálenějších oblastí kvůli rozpínání vesmíru.','Existují alternativní teorie, například unavené světlo, ale nesedí na ostatní pozorování.','Webbův teleskop našel velmi staré galaxie, takže možná bude nutné upravit některé modely.']},
    {time:'35:33',title:'Proč se po zatřesení limonádou zvýší tlak?',points:['Oxid uhličitý je rozpuštěný v kapalině.','Tlakové vlny při zatřesení vytvoří množství bublinek.','Bublinky se rozpínají, zvýší tlak a po otevření nápoj vystříkne.']},
    {time:'37:27',title:'Co nejkrásnějšího jste viděli?',points:['Osobní momenty: narození dítěte a rodina.','Příroda: Liptov, Irsko, útesy a potápění.','Zaznělo také doporučení na cestování po Irsku.']}
  ];

  function isEpisode337(article){return /\bpodcast\s+337\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode337(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');details.className='episode-summary';
    const summary=document.createElement('summary');summary.textContent='Shrnutí dílu';
    const body=document.createElement('div');body.className='episode-summary-body';
    for(const item of QUESTIONS){
      const block=document.createElement('div');block.className='summary-block';
      const time=document.createElement('div');time.className='summary-time';time.textContent=item.time;
      const title=document.createElement('div');title.className='summary-title';title.textContent=item.title;
      block.append(time,title);
      if(item.question){const q=document.createElement('div');q.className='summary-question';q.textContent=`Otázka: ${item.question}`;block.appendChild(q)}
      const list=document.createElement('ul');
      for(const point of item.points){const li=document.createElement('li');li.textContent=point;list.appendChild(li)}
      block.appendChild(list);body.appendChild(block);
    }
    const note=document.createElement('div');note.className='summary-note';note.textContent='Kliknutím na čas se epizoda spustí přímo u dané otázky.';
    body.appendChild(note);details.append(summary,body);article.appendChild(details);
  }
  const episodes=document.querySelector('#episodes');if(!episodes)return;
  episodes.querySelectorAll('article').forEach(install);
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches?.('article'))install(node);node.querySelectorAll?.('article').forEach(install)}}).observe(episodes,{childList:true});
})();