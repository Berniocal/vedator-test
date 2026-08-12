(()=>{
  if(window.__vedatorPlaylistEditorMobile)return;
  window.__vedatorPlaylistEditorMobile=true;

  const editor=document.querySelector('.vedator-editor');
  if(!editor)return;
  const box=editor.querySelector('.vedator-editor-box');
  const sourceSwitch=editor.querySelector('.vedator-source-switch');
  const columns=editor.querySelector('.vedator-editor-columns');
  const order=editor.querySelector('.vedator-edit-order');
  const choices=editor.querySelector('.vedator-editor-list');
  const search=editor.querySelector('.vedator-editor-search');
  if(!box||!sourceSwitch||!columns||!order||!choices)return;

  const PLAYLIST_KEY='vedator-user-playlists-v1';
  const language=()=>{try{return window.vedatorUiLanguage?.()==='sk'?'sk':'cz'}catch{return'cz'}};
  const text=(cz,sk)=>language()==='sk'?sk:cz;
  const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};
  const isMobile=()=>window.matchMedia?window.matchMedia('(max-width:650px)').matches:window.innerWidth<=650;

  const style=document.createElement('style');
  style.textContent=`
    .vedator-editor-work-switch{display:none}
    .vedator-editor-mobile-enhanced .vedator-edit-controls{
      position:relative;display:flex;align-items:center;justify-content:center;width:30px;height:34px;
      gap:0;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none
    }
    .vedator-editor-mobile-enhanced .vedator-edit-controls:active{cursor:grabbing}
    .vedator-editor-mobile-enhanced .vedator-edit-controls::before,
    .vedator-editor-mobile-enhanced .vedator-edit-controls::after{
      content:"";position:absolute;left:6px;width:18px;height:2px;border-radius:999px;background:var(--muted)
    }
    .vedator-editor-mobile-enhanced .vedator-edit-controls::before{top:12px}
    .vedator-editor-mobile-enhanced .vedator-edit-controls::after{top:20px}
    .vedator-editor-mobile-enhanced .vedator-edit-move{display:none!important}
    .vedator-editor-mobile-enhanced .vedator-edit-row.vedator-dragging{
      opacity:.97;box-shadow:0 10px 28px rgba(0,0,0,.34);border-color:var(--accent);background:rgba(124,92,255,.14)
    }
    .vedator-editor-mobile-enhanced .vedator-edit-placeholder{
      box-sizing:border-box;border:1px dashed var(--accent);border-radius:10px;background:rgba(124,92,255,.08)
    }
    @media(max-width:650px){
      .vedator-editor{padding:6px;align-items:stretch}
      .vedator-editor-box.vedator-editor-mobile-enhanced{
        width:100%;height:calc(100dvh - 12px);max-height:calc(100dvh - 12px);
        grid-template-rows:auto auto auto minmax(0,1fr) auto;border-radius:18px
      }
      .vedator-editor-mobile-enhanced .vedator-editor-head{padding:10px 13px}
      .vedator-editor-mobile-enhanced .vedator-editor-head strong{font-size:1.05rem}
      .vedator-editor-mobile-enhanced .vedator-source-switch{padding:7px 10px;gap:6px}
      .vedator-editor-mobile-enhanced .vedator-source-switch button{flex:1;padding:7px 10px}
      .vedator-editor-work-switch{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:7px 10px;border-bottom:1px solid var(--line)}
      .vedator-editor-work-switch button{min-width:0;border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:10px;padding:8px 7px;font:inherit;font-size:.86rem;font-weight:800;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .vedator-editor-work-switch button.active{background:var(--accent2);border-color:var(--accent);color:var(--accent)}
      .vedator-editor-mobile-enhanced .vedator-editor-columns{display:block;min-height:0;overflow:hidden}
      .vedator-editor-mobile-enhanced .vedator-editor-pane{height:100%;min-height:0;padding:9px 9px 0}
      .vedator-editor-mobile-enhanced .vedator-editor-pane+.vedator-editor-pane{border:0}
      .vedator-editor-mobile-enhanced[data-mobile-section="added"] .vedator-editor-pane:nth-child(2),
      .vedator-editor-mobile-enhanced[data-mobile-section="add"] .vedator-editor-pane:nth-child(1){display:none}
      .vedator-editor-mobile-enhanced .vedator-editor-pane h3{margin:1px 1px 7px;font-size:1rem;line-height:1.2}
      .vedator-editor-mobile-enhanced .vedator-editor-scroll{height:100%;padding-bottom:9px;overscroll-behavior:contain}
      .vedator-editor-mobile-enhanced .vedator-editor-search{margin-bottom:7px;padding:9px 11px;border-radius:10px;font-size:.94rem}
      .vedator-editor-mobile-enhanced .vedator-editor-list,
      .vedator-editor-mobile-enhanced .vedator-edit-order{gap:5px}
      .vedator-editor-mobile-enhanced .vedator-editor-choice,
      .vedator-editor-mobile-enhanced .vedator-edit-row{gap:7px;border-radius:10px;padding:7px 9px;min-height:0}
      .vedator-editor-mobile-enhanced .vedator-editor-choice{grid-template-columns:24px minmax(0,1fr) auto;font-size:.92rem;line-height:1.2}
      .vedator-editor-mobile-enhanced .vedator-editor-choice input{width:18px;height:18px;margin:0}
      .vedator-editor-mobile-enhanced .vedator-editor-choice small{font-size:.78rem;white-space:nowrap}
      .vedator-editor-mobile-enhanced .vedator-edit-row{grid-template-columns:32px minmax(0,1fr) 30px;font-size:.91rem;line-height:1.18}
      .vedator-editor-mobile-enhanced .vedator-edit-row b{font-size:.93rem}
      .vedator-editor-mobile-enhanced .vedator-item-sub{font-size:.76rem}
      .vedator-editor-mobile-enhanced .vedator-edit-controls{
        position:relative;display:flex;align-items:center;justify-content:center;width:30px;height:34px;
        gap:0;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none
      }
      .vedator-editor-mobile-enhanced .vedator-edit-controls:active{cursor:grabbing}
      .vedator-editor-mobile-enhanced .vedator-edit-controls::before,
      .vedator-editor-mobile-enhanced .vedator-edit-controls::after{
        content:"";position:absolute;left:6px;width:18px;height:2px;border-radius:999px;background:var(--muted)
      }
      .vedator-editor-mobile-enhanced .vedator-edit-controls::before{top:12px}
      .vedator-editor-mobile-enhanced .vedator-edit-controls::after{top:20px}
      .vedator-editor-mobile-enhanced .vedator-edit-move{display:none!important}
      .vedator-editor-mobile-enhanced .vedator-edit-remove{min-width:28px;min-height:27px;padding:2px;font-size:.88rem}
      .vedator-editor-mobile-enhanced .vedator-edit-row.vedator-dragging{
        opacity:.97;box-shadow:0 10px 28px rgba(0,0,0,.34);border-color:var(--accent);background:rgba(124,92,255,.14)
      }
      .vedator-editor-mobile-enhanced .vedator-edit-placeholder{
        box-sizing:border-box;border:1px dashed var(--accent);border-radius:10px;background:rgba(124,92,255,.08)
      }
      .vedator-editor-mobile-enhanced .vedator-playlist-empty{padding:18px 8px}
      .vedator-editor-mobile-enhanced .vedator-editor-foot{padding:8px 10px max(8px,env(safe-area-inset-bottom));gap:8px}
      .vedator-editor-mobile-enhanced .vedator-editor-save,
      .vedator-editor-mobile-enhanced .vedator-editor-cancel{padding:9px 14px}
    }
  `;
  document.head.appendChild(style);

  const workSwitch=document.createElement('div');
  workSwitch.className='vedator-editor-work-switch';
  workSwitch.innerHTML='<button type="button" data-section="added"></button><button type="button" data-section="add"></button>';
  sourceSwitch.after(workSwitch);
  box.classList.add('vedator-editor-mobile-enhanced');

  const addedButton=workSwitch.querySelector('[data-section="added"]');
  const addButton=workSwitch.querySelector('[data-section="add"]');
  let drag=null;

  function currentMode(){return sourceSwitch.querySelector('button.active')?.dataset.mode==='q'?'q':'e'}
  function selectedCount(){return order.querySelectorAll('.vedator-edit-row[data-ref]').length}
  function setSection(section,focus=false){
    const value=section==='add'?'add':'added';
    if(box.dataset.mobileSection!==value)box.dataset.mobileSection=value;
    addedButton.classList.toggle('active',value==='added');
    addButton.classList.toggle('active',value==='add');
    if(focus&&value==='add')search?.focus({preventScroll:true});
  }
  function sync(countOverride){
    const count=Number.isInteger(countOverride)?countOverride:selectedCount();
    setText(addedButton,text(`Přidané (${count})`,`Pridané (${count})`));
    setText(addButton,currentMode()==='q'?text('Přidat otázky','Pridať otázky'):text('Přidat epizody','Pridať epizódy'));
    if(!box.dataset.mobileSection)setSection(count?'added':'add');
    else setSection(box.dataset.mobileSection);
  }
  const syncAfterEvent=()=>queueMicrotask(sync);

  function cleanupRow(row){
    if(!row)return;
    row.classList.remove('vedator-dragging');
    row.style.position='';row.style.left='';row.style.top='';row.style.width='';row.style.zIndex='';row.style.pointerEvents='';
  }
  function targetIndex(placeholder,row){
    return Array.from(order.children)
      .filter(el=>el!==row&&(el===placeholder||el.classList?.contains('vedator-edit-row')))
      .indexOf(placeholder);
  }
  function rowByRef(ref){return Array.from(order.querySelectorAll('.vedator-edit-row[data-ref]')).find(row=>row.dataset.ref===ref)||null}
  function applyMove(ref,from,to){
    if(from===to||to<0)return;
    let at=from;
    while(at>to){
      const button=rowByRef(ref)?.querySelector('.up');
      if(!button||button.disabled)break;
      button.click();at--;
    }
    while(at<to){
      const button=rowByRef(ref)?.querySelector('.down');
      if(!button||button.disabled)break;
      button.click();at++;
    }
    queueMicrotask(sync);
  }
  function movePlaceholder(clientY){
    if(!drag)return;
    const {row,placeholder}=drag;
    const rows=Array.from(order.querySelectorAll('.vedator-edit-row')).filter(item=>item!==row);
    let inserted=false;
    for(const candidate of rows){
      const rect=candidate.getBoundingClientRect();
      if(clientY<rect.top+rect.height/2){order.insertBefore(placeholder,candidate);inserted=true;break}
    }
    if(!inserted)order.appendChild(placeholder);
  }
  function autoScroll(clientY){
    const scroller=drag?.scroller;if(!scroller)return;
    const rect=scroller.getBoundingClientRect();
    if(clientY<rect.top+46)scroller.scrollTop-=18;
    else if(clientY>rect.bottom-46)scroller.scrollTop+=18;
  }
  function pointerMove(event){
    if(!drag||event.pointerId!==drag.pointerId)return;
    event.preventDefault();
    drag.row.style.top=`${event.clientY-drag.offsetY}px`;
    autoScroll(event.clientY);
    movePlaceholder(event.clientY);
  }
  function pointerEnd(event){
    if(!drag||event.pointerId!==drag.pointerId)return;
    event.preventDefault();
    const state=drag;
    const to=targetIndex(state.placeholder,state.row);
    cleanupRow(state.row);
    state.placeholder.replaceWith(state.row);
    drag=null;
    applyMove(state.ref,state.from,to);
  }
  function cancelDrag(){
    if(!drag)return;
    const state=drag;
    cleanupRow(state.row);
    state.placeholder.replaceWith(state.row);
    drag=null;
    sync();
  }

  order.addEventListener('pointerdown',event=>{
    const handle=event.target.closest('.vedator-edit-controls');
    if(!handle||drag)return;
    const row=handle.closest('.vedator-edit-row[data-ref]');
    if(!row)return;
    if(event.pointerType==='mouse'&&event.button!==0)return;
    event.preventDefault();
    const rows=Array.from(order.querySelectorAll('.vedator-edit-row[data-ref]'));
    const from=rows.indexOf(row);
    if(from<0)return;
    const rect=row.getBoundingClientRect();
    const placeholder=document.createElement('div');
    placeholder.className='vedator-edit-placeholder';
    placeholder.style.height=`${rect.height}px`;
    row.after(placeholder);
    row.classList.add('vedator-dragging');
    row.style.position='fixed';row.style.left=`${rect.left}px`;row.style.top=`${rect.top}px`;row.style.width=`${rect.width}px`;row.style.zIndex='10002';row.style.pointerEvents='none';
    drag={pointerId:event.pointerId,row,placeholder,ref:row.dataset.ref,from,offsetY:event.clientY-rect.top,scroller:row.closest('.vedator-editor-scroll')};
    try{handle.setPointerCapture(event.pointerId)}catch{}
  });
  window.addEventListener('pointermove',pointerMove,{passive:false});
  window.addEventListener('pointerup',pointerEnd,{passive:false});
  window.addEventListener('pointercancel',cancelDrag,{passive:false});

  workSwitch.addEventListener('click',event=>{
    const button=event.target.closest('button[data-section]');
    if(button)setSection(button.dataset.section,true);
  });
  choices.addEventListener('change',syncAfterEvent);
  order.addEventListener('click',syncAfterEvent);
  sourceSwitch.addEventListener('click',syncAfterEvent);
  window.addEventListener('vedatorlanguagechange',sync);
  window.addEventListener('resize',()=>{if(!isMobile())cancelDrag()});

  document.addEventListener('click',event=>{
    const edit=event.target.closest('.vedator-playlist-icon.edit');
    if(!edit)return;
    delete box.dataset.mobileSection;
    let count=null;
    try{
      const id=edit.closest('.vedator-playlist-card')?.dataset.id;
      const playlists=JSON.parse(localStorage.getItem(PLAYLIST_KEY)||'[]');
      const playlist=Array.isArray(playlists)?playlists.find(item=>String(item?.id)===String(id)):null;
      if(playlist)count=Array.isArray(playlist.items)?playlist.items.length:0;
    }catch{}
    if(Number.isInteger(count))sync(count);
    else queueMicrotask(sync);
  });

  sync();
})();
