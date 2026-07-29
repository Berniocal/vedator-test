(()=>{
  if(window.__vedatorEpisode295Summary)return;
  window.__vedatorEpisode295Summary=true;

  const QUESTIONS=[
    {time:'0:37',title:'Rozdíl mezi benzínovým, dieselovým a vodíkovým motorem',points:['U benzínového a dieselového motoru je hlavní rozdíl v zapalování: svíčka oproti samovznícení tlakem.','Vodík lze použít ve spalovacím motoru, kde vzniká hlavně vodní pára.','Ve vodíkovém článku vodík funguje jako nosič energie a chemickou reakcí vzniká elektřina.','Výhodou jsou čisté emise a možnost využít přebytky energie.','Problémem je skladování, vysoký tlak, čerpání a zatím nedostatečně rozvinutá infrastruktura.']},
    {time:'3:45',title:'Proč částice rychlejší než světlo v médiu nezpůsobují paradox?',points:['Ve vodě se světlo šíří přibližně o 30 % pomaleji než ve vakuu.','Nabité částice mohou rychlost světla v daném médiu překonat a vzniká Čerenkovovo záření.','Nejde ale o překročení maximální rychlosti ve vakuu.','Rychlost světla je historický název pro maximální povolenou rychlost nehmotných částic ve vesmíru.']},
    {time:'6:28',title:'Existují magnetické monopóly?',points:['Experimentálně zatím nikdy nebyly pozorovány.','Teoreticky by mohly vznikat při rozpadu sjednocených sil po velkém třesku.','Měly by být extrémně těžké a vzácné a inflace je mohla rozptýlit.','Jediný monopól by mohl vysvětlit přesně opačný, ale stejně velký náboj elektronu a protonu.']},
    {time:'8:32',title:'Problém tří těles',points:['Pohyb jednoho objektu je jednoduchý a dva objekty jsou stále přesně řešitelné.','U tří těles se symetrie rozpadají a systém bývá chaotický.','Vývoj je velmi citlivý na počáteční podmínky.','Existují stabilní konfigurace, ale mnoho systémů se časem rozpadne.','V rané sluneční soustavě se mohlo měnit i pořadí planet.']},
    {time:'11:25',title:'Gravitační zrcadlo: můžeme vidět Zemi v minulosti?',points:['Teoreticky může světlo oběhnout černou díru a vrátit se jako gravitační ozvěna.','Prakticky by se signál příliš rozptýlil a obraz by nebyl použitelný.']},
    {time:'12:11',title:'Má úplněk vliv na spánek?',points:['Vliv může mít hlavně větší množství světla.','Pomáhá spánek v úplné tmě, škraboška nebo špunty.','Měsíc výrazně ovlivňuje některá zvířata, například hmyz a korytnačky.','Některé druhy se orientují podle hvězd a Mléčné dráhy.']},
    {time:'15:20',title:'Mají zvířata cizí jazyky?',points:['Přesnější je mluvit o dialektech než o samostatných jazycích.','Velryby mají různé zpěvy podle regionů.','Sokoli mohou reagovat jen na místní zvuky.','Také zvuky koček mohou mít regionální variace.']},
    {time:'17:02',title:'Jak velká část atmosféry se musí vyčistit, aby nebyly vidět mraky?',points:['Hustá část atmosféry sahá přibližně do výšky 10 km.','Kvůli zakřivení Země nevidíme dál než několik stovek kilometrů.','Ze země vidíme jen přibližně 0,039 % atmosféry.','Z letadla ve výšce kolem 10 km by byl výpočet jiný.']},
    {time:'20:05',title:'Jak daleko je oblak těsně nad horizontem?',points:['Záleží na výšce oblaku a zakřivení Země.','Při výšce očí 2 m může být objekt 300 km daleko skrytý za horizontem asi o 7 km.','Vysoké mraky proto můžeme vidět ze vzdálenosti stovek kilometrů.']},
    {time:'21:53',title:'Padá do černé díry i tmavá hmota?',points:['Ano, gravitace působí i na tmavou hmotu.','Protože elektromagneticky téměř neinteraguje, může padat snadněji.','Současně ale možná neumí účinně ztrácet energii, takže může kolem černé díry dlouho obíhat.']},
    {time:'23:27',title:'Může elektron vyčerpat energii při obíhání jádra?',points:['Podle klasické fyziky by měl elektron vyzářit energii a spadnout do jádra.','V kvantové mechanice ale elektron neobíhá jako planeta.','Je popsán pravděpodobnostním oblakem a ve stacionárním stavu energii nevyzařuje.']},
    {time:'25:19',title:'Je rychlost světla nepřekonatelná?',points:['Ano, jde o maximální rychlost ve vesmíru.','Hmotné částice se pohybují vždy pomaleji než světlo.','Nehmotné částice se pohybují přesně rychlostí světla.','Tachyony jsou jen hypotetické částice, které by se pohybovaly rychleji.']},
    {time:'26:16',title:'Astronomické jednotky, parsek, světelný rok a červený posuv',points:['Astronomická jednotka je vzdálenost Země–Slunce, přibližně 150 milionů km.','Parsek je definován pomocí paralaxy jedné obloukové vteřiny.','Světelný rok je vzdálenost, kterou světlo urazí za rok.','Jeden parsek odpovídá přibližně 3,3 světelného roku.','Červený posuv se používá pro velmi vzdálené objekty a nelze ho převést jedním jednoduchým poměrem.']},
    {time:'29:20',title:'Posluchač chválí podcast',points:['Posluchač píše, že podcast poslouchá dlouhodobě, například při běhání.','Oceňuje zlepšování kvality pořadu.','Autoři děkují a těší je i ocenění Podcast roku.']}
  ];

  function isEpisode295(article){return /\bpodcast\s+295\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode295(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');
    details.className='episode-summary';
    const summary=document.createElement('summary');
    summary.textContent='Shrnutí dílu';
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