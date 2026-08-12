(()=>{
  if(window.__vedatorQuestionTranslations313Part1)return;
  window.__vedatorQuestionTranslations313Part1=true;

  const PAIRS=[
    ['Jak fungují permanentní magnety?','Ako fungujú permanentné magnety?'],
    ['Atomy mají magnetické momenty vznikající například spinem a pohybem elektronů.','Atómy majú magnetické momenty vznikajúce napríklad spinom a pohybom elektrónov.'],
    ['Magnet vzniká, když se tyto malé magnetické momenty v materiálu převážně zarovnají.','Magnet vzniká, keď sa tieto malé magnetické momenty v materiáli prevažne zarovnajú.'],
    ['Permanentní magnet nečerpá energii z okolí; jde o stabilní uspořádání částic.','Permanentný magnet nečerpá energiu z okolia; ide o stabilné usporiadanie častíc.'],

    ['Proč lidé věří v plochou Zemi?','Prečo ľudia veria v plochú Zem?'],
    ['Konspirační teorie mohou dávat pocit výjimečnosti a intelektuální nadřazenosti.','Konšpiračné teórie môžu dávať pocit výnimočnosti a intelektuálnej nadradenosti.'],
    ['Velká část internetových skupin může být spíš humor než skutečná víra.','Veľká časť internetových skupín môže byť skôr humorom než skutočnou vierou.'],
    ['Dezinformace a uzavřené internetové bubliny ale udržují malé jádro skutečných zastánců.','Dezinformácie a uzavreté internetové bubliny však udržiavajú malé jadro skutočných zástancov.'],

    ['Jak dlouho trvá cesta na Mars?','Ako dlho trvá cesta na Mars?'],
    ['Při vhodné vzájemné poloze Země a Marsu trvá cesta přibližně půl roku.','Pri vhodnej vzájomnej polohe Zeme a Marsu trvá cesta približne pol roka.'],
    ['Vhodná startovací okna se opakují zhruba jednou za dva roky.','Vhodné štartovacie okná sa opakujú približne raz za dva roky.'],
    ['První lidské mise mohou být kvůli složité logistice návratu jednosměrné.','Prvé ľudské misie môžu byť pre zložitú logistiku návratu jednosmerné.'],

    ['Může černá díra pohltit něco většího než ona sama?','Môže čierna diera pohltiť niečo väčšie než ona sama?'],
    ['Ano, černé díry běžně pohlcují objekty větší než jejich horizont událostí.','Áno, čierne diery bežne pohlcujú objekty väčšie než ich horizont udalostí.'],
    ['Zmiňují případy, kdy černá díra narušila a postupně pohltila hvězdu.','Spomínajú prípady, keď čierna diera narušila a postupne pohltila hviezdu.'],
    ['Přirovnávají ji k obřímu kompresoru, který hmotu postupně nasává a stlačuje.','Prirovnávajú ju k obrovskému kompresoru, ktorý hmotu postupne nasáva a stláča.'],

    ['Co je to guľový blesk?','Čo je to guľový blesk?'],
    ['Běžný blesk vzniká přeskokem elektrického náboje.','Bežný blesk vzniká preskokom elektrického náboja.'],
    ['Kulový blesk bývá popisován jako samostatná plazmová koule, ale jeho existence nebyla spolehlivě prokázána.','Guľový blesk býva opisovaný ako samostatná plazmová guľa, ale jeho existencia nebola spoľahlivo preukázaná.'],
    ['Krátké světelné jevy po úderu blesku mohou pozorovateli připomínat kulové vzplanutí.','Krátke svetelné javy po údere blesku môžu pozorovateľovi pripomínať guľové vzplanutie.'],

    ['Proč má nalévání horké vody jiný zvuk než studené?','Prečo má nalievanie horúcej vody iný zvuk než studenej?'],
    ['Rozdíl souvisí s odlišným chováním bublinek při různých teplotách.','Rozdiel súvisí s odlišným správaním bubliniek pri rôznych teplotách.'],
    ['Horká voda vytváří více drobných bublinek, které tlumí vysoké frekvence, a zvuk proto působí dutěji.','Horúca voda vytvára viac drobných bubliniek, ktoré tlmia vysoké frekvencie, a zvuk preto pôsobí dutejšie.'],
    ['Rozdíl lze doma zkoumat pomocí spektrogramu zvuku.','Rozdiel možno doma skúmať pomocou zvukového spektrogramu.'],

    ['Podcastové aplikace','Podcastové aplikácie'],
    ['Google Podcasty už neexistují.','Google Podcasty už neexistujú.'],
    ['Samuel používá Spotify a Jozef Apple Podcasts.','Samuel používa Spotify a Jozef Apple Podcasts.'],
    ['Zmiňují také vlastní Vedátorskou aplikaci.','Spomínajú aj vlastnú Vedátorskú aplikáciu.'],

    ['Kolik váží Slunce a jak hvězdy hubnou?','Koľko váži Slnko a ako hviezdy chudnú?'],
    ['Slunce má hmotnost přibližně 2 × 10³⁰ kg.','Slnko má hmotnosť približne 2 × 10³⁰ kg.'],
    ['Hvězdy během života ztrácejí malé procento hmotnosti výrony látky a přeměnou hmoty na energii.','Hviezdy počas života strácajú malé percento hmotnosti výronmi látky a premenou hmoty na energiu.'],
    ['Největší úbytek nastává v závěrečných fázích života hvězdy.','Najväčší úbytok nastáva v záverečných fázach života hviezdy.'],

    ['Kolik práce stojí odpověď na jednu otázku?','Koľko práce stojí odpoveď na jednu otázku?'],
    ['Většina odpovědí vychází z témat, kterým se už dříve věnovali.','Väčšina odpovedí vychádza z tém, ktorým sa už predtým venovali.'],
    ['Jen několik otázek vyžaduje krátké dohledání konkrétních informací.','Len niekoľko otázok si vyžaduje krátke dohľadanie konkrétnych informácií.'],

    ['Můžeme čerpat energii ze středu Země?','Môžeme čerpať energiu zo stredu Zeme?'],
    ['Přímo ze středu Země zatím ne; nejhlubší vrt dosahuje jen přibližně 12 km.','Priamo zo stredu Zeme zatiaľ nie; najhlbší vrt dosahuje len približne 12 km.'],
    ['Geotermální energii lze využívat už v mnohem menších hloubkách.','Geotermálnu energiu možno využívať už v oveľa menších hĺbkach.'],
    ['V blízkosti jádra jsou teplota a tlak příliš vysoké pro současné materiály a technologie.','V blízkosti jadra sú teplota a tlak príliš vysoké pre súčasné materiály a technológie.'],

    ['Jak funguje fotovoltaika?','Ako funguje fotovoltika?'],
    ['Fotony uvolní elektrony v materiálu a elektrické pole je přinutí procházet obvodem, čímž vzniká proud.','Fotóny uvoľnia elektróny v materiáli a elektrické pole ich prinúti prechádzať obvodom, čím vzniká prúd.'],
    ['Princip souvisí s fotoelektrickým jevem, který vysvětlil Einstein.','Princíp súvisí s fotoelektrickým javom, ktorý vysvetlil Einstein.'],
    ['Velký prostor ke zlepšení je hlavně ve vývoji účinnějších materiálů.','Veľký priestor na zlepšenie je najmä vo vývoji účinnejších materiálov.'],

    ['Můžeme jednou žít na Měsíci?','Môžeme raz žiť na Mesiaci?'],
    ['Ano, spíše ale v dočasných výzkumných základnách než v běžných městech.','Áno, skôr však v dočasných výskumných základniach než v bežných mestách.'],
    ['Hlavními problémy jsou kosmické záření, ostrý regolit a chybějící atmosféra.','Hlavnými problémami sú kozmické žiarenie, ostrý regolit a chýbajúca atmosféra.'],
    ['Výhodou může být vodní led a velmi dobré podmínky pro obří radioteleskopy.','Výhodou môže byť vodný ľad a veľmi dobré podmienky pre obrovské rádioteleskopy.']
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
        const item=LOOKUP.get(node.dataset.vedator313Part1Key||raw)||LOOKUP.get(raw);
        if(!item)return;
        node.dataset.vedator313Part1Key=item.cz;
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