(()=>{
  if(window.__vedatorEpisode337Summary)return;
  window.__vedatorEpisode337Summary=true;

  const QUESTIONS=[
    {time:'3:47',title:'Kvantová náhodnosť a skryté parametre',question:'Existuje objektívna náhodnosť, alebo je to len naša nevedomosť?',points:['Kvantová náhodnosť nie je len neznalosť ako v hádanke kostky.','Teória skrytých parametrov bola testovaná; Bellove nerovnosti ukazujú, že kvantová náhodnosť je iná ako klasická.','Experimenty sú extrémne náročné, ale výsledky podporujú skutočnú kvantovú náhodnosť.','Samuel preferuje interpretáciu Everettovho filmu "Many Worlds".']},
    {time:'6:06',title:'Je niečo vo fyzike úplne náhodné?',points:['Kvantová fyzika je jediná oblasť, kde sa náhodnosť zdá byť skutočná.','V Everettovom interpretácii je kvantová fyzika deterministická, len keď vesmír rozklenuje.','Ostatné fenomény sú deterministické, ale nemáme nekonečné množstvo informácií.']},
    {time:'7:01',title:'Schrödingerova mačka, ale s človekom a spavým plynom.',question:'Čo by človek subjektívne cítil v superpozícii  bdelý a spajúci?',points:['V Everettově interpretaci se vesmír rozdvojí.','Jedna verzia človeka spí, druhá je vstajúca.','Člověk necítí obojí zároveň.','Pozorovatel při otevření krabice přejde do jedné z větví.']},
    {time:'9:18',title:'Žijeme v simulácii?',question:'Môže byť vlnová povaha častíc spôsob, akým simulacia šetrí pamäť?',points:['Samuel tuto teorii nemá rád.','Logický problém: každá simulovaná civilizácia by sa dospela k záveru, že je simulovaná, čo by viedlo k nekonečnému regresu.','Occamova čeber: Je jednoduchšie predpokladať, že nie sme simulácia.','Rozmazanie vesmíru je skôr dôsledkom toho, že matematické ideály sú presnejšie ako realita.']},
    {time:'12:35',title:'Mimozemšťania bez gravitácie: ako vysvetliť gravitáciu?',question:'Ako vysvetliť gravitaciu bytosti z vesmíru, kde gravitácia neexistuje?',points:['Jednoduchá demonstrace: hodit předmět na zem.','Lepší vysvětlení: gravitace je pocit podobný zrychlení ve výtahu.','Gravitace je zakřivení časoprostoru hmotou.','V ich vesmíre by existovalo zrýchlenie, ale nie zakrivenie časoprostoru.']},
    {time:'15:14',title:'Prečo stále vidíme rovnakú stranu Mesiaca?',points:['Mesiac sa otáča rovnakou rýchlosťou ako Zem, čo je to zablokovanie prúdu.','Stejně jsou vzájemně uzamčeni Pluto a Charon.','Země se kdysi otáčela rychleji a den trval přibližně čtyři hodiny.','Mesiac sa odtiaľto vzdáľuje, takže v budúcnosti už nebude úplné zatmenie Slnka.']},
    {time:'19:40',title:'Ovplyvňuje sa rotacia Zeme na dĺžku letu lietadla?',points:['Dominantný vplyv majú vetra, najmä jet stream.','Rotace Země se projeví jen nepřímo přes Coriolisovu a odstředivou sílu.','Preto lety na západ-východ sú kratšie.']},
    {time:'22:44',title:'Ako funguje mikrovlnná sieť?',points:['Mikrovlnky vytvárajú stály vlny frekvencie približne 2,4 GHz.','Voda je polárna; elektrické pole rozpína jej molekuly a tým ju ohreje.','Preto majú mikrovlnné ohňasy podobné rozmerom  to súvisí s vlnou dĺžkou.','Bez otočného talíře lze změřit vlnovou délku a dopočítat rychlost světla.']},
    {time:'27:15',title:'Keď si nafuknem helium do uší, počujem inak?',points:['- Áno, áno.','Helium má vyššiu rýchlosť zvuku, čo posúva frekvenciu a zvuku zvukuje vyššie.','Jde o stejný princip jako u heliového hlasu.']},
    {time:'28:49',title:'Prečo sa raz cítime teplo a niekedy chlad, keď sa nadýmame na ruku?',points:['Pomaly vybuchaný vzduch je teplý vzduch z pľúc, takže pôsobí teplé.','Rychlý proud vzduchu odfoukne teplou vrstvu u kůže a ochlazuje.','Stejný princip vysvětluje ochlazování větrem v létě.']},
    {time:'30:26',title:'Posunul se odhad věku vesmíru na 30 miliard let?',points:['Ne, stáří vesmíru zůstává přibližně 13,8 miliardy let.','Číslo 30 miliard se týká vzdáleností nejvzdálenějších oblastí kvůli rozpínání vesmíru.','Existujú alternatívne teórie, ako je napríklad unavený svetl, ale nie sú v súlade s inými pozorovaním.','Webbov teleskop našiel veľmi staré galaxie, takže možno bude potrebné upraviť niektoré modely.']},
    {time:'35:33',title:'Prečo sa tlak zvyšuje po zmätnutí limonádou?',points:['Oxid uhličitý je rozpuštěný v kapalině.','Tlakové vlny při zatřesení vytvoří množství bublinek.','Bubliny sa rozširujú, tlak sa zvyšuje a po otvorení sa vyplieva.']},
    {time:'37:27',title:'Čo je najkrajšie, čo ste kedy videli?',points:['Osobní momenty: narození dítěte a rodina.','Príroda: Liptov, Írsko, útesy a potápka.','Zaznělo také doporučení na cestování po Irsku.']}
  ];

  function isEpisode337(article){return /\bpodcast\s+337\b/i.test(article?.querySelector('h2')?.textContent||'')}
  function install(article){
    if(!isEpisode337(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');details.className='episode-summary';
    const summary=document.createElement('summary');summary.textContent='Zhrnutie diely';
    const body=document.createElement('div');body.className='episode-summary-body';
    for(const item of QUESTIONS){
      const block=document.createElement('div');block.className='summary-block';
      const time=document.createElement('div');time.className='summary-time';time.textContent=item.time;
      const title=document.createElement('div');title.className='summary-title';title.textContent=item.title;
      block.append(time,title);
      if(item.question){const q=document.createElement('div');q.className='summary-question';q.textContent=`Otázka:${item.question}`;block.appendChild(q)}
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