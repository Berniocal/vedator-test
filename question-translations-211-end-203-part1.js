(()=>{
  if(window.__vedatorQuestionTranslations211End203Part1)return;
  window.__vedatorQuestionTranslations211End203Part1=true;

  const PAIRS=[
    ['Jak se mají?','Ako sa majú?'],
    ['Oba se mají dobře a těší se na Vánoce.','Obaja sa majú dobre a tešia sa na Vianoce.'],
    ['Snaží se nechávat si prosinec volnější, aby konec roku nebyl příliš hektický.','Snažia sa nechávať si december voľnejší, aby koniec roka nebol príliš hektický.'],

    ['Proč na rovníku necítíme odstředivou sílu ani sonický třesk z rotace Země?','Prečo na rovníku necítime odstredivú silu ani sonický tresk z rotácie Zeme?'],
    ['Atmosféra rotuje společně se Zemí, takže se vůči ní nepohybujeme nadzvukovou rychlostí.','Atmosféra rotuje spolu so Zemou, takže sa voči nej nepohybujeme nadzvukovou rýchlosťou.'],
    ['Odstředivá síla na rovníku působí, ale je mnohem slabší než gravitace.','Odstredivá sila na rovníku pôsobí, ale je omnoho slabšia než gravitácia.'],
    ['Člověk tam proto váží o něco méně a rotace Země také pomáhá při startech raket.','Človek tam preto váži o niečo menej a rotácia Zeme tiež pomáha pri štartoch rakiet.'],

    ['Jak může foton s nulovou hmotností interagovat s hmotou?','Ako môže fotón s nulovou hmotnosťou interagovať s hmotou?'],
    ['Hmotnost není podmínkou všech fyzikálních interakcí.','Hmotnosť nie je podmienkou všetkých fyzikálnych interakcií.'],
    ['Foton působí elektromagneticky a nese energii i hybnost.','Fotón pôsobí elektromagneticky a nesie energiu aj hybnosť.'],
    ['Díky své energii také ovlivňuje časoprostor, přestože nemá klidovou hmotnost.','Vďaka svojej energii tiež ovplyvňuje časopriestor, hoci nemá pokojovú hmotnosť.'],

    ['Jak funguje mýdlo, proč klouže a proč staré mýdlo méně pění?','Ako funguje mydlo, prečo sa šmýka a prečo staré mydlo menej pení?'],
    ['Molekuly mýdla mají část přitahovanou vodou a část přitahovanou mastnotou.','Molekuly mydla majú časť priťahovanú vodou a časť priťahovanú mastnotou.'],
    ['Obalí nečistoty a umožní vodě, aby je odnesla.','Obalia nečistoty a umožnia vode, aby ich odniesla.'],
    ['Mýdlo vytváří kluzkou vodní vrstvičku; starší a vysušené mýdlo se pomaleji rozpouští, a proto méně pění.','Mydlo vytvára klzkú vodnú vrstvičku; staršie a vysušené mydlo sa pomalšie rozpúšťa, a preto menej pení.'],

    ['Jak nejrychleji vychladit polévku?','Ako najrýchlejšie schladiť polievku?'],
    ['Je potřeba zvětšit její povrch a kontakt s chladnějším prostředím.','Treba zväčšiť jej povrch a kontakt s chladnejším prostredím.'],
    ['Pomůže ji přelít do široké nádoby, míchat a foukat na ni.','Pomôže preliať ju do širokej nádoby, miešať a fúkať na ňu.'],
    ['Foukání odstraňuje teplý a vlhký vzduch nad hladinou a urychluje vypařování.','Fúkanie odstraňuje teplý a vlhký vzduch nad hladinou a urýchľuje vyparovanie.'],

    ['Může být temná energie důsledkem gravitace okolních vesmírů?','Môže byť tmavá energia dôsledkom gravitácie okolitých vesmírov?'],
    ['Je to velmi nepravděpodobné, protože rozpínání probíhá ve všech směrech přibližně stejně.','Je to veľmi nepravdepodobné, pretože rozpínanie prebieha vo všetkých smeroch približne rovnako.'],
    ['Vnější vesmír by pravděpodobně vytvářel přednostní směr gravitačního působení.','Vonkajší vesmír by pravdepodobne vytváral prednostný smer gravitačného pôsobenia.'],
    ['Případný vliv jiných vesmírů nelze úplně vyloučit, ale temnou energii nejspíš nevysvětluje.','Prípadný vplyv iných vesmírov nemožno úplne vylúčiť, ale tmavú energiu zrejme nevysvetľuje.'],

    ['Jak daleko je Samuel od habilitace?','Ako ďaleko je Samuel od habilitácie?'],
    ['Většinu požadavků, například publikace, citace a vedení studentů, již splňuje.','Väčšinu požiadaviek, napríklad publikácie, citácie a vedenie študentov, už spĺňa.'],
    ['Chybí mu především ucelený učební text nebo monografie.','Chýba mu predovšetkým ucelený učebný text alebo monografia.'],
    ['Před psaním učebnice zatím dává přednost výzkumu se studenty.','Pred písaním učebnice zatiaľ uprednostňuje výskum so študentmi.'],

    ['Co právě čtou?','Čo práve čítajú?'],
    ['Jozef čte příběhy o cestování časem v japonské kavárně a knihu o Teslovi.','Jozef číta príbehy o cestovaní časom v japonskej kaviarni a knihu o Teslovi.'],
    ['Samuel pokračuje v náročné knize Gödel, Escher, Bach.','Samuel pokračuje v náročnej knihe Gödel, Escher, Bach.'],
    ['Čeká je také rozsáhlá kniha o klimatu sestavená Gretou Thunbergovou.','Čaká ich aj rozsiahla kniha o klíme zostavená Gretou Thunbergovou.'],

    ['Jak si představit vícerozměrný prostor?','Ako si predstaviť viacrozmerný priestor?'],
    ['Pomáhá nejprve porovnat dvojrozměrný a trojrozměrný svět.','Pomáha najprv porovnať dvojrozmerný a trojrozmerný svet.'],
    ['Podobně lze uvažovat o rozdílu mezi třemi a čtyřmi rozměry.','Podobne možno uvažovať o rozdiele medzi tromi a štyrmi rozmermi.'],
    ['Trojrozměrné těleso vrhá 2D stín; obdobně může být náš 3D svět „stínem“ vyššího rozměru.','Trojrozmerné teleso vrhá 2D tieň; podobne môže byť náš 3D svet „tieňom“ vyššieho rozmeru.'],

    ['Jak mohl vzniknout život?','Ako mohol vzniknúť život?'],
    ['Jednoduché molekuly pravděpodobně získaly schopnost organizovat se, kopírovat a uchovávat informaci.','Jednoduché molekuly pravdepodobne získali schopnosť organizovať sa, kopírovať a uchovávať informáciu.'],
    ['Při jejich uspořádávání mohly pomáhat například povrchy minerálů.','Pri ich usporadúvaní mohli pomáhať napríklad povrchy minerálov.'],
    ['Přesný postup vzniku prvního života zatím neznáme a neumíme jej celý zopakovat v laboratoři.','Presný postup vzniku prvého života zatiaľ nepoznáme a nevieme ho celý zopakovať v laboratóriu.'],

    ['Je člověk na trampolíně ve stavu beztíže?','Je človek na trampolíne v stave beztiaže?'],
    ['Ve chvíli, kdy se od trampolíny odrazí a letí vzduchem, je ve volném pádu.','Vo chvíli, keď sa od trampolíny odrazí a letí vzduchom, je vo voľnom páde.'],
    ['Tehdy na něj nepůsobí opěrná síla a krátce zažívá stav beztíže.','Vtedy naňho nepôsobí oporná sila a krátko zažíva stav beztiaže.'],
    ['Sílu cítí hlavně při kontaktu s trampolínou, která jej urychluje vzhůru.','Silu cíti najmä pri kontakte s trampolínou, ktorá ho urýchľuje nahor.'],

    ['Byl by člověk ve stavu beztíže i po dosažení únikové rychlosti?','Bol by človek v stave beztiaže aj po dosiahnutí únikovej rýchlosti?'],
    ['Ano, pokud by na něj nepůsobil motor ani jiná opěrná síla, stále by byl ve volném pohybu.','Áno, ak by naňho nepôsobil motor ani iná oporná sila, stále by bol vo voľnom pohybe.'],
    ['Beztíže neznamená nepřítomnost gravitace, ale nepřítomnost síly, která těleso podpírá nebo tlačí.','Beztiaž neznamená neprítomnosť gravitácie, ale neprítomnosť sily, ktorá teleso podopiera alebo tlačí.']
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
    if(next)el.textContent=(prefix?prefix[0]:'')+next;
  }
  function apply(root=document){
    if(applying)return;applying=true;
    try{const toSk=language()==='sk';root.querySelectorAll?.('.summary-title,.question-title,.question-heading,h3,h4,li').forEach(el=>translateElement(el,toSk))}
    finally{applying=false}
  }
  function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;apply()})}
  apply();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',schedule);
})();