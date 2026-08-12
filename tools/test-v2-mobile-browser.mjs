import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const root=process.cwd();
const artifactDir=path.join(root,'mobile-browser-artifacts');
fs.mkdirSync(artifactDir,{recursive:true});

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname==='/'?'/v2.html':new URL(request.url,'http://127.0.0.1').pathname);
    const file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){response.writeHead(404);response.end('not found');return}
    response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(response);
  }catch(error){response.writeHead(500);response.end(String(error))}
});
await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));

const browserCandidates=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const executablePath=browserCandidates.find(candidate=>fs.existsSync(candidate));
assert(executablePath,`No Chromium/Chrome executable found. Checked: ${browserCandidates.join(', ')}`);

const browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
await page.setRequestInterception(true);
page.on('request',request=>{
  const url=request.url();
  if(url.startsWith('http://127.0.0.1:4173/')||url.startsWith('data:')||url.startsWith('blob:'))request.continue();
  else request.abort();
});

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function channel(value){const v=value/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}
function rgb(value){const match=String(value).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);return match?[Number(match[1]),Number(match[2]),Number(match[3])]:null}
function contrast(a,b){const ca=rgb(a),cb=rgb(b);if(!ca||!cb)return 0;const lum=x=>.2126*channel(x[0])+.7152*channel(x[1])+.0722*channel(x[2]);const la=lum(ca),lb=lum(cb),hi=Math.max(la,lb),lo=Math.min(la,lb);return(hi+.05)/(lo+.05)}

