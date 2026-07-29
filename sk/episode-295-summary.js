(()=>{
  if(window.__vedatorEpisode295Summary)return;
  window.__vedatorEpisode295Summary=true;

  const QUESTIONS=[
    {time:'0:37',title:'Rozdiel medzi benzínovým, naftovým a vodíkovým motorom',points:['U benzínového a dieselového motoru je hlavní rozdíl v zapalování: svíčka oproti samovznícení tlakem.','Vodík sa môže použiť v spaľovacom motore, kde sa vytvára hlavne vodná parnosť.','Ve vodíkovém článku vodík funguje jako nosič energie a chemickou reakcí vzniká elektřina.','Výhodou jsou čisté emise a možnost využít přebytky energie.','Problémom sú skladovanie, vysoký tlak, čerpanie a nedostatočne vyvinutá infraštruktúra.']},
    {time:'3:45',title:'Prečo častí rýchlejšie ako svetlo v médiu nepredstavujú paradox?',points:['Vo vode sa svetlo šíri približne o 30% pomalšie ako vo vakuu.','Nabité částice mohou rychlost světla v daném médiu překonat a vzniká Čerenkovovo záření.','Nejde ale o překročení maximální rychlosti ve vakuu.','Rychlost světla je historický název pro maximální povolenou rychlost nehmotných částic ve vesmíru.']},
    {time:'6:28',title:'Existujú magnetické monopoly?',points:['Experimentálně zatím nikdy nebyly pozorovány.','Teoreticky by mohly vznikat při rozpadu sjednocených sil po velkém třesku.','Měly by být extrémně těžké a vzácné a inflace je mohla rozptýlit.','Jediný monopol by mohol vysvetliť presne opačnú, ale rovnako veľkú náboj elektrónu a protónu.']},
    {time:'8:32',title:'Problém troch tiel',points:['Pohyb jednoho objektu je jednoduchý a dva objekty jsou stále přesně řešitelné.','U tří těles se symetrie rozpadají a systém bývá chaotický.','Vývoj je velmi citlivý na počáteční podmínky.','Existujú stabilné konfigurácie, ale mnoho systémov sa časom rozpadá.','V rané sluneční soustavě se mohlo měnit i pořadí planet.']},
    {time:'11:25',title:'Gravitatívny zrkadlo: môžeme vidieť Zem v minulosti?',points:['Teoreticky může světlo oběhnout černou díru a vrátit se jako gravitační ozvěna.','Prakticky by se signál příliš rozptýlil a obraz by nebyl použitelný.']},
    {time:'12:11',title:'Má mesiac vplyv na spánok?',points:['Vliv může mít hlavně větší množství světla.','Pomáha spať v úplnom tme, škrob alebo špunka.','Mesiac je výrazne ovplyvnený niektorými zvieratami, napríklad hmyzom a korytármi.','Některé druhy se orientují podle hvězd a Mléčné dráhy.']},
    {time:'15:20',title:'Majú zvieratá cudzie jazyky?',points:['Přesnější je mluvit o dialektech než o samostatných jazycích.','Velryby mají různé zpěvy podle regionů.','Sokoli mohou reagovat jen na místní zvuky.','Také zvuky koček mohou mít regionální variace.']},
    {time:'17:02',title:'Ako veľkú časť atmosféry musí byť očistená, aby sa nevidelo oblaky?',points:['Hustá část atmosféry sahá přibližně do výšky 10 km.','Kvůli zakřivení Země nevidíme dál než několik stovek kilometrů.','Z Zeme vidíme iba približne 0,039% atmosféry.','Z letadla ve výšce kolem 10 km by byl výpočet jiný.']},
    {time:'20:05',title:'Ako ďaleko je oblak priamo nad obzorom?',points:['Záleží na výšce oblaku a zakřivení Země.','Při výšce očí 2 m může být objekt 300 km daleko skrytý za horizontem asi o 7 km.','Vysoké mraky proto můžeme vidět ze vzdálenosti stovek kilometrů.']},
    {time:'21:53',title:'Aj tmavá látka spadne do čiernej diery?',points:['Áno, gravitacia pôsobí aj na temnú hmotu.','Pretože elektromagneticky takmer neinteraguje, môže padnúť ľahšie.','Súčasne však nemusí byť schopný efektívne strácať energiu, takže môže dlhé kroky okolo čiernej diery.']},
    {time:'23:27',title:'Môže elektrón vyčerpať energiu pri obluku jadra?',points:['Podle klasické fyziky by měl elektron vyzářit energii a spadnout do jádra.','V kvantové mechanice ale elektron neobíhá jako planeta.','Je popsán pravděpodobnostním oblakem a ve stacionárním stavu energii nevyzařuje.']},
    {time:'25:19',title:'Je rýchlosť svetla neprekonateľná?',points:['Áno, je to maximálna rýchlosť vo vesmíre.','Hmotné částice se pohybují vždy pomaleji než světlo.','Nehmotné částice se pohybují přesně rychlostí světla.','Tachyony sú len hypotetické častice, ktoré by sa pohybovali rýchlejšie.']},
    {time:'26:16',title:'Astronomické jednotky, parsek, svetelný rok a červený skok',points:['Astronomická jednotka je vzdialenosť Zeme od Slnka, približne 150 miliónov kilometrov.','Parsek je definován pomocí paralaxy jedné obloukové vteřiny.','Svetelný rok je vzdialenosť, ktorú svetlo za rok uráža.','Jeden parsek je približne 3,3 svetelných rokov.','Červený posuv se používá pro velmi vzdálené objekty a nelze ho převést jedním jednoduchým poměrem.']},
    {time:'29:20',title:'Poslúchajúci chváli podcast',points:['Počúvač píše, že podcast počúva dlhšie, napríklad pri behu.','Oceňuje zlepšování kvality pořadu.','Autoři děkují a těší je i ocenění Podcast roku.']}
  ];

  function isEpisode295(article){return /\bpodcast\s+295\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode295(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');
    details.className='episode-summary';
    const summary=document.createElement('summary');
    summary.textContent='Zhrnutie diely';
    const body=document.createElement('div');
    body.className='episode-summary-body';
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

  const episodes=document.querySelector('#episodes');
  if(!episodes)return;
  episodes.querySelectorAll('article').forEach(install);
  new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes){
      if(node.nodeType!==1)continue;
      if(node.matches?.('article'))install(node);
      node.querySelectorAll?.('article').forEach(install);
    }
  }).observe(episodes,{childList:true});
})();