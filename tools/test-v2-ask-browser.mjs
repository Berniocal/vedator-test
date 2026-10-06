
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import puppeteer from 'puppeteer-core';import assert from 'node:assert/strict';
const root=process.cwd(),errors=[];
const server=http.createServer((req,res)=>{const p=path.join(root,new URL(req.url,'http://localhost').pathname);if(!fs.existsSync(p)){res.writeHead(404);res.end();return}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(p))});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const executablePath=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&fs.existsSync(p));
const browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.setRequestInterception(true);page.on('request',r=>r.url().startsWith(base)?r.continue():r.abort());
 await page.evaluateOnNewDocument(()=>localStorage.setItem('vedator-ui-language-v1','cz'));
 await page.goto(base+'/v2.html#ask');await page.waitForSelector('#ask-form-v2');
 assert.equal(await page.$eval('.tab-v2.active',e=>e.dataset.view),'ask');
 await page.type('#ask-input-v2','kolik váží Slunce');await page.click('#ask-submit-v2');await page.waitForSelector('.ask-card-v2');
 for(const width of [390,320,1280]){
  await page.setViewport({width,height:844,isMobile:true,hasTouch:true});
  const dimensions=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(dimensions.scroll<=dimensions.width+1,'Page overflow at '+width+': '+JSON.stringify(dimensions));
 }
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.evaluate(()=>{document.documentElement.dataset.theme='dark';document.querySelector('.tab-v2[data-view=ask]').scrollIntoView({block:'nearest',inline:'center'})});await new Promise(r=>setTimeout(r,250));
 fs.mkdirSync('mobile-browser-artifacts',{recursive:true});await page.screenshot({path:'mobile-browser-artifacts/ask-mobile.png',fullPage:false});
 await page.click('.ask-card-v2 [data-ask-answer]');assert.equal(await page.$eval('.ask-card-v2 [data-ask-answer]',e=>e.getAttribute('aria-expanded')),'true');
 await page.click('.ask-card-v2 a');await page.waitForFunction(()=>['questions','nonquestions'].includes(document.querySelector('.tab-v2.active').dataset.view));
 await page.evaluate(()=>document.querySelector('.tab-v2[data-view="ask"]').click());
 assert.equal(await page.$eval('#ask-input-v2',e=>e.value),'kolik váží Slunce');
 await page.click('[data-lang="sk"]');assert.equal(await page.$eval('#ask-submit-v2',e=>e.textContent),'Hľadať odpoveď');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,widths:[320,390,1280],mobileReadMore:true,catalogLink:true,queryRetained:true,languageSwitch:true,errors}));
}finally{await browser.close();await new Promise(r=>server.close(r))}

