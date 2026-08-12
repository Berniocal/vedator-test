(()=>{
  const VEDATOR_SW_WRAPPER_VERSION='v211-startup-fast-1';
  const VEDATOR_BOOTSTRAP_VERSION='v211-startup-fast-1';
  const HAD_ACTIVE_WORKER=Boolean(self.registration.active);
  const OFFLINE_AUDIO_CACHE='vedator-offline-audio-v1';
  const OFFLINE_AUDIO_PATH='/__vedator_offline_audio__/';
  const CURRENT_APP_CACHE='vedator-temata-v204';
  // Uložíme si původní CacheStorage API ještě před overlayem. Overlay záměrně
  // přejmenovává v203 na v204, takže přes něj nelze spolehlivě poznat a odstranit
  // skutečně starou v203 cache.
  const nativeCacheKeys=caches.keys.bind(caches);
  const nativeCacheDelete=caches.delete.bind(caches);
  self.__vedatorSwWrapperVersion=VEDATOR_SW_WRAPPER_VERSION;
  self.__vedatorBootstrapVersion=VEDATOR_BOOTSTRAP_VERSION;

  const INSTALL_UI_FILES=['./theme-toggle.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./offline-audio.js','./player-actions.js','./playlist-editor-mobile.js','./startup-fast.js'];
  const originalAddAll=typeof Cache!=='undefined'?Cache.prototype.addAll:null;
  if(originalAddAll){
    const CORE_FILES=new Set(['index.html','manifest.webmanifest','icon.svg','theme-toggle.js','icon-192.png','icon-512.png','player-actions.js','offline-audio.js','playlist-editor-mobile.js','startup-fast.js']);
    Cache.prototype.addAll=function(requests){
      const core=[...(requests||[])].filter(request=>{
        try{
          const raw=typeof request==='string'?request:request.url;
          const url=new URL(raw,self.location.href);
          const name=url.pathname.split('/').pop();
          return url.pathname.endsWith('/vedator/')||CORE_FILES.has(name);
        }catch{return false}
      });
      return originalAddAll.call(this,core);
    };
  }

  const nativeAddEventListener=self.addEventListener.bind(self);
  const bootstrapKey=`vedator-bootstrap-${VEDATOR_BOOTSTRAP_VERSION}`;

  function responseFrom(response,body){
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.set('content-type','text/html; charset=utf-8');
    headers.set('cache-control','no-store');
    return new Response(body,{
      status:response.status,
      statusText:response.statusText,
      headers
    });
  }

  function removeAutomaticUpdater(html){
    const marker='window.__vedatorSwUpdater';
    const markerAt=html.indexOf(marker);
    if(markerAt<0)return html;
    const start=html.lastIndexOf('<script>',markerAt);
    const end=html.indexOf('</script>',markerAt);
    if(start<0||end<0)return html;
    return html.slice(0,start)+html.slice(end+'</script>'.length);
  }

  async function stabilizePageResponse(response){
    if(!response)return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();
    html=html.replace(/navigator\.serviceWorker\.register\((['"])(?:\.\/)?sw\.js\1\)/g,"navigator.serviceWorker.register('sw-fast.js')");
    html=removeAutomaticUpdater(html);
    html=html.replace(/<script[^>]*src=["'](?:\.\/)?offline-switch-fix\.js["'][^>]*><\/script>/gi,'');
    const beforeData='<script src="./data-backup.js" defer></script>';
    const offlineTag='<script src="./offline-audio.js" defer></script>';
    const actionsTag='<script src="./player-actions.js" defer></script>';
    const slovakTag='<script src="./slovak-ui.js" defer></script>';
    const playlistEditorTag='<script src="./playlist-editor-mobile.js" defer></script>';
    const startupFastTag='<script src="./startup-fast.js?v=20260812-1"></script>';
    if(!html.includes('startup-fast.js'))html=html.replace('</head>',startupFastTag+'</head>');
    if(!html.includes('offline-audio.js')){
      if(html.includes(actionsTag))html=html.replace(actionsTag,offlineTag+actionsTag);
      else html=html.includes(beforeData)?html.replace(beforeData,offlineTag+beforeData):html.replace('</body>',offlineTag+'</body>');
    }
    if(!html.includes('player-actions.js')){
      if(html.includes(offlineTag))html=html.replace(offlineTag,offlineTag+actionsTag);
      else html=html.includes(beforeData)?html.replace(beforeData,actionsTag+beforeData):html.replace('</body>',actionsTag+'</body>');
    }
    const actionsAt=html.indexOf(actionsTag);
    const offlineAt=html.indexOf(offlineTag);
    if(actionsAt>=0&&offlineAt>=0&&actionsAt<offlineAt){
      html=html.replace(actionsTag,'');
      html=html.replace(offlineTag,offlineTag+actionsTag);
    }
    if(!html.includes('playlist-editor-mobile.js')){
      if(html.includes(slovakTag))html=html.replace(slovakTag,slovakTag+playlistEditorTag);
      else html=html.includes(beforeData)?html.replace(beforeData,playlistEditorTag+beforeData):html.replace('</body>',playlistEditorTag+'</body>');
    }
    if(!html.includes('data-vedator-bootstrap-ready')){
      const marker=`<script data-vedator-bootstrap-ready>try{localStorage.setItem(${JSON.stringify(bootstrapKey)},'1')}catch{}</script>`;
      html=html.replace('</head>',marker+'</head>');
    }
    return responseFrom(response,html);
  }

  self.addEventListener=function(type,listener,options){
    if(type==='activate')return;
    if(type==='fetch'){
      return nativeAddEventListener('fetch',event=>{
        const wrappedEvent={
          request:event.request,
          respondWith(value){
            event.respondWith(Promise.resolve(value).then(stabilizePageResponse));
          }
        };
        return listener.call(self,wrappedEvent);
      },options);
    }
    return nativeAddEventListener(type,listener,options);
  };

  const importVersion=encodeURIComponent(VEDATOR_SW_WRAPPER_VERSION);
  importScripts(`./sw-v204-overlay.js?v=${importVersion}`);
  importScripts(`./sw-346-patch.js?v=${importVersion}`);
  importScripts(`./sw.js?v=${importVersion}`);
  self.addEventListener=nativeAddEventListener;

  function isOfflineAudioRequest(request){
    if(request.method!=='GET')return false;
    try{return new URL(request.url).pathname.includes(OFFLINE_AUDIO_PATH)}catch{return false}
  }

  function parseRange(value,size){
    const match=String(value||'').match(/^bytes=(\d*)-(\d*)$/i);
    if(!match||size<=0)return null;
    let start=match[1]?Number(match[1]):null;
    let end=match[2]?Number(match[2]):null;
    if(start===null&&end===null)return null;
    if(start===null){
      const suffix=Math.max(0,end||0);
      if(!suffix)return null;
      start=Math.max(0,size-suffix);
      end=size-1;
    }else{
      if(!Number.isFinite(start)||start<0||start>=size)return null;
      if(end===null||!Number.isFinite(end)||end>=size)end=size-1;
      if(end<start)return null;
    }
    return {start,end};
  }

  async function offlineAudioResponse(request){
    const cache=await caches.open(OFFLINE_AUDIO_CACHE);
    const cached=await cache.match(request.url);
    if(!cached)return new Response('Offline audio nenalezeno.',{status:404});
    const range=request.headers.get('range');
    if(!range)return cached;
    const blob=await cached.blob();
    const parsed=parseRange(range,blob.size);
    if(!parsed){
      return new Response(null,{
        status:416,
        headers:{'Content-Range':`bytes */${blob.size}`,'Accept-Ranges':'bytes'}
      });
    }
    const {start,end}=parsed;
    const part=blob.slice(start,end+1,blob.type||cached.headers.get('content-type')||'audio/mpeg');
    return new Response(part,{
      status:206,
      headers:{
        'Content-Type':part.type||'audio/mpeg',
        'Content-Length':String(part.size),
        'Content-Range':`bytes ${start}-${end}/${blob.size}`,
        'Accept-Ranges':'bytes',
        'Cache-Control':'no-store'
      }
    });
  }

  nativeAddEventListener('fetch',event=>{
    if(isOfflineAudioRequest(event.request))event.respondWith(offlineAudioResponse(event.request));
  });

  nativeAddEventListener('install',event=>event.waitUntil(
    caches.open('vedator-temata-v203').then(cache=>cache.addAll(INSTALL_UI_FILES))
  ));

  nativeAddEventListener('activate',event=>event.waitUntil((async()=>{
    // Mažeme jen staré aplikační cache Vedátoru. Offline audio a případné cache
    // jiných aplikací na stejném github.io originu zůstanou nedotčené.
    const names=await nativeCacheKeys();
    await Promise.all(names
      .filter(name=>name.startsWith('vedator-temata-')&&name!==CURRENT_APP_CACHE)
      .map(name=>nativeCacheDelete(name)));
    if(!HAD_ACTIVE_WORKER)await self.clients.claim();
  })()));
})();