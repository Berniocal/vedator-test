(()=>{
  if(window.__vedatorEpisode284Summary)return;
  window.__vedatorEpisode284Summary=true;

  const QUESTIONS=[
    {time:'1:40',title:'Proč vrhám další stín, i když stojím ve stínu?',points:['Nejsi v „dokonalém“ stínu.','Ve městě se světlo odráží od budov, země a atmosféry, takže přichází z více směrů.','Na Měsíci jsou stíny extrémně ostré, protože tam téměř není rozptýlené světlo.']},
    {time:'3:22',title:'Jak je možné, že gravitace existuje?',points:['Věda obvykle nevysvětluje konečné „proč“, ale popisuje, jak gravitace funguje.','Gravitace je projev zakřivení časoprostoru hmotou.','Teoreticky lze uvažovat vesmír bez gravitace nastavením gravitační konstanty G na nulu.','Jiné nezávislé druhy gravitace by nedávaly smysl, protože časoprostor má jednu metriku.']},
    {time:'5:08',title:'Kolik by stála cesta k nejbližší černé díře?',points:['Nejbližší známá černá díra je přibližně 1600 světelných let daleko.','Aby člověk cestu stihl za život, musel by letět asi 99 % rychlosti světla, což je energeticky nereálné.','Raketa by potřebovala energii odpovídající přeměně bilionů tun hmoty na energii.','Sonda se solární plachetnicí by mohla letět tisíce let.','Mohou existovat bližší černé díry, ale zatím nejsou potvrzené.']},
    {time:'8:19',title:'Dá se zhubnout psychickou aktivitou?',points:['Mozek spotřebovává hodně energie, ale náročnější přemýšlení zvýší spotřebu jen málo.','Chudnutí vyžaduje kalorický deficit.','Cvičení pomáhá, ale může zvýšit hlad a člověk pak sní více.','Únava po zkoušce souvisí spíš se stresem, jídlem a nedostatkem tekutin než s výrazným spalováním energie.']},
    {time:'10:37',title:'Proč v rovnicích u singularit vychází nekonečno?',points:['Nekonečno obvykle znamená, že použitý model je neúplný.','Podobně při zanedbání odporu nebo tlumení může model předpovědět nesmyslně nekonečnou amplitudu.','U černých děr singularita ukazuje, že nám chybí úplná teorie kvantové gravitace.']},
    {time:'11:59',title:'Může černá díra pohltit něco většího než ona sama?',points:['Ano, děje se to běžně.','Velký objekt, například hvězda, se při pádu slapovými silami špagetifikuje.','Část hmoty může být vyvržena ven v podobě výtrysků.','Rozměr padajícího objektu není překážkou — i Země by mohla spadnout do menší černé díry.']},
    {time:'13:28',title:'Co drží atmosféru na Zemi?',points:['Atmosféru drží gravitace.','Molekuly se pohybují a některé se snaží uniknout, gravitace je však většinou udrží.','Hustota vzduchu proto s výškou klesá.','Těžký plyn, například CO₂, může zůstat v otevřené nádobě a lze ho „vylít“ na svíčku.']},
    {time:'14:56',title:'Ovlivňuje úplněk spánek?',points:['Ano, především kvůli většímu množství světla.','Nedostatečné zatemnění může zhoršit usínání a kvalitu spánku.','Aktivnější zvířata mohou v noci více rušit.','Pomoci může maska na oči a špunty do uší.']},
    {time:'16:52',title:'Oblíbené videohry',points:['Jozef: Witcher 3.','Samuel: Diablo 2, Baldur’s Gate 2, Hearthstone a Magicka.','Oba mají rádi hry, které lze hrát společně.']},
    {time:'18:21',title:'Co si myslíte o Majorana 1 od Microsoftu?',points:['Jde o nový návrh kvantového počítače, který slibuje škálování až k milionu qubitů.','Microsoft už dříve některé sliby přehnal, proto je namístě opatrný optimismus.','Kombinace kvantových počítačů a umělé inteligence by mohla být velmi silná.','Projekt znovu přitáhl pozornost ke kvantovým počítačům po boomu AI.']},
    {time:'20:39',title:'Oblíbené anime',points:['Jozef: One Piece — piráti, dobrodružství a společenská témata, více než tisíc epizod.','Samuel: Death Note, Akira, Ghost in the Shell a filmy studia Ghibli.']},
    {time:'24:17',title:'Proč oheň nemá stín?',points:['Oheň světlo vytváří a viditelné světlo většinou výrazně neblokuje.','Proto obvykle nevytváří běžný viditelný stín.','Husté plazma, například pod raketou, může blokovat rádiové vlny a vytvořit „rádiový stín“.','Horký vzduch nad plamenem také způsobuje optické zkreslení a vlnění obrazu.']}
  ];

  function isEpisode284(article){return /\bpodcast\s+284\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode284(article)||article.querySelector('.episode-summary'))return;
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