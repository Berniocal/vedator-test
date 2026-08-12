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
  const layout=await page.evaluate(()=>{const cards=[...document.querySelectorAll('#series-v2 .series')].slice(0,3).map(card=>{const r=card.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width}});const grid=document.querySelector('#series-v2').getBoundingClientRect();return{cards,grid:{left:grid.left,right:grid.right,width:grid.width},scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}});
  assert(layout.cards.length===3,'Need at least three series cards');
  assert(layout.cards[1].top>layout.cards[0].top+5&&layout.cards[2].top>layout.cards[1].top+5,`Series should be one per phone row: ${JSON.stringify(layout.cards)}`);
  assert(layout.cards.every(card=>Math.abs(card.width-layout.grid.width)<=3),`Series cards should use full phone row: ${JSON.stringify(layout.cards)}`);
  assert(layout.scrollWidth<=layout.clientWidth+1,`Series grid causes horizontal overflow: ${layout.scrollWidth} > ${layout.clientWidth}`);
  console.log(JSON.stringify({ok:true,viewport:'390x844',seriesPerRow:1,fullWidth:true,overflow:false},null,2));
}finally{await page.close().catch(()=>{});await browser.close().catch(()=>{});await new Promise(resolve=>server.close(resolve))}
