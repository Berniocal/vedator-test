(()=>{
  if(window.__vedatorQuestionTranslations100Part1)return;
  window.__vedatorQuestionTranslations100Part1=true;

  const PAIRS=[
    ["Kdyby různé barvy světla letěly různou rychlostí, vznikla by mezi nimi tma?","Keby rôzne farby svetla leteli rôznou rýchlosťou, vznikla by medzi nimi tma?"],
    ["Ve vakuu letí všechny barvy stejnou rychlostí.","Vo vákuu letia všetky farby rovnakou rýchlosťou."],
    ["V materiálu se ale mohou různé vlnové délky zpomalovat rozdílně, takže původně společný světelný signál může dorazit rozdělený.","V materiáli sa však môžu rôzne vlnové dĺžky spomaľovať rozdielne, takže pôvodne spoločný svetelný signál môže doraziť rozdelený."],

    ["Proč nemůžeme postavit perpetuum mobile, když se energie zachovává?","Prečo nemôžeme zostrojiť perpetuum mobile, keď sa energia zachováva?"],
    ["Celkové množství energie se zachová, ale její část se vždy rozptýlí jako teplo, zvuk nebo vibrace.","Celkové množstvo energie sa zachová, ale jej časť sa vždy rozptýli ako teplo, zvuk alebo vibrácie."],
    ["Kvůli růstu entropie je stále menší část energie použitelná k vykonání práce.","V dôsledku rastu entropie je čoraz menšia časť energie použiteľná na vykonanie práce."],

    ["Kam se po smrti přemění energie živého organismu?","Na čo sa po smrti premení energia živého organizmu?"],
    ["Při kremaci se chemická energie rychle uvolní hlavně jako teplo.","Pri kremácii sa chemická energia rýchlo uvoľní najmä ako teplo."],
    ["Při rozkladu ji postupně využijí mikroorganismy a část se uloží do dalších chemických vazeb.","Pri rozklade ju postupne využijú mikroorganizmy a časť sa uloží do ďalších chemických väzieb."],

    ["Proč vzniká sonický třesk?","Prečo vzniká sonický tresk?"],
    ["Při letu rychlostí zvuku se jednotlivé tlakové vlny skládají přes sebe.","Pri lete rýchlosťou zvuku sa jednotlivé tlakové vlny navzájom prekrývajú."],
    ["Vytvoří společnou silnou rázovou vlnu, kterou slyšíme jako třesk.","Vytvoria spoločnú silnú rázovú vlnu, ktorú počujeme ako tresk."],

    ["Co se stane s mrtvým tělem ve vesmíru?","Čo sa stane s mŕtvym telom vo vesmíre?"],
    ["Ve vakuu by se z těla odpařovala voda a další tekutiny.","Vo vákuu by sa z tela odparovala voda a ďalšie tekutiny."],
    ["Tělo by postupně chladlo a vysychalo podobně jako při lyofilizaci.","Telo by postupne chladlo a vysychalo podobne ako pri lyofilizácii."],
    ["Vlastní mikroorganismy by mohly krátce pokračovat v rozkladu, ale podmínky by jej výrazně omezily.","Vlastné mikroorganizmy by mohli krátko pokračovať v rozklade, ale podmienky by ho výrazne obmedzili."],

    ["Jsou moderátoři věřící?","Sú moderátori veriaci?"],
    ["Oba odpovídají, že nejsou.","Obaja odpovedajú, že nie sú."],

    ["Co dokázaly sondy Voyager a co od nich ještě můžeme čekat?","Čo dokázali sondy Voyager a čo od nich ešte môžeme očakávať?"],
    ["Prozkoumaly vnější planety a poslaly jejich podrobné snímky.","Preskúmali vonkajšie planéty a poslali ich podrobné snímky."],
    ["Jako první lidské sondy pronikly do mezihvězdného prostoru.","Ako prvé ľudské sondy prenikli do medzihviezdneho priestoru."],
    ["Nadále měří částice a pole za hranicemi heliosféry, dokud jim vydrží energie a spojení.","Naďalej merajú častice a polia za hranicami heliosféry, kým im vydrží energia a spojenie."],

    ["Vidíme všichni stejné barvy?","Vidíme všetci rovnaké farby?"],
    ["Barevný vjem vzniká až v mozku, takže nelze dokázat, že subjektivně vidíme přesně totéž.","Farebný vnem vzniká až v mozgu, takže nemožno dokázať, že subjektívne vidíme presne to isté."],
    ["Lidé se navíc liší citlivostí čípků a někteří mají barvoslepost.","Ľudia sa navyše líšia citlivosťou čapíkov a niektorí majú farbosleposť."],
    ["Vzácně se objevuje tetrachromacie, při níž má člověk čtyři typy barevných receptorů.","Zriedkavo sa objavuje tetrachromácia, pri ktorej má človek štyri typy farebných receptorov."],

    ["Co je z vědeckého hlediska láska?","Čo je z vedeckého hľadiska láska?"],
    ["Láska souvisí s činností mozku, hormony a dalšími biochemickými procesy.","Láska súvisí s činnosťou mozgu, hormónmi a ďalšími biochemickými procesmi."],
    ["Nejde ji ale jednoduše zredukovat na jednu látku nebo chemickou reakci.","Nemožno ju však jednoducho zredukovať na jednu látku alebo chemickú reakciu."],
    ["Zůstává také subjektivním a obtížně definovatelným psychickým stavem.","Zostáva tiež subjektívnym a ťažko definovateľným psychickým stavom."],

    ["Žijeme v simulaci?","Žijeme v simulácii?"],
    ["Přímé důkazy pro to nemáme.","Priame dôkazy o tom nemáme."],
    ["Filosof Nick Bostrom formuloval statistický argument, podle kterého by simulovaných světů mohlo být mnohem více než původních.","Filozof Nick Bostrom formuloval štatistický argument, podľa ktorého by simulovaných svetov mohlo byť oveľa viac než pôvodných."],
    ["Argument je zajímavější než jeho běžné zjednodušené podání, ale hypotézu zatím neumíme ověřit.","Argument je zaujímavejší než jeho bežné zjednodušené podanie, ale hypotézu zatiaľ nevieme overiť."],

    ["Proč vznikl život?","Prečo vznikol život?"],
    ["Jednoduchá odpověď je, že na Zemi nastaly vhodné podmínky pro samoorganizaci a množení složitých struktur.","Jednoduchá odpoveď je, že na Zemi nastali vhodné podmienky na samoorganizáciu a rozmnožovanie zložitých štruktúr."],
    ["Některé hypotézy spojují vznik života se schopností účinněji rozptylovat energii a zvyšovat entropii okolí.","Niektoré hypotézy spájajú vznik života so schopnosťou účinnejšie rozptyľovať energiu a zvyšovať entropiu okolia."],
    ["Není ale dokázáno, že by vesmír „směřoval“ ke vzniku života jako k cíli.","Nie je však dokázané, že by vesmír „smeroval“ k vzniku života ako k cieľu."],

    ["Proč mě nechce žádná dívka?","Prečo ma nechce žiadne dievča?"],
    ["Neexistuje univerzální vědecká odpověď.","Neexistuje univerzálna vedecká odpoveď."],
    ["Doporučují naučit se dobře fungovat sám se sebou a neodvozovat vlastní hodnotu jen od vztahu.","Odporúčajú naučiť sa dobre fungovať sám so sebou a neodvodzovať vlastnú hodnotu iba od vzťahu."]
  ];

  const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
  const csToSk=new Map(PAIRS.map(([cs,sk])=>[normalize(cs),sk]));
  const skToCs=new Map(PAIRS.map(([cs,sk])=>[normalize(sk),cs]));
  const normalizeLanguage=value=>{
    const lang=String(value||'').toLowerCase();
    if(lang.startsWith('sk'))return 'sk';
    if(lang.startsWith('cs')||lang.startsWith('cz'))return 'cs';
    return '';
  };
  const language=()=>{
    try{
      const ui=normalizeLanguage(window.vedatorUiLanguage?.());
      if(ui)return ui;
    }catch(_){}
    const html=normalizeLanguage(document.documentElement.lang);
    if(html)return html;
    try{
      const stored=localStorage.getItem('vedator-ui-language-v1')||localStorage.getItem('vedator-ui-language')||localStorage.getItem('vedator-language');
      return normalizeLanguage(stored)||'cs';
    }catch(_){return 'cs'}
  };

  const selector='.faq-question-card h2, .faq-question-card li, .summary-title, .episode-summary li';
  let applying=false,scheduled=false;
  function translateElement(el,toSk){
    if(!el)return;
    const raw=el.textContent||'';
    const prefix=/^\s*Otázka:\s*/i.exec(raw);
    const body=normalize(prefix?raw.slice(prefix[0].length):raw);
    const next=(toSk?csToSk:skToCs).get(body);
    if(next&&raw!==(prefix?prefix[0]:'')+next)el.textContent=(prefix?prefix[0]:'')+next;
  }
  function apply(){
    if(applying)return;
    applying=true;
    try{
      const toSk=language()==='sk';
      document.querySelectorAll(selector).forEach(el=>translateElement(el,toSk));
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
