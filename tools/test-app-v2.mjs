import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const latestEpisode=[...data.episodes].sort((a,b)=>new Date(b.date)-new Date(a.date)||(Number(b.number)||0)-(Number(a.number)||0))[0];
if(!latestEpisode)throw new Error('No episodes in V2 data');
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;

const legacyProgress={[`episode-${latestEpisode.number}`]:{currentTime:123,duration:3600,completed:false,replaying:false,title:latestEpisode.title,updatedAt:1}};
const legacyPlaylists=[{id:'legacy-playlist',name:'Starý playlist',items:['FU','gA']}];
window.localStorage.setItem('vedator-ui-language-v1','cz');
window.localStorage.setItem('vedatorPlaybackProgressV1',JSON.stringify(legacyProgress));
window.localStorage.setItem('vedator-user-playlists-v1',JSON.stringify(legacyPlaylists));
const progressBefore=window.localStorage.getItem('vedatorPlaybackProgressV1');
const playlistsBefore=window.localStorage.getItem('vedator-user-playlists-v1');

window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.HTMLMediaElement.prototype.play=()=>Promise.resolve();
window.HTMLMediaElement.prototype.pause=()=>{};
window.HTMLMediaElement.prototype.load=()=>{};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.requestAnimationFrame=callback=>setTimeout(()=>callback(Date.now()),0);

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 ready event timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);
window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
const detail=await ready;await new Promise(resolve=>setTimeout(resolve,30));

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const tabs=[...window.document.querySelectorAll('.tab-v2')];
assert(tabs.length===6,`Expected 6 tabs, got ${tabs.length}`);
assert(tabs.map(x=>x.dataset.view).join(',')==='episodes,series,questions,nonquestions,playlists,data','Unexpected tab order');
assert(window.document.querySelectorAll('#episodes-v2 .card').length===20,'Episodes should initially render 20 cards');
assert(window.document.querySelectorAll('#questions-v2 .card').length===20,'Questions should initially render 20 cards');
assert(window.document.querySelectorAll('#series-v2 .series').length===data.series.length,'Series not rendered');
assert(Number(window.document.querySelector('#nonquestions-v2').dataset.count)>0,'Nonquestions not rendered');
assert(detail.episodes===data.episodes.length&&detail.questions===734,'Ready event has wrong counts');
assert(detail.playlists===1,'Legacy playlist count not exposed');
assert(detail.language==='cz','Stored Czech language not restored');
assert(window.document.documentElement.lang==='cs','HTML language is not Czech');
assert(window.localStorage.getItem('vedatorPlaybackProgressV1')===progressBefore,'Startup rewrote legacy progress');
assert(window.localStorage.getItem('vedator-user-playlists-v1')===playlistsBefore,'Startup rewrote legacy playlists');

const newestCard=window.document.querySelector(`#episodes-v2 article[data-episode="${latestEpisode.number}"]`);
assert(newestCard,`Newest episode ${latestEpisode.number} card missing`);
assert(newestCard.textContent.includes('Rozposloucháno'),'Legacy playback progress not shown in Czech');
assert(newestCard.querySelector('.tag'),'Episode topic tag missing');

const playlistTab=tabs.find(x=>x.dataset.view==='playlists');playlistTab.click();
assert(window.document.querySelectorAll('#playlists-v2 .playlist-card').length===1,'Legacy playlist not rendered');
assert(window.document.querySelectorAll('#playlists-v2 .playlist-open').length===2,'Legacy episode/question refs not resolved');
let playlistTexts=[...window.document.querySelectorAll('#playlists-v2 .playlist-open')].map(x=>x.textContent);
assert(playlistTexts.some(value=>value.includes('340')),'Legacy episode ref FU did not map to episode 340');
assert(playlistTexts.some(value=>/Díl\s*340/.test(value)),'Legacy question ref gA did not map to episode 340 question in Czech');

const skButton=window.document.querySelector('.language-v2 [data-lang="sk"]');skButton.click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.documentElement.lang==='sk','HTML language did not switch to Slovak');
assert(window.document.querySelector('.tab-v2[data-view="episodes"]').textContent==='Epizódy','Episodes tab did not translate to Slovak');
assert(window.document.querySelector('.tab-v2[data-view="data"]').textContent==='Moje dáta','Data tab did not translate to Slovak');
assert(window.localStorage.getItem('vedator-ui-language-v1')==='sk','Slovak language preference not persisted');
assert(window.localStorage.getItem('vedatorPlaybackProgressV1')===progressBefore,'Language switch rewrote legacy progress');
assert(window.localStorage.getItem('vedator-user-playlists-v1')===playlistsBefore,'Language switch rewrote legacy playlists');
playlistTab.click();playlistTexts=[...window.document.querySelectorAll('#playlists-v2 .playlist-open')].map(x=>x.textContent);assert(playlistTexts.some(value=>/Diel\s*340/.test(value)),'Legacy playlist item did not translate to Slovak');

const czButton=window.document.querySelector('.language-v2 [data-lang="cz"]');czButton.click();
const questionTab=tabs.find(x=>x.dataset.view==='questions');questionTab.click();await new Promise(resolve=>setTimeout(resolve,20));
const search=window.document.querySelector('#search-v2');search.value='kvant';search.dispatchEvent(new window.Event('input',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,20));
const visible=window.document.querySelectorAll('#questions-v2 .card').length;assert(visible>0&&visible<=20,`Question search failed, visible=${visible}`);
assert(window.document.querySelector('#questions-v2 mark'),'Question highlight missing');

const dataTab=tabs.find(x=>x.dataset.view==='data');dataTab.click();
assert(window.document.querySelector('#data-v2').textContent.includes('playlist'),'Data view did not render');
assert(window.document.querySelector('.data-export'),'Data export action missing');
assert(window.document.querySelector('.data-import'),'Data import action missing');

console.log(JSON.stringify({ok:true,tabs:tabs.length,initialEpisodeCards:20,initialQuestionCards:20,newestEpisode:latestEpisode.number,series:data.series.length,nonquestions:Number(window.document.querySelector('#nonquestions-v2').dataset.count),legacyPlaylistItems:window.document.querySelectorAll('#playlists-v2 .playlist-open').length,startupPreservedLegacyData:true,languageSwitch:true,searchVisible:visible},null,2));
