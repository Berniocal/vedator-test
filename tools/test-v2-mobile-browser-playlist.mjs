import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const root=process.cwd(),artifactDir=path.join(root,'mobile-browser-artifacts');fs.mkdirSync(artifactDir,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer((request,response)=>{try{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname==='/'?'/v2.html':new URL(request.url,'http://127.0.0.1').pathname),file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)||!fs.existsSync(file)){response.writeHead(404);response.end();return}response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(response)}catch(error){response.writeHead(500);response.end(String(error))}});
await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
const executablePath=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);assert(executablePath,'No Chrome/Chromium found');
const browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
await page.setRequestInterception(true);page.on('request',request=>request.url().startsWith('http://127.0.0.1:4174/')?request.continue():request.abort());
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
  await page.goto('http://127.0.0.1:4174/v2.html',{waitUntil:'domcontentloaded',timeout:15000});await page.waitForFunction(()=>document.documentElement.dataset.vedatorV2Ready==='1',{timeout:15000});
  await page.evaluate(()=>{localStorage.setItem('vedator-user-playlists-v1',JSON.stringify([{id:'mobile-test',name:'Můj opravdu dlouhý testovací playlist',items:['FU','gA','FV','FW']}]))});
  await page.click('.tab-v2[data-view="playlists"]');await sleep(120);
  const card=await page.$('#playlists-v2 .playlist-card');assert(card,'Seeded playlist did not render');
  const cardMetrics=await page.evaluate(()=>{const card=document.querySelector('#playlists-v2 .playlist-card'),r=card.getBoundingClientRect();return{left:r.left,right:r.right,width:r.width,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}});
  assert(cardMetrics.left>=0&&cardMetrics.right<=cardMetrics.viewport+1,`Playlist card overflows: ${JSON.stringify(cardMetrics)}`);assert(cardMetrics.scrollWidth<=cardMetrics.viewport+1,`Playlist page horizontally overflows: ${cardMetrics.scrollWidth}>${cardMetrics.viewport}`);
  await page.click('#playlists-v2 .playlist-card .edit');await sleep(120);
  const modalMetrics=await page.evaluate(()=>{const modal=document.querySelector('#playlist-editor-v2'),box=modal.querySelector('.modal-box'),tabs=box.querySelector('.playlist-editor-work-tabs-v2'),columns=box.querySelector('.editor-columns'),handle=box.querySelector('.editor-move'),r=box.getBoundingClientRect(),ts=getComputedStyle(tabs),cs=getComputedStyle(columns),hs=handle&&getComputedStyle(handle);return{hidden:modal.classList.contains('hidden'),left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,viewportW:innerWidth,viewportH:innerHeight,docWidth:document.documentElement.scrollWidth,tabsDisplay:ts.display,tabsButtons:tabs.querySelectorAll('button').length,columns:cs.gridTemplateColumns,handleWidth:handle?.getBoundingClientRect().width||0,handleCursor:hs?.cursor||''}});
  assert(!modalMetrics.hidden,'Playlist editor modal stayed hidden');assert(modalMetrics.left>=-1&&modalMetrics.right<=modalMetrics.viewportW+1,`Playlist modal horizontal overflow: ${JSON.stringify(modalMetrics)}`);assert(modalMetrics.docWidth<=modalMetrics.viewportW+1,`Document overflows with playlist modal: ${modalMetrics.docWidth}>${modalMetrics.viewportW}`);assert(modalMetrics.tabsDisplay==='grid'&&modalMetrics.tabsButtons===2,'Mobile playlist work tabs are not visible');assert(modalMetrics.handleWidth>=28,'Mobile drag handle is too small');
  await page.click('.playlist-editor-work-tabs-v2 [data-editor-section="add"]');await sleep(60);
  const sections=await page.evaluate(()=>[...document.querySelectorAll('.playlist-editor-mobile-v2 .editor-columns>section')].map(section=>getComputedStyle(section).display));assert(sections[0]==='none'&&sections[1]!=='none',`Playlist Add tab did not switch sections: ${sections.join(',')}`);
  await page.screenshot({path:path.join(artifactDir,'04-playlist-editor.png'),fullPage:false});
  console.log(JSON.stringify({ok:true,viewport:'390x844',playlistCardFits:true,editorFits:true,workTabs:true,dragHandle:true,addSectionSwitch:true},null,2));
}finally{await page.close().catch(()=>{});await browser.close().catch(()=>{});await new Promise(resolve=>server.close(resolve))}
