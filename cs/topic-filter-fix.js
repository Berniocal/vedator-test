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
  }catch(error){console.warn('Neúspěch rozšíření tematických klíčových slov',error)}

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

  function strictTopicLevel(ep,queries){
    if(!queries.length)return 0;
    const title=norm(ep.title),desc=norm(cleanHtml(ep.description));
    if(queries.some(query=>containsKeyword(title,query)))return 0;
    if(queries.some(query=>containsKeyword(desc,query)))return 2;
    return 99;
  }

  try{
    categories=function(ep){
      const txt=norm(ep.title+' '+cleanHtml(ep.description));
      return Object.entries(TOPICS)
        .filter(([key,words])=>key!=='Vše'&&words.some(word=>containsKeyword(txt,word)))
        .map(([key])=>key);
    };

    filtered=function(){
      const queries=expandedQuery(document.querySelector('#search').value);
      const topics=selectedTopicQueries();
      return episodes
        .map(ep=>{
          const searchMatch=matchLevel(ep,queries);
          const topicMatch=strictTopicLevel(ep,topics);
          return {...ep,cats:categories(ep),searchMatch,topicMatch};
        })
        .filter(ep=>(!queries.length||ep.searchMatch<99)&&(!topics.length||ep.topicMatch<99));
    };
  }catch(error){console.warn('Nepodarilo sa opraviť tematické filtrovanie',error)}
})();