import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_PLAYLIST_PARITY_V1 */';
if(source.includes(marker)){
  console.log('V2 playlist parity already present.');
  process.exit(0);
}

const block=String.raw`
  ${marker}
  const playlistParity={installed:false,drag:null};
  function playlistProgressInfo(playlist){
    const refs=playlistRefs(playlist),items=refs.map((ref,index)=>({ref,index,info:itemInfo(ref),id:'ref:'+ref})).filter(item=>item.info),total=items.length;
    const collection=state.collectionProgress['playlist:'+playlist.id]||{},records=collection.items&&typeof collection.items==='object'?collection.items:{};
    const recordFor=item=>records[item.id]||{};
    const completed=items.filter(item=>recordFor(item).completed).length;
    const heard=items.filter(item=>{const record=recordFor(item);return record.completed||Number(record.percent)>0||Number(record.currentTime)>Number(record.start||item.info.start||0)+3}).length;
    const progressSum=items.reduce((sum,item)=>{const record=recordFor(item);return sum+(record.completed?100:Math.max(0,Math.min(100,Number(record.percent)||0)))},0);
    const percent=total?Math.round(progressSum/total):0;
    let resumeIndex=-1;
    if(collection.lastItemId){const last=items.findIndex(item=>item.id===collection.lastItemId);if(last>=0){if(!recordFor(items[last]).completed)resumeIndex=last;else if(last+1<items.length)resumeIndex=items.slice(last+1).findIndex(item=>!recordFor(item).completed)+last+1}}
    if(resumeIndex<0||resumeIndex>=items.length||recordFor(items[resumeIndex])?.completed)resumeIndex=items.findIndex(item=>!recordFor(item).completed&&Number(recordFor(item).currentTime)>Number(recordFor(item).start||item.info.start||0)+3);
    if(resumeIndex<0)resumeIndex=items.findIndex(item=>!recordFor(item).completed);
    if(resumeIndex<0)resumeIndex=0;
    const started=heard>0,finished=total>0&&completed===total;
    return {items,records,total,completed,heard,percent,resumeIndex,started,finished};
  }
  function playlistResumeLabel(info){if(info.finished)return text('Přehrát playlist znovu','Prehrať playlist znova');if(info.started)return text('Pokračovat v playlistu','Pokračovať v playliste');return text('Začít playlist','Začať playlist')}
  function playlistItemStatus(info,item){const record=info.records[item.id]||{};if(record.completed)return{symbol:'✓',kind:'done',label:text('Poslechnuto','Vypočuté'),percent:100};const percent=Math.max(0,Math.min(100,Number(record.percent)||0));if(percent>0||Number(record.currentTime)>Number(record.start||item.info.start||0)+3)return{symbol:'▶',kind:'progress',label:text('Rozposloucháno','Rozpočúvané'),percent};return{symbol:'',kind:'',label:'',percent:0}}
  function playlistResumeStart(playlist,context,index){const collection=state.collectionProgress['playlist:'+playlist.id]||{},item=context.items[index],record=collection.items?.[item?.id]||{};if(item&&!record.completed&&Number(record.currentTime)>Number(item.start||0)+1)return Number(record.currentTime);return Number(item?.start)||0}
  function renderPlaylists(){
    state.playlists=safePlaylists(readJson(PLAYLISTS_KEY,state.playlists));const box=$('#playlists-v2');
    if(!state.playlists.length){box.innerHTML='<div class="playlist-toolbar"><strong>'+text('Moje playlisty','Moje playlisty')+'</strong><button class="playlist-add" type="button" aria-label="'+text('Nový playlist','Nový playlist')+'">+</button></div><div class="empty">'+text('Zatím nemáte žádný playlist.','Zatiaľ nemáte žiadny playlist.')+'</div>';return}
    box.innerHTML='<div class="playlist-toolbar"><strong>'+text('Moje playlisty','Moje playlisty')+'</strong><button class="playlist-add" type="button" aria-label="'+text('Nový playlist','Nový playlist')+'">+</button></div><div class="grid">'+state.playlists.map(playlist=>{
      const refs=playlistRefs(playlist),items=refs.map(itemInfo).filter(Boolean),progress=playlistProgressInfo(playlist),search=norm(playlist.name+' '+items.map(item=>item.title+' '+item.subtitle).join(' '));
      const stateClass=progress.finished?' complete':progress.started?' active':'';
      return '<details class="playlist-card searchable'+stateClass+'" data-id="'+esc(playlist.id)+'" data-search="'+esc(search)+'"><summary><span class="playlist-title">'+esc(playlist.name||'Playlist')+'</span><span class="playlist-count">'+items.length+' '+text('položek','položiek')+'</span><span class="playlist-actions"><button type="button" class="icon-button edit" title="'+text('Upravit','Upraviť')+'">✎</button><button type="button" class="icon-button share" title="'+text('Sdílet','Zdieľať')+'">🔗</button><button type="button" class="icon-button delete" title="'+text('Smazat','Zmazať')+'">🗑</button></span></summary>'+
        (progress.total?'<div class="playlist-progress-box-v2"><div class="playlist-progress-main-v2"><progress max="100" value="'+progress.percent+'"></progress><small>'+progress.completed+' / '+progress.total+' '+text('poslechnuto','vypočuté')+' · '+progress.percent+' %</small></div><button type="button" class="playlist-resume-v2" data-id="'+esc(playlist.id)+'" data-item-index="'+progress.resumeIndex+'">'+esc(playlistResumeLabel(progress))+'</button></div>':'')+
        '<ol class="playlist-items">'+(items.length?refs.map((ref,index)=>{const item=itemInfo(ref);if(!item)return'';const status=playlistItemStatus(progress,progress.items.find(x=>x.ref===ref)||{id:'ref:'+ref,info:item});return '<li class="playlist-item '+status.kind+'"><button type="button" class="playlist-open" data-item-index="'+index+'" data-ref="'+esc(ref)+'"><span class="playlist-item-status-v2" title="'+esc(status.label)+'">'+status.symbol+'</span><span class="playlist-item-copy-v2" style="--playlist-item-progress:'+status.percent+'%"><b>'+esc(item.title)+'</b><br><small>'+esc(item.subtitle)+'</small></span></button></li>'}).join(''):'<li class="empty">'+text('Playlist je prázdný.','Playlist je prázdny.')+'</li>')+'</ol></details>';
    }).join('')+'</div>';
  }
  function refreshPlaylistProgress(){if(state.view==='playlists')renderPlaylists()}
  function enhancePlaylistEditorMobile(){
    const modal=$('#playlist-editor-v2'),box=modal?.querySelector('.modal-box'),columns=box?.querySelector('.editor-columns');if(!box||!columns)return;
    box.classList.add('playlist-editor-mobile-v2');let tabs=box.querySelector('.playlist-editor-work-tabs-v2');
    if(!tabs){tabs=document.createElement('div');tabs.className='playlist-editor-work-tabs-v2';tabs.innerHTML='<button type="button" data-editor-section="added"></button><button type="button" data-editor-section="add"></button>';columns.before(tabs)}
    const count=state.editor?.draft?.length||0,mode=state.editor?.mode==='q'?'q':'e';
    tabs.querySelector('[data-editor-section="added"]').textContent=text('Přidané','Pridané')+' ('+count+')';tabs.querySelector('[data-editor-section="add"]').textContent=mode==='q'?text('Přidat otázky','Pridať otázky'):text('Přidat epizody','Pridať epizódy');
    if(!box.dataset.editorSection)box.dataset.editorSection=count?'added':'add';tabs.querySelectorAll('button').forEach(button=>button.classList.toggle('active',button.dataset.editorSection===box.dataset.editorSection));
  }
  function playlistDragTarget(clientY,row){const rows=[...row.parentElement.querySelectorAll('.editor-row[data-ref]')].filter(candidate=>candidate!==row);let target=rows.length;for(let index=0;index<rows.length;index++){const rect=rows[index].getBoundingClientRect();if(clientY<rect.top+rect.height/2){target=index;break}}return target}
  function installPlaylistParity(){
    if(playlistParity.installed)return;playlistParity.installed=true;
    const style=document.createElement('style');style.dataset.v2PlaylistParity='1';style.textContent='.playlist-card.active>.playlist-title,.playlist-card.active summary .playlist-title{color:#d97706}.playlist-card.complete>.playlist-title,.playlist-card.complete summary .playlist-title{color:var(--ok)}.playlist-progress-box-v2{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:0 0 12px}.playlist-progress-main-v2{display:grid;gap:4px;color:var(--muted)}.playlist-progress-main-v2 progress{width:100%;height:7px;accent-color:var(--accent)}.playlist-resume-v2{border:0;border-radius:10px;background:var(--accent);color:#fff;padding:9px 12px;font-weight:800;cursor:pointer}.playlist-open{display:grid!important;grid-template-columns:1.2rem minmax(0,1fr);gap:7px;align-items:start}.playlist-item-status-v2{font-weight:900;color:var(--ok);padding-top:1px}.playlist-item.progress .playlist-item-status-v2{color:#d97706}.playlist-item-copy-v2{min-width:0}.playlist-item.progress .playlist-item-copy-v2 b{background:linear-gradient(90deg,var(--ok) 0 var(--playlist-item-progress),var(--ink) var(--playlist-item-progress) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}.playlist-editor-work-tabs-v2{display:none}.editor-row.dragging-v2{opacity:.92;border-color:var(--accent);box-shadow:0 10px 30px rgba(0,0,0,.3)}@media(max-width:700px){.playlist-progress-box-v2{grid-template-columns:1fr}.playlist-resume-v2{width:100%}.playlist-editor-work-tabs-v2{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 0 10px}.playlist-editor-work-tabs-v2 button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:10px;padding:8px;font-weight:800}.playlist-editor-work-tabs-v2 button.active{background:var(--accent2);border-color:var(--accent);color:var(--accent)}.playlist-editor-mobile-v2[data-editor-section="added"] .editor-columns>section:nth-child(2),.playlist-editor-mobile-v2[data-editor-section="add"] .editor-columns>section:nth-child(1){display:none}.playlist-editor-mobile-v2 .editor-columns{grid-template-columns:1fr}.playlist-editor-mobile-v2 .editor-move{position:relative;width:32px;height:34px;cursor:grab;touch-action:none}.playlist-editor-mobile-v2 .editor-move button{display:none}.playlist-editor-mobile-v2 .editor-move:before,.playlist-editor-mobile-v2 .editor-move:after{content:"";position:absolute;left:7px;width:18px;height:2px;background:var(--muted);border-radius:999px}.playlist-editor-mobile-v2 .editor-move:before{top:12px}.playlist-editor-mobile-v2 .editor-move:after{top:20px}}';document.head.appendChild(style);
    const modal=$('#playlist-editor-v2');if(modal){new MutationObserver(()=>enhancePlaylistEditorMobile()).observe(modal,{childList:true,subtree:true});modal.addEventListener('click',event=>{const tab=event.target.closest('[data-editor-section]');if(tab){const box=modal.querySelector('.playlist-editor-mobile-v2');if(box){box.dataset.editorSection=tab.dataset.editorSection;enhancePlaylistEditorMobile()}return}});modal.addEventListener('pointerdown',event=>{const handle=event.target.closest('.editor-move'),row=handle?.closest('.editor-row[data-ref]');if(!row||!state.editor)return;if(event.pointerType==='mouse'&&event.button!==0)return;const rows=[...row.parentElement.querySelectorAll('.editor-row[data-ref]')],from=rows.indexOf(row);if(from<0)return;playlistParity.drag={ref:row.dataset.ref,from,row};row.classList.add('dragging-v2');try{handle.setPointerCapture(event.pointerId)}catch{}});window.addEventListener('pointerup',event=>{const drag=playlistParity.drag;if(!drag||!state.editor)return;playlistParity.drag=null;drag.row.classList.remove('dragging-v2');const target=playlistDragTarget(event.clientY,drag.row),draft=[...state.editor.draft],from=draft.indexOf(drag.ref);if(from<0)return;const [ref]=draft.splice(from,1);draft.splice(Math.max(0,Math.min(target,draft.length)),0,ref);state.editor.draft=draft;rerenderEditor();enhancePlaylistEditorMobile()})}
    document.addEventListener('click',event=>{const resume=event.target.closest('.playlist-resume-v2');if(!resume)return;event.preventDefault();const playlist=state.playlists.find(item=>String(item.id)===String(resume.dataset.id));if(!playlist)return;const index=Number(resume.dataset.itemIndex)||0,context=playlistContext(playlist,index),item=context.items[index];if(item)openPlayback(item.episode,{start:playlistResumeStart(playlist,context,index),context,itemRef:item.ref})});
    window.addEventListener('vedatorlanguagechange',()=>{refreshPlaylistProgress();enhancePlaylistEditorMobile()});
  }
`;

const startToken='\n  async function start(){';
if(!source.includes(startToken))throw new Error('start() marker not found');
source=source.replace(startToken,'\n'+block+startToken);
const oldInstall='installUiExperience();installFullParityUi();applyStaticUi();';
const newInstall='installUiExperience();installFullParityUi();installPlaylistParity();applyStaticUi();';
if(!source.includes(oldInstall))throw new Error('install chain not found');
source=source.replace(oldInstall,newInstall);
source=source.replace('refreshEpisodeCard(current.episode.number);if(force||completed!==Boolean(previous.completed))refreshSeriesProgress();','refreshEpisodeCard(current.episode.number);if(force||completed!==Boolean(previous.completed)){refreshSeriesProgress();refreshPlaylistProgress()}');
fs.writeFileSync(file,source);
console.log('Injected playlist progress and mobile editor parity into app-v2.js');
