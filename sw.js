/* Kompaktní obal původní PWA Vedátor.
   Repozitář se nemění; aplikace je připnuta k jednomu neměnnému commitu. */
'use strict';

const SNAPSHOT='6676ceea283d5069bb1f17c4bf06886d0ad64815';
const REMOTE=`https://cdn.jsdelivr.net/gh/Berniocal/vedator@${SNAPSHOT}/`;
const SCOPE_URL=new URL(self.registration.scope);
const SCOPE_PATH=SCOPE_URL.pathname.endsWith('/')?SCOPE_URL.pathname:SCOPE_URL.pathname+'/';
const VIRTUAL_PREFIX=SCOPE_PATH+'_vedator/';
const LOCAL_FILES=new Set(['','index.html','manifest.webmanifest','icon-192.png','icon-512.png','sw.js']);

const networkFetch=self.fetch.bind(self);
const realAddEventListener=self.addEventListener.bind(self);
const realImportScripts=self.importScripts.bind(self);

function inputUrl(input){
  try{return new URL(typeof input==='string'?input:input.url,self.location.href)}
  catch{return null}
}

function relativeToScope(url){
  if(!url||url.origin!==self.location.origin||!url.pathname.startsWith(SCOPE_PATH))return null;
  return url.pathname.slice(SCOPE_PATH.length);
}

function remoteForVirtual(input){
  const url=inputUrl(input);
  if(!url||url.origin!==self.location.origin||!url.pathname.startsWith(VIRTUAL_PREFIX))return null;
  const relative=url.pathname.slice(VIRTUAL_PREFIX.length);
  return new URL(relative+url.search,REMOTE);
}

async function mappedFetch(input,init){
  const mapped=remoteForVirtual(input);
  if(!mapped)return networkFetch(input,init);

  if(input instanceof Request){
    const options={
      ...init,
      method:input.method,
      headers:input.headers,
      mode:'cors',
      credentials:'omit',
      redirect:'follow'
    };
    return networkFetch(mapped.href,options);
  }
  return networkFetch(mapped.href,{...init,mode:'cors',credentials:'omit',redirect:'follow'});
}

/* Importované původní service-workery používají fetch(). Tímto je přesměrujeme
   z virtuálních lokálních URL na neměnný snímek na CDN. */
self.fetch=mappedFetch;

/* Instalace nesmí selhat jen proto, že původní PWA očekává desítky fyzických
   souborů. Soubory se uloží pod virtuální lokální adresou. */
Cache.prototype.addAll=async function(requests){
  for(const item of [...(requests||[])]){
    try{
      const request=item instanceof Request
        ? item
        : new Request(new URL(String(item),self.registration.scope).href);
      const url=new URL(request.url);
      const relative=relativeToScope(url);
      let cacheKey=request;
      let response;

      if(relative!==null&&!LOCAL_FILES.has(relative)&&!relative.startsWith('_vedator/')){
        const target=new URL(relative+url.search,REMOTE);
        cacheKey=new Request(new URL('_vedator/'+relative+url.search,self.registration.scope).href);
        response=await networkFetch(target.href,{cache:'no-store',mode:'cors',credentials:'omit'});
      }else{
        response=await networkFetch(request,{cache:'no-store'});
      }

      if(response&&(response.ok||response.type==='opaque')){
        await this.put(cacheKey,response.clone());
      }
    }catch(error){
      console.warn('Vedátor: položku se při instalaci nepodařilo uložit.',error);
    }
  }
};

/* Původní fetch listener obsluhuje jen virtuální aplikaci. Lokální spouštěcí
   index, manifest a ikony zůstanou nedotčené. */
self.addEventListener=function(type,listener,options){
  if(type==='fetch'){
    return realAddEventListener('fetch',event=>{
      const url=new URL(event.request.url);
      const isLocalShell=url.origin===self.location.origin&&!url.pathname.startsWith(VIRTUAL_PREFIX);
      if(isLocalShell){
        event.respondWith((async()=>{
          try{
            return await networkFetch(event.request);
          }catch(error){
            return await caches.match(event.request)
              ||await caches.match(new URL('index.html',self.registration.scope))
              ||await caches.match(new URL('./',self.registration.scope))
              ||Promise.reject(error);
          }
        })());
        return;
      }
      return listener.call(self,event);
    },options);
  }
  return realAddEventListener(type,listener,options);
};

/* Relativní importScripts uvnitř vzdáleného obalu musí mířit ke stejnému
   připnutému commitu, ne do lokální složky. */
self.importScripts=(...urls)=>{
  const mapped=urls.map(value=>{
    const raw=String(value);
    if(/^https?:/i.test(raw))return raw;
    return new URL(raw,REMOTE).href;
  });
  return realImportScripts(...mapped);
};

realImportScripts(new URL('sw-fast.js',REMOTE).href);
self.importScripts=realImportScripts;

/* sw-346-patch.js už nyní obaluje mappedFetch. Přidáme poslední lokální
   úpravu: zachováme užitečné cache/optimalizace, ale odstraníme opravný
   mechanismus, který by mohl při startu znovu načítat stránku. */
const patchedFetch=self.fetch.bind(self);

function responseWithText(response,text,type){
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  if(type)headers.set('content-type',type);
  return new Response(text,{
    status:response.status,
    statusText:response.statusText,
    headers
  });
}

function removePageWorkerRegistration(html){
  return String(html||'').replace(
    /if\(\s*['"]serviceWorker['"]\s*in\s*navigator\s*\)\s*navigator\.serviceWorker\.register\(\s*['"](?:\.\/)?sw(?:-fast)?\.js['"]\s*\)\s*;?/g,
    ''
  );
}

function neutralizeFirstLoadRecovery(code){
  const source=String(code||'');
  const marker="\n  const SW_URL='./sw-fast.js';";
  const start=source.indexOf(marker);
  const close=source.lastIndexOf('})();');
  if(start<0||close<=start)return source;
  return source.slice(0,start)
    +"\n  // Kompaktní balíček už má aktivní lokální service worker; reload není potřeba.\n"
    +source.slice(close);
}

self.fetch=async function(input,init){
  const response=await patchedFetch(input,init);
  const url=inputUrl(input);
  if(!response||!url||url.origin!==self.location.origin||!url.pathname.startsWith(VIRTUAL_PREFIX)){
    return response;
  }

  const name=url.pathname.slice(VIRTUAL_PREFIX.length).split('/').pop();
  if(name==='first-load-recovery.js'){
    const code=neutralizeFirstLoadRecovery(await response.text());
    return responseWithText(response,code,'application/javascript; charset=utf-8');
  }

  const contentType=response.headers.get('content-type')||'';
  if(name==='index.html'||contentType.includes('text/html')){
    const html=removePageWorkerRegistration(await response.text());
    return responseWithText(response,html,'text/html; charset=utf-8');
  }

  return response;
};
