import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const faqSeries=data.series.find(series=>series.episodes.includes(340));
if(!faqSeries)throw new Error('Series containing episode 340 missing');
const index340=faqSeries.episodes.indexOf(340);
const completedEpisode=faqSeries.episodes.find(number=>number!==340);

const dom=new JSDOM(html,{url:'https://example.test/v2.html#episode=340',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
window.localStorage.setItem('vedator-ui-language-v1','cz');
window.localStorage.setItem('vedatorPlaybackProgressV1',JSON.stringify({
  'episode-340':{currentTime:600,duration:3600,completed:false,replaying:false,title:'Podcast 340',updatedAt:1},
  [`episode-${completedEpisode}`]:{currentTime:3600,duration:3600,completed:true,replaying:false,title:'Done',updatedAt:1}
}));
window.localStorage.setItem('vedatorCollectionProgressV1',JSON.stringify({
  [`series:${norm(faqSeries.name)}`]:{type:'series',label:faqSeries.name,lastItemId:'episode:340',updatedAt:1,items:{}}
}));
window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.HTMLMediaElement.prototype.play=()=>Promise.resolve();
window.HTMLMediaElement.prototype.pause=()=>{};
window.HTMLMediaElement.prototype.load=()=>{};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.requestAnimationFrame=callback=>setTimeout(callback,0);

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 ready timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);
window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
await ready;
await new Promise(resolve=>setTimeout(resolve,40));

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const episodeCard=window.document.querySelector('#episodes-v2 article[data-episode="340"]');
assert(episodeCard,'Episode 340 card missing through deep-link lazy expansion');
assert(!episodeCard.querySelector('.episode-progress-v2'),'Episode timeline should be hidden in legacy visual parity');
const listenBadge=episodeCard.querySelector('.listen-status.progress');
assert(listenBadge?.textContent.includes('17 %'),`Expected rounded episode progress 17 % in badge, got ${listenBadge?.textContent||'none'}`);
const summary=episodeCard.querySelector('.episode-summary-v2');
assert(summary,'Episode 340 summary missing');
const expectedChapters=data.questions.filter(item=>Number(item.episode)===340).length;
const chapterButtons=summary.querySelectorAll('.episode-chapter-play-v2');
assert(expectedChapters>0,'Episode 340 has no source questions');
assert(chapterButtons.length===expectedChapters,`Expected ${expectedChapters} chapter buttons, got ${chapterButtons.length}`);
assert(chapterButtons[0].dataset.episode==='340','Chapter playback episode mismatch');
assert(summary.textContent.includes('Shrnutí dílu'),'Czech episode summary label missing');

const seriesIndex=data.series.indexOf(faqSeries);
const seriesTab=[...window.document.querySelectorAll('.tab-v2')].find(tab=>tab.dataset.view==='series');seriesTab.click();
await new Promise(resolve=>setTimeout(resolve,20));
const seriesCard=window.document.querySelector(`#series-v2 .series[data-series-index="${seriesIndex}"]`);
assert(seriesCard,'Series card missing');
const seriesProgress=seriesCard.querySelector('.series-progress-bar-v2');
const seriesLabel=seriesCard.querySelector('.series-progress-label-v2');
const resume=seriesCard.querySelector('.series-resume-v2');
assert(seriesProgress&&seriesLabel&&resume,'Series progress controls missing');
assert(seriesLabel.textContent.includes(`1 / ${faqSeries.episodes.length}`),`Unexpected series progress: ${seriesLabel.textContent}`);
assert(Number(resume.dataset.itemIndex)===index340,`Resume index ${resume.dataset.itemIndex} does not point to episode 340 index ${index340}`);
assert(resume.textContent.includes('Pokračovat'),'Series resume label missing');
seriesCard.open=true;seriesCard.dispatchEvent(new window.Event('toggle'));
await new Promise(resolve=>setTimeout(resolve,20));
const status340=seriesCard.querySelector('.series-item-status-v2[data-episode="340"]');
assert(status340?.textContent==='▶','In-progress series item status missing');
const statusDone=seriesCard.querySelector(`.series-item-status-v2[data-episode="${completedEpisode}"]`);
assert(statusDone?.textContent==='✓','Completed series item status missing');

resume.click();
await new Promise(resolve=>setTimeout(resolve,20));
assert(!window.document.querySelector('#player-v2').classList.contains('hidden'),'Series resume did not open player');
assert(window.document.querySelector('#player-title-v2').textContent.length>0,'Player title missing after series resume');

const skButton=window.document.querySelector('.language-v2 [data-lang="sk"]');
skButton.click();
await new Promise(resolve=>setTimeout(resolve,30));
window.location.hash='#episode=340';window.dispatchEvent(new window.HashChangeEvent('hashchange'));
await new Promise(resolve=>setTimeout(resolve,30));
const summarySk=window.document.querySelector('#episodes-v2 article[data-episode="340"] .episode-summary-v2');
assert(summarySk?.textContent.includes('Zhrnutie dielu'),'Episode summary label did not translate to Slovak');
seriesTab.click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelector(`#series-v2 .series[data-series-index="${seriesIndex}"] .series-resume-v2`)?.textContent.includes('Pokračovať'),'Series resume did not translate to Slovak');

console.log(JSON.stringify({ok:true,episode:340,episodeProgressBadge:17,episodeTimeline:false,chapters:chapterButtons.length,series:faqSeries.name,seriesEpisodes:faqSeries.episodes.length,completed:1,resumeEpisode:340,translated:true,lazySeriesBody:true},null,2));
