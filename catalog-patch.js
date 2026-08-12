(()=>{
  if(window.__vedatorCatalogPatch)return;
  window.__vedatorCatalogPatch=true;

  function loadCollectionProgress(){
    if(window.__vedatorCollectionProgressBootstrap)return;
    window.__vedatorCollectionProgressBootstrap=true;
    if(document.querySelector('script[data-vedator-collection-progress-bootstrap]'))return;
    const script=document.createElement('script');
    script.src='./collection-progress.js?v=20260802-2251';
    script.async=false;
    script.dataset.vedatorCollectionProgressBootstrap='1';
    document.head.appendChild(script);
  }
  loadCollectionProgress();

  const MATHEMATICS_EPISODES=[91,93,98,113,115,116,117,118,156,181,198,201,216,249,282,286,328,329,336];
  const MATHEMATICS_SET=new Set(MATHEMATICS_EPISODES);
  const FAQ_EXTRA_EPISODES=new Set([138,300]);
  const SERIES_TITLE_REWRITES=[
    [/Hledání mimozemského života/gi,'Hľadanie mimozemského života'],
    [/Rozhovory o vesmíru/gi,'Rozhovory o vesmíre'],
    [/(?:Žiji|Žiju) vědu/gi,'Žijem vedu'],
    [/Genetický speciál/gi,'Genetický špeciál'],
    [/Vedátorský speciál/gi,'Vedátorský špeciál'],
    [/Nobelovy ceny/gi,'Nobelove ceny']
  ];

  const style=document.createElement('style');
  style.textContent=`
    .series-card>summary{justify-content:flex-start!important}
    .series-count{margin-left:auto!important;text-align:right;min-width:4.6rem}
  `;
  document.head.appendChild(style);

  function loadEpisodeTranslations(){
    if(window.__vedatorEpisodeTranslationBootstrap)return;
    window.__vedatorEpisodeTranslationBootstrap=true;
    if(document.querySelector('script[data-vedator-episode-translation-bootstrap]'))return;
    const script=document.createElement('script');
    script.src='./episode-translations-loader.js?v=20260802-2236';
    script.async=false;
    script.dataset.vedatorEpisodeTranslationBootstrap='1';
    document.head.appendChild(script);
  }
  loadEpisodeTranslations();

  function loadDeepLinks(){
    if(window.__vedatorDeepLinksBootstrap)return;
    window.__vedatorDeepLinksBootstrap=true;
    if(document.querySelector('script[data-vedator-deep-links-bootstrap]'))return;
    const script=document.createElement('script');
    script.src='./deep-links.js?v=20260802-1603';
    script.async=false;
    script.dataset.vedatorDeepLinksBootstrap='1';
    document.head.appendChild(script);
  }
  loadDeepLinks();

  function ensureSearchHighlighting(){
    const version='20260802-1940';
    const ensure=(source,flag,marker)=>{
      if(window[flag]||document.querySelector(`script[${marker}]`))return;
      const script=document.createElement('script');
      script.src=`./${source}?v=${version}`;
      script.async=false;
      script.setAttribute(marker,'1');
      document.head.appendChild(script);
    };
    const check=()=>{
      ensure('highlight-patch.js','__vedatorHighlightPatch','data-vedator-highlight-bootstrap');
      ensure('question-highlight-translated.js','__vedatorTranslatedQuestionHighlight','data-vedator-question-highlight-bootstrap');
    };
    setTimeout(check,600);
    window.addEventListener('vedatorcontentchange',check);
    window.addEventListener('vedatorepisodetranslationsready',check);
  }
  ensureSearchHighlighting();

  if(typeof FIXED_SERIES==='undefined'||typeof filtered!=='function'||typeof categories!=='function')return;

  const faqSeries=FIXED_SERIES.find(series=>series.name==='FAQ – dobré otázky');
  if(faqSeries){
    const originalFaqTest=faqSeries.test;
    faqSeries.test=episode=>originalFaqTest(episode)||FAQ_EXTRA_EPISODES.has(Number(episode.number));
  }

  if(!FIXED_SERIES.some(series=>series.name==='Matematika')){
    FIXED_SERIES.push({
      name:'Matematika',
      test:episode=>MATHEMATICS_SET.has(Number(episode.number))
    });
  }

  function slovakSeriesTitle(value){
    let title=String(value||'');
    for(const [pattern,replacement] of SERIES_TITLE_REWRITES)title=title.replace(pattern,replacement);
    return title;
  }

  for(const series of FIXED_SERIES){
    if(series.__vedatorBilingualSeriesTest||typeof series.test!=='function')continue;
    const originalTest=series.test;
    series.test=episode=>{
      try{if(originalTest(episode))return true}catch(_){}
      const title=String(episode?.title||'');
      const slovakTitle=slovakSeriesTitle(title);
      if(slovakTitle===title)return false;
      try{return originalTest({...episode,title:slovakTitle})}catch(_){return false}
    };
    series.__vedatorBilingualSeriesTest=true;
  }

  const originalCategories=categories;
  categories=function(episode){
    const result=originalCategories(episode);
    if(MATHEMATICS_SET.has(Number(episode.number))&&!result.includes('Matematika'))result.push('Matematika');
    return result;
  };

  const originalFiltered=filtered;
  filtered=function(){
    if(active!=='Matematika')return originalFiltered();

    const queries=expandedQuery(document.querySelector('#search').value);
    return episodes
      .filter(episode=>MATHEMATICS_SET.has(Number(episode.number)))
      .map(episode=>{
        const searchMatch=matchLevel(episode,queries);
        return {...episode,cats:categories(episode),searchMatch,topicMatch:0};
      })
      .filter(episode=>!queries.length||episode.searchMatch<99);
  };

  const absoluteUrl=value=>{
    try{return new URL(value,location.href).href}catch(error){return String(value||'')}
  };

  function findSeriesEpisode(link){
    if(!Array.isArray(episodes))return null;
    const href=absoluteUrl(link.getAttribute('href'));
    const title=(link.querySelector('.episode-title')?.textContent||link.textContent||'').trim();
    return episodes.find(episode=>
      absoluteUrl(episode.link)===href||
      absoluteUrl(episode.enclosure)===href||
      episode.title===title
    )||null;
  }

  function prepareSeriesLinks(){
    document.querySelectorAll('#series .series-body a').forEach(link=>{
      const episode=findSeriesEpisode(link);
      if(!episode?.enclosure)return;
      link.dataset.vedatorAudioUrl=episode.enclosure;
      link.dataset.vedatorEpisodeTitle=episode.title;
      link.href=episode.enclosure;
      link.removeAttribute('target');
      link.removeAttribute('rel');
    });
  }

  function seriesPlaybackContext(link){
    const card=link.closest('.series-card');
    const links=[...(card?.querySelectorAll('.series-body a')||[])];
    return {
      label:card?.querySelector('summary span')?.textContent?.trim()||'Série',
      titles:links
        .map(item=>item.dataset.vedatorEpisodeTitle||item.querySelector('.episode-title')?.textContent||item.textContent)
        .map(title=>String(title||'').trim())
        .filter(Boolean)
    };
  }

  function openSeriesEpisodeInPlayer(link){
    const url=link.dataset.vedatorAudioUrl;
    const title=link.dataset.vedatorEpisodeTitle;
    if(!url||!title)return false;

    window.__vedatorPlaybackContext=seriesPlaybackContext(link);

    const proxy=document.createElement('article');
    proxy.hidden=true;
    const heading=document.createElement('h2');
    heading.textContent=title;
    const links=document.createElement('div');
    links.className='links';
    const play=document.createElement('a');
    play.className='primary';
    play.href=url;
    play.dataset.vedatorEpisodeTitle=title;
    play.textContent='Přehrát';
    links.appendChild(play);
    proxy.append(heading,links);
    document.body.appendChild(proxy);
    play.click();
    proxy.remove();
    return true;
  }

  document.addEventListener('click',event=>{
    const link=event.target.closest('#series .series-body a[data-vedator-audio-url]');
    if(!link)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openSeriesEpisodeInPlayer(link);
  },true);

  const seriesBox=document.querySelector('#series');
  if(seriesBox)new MutationObserver(prepareSeriesLinks).observe(seriesBox,{childList:true,subtree:true});
  prepareSeriesLinks();

  if(Array.isArray(episodes)&&episodes.length&&typeof render==='function')render();
})();