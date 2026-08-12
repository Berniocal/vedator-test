(()=>{
  if(window.__vedatorEpisodeTranslation347)return;
  window.__vedatorEpisodeTranslation347=true;

  const TRANSLATION={
    skTitle:'Vedátorský podcast 347 – Známe zatmenia',
    csTitle:'Vedátorský podcast 347 – Známá zatmění',
    skLead:'Prečo sú slnko a mesiac na oblohe takmer rovnako veľké? Naozaj dokázal Tales predpovedať zatmenie už v staroveku? Ako pozorovanie zatmenia potvrdilo teóriu relativity? Kedy nastane najbližšie úplné zatmenie slnka na Slovensku? O tom všetkom diskutujú Jozef a Samuel.',
    csLead:'Proč jsou Slunce a Měsíc na obloze téměř stejně velké? Opravdu dokázal Thalés předpovědět zatmění už ve starověku? Jak pozorování zatmění potvrdilo teorii relativity? Kdy nastane nejbližší úplné zatmění Slunce na Slovensku? O tom všem diskutují Jozef a Samuel.'
  };

  const DESCRIPTION_TEXT_PAIRS=[
    ['Podcast vzniká v spolupráci so SME.','Podcast vzniká ve spolupráci se SME.'],
    ['Bonusové epizódy a extra obsah k podcastom nájdete na','Bonusové epizody a další obsah k podcastům najdete na'],
    ['Samuelova nová kniha už je v predaji','Samuelova nová kniha je už v prodeji'],
    ['Otázky nám môžete nahrávať tu','Otázky nám můžete nahrávat zde'],
    ['Podcastové hrnčeky a ponožky nájdete na stránke','Podcastové hrnky a ponožky najdete na stránce'],
    ['Všetko ostatné nájdete tu','Všechno ostatní najdete zde']
  ];

  let original=null;

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
      const stored=localStorage.getItem('vedator-ui-language-v1')
        ||localStorage.getItem('vedator-ui-language')
        ||localStorage.getItem('vedator-language');
      return normalizeLanguage(stored)||'cs';
    }catch(_){return 'cs'}
  };

  function translateDescriptionHtml(source){
    const root=document.createElement('div');
    root.innerHTML=String(source||'');

    const firstParagraph=root.querySelector('p');
    if(firstParagraph)firstParagraph.textContent=TRANSLATION.csLead;
    else root.prepend(Object.assign(document.createElement('p'),{textContent:TRANSLATION.csLead}));

    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);

    nodes.forEach(node=>{
      if(node.parentElement?.closest('a'))return;
      let value=node.nodeValue||'';
      DESCRIPTION_TEXT_PAIRS.forEach(([sk,cs])=>{value=value.split(sk).join(cs)});
      node.nodeValue=value;
    });

    return root.innerHTML;
  }

  function episodeData(){
    try{return Array.isArray(episodes)?episodes:null}catch(_){return null}
  }

  function applyData(){
    const list=episodeData();
    if(!list)return false;
    const episode=list.find(item=>Number(item?.number)===347);
    if(!episode)return false;

    if(!original){
      original={
        title:String(episode.title||TRANSLATION.skTitle),
        description:String(episode.description||TRANSLATION.skLead)
      };
    }

    const toCzech=language()==='cs';
    const nextTitle=toCzech?TRANSLATION.csTitle:original.title;
    const nextDescription=toCzech?translateDescriptionHtml(original.description):original.description;
    let changed=false;

    if(episode.title!==nextTitle){episode.title=nextTitle;changed=true}
    if(episode.description!==nextDescription){episode.description=nextDescription;changed=true}
    return changed;
  }

  function numberFromTitle(value){
    const match=/Vedátorský podcast\s+(\d+)/i.exec(String(value||''));
    return match?Number(match[1]):0;
  }

  function applyVisibleTitles(){
    const nextTitle=language()==='cs'?TRANSLATION.csTitle:TRANSLATION.skTitle;
    document.querySelectorAll('#episodes article h2,#series .series-body a').forEach(node=>{
      const titleNode=node.matches('a')?(node.querySelector('.episode-title')||node):node;
      if(numberFromTitle(titleNode.textContent)!==347)return;
      if(titleNode.textContent!==nextTitle)titleNode.textContent=nextTitle;
    });
  }

  function wakeDescriptionRenderer(){
    const box=document.querySelector('#episodes');
    if(!box)return;
    const marker=document.createComment('vedator-episode-347-language');
    box.appendChild(marker);
    marker.remove();
  }

  function apply(){
    const dataChanged=applyData();
    applyVisibleTitles();
    if(dataChanged)wakeDescriptionRenderer();
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{
      scheduled=false;
      apply();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement,{
    childList:true,
    subtree:true
  });
  window.addEventListener('vedatorlanguagechange',schedule);
  window.addEventListener('vedatorcontentchange',schedule);
  apply();
})();
