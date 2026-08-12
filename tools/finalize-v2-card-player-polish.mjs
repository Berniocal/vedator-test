import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_CARD_PLAYER_POLISH_V1 */';
if(source.includes(marker)){
  console.log('V2 card/player polish already present');
  process.exit(0);
}
const at=source.lastIndexOf('\n})();');
if(at<0)throw new Error('Could not find end of app-v2 IIFE');

const layer=String.raw`

  ${marker}
  const cardPolishEpisodeOpen=new Set();
  function cardPolishCutDescription(value){
    const raw=String(value||'');
    const cut=raw.search(/Podcast vzniká\s+(?:v|ve)\s+spolupráci\s+(?:so|se)\s+SME\.?/i);
    return (cut>=0?raw.slice(0,cut):raw).trim();
  }
  playLabel=function(number){
    const record=state.progress[episodeKey(number)];
    if(record&&!record.completed&&Number(record.currentTime)>10)return text('Pokračovat','Pokračovať');
    return text('Přehrát','Prehrať');
  };
  seriesResumeLabel=function(info){return info.started&&!info.finished?text('Pokračovat','Pokračovať'):text('Přehrát','Prehrať')};
  playlistResumeLabel=function(info){return info.started&&!info.finished?text('Pokračovat','Pokračovať'):text('Přehrát','Prehrať')};
  allEpisodeSearch=function(episode){
    const cs=episode?.i18n?.cs||{},skCopy=episode?.i18n?.sk||{};
    return norm(String(episode?.number||'')+' '+String(episode?.title||'')+' '+cardPolishCutDescription(episode?.description)+' '+String(cs.title||'')+' '+cardPolishCutDescription(cs.description)+' '+String(skCopy.title||'')+' '+cardPolishCutDescription(skCopy.description));
  };
  cardEpisode=function(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number),terms=mobileEpisodeHighlightTerms(),full=cardPolishCutDescription(copy.description),open=cardPolishEpisodeOpen.has(Number(episode.number)),short=mobileEpisodeExcerpt(full,terms),shown=open?full:short,canExpand=full.length>short.replace(/^…|…$/g,'').length+4;
    return '<article class="card searchable episode-card-v2 '+(open?'episode-open-v2':'')+'" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+mobileHighlightHtml(copy.title,terms)+'</h2>'+              
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<p class="desc-v2">'+mobileHighlightHtml(shown,terms)+'</p>'+episodeTagHtml(episode)+
      '<div class="episode-summary-slot-v2">'+episodeSummaryHtml(episode)+'</div>'+ 
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+ 
      (canExpand?'<button type="button" class="secondary episode-more-v2" data-episode="'+(Number(episode.number)||0)+'">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>':'')+shareButton('episode',String(episode.number))+'</div></article>';
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.episode-more-v2');if(!button)return;
    event.preventDefault();event.stopPropagation();
    const number=Number(button.dataset.episode)||0;
    if(cardPolishEpisodeOpen.has(number))cardPolishEpisodeOpen.delete(number);else cardPolishEpisodeOpen.add(number);
    refreshEpisodeCard(number);
  });
  const cardPolishOriginalSyncPlayer=syncPlayer;
  syncPlayer=function(...args){
    const result=cardPolishOriginalSyncPlayer(...args),audio=$('#audio-v2'),button=$('#player-play-v2');
    if(audio&&button)button.textContent=audio.paused?'▶':'Ⅱ';
    return result;
  };
  function installCardPlayerPolishStyles(){
    if(document.querySelector('style[data-v2-card-player-polish]'))return;
    const style=document.createElement('style');style.dataset.v2CardPlayerPolish='1';style.textContent=`
      .player-shell{background:color-mix(in srgb,var(--card) 88%,var(--accent) 12%)!important}
      .episode-summary-slot-v2{margin-top:.65rem}
      .episode-summary-slot-v2:empty{display:none}
      .episode-summary-slot-v2 .episode-summary-v2{margin:.35rem 0 .75rem!important}
      .episode-card-v2 .actions{margin-top:.15rem}
      #player-play-v2{letter-spacing:0!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif!important}
      @media(max-width:700px){#series-v2:not(.hidden){grid-template-columns:minmax(0,1fr)!important;gap:10px!important}#series-v2 .series,#series-v2 .series[open]{grid-column:auto!important}#series-v2 .series>summary{padding:14px 0!important;display:flex!important;gap:10px!important}#series-v2 .series>summary strong{font-size:.92rem!important;line-height:1.25!important}#series-v2 .series-progress-summary-v2{font-size:.76rem!important;white-space:nowrap!important}#series-v2 .series>summary .deep-share{width:auto!important;min-width:38px!important;height:auto!important;min-height:38px!important}}
    `;document.head.appendChild(style);
  }
  installCardPlayerPolishStyles();
`;

source=source.slice(0,at)+layer+source.slice(at);
fs.writeFileSync(file,source);
console.log('Applied V2 card/player polish');
