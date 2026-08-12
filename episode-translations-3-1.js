(()=>{
  if(window.__vedatorEpisodeTranslations3To1)return;
  window.__vedatorEpisodeTranslations3To1=true;

  const TRANSLATIONS={
    3:{skTitle:'Vedátorský podcast 3 – Deviata planéta',csTitle:'Vedátorský podcast 3 – Devátá planeta'},
    2:{skTitle:'Vedátorský podcast 2 – Tmavá hmota',csTitle:'Vedátorský podcast 2 – Temná hmota'},
    1:{skTitle:'Vedátorský podcast 1 – Jadrová energia v čase klimatických zmien',csTitle:'Vedátorský podcast 1 – Jaderná energie v době klimatických změn'}
  };

  const DESCRIPTION_TEXT_PAIRS=[
    ['Témou tohto dielu podcastu je objavovanie planét našej slnečnej sústavy. Ako sme objavili planéty, ktoré zatiaľ poznáme a prečo si myslíme, že to možno v našom vesmírnom susedstve ešte nie je všetko?','Tématem tohoto dílu podcastu je objevování planet naší Sluneční soustavy. Jak jsme objevili planety, které zatím známe, a proč si myslíme, že v našem vesmírném sousedství možná ještě není všechno?'],
    ['Jedlo čo jeme, oblečenie, ktoré si na seba každý deň obliekame, avšak aj zem na ktorej stojíme a dokonca celý náš vesmír je tvorený nám známou hmotou skladajúcou sa z atómov. Vďaka vede ale vieme, že táto hmota tvorí len asi 4% všetkej hmoty vo vesmíre. Potom z čoho sa skladá náš vesmír? Na tému tmavej hmoty sa rozprávajú Samuel a Jozef.','Jídlo, které jíme, oblečení, které si každý den oblékáme, země, na níž stojíme, a dokonce i celý náš vesmír jsou tvořeny nám známou hmotou složenou z atomů. Díky vědě však víme, že tato hmota představuje jen asi 4 % veškeré hmoty ve vesmíru. Z čeho se tedy náš vesmír skládá? O temné hmotě si povídají Samuel a Jozef.'],
    ['Klimatické zmeny nás ovplyvňujú každý deň a preto nie je prekvapením, že sa dotýkajú aj možných zdrojov energie. Je jadrová energia pasé? Alebo ju čaká v blízkej budúcnosti renesancia? O týchto otázkach sa rozprávajú Jozef a Samuel.','Klimatické změny nás ovlivňují každý den, a proto není překvapením, že se týkají také možných zdrojů energie. Je jaderná energie minulostí? Nebo ji v blízké budoucnosti čeká renesance? O těchto otázkách si povídají Jozef a Samuel.'],
    ['Tento podcast vzniká v spolupráci s denníkom SME.','Tento podcast vzniká ve spolupráci s deníkem SME.'],
    ['Podcast vznikol v spolupráci s denníkom SME.','Podcast vznikl ve spolupráci s deníkem SME.'],
    ['Podcast vzniká v spolupráci s denníkom SME.','Podcast vzniká ve spolupráci s deníkem SME.'],
    ['Podcast vzniká v spolupráci so SME.','Podcast vzniká ve spolupráci se SME.'],
    ['Podcastové hrnčeky a ponožky nájdete na stránke','Podcastové hrnky a ponožky najdete na stránce'],
    ['Podcastové hrnčeky nájdete na stránke','Podcastové hrnky najdete na stránce'],
    ['Vedátora môžete podporiť cez stránku Patreon','Vedátora můžete podpořit prostřednictvím Patreonu'],
    ['Podcast môžete počúvať aj cez','Podcast můžete poslouchat také přes'],
    ['Vedátora nájdete aj na','Vedátora najdete také na'],
    ['Všetko ostatné nájdete tu','Všechno ostatní najdete zde']
  ].sort((a,b)=>b[0].length-a[0].length);

  const ORIGINALS=new Map();
  const normalizeLanguage=value=>{
    const lang=String(value||'').toLowerCase();
    if(lang.startsWith('sk'))return 'sk';
    if(lang.startsWith('cs')||lang.startsWith('cz'))return 'cs';
    return '';
  };
  const language=()=>{
    try{const ui=normalizeLanguage(window.vedatorUiLanguage?.());if(ui)return ui}catch(_){}
    const html=normalizeLanguage(document.documentElement.lang);
    if(html)return html;
    try{
      const stored=localStorage.getItem('vedator-ui-language-v1')||localStorage.getItem('vedator-ui-language');
      const normalized=normalizeLanguage(stored);
      if(normalized)return normalized;
    }catch(_){}
    return 'cs';
  };

  const escapeRegExp=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const flexiblePattern=value=>new RegExp(String(value)
    .split(/[\s\u00a0]+/)
    .map(escapeRegExp)
    .join('[\\s\\u00a0]+'),'g');

  function translateText(text,toCzech){
    let result=String(text||'');
    for(const [sk,cs] of DESCRIPTION_TEXT_PAIRS){
      const from=toCzech?sk:cs;
      const to=toCzech?cs:sk;
      if(result.includes(from))result=result.split(from).join(to);
      else result=result.replace(flexiblePattern(from),to);
    }
    return result;
  }

  function translateHtml(html,toCzech){
    if(typeof html!=='string'||!html)return html;
    const template=document.createElement('template');
    template.innerHTML=html;
    const walker=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode()))node.nodeValue=translateText(node.nodeValue,toCzech);
    return template.innerHTML;
  }

  function rememberEpisode(episode){
    if(!episode||ORIGINALS.has(episode))return;
    ORIGINALS.set(episode,{title:episode.title,description:episode.description});
  }

  function translateEpisode(episode,toCzech){
    if(!episode)return;
    const number=Number(episode.number);
    const translation=TRANSLATIONS[number];
    if(!translation)return;
    rememberEpisode(episode);
    const original=ORIGINALS.get(episode);
    episode.title=toCzech?translation.csTitle:translation.skTitle;
    episode.description=toCzech?translateHtml(original.description,true):original.description;
  }

  function translateSeries(toCzech){
    if(!Array.isArray(window.FIXED_SERIES))return;
    for(const series of window.FIXED_SERIES){
      if(!Array.isArray(series.episodes))continue;
      for(const episode of series.episodes)translateEpisode(episode,toCzech);
    }
  }

  function applyTranslations(){
    const toCzech=language()==='cs';
    try{
      if(Array.isArray(window.episodes))for(const episode of window.episodes)translateEpisode(episode,toCzech);
      else if(typeof episodes!=='undefined'&&Array.isArray(episodes))for(const episode of episodes)translateEpisode(episode,toCzech);
    }catch(_){}
    translateSeries(toCzech);
  }

  function refresh(){
    applyTranslations();
    try{if(typeof render==='function')render()}catch(_){}
    window.dispatchEvent(new Event('vedatorcontentchange'));
  }

  let scheduled=false;
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;applyTranslations()});
  };

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',refresh);
  window.addEventListener('vedatorcontentchange',schedule);
  applyTranslations();
})();
