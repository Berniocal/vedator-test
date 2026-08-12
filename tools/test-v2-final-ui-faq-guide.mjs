import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

assert(html.includes('manifest-v2.webmanifest'),'V2 install manifest link missing');
assert(html.includes('id="install-v2"'),'Install button missing');
assert(html.includes('html body .tab-v2.active')&&html.includes('background:#5b4bdb!important')&&html.includes('color:#fff!important'),'Active tabs are not white on purple');
assert(html.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'Series are not three columns on wide screens');
assert(html.includes('.v2-collection-progress-text'),'Original collection progress text style missing');
assert(html.includes('.series-progress-main-v2,.playlist-progress-main-v2'),'New progress bars are not suppressed');
assert(app.includes("audio.paused?'▶':'Ⅱ'"),'Final play/pause icon mode missing');
assert(app.includes("parityUi.episodeTopic==='all'&&!state.query.trim()"),'Numeric all-episode navigation missing');
assert(app.includes("n.offline.textContent='Offline '+percent+' %'"),'Offline percentage progress missing');
assert(app.includes("status.textContent=''"),'Loaded status is not cleared');

const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
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
Object.defineProperty(window.navigator,'storage',{value:{persist:async()=>true},configurable:true});
window.MediaMetadata=function(value){Object.assign(this,value)};
window.URL.createObjectURL=()=> 'blob:https://example.test/offline';window.URL.revokeObjectURL=()=>{};
window.Response=class{constructor(body,options={}){this.body=body;this.status=options.status||200;this.headers=options.headers||{}}};
let cached=false;
window.caches={open:async()=>({put:async()=>{cached=true},delete:async()=>true,match:async()=>null})};

const ep340=data.episodes.find(episode=>Number(episode.number)===340);
assert(ep340?.enclosure,'Episode 340 audio URL missing');
const legacyAudioId='audio:'+new URL(ep340.enclosure,'https://example.test/v2.html').href;
window.localStorage.setItem('vedator-user-playlists-v1',JSON.stringify([{id:'legacy-final',name:'Legacy playlist',items:['FU']} ]));
window.localStorage.setItem('vedatorCollectionProgressV1',JSON.stringify({
  'series:faq dobre otazky':{type:'series',label:'FAQ – dobré otázky',lastItemId:legacyAudioId,items:{[legacyAudioId]:{title:ep340.title,currentTime:1200,duration:3600,start:0,percent:33,completed:false}}},
  'playlist:legacy-final':{type:'playlist',label:'Legacy playlist',lastItemId:'ref:FU',items:{'ref:FU':{title:ep340.title,currentTime:1200,duration:3600,start:0,percent:33,completed:false}}}
}));

const chunkA=new Uint8Array([1,2,3,4,5]),chunkB=new Uint8Array([6,7,8,9,10]);
let audioRequest=0;
window.fetch=async url=>{
  if(String(url).includes('content-v2.json'))return {ok:true,status:200,json:async()=>data};
  audioRequest++;
  let read=0;
  return {ok:true,status:200,headers:{get:name=>String(name).toLowerCase()==='content-length'?'10':String(name).toLowerCase()==='content-type'?'audio/mpeg':null},body:{getReader:()=>({read:async()=>{read++;if(read===1)return{done:false,value:chunkA};if(read===2){await new Promise(resolve=>setTimeout(resolve,45));return{done:false,value:chunkB}}return{done:true}}})},blob:async()=>new window.Blob([chunkA,chunkB],{type:'audio/mpeg'})};
};

const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('final UI ready timeout')),5000);window.addEventListener('vedator-v2-ready',()=>{clearTimeout(timer);resolve()},{once:true})});
window.eval(app);window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));await ready;await new Promise(resolve=>setTimeout(resolve,50));

assert(!window.document.querySelector('#parity-refresh-v2'),'Reload button should be removed from V2');
assert(window.document.querySelector('#status-v2').textContent.trim()==='','Loaded status text should be empty');
assert(window.document.querySelector('#count-v2').textContent.trim().length>0,'View count should remain visible');
assert(!window.document.querySelector('#install-v2').classList.contains('hidden'),'Install button should be visible outside standalone mode');

const tabs=[...window.document.querySelectorAll('.tab-v2')];
tabs.find(tab=>tab.dataset.view==='series').click();await new Promise(resolve=>setTimeout(resolve,30));
const faqSeries=data.series.find(series=>series.name==='FAQ – dobré otázky');
const faqIndex=data.series.indexOf(faqSeries),faqCard=window.document.querySelector(`#series-v2 .series[data-series-index="${faqIndex}"]`);
assert(faqCard?.querySelector('summary strong')?.classList.contains('v2-collection-title-active'),'Legacy series progress did not color the series title as active');
faqCard.open=true;faqCard.dispatchEvent(new window.Event('toggle'));await new Promise(resolve=>setTimeout(resolve,30));
const ep340Index=faqSeries.episodes.findIndex(number=>Number(number)===340),seriesItem=faqCard.querySelector(`.series-item[data-item-index="${ep340Index}"] span:last-child`);
assert(seriesItem?.classList.contains('v2-collection-progress-text'),'Legacy audio:<URL> series item progress was not restored');

tabs.find(tab=>tab.dataset.view==='playlists').click();await new Promise(resolve=>setTimeout(resolve,30));
const playlistCard=window.document.querySelector('#playlists-v2 .playlist-card[data-id="legacy-final"]');
assert(playlistCard?.querySelector('.playlist-title')?.classList.contains('v2-collection-title-active'),'Legacy playlist title progress was not restored');
assert(playlistCard.querySelector('.playlist-open[data-ref="FU"] b')?.classList.contains('v2-collection-progress-text'),'Legacy playlist item progress was not restored');

tabs.find(tab=>tab.dataset.view==='episodes').click();await new Promise(resolve=>setTimeout(resolve,20));
const firstPlay=window.document.querySelector('#episodes-v2 .episode-card-v2 .actions .play');
assert(firstPlay,'Episode play button missing');firstPlay.click();await new Promise(resolve=>setTimeout(resolve,30));
const playerPlay=window.document.querySelector('#player-play-v2');
assert(playerPlay.textContent==='Ⅱ','Playing state should use two vertical pause lines');
playerPlay.click();await new Promise(resolve=>setTimeout(resolve,10));
assert(playerPlay.textContent==='▶','Paused state should use play triangle');

const offline=window.document.querySelector('#player-offline-v2');offline.click();await new Promise(resolve=>setTimeout(resolve,15));
assert(/50\s*%/.test(offline.textContent),`Offline button did not show intermediate percentage: ${offline.textContent}`);
await new Promise(resolve=>setTimeout(resolve,80));
assert(cached,'Offline audio was not stored in cache');
assert(audioRequest>=1,'Offline audio was not fetched');
assert(!offline.dataset.busy,'Offline button stayed busy');
assert(offline.textContent.includes('Offline'),'Offline button did not return to saved state');

console.log(JSON.stringify({ok:true,installButton:true,desktopThreeColumnSeries:true,loadedStatusHidden:true,playPauseIcons:true,offlineProgress:true,legacySeriesAudioId:true,legacyPlaylistMarking:true},null,2));
