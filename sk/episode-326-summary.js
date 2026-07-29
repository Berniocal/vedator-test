(()=>{
  if(window.__vedatorEpisode326Summary)return;
  window.__vedatorEpisode326Summary=true;

  const QUESTIONS=[
    {time:'1:31',title:'Je možné raketu preletieť cez Jupiter?',points:['Nie, pretože Jupiter nie je len plyn, má hybridné tuhé jadro a extrémne tlaky.','Vnútri je tekutý kovový vodík, obrovské teploty a magnetické pole.','Ich vnútorná štruktúra nie je presne známa, máme len nepriame príznaky.','Prelet cez to by bol nemožný kvôli tlaku, odporu a extrémnym podmienkam.']},
    {time:'4:32',title:'Ako sa topí ľad pod brusľou?',points:['Školské vysvetlenie o otepľovaní nestačí.','Tlak šlapky mení preferovanú súčasti → ľad sa čiastočne roztavuje.','Povrchová vrstva ľadu nie je úplne kryštálna → ľahšie sa roztavuje.','V skutočnosti je to kombinácia: štípenie + tlak + narušená štruktúra povrchu.','Existuje mnoho druhov ľadu, ktoré sa vytvárajú pri rôznych tlakoch.']},
    {time:'8:42',title:'Prečo sa Zem otočí o raz viac k hviezdám ako k Slnku?',points:['Rozlišujeme medzi slnečným dňom (podľa Slnka) a siderickým dňom (podľa hviezd).','Siderický den je kratší: 23 h 56 min.','Preto Zem bude v roku otočiť voči hviezdám 366x, ale proti Slnku 365x.','Je to preto, že Zem obklopuje Slnko a zároveň pridáva jeden deň.']},
    {time:'11:46',title:'Ako funguje mikrovlnná sieť?',points:['Mikrovlnky vytvárajú mikrovlny frekvencie 2,4 GHz.','Vnútri vzniká stála vlna  niektoré miesta sa telia viac, iné menej.','Experiment: bez otočenej tanierky sa môže čokoláda použiť na maxima a minima → výpočet rýchlosti svetla.','Mikrovlny rozpúšťajú molekuly vody (tzv. Mickey Mouse) a ohrevajú jedlo.']},
    {time:'14:38',title:'V ktorej vode sa človek pliva rýchlejšie - slaná alebo sladká?',points:['Záleží na hustotě a viskozitě.','Sladá voda je viac odolná → človek plavá ľahšie.','Ale optimálna viskozita pre rýchlosť nie je triviálna  závisí na telesnej postave.','Vzduch je tiež tekutina, ale príliš slabá pre ľudské plávanie.']},
    {time:'16:17',title:'Ako môže čierna diera zaviazať svetlo, keď fotóny nemajú hmotnosť?',points:['Nie je to o gravitacii hmotnosti, ale o zakrivenosti časoprostoru.','Fotóny pohybujú sa po zakrivených trajektóriách → môžu byť zachytené.','Newtonova gravitacia je len približná, čo Einstein popísal presne.','Experiment s kladivom a perou na Mesiaci ukazuje, že zrýchlenie nie je závislé od hmotnosti.']},
    {time:'18:37',title:'Ako súvisí kruhový spektrum farieb s vlnovými dĺžkami?',points:['Ne každá pojmenovaná barva má vlastní vlnovou délku.','Hnedé je iba tmavo oranžové → intenzita hrá úlohu rovnako ako vlnová dĺžka.','Duchový spektrum zahŕňa len základné farby; ostatné sú kombináciou intenzity a vnímania.','Niektorí ľudia majú genetické mutácie → vidia širší spektrum (napr. ženy častejšie).']},
    {time:'22:39',title:'Bude sa telo navždy otáčať vo vesmíre?',points:['Nie úplne  vesmír nie je úplne prázdny (atómy, fotóny, gravitácia).','Telo môže spomaliť interakciami, výbušnínami alebo gravitačnými vlnami.','Dokonale kulaté těleso by se teoreticky točilo velmi dlouho.','V extrémne dlhom horizonte sa všetko rozpadne na železo (nejzstabilnejšia prvok).']},
    {time:'25:24',title:'Najnepriamenejší experiment v histórii vedy',points:['Michelson Morley: neexistencia éteru → základ pre teóriu relativity.','Hubble: Našiel, že hmloviny sú iné galaxie.','Reliktové záření: nečekaný signál z vesmíru.','Zrychlené rozpínání vesmíru: objev temné energie.','Youngův experiment: světlo je vlna.','Fotoelektrický jev: světlo je částice.']},
    {time:'30:47',title:'Môže GMO potravina ublížiť človeku?',points:['V EÚ sú GMO rastliny zakázané → obyčajný človek ich nesnáša.','GMO môže byť užitočné (zlatá ryža, odolnosť voči suchosti, vyššia výživnosť).','Riziko existuje, ale pri správnom testovaní je minimálne.','Šlechtění je vlastně pomalá forma genetické modifikace.','Problém je skôr v sociálnom vnímaní a právnych aspektoch (genové patenty).']},
    {time:'35:36',title:'Ďakujem od poslucháčky Danky',points:['Ďakuje za podcast, témy, humor a podporu v ťažkých časoch.','Cení slovenský jazyk, aj keď nie je z Slovenska.','Autoři jí děkují a posílají pozdrav.']}
  ];

  function isEpisode326(article){return /\bpodcast\s+326\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode326(article)||article.querySelector('.episode-summary'))return;
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