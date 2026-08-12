import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
const FAQ=[346,340,337,332,326,319,313,300,295,289,284,278,272,270,263,257,248,244,226,218,211,203,190,179,170,158,143,138,133,128,119,112,100,89,82,75,69,60,51,35,26,17];
const EXTRA_NONQUESTION_EPISODES=[334,335,338,339,341,342,344,345,347];

const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const exists=name=>fs.existsSync(path.join(ROOT,name));
const rootFiles=()=>fs.readdirSync(ROOT,{withFileTypes:true}).filter(entry=>entry.isFile()).map(entry=>entry.name);

function scanLiteral(source,start){
  let i=start;
  while(/\s/.test(source[i]||''))i++;
  const open=source[i];
  const close=open==='['?']':open==='{'?'}':null;
  if(!close)throw new Error(`Expected object/array literal near ${source.slice(i,i+40)}`);
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let p=i;p<source.length;p++){
    const ch=source[p],next=source[p+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;p++}continue}
    if(quote){
      if(escape){escape=false;continue}
      if(ch==='\\'){escape=true;continue}
      if(ch===quote){quote=null;continue}
      continue;
    }
    if(ch==='/'&&next==='/'){lineComment=true;p++;continue}
    if(ch==='/'&&next==='*'){blockComment=true;p++;continue}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue}
    if(ch===open)depth++;
    else if(ch===close){
      depth--;
      if(depth===0)return source.slice(i,p+1);
    }
  }
  throw new Error('Unclosed literal');
}

