import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.HTMLMediaElement.prototype.play=()=>Promise.resolve();

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 ready event timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);
window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
const detail=await ready;

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const tabs=[...window.document.querySelectorAll('.tab-v2')];
assert(tabs.length===5,`Expected 5 tabs, got ${tabs.length}`);
assert(tabs.map(x=>x.dataset.view).join(',')==='episodes,series,questions,nonquestions,playlists','Unexpected tab order');
assert(window.document.querySelectorAll('#episodes-v2 .card').length===data.episodes.length,'Episode cards not rendered');
assert(window.document.querySelectorAll('#questions-v2 .card').length===734,'Question cards not rendered');
assert(window.document.querySelectorAll('#series-v2 .series').length===data.series.length,'Series not rendered');
assert(Number(window.document.querySelector('#nonquestions-v2').dataset.count)>0,'Nonquestions not rendered');
assert(detail.episodes===data.episodes.length&&detail.questions===734,'Ready event has wrong counts');

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

console.log(JSON.stringify({ok:true,tabs:tabs.length,episodeCards:data.episodes.length,questionCards:734,series:data.series.length,nonquestions:Number(window.document.querySelector('#nonquestions-v2').dataset.count),searchVisible:visible},null,2));
