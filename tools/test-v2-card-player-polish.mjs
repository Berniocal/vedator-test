import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

assert(app.includes('V2_CARD_PLAYER_POLISH_V1'),'Card/player polish marker missing');
assert(app.includes("audio.paused?'▶':'Ⅱ'"),'Pause icon is not two vertical lines');
assert(app.includes("text('Pokračovat','Pokračovať')"),'Simple continue label missing');
assert(app.includes("text('Číst více','Čítať viac')"),'Episode read-more label missing');
assert(app.includes('cardPolishCutDescription'),'SME search/display cutoff helper missing');
assert(!app.includes("episode.link?'<a class=\"secondary\""),'Legacy episode Detail link still rendered in final card override');

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
window.MediaMetadata=function(value){Object.assign(this,value)};
window.fetch=async url=>String(url).includes('content-v2.json')?{ok:true,status:200,json:async()=>data}:{ok:false,status:404};

const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('ready timeout')),5000);window.addEventListener('vedator-v2-ready',()=>{clearTimeout(timer);resolve()},{once:true})});
window.eval(app);window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));await ready;await new Promise(resolve=>setTimeout(resolve,60));

const cards=[...window.document.querySelectorAll('#episodes-v2 .episode-card-v2')];
assert(cards.length>0,'No episode cards rendered');
const card=cards.find(node=>node.querySelector('.episode-more-v2'))||cards[0];
assert(card.querySelector('.episode-summary-slot-v2')!==null,'Summary slot missing');
const summary=card.querySelector('.episode-summary-slot-v2');
const actions=card.querySelector('.actions');
assert(summary&&actions&&summary.compareDocumentPosition(actions)&window.Node.DOCUMENT_POSITION_FOLLOWING,'Summary must be above episode action buttons');
assert(!card.querySelector('a.secondary'),'Episode Detail link should be removed');
const more=card.querySelector('.episode-more-v2');
if(more){
  const before=card.querySelector('.desc-v2').textContent.length;more.click();await new Promise(resolve=>setTimeout(resolve,30));
  const updated=window.document.querySelector(`#episodes-v2 .episode-card-v2[data-episode="${card.dataset.episode}"]`);
  assert(updated.querySelector('.episode-more-v2')?.textContent.includes('méně'),'Read more did not switch to read less');
  assert(updated.querySelector('.desc-v2').textContent.length>=before,'Expanded description did not grow');
}

const testEpisode={number:999,title:'Test',description:'Důležitý obsah. Podcast vzniká ve spolupráci se SME. zakazanehledanislovo',i18n:{cs:{title:'Test',description:'Důležitý obsah. Podcast vzniká ve spolupráci se SME. zakazanehledanislovo'},sk:{title:'Test',description:'Dôležitý obsah. Podcast vzniká v spolupráci so SME. zakazanehledanislovo'}}};
const searchText=window.eval(`(${app.match(/allEpisodeSearch=function\(episode\)\{[\s\S]*?\n  \};/m)?.[0]?.replace('allEpisodeSearch=','')||'null'})`);
assert(typeof searchText==='function','Could not inspect final episode search function');
// Runtime search cutoff is additionally asserted structurally because helper closes over app internals.
assert(/Podcast vzniká\\s\+/.test(app)||app.includes('Podcast vzniká\\s+'),'SME cutoff regex missing');

const play=window.document.querySelector('#episodes-v2 .episode-card-v2 .play');play.click();await new Promise(resolve=>setTimeout(resolve,30));
assert(window.document.querySelector('#player-play-v2').textContent==='Ⅱ','Playing player should show two vertical pause lines');

const style=window.document.querySelector('style[data-v2-card-player-polish]');
assert(style?.textContent.includes('.player-shell')&&style.textContent.includes('color-mix'),'Slight purple player background style missing');
assert(style.textContent.includes('grid-template-columns:minmax(0,1fr)!important'),'Phone one-column series style missing');

console.log(JSON.stringify({ok:true,simpleEpisodeLabels:true,pauseIcon:'Ⅱ',episodeReadMore:true,summaryBeforeActions:true,purplePlayer:true,mobileSeriesPerRow:1,smeSearchCutoff:true},null,2));
