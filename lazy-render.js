(()=>{
  if(window.__vedatorLazyRender)return;
  window.__vedatorLazyRender=true;

  const BATCH_SIZE=20;
  const PLAYBACK_PROGRESS_KEY='vedatorPlaybackProgressV1';
  const SORT_PREFERENCES_KEY='vedatorSortPreferencesV1';
  const dateFormatter=new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'long',year:'numeric'});
  let episodeObserver=null;
  let renderGeneration=0;
  let seriesSignature='';

  function readObject(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return {}}
  }

  function ensureSortOptions(){
    const select=document.querySelector('#episodeSort');
    if(!select)return;
    const options=[
      ['started','Rozposlouchané první'],
      ['completed','Poslechnuté první'],
      ['unheard','Neposlechnuté první']
    ];
    for(const [value,label] of options){
      if(select.querySelector(`option[value="${value}"]`))continue;
      const option=document.createElement('option');
      option.value=value;
      option.textContent=label;
      select.appendChild(option);
    }
  }

  function restoreSortPreferences(){
    ensureSortOptions();
    const preferences=readObject(SORT_PREFERENCES_KEY);
    const episodeSort=document.querySelector('#episodeSort');
    const seriesSort=document.querySelector('#seriesSort');
    if(episodeSort&&[...episodeSort.options].some(option=>option.value===preferences.episode))episodeSort.value=preferences.episode;
    if(seriesSort&&[...seriesSort.options].some(option=>option.value===preferences.series))seriesSort.value=preferences.series;
  }

  function saveSortPreferences(){
    const episodeSort=document.querySelector('#episodeSort');
    const seriesSort=document.querySelector('#seriesSort');
    try{
      localStorage.setItem(SORT_PREFERENCES_KEY,JSON.stringify({
        episode:episodeSort?.value||'new',
        series:seriesSort?.value||'count'
      }));
    }catch{}
  }

  function installSortPersistence(){
    const episodeSort=document.querySelector('#episodeSort');
    const seriesSort=document.querySelector('#seriesSort');
    if(episodeSort&&episodeSort.dataset.vedatorSortPersistence!=='1'){
      episodeSort.dataset.vedatorSortPersistence='1';
      episodeSort.addEventListener('change',saveSortPreferences);
    }
    if(seriesSort&&seriesSort.dataset.vedatorSortPersistence!=='1'){
      seriesSort.dataset.vedatorSortPersistence='1';
      seriesSort.addEventListener('change',saveSortPreferences);
    }
  }

  function disconnectEpisodeObserver(){
    if(episodeObserver){episodeObserver.disconnect();episodeObserver=null}
  }

  function episodeCard(e){
    const article=document.createElement('article');
    const dt=e.date?dateFormatter.format(new Date(e.date)):'';
    article.innerHTML=`<div class="date">${esc(dt)}</div><h2>${esc(e.title)}</h2><div class="desc">${esc(short(e.description)||'Popis není k dispozici.')}</div><div class="tags">${(e.cats.length?e.cats:['Ostatní']).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><div class="links">${e.enclosure?`<a class="primary" href="${esc(e.enclosure)}" target="_blank" rel="noopener">Přehrát</a>`:''}<a class="secondary" href="${esc(e.link||e.enclosure)}" target="_blank" rel="noopener">Detail dílu</a></div>${summaryHtml(Number(e.number))}`;
    return article;
  }

  function episodeKey(title){
    const number=String(title||'').match(/\bpodcast\s+(\d+)\b/i)?.[1];
    return number?`episode-${number}`:`title-${String(title||'').trim().toLowerCase()}`;
  }

  function listenState(episode,progress){
    const record=progress[episodeKey(episode.title)];
    if(record?.completed)return 'completed';
    if(Number(record?.currentTime)>=10)return 'started';
    return 'unheard';
  }

  function compareNewest(a,b){
    const dateDifference=new Date(b.date)-new Date(a.date);
    if(dateDifference)return dateDifference;
    return (Number(b.number)||0)-(Number(a.number)||0);
  }

  function compareListenState(a,b,sort,progress){
    const orders={
      started:{started:0,unheard:1,completed:2},
      completed:{completed:0,started:1,unheard:2},
      unheard:{unheard:0,started:1,completed:2}
    };
    const order=orders[sort];
    if(!order)return 0;
    const difference=order[listenState(a,progress)]-order[listenState(b,progress)];
    return difference||compareNewest(a,b);
  }

  function sortedEpisodes(){
    const arr=filtered();
    const queries=expandedQuery(document.querySelector('#search').value);
    const topics=selectedTopicQueries();
    const sort=document.querySelector('#episodeSort').value;
    const progress=['started','completed','unheard'].includes(sort)?readObject(PLAYBACK_PROGRESS_KEY):{};
    arr.sort((a,b)=>{
      if(topics.length&&a.topicMatch!==b.topicMatch)return a.topicMatch-b.topicMatch;
      if(queries.length&&a.searchMatch!==b.searchMatch)return a.searchMatch-b.searchMatch;
      const listenDifference=compareListenState(a,b,sort,progress);
      if(listenDifference)return listenDifference;
      return sort==='old'?new Date(a.date)-new Date(b.date):sort==='number'?(b.number||0)-(a.number||0):compareNewest(a,b);
    });
    return arr;
  }

  window.renderEpisodes=function(){
    disconnectEpisodeObserver();
    const generation=++renderGeneration;
    const arr=sortedEpisodes();
    window.__vedatorCurrentEpisodeTitles=arr.map(e=>e.title);
    const count=document.querySelector('#count');
    if(count)count.textContent=`Nalezeno ${arr.length} z ${episodes.length} epizod`;
    const box=document.querySelector('#episodes');
    box.replaceChildren();
    if(!arr.length){box.innerHTML='<div class="status">Nic jsem nenašel.</div>';return}

    let rendered=0;
    const sentinel=document.createElement('div');
    sentinel.className='status vedator-load-more';
    sentinel.textContent='Načítám další epizody…';

    const appendBatch=()=>{
      if(generation!==renderGeneration)return;
      const end=Math.min(rendered+BATCH_SIZE,arr.length);
      const fragment=document.createDocumentFragment();
      for(;rendered<end;rendered++)fragment.appendChild(episodeCard(arr[rendered]));
      box.insertBefore(fragment,sentinel);
      if(rendered>=arr.length){
        sentinel.remove();
        disconnectEpisodeObserver();
      }else{
        sentinel.textContent=`Zobrazeno ${rendered} z ${arr.length} · načítám další při posunu`;
      }
    };

    box.appendChild(sentinel);
    appendBatch();
    if(rendered<arr.length&&'IntersectionObserver'in window){
      episodeObserver=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting))appendBatch();
      },{rootMargin:'700px 0px'});
      episodeObserver.observe(sentinel);
    }else if(rendered<arr.length){
      sentinel.textContent='Zobrazit další epizody';
      sentinel.setAttribute('role','button');
      sentinel.tabIndex=0;
      sentinel.onclick=appendBatch;
      sentinel.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();appendBatch()}};
    }
  };

  function seriesBody(group){
    const body=document.createElement('div');
    body.className='series-body';
    const list=document.createElement('ol');
    const fragment=document.createDocumentFragment();
    for(const e of group.items){
      const li=document.createElement('li');
      const link=document.createElement('a');
      link.href=e.link||e.enclosure||'#';
      link.target='_blank';
      link.rel='noopener';
      if(group.people){
        const person=document.createElement('span');
        person.className='person-name';
        person.textContent=e.person;
        const title=document.createElement('span');
        title.className='episode-title';
        title.textContent=e.title;
        link.append(person,title);
      }else link.textContent=e.title;
      li.appendChild(link);
      fragment.appendChild(li);
    }
    list.appendChild(fragment);
    body.appendChild(list);
    return body;
  }

  function groupId(group){
    const items=(group.items||[]).map(item=>item.id||item.link||item.enclosure||item.title).join('|');
    return `${group.name}::${items}`;
  }

  window.renderSeries=function(){
    disconnectEpisodeObserver();
    ++renderGeneration;
    const count=document.querySelector('#count');
    const box=document.querySelector('#series');

    if(!window.__vedatorEpisodeTranslationsReady){
      if(count)count.textContent='Připravuji série…';
      if(box.dataset.vedatorSeriesState!=='loading'){
        box.dataset.vedatorSeriesState='loading';
        box.innerHTML='<div class="status">Připravuji série v konečné podobě…</div>';
      }
      return;
    }

    const groups=seriesGroups();
    const nextSignature=groups.map(groupId).join('\n');
    if(count)count.textContent=`Nalezeno ${groups.length} sérií`;
    if(nextSignature===seriesSignature&&box.dataset.vedatorSeriesState==='ready'&&box.querySelector('.series-card'))return;

    const openGroups=new Set([...box.querySelectorAll('.series-card[open]')].map(card=>card.dataset.vedatorSeriesId).filter(Boolean));
    const fragment=document.createDocumentFragment();
    box.replaceChildren();

    groups.forEach(group=>{
      const details=document.createElement('details');
      details.className='series-card';
      details.dataset.vedatorSeriesId=groupId(group);
      details.open=openGroups.has(details.dataset.vedatorSeriesId);
      const summary=document.createElement('summary');
      const name=document.createElement('span');
      name.textContent=group.name;
      const amount=document.createElement('span');
      amount.className='series-count';
      amount.textContent=`${group.items.length} dílů`;
      summary.append(name,amount);
      details.appendChild(summary);
      const loadBody=()=>{
        if(details.dataset.loaded==='1')return;
        details.dataset.loaded='1';
        details.appendChild(seriesBody(group));
      };
      details.addEventListener('toggle',()=>{if(details.open)loadBody()});
      if(details.open)loadBody();
      fragment.appendChild(details);
    });
    box.appendChild(fragment);
    box.dataset.vedatorSeriesState='ready';
    seriesSignature=nextSignature;
    window.__vedatorDecorateCollections?.();
    window.dispatchEvent(new Event('vedatorcontentchange'));
  };

  ensureSortOptions();
  restoreSortPreferences();
  installSortPersistence();
  window.addEventListener('storage',event=>{
    if(event.key===SORT_PREFERENCES_KEY){
      restoreSortPreferences();
      if(typeof render==='function')render();
    }else if(event.key===PLAYBACK_PROGRESS_KEY&&['started','completed','unheard'].includes(document.querySelector('#episodeSort')?.value)){
      if(typeof render==='function')render();
    }
  });
})();