try{
  await page.goto('http://127.0.0.1:4173/v2.html',{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForFunction(()=>document.documentElement.dataset.vedatorV2Ready==='1',{timeout:15000});
  await page.evaluate(()=>{document.documentElement.dataset.theme='dark';localStorage.setItem('vedator-ui-theme-v1','dark')});
  await sleep(80);

  const initialOverflow=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,bodyWidth:document.body.getBoundingClientRect().width}));
  assert(initialOverflow.scrollWidth<=initialOverflow.clientWidth+1,`Body horizontally overflows on mobile: ${initialOverflow.scrollWidth}px > ${initialOverflow.clientWidth}px`);

  const topics=await page.$$('.topic-v2');assert(topics.length>=2,'Need at least two episode topics in real browser');
  await topics[1].click();await sleep(80);
  const topicStyle=await page.evaluate(()=>{const el=document.querySelector('.topic-v2.active');const s=getComputedStyle(el);return{color:s.color,background:s.backgroundColor,scrollbar:getComputedStyle(document.querySelector('.parity-topics-v2')).scrollbarWidth}});
  const topicContrast=contrast(topicStyle.color,topicStyle.background);
  assert(topicContrast>=4.5,`Active dark topic contrast too low: ${topicContrast.toFixed(2)}:1 (${topicStyle.color} on ${topicStyle.background})`);
  assert(topicStyle.scrollbar==='none'||topicStyle.scrollbar==='',`Topic scrollbar still visible: ${topicStyle.scrollbar}`);
  await page.screenshot({path:path.join(artifactDir,'01-episodes-dark-topics.png'),fullPage:false});

  await page.click('.tab-v2[data-view="questions"]');await sleep(100);
  const actionLayout=await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('#questions-v2 .question-card')],card=cards.find(item=>item.querySelector('.question-more')&&item.querySelector('.deep-share'))||cards[0];
    if(!card)return null;const play=card.querySelector('.play')?.getBoundingClientRect(),more=card.querySelector('.question-more')?.getBoundingClientRect(),share=card.querySelector('.deep-share')?.getBoundingClientRect(),box=card.getBoundingClientRect();
    return{play:play&&{top:play.top,bottom:play.bottom,left:play.left,right:play.right},more:more&&{top:more.top,bottom:more.bottom,left:more.left,right:more.right},share:share&&{top:share.top,bottom:share.bottom,left:share.left,right:share.right},cardRight:box.right};
  });
  assert(actionLayout?.play&&actionLayout?.more&&actionLayout?.share,'Question action controls missing in real browser');
  assert(Math.max(actionLayout.play.top,actionLayout.more.top,actionLayout.share.top)-Math.min(actionLayout.play.top,actionLayout.more.top,actionLayout.share.top)<=3,'Question play/read-more/share do not stay on one row');
  assert(actionLayout.share.right<=actionLayout.cardRight+1,'Question share button overflows card');

  const visibleSearchWord=await page.evaluate(()=>{
    const texts=[...document.querySelectorAll('#questions-v2 .question-card h2')].map(node=>node.textContent||'');
    const words=texts.flatMap(value=>value.match(/[A-Za-zÁ-ž]{5,}/g)||[]).filter(word=>!['vedátorský','podcast'].includes(word.toLowerCase()));
    return words.sort((a,b)=>b.length-a.length)[0]||'';
  });
  assert(visibleSearchWord,'Could not derive visible-language question search word');
  const search=await page.$('#search-v2');await search.click({clickCount:3});await search.type(visibleSearchWord);await sleep(150);
  const marks=await page.$$eval('#questions-v2 mark.vedator-match',nodes=>nodes.length);
  assert(marks>0,`Real browser question search has no yellow highlight for visible term: ${visibleSearchWord}`);
  await page.screenshot({path:path.join(artifactDir,'02-questions-search-highlight.png'),fullPage:false});

  await page.click('.tab-v2[data-view="episodes"]');await sleep(80);await page.$eval('#search-v2',input=>{input.value='';input.dispatchEvent(new Event('input',{bubbles:true}))});await sleep(100);
  const episodePlay=await page.$('#episodes-v2 .episode-card-v2 .actions .play');assert(episodePlay,'Episode play button missing in real browser');await episodePlay.click();await sleep(180);
  const playerLayout=await page.evaluate(()=>{
    const shell=document.querySelector('#player-v2'),controls=document.querySelector('.player-controls'),ids=['player-prev-v2','player-back10-v2','player-play-v2','player-forward10-v2','player-next-v2','player-playlist-v2','player-offline-v2','player-download-v2','player-speed-v2'];
    const rects=Object.fromEntries(ids.map(id=>{const r=document.getElementById(id)?.getBoundingClientRect();return[id,r&&{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}]}));
    return{hidden:shell.classList.contains('hidden'),shell:shell.getBoundingClientRect().toJSON(),controls:{scrollWidth:controls.scrollWidth,clientWidth:controls.clientWidth},viewport:innerWidth,rects};
  });
  assert(!playerLayout.hidden,'Mobile player stayed hidden after play');
  assert(playerLayout.shell.left>=-1&&playerLayout.shell.right<=playerLayout.viewport+1,`Player shell overflows viewport: ${JSON.stringify(playerLayout.shell)}`);
  assert(playerLayout.controls.scrollWidth<=playerLayout.controls.clientWidth+1,`Player controls horizontally overflow: ${playerLayout.controls.scrollWidth} > ${playerLayout.controls.clientWidth}`);
  const primary=['player-prev-v2','player-back10-v2','player-play-v2','player-forward10-v2','player-next-v2'].map(id=>playerLayout.rects[id]);
  const secondary=['player-playlist-v2','player-offline-v2','player-download-v2','player-speed-v2'].map(id=>playerLayout.rects[id]);
  assert(primary.every(Boolean)&&secondary.every(Boolean),'Player controls missing in real browser');
  assert(Math.max(...primary.map(rect=>rect.top))-Math.min(...primary.map(rect=>rect.top))<=3,'Five primary player controls are not on one row');
  assert(Math.max(...secondary.map(rect=>rect.top))-Math.min(...secondary.map(rect=>rect.top))<=3,'Four secondary player controls are not on one row');
  assert(Math.min(...secondary.map(rect=>rect.top))>Math.min(...primary.map(rect=>rect.top)),'Secondary player controls did not move below primary controls');
  assert(primary.every(rect=>rect.width>=45),'Primary mobile player tap target too narrow');
  await page.screenshot({path:path.join(artifactDir,'03-mobile-player.png'),fullPage:false});

  const finalOverflow=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  assert(finalOverflow.scrollWidth<=finalOverflow.clientWidth+1,`Body overflows after player opens: ${finalOverflow.scrollWidth}px > ${finalOverflow.clientWidth}px`);

  console.log(JSON.stringify({ok:true,browser:path.basename(executablePath),viewport:'390x844',bodyOverflow:false,topicContrast:Number(topicContrast.toFixed(2)),topicScrollbarHidden:true,questionActionsOneRow:true,searchHighlight:true,visibleSearchWord,playerPrimaryRow:5,playerSecondaryRow:4,playerOverflow:false,screenshots:fs.readdirSync(artifactDir).sort()},null,2));
}finally{
  await page.close().catch(()=>{});await browser.close().catch(()=>{});await new Promise(resolve=>server.close(resolve));
}
