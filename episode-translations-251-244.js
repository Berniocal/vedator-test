(()=>{
  if(window.__vedatorEpisodeTranslations251To244)return;
  window.__vedatorEpisodeTranslations251To244=true;

  const TRANSLATIONS={
    251:{skTitle:'Vedátorský podcast 251 – Klimatická zmena 3',csTitle:'Vedátorský podcast 251 – Klimatická změna 3'},
    250:{skTitle:'Vedátorský podcast 250 – Lawrence Krauss',csTitle:'Vedátorský podcast 250 – Lawrence Krauss'},
    249:{skTitle:'Vedátorský podcast 249 – Topológia',csTitle:'Vedátorský podcast 249 – Topologie'},
    248:{skTitle:'Vedátorský podcast 248 – FAQ dobré otázky',csTitle:'Vedátorský podcast 248 – FAQ dobré otázky'},
    247:{skTitle:'Vedátorský podcast 247 – Fosfor',csTitle:'Vedátorský podcast 247 – Fosfor'},
    246:{skTitle:'Vedátorský podcast 246 – Interview with Stefano Buono',csTitle:'Vedátorský podcast 246 – Interview with Stefano Buono'},
    245:{skTitle:'Vedátorský podcast 245 – Teória hier 4: Náhodnosť',csTitle:'Vedátorský podcast 245 – Teorie her 4: Náhodnost'},
    244:{skTitle:'Vedátorský podcast 244 – FAQ dobré otázky',csTitle:'Vedátorský podcast 244 – FAQ dobré otázky'}
  };

  const DESCRIPTION_TEXT_PAIRS=[
    ['Vraciame sa k Veľkej knihe o klíme, postupne ju prechádzame po kapitolách, môžete spolu s nami. Aké sú extrémne prejavy počasia? Ako rozmýšľať štatisticky o klimatickej zmenej? V čom je metán iný ako oxid uhličitý? O tom všetkom diskutujú Jozef, Samuel.','Vracíme se k Velké knize o klimatu a postupně ji procházíme po kapitolách, můžete se přidat k nám. Jaké jsou extrémní projevy počasí? Jak statisticky přemýšlet o klimatické změně? V čem se metan liší od oxidu uhličitého? O tom všem diskutují Jozef a Samuel.'],
    ['(Na YouTube si môžete pustiť automaticky prekladané titulky.)','(Na YouTube si můžete zapnout automaticky překládané titulky.)'],
    ['Svet okolo nás je zložitý a tak sa ho snažíme si zjednodušiť. Občas sa to podarí tak dobre, že z toho vznikne nová oblasť matematiky. Čo je to topológia? Aké rozdiely medzi telesami sú podľa nej dôležité? A ako súvisí so svetom okolo nás? O tom všetkom diskutujú Jozef, Samuel.','Svět kolem nás je složitý, a tak se ho snažíme zjednodušit. Občas se to podaří tak dobře, že z toho vznikne nová oblast matematiky. Co je topologie? Které rozdíly mezi tělesy jsou podle ní důležité? A jak souvisí se světem kolem nás? O tom všem diskutují Jozef a Samuel.'],
    ['Počet otázok od vás sa blíži k číslu 800 a tak je čas pár z nich zodpovedať. Prečo kýchame na slnku? Platí Einsteinov vzorec pre tmavú energiu? A dá sa ísť z obchodnej na Matfyz? O tom všetkom diskutujú Jozef, Samuel.','Počet otázek od vás se blíží číslu 800, a tak je čas na několik z nich odpovědět. Proč kýcháme na slunci? Platí Einsteinův vzorec pro temnou energii? A dá se jít z obchodní akademie na matfyz? O tom všem diskutují Jozef a Samuel.'],
    ['Fosfor ja všade okolo nás. A nielen okolo, ale aj v nás. Na čo nám je? Kde sme ho získavali? A aký vplyv má na svet, v ktorom žijeme? O tom všetkom diskutujú Jozef a Samuel.','Fosfor je všude kolem nás. A nejen kolem, ale také v nás. K čemu ho potřebujeme? Kde jsme ho získávali? A jaký vliv má na svět, ve kterém žijeme? O tom všem diskutují Jozef a Samuel.'],
    ['O teórii hier sme sa rozprávali viackrát. Prejavy tejto matematickej disciplíny vidíme na bojiskách, finančných trhoch aj v prírode. Akú úlohu v nej zohráva náhodnosť? Vieme byť nepredvídateľní? A v čom nám to dáva nový uhol pohľadu na históriu? O tom všetkom diskutujú Jozef a Samuel.','O teorii her jsme mluvili několikrát. Projevy této matematické disciplíny vidíme na bojištích, finančních trzích i v přírodě. Jakou roli v ní hraje náhodnost? Dokážeme být nepředvídatelní? A v čem nám poskytuje nový pohled na historii? O tom všem diskutují Jozef a Samuel.'],
    ['Prišlo leto a to znamená jediné, znovu máme epizódu s otázkami od vás, naši poslucháčov. Záujem bol pestrý. Ako by vyzera výbuch atómovej bomby vo vesmíre? Ako žiť s ezoterikom? A kedy pôjdeme konečne behať? O tom všetkom diskutujú Jozef a Samuel.','Přišlo léto a to znamená jediné: znovu máme epizodu s otázkami od vás, našich posluchačů. Zájem byl pestrý. Jak by vypadal výbuch atomové bomby ve vesmíru? Jak žít s ezoterikem? A kdy konečně půjdeme běhat? O tom všem diskutují Jozef a Samuel.'],
    ['Náhodná hra','Náhodná hra'],
    ['Máme novú knihu – Rozhovory o vesmíre','Máme novou knihu – Rozhovory o vesmíru'],
    ['Podcastové hrnčeky a ponožky nájdete na stránke','Podcastové hrnky a ponožky najdete na stránce'],
    ['Vedátora môžete podporiť cez stránku Patreon','Vedátora můžete podpořit prostřednictvím Patreonu'],
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
      const stored=localStorage.getItem('vedator-ui-language-v1')||localStorage.getItem('vedator-ui-language')||localStorage.getItem('vedator-language');
      return normalizeLanguage(stored)||'cs';
    }catch(_){return 'cs'}
  };

  function translateDescriptionHtml(source){
    const root=document.createElement('div');
    root.innerHTML=String(source||'');
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      let value=node.nodeValue||'';
      DESCRIPTION_TEXT_PAIRS.forEach(([sk,cs])=>{value=value.split(sk).join(cs)});
      node.nodeValue=value;
    });
    return root.innerHTML;
  }

  function episodeData(){try{return Array.isArray(episodes)?episodes:null}catch(_){return null}}
  function applyData(){
    const list=episodeData();
    if(!list)return false;
    const toCzech=language()==='cs';
    let changed=false;
    for(const episode of list){
      const number=Number(episode?.number);
      const translation=TRANSLATIONS[number];
      if(!translation)continue;
      if(!ORIGINALS.has(number))ORIGINALS.set(number,{title:String(episode.title||translation.skTitle),description:String(episode.description||'')});
      const original=ORIGINALS.get(number);
      const nextTitle=toCzech?translation.csTitle:original.title;
      const nextDescription=toCzech?translateDescriptionHtml(original.description):original.description;
      if(episode.title!==nextTitle){episode.title=nextTitle;changed=true}
      if(episode.description!==nextDescription){episode.description=nextDescription;changed=true}
    }
    return changed;
  }

  function numberFromTitle(value){const match=/Vedátorský podcast\s+(\d+)/i.exec(String(value||''));return match?Number(match[1]):0}
  function applyEpisodeTitles(){
    const toCzech=language()==='cs';
    document.querySelectorAll('#episodes article h2').forEach(title=>{
      const translation=TRANSLATIONS[numberFromTitle(title.textContent)];
      if(!translation)return;
      const nextTitle=toCzech?translation.csTitle:translation.skTitle;
      if(title.textContent!==nextTitle)title.textContent=nextTitle;
    });
  }
  function applySeries(){
    const toCzech=language()==='cs';
    document.querySelectorAll('#series .series-body a').forEach(link=>{
      const titleNode=link.querySelector('.episode-title')||link;
      const translation=TRANSLATIONS[numberFromTitle(titleNode.textContent)];
      if(!translation)return;
      const nextTitle=toCzech?translation.csTitle:translation.skTitle;
      if(titleNode.textContent!==nextTitle)titleNode.textContent=nextTitle;
    });
  }
  function wakeDescriptionRenderer(){
    const box=document.querySelector('#episodes');
    if(!box)return;
    const marker=document.createComment('vedator-episode-description-language');
    box.appendChild(marker);marker.remove();
  }
  function apply(){const dataChanged=applyData();applyEpisodeTitles();applySeries();if(dataChanged)wakeDescriptionRenderer()}
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;apply()})}
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',schedule);
  window.addEventListener('vedatorcontentchange',schedule);
  apply();
})();
