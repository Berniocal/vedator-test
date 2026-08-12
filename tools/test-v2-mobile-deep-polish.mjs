import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

assert(html.includes('V2_MOBILE_DEEP_POLISH_CSS_V2'),'Mobile polish CSS marker missing');
assert(html.includes('html[data-theme="dark"] body .topic-v2.active'),'Dark topic selector does not match V2 theme model');
assert(html.includes('color:#fff!important'),'Selected topic contrast rule missing');
assert(html.includes('grid-template-columns:repeat(20,minmax(0,1fr))'),'Mobile player 5+4 control grid missing');
assert(html.includes('.question-card .actions,.episode-card-v2 .actions{display:grid!important'),'Stable card action row missing');
assert(html.includes('mark.vedator-match'),'Yellow search highlight CSS missing');
assert(!app.includes("const tabs=$('.tab-v2').filter"),'Swipe still uses single-element selector');
assert(app.includes("const tabs=$$('.tab-v2').filter"),'Swipe collection fix missing');
assert(app.includes('async function downloadCurrentMp3()'),'Real MP3 downloader missing');
assert(app.includes('link.download=mobileSafeMp3Filename'),'MP3 Blob download filename missing');
assert(app.includes("type:'episodes'"),'Episode playback context missing');
assert(app.includes("setTimeout(()=>navigateContext(1),0)"),'Continuous context playback missing');

const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
Object.defineProperty(window,'innerWidth',{value:390,configurable:true});
Object.defineProperty(window.navigator,'mediaSession',{value:{setActionHandler:()=>{},setPositionState:()=>{},metadata:null},configurable:true});
window.MediaMetadata=function(value){Object.assign(this,value)};
window.matchMedia=()=>({matches:true,addEventListener:()=>{},removeEventListener:()=>{}});
window.IntersectionObserver=class{observe(){} disconnect(){}};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.scrollTo=()=>{};
window.requestAnimationFrame=callback=>setTimeout(()=>callback(Date.now()),0);
window.alert=()=>{};window.prompt=()=>'';window.confirm=()=>true;
window.HTMLMediaElement.prototype.play=function(){Object.defineProperty(this,'paused',{value:false,configurable:true});this.dispatchEvent(new window.Event('play'));return Promise.resolve()};
window.HTMLMediaElement.prototype.pause=function(){Object.defineProperty(this,'paused',{value:true,configurable:true});this.dispatchEvent(new window.Event('pause'))};
window.HTMLMediaElement.prototype.load=()=>{};
window.URL.createObjectURL=()=> 'blob:https://example.test/download';
window.URL.revokeObjectURL=()=>{};
const downloads=[];
window.HTMLAnchorElement.prototype.click=function(){if(this.download)downloads.push({download:this.download,href:this.href})};

let audioFetches=0;
const byteChunk=new Uint8Array([1,2,3,4,5,6]);
window.fetch=async url=>{
  const value=String(url);
  if(value.includes('content-v2.json'))return {ok:true,status:200,json:async()=>data};
  audioFetches++;
  let sent=false;
  return {
    ok:true,status:200,
    headers:{get:name=>String(name).toLowerCase()==='content-length'?String(byteChunk.byteLength):String(name).toLowerCase()==='content-type'?'audio/mpeg':null},
    body:{getReader:()=>({read:async()=>sent?{done:true,value:undefined}:(sent=true,{done:false,value:byteChunk})})},
    blob:async()=>new window.Blob([byteChunk],{type:'audio/mpeg'})
  };
};

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 mobile polish ready timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);
window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
await ready;await new Promise(resolve=>setTimeout(resolve,30));

// Dark theme and selected topic must use the same data-theme model.
window.document.documentElement.dataset.theme='dark';
const topic=window.document.querySelector('#parity-topics-v2 .topic-v2');
assert(topic,'Episode topic buttons missing');
topic.click();
assert(topic.classList.contains('active'),'Topic click did not keep active state');

// Episode search must visibly highlight the matching word, including lazy-rendered cards.
const search=window.document.querySelector('#search-v2');
search.value='podcast';search.dispatchEvent(new window.Event('input',{bubbles:true}));
await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelector('#episodes-v2 mark.vedator-match'),'Episode search has no yellow highlight');
assert(window.document.querySelectorAll('#episodes-v2 .episode-card-v2').length<=20,'Episode search broke 20-item lazy batch');

// Question search must also retain yellow highlighting after the new lazy renderer.
const qtab=[...window.document.querySelectorAll('.tab-v2')].find(tab=>tab.dataset.view==='questions');qtab.click();
const skTitle=data.questions.find(q=>q?.i18n?.sk?.title)?.i18n.sk.title||data.questions[0]?.title||'';
const qword=(skTitle.match(/[A-Za-zÁ-ž]{5,}/g)||[]).sort((a,b)=>b.length-a.length)[0];
assert(qword,'Could not derive question search word');
search.value=qword;search.dispatchEvent(new window.Event('input',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelector('#questions-v2 mark.vedator-match'),'Question search has no yellow highlight');

// Share must remain the third compact action in the same card action row.
const qactions=window.document.querySelector('#questions-v2 .question-card .actions');
assert(qactions&&qactions.querySelector('.play')&&qactions.querySelector('.question-more')&&qactions.querySelector('.deep-share'),'Question action row is incomplete');

// Regular episode playback must get prev/next context instead of disabling both buttons.
const etab=[...window.document.querySelectorAll('.tab-v2')].find(tab=>tab.dataset.view==='episodes');etab.click();search.value='';search.dispatchEvent(new window.Event('input',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,20));
const episodeCards=[...window.document.querySelectorAll('#episodes-v2 .episode-card-v2')];
assert(episodeCards.length>=2,'Need at least two episode cards for mobile player test');
const secondPlay=episodeCards[1].querySelector('.actions .play');secondPlay.click();await new Promise(resolve=>setTimeout(resolve,20));
const prev=window.document.querySelector('#player-prev-v2'),next=window.document.querySelector('#player-next-v2');
assert(!(prev.disabled&&next.disabled),'Regular episode playback has no prev/next context');

// MP3 must be fetched as bytes and saved through a Blob download, not merely opened in a tab.
const download=window.document.querySelector('#player-download-v2');download.click();await new Promise(resolve=>setTimeout(resolve,50));
assert(audioFetches>=1,'MP3 download did not fetch audio bytes');
assert(downloads.some(item=>item.download.endsWith('.mp3')),'MP3 Blob download was not triggered');
assert(!download.dataset.busy,'MP3 download stayed stuck in busy state');

// Ended playback should advance inside the episode context when another item follows.
const beforeTitle=window.document.querySelector('#player-title-v2').textContent;
window.document.querySelector('#audio-v2').dispatchEvent(new window.Event('ended'));await new Promise(resolve=>setTimeout(resolve,50));
const afterTitle=window.document.querySelector('#player-title-v2').textContent;
assert(beforeTitle!==afterTitle,'Playback did not advance to the next context item after ended');

console.log(JSON.stringify({ok:true,mobileWidth:390,episodeHighlight:true,questionHighlight:true,darkTopicContrast:true,shareSingleRow:true,realMp3Download:true,episodeContext:true,autoAdvance:true,downloaded:downloads[0]?.download||null},null,2));
