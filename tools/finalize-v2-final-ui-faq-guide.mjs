import fs from 'node:fs';

const appFile='app-v2.js';
const htmlFile='v2.html';
let app=fs.readFileSync(appFile,'utf8');
let html=fs.readFileSync(htmlFile,'utf8');
const APP_MARKER='/* V2_FINAL_UI_FAQ_GUIDE_V1 */';
const CSS_MARKER='/* V2_FINAL_UI_FAQ_GUIDE_CSS_V1 */';

function replaceRequired(source,oldValue,newValue,label){
  if(source.includes(newValue))return source;
  if(!source.includes(oldValue))throw new Error(`Final UI: missing ${label}`);
  return source.replace(oldValue,newValue);
}

if(!app.includes(APP_MARKER)){
  app=replaceRequired(
    app,
    "n.play.textContent=audio.paused?text('Přehrát','Prehrať'):text('Pauza','Pauza');",
    "n.play.textContent=audio.paused?'▶':'❚❚';n.play.title=audio.paused?text('Přehrát','Prehrať'):text('Pauza','Pauza');n.play.setAttribute('aria-label',n.play.title);",
    'player play/pause labels'
  );
  app=replaceRequired(
    app,
    "n.offline.textContent=currentOfflineRecord()?text('✓ Offline','✓ Offline'):text('📱 Offline','📱 Offline');",
    "if(!n.offline.dataset.busy)n.offline.textContent=currentOfflineRecord()?text('✓ Offline','✓ Offline'):text('📱 Offline','📱 Offline');",
    'offline sync label'
  );
  app=replaceRequired(
    app,
    "const url=current.episode.enclosure;if(!url)return;n.offline.disabled=true;n.help.textContent=text('Ukládám epizodu offline…','Ukladám epizódu offline…');",
    "const url=current.episode.enclosure;if(!url)return;n.offline.disabled=true;n.offline.dataset.busy='1';n.offline.textContent=text('Offline 0 %','Offline 0 %');n.help.textContent=text('Ukládám epizodu offline…','Ukladám epizódu offline…');",
    'offline start'
  );
  app=replaceRequired(
    app,
    "const blob=await response.blob(),cacheUrl=new URL(`./__vedator_offline_audio__/${encodeURIComponent(key)}.mp3`,location.href).href,cache=await caches.open(OFFLINE_CACHE);\n      await cache.put(cacheUrl,new Response(blob,{status:200,headers:{'Content-Type':response.headers.get('content-type')||blob.type||'audio/mpeg','Content-Length':String(blob.size),'Accept-Ranges':'bytes','X-Vedator-Original-Url':url}}));",
    "const total=Number(response.headers.get('content-length'))||0,type=response.headers.get('content-type')||'audio/mpeg',reader=response.body?.getReader();let blob,loaded=0;\n      if(reader){const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;if(total){const percent=Math.min(99,Math.floor(loaded/total*100));n.offline.textContent='Offline '+percent+' %';n.help.textContent=text('Ukládám offline: ','Ukladám offline: ')+finalFormatMb(loaded)+' / '+finalFormatMb(total)}else{n.offline.textContent=text('Ukládám…','Ukladám…');n.help.textContent=text('Ukládám offline: ','Ukladám offline: ')+finalFormatMb(loaded)}}blob=new Blob(chunks,{type})}else blob=await response.blob();n.offline.textContent='Offline 100 %';\n      const cacheUrl=new URL(`./__vedator_offline_audio__/${encodeURIComponent(key)}.mp3`,location.href).href,cache=await caches.open(OFFLINE_CACHE);\n      await cache.put(cacheUrl,new Response(blob,{status:200,headers:{'Content-Type':type||blob.type||'audio/mpeg','Content-Length':String(blob.size),'Accept-Ranges':'bytes','X-Vedator-Original-Url':url}}));",
    'offline response body'
  );
  app=replaceRequired(
    app,
    "}catch(error){console.warn(error);n.help.textContent=text('Offline uložení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.','Offline uloženie sa nepodarilo. Skontrolujte pripojenie a skúste to znova.')}finally{n.offline.disabled=false;syncPlayer()}",
    "}catch(error){console.warn(error);n.help.textContent=text('Offline uložení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.','Offline uloženie sa nepodarilo. Skontrolujte pripojenie a skúste to znova.')}finally{delete n.offline.dataset.busy;n.offline.disabled=false;syncPlayer()}",
    'offline finally'
  );
  app=replaceRequired(
    app,
    "function mobileEpisodePlaybackContext(episode){\n    const episodes=sortedParityEpisodes();",
    "function mobileEpisodePlaybackContext(episode){\n    const episodes=parityUi.episodeTopic==='all'&&!state.query.trim()?sortedParityEpisodes().slice().sort((a,b)=>(Number(a.number)||0)-(Number(b.number)||0)):sortedParityEpisodes();",
    'episode numeric navigation'
  );
  app=replaceRequired(
    app,
    "status.textContent=`${text('V2 načtena','V2 načítaná')}: ${state.data.episodes.length} ${text('epizod','epizód')}, ${state.data.questions.length} ${text('otázek','otázok')}.`;",
    "status.textContent='';",
    'loaded status text'
  );

  const insertion=app.indexOf('  async function start(){');
  if(insertion<0)throw new Error('Final UI: start() insertion point missing');
  const block=String.raw`  ${APP_MARKER}
  const finalFormatMb=bytes=>((Number(bytes)||0)/1048576).toFixed(1).replace('.',',')+' MB';
  let finalInstallPrompt=null;
  function finalIsStandalone(){return matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true}
  function finalInstallLabel(){return text('Instalovat','Inštalovať')}
  function finalSyncInstallButton(){const button=$('#install-v2');if(!button)return;button.textContent=finalInstallLabel();button.classList.toggle('hidden',finalIsStandalone())}
  async function finalInstallV2(){
    if(finalIsStandalone())return;
    if(finalInstallPrompt){const prompt=finalInstallPrompt;finalInstallPrompt=null;await prompt.prompt();try{await prompt.userChoice}catch{}finalSyncInstallButton();return}
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent||'');
    alert(ios?text('V Safari klepni na Sdílet a potom Přidat na plochu.','V Safari klepni na Zdieľať a potom Pridať na plochu.'):text('Pokud se instalační dialog neotevře, použij nabídku prohlížeče a zvol Nainstalovat aplikaci nebo Přidat na plochu.','Ak sa inštalačný dialóg neotvorí, použi ponuku prehliadača a zvoľ Nainštalovať aplikáciu alebo Pridať na plochu.'));
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();finalInstallPrompt=event;finalSyncInstallButton()});
  window.addEventListener('appinstalled',()=>{finalInstallPrompt=null;finalSyncInstallButton()});

  function finalCollectionNorm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/Hledání mimozemského života/gi,'Hľadanie mimozemského života').replace(/Rozhovory o vesmíru/gi,'Rozhovory o vesmíre').replace(/(?:Žiji|Žiju) vědu/gi,'Žijem vedu').replace(/Genetický speciál/gi,'Genetický špeciál').replace(/Vedátorský speciál/gi,'Vedátorský špeciál').replace(/Nobelovy ceny/gi,'Nobelove ceny').replace(/[^a-z0-9]+/g,' ').trim()}
  function finalCollectionRecord(ids){for(const id of ids){const record=state.collectionProgress[id];if(record&&typeof record==='object')return record}return null}
  function finalSeriesCollection(series){return finalCollectionRecord(['series:'+norm(series.name),'series:'+finalCollectionNorm(series.name),'series:'+finalCollectionNorm(seriesLabel(series))])}
  function finalSeriesItemRecord(collection,episode){if(!collection)return null;let absolute='';try{absolute=new URL(episode.enclosure,location.href).href}catch{}return collection.items?.['episode:'+episode.number]||collection.items?.['audio:'+absolute]||null}
  function finalHeard(record,start=0){return Boolean(record&&(record.completed||Number(record.percent)>0||Number(record.currentTime)>Number(record.start??start)+3))}
  function finalPercent(record,start=0){if(!record)return 0;if(record.completed)return 100;const direct=Number(record.percent);if(Number.isFinite(direct)&&direct>0)return Math.max(1,Math.min(99,Math.round(direct)));const duration=Number(record.duration)||0,current=Number(record.currentTime)||0,from=Number(record.start??start)||0;return duration>from?Math.max(1,Math.min(99,Math.round((current-from)/(duration-from)*100))):1}
  function finalClearCollectionNode(node){if(!node)return;node.classList.remove('v2-collection-progress-text','v2-collection-complete-text');node.style.removeProperty('--vedator-progress')}
  function finalApplyCollectionNode(node,record,start=0){finalClearCollectionNode(node);if(!finalHeard(record,start))return;if(record.completed){node.classList.add('v2-collection-complete-text');return}node.classList.add('v2-collection-progress-text');node.style.setProperty('--vedator-progress',finalPercent(record,start)+'%')}
  function finalSetCollectionTitle(title,items,recordFor){if(!title)return;title.classList.remove('v2-collection-title-active','v2-collection-title-complete');const heard=items.filter(item=>finalHeard(recordFor(item)));const complete=items.length>0&&items.every(item=>recordFor(item)?.completed);if(complete)title.classList.add('v2-collection-title-complete');else if(heard.length)title.classList.add('v2-collection-title-active')}
  function decorateLegacyCollectionsV2(){
    $$('#series-v2 .series[data-series-index]').forEach(card=>{const series=state.data?.series?.[Number(card.dataset.seriesIndex)];if(!series)return;const collection=finalSeriesCollection(series),items=(series.episodes||[]).map(number=>episodeByNumber(number)).filter(Boolean),recordFor=episode=>finalSeriesItemRecord(collection,episode);finalSetCollectionTitle(card.querySelector('summary strong'),items,recordFor);card.querySelectorAll('.series-item[data-item-index]').forEach(button=>{const episode=items[Number(button.dataset.itemIndex)];if(!episode)return;const copy=button.querySelector('span:last-child'),nodes=copy?.querySelectorAll('.person-name-v2,.episode-title-v2')||[];if(nodes.length)nodes.forEach(node=>finalApplyCollectionNode(node,recordFor(episode)));else finalApplyCollectionNode(copy,recordFor(episode))})});
    $$('#playlists-v2 .playlist-card[data-id]').forEach(card=>{const playlist=state.playlists.find(item=>String(item.id)===String(card.dataset.id));if(!playlist)return;const collection=state.collectionProgress['playlist:'+playlist.id]||null,refs=playlistRefs(playlist),recordFor=ref=>collection?.items?.['ref:'+ref]||null;finalSetCollectionTitle(card.querySelector('.playlist-title'),refs,recordFor);card.querySelectorAll('.playlist-open[data-ref]').forEach(button=>finalApplyCollectionNode(button.querySelector('b'),recordFor(button.dataset.ref),itemInfo(button.dataset.ref)?.start||0))});
  }
  const finalRenderSeries=renderSeries;renderSeries=function(...args){const result=finalRenderSeries(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalEnsureSeriesBody=ensureParitySeriesBody;ensureParitySeriesBody=function(...args){const result=finalEnsureSeriesBody(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalRenderPlaylists=renderPlaylists;renderPlaylists=function(...args){const result=finalRenderPlaylists(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalRefreshSeries=refreshSeriesProgress;refreshSeriesProgress=function(...args){const result=finalRefreshSeries(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  const finalRefreshPlaylists=refreshPlaylistProgress;refreshPlaylistProgress=function(...args){const result=finalRefreshPlaylists(...args);queueMicrotask(decorateLegacyCollectionsV2);return result};
  document.addEventListener('toggle',()=>queueMicrotask(decorateLegacyCollectionsV2),true);
  window.addEventListener('vedatorlanguagechange',()=>{finalSyncInstallButton();queueMicrotask(decorateLegacyCollectionsV2)});
  function installFinalUiV2(){document.querySelector('#parity-refresh-v2')?.remove();$('#install-v2')?.addEventListener('click',finalInstallV2);finalSyncInstallButton();queueMicrotask(decorateLegacyCollectionsV2)}

`;
  app=app.slice(0,insertion)+block+app.slice(insertion);
  app=replaceRequired(app,'installUiExperience();installFullParityUi();installPlaylistParity();applyStaticUi();','installUiExperience();installFullParityUi();installPlaylistParity();installFinalUiV2();applyStaticUi();','final install chain');
  fs.writeFileSync(appFile,app);
}else console.log('Final V2 UI runtime already present');

