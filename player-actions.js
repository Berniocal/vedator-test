(()=>{
  if(window.__vedatorPlayerActions)return;
  window.__vedatorPlayerActions=true;

  const PLAYLIST_KEY='vedator-user-playlists-v1';
  const REF_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  const language=()=>{try{return window.vedatorUiLanguage?.()==='sk'?'sk':'cz'}catch{return'cz'}};
  const text=(cz,sk)=>language()==='sk'?sk:cz;
  const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const episodeNumber=title=>Number(String(title||'').match(/\bpodcast\s+(\d+)\b/i)?.[1]||0);
  const currentEpisodeNumber=()=>episodeNumber(document.querySelector('.vedator-audio-card__title')?.textContent?.trim()||'');
  const encodeEpisode=number=>Number.isInteger(Number(number))&&Number(number)>=0&&Number(number)<2048
    ?REF_ALPHABET[(Number(number)>>6)&63]+REF_ALPHABET[Number(number)&63]
    :'';
  const decodeRef=ref=>{
    const value=String(ref||'');
    if(value.length!==2)return-1;
    const high=REF_ALPHABET.indexOf(value[0]),low=REF_ALPHABET.indexOf(value[1]);
    return high<0||low<0?-1:(high<<6)|low;
  };
  const itemMatchesEpisode=(item,number)=>{
    const decoded=decodeRef(item);
    if(decoded>=0&&decoded<2048)return decoded===number;
    try{
      const episode=Array.isArray(episodes)?episodes.find(entry=>String(entry?.id||entry?.number||entry?.title||'')===String(item)):null;
      return Number(episode?.number)===number;
    }catch{return false}
  };
  const loadPlaylists=()=>{try{const value=JSON.parse(localStorage.getItem(PLAYLIST_KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
  const savePlaylists=playlists=>{try{localStorage.setItem(PLAYLIST_KEY,JSON.stringify(playlists))}catch{}window.dispatchEvent(new CustomEvent('vedatorplaylistchange'))};
  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random().toString(36).slice(2);
  const setHelp=value=>setText(document.querySelector('.vedator-audio-card__help'),value);

  const style=document.createElement('style');
  style.textContent=`
    .vedator-custom-secondary.vedator-actions-organized{display:grid!important;grid-template-columns:1fr!important;gap:9px!important}
    .vedator-player-action-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .vedator-actions-organized .vedator-custom-btn{min-height:54px!important;flex-direction:row!important;gap:7px!important;text-align:center;line-height:1.15;padding:8px 9px!important}
    .vedator-actions-organized .vedator-custom-btn>span{text-align:center}
    .vedator-actions-organized .vedator-action-label{font-size:.82rem;font-weight:800}
    .vedator-actions-organized .speed-value{font-size:.86rem;font-weight:900;white-space:nowrap}
    .vedator-actions-organized .vedator-original-download{display:none!important}
    .vedator-playlist-player-btn.in-playlist{border-color:#86c79a}
    html.theme-dark .vedator-playlist-player-btn.in-playlist{border-color:#4ade80}
    .vedator-playlist-picker{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,7,18,.68)}
    .vedator-playlist-picker.hidden{display:none}
    .vedator-playlist-picker-box{width:min(440px,100%);max-height:min(78vh,680px);display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.28)}
    .vedator-playlist-picker-head,.vedator-playlist-picker-foot{display:flex;align-items:center;gap:10px;padding:14px 16px}
    .vedator-playlist-picker-head{border-bottom:1px solid var(--line)}
    .vedator-playlist-picker-head strong{flex:1}
    .vedator-playlist-picker-close{border:0;background:transparent;color:var(--muted);font-size:1.25rem;cursor:pointer}
    .vedator-playlist-picker-list{overflow:auto;padding:10px 14px}
    .vedator-playlist-picker-item{display:flex;align-items:center;gap:10px;padding:11px 4px;border-bottom:1px solid var(--line);cursor:pointer}
    .vedator-playlist-picker-item input{width:20px;height:20px}
    .vedator-playlist-picker-empty{padding:22px 4px;text-align:center;color:var(--muted)}
    .vedator-playlist-picker-foot{border-top:1px solid var(--line);flex-wrap:wrap;justify-content:flex-end}
    .vedator-playlist-picker-new,.vedator-playlist-picker-cancel,.vedator-playlist-picker-save{border-radius:11px;padding:10px 13px;font:inherit;font-weight:800;cursor:pointer}
    .vedator-playlist-picker-new{margin-right:auto;border:1px solid var(--line);background:transparent;color:var(--ink)}
    .vedator-playlist-picker-cancel{border:1px solid var(--line);background:transparent;color:var(--ink)}
    .vedator-playlist-picker-save{border:0;background:var(--accent);color:#fff}
    @media(max-width:550px){
      .vedator-player-action-row{gap:7px}
      .vedator-actions-organized .vedator-custom-btn{min-height:58px!important;padding:7px 5px!important;gap:5px!important}
      .vedator-actions-organized .vedator-action-label{font-size:.76rem}
      .vedator-playlist-picker-foot{display:grid;grid-template-columns:1fr 1fr}
      .vedator-playlist-picker-new{grid-column:1/-1;margin:0}
    }
  `;
  document.head.append(style);

  const picker=document.createElement('div');
  picker.className='vedator-playlist-picker hidden';
  picker.innerHTML=`<div class="vedator-playlist-picker-box" role="dialog" aria-modal="true"><div class="vedator-playlist-picker-head"><strong class="vedator-playlist-picker-title"></strong><button class="vedator-playlist-picker-close" type="button">✕</button></div><div class="vedator-playlist-picker-list"></div><div class="vedator-playlist-picker-foot"><button class="vedator-playlist-picker-new" type="button"></button><button class="vedator-playlist-picker-cancel" type="button"></button><button class="vedator-playlist-picker-save" type="button"></button></div></div>`;
  document.body.append(picker);

  const pickerTitle=picker.querySelector('.vedator-playlist-picker-title');
  const pickerList=picker.querySelector('.vedator-playlist-picker-list');
  const newButton=picker.querySelector('.vedator-playlist-picker-new');
  const cancelButton=picker.querySelector('.vedator-playlist-picker-cancel');
  const saveButton=picker.querySelector('.vedator-playlist-picker-save');
  const closeButton=picker.querySelector('.vedator-playlist-picker-close');
  let pickedEpisode=0;

  function renderPicker(){
    const playlists=loadPlaylists();
    setText(pickerTitle,text('Přidat do playlistu','Pridať do playlistu'));
    setText(newButton,text('＋ Vytvořit nový playlist','＋ Vytvoriť nový playlist'));
    setText(cancelButton,text('Zrušit','Zrušiť'));
    setText(saveButton,text('Uložit změny','Uložiť zmeny'));
    const closeLabel=text('Zavřít','Zavrieť');
    if(closeButton.getAttribute('aria-label')!==closeLabel)closeButton.setAttribute('aria-label',closeLabel);
    pickerList.innerHTML=playlists.length
      ?playlists.map(playlist=>`<label class="vedator-playlist-picker-item"><input type="checkbox" data-playlist-id="${escapeHtml(playlist.id)}" ${Array.isArray(playlist.items)&&playlist.items.some(item=>itemMatchesEpisode(item,pickedEpisode))?'checked':''}><span>${escapeHtml(playlist.name)}</span></label>`).join('')
      :`<div class="vedator-playlist-picker-empty">${text('Zatím nemáte žádný playlist.','Zatiaľ nemáte žiadny playlist.')}</div>`;
  }

  function openPicker(){
    pickedEpisode=currentEpisodeNumber();
    if(!pickedEpisode){setHelp(text('Tuto epizodu se nepodařilo určit.','Túto epizódu sa nepodarilo určiť.'));return}
    renderPicker();
    picker.classList.remove('hidden');
  }
  function closePicker(){picker.classList.add('hidden');pickedEpisode=0}
  function createPlaylist(){
    const name=prompt(text('Název nového playlistu:','Názov nového playlistu:'))?.trim();
    if(!name)return;
    const playlists=loadPlaylists();
    if(playlists.some(playlist=>normalize(playlist.name)===normalize(name))){alert(text('Playlist s tímto názvem už existuje.','Playlist s týmto názvom už existuje.'));return}
    const ref=encodeEpisode(pickedEpisode);
    playlists.push({id:uid(),name,items:ref?[ref]:[]});
    savePlaylists(playlists);
    renderPicker();
    syncPlaylistState();
  }
  function saveMembership(){
    const ref=encodeEpisode(pickedEpisode);
    if(!ref){closePicker();return}
    const selectedIds=new Set([...pickerList.querySelectorAll('input[data-playlist-id]:checked')].map(input=>String(input.dataset.playlistId)));
    const playlists=loadPlaylists();
    const selectedNames=[];
    for(const playlist of playlists){
      const items=(Array.isArray(playlist.items)?playlist.items:[]).filter(item=>!itemMatchesEpisode(item,pickedEpisode));
      if(selectedIds.has(String(playlist.id))){items.push(ref);selectedNames.push(playlist.name)}
      playlist.items=items;
    }
    savePlaylists(playlists);
    closePicker();
    syncPlaylistState();
    if(selectedNames.length===1)setHelp(text(`Epizoda je v playlistu „${selectedNames[0]}“.`,`Epizóda je v playliste „${selectedNames[0]}“.`));
    else if(selectedNames.length>1)setHelp(text(`Epizoda je v ${selectedNames.length} playlistech.`,`Epizóda je v ${selectedNames.length} playlistoch.`));
    else setHelp(text('Epizoda není v žádném playlistu.','Epizóda nie je v žiadnom playliste.'));
  }

  newButton.addEventListener('click',createPlaylist);
  cancelButton.addEventListener('click',closePicker);
  saveButton.addEventListener('click',saveMembership);
  closeButton.addEventListener('click',closePicker);
  picker.addEventListener('click',event=>{if(event.target===picker)closePicker()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!picker.classList.contains('hidden'))closePicker()});

  function syncLabels(){
    const secondary=document.querySelector('.vedator-custom-secondary');
    if(!secondary)return;
    const speedLabel=secondary.querySelector('.vedator-speed-label');
    setText(speedLabel,text('Rychlost přehrávání','Rýchlosť prehrávania'));
    const playlistLabel=secondary.querySelector('.vedator-playlist-player-label');
    setText(playlistLabel,text('Přidat do playlistu','Pridať do playlistu'));
    const offline=secondary.querySelector('.vedator-offline-btn');
    const offlineLabel=offline?.querySelector('.vedator-offline-label');
    if(offlineLabel&&!offline?.dataset.vedatorBusy){
      setText(offlineLabel,offline.classList.contains('saved')?text('✓ Uloženo offline','✓ Uložené offline'):text('Uložit offline','Uložiť offline'));
    }
    const downloadProxyLabel=secondary.querySelector('.vedator-download-proxy .vedator-action-label');
    setText(downloadProxyLabel,text('Stáhnout MP3','Stiahnuť MP3'));
  }

  function syncPlaylistState(){
    const button=document.querySelector('.vedator-playlist-player-btn');
    if(!button)return;
    const number=currentEpisodeNumber();
    const inside=Boolean(number&&loadPlaylists().some(playlist=>Array.isArray(playlist.items)&&playlist.items.some(item=>itemMatchesEpisode(item,number))));
    button.classList.toggle('in-playlist',inside);
    const title=inside
      ?text('Epizoda je už v některém playlistu. Klepnutím můžete výběr změnit.','Epizóda už je v niektorom playliste. Klepnutím môžete výber zmeniť.')
      :text('Přidat epizodu do playlistu','Pridať epizódu do playlistu');
    if(button.title!==title)button.title=title;
  }

  function organize(){
    const secondary=document.querySelector('.vedator-custom-secondary');
    if(!secondary||secondary.classList.contains('vedator-actions-organized'))return false;
    const speed=secondary.querySelector('.speed');
    const originalDownload=secondary.querySelector('.download');
    const offline=secondary.querySelector('.vedator-offline-btn');
    if(!speed||!originalDownload||!offline)return false;

    const speedFirst=speed.querySelector('span:not(.speed-value)');
    if(speedFirst)speedFirst.classList.add('vedator-speed-label','vedator-action-label');
    const offlineLabel=offline.querySelector('.vedator-offline-label');
    offlineLabel?.classList.add('vedator-action-label');

    const playlist=document.createElement('button');
    playlist.type='button';
    playlist.className='vedator-custom-btn vedator-playlist-player-btn';
    playlist.innerHTML='<span>＋</span><span class="vedator-playlist-player-label vedator-action-label">Přidat do playlistu</span>';
    playlist.addEventListener('click',openPicker);

    const downloadProxy=document.createElement('button');
    downloadProxy.type='button';
    downloadProxy.className='vedator-custom-btn vedator-download-proxy';
    downloadProxy.innerHTML='<span>⇩</span><span class="vedator-action-label">Stáhnout MP3</span>';
    downloadProxy.addEventListener('click',()=>originalDownload.click());
    originalDownload.classList.add('vedator-original-download');

    const top=document.createElement('div');
    top.className='vedator-player-action-row top';
    const bottom=document.createElement('div');
    bottom.className='vedator-player-action-row bottom';
    top.append(speed,playlist);
    bottom.append(offline,downloadProxy,originalDownload);
    secondary.append(top,bottom);
    secondary.classList.add('vedator-actions-organized');

    const audio=document.querySelector('.vedator-audio-card audio');
    audio?.addEventListener('loadedmetadata',()=>{syncLabels();syncPlaylistState()});
    syncLabels();
    syncPlaylistState();
    return true;
  }

  // offline-audio.js historically installs a label observer that abbreviates the
  // download action to "MP3". Marking this label as already handled prevents that
  // old observer from being created; this module never observes or rewrites itself.
  const legacyDownloadLabel=document.querySelector('.vedator-custom-secondary .download-label');
  if(legacyDownloadLabel)legacyDownloadLabel.__vedatorOfflineObserver=true;

  const init=()=>{organize()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.addEventListener('vedatorlanguagechange',()=>{
    syncLabels();
    syncPlaylistState();
    if(!picker.classList.contains('hidden'))renderPicker();
  });
  window.addEventListener('vedatorplaylistchange',syncPlaylistState);
})();
