(()=>{
  if(window.__vedatorTranslationExtension)return;
  window.__vedatorTranslationExtension=true;

  const language=()=>window.vedatorUiLanguage?.()==='cz'?'cz':'sk';
  const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};

  const SERIES={
    'Hľadanie mimozemského života':{sk:'Hľadanie mimozemského života',cz:'Hledání mimozemského života'},
    'FAQ – dobré otázky':{sk:'FAQ – dobré otázky',cz:'FAQ – dobré otázky'},
    'Rozhovory o vesmíre':{sk:'Rozhovory o vesmíre',cz:'Rozhovory o vesmíru'},
    'Žijem vedu':{sk:'Žijem vedu',cz:'Žiji vědou'},
    'Genetický speciál':{sk:'Genetický špeciál',cz:'Genetický speciál'},
    'Genetický špeciál':{sk:'Genetický špeciál',cz:'Genetický speciál'},
    'Nobelovy ceny':{sk:'Nobelove ceny',cz:'Nobelovy ceny'},
    'Nobelove ceny':{sk:'Nobelove ceny',cz:'Nobelovy ceny'},
    'Ig Nobelovy ceny':{sk:'Ig Nobelove ceny',cz:'Ig Nobelovy ceny'},
    'Ig Nobelove ceny':{sk:'Ig Nobelove ceny',cz:'Ig Nobelovy ceny'},
    'Matematika':{sk:'Matematika',cz:'Matematika'},
    'Teorie her':{sk:'Teória hier',cz:'Teorie her'},
    'Teória hier':{sk:'Teória hier',cz:'Teorie her'},
    'Rozhovory v angličtině':{sk:'Rozhovory v angličtine',cz:'Rozhovory v angličtině'},
    'Rozhovory v angličtine':{sk:'Rozhovory v angličtine',cz:'Rozhovory v angličtině'},
    'Internet':{sk:'Internet',cz:'Internet'},
    'Vedátorský špeciál':{sk:'Vedátorský špeciál',cz:'Vedátorský speciál'},
    'Vedátorský speciál':{sk:'Vedátorský špeciál',cz:'Vedátorský speciál'},
    'Černé díry':{sk:'Čierne diery',cz:'Černé díry'},
    'Čierne diery':{sk:'Čierne diery',cz:'Černé díry'},
    'Tmavá hmota a energie':{sk:'Tmavá hmota a energia',cz:'Temná hmota a energie'},
    'Tmavá hmota a energia':{sk:'Tmavá hmota a energia',cz:'Temná hmota a energie'},
    'Temná hmota a energie':{sk:'Tmavá hmota a energia',cz:'Temná hmota a energie'},
    'Částice':{sk:'Častice',cz:'Částice'},'Častice':{sk:'Častice',cz:'Částice'},
    'Roky ve vědě':{sk:'Roky vo vede',cz:'Roky ve vědě'},'Roky vo vede':{sk:'Roky vo vede',cz:'Roky ve vědě'},
    'Vědci':{sk:'Vedci',cz:'Vědci'},'Vedci':{sk:'Vedci',cz:'Vědci'},
    'Vědkyně':{sk:'Vedkyne',cz:'Vědkyně'},'Vedkyne':{sk:'Vedkyne',cz:'Vědkyně'}
  };

  const TAGS={
    'FAQ':{sk:'FAQ',cz:'FAQ'},
    'Biologie a medicína':{sk:'Biológia a medicína',cz:'Biologie a medicína'},
    'Biológia a medicína':{sk:'Biológia a medicína',cz:'Biologie a medicína'},
    'Černé díry':{sk:'Čierne diery',cz:'Černé díry'},'Čierne diery':{sk:'Čierne diery',cz:'Černé díry'},
    'Kvantová fyzika':{sk:'Kvantová fyzika',cz:'Kvantová fyzika'},
    'Relativita a gravitace':{sk:'Relativita a gravitácia',cz:'Relativita a gravitace'},
    'Relativita a gravitácia':{sk:'Relativita a gravitácia',cz:'Relativita a gravitace'},
    'Matematika':{sk:'Matematika',cz:'Matematika'},
    'Technologie':{sk:'Technológie',cz:'Technologie'},'Technológie':{sk:'Technológie',cz:'Technologie'},
    'Země a příroda':{sk:'Zem a príroda',cz:'Země a příroda'},'Zem a príroda':{sk:'Zem a príroda',cz:'Země a příroda'},
    'Chemie':{sk:'Chémia',cz:'Chemie'},'Chémia':{sk:'Chémia',cz:'Chemie'},
    'Ostatní':{sk:'Ostatné',cz:'Ostatní'},'Ostatné':{sk:'Ostatné',cz:'Ostatní'},
    'Vesmír':{sk:'Vesmír',cz:'Vesmír'}
  };

  const DATA={
    heading:{sk:'Záloha dát aplikácie',cz:'Záloha dat aplikace'},
    intro:{sk:'Uložte si rozpočúvané a vypočuté epizódy spolu s vlastnými playlistami do jedného JSON súboru. Súbor sa vytvorí priamo v tomto zariadení a nikam sa neodosiela.',cz:'Uložte si rozposlouchané a poslechnuté epizody spolu s vlastními playlisty do jednoho souboru JSON. Soubor se vytvoří přímo v tomto zařízení a nikam se neodesílá.'},
    export:{sk:'Stiahnuť zálohu',cz:'Stáhnout zálohu'},import:{sk:'Načítať zálohu',cz:'Načíst zálohu'},
    privacy:{sk:'Súkromie:',cz:'Soukromí:'},
    privacyText:{sk:' export aj import prebiehajú iba lokálne v prehliadači. Žiadne údaje sa neposielajú na žiadny server.',cz:' export i import probíhají pouze místně v prohlížeči. Žádné údaje se neposílají na žádný server.'},
    count:{sk:'Lokálna záloha dát',cz:'Lokální záloha dat'}
  };

  const QUESTION_TEXT={
    'Entropie, absolutní nula a směr času':{sk:'Entropia, absolútna nula a smer času',cz:'Entropie, absolutní nula a směr času'},
    'Je při absolutní nule entropie nulová? A zastavil by se čas?':{sk:'Je pri absolútnej nule entropia nulová? A zastavil by sa čas?',cz:'Je při absolutní nule entropie nulová? A zastavil by se čas?'},
    'Při absolutní nule systém padne do nejnižšího energetického stavu → entropie je minimální (v praxi téměř nulová).':{sk:'Pri absolútnej nule systém prejde do najnižšieho energetického stavu → entropia je minimálna (v praxi takmer nulová).',cz:'Při absolutní nule systém padne do nejnižšího energetického stavu → entropie je minimální (v praxi téměř nulová).'},
    'Nic se nehýbe → v tomto smyslu „čas neplyne“, protože není žádná dynamika.':{sk:'Nič sa nehýbe → v tomto zmysle „čas neplynie“, pretože neprebieha žiadna dynamika.',cz:'Nic se nehýbe → v tomto smyslu „čas neplyne“, protože není žádná dynamika.'},
    'Směr času souvisí s růstem entropie; pokud se nic nemění, není „co měřit“.':{sk:'Smer času súvisí s rastom entropie; ak sa nič nemení, nie je „čo merať“.',cz:'Směr času souvisí s růstem entropie; pokud se nic nemění, není „co měřit“.'},
    'Může kovová kulička narazit do rozbité mramorové stěny a opravit ji?':{sk:'Môže kovová guľôčka naraziť do rozbitej mramorovej steny a opraviť ju?',cz:'Může kovová kulička narazit do rozbité mramorové stěny a opravit ji?'},
    'Fyzikálně povolené, statisticky absolutně nemožné.':{sk:'Fyzikálne je to dovolené, štatisticky však absolútne nemožné.',cz:'Fyzikálně povolené, statisticky absolutně nemožné.'},
    'Aby se stěna „složila zpět“, musely by se všechny molekuly přesně vrátit opačným směrem.':{sk:'Aby sa stena „zložila späť“, museli by sa všetky molekuly presne vrátiť opačným smerom.',cz:'Aby se stěna „složila zpět“, musely by se všechny molekuly přesně vrátit opačným směrem.'},
    'Pravděpodobnost je extrémně malá: řádově 10^(10^20).':{sk:'Pravdepodobnosť je extrémne malá: rádovo 10^(10^20).',cz:'Pravděpodobnost je extrémně malá: řádově 10^(10^20).'},
    'Je to příklad jednosměrnosti času a růstu entropie.':{sk:'Je to príklad jednosmernosti času a rastu entropie.',cz:'Je to příklad jednosměrnosti času a růstu entropie.'},
    'Může se Země převrátit o 180° kvůli Džanibekovovu efektu?':{sk:'Môže sa Zem prevrátiť o 180° v dôsledku Džanibekovovho efektu?',cz:'Může se Země převrátit o 180° kvůli Džanibekovovu efektu?'},
    'Džanibekovův efekt je nestabilní rotace objektů s určitými momenty setrvačnosti.':{sk:'Džanibekovov efekt je nestabilná rotácia objektov s určitými momentmi zotrvačnosti.',cz:'Džanibekovův efekt je nestabilní rotace objektů s určitými momenty setrvačnosti.'},
    'Země má tvar a rozložení hmoty, které takovou nestabilní rotaci neumožňuje.':{sk:'Zem má tvar a rozloženie hmoty, ktoré takúto nestabilnú rotáciu neumožňujú.',cz:'Země má tvar a rozložení hmoty, které takovou nestabilní rotaci neumožňuje.'},
    'Zemi to nehrozí.':{sk:'Zemi to nehrozí.',cz:'Zemi to nehrozí.'},
    'Kdyby se to stalo náhle → všichni by okamžitě zemřeli kvůli obrovskému zrychlení (změna 240 km/s).':{sk:'Keby sa to stalo náhle → všetci by okamžite zomreli v dôsledku obrovského zrýchlenia (zmena 240 km/s).',cz:'Kdyby se to stalo náhle → všichni by okamžitě zemřeli kvůli obrovskému zrychlení (změna 240 km/s).'}
  };

  function translateSeries(){const lang=language();document.querySelectorAll('#series .series-card>summary>span:first-child').forEach(node=>{const original=node.dataset.vedatorSeriesKey||node.textContent.trim(),item=SERIES[original]||SERIES[node.textContent.trim()];if(!item)return;if(!node.dataset.vedatorSeriesKey)node.dataset.vedatorSeriesKey=original;setText(node,item[lang])})}
  function translateTags(){const lang=language();document.querySelectorAll('.tag').forEach(node=>{const key=node.dataset.vedatorTagKey||node.textContent.trim(),item=TAGS[key]||TAGS[node.textContent.trim()];if(!item)return;if(!node.dataset.vedatorTagKey)node.dataset.vedatorTagKey=key;setText(node,item[lang])})}
  function translateSummaries(){const lang=language();document.querySelectorAll('.episode-summary>summary').forEach(n=>setText(n,lang==='sk'?'Zhrnutie dielu':'Shrnutí dílu'))}

  function translatePlaylists(){
    const lang=language(),sk=lang==='sk';
    document.querySelectorAll('.vedator-playlist-count').forEach(node=>{const m=node.textContent.match(/(\d+)\s+(?:položek|položiek)/i);if(m)setText(node,`${m[1]} ${sk?'položiek':'položek'}`)});
    setText(document.querySelector('.vedator-editor-head strong'),sk?'Upraviť playlist':'Upravit playlist');
    const switches=document.querySelectorAll('.vedator-source-switch button');setText(switches[0],sk?'Epizódy':'Epizody');setText(switches[1],sk?'Otázky':'Otázky');
    setText(document.querySelector('.vedator-editor-pane h3'),sk?'Pridané položky':'Přidané položky');
    const active=document.querySelector('.vedator-source-switch button.active')?.dataset.mode||'e';
    setText(document.querySelector('.vedator-source-title'),active==='e'?(sk?'Pridať epizódy':'Přidat epizody'):(sk?'Pridať otázky':'Přidat otázky'));
    const input=document.querySelector('.vedator-editor-search');if(input)input.placeholder=active==='e'?(sk?'Hľadať epizódu…':'Hledat epizodu…'):(sk?'Hľadať otázku…':'Hledat otázku…');
    setText(document.querySelector('.vedator-editor-cancel'),sk?'Zrušiť':'Zrušit');setText(document.querySelector('.vedator-editor-save'),sk?'Uložiť':'Uložit');
  }

  function translateQuestions(){const lang=language();document.querySelectorAll('#questions .faq-question-card, .episode-summary .summary-block').forEach(block=>{block.querySelectorAll('h2,.summary-title,.summary-question,li').forEach(node=>{let raw=node.textContent.trim(),prefix='';if(raw.startsWith('Otázka: ')){prefix=lang==='sk'?'Otázka: ':'Otázka: ';raw=raw.slice(8)}const key=node.dataset.vedatorQuestionKey||raw,item=QUESTION_TEXT[key]||QUESTION_TEXT[raw];if(!item)return;if(!node.dataset.vedatorQuestionKey)node.dataset.vedatorQuestionKey=key;setText(node,prefix+item[lang])})})}

  function translateData(){const lang=language(),card=document.querySelector('.vedator-data-card');if(!card)return;setText(card.querySelector('h2'),DATA.heading[lang]);setText(card.querySelector('p'),DATA.intro[lang]);setText(card.querySelector('.vedator-data-export'),DATA.export[lang]);setText(card.querySelector('.vedator-data-import'),DATA.import[lang]);const note=card.querySelector('.vedator-data-note'),noteHtml=`<strong>${DATA.privacy[lang]}</strong>${DATA.privacyText[lang]}`;if(note&&note.innerHTML!==noteHtml)note.innerHTML=noteHtml;const count=document.querySelector('#count');if(count&&/Lokálna záloha dát|Lokální záloha dat/.test(count.textContent))setText(count,DATA.count[lang])}

  function apply(){translateSeries();translateTags();translateSummaries();translatePlaylists();translateQuestions();translateData()}
  let queued=false;function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply()})}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',apply);window.addEventListener('vedatorcontentchange',apply);
  document.addEventListener('click',()=>requestAnimationFrame(apply),true);
  apply();
})();