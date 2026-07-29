(()=>{
  if(window.__vedatorEpisode340Summary)return;
  window.__vedatorEpisode340Summary=true;

  const QUESTIONS=[
    {time:'2:00',title:'Entropie, absolútna nula a smer času',question:'Je entropia nula pri absolútnom nule a čas by sa zastavil?',points:['Pri absolútnom nulovom stave systém spadne do najnižšieho energetického stavu → entropia je minimálna (v praxi takmer nula).','Nič sa nehýbe, v tomto zmysle, čas nehýbe, pretože neexistuje žiadna dynamika.','Časový smer súvisí s rastom entropie; ak sa nič nezmení, nie je to možné meranie.']},
    {time:'4:20',title:'Môže kovová guľa naraziť na rozbitú mramorovú stenu a opraviť ju?',points:['Fyzicky povolené, štatisticky absolútne nemožné.','Aby sa stena vrátila späť, všetky molekuly by sa mali vrátiť presne opačným smerom.','Pravdepodobnosť je veľmi malá: 10^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^','Je to příklad jednosměrnosti času a růstu entropie.']},
    {time:'7:41',title:'Môže Zem sa otočiť o 180° kvôli Džanibekovovmu efektu?',points:['Džanibekovův efekt je nestabilní rotace objektů s určitými momenty setrvačnosti.','Zem má tvar a rozloženie hmoty, ktoré nedovolia takúto nestabilitu rotácie.','Zemi to nehrozí.','Ak by sa to stalo náhle, všetci by okamžite zomreli kvôli obrovskému zrýchľovaniu (zmena 240 km/s).']},
    {time:'11:43',title:'Prečo černa diera pohlcuje veci? (Otázka detí)',points:['Gravitácia čiernej diery je taká silná, že ani svetlo sa nevyhne.','Ak sa svetlo nezbaví, nič nezbaví.','Je to len extrémna verzia tej istej gravitácie, ktorá nás drží na Zemi.']},
    {time:'13:26',title:'Čo je kométa 3I/ATLAS?',points:['Tretia známa medzestranná kométa po Oumuamua a Borisove.','Nie je to mimozemská technológia, je to objekt z inej hviezdnej sústavy.','Už ju nebudeme mať.','Konspirační weby o ní šířily nesmysly.']},
    {time:'15:22',title:'Aký je váš cieľ v počte predahnutia podcastu?',points:['Původní cíl: 5 000 posluchačů na epizodu do 3 let → splněno za 3 měsíce.','Nemajú žiadny nový cieľ; robia podcast pre radosť.','V súčasnosti má na YouTube približne 7,5 milióna prehrávajúcich stránok + ~700800 tisíc.']},
    {time:'18:37',title:'Je v solárnych plachách pokrok?',points:['Technológia funguje, ale je pomalá.','Fotóny majú malú pohybu → malú zrýchlenie.','Laserové pohony by mohli byť budúcnosťou (napr. projekt Starshot).','Problém: obrovské plachty → riziko zásahu mikrometeoritov.','Možné využití v daleké budoucnosti pro automatické sondy.']},
    {time:'22:07',title:'Prečo ma kopie bicykel, keď jazdím pod vysokým napätím?',points:['Vysoké napětí vytváří slabé elektrické pole.','Pohyb kovového rámu v poli indukuje proud.','Pneumatika izoluje → prúd nemá kam uniknúť → človek ho cíti.','V milamperech je úroveň nepríjemná, ale nie nebezpečná.']},
    {time:'23:31',title:'Môže pochodujúca armáda zničiť most?',points:['Áno, ak sa dotkne rezonančnej frekvencie konštrukcie.','Rezonance může zesílit vibrace až k destrukci.','Historicky sa to stalo dvakrát (Anglicko 1830, Francúzsko 1850).','Dnes sa konštrukcie navrhujú tak, aby sa tomu zabránilo.','Výchot môže tiež vibrovať na most (napr. Tacoma Narrows Bridge).']},
    {time:'26:27',title:'V akej škole Samuel učí?',points:['Matematika-fyzika fakulty, Univerzita Komenského, Bratislava.','Učí teoretickou fyziku.']},
    {time:'27:44',title:'Čo ak sa naša galaxia začne otáčať opačne?',points:['Ak by sme to mali pomaly → nevšimli by sme si to.','Galaktický rok trvá ~250 milionů let.','Ak náhle → okamžitá smrť všetkých kvôli zmene rýchlosti 240 km/h.','Väčšina viditeľných hviezd je blízko, takže zmeny by boli pomalé.']},
    {time:'29:19',title:'Čo znamená slovo "rozumieť"?',points:['Prakticky: umieť postup aplikovať samostatne.','Teoreticky: vidieť štruktúru množstva informácií a zjednodušiť ju.','Rozum = schopnosť rozlíšiť podstatné kroky od zbytočných.','Opice dokážu opakovať, ale nerozumejú; človek vie, čo je dôležité.']},
    {time:'32:10',title:'Stále hrajete Magic: The Gathering?',points:['Áno, dokonca viac ako predtým.','Hrajú doma → s fanúšikmi sa nemôžeme hrať.','Možná jednou udělají veřejné hraní nebo turnaj.']},
    {time:'33:11',title:'Prečo tornáda neprekročí rovnicu?',points:['Tornáda a hurikány potřebují Koriolisovu sílu.','V rovnici je Koriolis = 0 → rotacia sa nevytvára.','Okrem toho silné proudenie (jet streams) bráni prechodu.','Malé tornády (nie hurikány) môžu prekročiť rovnicu.']},
    {time:'35:31',title:'Musím počítať s rotaciou Zeme pri výpočte dĺžky letu?',points:['Délka trasy je stejná tam i zpět.','Čas letu sa líši kvôli vetru, nie kvôli rotácii Zeme.','Vzduch sa pohybuje → lietaš k vzduchu, nie k Zemi.','Prúd je štruktúrovaný (tradičné vetry, jet streamy).','Rotácia Zeme by mala svoju úlohu len vtedy, ak by vzduch stal → ale nie je.']}
  ];

  function isEpisode340(article){return /\bpodcast\s+340\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode340(article)||article.querySelector('.episode-summary'))return;
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
      if(item.question){const question=document.createElement('div');question.className='summary-question';question.textContent=`Otázka:${item.question}`;block.appendChild(question)}
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