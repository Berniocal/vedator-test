(()=>{
  if(window.__vedatorTranslatedQuestionHighlight)return;
  window.__vedatorTranslatedQuestionHighlight=true;

  if(!document.querySelector('style[data-vedator-match-style]')){
    const style=document.createElement('style');
    style.dataset.vedatorMatchStyle='1';
    style.textContent='mark.vedator-match{background:#ffe66b!important;color:inherit!important;border-radius:.28em;padding:.03em .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}html.theme-dark mark.vedator-match{background:#8a6d00!important;color:#fff4b3!important}';
    document.head.appendChild(style);
  }

  const TOPIC_TERMS={
    'Vesmír':['vesmir','hvezd','hviezd','planet','galaxi','slunce','slnko','mesic','mesiac','jupiter','kosmolog','rozpin'],
    'Černé díry':['cerna dira','cierna diera','cernych der','ciernych dier','hawking','singularit'],
    'Čierne diery':['cerna dira','cierna diera','cernych der','ciernych dier','hawking','singularit'],
    'Kvantová fyzika':['kvant','superpoz','spleten','previazan','orbital','wimp','vakuu','vakua'],
    'Relativita a gravitace':['relativ','gravit','casoprostor','casopriestor','rychlost svetla','rychlost svetla'],
    'Relativita a gravitácia':['relativ','gravit','casoprostor','casopriestor','rychlost svetla','rychlost svetla'],
    'Matematika':['matemat','prvocisl','prvocisl','nekonec','nekonec','paradox','entrop','laplace','tri teles'],
    'Biologie a medicína':['vitamin','gen','gmo','mozek','mozog','spanek','spanok','zrcadlov','zrkadlov','cvicit'],
    'Biológia a medicína':['vitamin','gen','gmo','mozek','mozog','spanek','spanok','zrcadlov','zrkadlov','cvicit'],
    'Technologie':['pocitac','mikrovln','gps','bater','vodik','auto','klavesnic','tiktok','kryptom','fotovolta'],
    'Technológie':['pocitac','mikrovln','gps','bater','vodik','auto','klavesnic','tiktok','kryptom','fotovolta'],
    'Země a příroda':['zeme','zem','ocean','ledovec','sopk','tornado','pocasi','pocasie','vzduch','mrak','atmosfer'],
    'Zem a príroda':['zeme','zem','ocean','ledovec','sopk','tornado','pocasi','pocasie','vzduch','mrak','atmosfer'],
    'Chemie':['atom','molekul','prvek','prvok','helium','deuter','voda','jogurt','zlato'],
    'Chémia':['atom','molekul','prvek','prvok','helium','deuter','voda','jogurt','zlato'],
    'Ostatní':['podcast','jazyk','wikipedia','anime','videohry','recept','motiv','pravo','plochozem'],
    'Ostatné':['podcast','jazyk','wikipedia','anime','videohry','recept','motiv','pravo','plochozem']
  };

  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const questionsTopics=()=>[...document.querySelectorAll('.topics')].find(box=>box.querySelector('.topic[data-topic="Vše"],.topic[data-topic="Všetko"]'));
  const terms=()=>{
    const query=String(document.querySelector('#search')?.value||'').trim();
    const normalizedQuery=norm(query);
    const searchTerms=query?[normalizedQuery,...normalizedQuery.split(/\s+/).filter(Boolean)]:[];
    const active=questionsTopics()?.querySelector('.topic.active');
    const topic=active?.dataset.topic||active?.textContent?.trim()||'';
    const topicTerms=topic&&topic!=='Vše'&&topic!=='Všetko'?(TOPIC_TERMS[topic]||[]):[];
    return [...new Set([...searchTerms,...topicTerms.map(norm)].filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
  };

  function unwrapMarks(root){
    root.querySelectorAll('mark.vedator-match').forEach(mark=>mark.replaceWith(document.createTextNode(mark.textContent||'')));
    root.normalize();
  }

  function markTextNode(node,needles){
    const raw=node.nodeValue||'',normalized=norm(raw),ranges=[];
    for(const term of needles){
      if(!term)continue;
      let at=0;
      while((at=normalized.indexOf(term,at))!==-1){ranges.push([at,at+term.length]);at+=Math.max(1,term.length)}
    }
    if(!ranges.length)return;
    ranges.sort((a,b)=>a[0]-b[0]||b[1]-a[1]);
    const merged=[];
    for(const range of ranges){const last=merged.at(-1);if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);else merged.push([...range])}
    const fragment=document.createDocumentFragment();let pos=0;
    for(const [start,end] of merged){
      if(start>pos)fragment.append(document.createTextNode(raw.slice(pos,start)));
      const mark=document.createElement('mark');mark.className='vedator-match';mark.textContent=raw.slice(start,end);fragment.append(mark);pos=end;
    }
    if(pos<raw.length)fragment.append(document.createTextNode(raw.slice(pos)));
    node.replaceWith(fragment);
  }

  let observer;
  function apply(){
    const view=document.querySelector('#questions');if(!view)return;
    observer?.disconnect();const needles=terms();
    view.querySelectorAll('.faq-question-card h2,.faq-question-card li,.faq-question-card p').forEach(element=>{
      unwrapMarks(element);if(!needles.length)return;
      const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement?.closest('mark,mjx-container,script,style')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>markTextNode(node,needles));
    });
    observe();
  }

  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  function observe(){
    if(!document.body)return;
    if(!observer)observer=new MutationObserver(records=>{if(records.some(record=>record.target.closest?.('#questions')||[...record.addedNodes].some(node=>node.nodeType===1&&node.matches?.('#questions,#questions *'))))schedule()});
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  document.addEventListener('input',event=>{if(event.target?.id==='search')schedule()},true);
  document.addEventListener('click',event=>{if(event.target.closest?.('.topics .topic'))setTimeout(schedule,0)},true);
  window.addEventListener('vedatorlanguagechange',()=>setTimeout(schedule,0));
  window.addEventListener('vedatorcontentchange',schedule);
  window.addEventListener('vedatorepisodetranslationsready',schedule);
  observe();schedule();
})();
