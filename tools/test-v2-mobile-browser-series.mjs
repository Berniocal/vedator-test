import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((request,response)=>{try{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname==='/'?'/v2.html':new URL(request.url,'http://127.0.0.1').pathname),file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)||!fs.existsSync(file)){response.writeHead(404);response.end('not found');return}response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(response)}catch(error){response.writeHead(500);response.end(String(error))}});
await new Promise(resolve=>server.listen(4175,'127.0.0.1',resolve));
const candidates=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean),executablePath=candidates.find(fs.existsSync);
assert(executablePath,'No Chrome/Chromium found');
const browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
await page.setRequestInterception(true);page.on('request',request=>request.url().startsWith('http://127.0.0.1:4175/')?request.continue():request.abort());
try{
  await page.goto('http://127.0.0.1:4175/v2.html',{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForFunction(()=>document.documentElement.dataset.vedatorV2Ready==='1',{timeout:15000});
  await page.click('.tab-v2[data-view="series"]');await new Promise(resolve=>setTimeout(resolve,100));
  const layout=await page.evaluate(()=>{const cards=[...document.querySelectorAll('#series-v2 .series')].slice(0,4).map(card=>{const r=card.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width}});const grid=document.querySelector('#series-v2').getBoundingClientRect();return{cards,grid:{left:grid.left,right:grid.right,width:grid.width},scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}});
  assert(layout.cards.length===4,'Need at least four series cards');
  const first=layout.cards.slice(0,3);assert(Math.max(...first.map(r=>r.top))-Math.min(...first.map(r=>r.top))<=3,`First three series are not on the same row: ${JSON.stringify(first)}`);
  assert(layout.cards[3].top>first[0].top+5,'Fourth series did not move to the next row');
  assert(first.every(r=>r.width>90&&r.width<130),`Series cards do not fit as three phone columns: ${JSON.stringify(first.map(r=>r.width))}`);
  assert(layout.scrollWidth<=layout.clientWidth+1,`Series grid causes horizontal overflow: ${layout.scrollWidth} > ${layout.clientWidth}`);
  await page.click('#series-v2 .series:first-child > summary');await new Promise(resolve=>setTimeout(resolve,80));
  const opened=await page.evaluate(()=>{const card=document.querySelector('#series-v2 .series:first-child'),grid=document.querySelector('#series-v2');const c=card.getBoundingClientRect(),g=grid.getBoundingClientRect();return{open:card.open,left:c.left,right:c.right,width:c.width,gridLeft:g.left,gridRight:g.right}});
  assert(opened.open,'Series did not open');assert(Math.abs(opened.left-opened.gridLeft)<=2&&Math.abs(opened.right-opened.gridRight)<=2,`Opened series should span the full row: ${JSON.stringify(opened)}`);
  console.log(JSON.stringify({ok:true,viewport:'390x844',seriesPerRow:3,collapsedWidths:first.map(r=>Math.round(r.width)),openedFullRow:true,overflow:false},null,2));
}finally{await page.close().catch(()=>{});await browser.close().catch(()=>{});await new Promise(resolve=>server.close(resolve))}
