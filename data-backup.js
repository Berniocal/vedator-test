(()=>{
  if(window.__vedatorDataBackup)return;
  window.__vedatorDataBackup=true;

  const PROGRESS_KEY='vedatorPlaybackProgressV1';
  const PLAYLISTS_KEY='vedator-user-playlists-v1';
  const STORAGE_PREFIX='vedator';
  const CLEAR_NOTICE_KEY='vedatorDataClearedNoticeV1';

  const style=document.createElement('style');
  style.textContent=`
    .vedator-data-view{display:none}
    .vedator-data-view.active{display:block}
    .vedator-data-card{max-width:760px;margin:20px auto;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 8px 30px rgba(15,23,42,.06)}
    .vedator-data-card h2{margin:0 0 10px;font-size:1.35rem}
    .vedator-data-card p{color:var(--muted);line-height:1.55;margin:0 0 18px}
    .vedator-data-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .vedator-data-button{border:1px solid var(--line);border-radius:14px;padding:14px 16px;font-weight:800;font-size:1rem;cursor:pointer;background:var(--card);color:var(--ink)}
    .vedator-data-button.primary{background:var(--accent);color:#fff;border-color:transparent}
    .vedator-data-button.danger{background:#b91c1c;color:#fff;border-color:#b91c1c}
    .vedator-data-button.danger:hover{background:#991b1b;border-color:#991b1b}
    .vedator-data-note{margin-top:18px;padding:14px;border-radius:14px;background:rgba(91,75,219,.09);color:var(--ink);font-size:.94rem;line-height:1.5}
    .vedator-data-note.danger{background:rgba(185,28,28,.1);color:var(--ink)}
    .vedator-data-status{min-height:1.4em;margin-top:14px;color:var(--muted);font-weight:650}
    @media(max-width:560px){.vedator-data-actions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const tabs=document.querySelector('.tabs');
  const episodesSection=document.querySelector('#episodes');
  const seriesSection=document.querySelector('#series');
  const playlistView=document.querySelector('.vedator-playlist-view');
  const topics=document.querySelector('#topics');
  const episodeSort=document.querySelector('#episodeSort');
  const seriesSort=document.querySelector('#seriesSort');
  const count=document.querySelector('#count');
  if(!tabs||!episodesSection||!seriesSection)return;

  const tab=document.createElement('button');
  tab.type='button';
  tab.className='tab';
  tab.dataset.view='data';
  tab.textContent='Moje dáta';
  tabs.appendChild(tab);

  const view=document.createElement('section');
  view.className='vedator-data-view';
  view.innerHTML=`
    <div class="vedator-data-card">
      <h2>Záloha dát aplikácie</h2>
      <p>Uložte si rozpočúvané a vypočuté epizódy spolu s vlastnými playlistami do jedného JSON súboru. Súbor sa vytvorí priamo v tomto zariadení a nikam sa neodosiela.</p>
      <div class="vedator-data-actions">
        <button class="vedator-data-button primary vedator-data-export" type="button">Stiahnuť zálohu</button>
        <button class="vedator-data-button vedator-data-import" type="button">Načítať zálohu</button>
      </div>
      <input class="vedator-data-file" type="file" accept="application/json,.json" hidden>
      <div class="vedator-data-note"><strong>Súkromie:</strong> export aj import prebiehajú iba lokálne v prehliadači. Žiadne údaje sa neposielajú na žiadny server.</div>
      <div class="vedator-data-status" aria-live="polite"></div>
    </div>
    <div class="vedator-data-card">
      <h2>Smazání dat aplikace</h2>
      <p>Odstraní všechna data, která si aplikace uložila v tomto zařízení. Samotná aplikace zůstane nainstalovaná.</p>
      <button class="vedator-data-button danger vedator-data-clear" type="button">Smazat veškerá data</button>
      <div class="vedator-data-note danger"><strong>Upozornění:</strong> smažou se vlastní playlisty, rozposlouchané a poslechnuté epizody, průběh sérií a playlistů i nastavení aplikace. Tuto akci nelze vrátit zpět.</div>
    </div>`;
  (playlistView||seriesSection).insertAdjacentElement('afterend',view);

  const status=view.querySelector('.vedator-data-status');
  const fileInput=view.querySelector('.vedator-data-file');

  function readJsonStorage(key,fallback){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
  function showDataView(){document.querySelectorAll('.tabs .tab').forEach(item=>item.classList.toggle('active',item===tab));episodesSection.classList.add('hidden');seriesSection.classList.add('hidden');playlistView?.classList.remove('active');view.classList.add('active');topics?.classList.add('hidden');episodeSort?.classList.add('hidden');seriesSort?.classList.add('hidden');if(count)count.textContent='Lokálna záloha dát'}
  document.querySelectorAll('.tabs .tab:not([data-view="data"])').forEach(item=>item.addEventListener('click',()=>view.classList.remove('active')));
  tab.addEventListener('click',showDataView);

  function fileName(){const stamp=new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');return `vedator-zaloha-${stamp}.json`}
  function exportData(){const progress=readJsonStorage(PROGRESS_KEY,{});const playlists=readJsonStorage(PLAYLISTS_KEY,[]);const payload={app:'vedator',formatVersion:1,exportedAt:new Date().toISOString(),data:{playbackProgress:progress&&typeof progress==='object'&&!Array.isArray(progress)?progress:{},playlists:Array.isArray(playlists)?playlists:[]}};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=fileName();document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent=`Záloha bola vytvorená: ${Object.keys(payload.data.playbackProgress).length} epizód a ${payload.data.playlists.length} playlistov.`}
  function validateBackup(value){if(!value||typeof value!=='object'||value.app!=='vedator')throw new Error('Tento súbor nie je záloha aplikácie Vedátor.');if(value.formatVersion!==1)throw new Error('Táto verzia zálohy nie je podporovaná.');const data=value.data;if(!data||typeof data!=='object')throw new Error('V zálohe chýbajú údaje.');if(!data.playbackProgress||typeof data.playbackProgress!=='object'||Array.isArray(data.playbackProgress))throw new Error('Neplatné údaje o počúvaní.');if(!Array.isArray(data.playlists))throw new Error('Neplatné údaje playlistov.');return data}
  async function importFile(file){try{const text=await file.text();const value=JSON.parse(text);const data=validateBackup(value);const progressCount=Object.keys(data.playbackProgress).length;const playlistCount=data.playlists.length;const approved=confirm(`Načítať zálohu s ${progressCount} epizódami a ${playlistCount} playlistami?\n\nSúčasné údaje v tomto zariadení budú nahradené.`);if(!approved){status.textContent='Import bol zrušený.';return}localStorage.setItem(PROGRESS_KEY,JSON.stringify(data.playbackProgress));localStorage.setItem(PLAYLISTS_KEY,JSON.stringify(data.playlists));status.textContent='Záloha bola úspešne načítaná. Aplikácia sa obnoví…';setTimeout(()=>location.reload(),500)}catch(error){status.textContent=error instanceof SyntaxError?'Súbor nie je platný JSON.':(error.message||'Zálohu sa nepodarilo načítať.')}finally{fileInput.value=''}}

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

  function clearAllData(){
    const approved=confirm('Opravdu chcete smazat veškerá data aplikace v tomto zařízení?\n\nBudou nenávratně odstraněny:\n• vlastní playlisty\n• rozposlouchané a poslechnuté epizody\n• průběh sérií a playlistů\n• nastavení řazení a vzhledu\n\nTuto akci nelze vrátit zpět.');
    if(!approved){status.textContent='Mazání dat bylo zrušeno.';return}

    window.__vedatorClearingData=true;
    stopPlaybackBeforeClear();

    try{for(const key of appStorageKeys(localStorage))localStorage.removeItem(key)}catch{}
    try{for(const key of appStorageKeys(sessionStorage))sessionStorage.removeItem(key)}catch{}
    try{sessionStorage.setItem(CLEAR_NOTICE_KEY,'1')}catch{}

    location.reload();
  }

  view.querySelector('.vedator-data-export').addEventListener('click',exportData);
  view.querySelector('.vedator-data-import').addEventListener('click',()=>fileInput.click());
  view.querySelector('.vedator-data-clear').addEventListener('click',clearAllData);
  fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];if(file)importFile(file)});

  try{
    if(sessionStorage.getItem(CLEAR_NOTICE_KEY)==='1'){
      sessionStorage.removeItem(CLEAR_NOTICE_KEY);
      status.textContent='Veškerá data aplikace byla smazána.';
    }
  }catch{}
})();