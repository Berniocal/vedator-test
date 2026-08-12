import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.HTMLMediaElement.prototype.play=()=>Promise.resolve();
window.HTMLMediaElement.prototype.pause=()=>{};
window.HTMLMediaElement.prototype.load=()=>{};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.requestAnimationFrame=callback=>setTimeout(()=>callback(Date.now()),0);
window.alert=()=>{};window.prompt=()=>'';window.confirm=()=>true;

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 ready event timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);
window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
await ready;
await new Promise(resolve=>setTimeout(resolve,20));

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const tabs=[...window.document.querySelectorAll('.tab-v2')];
const questionTab=tabs.find(x=>x.dataset.view==='questions');
questionTab.click();
await new Promise(resolve=>setTimeout(resolve,10));

assert(window.document.querySelector('#questions-v2 .question-tools'),'Question tools missing');
assert(window.document.querySelectorAll('#questions-v2 .question-topic').length>=10,'Question topics missing');
assert(window.document.querySelectorAll('#questions-v2 .question-card').length===734,'Expected all 734 question cards initially');
assert(window.document.querySelector('#questions-v2 .question-sort'),'Question sort missing');
assert(window.document.querySelector('#questions-v2 .question-more'),'Read-more button missing');
assert(window.document.querySelector('#questions-v2 .deep-share[data-kind="question"]'),'Question share button missing');

const search=window.document.querySelector('#search-v2');
search.value='kvant';search.dispatchEvent(new window.Event('input',{bubbles:true}));
await new Promise(resolve=>setTimeout(resolve,10));
const filteredQuestions=window.document.querySelectorAll('#questions-v2 .question-card').length;
assert(filteredQuestions>0&&filteredQuestions<734,`Question search failed: ${filteredQuestions}`);
assert(window.document.querySelector('#questions-v2 mark'),'Search highlighting missing');

search.value='';search.dispatchEvent(new window.Event('input',{bubbles:true}));
await new Promise(resolve=>setTimeout(resolve,10));
const blackHoleTopic=[...window.document.querySelectorAll('#questions-v2 .question-topic')].find(x=>x.textContent.includes('Čierne')||x.textContent.includes('Černé'));
assert(blackHoleTopic,'Black-hole topic missing');
blackHoleTopic.click();
await new Promise(resolve=>setTimeout(resolve,10));
const topicCount=window.document.querySelectorAll('#questions-v2 .question-card').length;
assert(topicCount>0&&topicCount<734,`Topic filter failed: ${topicCount}`);

const allTopic=[...window.document.querySelectorAll('#questions-v2 .question-topic')][0];allTopic.click();
const sort=window.document.querySelector('#questions-v2 .question-sort');sort.value='old';sort.dispatchEvent(new window.Event('change',{bubbles:true}));
await new Promise(resolve=>setTimeout(resolve,10));
const firstOld=window.document.querySelector('#questions-v2 .question-card .meta')?.textContent||'';
assert(/(?:Díl|Diel)\s+(17|26|35|51|60|69|75|82|89|100|112|119|128|133|138|143|158|170|179|190|203|211|218|226|244|248|257|263|270|272|278|284|289|295|300|313|319|326|332|337|340|346)/.test(firstOld),'Oldest sort did not produce a valid FAQ episode');

const more=window.document.querySelector('#questions-v2 .question-more');const card=more.closest('.question-card');more.click();
assert(card.classList.contains('open'),'Read-more did not open card');

const nonTab=tabs.find(x=>x.dataset.view==='nonquestions');nonTab.click();
await new Promise(resolve=>setTimeout(resolve,10));
assert(window.document.querySelector('#nonquestions-v2 .question-tools'),'Nonquestion tools missing');
assert(window.document.querySelectorAll('#nonquestions-v2 .question-card').length===208,'Expected 208 nonquestions');
assert(window.document.querySelector('#nonquestions-v2 .deep-share[data-kind="nonquestion"]'),'Nonquestion share missing');

window.location.hash='#question=346:0';window.dispatchEvent(new window.HashChangeEvent('hashchange'));
await new Promise(resolve=>setTimeout(resolve,30));
assert(tabs.find(x=>x.dataset.view==='questions').classList.contains('active'),'Question deep link did not switch tab');
assert(window.document.querySelector("#questions-v2 [data-item='q:346:0']")?.classList.contains('deep-target'),'Question deep link did not target card');

window.location.hash='#episode=343';window.dispatchEvent(new window.HashChangeEvent('hashchange'));
await new Promise(resolve=>setTimeout(resolve,30));
assert(tabs.find(x=>x.dataset.view==='episodes').classList.contains('active'),'Episode deep link did not switch tab');
assert(window.document.querySelector('#episodes-v2 article[data-episode="343"]')?.classList.contains('deep-target'),'Episode deep link did not target episode');
assert(window.document.querySelector('#episodes-v2 .deep-share[data-kind="episode"]'),'Episode share button missing');
assert(window.document.querySelector('#series-v2 .deep-share[data-kind="series"]'),'Series share button missing');

console.log(JSON.stringify({ok:true,questionTopics:window.document.querySelectorAll('#questions-v2 .question-topic').length,filteredQuestions,topicCount,nonquestions:208,deepLinks:true,readMore:true,highlight:true},null,2));
