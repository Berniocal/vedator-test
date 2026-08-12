import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_LAST_UX_FIXES_V1 */';
if(source.includes(marker)){
  console.log('V2 last UX fixes already present');
  process.exit(0);
}
const at=source.lastIndexOf('\n})();');
if(at<0)throw new Error('Could not find end of app-v2 IIFE');

const layer=String.raw`

  ${marker}
  function lastUxFullDescription(episode){
    const lang=contentLang(),bundle=episode?.i18n?.[lang];
    return String(bundle?.fullDescription||episode?.fullDescription||episodeCopy(episode).description||'').trim();
  }
  function lastUxShortDescription(episode,terms){
    const copy=episodeCopy(episode),shortBase=cardPolishCutDescription(copy.description);
    return cardPolishCollapsedDescription(shortBase,terms);
  }
  cardEpisode=function(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number),terms=mobileEpisodeHighlightTerms(),open=cardPolishEpisodeOpen.has(Number(episode.number));
    const short=lastUxShortDescription(episode,terms),full=lastUxFullDescription(episode),shown=open?(full||short):short;
    const shownHtml=mobileHighlightHtml(shown,terms).replace(/\n/g,'<br>');
    return '<article class="card searchable episode-card-v2 '+(open?'episode-open-v2':'')+'" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+mobileHighlightHtml(copy.title,terms)+'</h2>'+              
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<p class="desc-v2">'+shownHtml+'</p>'+episodeTagHtml(episode)+
      '<div class="episode-summary-slot-v2">'+episodeSummaryHtml(episode)+'</div>'+ 
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+ 
      '<button type="button" class="secondary episode-more-v2" data-episode="'+(Number(episode.number)||0)+'" aria-expanded="'+String(open)+'">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>'+shareButton('episode',String(episode.number))+'</div></article>';
  };

  function lastUxSyncFloatingButtons(){
    const expand=$('#player-expand-v2'),back=$('#back-top-v2');
    if(expand){expand.textContent='♫ ↑';expand.title=text('Rozbalit přehrávač','Rozbaliť prehrávač');expand.setAttribute('aria-label',expand.title)}
    if(back){back.textContent='↑';back.title=text('Nahoru','Nahor');back.setAttribute('aria-label',back.title)}
  }
  const lastUxSyncPlayer=syncPlayer;
  syncPlayer=function(...args){const result=lastUxSyncPlayer(...args);lastUxSyncFloatingButtons();return result};
  window.addEventListener('vedatorlanguagechange',lastUxSyncFloatingButtons);

  function installLastUxStyles(){
    if(document.querySelector('style[data-v2-last-ux-fixes]'))return;
    const style=document.createElement('style');style.dataset.v2LastUxFixes='1';
    style.textContent=[
      '.series>summary>strong{display:block!important;flex:1 1 auto!important;min-width:0!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;-webkit-line-clamp:unset!important;-webkit-box-orient:initial!important;max-height:none!important}',
      '#player-expand-v2{width:auto!important;min-width:62px!important;padding:0 12px!important;border-radius:999px!important;font-size:1.08rem!important;letter-spacing:.03em!important}',
      '@media(max-width:700px){.card h2{font-size:1.08rem!important}.meta{font-size:.85rem!important}.series>summary>strong{font-size:1.1rem!important;line-height:1.3!important}.card p,.card li{font-size:1.01rem!important}}'
    ].join('');
    document.head.appendChild(style);
  }
  installLastUxStyles();
  lastUxSyncFloatingButtons();
`;
source=source.slice(0,at)+layer+source.slice(at);
fs.writeFileSync(file,source);
console.log('Applied V2 last UX fixes');
