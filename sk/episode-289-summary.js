(()=>{
  if(window.__vedatorEpisode289Summary)return;
  window.__vedatorEpisode289Summary=true;

  const QUESTIONS=[
    {time:'2:01',title:'Prečo sa po vypnutí plynu začne viac páriť z hrnca?',points:['Plamen vytvára silný výstupný prúd horúceho vzduchu, ktorý zvedá páry hore.','Po vypnutí se proud zastaví a pára se začne hromadit nad hrncem.','Viditelná bílá pára jsou ve skutečnosti drobné zkondenzované kapičky vody.','Ochladnutie vzduchu nad hrncom podporuje kondenzáciu, takže je par viditeľnejší.']},
    {time:'3:24',title:'Ako vznikol čas? Prečo má deň 24 hodín a rok 365 dní?',points:['Lidé nejdřív sledovali pravidelné střídání dne a noci.','Rok odvodili z počtu východů Slunce mezi opakováním ročních období.','365 dní je približná doba; skutočný rok má približne 365,24 dní, takže máme prechodné roky.','Hodina je 1/24 dňa a číslo 24 je praktické, pretože má veľa divízorov.','Ciderský deň je kratší ako 24 hodín, ale občiansky deň je spojený s slnkom.']},
    {time:'7:34',title:'Ako sa vitamín D získava zo Slnka?',points:['V koži máme látku, ktorá je prekurzorom vitamínu D.','UV záření dodá energii a přemění ji na pre-vitamin D3.','Ten se následně v játrech a ledvinách mění na aktivní vitamín D.','Zvyčajne stačí krátka expozícia slnku; nie je potrebné sa opálovať celé hodiny.']},
    {time:'9:19',title:'Je možné vytvoriť umelú gravitáciu pri otočení lodi?',points:['Nie je to skutočná gravitácia, ale centrálny účinok pri rotácii.','Díky principu ekvivalence může zrychlení gravitaci velmi dobře napodobit.','Rotující modul by mohl vytvořit pocit tíhy podobně jako ve sci-fi.']},
    {time:'9:55',title:'Ak by Zem nezavrhla, cítili by sme silnejšiu gravitáciu?',points:['Áno, to by sa najviac prejavil v rovnici.','Rotácia vytvára centrálny účinok, ktorý niečo znižuje výslednú hmotnosť.','Rozdíl mezi rovníkem a pólem je dán kombinací rotace a tvaru Země.']},
    {time:'10:25',title:'Ako sa vedci z Starmušovi páčili v Slovensku?',points:['Vedci boli spokojní, najmä vďaka možnosti stretnúť sa s kolegami.','Niektorí, napríklad Kip Thorne, sa v Slovensku cítili veľmi dobre.','Starmus je trochu punkový a neformálny, ale to je to, čo účastníci radi videli.']},
    {time:'14:26',title:'Z čoho je to čierna diera?',points:['Přesně to nevíme.','Všetko, čo sa stane, sa dostane do oblasti, kde známe fyzikálne zákony prestanú stačiť.','Teorie strun nabízí možné matematické modely vnitřní struktury.','Čierné diery majú teplotu a entropie, čo naznačuje, že majú mikroskopickú vnútornú štruktúru.']},
    {time:'17:47',title:'Čo je kvantové spájacie a aké je to využitie?',points:['Ide o spoločné kvantové stav dve častice, ktoré sú silne prepojené aj na veľkú vzdialenosť.','Neumožňuje přenos informace rychleji než světlo.','Používa sa v kvantovej komunikácii, počítačoch, šifrovaní a teleportácii kvantových staníc.','Některé teorie spojují kvantové spletení s mikroskopickými červími děrami.']},
    {time:'22:21',title:'Môžu byť extrasmery len v jadrách atómov?',points:['Nie; ak existujú extra dimenzie, mali by byť všade.','Teorie strun obvykle pracuje s dalšími malými prostorovými rozměry.','Možných geometrických uspořádání těchto rozměrů je obrovské množství.']},
    {time:'24:56',title:'Existuje 3D mapa vesmíru?',points:['Áno, máme veľmi dobré trojrozmerné mapy blízkych a vzdialených vesmírov.','Mise Euclid mapuje velkorozměrovou strukturu kosmu.','Rozloženie hmoty pripomína kozmický pavúk tvorený vláknami, stenami, prázdnymi oblastmi a hromadami galaxií.']},
    {time:'26:51',title:'Obľúbené recepty',points:['Josef spomína na karbonár, boloňské koláčiky, domácu pizzu a tiramisu.','Samuel má rád japonské kurry, irské stewa a gule.','Oba mají rádi italskou kuchyni.']},
    {time:'28:38',title:'Je Wikipédia spoľahlivý zdroj?',points:['Áno, ale záleží na téme.','U vědeckých a nepolarizovaných témat bývá velmi spolehlivá.','U politických konfliktů mohou probíhat editační války a obsah může být spornější.','Je veľmi užitočná pre bežnú informáciu o mestách, histórii alebo vede.','Autoři Wikipedii sami finančně podporují.']}
  ];

  function isEpisode289(article){return /\bpodcast\s+289\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode289(article)||article.querySelector('.episode-summary'))return;
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