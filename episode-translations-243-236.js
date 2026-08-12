(()=>{
  if(window.__vedatorEpisodeTranslations243To236)return;
  window.__vedatorEpisodeTranslations243To236=true;

  const TRANSLATIONS={
    243:{skTitle:'Vedátorský podcast 243 – Fotenie (nielen) Perzeíd',csTitle:'Vedátorský podcast 243 – Fotografování (nejen) Perseid'},
    242:{skTitle:'Vedátorský podcast 242 – Brian Greene (STARMUS interview)',csTitle:'Vedátorský podcast 242 – Brian Greene (STARMUS interview)'},
    241:{skTitle:'Vedátorský podcast 241 – Opakujúce sa novy',csTitle:'Vedátorský podcast 241 – Opakující se novy'},
    240:{skTitle:'Vedátorský podcast 240 – Carole Mundell (STARMUS interview)',csTitle:'Vedátorský podcast 240 – Carole Mundell (STARMUS interview)'},
    239:{skTitle:'Vedátorský podcast 239 – Warpový pohon',csTitle:'Vedátorský podcast 239 – Warpový pohon'},
    238:{skTitle:'Vedátorský podcast 238 – Kip Thorne (STARMUS interview)',csTitle:'Vedátorský podcast 238 – Kip Thorne (STARMUS interview)'},
    237:{skTitle:'Vedátorský podcast 237 – Rozpad protónu',csTitle:'Vedátorský podcast 237 – Rozpad protonu'},
    236:{skTitle:'Vedátorský podcast 236 – Steven Chu (STARMUS interview)',csTitle:'Vedátorský podcast 236 – Steven Chu (STARMUS interview)'}
  };

  const DESCRIPTION_TEXT_PAIRS=[
    ['Nočná obloha je plná fascinujúcich objektov. Väčšina z nich sa takmer nehýbe, niektoré je však sotva vidno. Čo to naozaj sú „padajúce hviezdy“? Ako ich odfotiť? A kam vyraziť za poriadnou nočnou oblohou? O tom všetkom diskutujú Jozef, Samuel a Tomáš Slovinský.','Noční obloha je plná fascinujících objektů. Většina z nich se téměř nepohybuje, některé jsou však sotva viditelné. Co jsou ve skutečnosti „padající hvězdy“? Jak je vyfotografovat? A kam vyrazit za pořádnou noční oblohou? O tom všem diskutují Jozef, Samuel a Tomáš Slovinský.'],
    ['Niektoré hviezdy vybuchnú. A niektoré viac, než raz. Aké typy explózií poznáme? Prečo sa niekedy opakujú? A môžeme takéto niečo pozorovať ešte toto leto? O tom všetkom diskutujú Jozef a Samuel.','Některé hvězdy vybuchnou. A některé více než jednou. Jaké typy explozí známe? Proč se někdy opakují? A můžeme něco takového pozorovat ještě toto léto? O tom všem diskutují Jozef a Samuel.'],
    ['Warpový pohon poznáme všetci, minimálne zo sfi-ci. Čo na neho však hovorí Einstienova teória? Ako takýto pohon zostrojiť? A ktorá teória nám o ňom dá definitívny verdikt? O tom všetkom naživo v Podcast parku diskutujú Jozef a Samuel.','Warpový pohon známe všichni, přinejmenším ze sci-fi. Co o něm ale říká Einsteinova teorie? Jak by bylo možné takový pohon sestrojit? A která teorie nám o něm poskytne definitivní verdikt? O tom všem živě v Podcast parku diskutují Jozef a Samuel.'],
    ['Na rozpade protónu je najzaujímavejšie to, že sa nikdy nestal. Prečo ho teda ľudia skúmajú? Čo by nás naučil o novej fyzike? A ako sa výskumníci pozerajú na takéto singulárne udalosti? O tom všetkom naživo v Podcast parku diskutujú Jozef a Samuel.','Na rozpadu protonu je nejzajímavější to, že k němu nikdy nedošlo. Proč ho tedy lidé zkoumají? Co by nás naučil o nové fyzice? A jak se výzkumníci dívají na takové jedinečné události? O tom všem živě v Podcast parku diskutují Jozef a Samuel.'],
    ['Tomášovu tvorbu nájdete na stránke','Tomášovu tvorbu najdete na webu'],
    ['Máme vonku novú knihu, Rozhovory o vesmíre','Vydali jsme novou knihu Rozhovory o vesmíru'],
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
