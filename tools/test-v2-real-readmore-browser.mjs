import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((request,response)=>{try{const url=new URL(request.url,'http://127.0.0.1'),pathname=url.pathname==='/'?'/v2.html':decodeURIComponent(url.pathname),file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)||!fs.existsSync(file)){response.writeHead(404);response.end('not found');return}response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(response)}catch(error){response.writeHead(500);response.end(String(error))}});
await new Promise(resolve=>server.listen(4181,'127.0.0.1',resolve));
const candidates=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean),executablePath=candidates.find(fs.existsSync);
assert(executablePath,'No Chrome/Chromium found');
const browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
await page.setRequestInterception(true);
page.on('request',request=>request.url().startsWith('http://127.0.0.1:4181/')?request.continue():request.abort());
try{
  await page.goto('http://127.0.0.1:4181/v2.html',{waitUntil:'domcontentloaded',timeout:15000});
  await page.evaluate(()=>{localStorage.setItem('vedator-ui-language-v1','cz');localStorage.setItem('vedator-ui-theme-v1','dark')});
  await page.reload({waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForFunction(()=>document.documentElement.dataset.vedatorV2Ready==='1',{timeout:15000});
  await new Promise(resolve=>setTimeout(resolve,180));

  const before=await page.evaluate(()=>{const card=document.querySelector('#episodes-v2 .episode-card-v2[data-episode="347"]'),desc=card?.querySelector('.desc-v2');return{found:Boolean(card),text:desc?.innerText||'',html:desc?.innerHTML||'',button:card?.querySelector('.episode-more-v2')?.textContent||'',search:card?.dataset.search||'',height:desc?.scrollHeight||0}});
  assert(before.found,'Episode 347 card not found');
  assert(/Číst více|Čítať viac/.test(before.button),`Episode 347 has no Read more: ${before.button}`);
  assert(!/Podcast vzniká/i.test(before.text),'Collapsed episode leaked sponsor tail');
  assert(!/herohero/i.test(before.search),'Herohero leaked into episode search index');
  assert(!/podcast vznika/i.test(before.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()),'Sponsor phrase leaked into search index');

  await page.click('#episodes-v2 .episode-card-v2[data-episode="347"] .episode-more-v2');
  await new Promise(resolve=>setTimeout(resolve,100));
  const expandedCs=await page.evaluate(()=>{const card=document.querySelector('#episodes-v2 .episode-card-v2[data-episode="347"]'),desc=card?.querySelector('.desc-v2'),style=desc?getComputedStyle(desc):null;return{open:card?.classList.contains('episode-open-v2'),text:desc?.innerText||'',html:desc?.innerHTML||'',button:card?.querySelector('.episode-more-v2')?.textContent||'',links:[...(desc?.querySelectorAll('a')||[])].map(a=>a.href),display:style?.display||'',lineClamp:style?.webkitLineClamp||'',height:desc?.scrollHeight||0}});
  assert(expandedCs.open,'Episode 347 did not enter expanded state');
  assert(/Podcast vzniká ve spolupráci se SME/i.test(expandedCs.text),`Czech full description missing SME paragraph: ${expandedCs.text.slice(0,500)}`);
  assert(/Bonusové epizody/i.test(expandedCs.text),'Czech full description missing promo paragraphs');
  assert(expandedCs.links.some(url=>url==='https://herohero.co/vedator'),'Herohero link is not preserved');
  assert(expandedCs.links.some(url=>url.includes('martinus.sk/3600333-limity-poznania')),'Martinus link is not preserved');
  assert(expandedCs.height>before.height+100,`Expanded description is still visually clamped: ${before.height} -> ${expandedCs.height}`);
  assert(expandedCs.display==='block',`Expanded description is not block layout: ${expandedCs.display}`);
  assert(expandedCs.lineClamp==='none'||expandedCs.lineClamp==='',`Expanded description still has line clamp: ${expandedCs.lineClamp}`);
  assert(/Číst méně|Čítať menej/.test(expandedCs.button),`Expanded button has wrong label: ${expandedCs.button}`);

  await page.click('#episodes-v2 .episode-card-v2[data-episode="347"] .episode-more-v2');
  await new Promise(resolve=>setTimeout(resolve,80));
  const collapsedAgain=await page.evaluate(()=>{const card=document.querySelector('#episodes-v2 .episode-card-v2[data-episode="347"]');return{text:card?.querySelector('.desc-v2')?.innerText||'',button:card?.querySelector('.episode-more-v2')?.textContent||''}});
  assert(!/Podcast vzniká/i.test(collapsedAgain.text),'Collapse did not hide full description');
  assert(/Číst více|Čítať viac/.test(collapsedAgain.button),'Collapse did not restore Read more label');

  await page.click('[data-lang="sk"]');
  await new Promise(resolve=>setTimeout(resolve,100));
  await page.click('#episodes-v2 .episode-card-v2[data-episode="347"] .episode-more-v2');
  await new Promise(resolve=>setTimeout(resolve,100));
  const expandedSk=await page.evaluate(()=>{const card=document.querySelector('#episodes-v2 .episode-card-v2[data-episode="347"]'),desc=card?.querySelector('.desc-v2');return{text:desc?.innerText||'',links:[...(desc?.querySelectorAll('a')||[])].map(a=>a.href)}});
  assert(/Podcast vzniká v spolupráci so SME/i.test(expandedSk.text),'Slovak full description missing original SME paragraph');
  assert(expandedSk.links.some(url=>url==='https://herohero.co/vedator'),'Slovak rich description lost Herohero link');

  fs.mkdirSync('mobile-browser-artifacts',{recursive:true});
  await page.screenshot({path:'mobile-browser-artifacts/real-episode-readmore-347.png',fullPage:true});
  console.log(JSON.stringify({ok:true,episode:347,czechFullDescription:true,slovakFullDescription:true,heroheroLink:true,martinusLink:true,searchTailExcluded:true,expandedHeight:expandedCs.height},null,2));
}finally{await page.close().catch(()=>{});await browser.close().catch(()=>{});await new Promise(resolve=>server.close(resolve))}
