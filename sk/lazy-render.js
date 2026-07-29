(()=>{
  if(window.__vedatorLazyRender)return;
  window.__vedatorLazyRender=true;

  const BATCH_SIZE=20;
  const dateFormatter=new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'long',year:'numeric'});
  let episodeObserver=null;
  let renderGeneration=0;

  function disconnectEpisodeObserver(){
    if(episodeObserver){episodeObserver.disconnect();episodeObserver=null}
  }

  function episodeCard(e){
    const article=document.createElement('article');
    const dt=e.date?dateFormatter.format(new Date(e.date)):'';
    article.innerHTML=`<div class="date">${esc(dt)}</div><h2>${esc(e.title)}</h2><div class="desc">${esc(short(e.description)||'Popis není k dispozici.')}</div><div class="tags">${(e.cats.length?e.cats:['Ostatné']).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><div class="links">${e.enclosure?`<a class="primary" href="${esc(e.enclosure)}"Target="_blank" rel="noopener">Predhrávať</a>`:''}<a class="secondary" href="${esc(e.link||e.enclosure)}"Detail"</a></div>${summaryHtml(Number(e.number))}`;
    return article;
  }

  function sortedEpisodes(){
    const arr=filtered();
    const queries=expandedQuery(document.querySelector('#search').value);
    const topics=selectedTopicQueries();
    const sort=document.querySelector('#episodeSort').value;
    arr.sort((a,b)=>{
      if(topics.length&&a.topicMatch!==b.topicMatch)return a.topicMatch-b.topicMatch;
      if(queries.length&&a.searchMatch!==b.searchMatch)return a.searchMatch-b.searchMatch;
      return sort==='old'?new Date(a.date)-new Date(b.date):sort==='number'?(b.number||0)-(a.number||0):new Date(b.date)-new Date(a.date);
    });
    return arr;
  }

  window.renderEpisodes=function(){
    disconnectEpisodeObserver();
    const generation=++renderGeneration;
    const arr=sortedEpisodes();
    window.__vedatorCurrentEpisodeTitles=arr.map(e=>e.title);
    const count=document.querySelector('#count');
    if(count)count.textContent=`Našli sme ho .${arr.length} z ${episodes.length} epizod`;
    const box=document.querySelector('#episodes');
    box.replaceChildren();
    if(!arr.length){box.innerHTML='<div class="status">Nic jsem nenašel.</div>';return}

    let rendered=0;
    const sentinel=document.createElement('div');
    sentinel.className='status vedator-load-more';
    sentinel.textContent='Čítam ďalšie epizódy...';

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
        sentinel.textContent=`Vytvorené${rendered} z ${arr.length}· nakladať ďalšie pri prechode`;
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
      sentinel.textContent='Predstaviť ďalšie epizódy';
      sentinel.setAttribute('role','button');
      sentinel.tabIndex=0;
      sentinel.onclick=appendBatch;
      sentinel.onkeydown=event=>{if(event.key==='Vstup'||event.key===' '){event.preventDefault();appendBatch()}};
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

  window.renderSeries=function(){
    disconnectEpisodeObserver();
    ++renderGeneration;
    const groups=seriesGroups();
    const count=document.querySelector('#count');
    if(count)count.textContent=`Našli sme ho .${groups.length} sérií`;
    const box=document.querySelector('#series');
    const fragment=document.createDocumentFragment();
    box.replaceChildren();

    groups.forEach(group=>{
      const details=document.createElement('details');
      details.className='series-card';
      const summary=document.createElement('summary');
      const name=document.createElement('span');
      name.textContent=group.name;
      const amount=document.createElement('span');
      amount.className='series-count';
      amount.textContent=`${group.items.length} dílů`;
      summary.append(name,amount);
      details.appendChild(summary);
      details.addEventListener('toggle',()=>{
        if(details.open&&details.dataset.loaded!=='1'){
          details.dataset.loaded='1';
          details.appendChild(seriesBody(group));
        }
      });
      fragment.appendChild(details);
    });
    box.appendChild(fragment);
  };
})();
