import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const playlist={id:'legacy-playlist',name:'Rozposlouchaný playlist',items:['FU','gA']};
const collection={
  'playlist:legacy-playlist':{
    type:'playlist',label:playlist.name,lastItemId:'ref:FU',updatedAt:1,
    items:{
      'ref:FU':{title:'Díl 340',currentTime:3600,duration:3600,start:0,end:null,percent:100,completed:true,updatedAt:1},
      'ref:gA':{title:'Otázka',currentTime:120,duration:3600,start:60,end:null,percent:35,completed:false,updatedAt:1}
    }
  }
};
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
window.localStorage.setItem('vedator-ui-language-v1','cz');
window.localStorage.setItem('vedator-user-playlists-v1',JSON.stringify([playlist]));
window.localStorage.setItem('vedatorCollectionProgressV1',JSON.stringify(collection));
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

const playlistTab=[...window.document.querySelectorAll('.tab-v2')].find(tab=>tab.dataset.view==='playlists');playlistTab.click();await new Promise(resolve=>setTimeout(resolve,20));
const card=window.document.querySelector('#playlists-v2 .playlist-card[data-id="legacy-playlist"]');
assert(card,'Playlist card missing');
const progress=card.querySelector('.playlist-progress-box-v2 progress');
assert(progress,'Playlist collection progress missing');
assert(Number(progress.value)>50&&Number(progress.value)<100,`Unexpected playlist progress ${progress.value}`);
const resume=card.querySelector('.playlist-resume-v2');
assert(resume,'Playlist continue button missing');
assert(resume.textContent.includes('Pokračovat'),'Playlist continue label missing');
assert(Number(resume.dataset.itemIndex)===1,'Playlist should resume on second item');
assert(card.querySelector('.playlist-item.done .playlist-item-status-v2')?.textContent==='✓','Completed playlist item status missing');
assert(card.querySelector('.playlist-item.progress .playlist-item-status-v2')?.textContent==='▶','In-progress playlist item status missing');

resume.click();await new Promise(resolve=>setTimeout(resolve,20));
assert(!window.document.querySelector('#player-v2').classList.contains('hidden'),'Playlist resume did not open player');
assert(window.document.querySelector('#player-sub-v2').textContent.includes('Playlist'),'Player did not enter playlist context');

const edit=card.querySelector('.edit');edit.click();await new Promise(resolve=>setTimeout(resolve,30));
const editor=window.document.querySelector('#playlist-editor-v2 .playlist-editor-mobile-v2');
assert(editor,'Mobile-enhanced playlist editor missing');
const workTabs=editor.querySelectorAll('.playlist-editor-work-tabs-v2 button');
assert(workTabs.length===2,'Mobile editor Added/Add switch missing');
assert(workTabs[0].textContent.includes('(2)'),'Mobile editor selected count missing');
assert(editor.querySelector('.editor-move'),'Playlist drag handle target missing');
assert(window.document.querySelector('style[data-v2-playlist-parity]')?.textContent.includes('touch-action:none'),'Mobile drag-handle CSS missing');

window.document.querySelector('.language-v2 [data-lang="sk"]').click();await new Promise(resolve=>setTimeout(resolve,20));
playlistTab.click();await new Promise(resolve=>setTimeout(resolve,20));
assert(window.document.querySelector('.playlist-resume-v2')?.textContent.includes('Pokračovať'),'Playlist continue label did not translate to Slovak');

console.log(JSON.stringify({ok:true,playlistProgress:Number(progress.value),resumeIndex:1,itemStatuses:true,continueButton:true,mobileEditorTabs:true,mobileDragHandle:true,translated:true},null,2));
