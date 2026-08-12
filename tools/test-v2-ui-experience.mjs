import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=fs.readFileSync('v2.html','utf8').replace('<script src="./app-v2.js" defer></script>','');
const app=fs.readFileSync('app-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const dom=new JSDOM(html,{url:'https://example.test/v2.html',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

window.localStorage.setItem('vedator-ui-theme-v1','dark');
window.matchMedia=query=>({matches:query.includes('dark'),media:query,addEventListener(){},removeEventListener(){}});
window.fetch=async()=>({ok:true,status:200,json:async()=>data});
window.HTMLMediaElement.prototype.play=()=>Promise.resolve();
window.HTMLMediaElement.prototype.pause=()=>{};
window.HTMLMediaElement.prototype.load=()=>{};
let scrollCall=null;
window.scrollTo=value=>{scrollCall=value};
Object.defineProperty(window,'scrollY',{value:0,writable:true,configurable:true});

const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('V2 ready event timeout')),5000);
  window.addEventListener('vedator-v2-ready',event=>{clearTimeout(timer);resolve(event.detail)},{once:true});
});
window.eval(app);
window.document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
await ready;

const themeButton=window.document.querySelector('#theme-toggle-v2');
assert(themeButton,'Theme button missing');
assert(window.document.documentElement.dataset.theme==='dark','Stored dark theme was not applied');
assert(themeButton.getAttribute('aria-pressed')==='true','Dark theme button state is wrong');
assert(themeButton.textContent.includes('☀'),'Dark theme should offer light-mode icon');
assert(window.document.querySelector('meta[name="theme-color"]')?.content==='#0b0e16','Dark theme-color missing');

themeButton.click();
assert(window.document.documentElement.dataset.theme==='light','Theme toggle did not switch to light');
assert(window.localStorage.getItem('vedator-ui-theme-v1')==='light','Theme preference was not persisted');
assert(window.document.querySelector('meta[name="theme-color"]')?.content==='#151b2f','Light theme-color missing');

themeButton.click();
window.document.querySelector('.language-v2 button[data-lang="cz"]').click();
assert(window.document.documentElement.dataset.theme==='dark','Language switch changed theme');
assert(themeButton.getAttribute('aria-label')==='Přepnout na světlý režim','Theme label did not follow CZ language');

const backTop=window.document.querySelector('#back-top-v2');
assert(backTop,'Back-to-top button missing');
window.scrollY=800;
window.dispatchEvent(new window.Event('scroll'));
assert(!backTop.classList.contains('hidden'),'Back-to-top did not appear after scrolling');
backTop.click();
assert(scrollCall&&scrollCall.top===0,'Back-to-top did not request scroll to top');

const styleText=[...window.document.querySelectorAll('style')].map(node=>node.textContent).join('\n');
assert(styleText.includes('html[data-theme="dark"]'),'Dark theme CSS missing');
assert(styleText.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'Mobile player grid CSS missing');
assert(styleText.includes('align-items:flex-end'),'Mobile bottom-sheet modal CSS missing');
assert(window.document.querySelectorAll('link[rel="stylesheet"]').length===0,'V2 unexpectedly added runtime stylesheet file');

const sourceHtml=fs.readFileSync('v2.html','utf8');
const externalScripts=[...sourceHtml.matchAll(/<script\s+[^>]*src="([^"]+)"/g)].map(match=>match[1]);
assert(externalScripts.length===1&&externalScripts[0]==='./app-v2.js',`Expected only app-v2.js runtime script, got ${externalScripts.join(', ')}`);

console.log(JSON.stringify({
  ok:true,
  themePersistence:true,
  languageAwareTheme:true,
  backToTop:true,
  mobilePlayerGrid:true,
  bottomSheetModals:true,
  runtimeScripts:externalScripts
},null,2));
