(()=>{
  if(window.__vedatorEpisode289Summary)return;
  window.__vedatorEpisode289Summary=true;

  const QUESTIONS=[
    {time:'2:01',title:'Proč se po vypnutí plynu začne z hrnce víc pářit?',points:['Plamen vytváří silný stoupající proud horkého vzduchu, který unáší páru nahoru.','Po vypnutí se proud zastaví a pára se začne hromadit nad hrncem.','Viditelná bílá pára jsou ve skutečnosti drobné zkondenzované kapičky vody.','Ochlazení vzduchu nad hrncem podporuje kondenzaci, takže je pára viditelnější.']},
    {time:'3:24',title:'Jak vznikl čas? Proč má den 24 hodin a rok 365 dní?',points:['Lidé nejdřív sledovali pravidelné střídání dne a noci.','Rok odvodili z počtu východů Slunce mezi opakováním ročních období.','365 dní je aproximace; skutečný rok má přibližně 365,24 dne, proto máme přestupné roky.','Hodina je 1/24 dne a číslo 24 je praktické, protože má mnoho dělitelů.','Siderický den je kratší než 24 hodin, ale občanský den je navázaný na Slunce.']},
    {time:'7:34',title:'Jak se ze Slunce získává vitamín D?',points:['V kůži máme látku, která je prekurzorem vitamínu D.','UV záření dodá energii a přemění ji na pre-vitamin D3.','Ten se následně v játrech a ledvinách mění na aktivní vitamín D.','Obvykle stačí krátké vystavení slunci; není nutné se opalovat celé hodiny.']},
    {time:'9:19',title:'Dá se vytvořit umělá gravitace otáčením lodi?',points:['Nejde o skutečnou gravitaci, ale o odstředivý účinek při rotaci.','Díky principu ekvivalence může zrychlení gravitaci velmi dobře napodobit.','Rotující modul by mohl vytvořit pocit tíhy podobně jako ve sci-fi.']},
    {time:'9:55',title:'Pokud by se Země netočila, cítili bychom silnější gravitaci?',points:['Ano, nejvíc by se to projevilo na rovníku.','Rotace vytváří odstředivý účinek, který nepatrně snižuje výslednou tíhu.','Rozdíl mezi rovníkem a pólem je dán kombinací rotace a tvaru Země.']},
    {time:'10:25',title:'Jak se vědcům ze Starmusu líbilo na Slovensku?',points:['Vědci byli spokojení, především díky možnosti setkat se s kolegy.','Někteří, například Kip Thorne, se na Slovensku cítili velmi dobře.','Starmus působí trochu punkově a neformálně, ale právě to se účastníkům líbilo.']},
    {time:'14:26',title:'Z čeho je černá díra?',points:['Přesně to nevíme.','Vše, co spadne dovnitř, míří k oblasti, kde známé fyzikální zákony přestávají stačit.','Teorie strun nabízí možné matematické modely vnitřní struktury.','Černé díry mají teplotu a entropii, což naznačuje, že mají mikroskopickou vnitřní strukturu.']},
    {time:'17:47',title:'Co je kvantové spletení a jaké má využití?',points:['Jde o společný kvantový stav dvou částic, jejichž výsledky jsou silně korelované i na velkou vzdálenost.','Neumožňuje přenos informace rychleji než světlo.','Využívá se v kvantové komunikaci, počítačích, šifrování a teleportaci kvantových stavů.','Některé teorie spojují kvantové spletení s mikroskopickými červími děrami.']},
    {time:'22:21',title:'Mohou být extra dimenze jen v jádrech atomů?',points:['Ne; pokud extra dimenze existují, měly by být přítomné všude.','Teorie strun obvykle pracuje s dalšími malými prostorovými rozměry.','Možných geometrických uspořádání těchto rozměrů je obrovské množství.']},
    {time:'24:56',title:'Existuje 3D mapa vesmíru?',points:['Ano, máme velmi dobré trojrozměrné mapy blízkého i vzdáleného vesmíru.','Mise Euclid mapuje velkorozměrovou strukturu kosmu.','Rozložení hmoty připomíná kosmickou pavučinu tvořenou vlákny, stěnami, prázdnými oblastmi a kupami galaxií.']},
    {time:'26:51',title:'Oblíbené recepty',points:['Jozef zmiňuje karbonáru, boloňské těstoviny, domácí pizzu a tiramisu.','Samuel má rád japonské curry, irish stew a guláš.','Oba mají rádi italskou kuchyni.']},
    {time:'28:38',title:'Je Wikipedia spolehlivý zdroj?',points:['Ano, ale záleží na tématu.','U vědeckých a nepolarizovaných témat bývá velmi spolehlivá.','U politických konfliktů mohou probíhat editační války a obsah může být spornější.','Pro běžné informace o městech, historii nebo vědě je velmi užitečná.','Autoři Wikipedii sami finančně podporují.']}
  ];

  function isEpisode289(article){return /\bpodcast\s+289\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode289(article)||article.querySelector('.episode-summary'))return;
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