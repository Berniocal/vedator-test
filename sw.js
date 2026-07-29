const OLD_CACHE=/^(?:vedator-test|vedator-temata)(?!.*-(?:sk|cs)$)/;
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(OLD_CACHE.test(key))await caches.delete(key);await self.clients.claim();await self.registration.unregister()})()));
