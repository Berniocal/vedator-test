import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;

const legacyProgress={
  'episode-340':{currentTime:123,duration:3600,completed:false,replaying:false,title:'Podcast 340',updatedAt:1}
};
const legacyPlaylists=[{id:'legacy-playlist',name:'Starý playlist',items:['FU','gA']}];
window.localStorage.setItem('vedatorPlaybackProgressV1',JSON.stringify(legacyProgress));
window.localStorage.setItem('vedator-user-playlists-v1',JSON.stringify(legacyPlaylists));
const progressBefore=window.localStorage.getItem('vedatorPlaybackProgressV1');
const playlistsBefore=window.localStorage.getItem('vedator-user-playlists-v1');

window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.HTMLMediaElement.prototype.play=()=>Promise.resolve();
window.HTMLMediaElement.prototype.pause=()=>{};
window.HTMLMediaElement.prototype.load=()=>{};

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 ready event timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);
window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
const detail=await ready;

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const tabs=[...window.document.querySelectorAll('.tab-v2')];
assert(tabs.length===6,`Expected 6 tabs, got ${tabs.length}`);
assert(tabs.map(x=>x.dataset.view).join(',')==='episodes,series,questions,nonquestions,playlists,data','Unexpected tab order');
assert(window.document.querySelectorAll('#episodes-v2 .card').length===data.episodes.length,'Episode cards not rendered');
assert(window.document.querySelectorAll('#questions-v2 .card').length===734,'Question cards not rendered');
assert(window.document.querySelectorAll('#series-v2 .series').length===data.series.length,'Series not rendered');
assert(Number(window.document.querySelector('#nonquestions-v2').dataset.count)>0,'Nonquestions not rendered');
assert(detail.episodes===data.episodes.length&&detail.questions===734,'Ready event has wrong counts');
assert(detail.playlists===1,'Legacy playlist count not exposed');
assert(window.localStorage.getItem('vedatorPlaybackProgressV1')===progressBefore,'Startup rewrote legacy progress');
assert(window.localStorage.getItem('vedator-user-playlists-v1')===playlistsBefore,'Startup rewrote legacy playlists');

const episode340=window.document.querySelector('#episodes-v2 article[data-episode="340"]');
assert(episode340,'Episode 340 card missing');
assert(episode340.textContent.includes('Rozposloucháno'),'Legacy playback progress not shown');

const playlistTab=tabs.find(x=>x.dataset.view==='playlists');
playlistTab.click();
assert(playlistTab.classList.contains('active'),'Playlists tab did not activate');
assert(window.document.querySelectorAll('#playlists-v2 .playlist-card').length===1,'Legacy playlist not rendered');
assert(window.document.querySelectorAll('#playlists-v2 .playlist-open').length===2,'Legacy episode/question refs not resolved');
const playlistTexts=[...window.document.querySelectorAll('#playlists-v2 .playlist-open')].map(x=>x.textContent);
assert(playlistTexts.some(text=>text.includes('340')),'Legacy episode ref FU did not map to episode 340');
assert(playlistTexts.some(text=>/Díl\s*340/.test(text)),'Legacy question ref gA did not map to episode 340 question');

const questionTab=tabs.find(x=>x.dataset.view==='questions');
questionTab.click();
assert(questionTab.classList.contains('active'),'Questions tab did not activate');
assert(!window.document.querySelector('#questions-v2').classList.contains('hidden'),'Questions view stayed hidden');
assert(window.document.querySelector('#episodes-v2').classList.contains('hidden'),'Episodes view did not hide');

const search=window.document.querySelector('#search-v2');
search.value='kvant';
search.dispatchEvent(new window.Event('input',{bubbles:true}));
const visible=[...window.document.querySelectorAll('#questions-v2 .card')].filter(x=>!x.classList.contains('filtered-out')).length;
assert(visible>0&&visible<734,`Question search failed, visible=${visible}`);

const dataTab=tabs.find(x=>x.dataset.view==='data');
dataTab.click();
assert(window.document.querySelector('#data-v2').textContent.includes('playlist'),'Data view did not render');
assert(window.document.querySelector('.data-export'),'Data export action missing');
assert(window.document.querySelector('.data-import'),'Data import action missing');

console.log(JSON.stringify({
  ok:true,
  tabs:tabs.length,
  episodeCards:data.episodes.length,
  questionCards:734,
  series:data.series.length,
  nonquestions:Number(window.document.querySelector('#nonquestions-v2').dataset.count),
  legacyPlaylistItems:window.document.querySelectorAll('#playlists-v2 .playlist-open').length,
  startupPreservedLegacyData:true,
  searchVisible:visible
},null,2));
