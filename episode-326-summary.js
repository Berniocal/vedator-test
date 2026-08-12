(()=>{
  if(window.__vedatorEpisode326Summary)return;
  window.__vedatorEpisode326Summary=true;

  const QUESTIONS=[
    {time:'1:31',title:'Dá se proletět raketou skrz Jupiter?',points:['Ne, protože Jupiter není jen plyn – má hybridní tuhé jádro a extrémní tlaky.','Uvnitř je tekutý kovový vodík, obrovské teploty a magnetická pole.','Vnitřní struktura není přesně známá, máme jen nepřímé indicie.','Proletět skrz by bylo nemožné kvůli tlaku, odporu a extrémním podmínkám.']},
    {time:'4:32',title:'Jak se topí led pod bruslí?',points:['Školní vysvětlení „třením se zahřeje“ nestačí.','Tlak brusle mění preferované skupenství → led se částečně taví.','Povrchová vrstva ledu není dokonale krystalická → snadněji se taví.','Ve skutečnosti jde o kombinaci: tření + tlak + narušená struktura povrchu.','Existuje mnoho typů ledu, které se tvoří při různých tlacích.']},
    {time:'8:42',title:'Proč se Země otočí o jedenkrát více vůči hvězdám než vůči Slunci?',points:['Rozlišujeme solární den (vzhledem ke Slunci) a siderický den (vzhledem k hvězdám).','Siderický den je kratší: 23 h 56 min.','Proto se Země vůči hvězdám otočí za rok 366×, ale vůči Slunci 365×.','Je to kvůli tomu, že Země zároveň obíhá kolem Slunce → „přidává“ jeden den.']},
    {time:'11:46',title:'Jak funguje mikrovlnka?',points:['Mikrovlnka generuje mikrovlny o frekvenci 2,4 GHz.','Uvnitř vzniká stojaté vlnění – některá místa se ohřívají víc, jiná méně.','Experiment: bez otočného talíře lze pomocí čokolády najít maxima a minima → spočítat rychlost světla.','Mikrovlny rozkmitávají molekuly vody (tvar „Mickey Mouse“) → ohřívají jídlo.']},
    {time:'14:38',title:'V jaké vodě člověk plave rychleji – slané nebo sladké?',points:['Záleží na hustotě a viskozitě.','Slaná voda víc nadnáší → člověk plave snadněji.','Ale optimální viskozita pro rychlost není triviální – záleží na tělesné stavbě.','Vzduch je také tekutina, jen příliš řídká pro lidské „plavání“.']},
    {time:'16:17',title:'Jak může černá díra „uvěznit“ světlo, když fotony nemají hmotnost?',points:['Nejde o přitažlivost hmotnosti, ale o zakřivení časoprostoru.','Fotony se pohybují po zakřivených trajektoriích → mohou být uvězněny.','Newtonovská gravitace je jen aproximace; Einstein to popsal přesněji.','Experiment s kladivem a pírkem na Měsíci ukazuje, že zrychlení nezávisí na hmotnosti.']},
    {time:'18:37',title:'Jak souvisí kruhové spektrum barev s vlnovými délkami?',points:['Ne každá pojmenovaná barva má vlastní vlnovou délku.','Hnědá je jen tmavá oranžová → intenzita hraje roli stejně jako vlnová délka.','Duhové spektrum pokrývá jen základní barvy; ostatní jsou kombinace intenzity a vnímání.','Někteří lidé mají genetické mutace → vidí širší spektrum (např. ženy častěji).']},
    {time:'22:39',title:'Bude se těleso ve vesmíru točit donekonečna?',points:['Ne úplně – vesmír není dokonale prázdný (atomy, fotony, gravitace).','Těleso může zpomalovat interakcemi, přílivovými rezonancemi nebo gravitačními vlnami.','Dokonale kulaté těleso by se teoreticky točilo velmi dlouho.','V extrémně dlouhém horizontu se vše rozpadne na železo (nejstabilnější prvek).']},
    {time:'25:24',title:'Nejpřekvapivější experimenty v historii vědy',points:['Michelson–Morley: neexistence éteru → základ pro teorii relativity.','Hubble: objevil, že „hmloviny“ jsou jiné galaxie.','Reliktové záření: nečekaný signál z vesmíru.','Zrychlené rozpínání vesmíru: objev temné energie.','Youngův experiment: světlo je vlna.','Fotoelektrický jev: světlo je částice.']},
    {time:'30:47',title:'Může GMO potravina ublížit člověku?',points:['V EU jsou GMO rostliny zakázané → běžný člověk se s nimi nesetká.','GMO může být užitečné (Golden Rice, odolnost proti suchu, vyšší výživnost).','Rizika existují, ale při správném testování jsou minimální.','Šlechtění je vlastně pomalá forma genetické modifikace.','Problém je spíš společenské vnímání a právní aspekty (patenty genů).']},
    {time:'35:36',title:'Poděkování od posluchačky Danky',points:['Děkuje za podcast, témata, humor a podporu v těžkých obdobích.','Oceňuje slovenštinu, i když není ze Slovenska.','Autoři jí děkují a posílají pozdrav.']}
  ];

  function isEpisode326(article){return /\bpodcast\s+326\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode326(article)||article.querySelector('.episode-summary'))return;
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