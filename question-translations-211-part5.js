(()=>{
  if(window.__vedatorQuestionTranslations211Part5)return;
  window.__vedatorQuestionTranslations211Part5=true;

  const PAIRS=[
    ['Proč starší lidi bolí záda?','Prečo starších ľudí bolí chrbát?'],
    ['S věkem se opotřebovávají ploténky, klouby a další části pohybového aparátu.','S vekom sa opotrebúvajú platničky, kĺby a ďalšie časti pohybového aparátu.'],
    ['Menší aktivita a pomalejší regenerace mohou vytvářet začarovaný kruh dalšího ochabování.','Menšia aktivita a pomalšia regenerácia môžu vytvárať začarovaný kruh ďalšieho ochabovania.'],

    ['Jak funguje „Black Hole Star“?','Ako funguje „Black Hole Star“?'],
    ['Jde o hypotetickou ranou hvězdu s černou dírou uprostřed.','Ide o hypotetickú ranú hviezdu s čiernou dierou uprostred.'],
    ['Nezářila by hlavně díky jaderné fúzi, ale díky zahřívání hmoty padající do černé díry.','Nežiarila by najmä vďaka jadrovej fúzii, ale vďaka zahrievaniu hmoty padajúcej do čiernej diery.'],

    ['Co určuje rychlost rotace černé díry?','Čo určuje rýchlosť rotácie čiernej diery?'],
    ['Záleží na momentu hybnosti hmoty, která do ní v minulosti padala.','Závisí od momentu hybnosti hmoty, ktorá do nej v minulosti padala.'],
    ['Nerovnoměrně dopadající materiál černou díru roztáčí.','Nerovnomerne dopadajúci materiál čiernu dieru roztáča.'],

    ['Co vidí člověk padající do černé díry?','Čo vidí človek padajúci do čiernej diery?'],
    ['Obloha by se postupně soustředila do stále menšího kruhu nad ním.','Obloha by sa postupne sústredila do čoraz menšieho kruhu nad ním.'],
    ['Silně zakřivený časoprostor by měnil dráhy světla přicházejícího z okolí.','Silne zakrivený časopriestor by menil dráhy svetla prichádzajúceho z okolia.'],

    ['Je matematika vymyšlená, nebo objevená?','Je matematika vymyslená alebo objavená?'],
    ['Jozef se přiklání k tomu, že matematické vztahy objevujeme.','Jozef sa prikláňa k tomu, že matematické vzťahy objavujeme.'],
    ['Samuelův názor se mění; Gödelovy věty podle něj ukazují, že otázka není jednoduchá.','Samuelov názor sa mení; Gödelove vety podľa neho ukazujú, že otázka nie je jednoduchá.'],

    ['Jaký je nejlepší model vzniku vesmíru?','Aký je najlepší model vzniku vesmíru?'],
    ['Nejlépe pozorováním podpořený je model velkého třesku.','Najlepšie pozorovaniami podporený je model veľkého tresku.'],
    ['Existují i alternativy, například cyklický vesmír nebo velký odraz, ale nemají stejně silnou podporu.','Existujú aj alternatívy, napríklad cyklický vesmír alebo veľký odraz, ale nemajú rovnako silnú podporu.'],

    ['Jaká je pravděpodobnost vzniku vesmíru?','Aká je pravdepodobnosť vzniku vesmíru?'],
    ['Víme pouze, že je větší než nula, protože jeden vesmír prokazatelně existuje.','Vieme iba to, že je väčšia než nula, pretože jeden vesmír preukázateľne existuje.'],
    ['Bez znalosti procesu a počtu možných „pokusů“ neumíme pravděpodobnost určit.','Bez znalosti procesu a počtu možných „pokusov“ nevieme pravdepodobnosť určiť.'],

    ['Jaký je vztah matematiky a fyziky? Může objev ve fyzice změnit matematiku?','Aký je vzťah matematiky a fyziky? Môže objav vo fyzike zmeniť matematiku?'],
    ['Fyzika často využívá matematiku vytvořenou dříve pro čistě teoretické účely.','Fyzika často využíva matematiku vytvorenú skôr na čisto teoretické účely.'],
    ['Nové fyzikální teorie ale mohou matematický výzkum nasměrovat k novým problémům a strukturám.','Nové fyzikálne teórie však môžu matematický výskum nasmerovať k novým problémom a štruktúram.'],

    ['Objeví se v knize Kúsky reality Frida?','Objaví sa v knihe Kúsky reality Frida?'],
    ['Pravděpodobně ne, protože postavy bývají pojmenované podle jiných domácích zvířat.','Pravdepodobne nie, pretože postavy bývajú pomenované podľa iných domácich zvierat.'],
    ['Frida se však objevila jako nakreslený králík v předchozí knize.','Frida sa však objavila ako nakreslený králik v predchádzajúcej knihe.'],

    ['Co plánují na vánoční období?','Čo plánujú na vianočné obdobie?'],
    ['Chtějí odpočívat, číst knihy a jet na zimní chatu.','Chcú oddychovať, čítať knihy a ísť na zimnú chatu.'],
    ['Jozef také začne postupně trénovat na maraton v Římě.','Jozef tiež začne postupne trénovať na maratón v Ríme.'],

    ['Proč se urychlovač nazývá hadronový?','Prečo sa urýchľovač nazýva hadrónový?'],
    ['Protože v něm dochází ke srážkám hadronů, například protonů.','Pretože v ňom dochádza k zrážkam hadrónov, napríklad protónov.'],
    ['Hadrony jsou částice složené z kvarků.','Hadróny sú častice zložené z kvarkov.'],

    ['Existuje vztah mezi entropií a životem?','Existuje vzťah medzi entropiou a životom?'],
    ['Život vytváří uspořádané struktury díky využívání nízkoentropické energie ze Slunce.','Život vytvára usporiadané štruktúry vďaka využívaniu nízkoentropickej energie zo Slnka.'],
    ['Přitom vyzařuje odpadní teplo, takže celková entropie vesmíru stále roste.','Pritom vyžaruje odpadové teplo, takže celková entropia vesmíru stále rastie.']
  ];

  const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
  const csToSk=new Map(PAIRS.map(([cs,sk])=>[normalize(cs),sk]));
  const skToCs=new Map(PAIRS.map(([cs,sk])=>[normalize(sk),cs]));
  const language=()=>{
    try{if(typeof window.vedatorUiLanguage==='function')return window.vedatorUiLanguage()}catch(_){}
    const html=(document.documentElement.lang||'').toLowerCase();
    if(html.startsWith('sk'))return'sk';
    if(html.startsWith('cs')||html.startsWith('cz'))return'cs';
    try{return localStorage.getItem('vedator-ui-language')||localStorage.getItem('vedator-language')||'cs'}catch(_){return'cs'}
  };
  let applying=false,scheduled=false;
  function translateElement(el,toSk){
    if(!el||el.closest?.('mark.vedator-match'))return;
    const raw=el.textContent||'';
    const prefix=/^\s*Otázka:\s*/i.exec(raw);
    const body=normalize(prefix?raw.slice(prefix[0].length):raw);
    const next=(toSk?csToSk:skToCs).get(body);
    if(!next)return;
    el.textContent=(prefix?prefix[0]:'')+next;
  }
  function apply(root=document){
    if(applying)return;
    applying=true;
    try{
      const toSk=language()==='sk';
      root.querySelectorAll?.('.summary-title, .question-title, .question-heading, h3, h4, li').forEach(el=>translateElement(el,toSk));
    }finally{applying=false}
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;apply()});
  }
  apply();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',schedule);
})();