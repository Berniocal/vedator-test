(()=>{
  if(window.__vedatorQuestionTranslations340Part2)return;
  window.__vedatorQuestionTranslations340Part2=true;

  const PAIRS=[
    ['Proč černá díra pohlcuje věci? (dětská otázka)','Prečo čierna diera pohlcuje veci? (detská otázka)'],
    ['Gravitace černé díry je tak silná, že neunikne ani světlo.','Gravitácia čiernej diery je taká silná, že neunikne ani svetlo.'],
    ['Pokud neunikne světlo, neunikne nic.','Ak neunikne svetlo, neunikne nič.'],
    ['Je to jen extrémní verze stejné gravitace, která drží nás na Zemi.','Je to len extrémna verzia rovnakej gravitácie, ktorá nás drží na Zemi.'],

    ['Co je kometa 3I/ATLAS? Je mimozemská?','Čo je kométa 3I/ATLAS? Je mimozemská?'],
    ['Třetí známá mezihvězdná kometa po ‘Oumuamua a Borisovovi.','Tretia známa medzihviezdna kométa po ‘Oumuamua a Borisovovi.'],
    ['Není mimozemská technologie, jen objekt z jiné hvězdné soustavy.','Nie je to mimozemská technológia, iba objekt z inej hviezdnej sústavy.'],
    ['Už ji nedoženeme – všimli jsme si jí pozdě.','Už ju nedobehneme – všimli sme si ju neskoro.'],
    ['Konspirační weby o ní šířily nesmysly.','Konšpiračné weby o nej šírili nezmysly.'],

    ['Jaký je váš cíl v počtu přehrání podcastu?','Aký je váš cieľ v počte prehratí podcastu?'],
    ['Původní cíl: 5 000 posluchačů na epizodu do 3 let → splněno za 3 měsíce.','Pôvodný cieľ: 5 000 poslucháčov na epizódu do 3 rokov → splnené za 3 mesiace.'],
    ['Nemají žádný nový cíl; dělají podcast pro radost.','Nemajú žiadny nový cieľ; robia podcast pre radosť.'],
    ['Aktuálně cca 7,5 milionu přehrání na audioplatformách + ~700–800 tisíc na YouTube.','Aktuálne približne 7,5 milióna prehratí na audioplatformách + ~700–800 tisíc na YouTube.'],

    ['Je pokrok v solárních plachetnicích?','Je pokrok v solárnych plachetniciach?'],
    ['Technologie funguje, ale je extrémně pomalá.','Technológia funguje, ale je extrémne pomalá.'],
    ['Fotony mají malou hybnost → malé zrychlení.','Fotóny majú malú hybnosť → malé zrýchlenie.'],
    ['Laserové pohony by mohly být budoucnost (např. projekt Starshot).','Laserové pohony by mohli byť budúcnosťou (napr. projekt Starshot).'],
    ['Problém: obrovské plachty → riziko zásahu mikrometeoritů.','Problém: obrovské plachty → riziko zásahu mikrometeoritmi.'],
    ['Možné využití v daleké budoucnosti pro automatické sondy.','Možné využitie v ďalekej budúcnosti pre automatické sondy.'],

    ['Proč mě kope kolo, když jedu pod vedením vysokého napětí?','Prečo ma kope bicykel, keď idem pod vedením vysokého napätia?'],
    ['Vysoké napětí vytváří slabé elektrické pole.','Vysoké napätie vytvára slabé elektrické pole.'],
    ['Pohyb kovového rámu v poli indukuje proud.','Pohyb kovového rámu v poli indukuje prúd.'],
    ['Pneumatiky izolují → proud nemá kam unikat → člověk ho cítí.','Pneumatiky izolujú → prúd nemá kam unikať → človek ho cíti.'],
    ['Úroveň je v milampérech → nepříjemné, ale ne nebezpečné.','Úroveň je v miliampéroch → nepríjemné, ale nie nebezpečné.'],

    ['Může pochodující vojsko zničit most?','Môže pochodujúce vojsko zničiť most?'],
    ['Ano, pokud se trefí do rezonanční frekvence konstrukce.','Áno, ak sa trafí do rezonančnej frekvencie konštrukcie.'],
    ['Rezonance může zesílit vibrace až k destrukci.','Rezonancia môže zosilniť vibrácie až k deštrukcii.'],
    ['Historicky se to stalo dvakrát (Anglie 1830, Francie 1850).','Historicky sa to stalo dvakrát (Anglicko 1830, Francúzsko 1850).'],
    ['Dnes se konstrukce navrhují tak, aby se tomu vyhnuly.','Dnes sa konštrukcie navrhujú tak, aby sa tomu vyhli.'],
    ['Vítr může most rozvibrovat také (příklad Tacoma Narrows Bridge).','Vietor môže most rozvibrovať tiež (príklad Tacoma Narrows Bridge).']
  ];

  const LOOKUP=new Map();
  for(const [cz,sk] of PAIRS){const item={cz,sk};LOOKUP.set(cz,item);LOOKUP.set(sk,item)}
  const language=()=>window.vedatorUiLanguage?.()==='cz'?'cz':'sk';
  const apply=()=>{
    const lang=language();
    document.querySelectorAll('#questions .faq-question-card, .episode-summary .summary-block').forEach(block=>{
      block.querySelectorAll('h2,.summary-title,li').forEach(node=>{
        const raw=node.textContent.trim();
        const key=node.dataset.vedatorQuestionPart2Key||raw;
        const item=LOOKUP.get(key)||LOOKUP.get(raw);
        if(!item)return;
        if(!node.dataset.vedatorQuestionPart2Key)node.dataset.vedatorQuestionPart2Key=item.cz;
        if(node.textContent!==item[lang])node.textContent=item[lang];
      });
    });
  };
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply()})};
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',apply);
  window.addEventListener('vedatorcontentchange',apply);
  apply();
})();