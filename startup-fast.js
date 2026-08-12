(()=>{
  if(window.__vedatorStartupFastPath)return;
  window.__vedatorStartupFastPath=true;

  // Díl 346 je už doplňován service workerem do questions-view.js.
  // Tímto vypneme starší cestu, která questions-view.js znovu stahovala přes cache:no-store,
  // upravovala jeho text za běhu a spouštěla ho znovu.
  window.__vedatorEpisode346DirectRuntime=true;

  const EPISODES_KEY='vedatorEpisodes';
  const nativeFetch=window.fetch.bind(window);
  let refreshScheduled=false;
  let forceNetworkOnce=false;

  function isEpisodesRequest(input){
    try{
      const raw=typeof input==='string'?input:input?.url;
      if(!raw)return false;
      const url=new URL(raw,location.href);
      return url.origin===location.origin&&url.pathname.endsWith('/episodes.json');
    }catch{return false}
  }

  function cachedEpisodes(){
    try{
      const raw=localStorage.getItem(EPISODES_KEY);
      if(!raw)return null;
      const data=JSON.parse(raw);
      const items=Array.isArray(data)?data:data?.episodes;
      return Array.isArray(items)&&items.length?{raw,items}:null;
    }catch{return null}
  }

  function scheduleNetworkRefresh(){
    if(refreshScheduled)return;
    refreshScheduled=true;
    const run=async()=>{
      try{
        const response=await nativeFetch(`./episodes.json?v=${Date.now()}`,{cache:'no-store'});
        if(!response.ok)return;
        const data=await response.json();
        const items=Array.isArray(data)?data:data?.episodes;
        if(!Array.isArray(items)||!items.length)return;
        const raw=JSON.stringify(items);
        if(localStorage.getItem(EPISODES_KEY)!==raw)localStorage.setItem(EPISODES_KEY,raw);
      }catch{}
    };
    const afterLoad=()=>{
      if('requestIdleCallback'in window)requestIdleCallback(()=>void run(),{timeout:2500});
      else setTimeout(()=>void run(),1200);
    };
    if(document.readyState==='complete')afterLoad();
    else window.addEventListener('load',afterLoad,{once:true});
  }

  // Ruční „Znovu načíst“ musí stále opravdu sáhnout na síť.
  document.addEventListener('click',event=>{
    if(event.target?.closest?.('#refresh'))forceNetworkOnce=true;
  },true);

  window.fetch=function(input,init){
    if(!isEpisodesRequest(input))return nativeFetch(input,init);
    if(forceNetworkOnce){
      forceNetworkOnce=false;
      return nativeFetch(input,init);
    }
    const cached=cachedEpisodes();
    if(!cached)return nativeFetch(input,init);
    scheduleNetworkRefresh();
    return Promise.resolve(new Response(cached.raw,{
      status:200,
      headers:{'Content-Type':'application/json; charset=utf-8','X-Vedator-Cache':'startup'}
    }));
  };
})();