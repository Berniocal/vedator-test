(()=>{
  if(window.__vedatorQuestionTranslationsNext12)return;
  window.__vedatorQuestionTranslationsNext12=true;

  const PAIRS=[
    ['Žijeme v simulaci?','Žijeme v simulácii?'],
    ['Může být vlnová povaha částic způsob, jak simulace šetří paměť?','Môže byť vlnová povaha častíc spôsob, akým simulácia šetrí pamäť?'],
    ['Samuel tuto teorii nemá rád.','Samuel túto teóriu nemá rád.'],
    ['Logický problém: každá simulovaná civilizace by došla k závěru, že je simulovaná, což vede k nekonečnému regresu.','Logický problém: každá simulovaná civilizácia by dospela k záveru, že je simulovaná, čo vedie k nekonečnému regresu.'],
    ['Occamova břitva: jednodušší je předpokládat, že nejsme simulace.','Occamova britva: jednoduchšie je predpokladať, že nie sme simulácia.'],
    ['„Rozmazanost“ vesmíru je spíš důsledek toho, že matematické ideály jsou přesnější než realita.','„Rozmazanosť“ vesmíru je skôr dôsledkom toho, že matematické ideály sú presnejšie než realita.'],

    ['Mimozemšťané bez gravitace: jak vysvětlit gravitaci?','Mimozemšťania bez gravitácie: ako vysvetliť gravitáciu?'],
    ['Jak vysvětlit gravitaci bytosti z vesmíru, kde gravitace neexistuje?','Ako vysvetliť gravitáciu bytosti z vesmíru, kde gravitácia neexistuje?'],
    ['Jednoduchá demonstrace: hodit předmět na zem.','Jednoduchá ukážka: hodiť predmet na zem.'],
    ['Lepší vysvětlení: gravitace je pocit podobný zrychlení ve výtahu.','Lepšie vysvetlenie: gravitácia je pocit podobný zrýchleniu vo výťahu.'],
    ['Gravitace je zakřivení časoprostoru hmotou.','Gravitácia je zakrivenie časopriestoru hmotou.'],
    ['V jejich vesmíru by existovalo zrychlení, ale ne zakřivení časoprostoru.','V ich vesmíre by existovalo zrýchlenie, ale nie zakrivenie časopriestoru.'],

    ['Proč vidíme stále stejnou stranu Měsíce?','Prečo vidíme stále tú istú stranu Mesiaca?'],
    ['Měsíc rotuje stejnou rychlostí, jakou obíhá Zemi – jde o přílivové uzamčení.','Mesiac rotuje rovnakou rýchlosťou, akou obieha Zem – ide o slapové uzamknutie.'],
    ['Stejně jsou vzájemně uzamčeni Pluto a Charon.','Rovnako sú navzájom uzamknuté Pluto a Cháron.'],
    ['Země se kdysi otáčela rychleji a den trval přibližně čtyři hodiny.','Zem sa kedysi otáčala rýchlejšie a deň trval približne štyri hodiny.'],
    ['Měsíc se vzdaluje, takže v budoucnu už nebude úplné zatmění Slunce.','Mesiac sa vzďaľuje, takže v budúcnosti už nebude úplné zatmenie Slnka.'],

    ['Ovlivňuje rotace Země délku letu letadla?','Ovplyvňuje rotácia Zeme dĺžku letu lietadla?'],
    ['Dominantní vliv mají větry, zejména jet stream.','Dominantný vplyv majú vetry, najmä jet stream.'],
    ['Rotace Země se projeví jen nepřímo přes Coriolisovu a odstředivou sílu.','Rotácia Zeme sa prejaví iba nepriamo cez Coriolisovu a odstredivú silu.'],
    ['Proto bývají lety ve směru západ–východ kratší.','Preto bývajú lety v smere západ – východ kratšie.'],

    ['Jak funguje mikrovlnka?','Ako funguje mikrovlnka?'],
    ['Mikrovlnka vytváří stojaté vlnění o frekvenci přibližně 2,4 GHz.','Mikrovlnka vytvára stojaté vlnenie s frekvenciou približne 2,4 GHz.'],
    ['Voda je polární; elektrické pole její molekuly rozkmitá a tím ji ohřívá.','Voda je polárna; elektrické pole rozkmitá jej molekuly a tým ju ohrieva.'],
    ['Proto mají mikrovlnné trouby podobné rozměry – souvisí to s vlnovou délkou.','Preto majú mikrovlnné rúry podobné rozmery – súvisí to s vlnovou dĺžkou.'],
    ['Bez otočného talíře lze změřit vlnovou délku a dopočítat rychlost světla.','Bez otočného taniera možno zmerať vlnovú dĺžku a dopočítať rýchlosť svetla.'],

    ['Když si nafoukám helium do uší, budu slyšet jinak?','Keď si nafúkam hélium do uší, budem počuť inak?'],
    ['Ano.','Áno.'],
    ['V heliu je vyšší rychlost zvuku, což posune frekvence a zvuk zní výše.','V héliu je vyššia rýchlosť zvuku, čo posunie frekvencie a zvuk znie vyššie.'],
    ['Jde o stejný princip jako u heliového hlasu.','Ide o rovnaký princíp ako pri héliovom hlase.'],

    ['Proč při fouknutí na ruku jednou cítíme teplo a jindy chlad?','Prečo pri fúknutí na ruku raz cítime teplo a inokedy chlad?'],
    ['Pomalu foukaný vzduch je teplý vzduch z plic, takže působí teple.','Pomaly fúkaný vzduch je teplý vzduch z pľúc, takže pôsobí teplo.'],
    ['Rychlý proud vzduchu odfoukne teplou vrstvu u kůže a ochlazuje.','Rýchly prúd vzduchu odfúkne teplú vrstvu pri koži a ochladzuje.'],
    ['Stejný princip vysvětluje ochlazování větrem v létě.','Rovnaký princíp vysvetľuje ochladzovanie vetrom v lete.'],

    ['Posunul se odhad věku vesmíru na 30 miliard let?','Posunul sa odhad veku vesmíru na 30 miliárd rokov?'],
    ['Ne, stáří vesmíru zůstává přibližně 13,8 miliardy let.','Nie, vek vesmíru zostáva približne 13,8 miliardy rokov.'],
    ['Číslo 30 miliard se týká vzdáleností nejvzdálenějších oblastí kvůli rozpínání vesmíru.','Číslo 30 miliárd sa týka vzdialeností najvzdialenejších oblastí v dôsledku rozpínania vesmíru.'],
    ['Existují alternativní teorie, například unavené světlo, ale nesedí na ostatní pozorování.','Existujú alternatívne teórie, napríklad unavené svetlo, ale nesedia s ostatnými pozorovaniami.'],
    ['Webbův teleskop našel velmi staré galaxie, takže možná bude nutné upravit některé modely.','Webbov teleskop našiel veľmi staré galaxie, takže možno bude potrebné upraviť niektoré modely.'],

    ['Proč se po zatřesení limonádou zvýší tlak?','Prečo sa po zatrasení limonádou zvýši tlak?'],
    ['Oxid uhličitý je rozpuštěný v kapalině.','Oxid uhličitý je rozpustený v kvapaline.'],
    ['Tlakové vlny při zatřesení vytvoří množství bublinek.','Tlakové vlny pri zatrasení vytvoria množstvo bubliniek.'],
    ['Bublinky se rozpínají, zvýší tlak a po otevření nápoj vystříkne.','Bublinky sa rozpínajú, zvýšia tlak a po otvorení nápoj vystrekne.'],

    ['Co nejkrásnějšího jste viděli?','Čo najkrajšie ste videli?'],
    ['Osobní momenty: narození dítěte a rodina.','Osobné momenty: narodenie dieťaťa a rodina.'],
    ['Příroda: Liptov, Irsko, útesy a potápění.','Príroda: Liptov, Írsko, útesy a potápanie.'],
    ['Zaznělo také doporučení na cestování po Irsku.','Odznelo aj odporúčanie na cestovanie po Írsku.'],

    ['Jak může být vesmír nekonečný, když se rozpíná?','Ako môže byť vesmír nekonečný, keď sa rozpína?'],
    ['Nekonečno může růst a pořád zůstat nekonečné („nekonečno × 2 = nekonečno“).','Nekonečno môže rásť a stále zostať nekonečné („nekonečno × 2 = nekonečno“).'],
    ['Jako analogie slouží Hilbertův hotel.','Ako analógia slúži Hilbertov hotel.'],
    ['Vesmír možná není nekonečný – může být jen velmi velký a přitom se rozpínat.','Vesmír možno nie je nekonečný – môže byť iba veľmi veľký a pritom sa rozpínať.'],
    ['Rozpínání lze chápat jako změnu „pravítka“, kterým měříme vzdálenosti (metrický tenzor).','Rozpínanie možno chápať ako zmenu „pravítka“, ktorým meriame vzdialenosti (metrický tenzor).'],
    ['Pravítko se „smrskává“, proto pozorujeme rozpínání.','Pravítko sa „zmenšuje“, preto pozorujeme rozpínanie.'],

    ['Jak by fungovalo cestování do budoucnosti, když ještě neexistuje?','Ako by fungovalo cestovanie do budúcnosti, keď ešte neexistuje?'],
    ['Do budoucnosti cestujeme neustále – čas plyne.','Do budúcnosti cestujeme neustále – čas plynie.'],
    ['Přítomnost, minulost a budoucnost nejsou absolutní, ale relativní podle speciální relativity.','Prítomnosť, minulosť a budúcnosť nie sú absolútne, ale relatívne podľa špeciálnej relativity.'],
    ['U černé díry by člověk mohl zažít 15 minut, zatímco ve zbytku vesmíru uběhne 1000 let.','Pri čiernej diere by človek mohol zažiť 15 minút, zatiaľ čo vo zvyšku vesmíru uplynie 1000 rokov.'],
    ['Takové „cestování do budoucnosti“ vzniká zpomalením času.','Takéto „cestovanie do budúcnosti“ vzniká spomalením času.']
  ];

  const LOOKUP=new Map();
  for(const [cz,sk] of PAIRS){const item={cz,sk};LOOKUP.set(cz,item);LOOKUP.set(sk,item)}
  const language=()=>window.vedatorUiLanguage?.()==='cz'?'cz':'sk';
  const apply=()=>{
    const lang=language();
    document.querySelectorAll('#questions .faq-question-card, .episode-summary .summary-block').forEach(block=>{
      block.querySelectorAll('h2,.summary-title,.summary-question,li').forEach(node=>{
        let raw=node.textContent.trim(),prefix='';
        if(raw.startsWith('Otázka: ')){prefix='Otázka: ';raw=raw.slice(8)}
        const key=node.dataset.vedatorQuestionNext12Key||raw;
        const item=LOOKUP.get(key)||LOOKUP.get(raw);
        if(!item)return;
        if(!node.dataset.vedatorQuestionNext12Key)node.dataset.vedatorQuestionNext12Key=item.cz;
        const value=prefix+item[lang];
        if(node.textContent!==value)node.textContent=value;
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