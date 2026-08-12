(()=>{
  if(self.__vedatorSwV204Overlay)return;
  self.__vedatorSwV204Overlay=true;

  const OLD_CACHE='vedator-temata-v203';
  const NEW_CACHE='vedator-temata-v204';
  const VERSION='v204';

  // Starší sw.js dál odkazuje na v203. Přesměrováním CacheStorage jej bezpečně
  // necháme pracovat s novou cache, aniž bychom přepisovali jeho ostatní logiku.
  try{
    const nativeOpen=caches.open.bind(caches);
    const nativeKeys=caches.keys.bind(caches);
    const nativeDelete=caches.delete.bind(caches);
    const mapName=name=>name===OLD_CACHE?NEW_CACHE:name;

    caches.open=name=>nativeOpen(mapName(name));
    caches.delete=name=>nativeDelete(mapName(name));
    caches.keys=async()=>{
      const names=await nativeKeys();
      return names.map(name=>name===NEW_CACHE?OLD_CACHE:name);
    };
  }catch(error){
    console.warn('Nepodařilo se přesměrovat cache na v204.',error);
  }

  self.addEventListener('install',()=>self.skipWaiting());
  self.addEventListener('activate',event=>event.waitUntil((async()=>{
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients)client.postMessage({type:'VEDATOR_SW_UPDATED',version:VERSION});
  })()));
})();
