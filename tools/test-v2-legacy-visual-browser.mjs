import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((request,response)=>{try{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname==='/'?'/v2.html':new URL(request.url,'http://127.0.0.1').pathname),file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)||!fs.existsSync(file)){response.writeHead(404);response.end('not found');return}response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(response)}catch(error){response.writeHead(500);response.end(String(error))}});
await new Promise(resolve=>server.listen(4176,'127.0.0.1',resolve));
const candidates=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean),executablePath=candidates.find(fs.existsSync);
assert(executablePath,'No Chrome/Chromium found');
const browser=await puppeteer.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
await page.setRequestInterception(true);
page.on('request',request=>request.url().startsWith('http://127.0.0.1:4176/')?request.continue():request.abort());
try{
  await page.goto('http://127.0.0.1:4176/v2.html',{waitUntil:'domcontentloaded',timeout:15000});
  await page.evaluate(()=>{
    localStorage.setItem('vedator-ui-language-v1','cz');
    localStorage.setItem('vedator-ui-theme-v1','dark');
    localStorage.setItem('vedatorPlaybackProgressV1',JSON.stringify({
      'episode-346':{currentTime:35,duration:100,completed:false,title:'test',updatedAt:Date.now()},
      'episode-347':{currentTime:100,duration:100,completed:true,title:'test',updatedAt:Date.now()}
    }));
  });
  await page.reload({waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForFunction(()=>document.documentElement.dataset.vedatorV2Ready==='1',{timeout:15000});
  await new Promise(resolve=>setTimeout(resolve,150));

  const result=await page.evaluate(()=>{
    const active=document.querySelector('.tab-v2.active'),card=document.querySelector('#episodes-v2 .episode-card-v2[data-episode="346"]'),badge=card?.querySelector('.listen-status.progress'),tag=card?.querySelector('.tag'),episodeTitle=card?.querySelector('h2');
    const activeStyle=active?getComputedStyle(active):null,badgeStyle=badge?getComputedStyle(badge):null,tagStyle=tag?getComputedStyle(tag):null,episodeTitleStyle=episodeTitle?getComputedStyle(episodeTitle):null;
    return{
      eyebrow:document.querySelector('#eyebrow-v2')?.textContent,
      heading:document.querySelector('#heading-v2')?.textContent,
      activeBackgroundImage:activeStyle?.backgroundImage||'',
      activeBackgroundColor:activeStyle?.backgroundColor||'',
      activeColor:activeStyle?.color||'',
      activeRadius:activeStyle?.borderRadius||'',
      badgeText:badge?.textContent||'',badgeRadius:badgeStyle?.borderRadius||'',
      tagText:tag?.textContent||'',tagBackground:tagStyle?.backgroundColor||'',
      episodeTitleClamp:episodeTitleStyle?.webkitLineClamp||'',
      hasEpisodeTimeline:Boolean(card?.querySelector('.episode-progress-v2')),
      scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth
    };
  });
  assert(result.eyebrow==='Neoficiální tematický katalog',`Unexpected eyebrow: ${result.eyebrow}`);
  assert(result.heading==='Vedátorský podcast podle témat',`Unexpected heading: ${result.heading}`);
  const activeFilled=result.activeBackgroundImage.includes('gradient')||(result.activeBackgroundColor&&result.activeBackgroundColor!=='rgba(0, 0, 0, 0)');
  assert(activeFilled,`Active tab has no filled background: ${JSON.stringify(result)}`);
  assert(result.activeColor==='rgb(255, 255, 255)',`Active tab should have white text: ${result.activeColor}`);
  assert(parseFloat(result.activeRadius)>=20,`Active tab is not pill-shaped: ${result.activeRadius}`);
  assert(result.badgeText.includes('Rozposloucháno')&&result.badgeText.includes('35 %'),`Bad progress badge: ${result.badgeText}`);
  assert(parseFloat(result.badgeRadius)>=20,`Progress badge is not pill-shaped: ${result.badgeRadius}`);
  assert(result.tagText&&result.tagBackground!=='rgba(0, 0, 0, 0)',`Purple keyword tag is not visibly styled: ${JSON.stringify(result)}`);
  assert(String(result.episodeTitleClamp)!=='2',`Episode title must stay unclamped: ${result.episodeTitleClamp}`);
  assert(!result.hasEpisodeTimeline,'Episode timeline should be absent');
  assert(result.scrollWidth<=result.clientWidth+1,`Visual parity caused horizontal overflow: ${result.scrollWidth} > ${result.clientWidth}`);

  await page.click('.tab-v2[data-view="series"]');await new Promise(resolve=>setTimeout(resolve,80));
  const seriesTitleClamp=await page.$eval('#series-v2 .series>summary>strong',node=>getComputedStyle(node).webkitLineClamp||'');
  assert(String(seriesTitleClamp)==='2',`Series title should clamp to two lines: ${seriesTitleClamp}`);
  await page.click('.tab-v2[data-view="episodes"]');await new Promise(resolve=>setTimeout(resolve,60));

  await page.click('#episodes-v2 .episode-card-v2[data-episode="346"] .play');
  await new Promise(resolve=>setTimeout(resolve,80));
  const collapseText=await page.$eval('#player-close-v2',node=>node.textContent);
  assert(collapseText==='↓',`Player should use down arrow, got ${collapseText}`);
  await page.click('#player-close-v2');await new Promise(resolve=>setTimeout(resolve,40));
  const collapsed=await page.evaluate(()=>({collapsed:document.querySelector('#player-v2').classList.contains('player-collapsed-v2'),expandHidden:document.querySelector('#player-expand-v2').hidden,expandText:document.querySelector('#player-expand-v2').textContent}));
  assert(collapsed.collapsed&&!collapsed.expandHidden&&collapsed.expandText==='↑',`Collapsed player state is wrong: ${JSON.stringify(collapsed)}`);
  await page.click('#player-expand-v2');await new Promise(resolve=>setTimeout(resolve,40));
  const expanded=await page.$eval('#player-v2',node=>!node.classList.contains('player-collapsed-v2'));
  assert(expanded,'Floating arrow did not expand player');

  fs.mkdirSync('mobile-browser-artifacts',{recursive:true});
  await page.screenshot({path:'mobile-browser-artifacts/legacy-visual-parity.png',fullPage:true});
  console.log(JSON.stringify({ok:true,viewport:'390x844',legacyHeader:true,purpleActivePills:true,legacyProgressBadge:true,noEpisodeTimeline:true,purpleTags:true,episodeTitleClamp:false,seriesTitleClamp:2,collapsiblePlayer:true},null,2));
}finally{await page.close().catch(()=>{});await browser.close().catch(()=>{});await new Promise(resolve=>server.close(resolve))}
