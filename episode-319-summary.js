(()=>{
  if(window.__vedatorEpisode319Summary)return;
  window.__vedatorEpisode319Summary=true;

  const QUESTIONS=[
    {time:'2:21',title:'Proč hvězdy na noční obloze blikají a planety ne?',points:['Hvězdy jsou na obloze jen bodové zdroje světla.','Světlo prochází atmosférou, která má turbulentní vrstvy → lom světla → blikání.','Planety jsou na obloze plošší a větší, takže se drobné změny v atmosféře „průměrují“.','Slunce nebliká, protože je obrovské na obloze.']},
    {time:'3:42',title:'Proč si lidé dokážou představit milion eur, ale ne milion let?',points:['Peníze jsou hmatatelné a lze si je převést na konkrétní věci, například auto nebo byt.','Čas v řádu milionů let je mimo lidskou zkušenost.','Lidské životy se mění rychle – i 1000 let je těžké si představit.','Kontinenty se pohybují rychlostí růstu nehtů, ale za miliony let se svět dramaticky změní.']},
    {time:'7:45',title:'Plyne čas v prázdných místech vesmíru rychleji než u černé díry?',points:['Ano, ale rozdíl je malý, pokud nejde o extrémní gravitaci.','Slunce zpomaluje čas jen o miliontiny.','Černá díra způsobí mnohem výraznější zpomalení času.','Pro běžné měření, kalendář a lidský život je rozdíl zanedbatelný.']},
    {time:'9:32',title:'Je naše Slunce „polárkou“ pro nějakou jinou planetu?',points:['Teoreticky ano.','Polárka je hvězda, která leží na ose rotace planety.','V prostoru je mnoho planet, jejichž osa může být namířená přesně na Slunce.','Nevíme o žádné konkrétní, ale není to nepravděpodobné.']},
    {time:'11:07',title:'Můžou vznikat nová souhvězdí? A zanikají stará?',points:['Souhvězdí jsou jen lidské kresby na obloze.','Hvězdy v jednom souhvězdí mohou být stovky světelných let od sebe.','Hvězdy se pohybují, takže se souhvězdí v čase mění.','Za tisíce let bude Velký vůz vypadat jinak.','Při kolizi galaxií se obloha dramaticky změní.']},
    {time:'13:38',title:'Existuje oblast teoretické fyziky, která nevyžaduje těžkou matematiku?',points:['Ano, například kvantová informatika.','Stačí lineární algebra, tedy matice a vektory.','Nejsou nutné diferenciální rovnice ani dráhové integrály.','Některé části kvantové fyziky jsou překvapivě přístupné.']},
    {time:'15:08',title:'Existují bludné černé díry?',points:['Ano, teoreticky i pozorovaně.','Při kolizi galaxií může být černá díra vymrštěna gravitační interakcí.','Byly pozorovány případy černé díry letící plynem mimo centrum galaxie.','Šance, že narazí do Země, je extrémně malá, ale nenulová.']},
    {time:'16:51',title:'Co je kvantová mechanika a jak ovlivňuje naši realitu?',points:['Popisuje chování atomů a částic.','Kvantové jevy se mohou objevit i v makrosvětě, pokud je systém dostatečně izolovaný.','Kvantová mechanika umožnila pochopit chemii.','Výpočtová chemie je aplikovaná kvantová fyzika.','Díky ní rozumíme materiálům, reakcím a elektronům.']},
    {time:'19:22',title:'Můžeme vytvořit „mutanta“?',points:['Mutace probíhají neustále – všichni jsme mutanti.','Šlechtění je forma řízené mutace.','Genetické zásahy u lidí jsou eticky sporné, ale existují případy opravy vadného genu.','GMO rostliny mohou pomáhat řešit nedostatek vitamínů.','Geneticky upravené bakterie vyrábějí inzulín.']},
    {time:'22:49',title:'Co se stane, když ve vodě nahradíme vodík deuteriem?',points:['Deuterium je těžký vodík.','V malém množství je neškodné.','Ve velkém množství zpomaluje metabolické procesy.','Těžká voda může být při vysoké koncentraci smrtelná.','Využívá se v některých jaderných reaktorech.']},
    {time:'25:47',title:'Je větší šance uplatnit se ve vědě s fyzikou nebo matematikou?',points:['Statisticky mírně více matematiků zůstává v akademii.','Fyzika i matematika mají velké uplatnění v byznysu.','Záleží hlavně na tom, co člověka baví.','STEM obory jsou podporované, protože mnoho absolventů končí v technologickém sektoru.']},
    {time:'30:39',title:'Jaký čas platí na ISS?',points:['Používá se GMT, tedy Greenwich Mean Time.','Posádka používá také interní čas „elapsed mission time“.','Astronauti vidí přibližně 18 východů a západů Slunce denně, takže přirozený denní rytmus nefunguje.','Čas je důležitý hlavně kvůli synchronizaci se Zemí.']}
  ];

  function isEpisode319(article){return /\bpodcast\s+319\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode319(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');
    details.className='episode-summary';
    const summary=document.createElement('summary');
    summary.textContent='Shrnutí dílu';
    const body=document.createElement('div');
    body.className='episode-summary-body';

    for(const item of QUESTIONS){
      const block=document.createElement('div');
      block.className='summary-block';
      const time=document.createElement('div');time.className='summary-time';time.textContent=item.time;
      const title=document.createElement('div');title.className='summary-title';title.textContent=item.title;
      block.append(time,title);
      const list=document.createElement('ul');
      for(const point of item.points){const li=document.createElement('li');li.textContent=point;list.appendChild(li)}
      block.appendChild(list);body.appendChild(block);
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