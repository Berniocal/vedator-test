import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_REAL_EPISODE_READMORE_V1 */';
if(source.includes(marker)){
  console.log('Real episode read-more already present');
  process.exit(0);
}
const at=source.lastIndexOf('\n})();');
if(at<0)throw new Error('Could not find end of app-v2 IIFE');

const layer=String.raw`

  ${marker}
  function realReadMoreSanitizeHtml(value){
    const template=document.createElement('template');
    template.innerHTML=String(value||'');
    const allowed=new Set(['P','BR','A','UL','OL','LI','STRONG','B','EM','I','BLOCKQUOTE','H2','H3','H4']);
    [...template.content.querySelectorAll('*')].forEach(node=>{
      if(!allowed.has(node.tagName)){
        node.replaceWith(...node.childNodes);
        return;
      }
      [...node.attributes].forEach(attr=>node.removeAttribute(attr.name));
      if(node.tagName==='A'){
        const raw=String(value||'');
        const text=String(node.textContent||'').trim();
        const escaped=text.replace(/[.*+?^\${}()|[\]\\]/g,'\\$&');
        const match=raw.match(new RegExp('<a[^>]+href=["\\\']([^"\\\']+)["\\\'][^>]*>\\s*'+escaped.replace(/\s+/g,'\\s*'),'i'));
        const href=match?.[1]||text;
        if(/^https?:\/\//i.test(href)){
          node.setAttribute('href',href);
          node.setAttribute('target','_blank');
          node.setAttribute('rel','noopener noreferrer');
        }else node.replaceWith(...node.childNodes);
      }
    });
    return template.innerHTML;
  }
  function realReadMoreRichHtml(episode){
    const lang=contentLang(),bundle=episode?.i18n?.[lang];
    return realReadMoreSanitizeHtml(bundle?.fullDescriptionHtml||episode?.fullDescriptionHtml||'');
  }
  cardEpisode=function(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number),terms=mobileEpisodeHighlightTerms(),open=cardPolishEpisodeOpen.has(Number(episode.number));
    const short=lastUxShortDescription(episode,terms),full=lastUxFullDescription(episode),rich=open?realReadMoreRichHtml(episode):'';
    const shownHtml=open?(rich||(mobileHighlightHtml(full||short,terms).replace(/\n/g,'<br>'))):mobileHighlightHtml(short,terms);
    return '<article class="card searchable episode-card-v2 '+(open?'episode-open-v2':'')+'" data-episode="'+(Number(episode.number)||0)+'" data-search="'+esc(allEpisodeSearch(episode))+'">'+
      '<div class="meta">'+text('Díl','Diel')+' '+(episode.number||'–')+' • '+esc(fmtDate(episode.date))+'</div><h2>'+mobileHighlightHtml(copy.title,terms)+'</h2>'+              
      '<div class="listen-status '+(status?.kind||'')+'">'+(status?esc(status.label):'')+'</div>'+episodeProgressHtml(episode.number)+
      '<div class="desc-v2 episode-description-v2">'+shownHtml+'</div>'+episodeTagHtml(episode)+
      '<div class="episode-summary-slot-v2">'+episodeSummaryHtml(episode)+'</div>'+ 
      '<div class="actions"><button type="button" class="play" data-episode="'+(Number(episode.number)||0)+'" data-seconds="">'+esc(playLabel(episode.number))+'</button>'+ 
      '<button type="button" class="secondary episode-more-v2" data-episode="'+(Number(episode.number)||0)+'" aria-expanded="'+String(open)+'">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>'+shareButton('episode',String(episode.number))+'</div></article>';
  };

  (function installRealReadMoreStyles(){
    if(document.querySelector('style[data-v2-real-readmore]'))return;
    const style=document.createElement('style');style.dataset.v2RealReadmore='1';
    style.textContent='.episode-card-v2.episode-open-v2 .desc-v2{display:block!important;-webkit-line-clamp:unset!important;-webkit-box-orient:initial!important;overflow:visible!important;max-height:none!important}.episode-card-v2.episode-open-v2 .episode-description-v2 p{margin:.8em 0}.episode-card-v2.episode-open-v2 .episode-description-v2 p:first-child{margin-top:0}.episode-card-v2.episode-open-v2 .episode-description-v2 a{color:var(--accent);text-decoration:underline;overflow-wrap:anywhere}.episode-card-v2.episode-open-v2 .episode-description-v2 ul,.episode-card-v2.episode-open-v2 .episode-description-v2 ol{padding-left:1.35em}';
    document.head.appendChild(style);
  })();
`;
source=source.slice(0,at)+layer+source.slice(at);
fs.writeFileSync(file,source);
console.log('Applied real episode read-more');
