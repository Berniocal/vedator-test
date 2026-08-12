import fs from 'node:fs';

const FILE='app-v2.js';
const MARKER='/* V2_QUESTION_EXPERIENCE_V1 */';
let source=fs.readFileSync(FILE,'utf8');
if(source.includes(MARKER)){
  console.log('V2 question experience already present.');
  process.exit(0);
}

const insertion=`
  ${MARKER}
  const QUESTION_TOPICS={
    all:{cs:'Vše',sk:'Všetko',keys:[]},
    space:{cs:'Vesmír',sk:'Vesmír',keys:['vesmir','hvezd','hviezd','planet','galaxi','slunce','slnko','mesic','mesiac','jupiter','kosmolog','rozpin']},
    blackholes:{cs:'Černé díry',sk:'Čierne diery',keys:['cerna dira','cierna diera','hawking','singularit']},
    quantum:{cs:'Kvantová fyzika',sk:'Kvantová fyzika',keys:['kvant','superpoz','spleten','previazan','orbital','wimp','vakuu','vakua']},
    relativity:{cs:'Relativita a gravitace',sk:'Relativita a gravitácia',keys:['relativ','gravit','casoprostor','casopriestor','rychlost svetla']},
    math:{cs:'Matematika',sk:'Matematika',keys:['matemat','prvocisl','nekonec','paradox','entrop','laplace','tri teles']},
    bio:{cs:'Biologie a medicína',sk:'Biológia a medicína',keys:['vitamin','gen','gmo','mozek','mozog','spanek','zrcadlov','cvicit']},
    tech:{cs:'Technologie',sk:'Technológie',keys:['pocitac','mikrovln','gps','bater','vodik','auto','klavesnic','tiktok','kryptom','teleskop','webb']},
    earth:{cs:'Země a příroda',sk:'Zem a príroda',keys:['zeme','ocean','ledovec','sopk','tornado','pocasi','vzduch','mrak','atmosfer']},
    chemistry:{cs:'Chemie',sk:'Chémia',keys:['atom','molekul','prvek','prvok','helium','deuter','voda','jogurt','zlato','metan','oxid uhlicity']},
    other:{cs:'Ostatní',sk:'Ostatné',keys:['podcast','jazyk','wikipedia','anime','videohry','recept','motiv','pravo','plochozem']}
  };
  const questionUi={qTopic:'all',nTopic:'all',qSort:'new',nSort:'new',qOpen:new Set(),nOpen:new Set(),installed:false,deepProcessing:false};
  const currentTopic=view=>QUESTION_TOPICS[view==='questions'?questionUi.qTopic:questionUi.nTopic]||QUESTION_TOPICS.all;
  const viewSort=view=>view==='questions'?questionUi.qSort:questionUi.nSort;
  const itemId=(item,prefix='q')=>prefix+':'+Number(item.episode)+':'+Number(item.order);
  const copyForViewItem=(item,view)=>view==='questions'?questionCopy(item):{title:String(item.title||''),points:Array.isArray(item.points)?item.points:[]};
  const itemSearchText=(item,view)=>view==='questions'?allQuestionSearch(item):nonQuestionSearch(item,item.episode,item.order);
  const queryTerms=()=>norm(state.query.trim()).split(/\\s+/).filter(Boolean);
  function itemMatchLevel(item,view){
    const terms=queryTerms();if(!terms.length)return 0;
    const copy=copyForViewItem(item,view),title=norm(copy.title),answer=norm(copy.points.join(' ')),episode=String(item.episode);
    if(terms.every(term=>title.includes(term)||episode.includes(term)))return 0;
    if(terms.some(term=>title.includes(term)||episode.includes(term)))return 1;
    if(terms.every(term=>answer.includes(term)))return 2;
    if(terms.every(term=>(title+' '+answer).includes(term)||episode.includes(term)))return 3;
    return 99;
  }
  function itemMatchesTopic(item,view){
    const topic=currentTopic(view);if(!topic.keys.length)return true;
    const content=itemSearchText(item,view);return topic.keys.some(key=>content.includes(norm(key)));
  }
  function topicKeysForItem(item,view){
    const content=itemSearchText(item,view);
    return Object.entries(QUESTION_TOPICS).filter(([key,t])=>key!=='all'&&t.keys.some(term=>content.includes(norm(term)))).slice(0,3).map(([key])=>key);
  }
  function visibleItems(view){
    const all=view==='questions'?state.data.questions:flattenNonQuestions(state.data),mode=viewSort(view);
    return all.filter(item=>itemMatchesTopic(item,view)&&itemMatchLevel(item,view)<99).map(item=>({item,match:itemMatchLevel(item,view)})).sort((a,b)=>a.match-b.match||(mode==='old'?a.item.episode-b.item.episode:b.item.episode-a.item.episode)||a.item.order-b.item.order).map(x=>x.item);
  }
  function repairMathText(value){
    return String(value||'')
      .replace(/\\(0,\\^\\)/g,'0 °C')
      .replace(/\\(0,\\^=273\\{,\\}15,\\)/g,'0 °C = 273,15 K')
      .replace(/\\(546\\{,\\}3,\\)/g,'546,3 K')
      .replace(/\\(273,\\^\\)/g,'273 °C')
      .replace(/\\(0,\\)/g,'0 K')
      .replace(/\\(-273\\{,\\}15,\\^\\)/g,'−273,15 °C')
      .replace(/\\(-459\\{,\\}67,\\^\\)/g,'−459,67 °F')
      .replace(/\\(-300\\^\\)/g,'−300 °F');
  }
  function highlightHtml(value,topic){
    const raw=repairMathText(value),terms=[...new Set([...queryTerms(),...(topic?.keys||[]).map(norm)])].filter(Boolean).sort((a,b)=>b.length-a.length);
    if(!terms.length)return esc(raw).replace(/([A-Za-z0-9]+)\\s*\\^\\s*\\{?(-?\\d+)\\}?/g,'$1<sup>$2</sup>');
    const normalized=norm(raw),ranges=[];
    for(const term of terms){let at=0;while((at=normalized.indexOf(term,at))>=0){ranges.push([at,at+term.length]);at+=Math.max(1,term.length)}}
    ranges.sort((a,b)=>a[0]-b[0]||b[1]-a[1]);const merged=[];
    for(const range of ranges){const last=merged.at(-1);if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);else merged.push([...range])}
    let out='',pos=0;for(const [a,b] of merged){out+=esc(raw.slice(pos,a))+'<mark>'+esc(raw.slice(a,b))+'</mark>';pos=b}out+=esc(raw.slice(pos));
    return out.replace(/([A-Za-z0-9]+)\\s*\\^\\s*\\{?(-?\\d+)\\}?/g,'$1<sup>$2</sup>');
  }
  function topicLabel(key){const t=QUESTION_TOPICS[key]||QUESTION_TOPICS.all;return sk()?t.sk:t.cs}
  function questionToolbar(view){
    const selected=view==='questions'?questionUi.qTopic:questionUi.nTopic,sort=viewSort(view);
    return '<div class="question-tools" data-tools="'+view+'"><div class="question-topics">'+Object.keys(QUESTION_TOPICS).map(key=>'<button type="button" class="question-topic '+(key===selected?'active':'')+'" data-topic="'+key+'">'+esc(topicLabel(key))+'</button>').join('')+'</div><select class="question-sort" aria-label="'+esc(text('Řazení','Zoradenie'))+'"><option value="new" '+(sort==='new'?'selected':'')+'>'+esc(text('Nejnovější','Najnovšie'))+'</option><option value="old" '+(sort==='old'?'selected':'')+'>'+esc(text('Nejstarší','Najstaršie'))+'</option></select></div>';
  }
  function shareButton(kind,value){return '<button type="button" class="deep-share" data-kind="'+kind+'" data-value="'+esc(value)+'" title="'+esc(text('Sdílet odkaz','Zdieľať odkaz'))+'" aria-label="'+esc(text('Sdílet odkaz','Zdieľať odkaz'))+'">🔗</button>'}
  function enhancedQuestionCard(item,view){
    const prefix=view==='questions'?'q':'n',id=itemId(item,prefix),open=(view==='questions'?questionUi.qOpen:questionUi.nOpen).has(id),copy=copyForViewItem(item,view),topic=currentTopic(view),ref=view==='questions'?qRef(item):'',deep=view==='questions'?Number(item.episode)+':'+Number(item.order):Number(item.episode)+':'+Number(item.order);
    const tags=topicKeysForItem(item,view).map(key=>'<span class="tag">'+esc(topicLabel(key))+'</span>').join('');
    return '<article class="card searchable question-card '+(open?'open':'')+'" data-item="'+esc(id)+'" data-search="'+esc(itemSearchText(item,view))+'"><div class="meta">'+text('Díl','Diel')+' '+item.episode+' • '+esc(item.sourceTime||item.time||'')+'</div><h2>'+highlightHtml(copy.title,topic)+'</h2><div class="question-answer"><ul>'+copy.points.map(point=>'<li>'+highlightHtml(point,topic)+'</li>').join('')+'</ul></div><div class="tags">'+tags+'</div><div class="actions"><button type="button" class="play" data-episode="'+item.episode+'" data-seconds="'+(Number(item.seconds)||0)+'" data-ref="'+esc(ref)+'">'+text('Přehrát','Prehrať')+'</button><button type="button" class="question-more">'+(open?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac'))+'</button>'+shareButton(view==='questions'?'question':'nonquestion',deep)+'</div></article>';
  }
  function renderQuestions(){
    const items=visibleItems('questions');$('#questions-v2').innerHTML=questionToolbar('questions')+items.map(item=>enhancedQuestionCard(item,'questions')).join('');$('#questions-v2').dataset.visible=String(items.length);queueQuestionMoreCheck('questions');
  }
  function renderNonQuestions(){
    const all=flattenNonQuestions(state.data),items=visibleItems('nonquestions');$('#nonquestions-v2').innerHTML=questionToolbar('nonquestions')+items.map(item=>enhancedQuestionCard(item,'nonquestions')).join('');$('#nonquestions-v2').dataset.count=String(all.length);$('#nonquestions-v2').dataset.visible=String(items.length);queueQuestionMoreCheck('nonquestions');
  }
  function questionCountLabel(view,count,filtered){
    if(view==='questions')return filtered?count+' '+text('nalezených otázek','nájdených otázok'):count+' '+text('otázek','otázok');
    return filtered?count+' '+text('nalezených neotázek','nájdených neotázok'):count+' '+text('neotázek','neotázok');
  }
  function filterActive(){
    const q=norm(state.query.trim()),active=$('.view-v2[data-view="'+state.view+'"]');if(!active)return;
    if(state.view==='questions'||state.view==='nonquestions'){
      if(state.view==='questions')renderQuestions();else renderNonQuestions();
      const selected=currentTopic(state.view),filtered=Boolean(q)||selected!==QUESTION_TOPICS.all,count=Number(active.dataset.visible)||0,total=state.view==='questions'?state.data.questions.length:Number(active.dataset.count)||0;
      $('#count-v2').textContent=questionCountLabel(state.view,filtered?count:total,filtered);return;
    }
    const cards=[...active.querySelectorAll('.searchable')];let shown=0;cards.forEach(card=>{const ok=!q||String(card.dataset.search||'').includes(q);card.classList.toggle('filtered-out',!ok);if(ok)shown++});
    if(state.view==='episodes')$('#count-v2').textContent=q?shown+' '+text('nalezených epizod','nájdených epizód'):state.data.episodes.length+' '+text('epizod','epizód');
    else if(state.view==='series')$('#count-v2').textContent=q?shown+' '+text('nalezených sérií','nájdených sérií'):state.data.series.length+' '+text('sérií','sérií');
    else if(state.view==='playlists')$('#count-v2').textContent=q?shown+' '+text('nalezených playlistů','nájdených playlistov'):state.playlists.length+' '+text('playlistů','playlistov');
    else $('#count-v2').textContent=text('Lokální data','Lokálne dáta');
  }
  function queueQuestionMoreCheck(view){
    requestAnimationFrame(()=>{const root=view==='questions'?$('#questions-v2'):$('#nonquestions-v2');root?.querySelectorAll('.question-card').forEach(card=>{const answer=card.querySelector('.question-answer'),button=card.querySelector('.question-more');if(!answer||!button)return;button.classList.toggle('hidden',!card.classList.contains('open')&&answer.scrollHeight<=answer.clientHeight+2)})});
  }
  function hashText(value){let hash=2166136261;for(const char of String(value||'')){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return(hash>>>0).toString(36)}
  function slug(value){return norm(value).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
  function oldEpisodeKey(episode){return Number(episode?.number||0)+'-'+hashText(episode?.id||episode?.link||episode?.enclosure||episode?.title||'')}
  function oldSeriesKey(series){const signature=(series?.episodes||[]).map(number=>oldEpisodeKey(episodeByNumber(number))).sort().join('|');return hashText(signature)+'.'+slug(series?.name||'serie')}
  async function shareDeep(kind,value){
    const url=new URL(location.href);url.hash=kind+'='+encodeURIComponent(value);
    try{if(navigator.share){await navigator.share({url:url.href});return}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url.href);alert(text('Odkaz byl zkopírován.','Odkaz bol skopírovaný.'));return}}catch(error){if(error?.name==='AbortError')return}
    prompt(text('Zkopírujte odkaz:','Skopírujte odkaz:'),url.href);
  }
  function enhanceDeepShareButtons(){
    $('#episodes-v2')?.querySelectorAll('article[data-episode]').forEach(card=>{const actions=card.querySelector('.actions'),number=Number(card.dataset.episode);if(actions&&!actions.querySelector('.deep-share'))actions.insertAdjacentHTML('beforeend',shareButton('episode',String(number)))});
    $('#series-v2')?.querySelectorAll('.series[data-series-index]').forEach(card=>{const summary=card.querySelector('summary'),index=Number(card.dataset.seriesIndex),series=state.data.series[index];if(summary&&series&&!summary.querySelector('.deep-share'))summary.insertAdjacentHTML('beforeend',shareButton('series',slug(series.name)))});
  }
  function markDeepTarget(element){if(!element)return false;$$('.deep-target').forEach(node=>node.classList.remove('deep-target'));element.classList.add('deep-target');element.open=true;try{element.scrollIntoView({behavior:'smooth',block:'center'})}catch{}setTimeout(()=>element.classList.remove('deep-target'),3600);return true}
  function findEpisodeFromDeep(value){const raw=String(value||''),number=Number(/^\\d+$/.test(raw)?raw:raw.split('-')[0]);return episodeByNumber(number)}
  async function processDeepLink(){
    if(questionUi.deepProcessing)return;const raw=location.hash.replace(/^#/,'');if(!raw)return;const params=new URLSearchParams(raw),entry=[...params.entries()].find(([key])=>['episode','question','nonquestion','series'].includes(key));if(!entry)return;
    questionUi.deepProcessing=true;try{
      const [kind,value]=entry;
      if(kind==='episode'){
        const episode=findEpisodeFromDeep(value);if(!episode)return;setView('episodes');state.query='';$('#search-v2').value='';filterActive();markDeepTarget($('#episodes-v2 article[data-episode="'+episode.number+'"]'));return;
      }
      if(kind==='question'||kind==='nonquestion'){
        const view=kind==='question'?'questions':'nonquestions';let episode=0,order=-1,secondsValue=-1;const direct=String(value).match(/^(\\d+):(\\d+)$/),legacy=String(value).match(/^(.+)@(\\d+)$/);
        if(direct){episode=Number(direct[1]);order=Number(direct[2])}else if(legacy){episode=Number(String(legacy[1]).split('-')[0]);secondsValue=Number(legacy[2])}else return;
        setView(view);state.query='';$('#search-v2').value='';if(view==='questions')questionUi.qTopic='all';else questionUi.nTopic='all';filterActive();
        let item;if(view==='questions')item=state.data.questions.find(x=>Number(x.episode)===episode&&(order>=0?Number(x.order)===order:Number(x.seconds)===secondsValue));else item=flattenNonQuestions(state.data).find(x=>Number(x.episode)===episode&&(order>=0?Number(x.order)===order:Number(x.seconds)===secondsValue));
        if(item)markDeepTarget($("[data-item='"+itemId(item,view==='questions'?'q':'n')+"']"));return;
      }
      if(kind==='series'){
        const target=decodeURIComponent(value),index=state.data.series.findIndex(series=>slug(series.name)===target||oldSeriesKey(series)===target||oldSeriesKey(series).split('.')[0]===target.split('.')[0]);if(index<0)return;setView('series');state.query='';$('#search-v2').value='';filterActive();markDeepTarget($('#series-v2 .series[data-series-index="'+index+'"]'));
      }
    }finally{questionUi.deepProcessing=false}
  }
  function installEnhancedQuestionUi(){
    if(questionUi.installed)return;questionUi.installed=true;
    const style=document.createElement('style');style.dataset.v2QuestionExperience='1';style.textContent='.question-tools{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:2px}.question-topics{display:flex;gap:7px;overflow:auto;padding:2px 0}.question-topic{white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--ink);padding:7px 10px;cursor:pointer}.question-topic.active{background:var(--accent2);border-color:#8b7ee8;color:#392b9b;font-weight:800}.question-sort{border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);padding:8px;flex:0 0 auto}.question-answer{line-height:1.48;max-height:7.7em;overflow:hidden}.question-card.open .question-answer{max-height:none}.question-answer ul{margin:.4rem 0;padding-left:1.15rem}.question-answer li{margin:.22rem 0}.question-more,.deep-share{border:1px solid var(--line)!important;background:#fff!important;color:var(--ink)!important;flex:0 0 auto!important}.deep-share{min-width:42px!important}.question-card mark{background:#ffe56b;color:#171717;border-radius:3px;padding:0 .08em}.question-card sup{font-size:.75em}.deep-target{outline:3px solid var(--accent)!important;outline-offset:4px;animation:v2DeepPulse 1.2s ease-in-out 2}@keyframes v2DeepPulse{50%{box-shadow:0 0 0 9px rgba(91,75,219,.2)}}@media(max-width:700px){.question-tools{align-items:flex-start;flex-direction:column}.question-sort{width:100%}}';document.head.append(style);
    document.addEventListener('click',event=>{
      const topicButton=event.target.closest?.('.question-topic');if(topicButton){const tools=topicButton.closest('.question-tools'),view=tools?.dataset.tools;if(view==='questions')questionUi.qTopic=topicButton.dataset.topic;else if(view==='nonquestions')questionUi.nTopic=topicButton.dataset.topic;filterActive();return}
      const more=event.target.closest?.('.question-more');if(more){const card=more.closest('.question-card'),id=card?.dataset.item,set=state.view==='questions'?questionUi.qOpen:questionUi.nOpen;if(!id)return;if(set.has(id))set.delete(id);else set.add(id);card.classList.toggle('open',set.has(id));more.textContent=set.has(id)?text('Číst méně','Čítať menej'):text('Číst více','Čítať viac');queueQuestionMoreCheck(state.view);return}
      const share=event.target.closest?.('.deep-share');if(share){event.preventDefault();event.stopPropagation();shareDeep(share.dataset.kind,share.dataset.value);return}
    });
    document.addEventListener('change',event=>{const sort=event.target.closest?.('.question-sort');if(!sort)return;const view=sort.closest('.question-tools')?.dataset.tools;if(view==='questions')questionUi.qSort=sort.value;else if(view==='nonquestions')questionUi.nSort=sort.value;filterActive()});
    window.addEventListener('hashchange',processDeepLink);window.addEventListener('vedatorlanguagechange',()=>{enhanceDeepShareButtons();filterActive()});enhanceDeepShareButtons();processDeepLink();
  }
  window.addEventListener('vedator-v2-ready',()=>{installEnhancedQuestionUi();enhanceDeepShareButtons();processDeepLink()});
`;

const anchor='  async function start(){';
const at=source.indexOf(anchor);
if(at<0)throw new Error('Could not find V2 start function anchor');
source=source.slice(0,at)+insertion+'\n'+source.slice(at);
fs.writeFileSync(FILE,source);
console.log('Injected V2 question/nonquestion/deep-link experience into app-v2.js');
