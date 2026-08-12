import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.IntersectionObserver=class{observe(){}disconnect(){}};
window.matchMedia=()=>({matches:false,addEventListener:()=>{},removeEventListener:()=>{}});
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.scrollTo=()=>{};
window.requestAnimationFrame=cb=>setTimeout(()=>cb(Date.now()),0);
window.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
window.HTMLMediaElement.prototype.pause=function(){};
window.HTMLMediaElement.prototype.load=function(){};
Object.defineProperty(window.navigator,'mediaSession',{value:{setActionHandler:()=>{},setPositionState:()=>{},metadata:null},configurable:true});
window.MediaMetadata=function(value){Object.assign(this,value)};

const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('ready timeout')),5000);window.addEventListener('vedator-v2-ready',()=>{clearTimeout(timer);resolve()},{once:true})});
window.eval(app);window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));await ready;await new Promise(resolve=>setTimeout(resolve,30));

const cards=[...window.document.querySelectorAll('#episodes-v2 .episode-card-v2')];
assert(cards.length>=3,'Need at least 3 visible episode cards');
const visibleNumbers=cards.slice(0,3).map(card=>Number(card.dataset.episode));
assert(visibleNumbers[0]!==visibleNumbers[1],'Visible episode order is invalid');

cards[0].querySelector('.actions .play').click();await new Promise(resolve=>setTimeout(resolve,20));
const next=window.document.querySelector('#player-next-v2');assert(!next.disabled,'Next should be enabled for first visible episode');
next.click();await new Promise(resolve=>setTimeout(resolve,20));
const expected=data.episodes.find(episode=>Number(episode.number)===visibleNumbers[1]);
const activeTitle=window.document.querySelector('#player-title-v2').textContent;
const expectedTitle=expected?.i18n?.sk?.title||expected?.title||'';
assert(activeTitle===expectedTitle,`Next did not follow visible order: expected episode ${visibleNumbers[1]}, got ${activeTitle}`);

const sort=window.document.querySelector('#parity-sort-v2');sort.value='old';sort.dispatchEvent(new window.Event('change',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,30));
const oldCards=[...window.document.querySelectorAll('#episodes-v2 .episode-card-v2')];assert(oldCards.length>=2,'Oldest sort did not render cards');
const oldNumbers=oldCards.slice(0,2).map(card=>Number(card.dataset.episode));
oldCards[0].querySelector('.actions .play').click();await new Promise(resolve=>setTimeout(resolve,20));
window.document.querySelector('#player-next-v2').click();await new Promise(resolve=>setTimeout(resolve,20));
const expectedOld=data.episodes.find(episode=>Number(episode.number)===oldNumbers[1]);
const expectedOldTitle=expectedOld?.i18n?.sk?.title||expectedOld?.title||'';
assert(window.document.querySelector('#player-title-v2').textContent===expectedOldTitle,'Next did not follow oldest visible order');

console.log(JSON.stringify({ok:true,newestVisible:visibleNumbers,oldestVisible:oldNumbers,nextFollowsVisibleOrder:true},null,2));
