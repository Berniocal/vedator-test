import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
const FAQ=[346,340,337,332,326,319,313,300,295,289,284,278,272,270,263,257,248,244,226,218,211,203,190,179,170,158,143,138,133,128,119,112,100,89,82,75,69,60,51,35,26,17];
const EXTRA_NONQUESTION_EPISODES=[334,335,338,339,341,342,344,345,347];

const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const exists=name=>fs.existsSync(path.join(ROOT,name));

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

const SERIES_RULES=[
  ['FAQ – dobré otázky',e=>/\bfaq\b/i.test(e.title)||[138,300].includes(Number(e.number))],
  ['Rozhovory o vesmíre',e=>String(e.title).toLowerCase().includes('rozhovory o vesm')],
  ['Žijem vedu',e=>String(e.title).toLowerCase().includes('žijem vedu')||String(e.title).toLowerCase().includes('zijem vedu')],
  ['Nobelovy ceny',e=>/nobel/i.test(e.title)&&!/ig nobel/i.test(e.title)],
  ['Ig Nobelovy ceny',e=>/ig nobel/i.test(e.title)],
  ['Matematika',e=>new Set([91,93,98,113,115,116,117,118,156,181,198,201,216,249,282,286,328,329,336]).has(Number(e.number))],
  ['Teorie her',e=>[29,105,120,245,254].includes(Number(e.number))],
  ['Černé díry',e=>[296,227,173,132,104,68].includes(Number(e.number))],
  ['Tmavá hmota a energie',e=>[210,182,145,48,2].includes(Number(e.number))],
  ['Částice',e=>[10,34,163,175,180,187,225].includes(Number(e.number))]
];

const episodePayload=JSON.parse(read('episodes.json'));
const sourceEpisodes=Array.isArray(episodePayload)?episodePayload:episodePayload.episodes;
if(!Array.isArray(sourceEpisodes)||sourceEpisodes.length<300)throw new Error(`Invalid episodes catalog (${sourceEpisodes?.length||0})`);
const episodes=sourceEpisodes.map(e=>({
  number:Number(e.number)||0,
  title:String(e.title||''),
  date:String(e.date||''),
  description:cleanDescription(e.description),
  link:String(e.link||''),
  enclosure:String(e.enclosure||''),
  id:String(e.id||'')
}));

let indexSummaries={};
try{
  const index=read('index.html');
  const literal=assignedLiteral(index,'SUMMARIES');
  if(literal)indexSummaries=evalLiteral(literal,'index.html SUMMARIES');
}catch(error){console.warn(error.message)}

const questions=[];
const questionTranslations={};
const missingQuestions=[];
for(const episode of FAQ){
  try{
    const parsed=parseEpisodeQuestions(episode,indexSummaries);
    questions.push(...(parsed.cs||[]));
    if(parsed.sk?.length)questionTranslations[String(episode)]={sk:parsed.sk};
  }catch(error){missingQuestions.push({episode,error:error.message})}
}

const nonquestions=parseBaseNonQuestions();
nonquestions.episodes=nonquestions.episodes||{};
for(const episode of EXTRA_NONQUESTION_EPISODES){
  const extra=parseExtraNonQuestion(episode);
  if(extra)nonquestions.episodes[String(episode)]=extra;
}

const series=SERIES_RULES.map(([name,test])=>({
  name,
  episodes:episodes.filter(test).map(e=>e.number).filter(Boolean)
})).filter(x=>x.episodes.length);

const output={
  schema:2,
  generatedAt:new Date().toISOString(),
  source:{episodesUpdatedAt:episodePayload.updatedAt||null,episodeCount:episodes.length,faqEpisodes:FAQ,expectedQuestionCount:734},
  episodes,
  series,
  questions,
  questionTranslations,
  nonquestions
};
fs.writeFileSync(path.join(ROOT,'content-v2.json'),JSON.stringify(output));

console.log(JSON.stringify({
  episodes:episodes.length,
  series:series.length,
  questions:questions.length,
  questionEpisodes:new Set(questions.map(q=>q.episode)).size,
  nonquestionEpisodes:Object.keys(nonquestions.episodes).length,
  missingQuestions
},null,2));

if(missingQuestions.length)process.exitCode=2;
