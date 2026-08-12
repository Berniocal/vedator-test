import fs from 'node:fs';

const appPath='app-v2.js';
const htmlPath='v2.html';
const marker='V2_LEGACY_VISUAL_PARITY_V1';

let app=fs.readFileSync(appPath,'utf8');
if(!app.includes(marker)){
  const patch=String.raw`

  /* V2_LEGACY_VISUAL_PARITY_V1 */
  const legacyVisualApplyStaticUi=applyStaticUi;
  applyStaticUi=function(){
    legacyVisualApplyStaticUi();
    document.title=text('Vedátorský podcast – podle témat','Vedátorský podcast – podľa tém');
    const eyebrow=$('#eyebrow-v2'),heading=$('#heading-v2');
    if(eyebrow)eyebrow.textContent=text('Neoficiální tematický katalog','Neoficiálny tematický katalóg');
    if(heading)heading.textContent=text('Vedátorský podcast podle témat','Vedátorský podcast podľa tém');
  };

  episodeProgressHtml=function(){return''};

  function legacyVisualSyncCollapseButton(){
    const button=$('#player-close-v2');
    if(!button)return;
    button.textContent='↓';
    button.title=text('Sbalit přehrávač','Zbaliť prehrávač');
    button.setAttribute('aria-label',button.title);
  }

  function legacyVisualSetPlayerCollapsed(collapsed){
    const shell=$('#player-v2'),expand=$('#player-expand-v2');
    if(!shell)return;
    const next=Boolean(collapsed)&&!shell.classList.contains('hidden');
    shell.classList.toggle('player-collapsed-v2',next);
    document.body.classList.toggle('player-collapsed-v2',next);
    if(expand)expand.hidden=!next;
  }

  function installLegacyVisualParity(){
    if(document.querySelector('style[data-v2-legacy-visual-parity]'))return;
    const style=document.createElement('style');
    style.dataset.v2LegacyVisualParity='1';
    style.textContent=[
      '.tab-v2.active,.topic-v2.active,.question-topic.active{background:linear-gradient(180deg,#55449a,#3f307b)!important;color:#fff!important;border-color:#8f80ff!important;font-weight:800!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),0 3px 10px rgba(91,75,219,.22)!important}',
      'html[data-theme="dark"] .tab-v2.active,html[data-theme="dark"] .topic-v2.active,html[data-theme="dark"] .question-topic.active{background:linear-gradient(180deg,#51408f,#3a2c70)!important;color:#fff!important;border-color:#9788ff!important}',
      '.listen-status{display:none!important;width:max-content;max-width:100%;min-height:0!important;margin:.08rem 0 .55rem!important;padding:4px 10px!important;border-radius:999px!important;border:1px solid transparent!important;font-size:.78rem!important;font-weight:850!important;line-height:1.15!important}',
      '.listen-status.done,.listen-status.progress{display:inline-flex!important;align-items:center!important;align-self:flex-start!important;gap:4px!important}',
      '.listen-status.done{background:#dcfce7!important;color:#166534!important;border-color:#bbf7d0!important}',
      '.listen-status.progress{background:#ede9fe!important;color:#5145b5!important;border-color:#c4b5fd!important}',
      'html[data-theme="dark"] .listen-status.done{background:#dcfce7!important;color:#166534!important;border-color:#bbf7d0!important}',
      'html[data-theme="dark"] .listen-status.progress{background:#ede9fe!important;color:#5145b5!important;border-color:#c4b5fd!important}',
      '.tags{display:flex!important;flex-wrap:wrap!important;gap:7px!important;margin:12px 0!important}',
      '.tag{display:inline-flex!important;align-items:center!important;width:auto!important;padding:4px 9px!important;border-radius:999px!important;border:1px solid #c4b5fd!important;background:#ede9fe!important;color:#5145b5!important;font-size:.76rem!important;line-height:1.2!important}',
      'html[data-theme="dark"] .tag{background:#2b2649!important;color:#c4b5fd!important;border-color:#5f50bd!important}',
      '.episode-card-v2 h2{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important;text-overflow:ellipsis!important;max-height:2.8em!important}',
      '#player-v2.player-collapsed-v2{display:none!important}',
      '#player-expand-v2{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:5200;width:48px;height:48px;border-radius:50%;border:1px solid var(--accent);background:var(--accent);color:#fff;box-shadow:var(--shadow-strong);font-size:1.35rem;font-weight:900;cursor:pointer;align-items:center;justify-content:center;padding:0}',
      '#player-expand-v2:not([hidden]){display:flex!important}',
      'body.player-collapsed-v2{padding-bottom:72px!important}',
      'body.player-collapsed-v2 .back-top-v2{bottom:76px!important}',
      '#player-close-v2{font-size:1.15rem!important;font-weight:900!important}',
      '@media(max-width:700px){#player-expand-v2{right:12px;bottom:12px;width:46px;height:46px}.episode-card-v2 h2{max-height:2.8em!important}}'
    ].join('');
    document.head.appendChild(style);
    if(!$('#player-expand-v2')){
      const expand=document.createElement('button');
      expand.id='player-expand-v2';expand.type='button';expand.hidden=true;expand.textContent='↑';
      expand.title=text('Rozbalit přehrávač','Rozbaliť prehrávač');expand.setAttribute('aria-label',expand.title);
      document.body.appendChild(expand);
    }
    legacyVisualSyncCollapseButton();
  }

  const legacyVisualSyncPlayer=syncPlayer;
  syncPlayer=function(...args){
    const result=legacyVisualSyncPlayer(...args);
    legacyVisualSyncCollapseButton();
    const expand=$('#player-expand-v2'),shell=$('#player-v2');
    if(expand&&shell&&shell.classList.contains('hidden')){expand.hidden=true;document.body.classList.remove('player-collapsed-v2');shell.classList.remove('player-collapsed-v2')}
    return result;
  };

  const legacyVisualOpenPlayback=openPlayback;
  openPlayback=function(...args){
    legacyVisualSetPlayerCollapsed(false);
    return legacyVisualOpenPlayback(...args);
  };

  const legacyVisualClosePlayer=closePlayer;
  closePlayer=function(...args){
    legacyVisualSetPlayerCollapsed(false);
    return legacyVisualClosePlayer(...args);
  };

  document.addEventListener('click',event=>{
    const collapse=event.target.closest?.('#player-close-v2');
    if(collapse){event.preventDefault();event.stopImmediatePropagation();legacyVisualSetPlayerCollapsed(true);return}
    const expand=event.target.closest?.('#player-expand-v2');
    if(expand){event.preventDefault();event.stopImmediatePropagation();legacyVisualSetPlayerCollapsed(false)}
  },true);

  window.addEventListener('vedatorlanguagechange',()=>{
    legacyVisualSyncCollapseButton();
    const expand=$('#player-expand-v2');
    if(expand){expand.title=text('Rozbalit přehrávač','Rozbaliť prehrávač');expand.setAttribute('aria-label',expand.title)}
  });

  installLegacyVisualParity();
`;
  const end='\n})();';
  const index=app.lastIndexOf(end);
  if(index<0)throw new Error('Could not find app-v2 IIFE end');
  app=app.slice(0,index)+patch+app.slice(index);
  fs.writeFileSync(appPath,app);
}

let html=fs.readFileSync(htmlPath,'utf8');
html=html
  .replace('<title>Vedátor V2 test</title>','<title>Vedátorský podcast – podle témat</title>')
  .replace('>Radikální testovací V2</div>','>Neoficiální tematický katalog</div>')
  .replace('>Vedátorský podcast</h1>','>Vedátorský podcast podle témat</h1>')
  .replace('<button id="player-close-v2" type="button">✕</button>','<button id="player-close-v2" type="button" aria-label="Sbalit přehrávač" title="Sbalit přehrávač">↓</button>');
fs.writeFileSync(htmlPath,html);

console.log('Applied V2 legacy visual parity');
