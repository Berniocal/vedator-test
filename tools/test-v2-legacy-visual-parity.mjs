import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

assert(html.includes('Neoficiální tematický katalog'),'Legacy eyebrow missing from static HTML');
assert(html.includes('Vedátorský podcast podle témat'),'Legacy heading missing from static HTML');
assert(app.includes('V2_LEGACY_VISUAL_PARITY_V1'),'Legacy visual parity runtime missing');
assert(app.includes("episodeProgressHtml=function(){return''}"),'Episode progress bar should be removed from cards');
assert(app.includes('.series>summary>strong'),'Series title clamp missing');
assert(!app.includes('.episode-card-v2 h2{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2'),'Episode titles must not be clamped');
assert(app.includes('player-expand-v2'),'Collapsed-player expand control missing');
assert(app.includes('html[data-theme="dark"] .tag'),'Dark purple keyword selector missing');

const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
window.localStorage.setItem('vedator-ui-language-v1','cz');
window.localStorage.setItem('vedator-ui-theme-v1','dark');
window.localStorage.setItem('vedatorPlaybackProgressV1',JSON.stringify({
  'episode-346':{currentTime:35,duration:100,completed:false,title:'test',updatedAt:Date.now()},
  'episode-347':{currentTime:100,duration:100,completed:true,title:'test',updatedAt:Date.now()}
}));
window.matchMedia=()=>({matches:false,addEventListener:()=>{},removeEventListener:()=>{}});
window.IntersectionObserver=class{observe(){}disconnect(){}};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.scrollTo=()=>{};
window.requestAnimationFrame=cb=>setTimeout(()=>cb(Date.now()),0);
window.alert=()=>{};window.confirm=()=>true;window.prompt=()=>'';
window.HTMLMediaElement.prototype.load=function(){};
window.HTMLMediaElement.prototype.play=function(){Object.defineProperty(this,'paused',{value:false,configurable:true});this.dispatchEvent(new window.Event('play'));return Promise.resolve()};
window.HTMLMediaElement.prototype.pause=function(){Object.defineProperty(this,'paused',{value:true,configurable:true});this.dispatchEvent(new window.Event('pause'))};
Object.defineProperty(window.navigator,'mediaSession',{value:{setActionHandler:()=>{},setPositionState:()=>{},metadata:null},configurable:true});
window.MediaMetadata=function(value){Object.assign(this,value)};
window.fetch=async url=>String(url).includes('content-v2.json')?{ok:true,status:200,json:async()=>data}:{ok:false,status:404};

const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('ready timeout')),5000);window.addEventListener('vedator-v2-ready',()=>{clearTimeout(timer);resolve()},{once:true})});
window.eval(app);window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));await ready;await new Promise(resolve=>setTimeout(resolve,80));

assert(window.document.querySelector('#eyebrow-v2').textContent==='Neoficiální tematický katalog','Czech eyebrow changed after runtime render');
assert(window.document.querySelector('#heading-v2').textContent==='Vedátorský podcast podle témat','Czech heading changed after runtime render');
assert(window.document.querySelector('.tab-v2.active'),'No active tab');

const progressCard=window.document.querySelector('#episodes-v2 .episode-card-v2[data-episode="346"]');
assert(progressCard,'Episode 346 card missing');
const badge=progressCard.querySelector('.listen-status.progress');
assert(badge&&badge.textContent.includes('Rozposloucháno')&&badge.textContent.includes('35 %'),'Progress badge should show only legacy percentage status');
assert(!progressCard.querySelector('.episode-progress-v2'),'Episode timeline/progress bar still rendered');
assert(progressCard.querySelector('.tag'),'Purple keyword tag missing from episode card');
assert(progressCard.querySelector('.episode-more-v2'),'Partially listened episode must still have Read more');

const doneCard=window.document.querySelector('#episodes-v2 .episode-card-v2[data-episode="347"]');
assert(doneCard?.querySelector('.listen-status.done')?.textContent.includes('Poslechnuto'),'Completed badge missing');

const seriesTab=window.document.querySelector('.tab-v2[data-view="series"]');seriesTab.click();await new Promise(resolve=>setTimeout(resolve,30));
assert(window.document.querySelector('#series-v2 .series>summary>strong'),'Series title element missing');

const play=progressCard.querySelector('.play');play.click();await new Promise(resolve=>setTimeout(resolve,40));
const collapse=window.document.querySelector('#player-close-v2');
assert(collapse.textContent==='↓','Player collapse button should be down arrow');
collapse.click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelector('#player-v2').classList.contains('player-collapsed-v2'),'Player did not collapse');
const expand=window.document.querySelector('#player-expand-v2');
assert(expand&&!expand.hidden&&expand.textContent.includes('♫')&&expand.textContent.includes('↑'),'Distinct floating player expand control missing after collapse');
assert(window.document.querySelector('#back-top-v2')?.textContent==='↑','Back-to-top control must remain plain up arrow');
expand.click();await new Promise(resolve=>setTimeout(resolve,20));
assert(!window.document.querySelector('#player-v2').classList.contains('player-collapsed-v2'),'Player did not expand again');

console.log(JSON.stringify({ok:true,legacyHeader:true,activePills:true,legacyBadges:true,noEpisodeTimeline:true,purpleTags:true,collapsiblePlayer:true,episodeTitleClamp:false,seriesTitleEllipsis:true},null,2));
