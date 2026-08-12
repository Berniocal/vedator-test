import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const requiredSeries=['FAQ – dobré otázky','Matematika','Teorie her','Rozhovory v angličtině','Internet','Černé díry','Temná hmota a energie','Částice','Roky ve vědě','Vědci','Vědkyně'];
assert(data.series.length>=18,`Expected at least 18 legacy-compatible series, got ${data.series.length}`);
for(const name of requiredSeries)assert(data.series.some(series=>series.name===name),`Missing series: ${name}`);
assert(data.meta?.legacyParity?.fixedSeries===16,'Expected 16 fixed legacy series definitions');
assert(data.meta?.legacyParity?.scientistSeries===2,'Expected scientist series definitions');
assert(data.meta?.legacyParity?.automaticSeries>=1,'Expected automatically detected repeated-title series');

const mediaHandlers={};
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
Object.defineProperty(window.navigator,'mediaSession',{value:{setActionHandler:(name,fn)=>{mediaHandlers[name]=fn},setPositionState:()=>{},metadata:null},configurable:true});
window.MediaMetadata=function(value){Object.assign(this,value)};
window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.HTMLMediaElement.prototype.play=()=>Promise.resolve();
window.HTMLMediaElement.prototype.pause=()=>{};
window.HTMLMediaElement.prototype.load=()=>{};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.requestAnimationFrame=callback=>setTimeout(()=>callback(Date.now()),0);
window.alert=()=>{};window.prompt=()=>'';window.confirm=()=>true;

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 ready timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));await ready;await new Promise(resolve=>setTimeout(resolve,30));

assert(window.document.querySelectorAll('#episodes-v2 .episode-card-v2').length===20,'Initial episode batch is not 20');
assert(window.document.querySelector('#episodes-v2 .parity-sentinel'),'Episode lazy sentinel missing');
assert(window.document.querySelectorAll('#parity-topics-v2 .topic-v2').length===15,'Episode topic bar should contain 15 choices including All');
assert(window.document.querySelectorAll('#parity-sort-v2 option').length===6,'Episode sort should contain 6 legacy modes');
assert(window.document.querySelector('#episodes-v2 .tag'),'Episode purple topic tag missing');
assert(window.document.querySelector('style[data-v2-full-parity]')?.textContent.includes('.tag'),'Parity tag styles missing');

window.document.querySelector('#episodes-v2 .parity-sentinel').click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelectorAll('#episodes-v2 .episode-card-v2').length===40,'Second episode batch should raise rendered cards to 40');

const tabs=[...window.document.querySelectorAll('.tab-v2')];
tabs.find(tab=>tab.dataset.view==='questions').click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelectorAll('#questions-v2 .question-card').length===20,'Initial question batch is not 20');
assert(window.document.querySelectorAll('#parity-topics-v2 .topic-v2').length===11,'Question topic bar should contain 11 choices');
assert(window.document.querySelector('#questions-v2 .tag'),'Question purple topic tag missing');
assert(window.document.querySelectorAll('#parity-sort-v2 option').length===2,'Question sort should contain newest/oldest');
assert(window.document.querySelector('script[data-v2-mathjax]'),'MathJax should be lazy-requested on question view');

tabs.find(tab=>tab.dataset.view==='nonquestions').click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelectorAll('#nonquestions-v2 .question-card').length===20,'Initial nonquestion batch is not 20');
assert(window.document.querySelector('#nonquestions-v2 .tag'),'Nonquestion purple topic tag missing');

tabs.find(tab=>tab.dataset.view==='series').click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelectorAll('#series-v2 .series').length===data.series.length,'All series cards should be listed');
assert(window.document.querySelectorAll('#parity-sort-v2 option').length===3,'Series sort should contain 3 legacy modes');
const peopleSeries=data.series.find(series=>series.people);assert(peopleSeries,'Scientist series flag missing');
const peopleIndex=data.series.indexOf(peopleSeries);const peopleCard=window.document.querySelector(`#series-v2 .series[data-series-index="${peopleIndex}"]`);assert(peopleCard,'Scientist series card missing');
assert(!peopleCard.querySelector('.parity-series-body'),'Series body should be lazy before opening');peopleCard.open=true;peopleCard.dispatchEvent(new window.Event('toggle'));await new Promise(resolve=>setTimeout(resolve,10));assert(peopleCard.querySelector('.parity-series-body'),'Series body did not lazy-load on open');assert(peopleCard.querySelector('.person-name-v2'),'Scientist name formatting missing');

assert(window.document.querySelector('#player-back10-v2'),'−10 s player button missing');
assert(window.document.querySelector('#player-forward10-v2'),'+10 s player button missing');
assert(window.document.querySelector('#parity-refresh-v2'),'Manual refresh button missing');
for(const action of ['seekbackward','seekforward','previoustrack','nexttrack','seekto'])assert(typeof mediaHandlers[action]==='function',`Media Session handler missing: ${action}`);

const runtimeScripts=[...window.document.querySelectorAll('script[src]')].map(script=>script.getAttribute('src')).filter(Boolean).filter(src=>!src.includes('mathjax'));
assert(runtimeScripts.length===0,'Test HTML should have no extra runtime scripts after app script removal');
console.log(JSON.stringify({ok:true,series:data.series.length,automaticSeries:data.meta?.legacyParity?.automaticSeries,episodeBatch:20,questionBatch:20,nonquestionBatch:20,episodeTopics:15,questionTopics:11,episodeSortModes:6,seriesSortModes:3,tags:true,mediaSession:true,lazySeries:true},null,2));
