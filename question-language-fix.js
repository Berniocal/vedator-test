(()=>{
  if(window.__vedatorQuestionLanguageFix)return;
  window.__vedatorQuestionLanguageFix=true;

  const PAIRS=[
    ['Entropie, absolutní nula a směr času','Entropia, absolútna nula a smer času'],
    ['Je při absolutní nule entropie nulová? A zastavil by se čas?','Je pri absolútnej nule entropia nulová? A zastavil by sa čas?'],
    ['Při absolutní nule systém padne do nejnižšího energetického stavu → entropie je minimální (v praxi téměř nulová).','Pri absolútnej nule systém prejde do najnižšieho energetického stavu → entropia je minimálna (v praxi takmer nulová).'],
    ['Nic se nehýbe → v tomto smyslu „čas neplyne“, protože není žádná dynamika.','Nič sa nehýbe → v tomto zmysle „čas neplynie“, pretože neprebieha žiadna dynamika.'],
    ['Směr času souvisí s růstem entropie; pokud se nic nemění, není „co měřit“.','Smer času súvisí s rastom entropie; ak sa nič nemení, nie je „čo merať“.'],
    ['Může kovová kulička narazit do rozbité mramorové stěny a opravit ji?','Môže kovová guľôčka naraziť do rozbitej mramorovej steny a opraviť ju?'],
    ['Fyzikálně povolené, statisticky absolutně nemožné.','Fyzikálne je to dovolené, štatisticky však absolútne nemožné.'],
    ['Aby se stěna „složila zpět“, musely by se všechny molekuly přesně vrátit opačným směrem.','Aby sa stena „zložila späť“, museli by sa všetky molekuly presne vrátiť opačným smerom.'],
    ['Pravděpodobnost je extrémně malá: řádově 10^(10^20).','Pravdepodobnosť je extrémne malá: rádovo 10^(10^20).'],
    ['Je to příklad jednosměrnosti času a růstu entropie.','Je to príklad jednosmernosti času a rastu entropie.'],
    ['Může se Země převrátit o 180° kvůli Džanibekovovu efektu?','Môže sa Zem prevrátiť o 180° v dôsledku Džanibekovovho efektu?'],
    ['Džanibekovův efekt je nestabilní rotace objektů s určitými momenty setrvačnosti.','Džanibekovov efekt je nestabilná rotácia objektov s určitými momentmi zotrvačnosti.'],
    ['Země má tvar a rozložení hmoty, které takovou nestabilní rotaci neumožňuje.','Zem má tvar a rozloženie hmoty, ktoré takúto nestabilnú rotáciu neumožňujú.'],
    ['Zemi to nehrozí.','Zemi to nehrozí.'],
    ['Kdyby se to stalo náhle → všichni by okamžitě zemřeli kvůli obrovskému zrychlení (změna 240 km/s).','Keby sa to stalo náhle → všetci by okamžite zomreli v dôsledku obrovského zrýchlenia (zmena 240 km/s).']
  ];

  const byText=new Map();
  PAIRS.forEach((pair,index)=>{byText.set(pair[0],index);byText.set(pair[1],index)});
  const lang=()=>window.vedatorUiLanguage?.()==='cz'?'cz':'sk';

  function translateNode(node){
    let raw=node.textContent.trim(),prefix='';
    if(raw.startsWith('Otázka: ')){prefix='Otázka: ';raw=raw.slice(8)}
    let index=node.dataset.vedatorBilingualQuestion;
    if(index===undefined){
      const found=byText.get(raw);
      if(found===undefined)return;
      index=String(found);
      node.dataset.vedatorBilingualQuestion=index;
    }
    const pair=PAIRS[Number(index)];
    if(!pair)return;
    const next=prefix+pair[lang()==='cz'?0:1];
    if(node.textContent!==next)node.textContent=next;
  }

  function apply(root=document){
    root.querySelectorAll?.('#questions .faq-question-card h2,#questions .faq-question-card li,.episode-summary .summary-title,.episode-summary .summary-question,.episode-summary .summary-block li').forEach(translateNode);
  }

  let queued=false;
  function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply()})}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',apply);
  window.addEventListener('vedatorcontentchange',apply);
  apply();

  if(!document.querySelector('script[data-vedator-question-highlight-translated]')){
    const script=document.createElement('script');
    script.src='./question-highlight-translated.js';
    script.defer=true;
    script.dataset.vedatorQuestionHighlightTranslated='1';
    document.head.appendChild(script);
  }
})();
