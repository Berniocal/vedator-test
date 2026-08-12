(()=>{
  if(window.__vedatorQuestionTranslations332Part2)return;
  window.__vedatorQuestionTranslations332Part2=true;

  const PAIRS=[
    ['Jak velký by musel být člověk, aby překročil všechny lidi na Zemi?','Aký veľký by musel byť človek, aby prekročil všetkých ľudí na Zemi?'],
    ['Výsledek záleží na tom, jak lidi naskládáme.','Výsledok závisí od toho, ako ľudí poukladáme.'],
    ['Vedle sebe by vytvořili řadu dlouhou přibližně 180 milionů km, takže krok by musel být stejně dlouhý.','Vedľa seba by vytvorili rad dlhý približne 180 miliónov km, takže krok by musel byť rovnako dlhý.'],
    ['Do kostky by lidstvo zabralo asi 1 km³ a člověk by musel být přibližně 1000× větší než běžný člověk.','V kocke by ľudstvo zabralo asi 1 km³ a človek by musel byť približne 1000× väčší než bežný človek.'],
    ['Naskládaní na sebe bychom dosáhli až k Měsíci.','Poukladaní na seba by sme dosiahli až k Mesiacu.'],

    ['Co bylo dřív – slepice nebo vejce?','Čo bolo skôr – sliepka alebo vajce?'],
    ['Vejce existovalo dávno před slepicí, například už u dinosaurů.','Vajce existovalo dávno pred sliepkou, napríklad už u dinosaurov.'],
    ['Evoluce je plynulá, takže neexistuje ostrá hranice mezi „neslepicí“ a slepicí.','Evolúcia je plynulá, takže neexistuje ostrá hranica medzi „nesliepkou“ a sliepkou.'],
    ['Z filozofického hlediska lze odpovědět obojím – záleží na definici.','Z filozofického hľadiska možno odpovedať oboma spôsobmi – závisí od definície.'],

    ['Jak vznikla naše planeta, hvězdy a kameny ve vesmíru?','Ako vznikla naša planéta, hviezdy a kamene vo vesmíre?'],
    ['Raný vesmír obsahoval hlavně vodík a helium.','Raný vesmír obsahoval najmä vodík a hélium.'],
    ['První hvězdy populace III vybuchovaly a vytvářely těžší prvky.','Prvé hviezdy populácie III vybuchovali a vytvárali ťažšie prvky.'],
    ['Tyto prvky se gravitací shlukovaly do nových hvězd, planet a kamenů.','Tieto prvky sa pôsobením gravitácie zhlukovali do nových hviezd, planét a kameňov.'],
    ['Pro vznik nejhmotnějších prvků jsou potřeba například srážky neutronových hvězd.','Na vznik najťažších prvkov sú potrebné napríklad zrážky neutrónových hviezd.'],
    ['Astronomové označují všechny prvky těžší než helium jako „kovy“.','Astronómovia označujú všetky prvky ťažšie než hélium ako „kovy“.'],

    ['Kdyby se vesmír na chvíli přestal rozpínat, vznikl by život později?','Keby sa vesmír na chvíľu prestal rozpínať, vznikol by život neskôr?'],
    ['Kdyby se rozpínání zastavilo v horké fázi, život by pravděpodobně vznikl později.','Keby sa rozpínanie zastavilo v horúcej fáze, život by pravdepodobne vznikol neskôr.'],
    ['Kdyby se zastavilo až později, vznik hvězd by mohl být častější a život by mohl vzniknout dříve.','Keby sa zastavilo až neskôr, vznik hviezd by mohol byť častejší a život by mohol vzniknúť skôr.'],
    ['Zmíněna byla hypotéza panspermie: život mohl vzniknout už asi 200 milionů let po velkém třesku a šířit se vesmírem jako „semena“.','Spomenutá bola hypotéza panspermie: život mohol vzniknúť už asi 200 miliónov rokov po veľkom tresku a šíriť sa vesmírom ako „semená“.'],

    ['Proč Vikingové měli rohy na přilbách?','Prečo mali Vikingovia rohy na prilbách?'],
    ['Ve skutečnosti rohaté přilby nenosili.','V skutočnosti rohaté prilby nenosili.'],
    ['Představa vznikla jako umělecká licence u Wagnerových oper, kde kostymér přidal rohy.','Táto predstava vznikla ako umelecká licencia vo Wagnerových operách, kde kostymér pridal rohy.'],
    ['Historické vikinské přilby byly jednoduché a polokulové.','Historické vikinské prilby boli jednoduché a pologuľovité.'],
    ['Rohaté helmy se vyskytovaly v jiných kulturách, například u Peršanů nebo samurajů, ne však u Vikingů.','Rohaté prilby sa vyskytovali v iných kultúrach, napríklad u Peržanov alebo samurajov, nie však u Vikingov.'],

    ['Jak čůrají netopýři?','Ako močia netopiere?'],
    ['Netopýři jsou savci, takže močí podobně jako ostatní savci.','Netopiere sú cicavce, takže močia podobne ako ostatné cicavce.'],
    ['Některé druhy se při močení otočí a zavěsí se drápy na křídlech.','Niektoré druhy sa pri močení otočia a zavesia sa pazúrmi na krídlach.'],
    ['Jiné druhy mají anatomii umožňující močení i hlavou dolů.','Iné druhy majú anatómiu, ktorá umožňuje močenie aj hlavou nadol.'],

    ['Jaké číslo je před nekonečnem?','Aké číslo je pred nekonečnom?'],
    ['Nekonečno není číslo, a proto nemá předchůdce.','Nekonečno nie je číslo, a preto nemá predchodcu.'],
    ['Před nekonečnem jsou všechna čísla, ale žádné není poslední.','Pred nekonečnom sú všetky čísla, ale žiadne nie je posledné.'],
    ['Nekonečno je směr růstu, ne konkrétní hodnota.','Nekonečno je smer rastu, nie konkrétna hodnota.'],

    ['Proč není vidět vzduch?','Prečo nie je vidieť vzduch?'],
    ['Vidíme světlo, které vzduchem prochází, protože vzduch ho téměř neovlivňuje.','Vidíme svetlo, ktoré prechádza vzduchom, pretože vzduch ho takmer neovplyvňuje.'],
    ['Vzduch vidíme nepřímo, když obsahuje prach, kouř nebo vodní kapky, například v mlze.','Vzduch vidíme nepriamo, keď obsahuje prach, dym alebo vodné kvapôčky, napríklad v hmle.'],
    ['Atmosféra není průhledná pro všechny vlnové délky, například pro část UV a IR záření.','Atmosféra nie je priehľadná pre všetky vlnové dĺžky, napríklad pre časť UV a IR žiarenia.'],
    ['Evoluce nás vybavila zrakem citlivým na barvy, které atmosféra propouští nejlépe.','Evolúcia nás vybavila zrakom citlivým na farby, ktoré atmosféra prepúšťa najlepšie.'],

    ['Proč jsou některé rostliny jedovaté?','Prečo sú niektoré rastliny jedovaté?'],
    ['Jedovaté látky slouží jako obranný mechanismus proti býložravcům.','Jedovaté látky slúžia ako obranný mechanizmus proti bylinožravcom.'],
    ['Evoluce metodou pokus–omyl vytvořila látky, které škodí savcům, ale nemusí škodit ptákům.','Evolúcia metódou pokus–omyl vytvorila látky, ktoré škodia cicavcom, ale nemusia škodiť vtákom.'],
    ['Ptáci pak mohou šířit semena, zatímco savci rostlinu nesežerou.','Vtáky potom môžu šíriť semená, zatiaľ čo cicavce rastlinu nezjedia.'],
    ['Příkladem jsou pálivé papričky: ptáci pálivost necítí, savci ano.','Príkladom sú štipľavé papričky: vtáky štipľavosť necítia, cicavce áno.'],

    ['Proč si ryby nemohou sednout?','Prečo si ryby nemôžu sadnúť?'],
    ['Ryby nemají nohy.','Ryby nemajú nohy.'],
    ['Ve vodě nepotřebují sedět, protože jsou v rovnováze mezi gravitací a vztlakem.','Vo vode nepotrebujú sedieť, pretože sú v rovnováhe medzi gravitáciou a vztlakom.'],
    ['Odpočívají tím, že přestanou plavat.','Odpočívajú tak, že prestanú plávať.'],
    ['Některé ploché ryby skutečně leží na dně.','Niektoré ploché ryby skutočne ležia na dne.'],

    ['Existují draci?','Existujú draky?'],
    ['Draci neexistují.','Draky neexistujú.'],
    ['Je zajímavé, že se objevují nezávisle v mnoha kulturách.','Je zaujímavé, že sa nezávisle objavujú v mnohých kultúrach.'],
    ['Jedním možným vysvětlením je, že lidé nacházeli kostry více zvířat pohromadě a vytvářeli legendy o vícehlavých tvorech.','Jedným z možných vysvetlení je, že ľudia nachádzali kostry viacerých zvierat pohromade a vytvárali legendy o viachlavých tvoroch.'],
    ['Následovala krátká úvaha o fantasy žánrech.','Nasledovala krátka úvaha o žánroch fantasy.'],

    ['Dá se podívat dovnitř sopky, aniž by člověk shořel?','Dá sa pozrieť dovnútra sopky bez toho, aby človek zhorel?'],
    ['Ano, pomocí dronů a kamer.','Áno, pomocou dronov a kamier.'],
    ['U klidných sopek, například na Havaji, lze lávu bezpečně pozorovat zblízka.','Pri pokojných sopkách, napríklad na Havaji, možno lávu bezpečne pozorovať zblízka.'],
    ['U výbušných sopek to možné není.','Pri výbušných sopkách to možné nie je.'],
    ['Zmíněny byly také osobní zážitky z Kanárských ostrovů a Japonska.','Spomenuté boli aj osobné zážitky z Kanárskych ostrovov a Japonska.']
  ];

  const LOOKUP=new Map();
  for(const [cz,sk] of PAIRS){const item={cz,sk};LOOKUP.set(cz,item);LOOKUP.set(sk,item)}
  const language=()=>window.vedatorUiLanguage?.()==='cz'?'cz':'sk';
  const apply=()=>{
    const lang=language();
    document.querySelectorAll('#questions .faq-question-card, .episode-summary .summary-block').forEach(block=>{
      block.querySelectorAll('h2,.summary-title,li').forEach(node=>{
        const raw=node.textContent.trim();
        const key=node.dataset.vedatorQuestion332Part2Key||raw;
        const item=LOOKUP.get(key)||LOOKUP.get(raw);
        if(!item)return;
        if(!node.dataset.vedatorQuestion332Part2Key)node.dataset.vedatorQuestion332Part2Key=item.cz;
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