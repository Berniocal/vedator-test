import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_EPISODE_EXPERIENCE_V1 */';
if(source.includes(marker)){
  console.log('V2 episode experience already present.');
  process.exit(0);
}

function replaceSection(startToken,endToken,replacement){
  const start=source.indexOf(startToken);
  if(start<0)throw new Error(`Missing start token: ${startToken}`);
  const end=source.indexOf(endToken,start);
  if(end<0)throw new Error(`Missing end token: ${endToken}`);
  source=source.slice(0,start)+replacement+source.slice(end);
}

const helpers=`
  ${marker}
  function episodeSummaryItems(number){
    const questions=(state.data?.questions||[]).filter(item=>Number(item.episode)===Number(number)).map(item=>{
      const copy=questionCopy(item);
      return {type:'question',episode:Number(number),order:Number(item.order)||0,time:item.sourceTime||item.time||'',seconds:Number(item.seconds)||0,title:copy.title,points:copy.points,ref:qRef(item)};
    });
    if(questions.length)return questions;
    return flattenNonQuestions(state.data).filter(item=>Number(item.episode)===Number(number)).map(item=>({type:'nonquestion',episode:Number(number),order:Number(item.order)||0,time:item.sourceTime||item.time||'',seconds:Number(item.seconds)||0,title:item.title,points:item.points||[],ref:''}));
  }
  function episodeProgress(number){
    const record=state.progress[episodeKey(number)]||{},duration=Number(record.duration)||0,current=Number(record.currentTime)||0;
    const percent=record.completed?100:(duration>0?Math.max(0,Math.min(100,Math.round(current/duration*100))):0);
    return {record,duration,current,percent,active:Boolean(record.completed)||current>10};
  }
  function episodeProgressHtml(number){
    const info=episodeProgress(number);if(!info.active)return'';
    const timeLabel=info.duration>0?fmtTime(info.current)+' / '+fmtTime(info.duration):fmtTime(info.current);
    return '<div class="episode-progress-v2"><progress max="100" value="'+info.percent+'"></progress><span>'+esc(timeLabel)+'</span></div>';
  }
  function episodeSummaryHtml(episode){
    const items=episodeSummaryItems(episode.number);if(!items.length)return'';
    const label=items.length===1?text('1 kapitola','1 kapitola'):items.length+' '+text('kapitol','kapitol');
    return '<details class="episode-summary-v2"><summary><span>'+esc(text('Shrnutí dílu','Zhrnutie dielu'))+'</span><small>'+esc(label)+'</small></summary><div class="episode-summary-body-v2">'+items.map(item=>'<section class="episode-chapter-v2"><div class="episode-chapter-head-v2"><button type="button" class="play episode-chapter-play-v2" data-episode="'+item.episode+'" data-seconds="'+item.seconds+'" data-ref="'+esc(item.ref)+'">▶ '+esc(item.time||fmtTime(item.seconds))+'</button><strong>'+esc(item.title)+'</strong></div>'+(item.points?.length?'<ul>'+item.points.map(point=>'<li>'+esc(point)+'</li>').join('')+'</ul>':'')+'</section>').join('')+'</div></details>';
  }
  function seriesProgressInfo(series){
    const episodes=(series?.episodes||[]).map(number=>episodeByNumber(number)).filter(Boolean),total=episodes.length;
    const records=episodes.map(episode=>({episode,record:state.progress[episodeKey(episode.number)]||{}}));
    const completed=records.filter(item=>item.record.completed).length;
    let resumeIndex=-1;
    const collection=state.collectionProgress['series:'+norm(series?.name||'')];
    if(collection?.lastItemId){
      const last=records.findIndex(item=>'episode:'+item.episode.number===collection.lastItemId);
      if(last>=0){
        if(!records[last].record.completed)resumeIndex=last;
        else if(last+1<records.length)resumeIndex=last+1;
      }
    }
    if(resumeIndex<0)resumeIndex=records.findIndex(item=>!item.record.completed&&Number(item.record.currentTime)>10);
    if(resumeIndex<0)resumeIndex=records.findIndex(item=>!item.record.completed);
    if(resumeIndex<0)resumeIndex=0;
    const percent=total?Math.round(completed/total*100):0;
    const started=records.some(item=>item.record.completed||Number(item.record.currentTime)>10);
    const finished=total>0&&completed===total;
    return {episodes,records,total,completed,percent,resumeIndex,started,finished};
  }
  function seriesResumeLabel(info){
    if(info.finished)return text('Přehrát znovu','Prehrať znova');
    if(info.started)return text('Pokračovat v sérii','Pokračovať v sérii');
    return text('Začít sérii','Začať sériu');
  }
  function seriesProgressLabel(info){return info.completed+' / '+info.total+' '+text('poslechnuto','vypočuté')}
  function refreshSeriesProgress(){
    $$('#series-v2 .series[data-series-index]').forEach(card=>{
      const index=Number(card.dataset.seriesIndex),series=state.data?.series?.[index];if(!series)return;
      const info=seriesProgressInfo(series),label=card.querySelector('.series-progress-label-v2'),progress=card.querySelector('.series-progress-bar-v2'),resume=card.querySelector('.series-resume-v2');
      if(label)label.textContent=seriesProgressLabel(info);if(progress)progress.value=info.percent;
      if(resume){resume.textContent=seriesResumeLabel(info);resume.dataset.itemIndex=String(info.resumeIndex)}
      card.querySelectorAll('.series-item-status-v2[data-episode]').forEach(node=>{const status=episodeStatus(Number(node.dataset.episode));node.textContent=status?.kind==='done'?'✓':status?.kind==='progress'?'▶':'';node.title=status?.label||''});
    });
  }
  function installEpisodeExperienceStyles(){
    if(document.querySelector('style[data-v2-episode-experience]'))return;
    const style=document.createElement('style');style.dataset.v2EpisodeExperience='1';style.textContent='.episode-progress-v2{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;margin:.15rem 0 .65rem;color:var(--muted);font-size:.78rem}.episode-progress-v2 progress,.series-progress-bar-v2{width:100%;height:7px;accent-color:var(--accent)}.episode-summary-v2{margin:.55rem 0 .8rem;border:1px solid var(--line);border-radius:12px;background:#fafaff}.episode-summary-v2>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;cursor:pointer;font-weight:800;list-style:none;color:#392b9b}.episode-summary-v2>summary::-webkit-details-marker{display:none}.episode-summary-v2>summary small{font-weight:600;color:var(--muted)}.episode-summary-body-v2{padding:0 10px 8px}.episode-chapter-v2{padding:9px 0;border-top:1px solid var(--line)}.episode-chapter-head-v2{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:start}.episode-chapter-play-v2{border:0!important;background:var(--accent2)!important;color:#392b9b!important;padding:5px 7px!important;min-width:68px!important;flex:0 0 auto!important}.episode-chapter-v2 ul{margin:.45rem 0 0;padding-left:1.2rem}.episode-chapter-v2 li{margin:.2rem 0;line-height:1.4}.series-progress-summary-v2{display:flex;gap:8px;align-items:center;color:var(--muted);font-size:.78rem;white-space:nowrap}.series-progress-box-v2{padding:0 0 12px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.series-progress-main-v2{display:grid;gap:4px}.series-resume-v2{border:0;border-radius:10px;background:var(--accent);color:white;padding:8px 11px;font-weight:800;cursor:pointer}.series-item{display:flex!important;gap:7px;align-items:flex-start}.series-item-status-v2{width:1.1rem;flex:0 0 1.1rem;color:var(--ok);font-weight:900}@media(max-width:700px){.episode-chapter-head-v2{grid-template-columns:1fr}.episode-chapter-play-v2{justify-self:start}.series-progress-box-v2{grid-template-columns:1fr}.series-resume-v2{width:100%}}';document.head.append(style);
  }

`;
source=source.replace('\n  function cardEpisode(episode){',helpers+'  function cardEpisode(episode){');

