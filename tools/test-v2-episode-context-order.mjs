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
window.eval(app);window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));await ready;await new Promise(resolve=>setTimeout(resolve,40));

const card346=window.document.querySelector('#episodes-v2 .episode-card-v2[data-episode="346"]');
assert(card346,'Episode 346 must be in the first batch');
card346.querySelector('.actions .play').click();await new Promise(resolve=>setTimeout(resolve,20));
const prev=window.document.querySelector('#player-prev-v2'),next=window.document.querySelector('#player-next-v2');
assert(!prev.disabled&&!next.disabled,'Previous and next should be enabled around episode 346');

next.click();await new Promise(resolve=>setTimeout(resolve,20));
const ep347=data.episodes.find(episode=>Number(episode.number)===347);
assert(window.document.querySelector('#player-title-v2').textContent===(ep347?.i18n?.sk?.title||ep347?.title||''),'Next from episode 346 must increase the episode number to 347');

card346.querySelector('.actions .play').click();await new Promise(resolve=>setTimeout(resolve,20));
prev.click();await new Promise(resolve=>setTimeout(resolve,20));
const ep345=data.episodes.find(episode=>Number(episode.number)===345);
assert(window.document.querySelector('#player-title-v2').textContent===(ep345?.i18n?.sk?.title||ep345?.title||''),'Previous from episode 346 must decrease the episode number to 345');

console.log(JSON.stringify({ok:true,episode:346,next:347,previous:345,numericNavigation:true},null,2));
