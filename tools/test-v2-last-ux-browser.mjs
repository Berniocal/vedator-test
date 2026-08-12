import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((request,response)=>{try{const url=new URL(request.url,'http://127.0.0.1'),pathname=url.pathname==='/'?'/v2.html':decodeURIComponent(url.pathname),file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)||!fs.existsSync(file)){response.writeHead(404);response.end('not found');return}response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(response)}catch(error){response.writeHead(500);response.end(String(error))}});
await new Promise(resolve=>server.listen(4178,'127.0.0.1',resolve));
const candidates=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean),executablePath=candidates.find(fs.existsSync);
assert(executablePath,'No Chrome/Chromium found');
const browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
await page.setRequestInterception(true);
page.on('request',request=>request.url().startsWith('http://127.0.0.1:4178/')?request.continue():request.abort());
try{
  await page.goto('http://127.0.0.1:4178/v2.html',{waitUntil:'domcontentloaded',timeout:15000});
  await page.evaluate(()=>{
    localStorage.setItem('vedator-ui-language-v1','cz');
    localStorage.setItem('vedator-ui-theme-v1','dark');
    localStorage.setItem('vedatorPlaybackProgressV1',JSON.stringify({'episode-344':{currentTime:22,duration:100,completed:false,title:'test',updatedAt:Date.now()}}));
  });
  await page.reload({waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForFunction(()=>document.documentElement.dataset.vedatorV2Ready==='1',{timeout:15000});
  await new Promise(resolve=>setTimeout(resolve,180));

  const initial=await page.evaluate(()=>{
    const card=document.querySelector('#episodes-v2 .episode-card-v2[data-episode="344"]');
    const title=card?.querySelector('h2'),meta=card?.querySelector('.meta'),more=card?.querySelector('.episode-more-v2');
    return{
      backText:document.querySelector('#back-top-v2')?.textContent||'',
      hasCard:Boolean(card),hasMore:Boolean(more),moreText:more?.textContent||'',
      shortText:card?.querySelector('.desc-v2')?.textContent||'',
      searchText:card?.dataset.search||'',
      titleSize:title?parseFloat(getComputedStyle(title).fontSize):0,
      metaSize:meta?parseFloat(getComputedStyle(meta).fontSize):0
    };
  });
  assert(initial.backText==='↑',`Back-to-top must stay plain arrow, got ${initial.backText}`);
  assert(initial.hasCard&&initial.hasMore,`Progress episode must still have Read more: ${JSON.stringify(initial)}`);
  assert(/Číst více|Čítať viac/.test(initial.moreText),`Bad read-more label: ${initial.moreText}`);
  assert(!initial.searchText.includes('podcast vznika'),`Sponsor tail leaked into search index: ${initial.searchText.slice(-160)}`);
  assert(initial.titleSize>=17,`Mobile episode title too small: ${initial.titleSize}px`);
  assert(initial.metaSize>=13,`Mobile episode meta too small: ${initial.metaSize}px`);

  await page.click('#episodes-v2 .episode-card-v2[data-episode="344"] .episode-more-v2');
  await new Promise(resolve=>setTimeout(resolve,80));
  const expanded=await page.evaluate(()=>{const card=document.querySelector('#episodes-v2 .episode-card-v2[data-episode="344"]');return{open:card?.classList.contains('episode-open-v2'),text:card?.querySelector('.desc-v2')?.textContent||'',button:card?.querySelector('.episode-more-v2')?.textContent||''}});
  assert(expanded.open,'Read more did not expand episode description');
  assert(expanded.text.length>initial.shortText.length+20,`Read more did not reveal more text: ${initial.shortText.length} -> ${expanded.text.length}`);
  assert(/Číst méně|Čítať menej/.test(expanded.button),`Read-more button did not switch to collapse: ${expanded.button}`);

  await page.click('#episodes-v2 .episode-card-v2[data-episode="344"] .play');
  await new Promise(resolve=>setTimeout(resolve,80));
  await page.click('#player-close-v2');
  await new Promise(resolve=>setTimeout(resolve,50));
  const collapsed=await page.evaluate(()=>({expandText:document.querySelector('#player-expand-v2')?.textContent||'',expandHidden:document.querySelector('#player-expand-v2')?.hidden,backText:document.querySelector('#back-top-v2')?.textContent||''}));
  assert(!collapsed.expandHidden&&collapsed.expandText.includes('♫')&&collapsed.expandText.includes('↑'),`Player expand control must be distinguishable: ${JSON.stringify(collapsed)}`);
  assert(collapsed.backText==='↑','Back-to-top arrow was changed by player collapse');

  await page.click('.tab-v2[data-view="series"]');
  await new Promise(resolve=>setTimeout(resolve,100));
  const series=await page.evaluate(()=>{
    const card=[...document.querySelectorAll('#series-v2 .series')].find(node=>/mimozem/i.test(node.textContent||'')),title=card?.querySelector('summary>strong'),style=title?getComputedStyle(title):null;
    return{found:Boolean(title),text:title?.textContent||'',whiteSpace:style?.whiteSpace||'',overflow:style?.overflow||'',textOverflow:style?.textOverflow||'',height:title?.clientHeight||0,lineHeight:style?parseFloat(style.lineHeight):0,scrollWidth:title?.scrollWidth||0,clientWidth:title?.clientWidth||0,fontSize:style?parseFloat(style.fontSize):0,docWidth:document.documentElement.scrollWidth,clientDocWidth:document.documentElement.clientWidth};
  });
  assert(series.found,`Long extraterrestrial-life series not found: ${JSON.stringify(series)}`);
  assert(series.whiteSpace==='nowrap'&&series.overflow==='hidden'&&series.textOverflow==='ellipsis',`Series title is not one-line ellipsis: ${JSON.stringify(series)}`);
  assert(series.lineHeight<=0||series.height<=series.lineHeight*1.35,`Series title uses more than one line: ${JSON.stringify(series)}`);
  assert(series.fontSize>=16,`Mobile series title too small: ${series.fontSize}px`);
  assert(series.docWidth<=series.clientDocWidth+1,`Horizontal overflow: ${series.docWidth} > ${series.clientDocWidth}`);

  fs.mkdirSync('mobile-browser-artifacts',{recursive:true});
  await page.screenshot({path:'mobile-browser-artifacts/last-ux-fixes.png',fullPage:true});
  console.log(JSON.stringify({ok:true,readMoreExpanded:true,progressEpisodeHasReadMore:true,backToTop:'↑',playerExpand:collapsed.expandText,seriesEllipsis:true,mobileTitlePx:initial.titleSize,mobileMetaPx:initial.metaSize},null,2));
}finally{await page.close().catch(()=>{});await browser.close().catch(()=>{});await new Promise(resolve=>server.close(resolve))}