replaceSection('  function cardEpisode(episode){','\n\n  function cardQuestion',`  function cardEpisode(episode){
    const copy=episodeCopy(episode),status=episodeStatus(episode.number);
    return \`<article class="card searchable" data-episode="\${Number(episode.number)||0}" data-search="\${esc(allEpisodeSearch(episode))}">
      <div class="meta">\${text('Díl','Diel')} \${episode.number||'–'} • \${esc(fmtDate(episode.date))}</div>
      <h2>\${esc(copy.title)}</h2>
      <div class="listen-status \${status?.kind||''}">\${status?esc(status.label):''}</div>
      \${episodeProgressHtml(episode.number)}
      <p>\${esc(copy.description)}</p>
      \${episodeSummaryHtml(episode)}
      <div class="actions"><button type="button" class="play" data-episode="\${Number(episode.number)||0}" data-seconds="">\${esc(playLabel(episode.number))}</button>\${episode.link?\`<a class="secondary" href="\${esc(episode.link)}">\${text('Detail','Detail')}</a>\`:''}</div>
    </article>\`;
  }`);

replaceSection('  function renderSeries(){','\n  function renderQuestions()',`  function renderSeries(){
    const byNumber=new Map(state.data.episodes.map(e=>[Number(e.number),e]));
    $('#series-v2').innerHTML=state.data.series.map((series,seriesIndex)=>{
      const eps=series.episodes.map(n=>byNumber.get(Number(n))).filter(Boolean),label=seriesLabel(series),info=seriesProgressInfo(series);
      const search=norm(\`\${series.i18n?.cs||series.name} \${series.i18n?.sk||''} \${eps.map(e=>allEpisodeSearch(e)).join(' ')}\`);
      return \`<details class="series searchable" data-series-index="\${seriesIndex}" data-search="\${esc(search)}"><summary><strong>\${esc(label)}</strong><span class="series-progress-summary-v2"><span>\${eps.length} \${text('dílů','dielov')}</span><span class="series-progress-label-v2">\${esc(seriesProgressLabel(info))}</span></span></summary><div class="series-progress-box-v2"><div class="series-progress-main-v2"><progress class="series-progress-bar-v2" max="100" value="\${info.percent}"></progress><small>\${esc(info.finished?text('Série je dokončená.','Séria je dokončená.'):text('Průběh se ukládá automaticky.','Priebeh sa ukladá automaticky.'))}</small></div><button type="button" class="series-resume-v2" data-series-index="\${seriesIndex}" data-item-index="\${info.resumeIndex}">\${esc(seriesResumeLabel(info))}</button></div><ol>\${eps.map((e,index)=>{const status=episodeStatus(e.number);return \`<li><button type="button" class="series-item" data-series-index="\${seriesIndex}" data-item-index="\${index}"><span class="series-item-status-v2" data-episode="\${e.number}" title="\${esc(status?.label||'')}">\${status?.kind==='done'?'✓':status?.kind==='progress'?'▶':''}</span><span>\${text('Díl','Diel')} \${e.number}: \${esc(episodeCopy(e).title)}</span></button></li>\`}).join('')}</ol></details>\`;
    }).join('');
  }`);

source=source.replace("writeJson(PROGRESS_KEY,state.progress);saveCollectionProgress(time,duration,completed);refreshEpisodeCard(current.episode.number);","writeJson(PROGRESS_KEY,state.progress);saveCollectionProgress(time,duration,completed);refreshEpisodeCard(current.episode.number);if(force||completed!==Boolean(previous.completed))refreshSeriesProgress();");

source=source.replace("      const seriesItem=event.target.closest?.('.series-item');","      const seriesResume=event.target.closest?.('.series-resume-v2');\n      if(seriesResume){const series=state.data.series[Number(seriesResume.dataset.seriesIndex)],index=Number(seriesResume.dataset.itemIndex)||0,context=seriesContext(series,index),item=context.items[index];if(item)openPlayback(item.episode,{start:null,context,itemRef:item.ref});return}\n      const seriesItem=event.target.closest?.('.series-item');");

source=source.replace("buildLegacyQuestionIndex();loadUserData();applyStaticUi();renderEpisodes();renderSeries();","buildLegacyQuestionIndex();loadUserData();installEpisodeExperienceStyles();applyStaticUi();renderEpisodes();renderSeries();");

fs.writeFileSync(file,source);
console.log('Injected V2 episode cards and series progress into app-v2.js');
