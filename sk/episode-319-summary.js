(()=>{
  if(window.__vedatorEpisode319Summary)return;
  window.__vedatorEpisode319Summary=true;

  const QUESTIONS=[
    {time:'2:21',title:'Prečo hviezdy bliskajú v nočnom oblohe a planéty nie?',points:['Hvězdy jsou na obloze jen bodové zdroje světla.','Svetlo prechádza atmosférou, ktorá má turbulentné vrstvy → zlom svetla → blesk.','Planéty sú širšie a väčšie v oblohe, takže drobné zmeny v atmosfére sa mierne vyskytujú.','Slnko nie je jasné, pretože je obrovské na oblohe.']},
    {time:'3:42',title:'Proč si lidé dokážou představit milion eur, ale ne milion let?',points:['Peniaze sú hmatateľné a môžu sa použiť na konkrétne veci, napríklad auto alebo byt.','Čas v řádu milionů let je mimo lidskou zkušenost.','Lidské životy se mění rychle – i 1000 let je těžké si představit.','Kontinenty se pohybují rychlostí růstu nehtů, ale za miliony let se svět dramaticky změní.']},
    {time:'7:45',title:'Čas v prázdnych miestach vesmíru prechádza rýchlejšie ako v čiernej diere?',points:['Áno, ale rozdiel je malý, pokiaľ to nie je extrémna gravitácia.','Slunce zpomaluje čas jen o miliontiny.','Černá díra způsobí mnohem výraznější zpomalení času.','Pre bežné merania, kalendár a ľudské životy je rozdiel zanedbateľný.']},
    {time:'9:32',title:'Je naše Slnko polárnou planétou pre nejakú inú planétu?',points:['Teoreticky ano.','Polarka je hviezda, ktorá leží na os rotácie planéty.','Vo vesmíre je mnoho planét, ktorých os môže byť namierený priamo na Slnko.','O žiadnom konkrétnom nevieme, ale nie je to nepravdepodobné.']},
    {time:'11:07',title:'Môžu vzniknúť nové hviezdy a zmiznúť staré?',points:['Souhvězdí jsou jen lidské kresby na obloze.','Hvězdy v jednom souhvězdí mohou být stovky světelných let od sebe.','Hviezdy sa pohybujú, takže súhviezdy sa menia v čase.','Za tisíce let bude Velký vůz vypadat jinak.','Při kolizi galaxií se obloha dramaticky změní.']},
    {time:'13:38',title:'Existuje oblasť teoretickej fyziky, ktorá nevyžaduje ťažkú matematiku?',points:['Áno, napríklad kvantová informatika.','Stačí len lineárna algebra, teda matéria a vektory.','Nejsou nutné diferenciální rovnice ani dráhové integrály.','Některé části kvantové fyziky jsou překvapivě přístupné.']},
    {time:'15:08',title:'Existujú bláznivé čierne diery?',points:['Áno, teoreticky aj pozorovane.','Při kolizi galaxií může být černá díra vymrštěna gravitační interakcí.','Byly pozorovány případy černé díry letící plynem mimo centrum galaxie.','Šanca, že sa do Zem dostane, je veľmi malá, ale nie nula.']},
    {time:'16:51',title:'Čo je kvantová mechanika a ako ovplyvňuje našu realitu?',points:['Popisuje chování atomů a částic.','Kvantové fenomény sa môžu vyskytnúť aj v makrosvetoch, ak je systém dostatočne izolovaný.','Kvantová mechanika umožnila pochopit chemii.','Výpočtová chemie je aplikovaná kvantová fyzika.','Vďaka nej môžeme pochopiť materiály, reakcie a elektróny.']},
    {time:'19:22',title:'Môžeme vytvoriť mutanta?',points:['Mutácie sa neustále vyskytujú. Všetci sme mutanti.','Šlechtění je forma řízené mutace.','Genetické zákroky v ľuďoch sú eticky sporné, ale existujú prípady opravy vadného genu.','GMO rostliny mohou pomáhat řešit nedostatek vitamínů.','Geneticky upravené bakterie vyrábějí inzulín.']},
    {time:'22:49',title:'Čo sa stane, keď nahradíme vodík deuteriom vo vode?',points:['Deuterium je těžký vodík.','V malém množství je neškodné.','Ve velkém množství zpomaluje metabolické procesy.','Těžká voda může být při vysoké koncentraci smrtelná.','Využívá se v některých jaderných reaktorech.']},
    {time:'25:47',title:'Je lepšie využiť si vedeckú prácu s fyzikou alebo matematikou?',points:['Statisticky mírně více matematiků zůstává v akademii.','Fyzika i matematika mají velké uplatnění v byznysu.','Je to záležitosťou toho, čo si človek užije.','STEM obory sú podporované, pretože mnoho absolventov skončí v technologickom sektore.']},
    {time:'30:39',title:'Ako dlho platí na ISS?',points:['Používa sa GMT, čiže Greenwich Mean Time.','Posádka používa aj vnútorné časové obdobie elapsed mission time.','Astronátovia vidia približne 18 východu a západu Slnka denne, takže prirodzený denný rytmus nefunguje.','Čas je důležitý hlavně kvůli synchronizaci se Zemí.']}
  ];

  function isEpisode319(article){return /\bpodcast\s+319\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode319(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');
    details.className='episode-summary';
    const summary=document.createElement('summary');
    summary.textContent='Zhrnutie diely';
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