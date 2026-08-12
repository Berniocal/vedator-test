(()=>{
  if(window.__vedatorTopicFilterFix)return;
  window.__vedatorTopicFilterFix=true;

  try{
    const extraMath=[
      'štatistika','štatistický','štatistická','štatistické','štatistickú','štatistických','štatisticky',
      'pravdepodobnosť','pravdepodobnostné','pravdepodobnostný','pravdepodobnostná',
      'exponenciálne rozdelenie','exponenciálny','exponenciálna','exponenciálne',
      'normálne rozdelenie','normálny rozptyl','gaussovo rozdelenie','gaussovské rozdelenie',
      'rozdelenie pravdepodobnosti','priemer','medián','modus','rozptyl','variancia',
      'štandardná odchýlka','smerodajná odchýlka','kombinatorika','permutácia','kombinácia',
      'logaritmus','logaritmický','regresia','korelácia','náhodná veličina'
    ];
    TOPICS.Matematika=[...new Set([...(TOPICS.Matematika||[]),...extraMath])];

    const biologyKey=Object.keys(TOPICS).find(key=>/biologie|biológia/i.test(key));
    if(biologyKey){
      TOPICS[biologyKey]=[...new Set((TOPICS[biologyKey]||[]).filter(word=>norm(word)!=='gen').concat([
        'gén','gény','génov','genet','genóm','genom','genetick'
      ]))];
    }

    const faqKey=Object.keys(TOPICS).find(key=>/^faq$/i.test(key));
    if(faqKey)TOPICS[faqKey]=[...new Set([...(TOPICS[faqKey]||[]),'otázka','otázky','otazka','otazky'])];
  }catch(error){console.warn('Nepodarilo sa rozšíriť tematické kľúčové slová',error)}

  function searchableDescription(description){
    return cleanHtml(description).replace(/Podcast vzniká[\s\S]*/i,'').trim();
  }

  function keywordRegex(keyword){
    const value=norm(keyword);
    if(!value)return null;
    const escaped=value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');
    if(value.includes(' '))return new RegExp(`(?:^|\\s)${escaped}(?=\\s|$)`);
    if(value.length<=3)return new RegExp(`(?:^|\\s)${escaped}(?=\\s|$)`);
    return new RegExp(`(?:^|\\s)${escaped}[a-z0-9]*(?=\\s|$)`);
  }

  function containsKeyword(text,keyword){
    const regex=keywordRegex(keyword);
    return regex?regex.test(text):false;
  }

  function correctedMatchLevel(ep,queries){
    if(!queries.length)return 0;
    const title=norm(ep.title),desc=norm(searchableDescription(ep.description));
    if(queries.some(query=>title.includes(query)))return 0;
    if(queries.some(query=>query.split(' ').every(word=>title.includes(word))))return 1;
    if(queries.some(query=>desc.includes(query)))return 2;
    if(queries.some(query=>query.split(' ').every(word=>desc.includes(word))))return 3;
    return 99;
  }

  function strictTopicLevel(ep,queries){
    if(!queries.length)return 0;
    const title=norm(ep.title),desc=norm(searchableDescription(ep.description));
    if(queries.some(query=>containsKeyword(title,query)))return 0;
    if(queries.some(query=>containsKeyword(desc,query)))return 2;
    return 99;
  }

  function correctedCategories(ep){
    const txt=norm(ep.title+' '+searchableDescription(ep.description));
    return Object.entries(TOPICS)
      .filter(([key,words])=>key!=='Vše'&&words.some(word=>containsKeyword(txt,word)))
      .map(([key])=>key);
  }

  function correctedFiltered(){
    const queries=expandedQuery(document.querySelector('#search').value);
    const topics=selectedTopicQueries();
    return episodes
      .map(ep=>{
        const searchMatch=correctedMatchLevel(ep,queries);
        const topicMatch=strictTopicLevel(ep,topics);
        return {...ep,cats:correctedCategories(ep),searchMatch,topicMatch};
      })
      .filter(ep=>(!queries.length||ep.searchMatch<99)&&(!topics.length||ep.topicMatch<99));
  }
  correctedFiltered.__vedatorSearchBoundary=true;

  function installCorrectedFilter(){
    try{
      matchLevel=correctedMatchLevel;
      categories=correctedCategories;
      filtered=correctedFiltered;
      window.matchLevel=correctedMatchLevel;
      window.categories=correctedCategories;
      window.filtered=correctedFiltered;
    }catch(error){console.warn('Nepodarilo sa opraviť tematické filtrovanie',error)}
  }

  installCorrectedFilter();

  // Výkonnostní moduly později nahrazují funkci filtered vlastní verzí.
  // Po jejich načtení proto znovu nasadíme tentýž omezený filtr.
  try{
    const performanceScript=/\/(?:performance-boost|performance-persistent-cache)\.js(?:[?#]|$)/;
    const watched=new WeakSet();
    const watchScript=script=>{
      if(!script||script.tagName!=='SCRIPT'||watched.has(script)||!performanceScript.test(script.src||''))return;
      watched.add(script);
      script.addEventListener('load',()=>queueMicrotask(installCorrectedFilter),{once:true});
    };
    document.querySelectorAll('script[src]').forEach(watchScript);
    const observer=new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes){
        watchScript(node);
        node.querySelectorAll?.('script[src]').forEach(watchScript);
      }
    });
    observer.observe(document.head,{childList:true,subtree:true});
    window.addEventListener('load',()=>setTimeout(installCorrectedFilter,0),{once:true});
  }catch(error){console.warn('Nepodarilo sa zachovať opravené filtrovanie',error)}
})();
