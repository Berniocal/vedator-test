(()=>{
  if(window.__vedatorEpisodeTranslationsLoader)return;
  window.__vedatorEpisodeTranslationsLoader=true;
  window.__vedatorEpisodeTranslationsReady=false;

  const VERSION='20261004-episode-142-webb-summary';
  const SOURCES=[
    ['episode-142-jaderna-summary.js','data-vedator-episode-142-jaderna-summary'],
    ['episode-142-webb-summary.js','data-vedator-episode-142-webb-summary'],
    ['episode-translations-347.js','data-vedator-episode-translations-347'],
    ['episode-347-summary.js','data-vedator-episode-347-summary'],
    ['episode-347-summary-interactive.js','data-vedator-episode-347-summary-interactive'],
    ['episode-345-summary.js','data-vedator-episode-345-summary'],
    ['episode-345-summary-interactive.js','data-vedator-episode-345-summary-interactive'],
    ['episode-344-summary.js','data-vedator-episode-344-summary'],
    ['episode-344-summary-interactive.js','data-vedator-episode-344-summary-interactive'],
    ['episode-343-summary.js','data-vedator-episode-343-summary'],
    ['episode-343-summary-interactive.js','data-vedator-episode-343-summary-interactive'],
    ['episode-342-summary.js','data-vedator-episode-342-summary'],
    ['episode-342-summary-interactive.js','data-vedator-episode-342-summary-interactive'],
    ['episode-341-summary.js','data-vedator-episode-341-summary'],
    ['episode-341-summary-interactive.js','data-vedator-episode-341-summary-interactive'],
    ['episode-339-summary.js','data-vedator-episode-339-summary'],
    ['episode-339-summary-interactive.js','data-vedator-episode-339-summary-interactive'],
    ['episode-338-summary.js','data-vedator-episode-338-summary'],
    ['episode-338-summary-interactive.js','data-vedator-episode-338-summary-interactive'],
    ['episode-335-summary-data-cs.js','data-vedator-episode-335-summary-data-cs'],
    ['episode-335-summary-data-sk.js','data-vedator-episode-335-summary-data-sk'],
    ['episode-335-summary.js','data-vedator-episode-335-summary'],
    ['episode-335-summary-interactive.js','data-vedator-episode-335-summary-interactive'],
    ['episode-334-summary-data-cs.js','data-vedator-episode-334-summary-data-cs'],
    ['episode-334-summary-data-sk.js','data-vedator-episode-334-summary-data-sk'],
    ['episode-334-summary.js','data-vedator-episode-334-summary'],
    ['episode-334-summary-interactive.js','data-vedator-episode-334-summary-interactive'],
    ['episode-translations-346-337.js','data-vedator-episode-translations-346-337'],
    ['episode-translations-336-330.js','data-vedator-episode-translations-336-330'],
    ['episode-translations-329-323.js','data-vedator-episode-translations-329-323'],
    ['episode-translations-322-316.js','data-vedator-episode-translations-322-316'],
    ['episode-translations-315-308.js','data-vedator-episode-translations-315-308'],
    ['episode-translations-307-300.js','data-vedator-episode-translations-307-300'],
    ['episode-translations-299-292.js','data-vedator-episode-translations-299-292'],
    ['episode-translations-291-284.js','data-vedator-episode-translations-291-284'],
    ['episode-translations-283-276.js','data-vedator-episode-translations-283-276'],
    ['episode-translations-275-268.js','data-vedator-episode-translations-275-268'],
    ['episode-translations-267-260.js','data-vedator-episode-translations-267-260'],
    ['episode-translations-259-252.js','data-vedator-episode-translations-259-252'],
    ['episode-translations-251-244.js','data-vedator-episode-translations-251-244'],
    ['episode-translations-243-236.js','data-vedator-episode-translations-243-236'],
    ['episode-translations-235-228.js','data-vedator-episode-translations-235-228'],
    ['episode-translations-227-220.js','data-vedator-episode-translations-227-220'],
    ['episode-translations-219-212.js','data-vedator-episode-translations-219-212'],
    ['episode-translations-211-204.js','data-vedator-episode-translations-211-204'],
    ['episode-translations-203-196.js','data-vedator-episode-translations-203-196'],
    ['episode-translations-195-188.js','data-vedator-episode-translations-195-188'],
    ['episode-translations-187-180.js','data-vedator-episode-translations-187-180'],
    ['episode-translations-179-172.js','data-vedator-episode-translations-179-172'],
    ['episode-translations-171-164.js','data-vedator-episode-translations-171-164'],
    ['episode-translations-163-156.js','data-vedator-episode-translations-163-156'],
    ['episode-translations-155-148.js','data-vedator-episode-translations-155-148'],
    ['episode-translations-147-140.js','data-vedator-episode-translations-147-140'],
    ['episode-translations-139-132.js','data-vedator-episode-translations-139-132'],
    ['episode-translations-131-124.js','data-vedator-episode-translations-131-124'],
    ['episode-translations-123-116.js','data-vedator-episode-translations-123-116'],
    ['episode-translations-115-108.js','data-vedator-episode-translations-115-108'],
    ['episode-translations-107-100.js','data-vedator-episode-translations-107-100'],
    ['episode-translations-99-92.js','data-vedator-episode-translations-99-92'],
    ['episode-translations-91-84.js','data-vedator-episode-translations-91-84'],
    ['episode-translations-83-76.js','data-vedator-episode-translations-83-76'],
    ['episode-translations-75-68.js','data-vedator-episode-translations-75-68'],
    ['episode-translations-67-60.js','data-vedator-episode-translations-67-60'],
    ['episode-translations-59-52.js','data-vedator-episode-translations-59-52'],
    ['episode-translations-51-44.js','data-vedator-episode-translations-51-44'],
    ['episode-translations-43-36.js','data-vedator-episode-translations-43-36'],
    ['episode-translations-35-28.js','data-vedator-episode-translations-35-28'],
    ['episode-translations-27-20.js','data-vedator-episode-translations-27-20'],
    ['episode-translations-19-12.js','data-vedator-episode-translations-19-12'],
    ['episode-translations-11-4.js','data-vedator-episode-translations-11-4'],
    ['episode-translations-3-1.js','data-vedator-episode-translations-3-1'],
    ['episode-translations-space-talks-1-7.js','data-vedator-episode-translations-space-talks-1-7'],
    ['episode-translations-space-talks-8-15.js','data-vedator-episode-translations-space-talks-8-15']
  ];

  function loadScript(source,marker){
    return new Promise(resolve=>{
      const existing=document.querySelector(`script[${marker}]`);
      if(existing){if(existing.dataset.vedatorLoaded==='1')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',resolve,{once:true});return}
      const script=document.createElement('script');script.src=`./${source}?v=${VERSION}`;script.async=false;script.setAttribute(marker,'1');script.addEventListener('load',()=>{script.dataset.vedatorLoaded='1';resolve()},{once:true});script.addEventListener('error',resolve,{once:true});document.head.appendChild(script)
    })
  }

  (async()=>{
    for(const [source,marker] of SOURCES)await loadScript(source,marker);
    window.__vedatorEpisodeTranslationsReady=true;
    window.dispatchEvent(new Event('vedatorepisodetranslationsready'));
  })();
})();
