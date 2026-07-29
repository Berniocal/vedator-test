(()=>{
  if(window.__vedatorHighlightPatch)return;
  window.__vedatorHighlightPatch=true;

  const style=document.createElement('style');
  style.textContent=`
    mark.vedator-match{background:#ffe66b;color:inherit;border-radius:.28em;padding:.03em .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
    html.theme-dark mark.vedator-match{background:#8a6d00;color:#fff4b3}
    .links button.vedator-read-more{flex:1;text-align:center;border-radius:10px;padding:9px;font-weight:700;border:1px solid var(--line);color:var(--ink);background:transparent;cursor:pointer}
    .links button.vedator-read-more:active{transform:translateY(1px)}
    article.vedator-description-expanded .desc{-webkit-line-clamp:unset;display:block;overflow:visible}
    article.vedator-description-expanded .desc p{margin:0 0 .9em}
    article.vedator-description-expanded .desc p:last-child{margin-bottom:0}
    article.vedator-description-expanded .desc ul,article.vedator-description-expanded .desc ol{margin:.5em 0 .9em;padding-left:1.3em}
    article.vedator-description-expanded .desc a{color:var(--accent);text-decoration:underline;overflow-wrap:anywhere}
  `;
  document.head.appendChild(style);

  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const isWordChar=char=>/[a-z0-9]/.test(char||'');

  function currentTerms(){
    const query=document.querySelector('#search')?.value?.trim()||'';
    if(query)return [...new Set([query,...query.split(/\s+/)].map(normalize).filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
    try{
      if(typeof active==='string'&&active!=='Všetko'&&typeof TOPICS!=='undefined'){
        const topicTerms=Array.isArray(TOPICS[active])?TOPICS[active]:[];
        return [...new Set(topicTerms.map(normalize).filter(term=>term.length>=2))].sort((a,b)=>b.length-a.length);
      }
    }catch(error){}
    return [];
  }

  function normalizedTextWithMap(text){
    let normalized='';const map=[];
    for(let i=0;i<text.length;i++){
      const part=normalize(text[i]);normalized+=part;
      for(let j=0;j<part.length;j++)map.push(i);
    }
    return {normalized,map};
  }

  function validOccurrence(text,index,term){
    const before=text[index-1]||'';
    const after=text[index+term.length]||'';
    if(isWordChar(before))return false;
    if(term.includes(' ')||term.length<=3)return !isWordChar(after);
    return true;
  }

  function rangesFor(text,terms){
    const {normalized,map}=normalizedTextWithMap(text);const ranges=[];
    for(const term of terms){
      let from=0;
      while(from<normalized.length){
        const index=normalized.indexOf(term,from);if(index<0)break;
        if(validOccurrence(normalized,index,term)){
          const start=map[index],end=(map[index+term.length-1]??start)+1;
          if(!ranges.some(range=>start<range.end&&end>range.start))ranges.push({start,end,index,length:term.length});
        }
        from=index+Math.max(1,term.length);
      }
    }
    return ranges.sort((a,b)=>a.start-b.start);
  }

  function plainDescription(value){
    const box=document.createElement('div');box.innerHTML=String(value||'');
    return (box.textContent||'').replace(/\s+/g,' ').trim();
  }

  function safeRichDescription(value){
    const source=document.createElement('div');source.innerHTML=String(value||'');
    source.querySelectorAll('script,style,iframe,object,embed,form,input,button').forEach(node=>node.remove());
    source.querySelectorAll('*').forEach(node=>{
      [...node.attributes].forEach(attr=>{const name=attr.name.toLowerCase();if(name.startsWith('on')||name==='style')node.removeAttribute(attr.name);});
      if(node.tagName==='A'){
        const href=node.getAttribute('href')||'';
        if(!/^https?:\/\//i.test(href)){node.replaceWith(document.createTextNode(node.textContent||''));return;}
        node.target='_blank';node.rel='noopener noreferrer';
      }
    });
    const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);const texts=[];while(walker.nextNode())texts.push(walker.currentNode);
    const urlPattern=/(https?:\/\/[^\s<>]+)/g;
    texts.forEach(textNode=>{
      if(textNode.parentElement?.closest('a'))return;
      const text=textNode.nodeValue||'';if(!urlPattern.test(text))return;urlPattern.lastIndex=0;
      const frag=document.createDocumentFragment();let pos=0,match;
      while((match=urlPattern.exec(text))){
        if(match.index>pos)frag.append(document.createTextNode(text.slice(pos,match.index)));
        const a=document.createElement('a');a.href=match[0];a.textContent=match[0];a.target='_blank';a.rel='noopener noreferrer';frag.append(a);pos=match.index+match[0].length;
      }
      if(pos<text.length)frag.append(document.createTextNode(text.slice(pos)));textNode.replaceWith(frag);
    });
    return source;
  }

  function episodeForArticle(article){
    const title=article.querySelector('h2')?.textContent?.trim();if(!title)return null;
    try{
      if(typeof episodes!=='undefined'&&Array.isArray(episodes)){
        const number=title.match(/\bpodcast\s+(\d+)\b/i)?.[1];
        if(number){const byNumber=episodes.find(item=>String(item.number)===number);if(byNumber)return byNumber;}
        return episodes.find(item=>String(item.title||'').trim()===title)||null;
      }
    }catch(error){}
    return null;
  }

  function excerptAroundMatch(text,terms){
    const clean=String(text||'').replace(/\s+/g,' ').trim();
    if(!clean)return 'Popis nie je k dispozícii.';
    if(!terms.length)return clean.length>330?clean.slice(0,327).trimEnd()+'…':clean;
    const ranges=rangesFor(clean,terms);
    if(!ranges.length)return clean.length>330?clean.slice(0,327).trimEnd()+'…':clean;
    const first=ranges[0];let start=Math.max(0,first.start-115),end=Math.min(clean.length,Math.max(first.end+180,start+330));
    while(start>0&&!/\s/.test(clean[start-1]))start--;
    while(end<clean.length&&!/\s/.test(clean[end]))end++;
    return (start>0?'…':'')+clean.slice(start,end).trim()+(end<clean.length?'…':'');
  }

  function unwrapMarks(root){root.querySelectorAll('mark.vedator-match').forEach(mark=>mark.replaceWith(document.createTextNode(mark.textContent||'')));root.normalize();}

  function highlightTextNode(textNode,terms){
    const text=textNode.nodeValue||'',ranges=rangesFor(text,terms);if(!ranges.length)return;
    const fragment=document.createDocumentFragment();let position=0;
    for(const range of ranges){
      if(range.start>position)fragment.append(document.createTextNode(text.slice(position,range.start)));
      const mark=document.createElement('mark');mark.className='vedator-match';mark.textContent=text.slice(range.start,range.end);fragment.append(mark);position=range.end;
    }
    if(position<text.length)fragment.append(document.createTextNode(text.slice(position)));textNode.replaceWith(fragment);
  }

  function highlightElement(element,terms){
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement?.closest('mark.vedator-match')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>highlightTextNode(node,terms));
  }

  const episodesBox=document.querySelector('#episodes');if(!episodesBox)return;
  let timer=0;const observer=new MutationObserver(()=>schedule());

  function prepareReadMore(article){
    const links=article.querySelector('.links');if(!links)return;
    const oldDetail=links.querySelector('a.secondary');let button=links.querySelector('.vedator-read-more');
    if(!button){button=document.createElement('button');button.type='button';button.className='vedator-read-more';if(oldDetail)oldDetail.replaceWith(button);else links.appendChild(button);}
    const expanded=article.dataset.descriptionExpanded==='true';button.textContent=expanded?'Čítať menej':'Čítať viac';button.setAttribute('aria-expanded',String(expanded));
  }

  function apply(){
    observer.disconnect();const terms=currentTerms();
    episodesBox.querySelectorAll('article').forEach(article=>{
      const title=article.querySelector('h2'),desc=article.querySelector('.desc');if(title)unwrapMarks(title);
      if(desc){
        unwrapMarks(desc);const episode=episodeForArticle(article);
        if(episode){
          const fullPlain=plainDescription(episode.description)||'Popis nie je k dispozícii.';
          const expanded=article.dataset.descriptionExpanded==='true';article.classList.toggle('vedator-description-expanded',expanded);
          if(expanded){const rich=safeRichDescription(episode.description);desc.replaceChildren(...rich.childNodes);}
          else desc.textContent=excerptAroundMatch(fullPlain,terms);
        }
      }
      prepareReadMore(article);
      if(terms.length){if(title)highlightElement(title,terms);if(desc)highlightElement(desc,terms);}
    });
    observer.observe(episodesBox,{childList:true,subtree:true});
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(apply,0);}
  episodesBox.addEventListener('click',event=>{const button=event.target.closest('.vedator-read-more');if(!button)return;const article=button.closest('article');if(!article)return;article.dataset.descriptionExpanded=String(article.dataset.descriptionExpanded!=='true');schedule();});
  document.querySelector('#search')?.addEventListener('input',schedule);
  document.querySelector('#topics')?.addEventListener('click',schedule);
  document.querySelector('#episodeSort')?.addEventListener('change',schedule);
  observer.observe(episodesBox,{childList:true,subtree:true});schedule();
})();