if(!html.includes('manifest-v2.webmanifest'))html=html.replace('<meta name="theme-color" content="#151b2f">','<meta name="theme-color" content="#151b2f">\n<link rel="manifest" href="./manifest-v2.webmanifest">\n<link rel="icon" href="./icon.svg" type="image/svg+xml">');
if(!html.includes('id="install-v2"'))html=html.replace('<div class="header-actions-v2">','<div class="header-actions-v2"><button id="install-v2" class="install-v2" type="button">Instalovat</button>');
if(!html.includes(CSS_MARKER)){
  const css=`\n${CSS_MARKER}\n.install-v2{min-height:38px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.14);color:#fff;border-radius:10px;padding:7px 11px;font-weight:850;cursor:pointer;white-space:nowrap}.install-v2:hover{background:rgba(255,255,255,.24)}.install-v2.hidden{display:none!important}\nhtml body .tab-v2.active,html body .topic-v2.active,html body .question-topic.active,html[data-theme="dark"] body .tab-v2.active,html[data-theme="dark"] body .topic-v2.active,html[data-theme="dark"] body .question-topic.active{background:#5b4bdb!important;border-color:#5b4bdb!important;color:#fff!important}\n.status-row{justify-content:flex-start!important}.status-row #count-v2{margin-right:auto;text-align:left}.status-row #status-v2:empty{display:none}.parity-refresh-v2{display:none!important}\n#series-v2:not(.hidden){display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start}#series-v2 .series{margin:0;min-width:0}\n.series-progress-label-v2,.series-progress-main-v2,.playlist-progress-main-v2,.series-item-status-v2,.playlist-item-status-v2{display:none!important}.series-progress-box-v2,.playlist-progress-box-v2{grid-template-columns:1fr!important;padding:0 0 10px!important}.series-resume-v2,.playlist-resume-v2{width:100%!important}.playlist-open{grid-template-columns:minmax(0,1fr)!important}\n.v2-collection-title-active{color:#d97706!important}.v2-collection-title-complete{color:#15803d!important}.v2-collection-progress-text{--vedator-heard:#16a34a;--vedator-unheard:#392b9b;background:linear-gradient(90deg,var(--vedator-heard) 0 var(--vedator-progress),var(--vedator-unheard) var(--vedator-progress) 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important}.v2-collection-complete-text{color:#15803d!important}html[data-theme="dark"] .v2-collection-title-active{color:#fbbf24!important}html[data-theme="dark"] .v2-collection-title-complete{color:#4ade80!important}html[data-theme="dark"] .v2-collection-progress-text{--vedator-heard:#4ade80;--vedator-unheard:#c4b5fd}html[data-theme="dark"] .v2-collection-complete-text{color:#4ade80!important}\n#player-play-v2{font-size:1.2rem!important;letter-spacing:-.08em}\n@media(max-width:900px){#series-v2:not(.hidden){grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){#series-v2:not(.hidden){grid-template-columns:1fr}.install-v2{min-height:36px;padding:5px 8px;font-size:.82rem}}\n`;
  html=html.replace('</style>',css+'\n</style>');
}
fs.writeFileSync(htmlFile,html);
console.log('Applied final V2 UI, install, offline progress, and legacy collection marking');
