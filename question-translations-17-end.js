(()=>{
  if(window.__vedatorQuestionTranslations17End)return;
  window.__vedatorQuestionTranslations17End=true;

  const PAIRS=[
    ["Jsou ekologičtější elektromobily, nebo spalovací auta, a jaká je budoucnost automobilů?", "Sú ekologickejšie elektromobily alebo spaľovacie autá a aká je budúcnosť automobilov?"],
    ["Spalovací motory vždy vracejí do atmosféry uhlík z fosilních paliv.", "Spaľovacie motory vždy vracajú do atmosféry uhlík z fosílnych palív."],
    ["Ekologičnost elektromobilu závisí hlavně na způsobu výroby elektřiny a baterie.", "Ekologickosť elektromobilu závisí najmä od spôsobu výroby elektriny a batérie."],
    ["V zemích s jadernou nebo obnovitelnou energií mohou elektromobily výrazně snížit emise.", "V krajinách s jadrovou alebo obnoviteľnou energiou môžu elektromobily výrazne znížiť emisie."],
    ["Potřebná je také čistší výroba elektřiny a rozvoj veřejné dopravy.", "Potrebná je aj čistejšia výroba elektriny a rozvoj verejnej dopravy."],
    ["Budoucnost může patřit elektromobilům, autonomním vozidlům a částečně také vodíkovým autům.", "Budúcnosť môže patriť elektromobilom, autonómnym vozidlám a čiastočne aj vodíkovým autám."],
    ["Odkud pochází inspirace pro vedátorské obrázky?", "Odkiaľ pochádza inšpirácia na vedátorské obrázky?"],
    ["Obrázky nevycházejí z konkrétního uměleckého stylu ani vzoru.", "Obrázky nevychádzajú z konkrétneho umeleckého štýlu alebo vzoru."],
    ["Vznikají ve Photoshopu a mají být jednoduché, výrazné, kreativní a snadno pochopitelné.", "Vznikajú vo Photoshope a majú byť jednoduché, výrazné, kreatívne a ľahko pochopiteľné."],
    ["Samotné zpracování může trvat jen několik minut, ale vymyšlení dobrého nápadu často mnohem déle.", "Samotné spracovanie môže trvať iba niekoľko minút, ale vymyslenie dobrého nápadu často oveľa dlhšie."]
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

  if(!document.querySelector('script[data-vedator-episode-translations-346-337]')){
    const script=document.createElement('script');
    script.src='./episode-translations-346-337.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations346337='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-episode-translations-336-330]')){
    const script=document.createElement('script');
    script.src='./episode-translations-336-330.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations336330='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-episode-translations-329-323]')){
    const script=document.createElement('script');
    script.src='./episode-translations-329-323.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations329323='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-episode-translations-322-316]')){
    const script=document.createElement('script');
    script.src='./episode-translations-322-316.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations322316='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-episode-translations-315-308]')){
    const script=document.createElement('script');
    script.src='./episode-translations-315-308.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations315308='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-episode-translations-307-300]')){
    const script=document.createElement('script');
    script.src='./episode-translations-307-300.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations307300='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-episode-translations-299-292]')){
    const script=document.createElement('script');
    script.src='./episode-translations-299-292.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations299292='1';
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-vedator-episode-translations-291-284]')){
    const script=document.createElement('script');
    script.src='./episode-translations-291-284.js';
    script.async=false;
    script.dataset.vedatorEpisodeTranslations291284='1';
    document.head.appendChild(script);
  }
})();