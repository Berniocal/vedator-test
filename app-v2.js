(()=>{
  if(window.__vedatorV2)return;
  window.__vedatorV2=true;

  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const fmtDate=v=>{try{return new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'numeric',year:'numeric'}).format(new Date(v))}catch{return String(v||'')}};
  const state={data:null,view:'episodes',query:''};

  function cardEpisode(e){
    return `<article class="card searchable" data-search="${esc(norm(`${e.number} ${e.title} ${e.description}`))}">
      <div class="meta">Díl ${e.number||'–'} • ${esc(fmtDate(e.date))}</div>
      <h2>${esc(e.title)}</h2>
      <p>${esc(e.description||'')}</p>
      <div class="actions">${e.enclosure?`<a href="${esc(e.enclosure)}">Přehrát</a>`:''}${e.link?`<a class="secondary" href="${esc(e.link)}">Detail</a>`:''}</div>
    </article>`;
  }

  function cardQuestion(q,label='Díl'){
    return `<article class="card searchable" data-search="${esc(norm(`${q.episode} ${q.title} ${(q.points||[]).join(' ')}`))}">
      <div class="meta">${label} ${q.episode} • ${esc(q.time||q.sourceTime||'')}</div>
      <h2>${esc(q.title)}</h2>
      <ul>${(q.points||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
      <div class="actions"><button type="button" class="play" data-episode="${q.episode}" data-seconds="${Number(q.seconds)||0}">Přehrát</button></div>
    </article>`;
  }

  function flattenNonQuestions(data){
    const out=[];
    for(const [episode,languages] of Object.entries(data?.nonquestions?.episodes||{})){
      const items=languages?.cs||languages?.sk||[];
      items.forEach((item,order)=>out.push({episode:Number(episode),order,time:item.time||'0:00',title:item.title||`Položka ${order+1}`,points:item.points||[]}));
    }
    return out.sort((a,b)=>b.episode-a.episode||a.order-b.order);
  }

  function renderEpisodes(){
    $('#episodes-v2').innerHTML=state.data.episodes.map(cardEpisode).join('');
    $('#count-v2').textContent=`${state.data.episodes.length} epizod`;
  }

  function renderSeries(){
    const byNumber=new Map(state.data.episodes.map(e=>[Number(e.number),e]));
    $('#series-v2').innerHTML=state.data.series.map(series=>{
      const eps=series.episodes.map(n=>byNumber.get(Number(n))).filter(Boolean);
      const search=norm(`${series.name} ${eps.map(e=>e.title).join(' ')}`);
      return `<details class="series searchable" data-search="${esc(search)}"><summary><strong>${esc(series.name)}</strong><span>${eps.length} dílů</span></summary><ol>${eps.map(e=>`<li>Díl ${e.number}: ${esc(e.title)}</li>`).join('')}</ol></details>`;
    }).join('');
  }

  function renderQuestions(){
    $('#questions-v2').innerHTML=state.data.questions.map(q=>cardQuestion(q)).join('');
  }

  function renderNonQuestions(){
    const items=flattenNonQuestions(state.data);
    $('#nonquestions-v2').innerHTML=items.map(q=>cardQuestion(q,'Díl')).join('');
    $('#nonquestions-v2').dataset.count=String(items.length);
  }

  function loadPlaylists(){
    const keys=['vedatorPlaylists','vedator-playlists','vedator-playlists-v1'];
    let playlists=[];
    for(const key of keys){
      try{
        const parsed=JSON.parse(localStorage.getItem(key)||'null');
        if(Array.isArray(parsed)){playlists=parsed;break}
      }catch{}
    }
    const box=$('#playlists-v2');
    if(!playlists.length){box.innerHTML='<div class="empty">Playlisty jsou připravené jako samostatná záložka. Převod jejich plné logiky bude další krok.</div>';return}
    box.innerHTML=playlists.map(p=>`<article class="card"><h2>${esc(p.name||'Playlist')}</h2><p>${Array.isArray(p.items)?p.items.length:0} položek</p></article>`).join('');
  }

  function setView(view){
    state.view=view;
    $$('.tab-v2').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    $$('.view-v2').forEach(v=>v.classList.toggle('hidden',v.dataset.view!==view));
    filterActive();
  }

  function filterActive(){
    const q=norm(state.query.trim());
    const active=$(`.view-v2[data-view="${state.view}"]`);
    if(!active)return;
    const cards=[...active.querySelectorAll('.searchable')];
    let shown=0;
    cards.forEach(card=>{
      const ok=!q||String(card.dataset.search||'').includes(q);
      card.classList.toggle('filtered-out',!ok);
      if(ok)shown++;
    });
    if(state.view==='episodes')$('#count-v2').textContent=q?`${shown} nalezených epizod`:`${state.data.episodes.length} epizod`;
    else if(state.view==='questions')$('#count-v2').textContent=q?`${shown} nalezených otázek`:`${state.data.questions.length} otázek`;
    else if(state.view==='nonquestions')$('#count-v2').textContent=q?`${shown} nalezených položek`:`${active.dataset.count||shown} neotázek`;
    else if(state.view==='series')$('#count-v2').textContent=q?`${shown} nalezených sérií`:`${state.data.series.length} sérií`;
    else $('#count-v2').textContent='Playlisty';
  }

  function bind(){
    $$('.tab-v2').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $('#search-v2').addEventListener('input',event=>{state.query=event.target.value;filterActive()});
    document.addEventListener('click',event=>{
      const play=event.target.closest?.('.play');
      if(!play)return;
      const episode=Number(play.dataset.episode),seconds=Number(play.dataset.seconds)||0;
      const ep=state.data.episodes.find(e=>Number(e.number)===episode);
      if(!ep?.enclosure)return;
      const audio=$('#audio-v2');
      audio.src=ep.enclosure;
      audio.addEventListener('loadedmetadata',()=>{audio.currentTime=Math.min(seconds,Number.isFinite(audio.duration)?audio.duration:seconds);audio.play().catch(()=>{})},{once:true});
      audio.play().catch(()=>{});
    });
  }

  async function start(){
    const status=$('#status-v2');
    try{
      const response=await fetch('./content-v2.json',{cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      state.data=await response.json();
      renderEpisodes();
      renderSeries();
      renderQuestions();
      renderNonQuestions();
      loadPlaylists();
      bind();
      setView('episodes');
      status.textContent=`V2 načtena: ${state.data.episodes.length} epizod, ${state.data.questions.length} otázek.`;
      document.documentElement.dataset.vedatorV2Ready='1';
      window.dispatchEvent(new CustomEvent('vedator-v2-ready',{detail:{episodes:state.data.episodes.length,questions:state.data.questions.length}}));
    }catch(error){
      status.textContent=`V2 se nepodařilo načíst: ${error.message}`;
      status.classList.add('error');
      console.error(error);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
