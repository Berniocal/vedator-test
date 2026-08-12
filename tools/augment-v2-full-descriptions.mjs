import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const compact=value=>String(value||'').replace(/\s+/g,' ').trim();

function decodeEntities(value){
  return String(value||'')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,'<')
    .replace(/&gt;/gi,'>')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)||32))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)||32));
}

function fullDescriptionText(value){
  const text=decodeEntities(String(value||'')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<li\b[^>]*>/gi,'\n• ')
    .replace(/<\/(?:p|div|li|ul|ol|h[1-6])>/gi,'\n')
    .replace(/<[^>]+>/g,' '));
  return text.split(/\n+/).map(line=>line.replace(/[ \t]+/g,' ').trim()).filter(Boolean).join('\n').trim();
}

function scanLiteral(source,start){
  let i=start;while(/\s/.test(source[i]||''))i++;
  const open=source[i],close=open==='['?']':open==='{'?'}':null;if(!close)return null;
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let p=i;p<source.length;p++){
    const ch=source[p],next=source[p+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;p++}continue}
    if(quote){if(escape){escape=false;continue}if(ch==='\\'){escape=true;continue}if(ch===quote)quote=null;continue}
    if(ch==='/'&&next==='/'){lineComment=true;p++;continue}
    if(ch==='/'&&next==='*'){blockComment=true;p++;continue}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue}
    if(ch===open)depth++;else if(ch===close&&--depth===0)return source.slice(i,p+1);
  }
  return null;
}
function assignedLiteral(source,name){const m=new RegExp(`(?:const|let|var)\\s+${name}\\s*=`).exec(source);return m?scanLiteral(source,m.index+m[0].length):null}
function evalLiteral(literal,label){try{return vm.runInNewContext(`(${literal})`,Object.create(null),{timeout:1000})}catch(error){throw new Error(`${label}: ${error.message}`)}}

const pairs=[];
for(const file of fs.readdirSync(ROOT).filter(name=>/^episode-translations-.*\.js$/.test(name)&&name!=='episode-translations-loader.js').sort()){
  const source=read(file);
  for(const name of ['DESCRIPTION_TEXT_PAIRS','COMMON_TEXT_PAIRS']){
    const literal=assignedLiteral(source,name);if(!literal)continue;
    try{
      const values=evalLiteral(literal,`${file} ${name}`);if(!Array.isArray(values))continue;
      for(const pair of values){if(!Array.isArray(pair)||pair.length<2)continue;const sk=compact(pair[0]),cs=compact(pair[1]);if(sk&&cs&&sk!==cs)pairs.push({sk,cs})}
    }catch(error){console.warn(error.message)}
  }
}
pairs.sort((a,b)=>b.sk.length-a.sk.length);
const exact=new Map();for(const pair of pairs)if(!exact.has(pair.sk))exact.set(pair.sk,pair.cs);
function translate(source){
  let value=compact(source);if(!value)return value;
  const direct=exact.get(value);if(direct)return direct;
  for(const pair of pairs){if(pair.sk.length<40)continue;if(value.includes(pair.sk))value=value.split(pair.sk).join(pair.cs)}
  return value;
}

const feed=JSON.parse(read('episodes.json'));
const sourceEpisodes=Array.isArray(feed)?feed:(feed.episodes||[]);
const rawByNumber=new Map(sourceEpisodes.map(episode=>[Number(episode.number)||0,episode]));
const data=JSON.parse(read('content-v2.json'));
let fullDescriptionCount=0,translatedFullDescriptionCount=0;
for(const episode of data.episodes||[]){
  const raw=rawByNumber.get(Number(episode.number)||0);if(!raw)continue;
  const full=fullDescriptionText(raw.description);if(!full)continue;
  episode.fullDescription=full;fullDescriptionCount++;
  if(episode.i18n?.sk&&episode.i18n?.cs){
    episode.i18n.sk.fullDescription=full;
    const translated=translate(full);
    episode.i18n.cs.fullDescription=translated||full;
    if(translated&&translated!==compact(full))translatedFullDescriptionCount++;
  }
}
data.source=data.source||{};
data.source.fullDescriptionCount=fullDescriptionCount;
data.source.translatedFullDescriptionCount=translatedFullDescriptionCount;
fs.writeFileSync('content-v2.json',JSON.stringify(data));
console.log(JSON.stringify({fullDescriptionCount,translatedFullDescriptionCount},null,2));