function assignedLiteral(source,name){
  const patterns=[
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=`),
    new RegExp(`window\\.${name.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*=`)
  ];
  for(const re of patterns){
    const m=re.exec(source);
    if(!m)continue;
    return scanLiteral(source,m.index+m[0].length);
  }
  return null;
}

function evalLiteral(literal,label){
  try{return vm.runInNewContext(`(${literal})`,Object.create(null),{timeout:1000})}
  catch(error){throw new Error(`${label}: ${error.message}`)}
}

function seconds(value){
  const parts=String(value||'').match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0].split(':').map(Number);
  if(!parts)return 0;
  return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1];
}
function formatSeconds(value){
  const s=Math.max(0,Math.floor(Number(value)||0)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),r=s%60;
  return h?`${h}:${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`:`${m}:${String(r).padStart(2,'0')}`;
}
function normalizeQuestion(item,episode,order,lang='cs'){
  if(Array.isArray(item)){
    const [time,title,points]=item;
    const raw=seconds(time),seek=Math.max(0,raw-5);
    return {episode,order,lang,time:formatSeconds(seek),sourceTime:String(time||'0:00'),seconds:seek,title:String(title||`Otázka ${order+1}`),points:Array.isArray(points)?points.map(String):[]};
  }
  const raw=seconds(item?.time),seek=Math.max(0,raw-5);
  return {episode,order,lang,time:formatSeconds(seek),sourceTime:String(item?.time||'0:00'),seconds:seek,title:String(item?.title||item?.question||`Otázka ${order+1}`),points:Array.isArray(item?.points)?item.points.map(String):Array.isArray(item?.items)?item.items.map(String):[]};
}

function parseEpisodeQuestions(episode,indexSummaries){
  if(episode===300){
    const sections=indexSummaries?.[300]?.sections||indexSummaries?.['300']?.sections;
    if(!Array.isArray(sections))throw new Error('Episode 300 sections missing in index SUMMARIES');
    return {cs:sections.map((item,i)=>normalizeQuestion(item,episode,i,'cs'))};
  }
  const file=`episode-${episode}-summary.js`;
  if(!exists(file))throw new Error(`${file} missing`);
  const code=read(file);
  for(const name of ['DATA','QUESTIONS','items']){
    const literal=assignedLiteral(code,name);
    if(!literal)continue;
    const data=evalLiteral(literal,file);
    if(name==='DATA'){
      if(data&&Array.isArray(data.cs))return {
        cs:data.cs.map((x,i)=>normalizeQuestion(x,episode,i,'cs')),
        ...(Array.isArray(data.sk)?{sk:data.sk.map((x,i)=>normalizeQuestion(x,episode,i,'sk'))}:{})
      };
      continue;
    }
    if(Array.isArray(data))return {cs:data.map((x,i)=>normalizeQuestion(x,episode,i,'cs'))};
  }
  throw new Error(`No static question data found in ${file}`);
}

function stripHtml(value){
  return String(value||'')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/\s+/g,' ')
    .trim();
}
function cleanDescription(value){
  const text=stripHtml(value);
  const cut=text.search(/Podcast vzniká v spolupráci so SME/i);
  return (cut>=0?text.slice(0,cut):text).trim();
}
function textKey(value){return String(value||'').replace(/\s+/g,' ').trim()}
function titleKey(value){return textKey(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}

function parseBaseNonQuestions(){
  const code=read('nonquestions-data.js');
  const marker='window.__vedatorNonQuestionsDataPayload=';
  const at=code.indexOf(marker);
  if(at<0)throw new Error('nonquestions payload assignment missing');
  return evalLiteral(scanLiteral(code,at+marker.length),'nonquestions-data.js');
}

function parseGlobalArray(file,globalName){
  if(!exists(file))return null;
  const code=read(file);
  const literal=assignedLiteral(code,globalName);
  return literal?evalLiteral(literal,file):null;
}

function parseExtraNonQuestion(episode){
  if(episode===334||episode===335){
    const cs=parseGlobalArray(`episode-${episode}-summary-data-cs.js`,`__vedatorEpisode${episode}SummaryCS`);
    const sk=parseGlobalArray(`episode-${episode}-summary-data-sk.js`,`__vedatorEpisode${episode}SummarySK`);
    if(Array.isArray(cs)||Array.isArray(sk))return {cs:Array.isArray(cs)?cs:[],sk:Array.isArray(sk)?sk:[]};
  }
  const file=`episode-${episode}-summary.js`;
  if(!exists(file))return null;
  const code=read(file);
  const literal=assignedLiteral(code,'DATA');
  if(!literal)return null;
  const data=evalLiteral(literal,file);
  if(data&&Array.isArray(data.cs))return data;
  return null;
}

function episodeTranslationValue(item){
  if(!item||typeof item!=='object')return null;
  const skTitle=String(item.skTitle||'').trim(),csTitle=String(item.csTitle||'').trim();
  const skDescription=String(item.skLead||item.skDescription||'').trim();
  const csDescription=String(item.csLead||item.csDescription||'').trim();
  if(!skTitle&&!csTitle&&!skDescription&&!csDescription)return null;
  return {skTitle,csTitle,skDescription,csDescription};
}

function collectEpisodeTranslations(){
  const byNumber=new Map(),byTitle=new Map(),files=[];
  for(const file of rootFiles().filter(name=>/^episode-translations-.*\.js$/.test(name)&&name!=='episode-translations-loader.js').sort()){
    const code=read(file);files.push(file);
    try{
      const plural=assignedLiteral(code,'TRANSLATIONS');
      if(plural){
        const value=evalLiteral(plural,file);
        if(Array.isArray(value)){
          for(const raw of value){
            const item=episodeTranslationValue(raw);if(!item)continue;
            if(item.skTitle)byTitle.set(titleKey(item.skTitle),item);
            if(item.csTitle)byTitle.set(titleKey(item.csTitle),item);
          }
        }else if(value&&typeof value==='object'){
          for(const [key,raw] of Object.entries(value)){
            const item=episodeTranslationValue(raw);if(!item)continue;
            const number=Number(key);
            if(Number.isFinite(number)&&number>0)byNumber.set(number,item);
            if(item.skTitle)byTitle.set(titleKey(item.skTitle),item);
            if(item.csTitle)byTitle.set(titleKey(item.csTitle),item);
          }
        }
      }
      const singular=assignedLiteral(code,'TRANSLATION');
      if(singular){
        const item=episodeTranslationValue(evalLiteral(singular,file));
        if(item){
          const titleNumber=Number((item.skTitle||item.csTitle).match(/Vedátorský podcast\s+(\d+)/i)?.[1]||0);
          const fileNumber=Number(file.match(/^episode-translations-(\d+)\.js$/)?.[1]||0);
          const number=titleNumber||fileNumber;
          if(number)byNumber.set(number,item);
          if(item.skTitle)byTitle.set(titleKey(item.skTitle),item);
          if(item.csTitle)byTitle.set(titleKey(item.csTitle),item);
        }
      }
    }catch(error){console.warn(`Translation parse skipped: ${error.message}`)}
  }
  return {byNumber,byTitle,files};
}

function collectQuestionTranslationPairs(){
  const lookup=new Map(),files=[];
  for(const file of rootFiles().filter(name=>/^question-translations-.*\.js$/.test(name)).sort()){
    const code=read(file),literal=assignedLiteral(code,'PAIRS');
    if(!literal)continue;
    try{
      const pairs=evalLiteral(literal,file);
      if(!Array.isArray(pairs))continue;
      files.push(file);
      for(const pair of pairs){
        if(!Array.isArray(pair)||pair.length<2)continue;
        const cs=String(pair[0]??'').trim(),sk=String(pair[1]??'').trim();
        if(!cs&&!sk)continue;
        const value={cs,sk};
        if(cs)lookup.set(textKey(cs),value);
        if(sk)lookup.set(textKey(sk),value);
      }
    }catch(error){console.warn(`Question translation parse skipped: ${error.message}`)}
  }
  return {lookup,files};
}

const SERIES_RULES=[
  [{cs:'FAQ – dobré otázky',sk:'FAQ – dobré otázky'},e=>/\bfaq\b/i.test(e.title)||[138,300].includes(Number(e.number))],
  [{cs:'Rozhovory o vesmíru',sk:'Rozhovory o vesmíre'},e=>String(e.title).toLowerCase().includes('rozhovory o vesm')],
  [{cs:'Žiji vědu',sk:'Žijem vedu'},e=>String(e.title).toLowerCase().includes('žijem vedu')||String(e.title).toLowerCase().includes('zijem vedu')],
  [{cs:'Nobelovy ceny',sk:'Nobelove ceny'},e=>/nobel/i.test(e.title)&&!/ig nobel/i.test(e.title)],
  [{cs:'Ig Nobelovy ceny',sk:'Ig Nobelove ceny'},e=>/ig nobel/i.test(e.title)],
  [{cs:'Matematika',sk:'Matematika'},e=>new Set([91,93,98,113,115,116,117,118,156,181,198,201,216,249,282,286,328,329,336]).has(Number(e.number))],
  [{cs:'Teorie her',sk:'Teória hier'},e=>[29,105,120,245,254].includes(Number(e.number))],
  [{cs:'Černé díry',sk:'Čierne diery'},e=>[296,227,173,132,104,68].includes(Number(e.number))],
  [{cs:'Temná hmota a energie',sk:'Tmavá hmota a energia'},e=>[210,182,145,48,2].includes(Number(e.number))],
  [{cs:'Částice',sk:'Častice'},e=>[10,34,163,175,180,187,225].includes(Number(e.number))]
];

const episodePayload=JSON.parse(read('episodes.json'));
const sourceEpisodes=Array.isArray(episodePayload)?episodePayload:episodePayload.episodes;
if(!Array.isArray(sourceEpisodes)||sourceEpisodes.length<300)throw new Error(`Invalid episodes catalog (${sourceEpisodes?.length||0})`);
const episodeTranslationData=collectEpisodeTranslations();
const episodes=sourceEpisodes.map(e=>{
  const number=Number(e.number)||0;
  const base={
    number,
    title:String(e.title||''),
    date:String(e.date||''),
    description:cleanDescription(e.description),
    link:String(e.link||''),
    enclosure:String(e.enclosure||''),
    id:String(e.id||'')
  };
  const translated=episodeTranslationData.byNumber.get(number)||episodeTranslationData.byTitle.get(titleKey(base.title));
  if(!translated)return base;
  return {...base,i18n:{
    cs:{title:translated.csTitle||base.title,description:translated.csDescription||base.description},
    sk:{title:translated.skTitle||base.title,description:translated.skDescription||base.description}
  }};
});

let indexSummaries={};
try{
  const index=read('index.html');
  const literal=assignedLiteral(index,'SUMMARIES');
  if(literal)indexSummaries=evalLiteral(literal,'index.html SUMMARIES');
}catch(error){console.warn(error.message)}

const questionPairData=collectQuestionTranslationPairs();
const questions=[];
const missingQuestions=[];
for(const episode of FAQ){
  try{
    const parsed=parseEpisodeQuestions(episode,indexSummaries);
    const csItems=parsed.cs||[],skItems=parsed.sk||[];
    for(let index=0;index<csItems.length;index++){
      const cs=csItems[index],staticSk=skItems[index]||null;
      const titlePair=questionPairData.lookup.get(textKey(cs.title));
      const skTitle=staticSk?.title||titlePair?.sk||cs.title;
      const skPoints=(staticSk?.points?.length?staticSk.points:cs.points.map(point=>questionPairData.lookup.get(textKey(point))?.sk||point));
      questions.push({...cs,i18n:{
        cs:{title:cs.title,points:[...cs.points]},
        sk:{title:skTitle,points:[...skPoints]}
      }});
    }
  }catch(error){missingQuestions.push({episode,error:error.message})}
}

const nonquestions=parseBaseNonQuestions();
nonquestions.episodes=nonquestions.episodes||{};
for(const episode of EXTRA_NONQUESTION_EPISODES){
  const extra=parseExtraNonQuestion(episode);
  if(extra)nonquestions.episodes[String(episode)]=extra;
}

const series=SERIES_RULES.map(([names,test])=>({
  name:names.cs,
  i18n:{cs:names.cs,sk:names.sk},
  episodes:episodes.filter(test).map(e=>e.number).filter(Boolean)
})).filter(x=>x.episodes.length);

const episodeI18nCount=episodes.filter(e=>e.i18n?.cs&&e.i18n?.sk).length;
const questionI18nCount=questions.filter(q=>q.i18n?.cs&&q.i18n?.sk).length;
const changedQuestionTranslations=questions.filter(q=>q.i18n.sk.title!==q.i18n.cs.title||q.i18n.sk.points.some((point,index)=>point!==q.i18n.cs.points[index])).length;
const output={
  schema:3,
  generatedAt:new Date().toISOString(),
  source:{
    episodesUpdatedAt:episodePayload.updatedAt||null,
    episodeCount:episodes.length,
    faqEpisodes:FAQ,
    expectedQuestionCount:734,
    episodeTranslationFiles:episodeTranslationData.files.length,
    questionTranslationFiles:questionPairData.files.length,
    episodeI18nCount,
    questionI18nCount,
    changedQuestionTranslations
  },
  episodes,
  series,
  questions,
  nonquestions
};
fs.writeFileSync(path.join(ROOT,'content-v2.json'),JSON.stringify(output));

console.log(JSON.stringify({
  episodes:episodes.length,
  series:series.length,
  questions:questions.length,
  questionEpisodes:new Set(questions.map(q=>q.episode)).size,
  nonquestionEpisodes:Object.keys(nonquestions.episodes).length,
  episodeTranslationFiles:episodeTranslationData.files.length,
  questionTranslationFiles:questionPairData.files.length,
  episodeI18nCount,
  questionI18nCount,
  changedQuestionTranslations,
  missingQuestions
},null,2));

if(missingQuestions.length)process.exitCode=2;
