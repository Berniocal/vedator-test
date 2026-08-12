(()=>{
  if(window.__vedatorViewLayoutFix)return;
  window.__vedatorViewLayoutFix=true;

  const topics=document.querySelector('#topics');
  const tabs=document.querySelector('.tabs');
  if(!topics||!tabs)return;

  function isEpisodesTab(tab){
    if(!tab)return false;
    const view=String(tab.dataset.view||'').toLowerCase();
    const text=String(tab.textContent||'').trim().toLowerCase();
    return view==='episodes'||text==='epizódy'||text==='epizody';
  }

  function sync(){
    const show=isEpisodesTab(tabs.querySelector('.tab.active'));
    topics.classList.toggle('hidden',!show);
    topics.hidden=!show;
    topics.style.display=show?'':'none';
    topics.setAttribute('aria-hidden',String(!show));
  }

  tabs.addEventListener('click',()=>setTimeout(sync,0));
  new MutationObserver(sync).observe(tabs,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
  sync();

  const PLAYLIST_KEY='vedator-user-playlists-v1';
  const CLEAR_NOTICE_KEY='vedatorDataClearedNoticeV1';
  const STORAGE_PREFIX='vedator';
  const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const loadPlaylists=()=>{
    try{
      const value=JSON.parse(localStorage.getItem(PLAYLIST_KEY)||'[]');
      return Array.isArray(value)?value:[];
    }catch{return []}
  };
  const episodeList=()=>{try{return Array.isArray(episodes)?episodes:[]}catch{return []}};
  const episodeId=episode=>String(episode?.id||episode?.number||episode?.title||'');
  const encodeNumber=value=>Number.isInteger(value)&&value>=0&&value<4096
    ? ALPHABET[(value>>6)&63]+ALPHABET[value&63]
    : '';
  const decodeNumber=value=>typeof value==='string'&&value.length===2
    ? ((ALPHABET.indexOf(value[0])<<6)|ALPHABET.indexOf(value[1]))
    : -1;
  const normalizeReference=value=>{
    if(typeof value==='string'&&value.length===2&&decodeNumber(value)>=0)return value;
    const episode=episodeList().find(item=>episodeId(item)===String(value));
    return episode?encodeNumber(Number(episode.number)):'';
  };
  function base64Encode(value){
    const bytes=new TextEncoder().encode(value);
    let binary='';
    bytes.forEach(byte=>binary+=String.fromCharCode(byte));
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function playlistUrl(playlist){
    const items=(playlist.items||[]).map(normalizeReference).filter(Boolean).join('');
    const payload=base64Encode(JSON.stringify({v:3,n:playlist.name,x:items}));
    const url=new URL(location.href);
    url.hash=`playlist=${payload}`;
    return url.href;
  }
  async function shareUrlOnly(playlist){
    const url=playlistUrl(playlist);
    try{
      if(navigator.share){
        await navigator.share({url});
        return;
      }
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(url);
        alert('Odkaz byl zkopírován.');
        return;
      }
    }catch(error){
      if(error?.name==='AbortError')return;
    }
    prompt('Zkopírujte odkaz:',url);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.vedator-playlist-icon.share');
    if(!button)return;
    const card=button.closest('[data-id]');
    const playlist=loadPlaylists().find(item=>String(item.id)===String(card?.dataset.id));
    if(!playlist)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void shareUrlOnly(playlist);
  },true);

  const language=()=>{
    try{if(typeof window.vedatorUiLanguage==='function')return window.vedatorUiLanguage()==='cz'?'cz':'sk'}catch{}
    return document.documentElement.lang==='cs'?'cz':'sk';
  };
  const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};
  const setHtml=(node,value)=>{if(node&&node.innerHTML!==value)node.innerHTML=value};
  const plural=(number,one,few,many)=>{
    const value=Math.abs(Number(number)||0);
    if(value===1)return one;
    if(value>=2&&value<=4)return few;
    return many;
  };

  const optionLabels={
    default:{sk:'Vlastné poradie',cz:'Vlastní pořadí'},
    started:{sk:'Rozpočúvané ako prvé',cz:'Rozposlouchané první'},
    completed:{sk:'Vypočuté ako prvé',cz:'Poslechnuté první'},
    unheard:{sk:'Nevypočuté ako prvé',cz:'Neposlechnuté první'}
  };
  const collectionLabels=[
    {test:/^(?:Začít sérii|Začať sériu)$/i,sk:'Začať sériu',cz:'Začít sérii'},
    {test:/^(?:Začít playlist|Začať playlist)$/i,sk:'Začať playlist',cz:'Začít playlist'},
    {test:/^(?:Pokračovat v sérii|Pokračovať v sérii)$/i,sk:'Pokračovať v sérii',cz:'Pokračovat v sérii'},
    {test:/^(?:Pokračovat v playlistu|Pokračovať v playliste)$/i,sk:'Pokračovať v playliste',cz:'Pokračovat v playlistu'},
    {test:/^(?:Přehrát sérii znovu|Prehrať sériu znova)$/i,sk:'Prehrať sériu znova',cz:'Přehrát sérii znovu'},
    {test:/^(?:Přehrát playlist znovu|Prehrať playlist znova)$/i,sk:'Prehrať playlist znova',cz:'Přehrát playlist znovu'}
  ];

  function translateDataView(lang){
    const sk=lang==='sk';
    const cards=[...document.querySelectorAll('.vedator-data-card')];
    const backup=cards[0];
    if(backup){
      setText(backup.querySelector('h2'),sk?'Záloha dát aplikácie':'Záloha dat aplikace');
      setText(backup.querySelector('p'),sk
        ?'Uložte si rozpočúvané a vypočuté epizódy spolu s vlastnými playlistami do jedného JSON súboru. Súbor sa vytvorí priamo v tomto zariadení a nikam sa neodosiela.'
        :'Uložte si rozposlouchané a poslechnuté epizody spolu s vlastními playlisty do jednoho souboru JSON. Soubor se vytvoří přímo v tomto zařízení a nikam se neodesílá.');
      setText(backup.querySelector('.vedator-data-export'),sk?'Stiahnuť zálohu':'Stáhnout zálohu');
      setText(backup.querySelector('.vedator-data-import'),sk?'Načítať zálohu':'Načíst zálohu');
      setHtml(backup.querySelector('.vedator-data-note'),sk
        ?'<strong>Súkromie:</strong> export aj import prebiehajú iba lokálne v prehliadači. Žiadne údaje sa neposielajú na žiadny server.'
        :'<strong>Soukromí:</strong> export i import probíhají pouze místně v prohlížeči. Žádná data se neposílají na žádný server.');
    }
    const removal=cards[1];
    if(removal){
      setText(removal.querySelector('h2'),sk?'Vymazanie údajov aplikácie':'Smazání dat aplikace');
      setText(removal.querySelector('p'),sk
        ?'Odstráni všetky údaje, ktoré si aplikácia uložila v tomto zariadení. Samotná aplikácia zostane nainštalovaná.'
        :'Odstraní všechna data, která si aplikace uložila v tomto zařízení. Samotná aplikace zůstane nainstalovaná.');
      setText(removal.querySelector('.vedator-data-clear'),sk?'Vymazať všetky údaje':'Smazat veškerá data');
      setHtml(removal.querySelector('.vedator-data-note'),sk
        ?'<strong>Upozornenie:</strong> vymažú sa vlastné playlisty, rozpočúvané a vypočuté epizódy, priebeh sérií a playlistov aj nastavenia aplikácie. Túto akciu nie je možné vrátiť späť.'
        :'<strong>Upozornění:</strong> smažou se vlastní playlisty, rozposlouchané a poslechnuté epizody, průběh sérií a playlistů i nastavení aplikace. Tuto akci nelze vrátit zpět.');
    }
    const status=document.querySelector('.vedator-data-status');
    if(status){
      const raw=status.textContent.trim();
      if(/^(?:Veškerá data aplikace byla smazána\.|Všetky údaje aplikácie boli vymazané\.)$/i.test(raw))setText(status,sk?'Všetky údaje aplikácie boli vymazané.':'Veškerá data aplikace byla smazána.');
      else if(/^(?:Mazání dat bylo zrušeno\.|Vymazanie údajov bolo zrušené\.)$/i.test(raw))setText(status,sk?'Vymazanie údajov bolo zrušené.':'Mazání dat bylo zrušeno.');
    }
  }

  function applyExtraTranslations(){
    const lang=language(),sk=lang==='sk';
    document.querySelectorAll('select option').forEach(option=>{
      const labels=optionLabels[option.value];
      if(labels)setText(option,labels[lang]);
    });
    const playlistSort=document.querySelector('.vedator-playlist-sort');
    if(playlistSort)playlistSort.setAttribute('aria-label',sk?'Zoradenie playlistov':'Řazení playlistů');
    document.querySelectorAll('.vedator-collection-continue').forEach(button=>{
      const match=collectionLabels.find(item=>item.test.test(button.textContent.trim()));
      if(match)setText(button,match[lang]);
    });
    document.querySelectorAll('.series-count').forEach(node=>{
      const number=Number(node.textContent.match(/\d+/)?.[0]);
      if(!Number.isFinite(number))return;
      const word=sk?plural(number,'diel','diely','dielov'):plural(number,'díl','díly','dílů');
      setText(node,`${number} ${word}`);
    });
    document.querySelectorAll('.vedator-playlist-count').forEach(node=>{
      const number=Number(node.textContent.match(/\d+/)?.[0]);
      if(!Number.isFinite(number))return;
      const word=sk?plural(number,'položka','položky','položiek'):plural(number,'položka','položky','položek');
      setText(node,`${number} ${word}`);
    });
    document.querySelectorAll('.vedator-item-sub').forEach(node=>{
      const raw=node.textContent;
      setText(node,sk?raw.replace(/^Díl\s+/i,'Diel '):raw.replace(/^Diel\s+/i,'Díl '));
    });
    const count=document.querySelector('#count');
    if(count){
      const raw=count.textContent.trim();
      let match;
      if(/^(?:Lokálna záloha dát|Lokální záloha dat)$/i.test(raw))setText(count,sk?'Lokálna záloha dát':'Lokální záloha dat');
      else if((match=raw.match(/^(\d+)\s+(?:playlist|playlisty|playlistů|playlistov)$/i))){
        const number=Number(match[1]);
        const word=sk?plural(number,'playlist','playlisty','playlistov'):plural(number,'playlist','playlisty','playlistů');
        setText(count,`${number} ${word}`);
      }
    }
    translateDataView(lang);
  }

  let extraQueued=false;
  function scheduleExtraTranslations(delay=0){
    if(extraQueued)return;
    extraQueued=true;
    setTimeout(()=>{
      extraQueued=false;
      applyExtraTranslations();
    },delay);
  }

  function appStorageKeys(storage){
    const keys=[];
    for(let index=0;index<storage.length;index++){
      const key=storage.key(index);
      if(key&&key.toLowerCase().startsWith(STORAGE_PREFIX))keys.push(key);
    }
    return keys;
  }
  function stopPlaybackBeforeClear(){
    const audio=document.querySelector('.vedator-audio-card audio');
    if(!audio)return;
    try{audio.pause()}catch{}
    try{audio.removeAttribute('src');audio.load()}catch{}
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.vedator-data-clear');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const sk=language()==='sk';
    const approved=confirm(sk
      ?'Naozaj chcete vymazať všetky údaje aplikácie v tomto zariadení?\n\nNenávratne sa odstránia:\n• vlastné playlisty\n• rozpočúvané a vypočuté epizódy\n• priebeh sérií a playlistov\n• nastavenia zoradenia a vzhľadu\n\nTúto akciu nie je možné vrátiť späť.'
      :'Opravdu chcete smazat veškerá data aplikace v tomto zařízení?\n\nBudou nenávratně odstraněny:\n• vlastní playlisty\n• rozposlouchané a poslechnuté epizody\n• průběh sérií a playlistů\n• nastavení řazení a vzhledu\n\nTuto akci nelze vrátit zpět.');
    const status=document.querySelector('.vedator-data-status');
    if(!approved){
      setText(status,sk?'Vymazanie údajov bolo zrušené.':'Mazání dat bylo zrušeno.');
      return;
    }
    window.__vedatorClearingData=true;
    stopPlaybackBeforeClear();
    try{for(const key of appStorageKeys(localStorage))localStorage.removeItem(key)}catch{}
    try{for(const key of appStorageKeys(sessionStorage))sessionStorage.removeItem(key)}catch{}
    try{sessionStorage.setItem(CLEAR_NOTICE_KEY,'1')}catch{}
    location.reload();
  },true);

  window.addEventListener('vedatorlanguagechange',()=>scheduleExtraTranslations());
  window.addEventListener('vedatorcontentchange',()=>scheduleExtraTranslations());
  window.addEventListener('storage',()=>scheduleExtraTranslations());
  document.addEventListener('pointerdown',event=>{
    if(event.target.closest('select,.series-card,.vedator-playlist-card,.tab'))scheduleExtraTranslations();
  },true);
  document.addEventListener('click',()=>{
    scheduleExtraTranslations();
    setTimeout(applyExtraTranslations,80);
    setTimeout(applyExtraTranslations,250);
  });
  scheduleExtraTranslations();
  setTimeout(applyExtraTranslations,350);
  setTimeout(applyExtraTranslations,1200);
})();