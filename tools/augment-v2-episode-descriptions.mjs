import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');

function scanLiteral(source,start){
  let i=start;
  while(/\s/.test(source[i]||''))i++;
  const open=source[i],close=open==='['?']':open==='{'?'}':null;
  if(!close)return null;
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let p=i;p<source.length;p++){
    const ch=source[p],next=source[p+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;p++}continue}
    if(quote){
      if(escape){escape=false;continue}
      if(ch==='\\'){escape=true;continue}
      if(ch===quote)quote=null;
      continue;
    }
    if(ch==='/'&&next==='/'){lineComment=true;p++;continue}
    if(ch==='/'&&next==='*'){blockComment=true;p++;continue}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue}
    if(ch===open)depth++;
    else if(ch===close&&--depth===0)return source.slice(i,p+1);
  }
  return null;
}

function assignedLiteral(source,name){
  const match=new RegExp(`(?:const|let|var)\\s+${name}\\s*=`).exec(source);
  return match?scanLiteral(source,match.index+match[0].length):null;
}

function evalLiteral(literal,label){
  try{return vm.runInNewContext(`(${literal})`,Object.create(null),{timeout:1000})}
  catch(error){throw new Error(`${label}: ${error.message}`)}
}

const compact=value=>String(value||'').replace(/\s+/g,' ').trim();
const files=fs.readdirSync(ROOT).filter(name=>/^episode-translations-.*\.js$/.test(name)&&name!=='episode-translations-loader.js').sort();
const pairs=[];
for(const file of files){
  const source=read(file);
  for(const name of ['DESCRIPTION_TEXT_PAIRS','COMMON_TEXT_PAIRS']){
    const literal=assignedLiteral(source,name);
    if(!literal)continue;
    try{
      const values=evalLiteral(literal,`${file} ${name}`);
      if(!Array.isArray(values))continue;
      for(const pair of values){
        if(!Array.isArray(pair)||pair.length<2)continue;
        const sk=compact(pair[0]),cs=compact(pair[1]);
        if(sk&&cs&&sk!==cs)pairs.push({sk,cs,file});
      }
    }catch(error){console.warn(error.message)}
  }
}

pairs.sort((a,b)=>b.sk.length-a.sk.length);
const exact=new Map();
for(const pair of pairs)if(!exact.has(pair.sk))exact.set(pair.sk,pair.cs);

function translateDescription(source){
  let value=compact(source);
  if(!value)return value;
  const direct=exact.get(value);
  if(direct)return direct;
  for(const pair of pairs){
    if(pair.sk.length<40)continue;
    if(value.includes(pair.sk))value=value.split(pair.sk).join(pair.cs);
  }
  return value;
}

const contentPath=path.join(ROOT,'content-v2.json');
const data=JSON.parse(fs.readFileSync(contentPath,'utf8'));
let changed=0,covered=0;
for(const episode of data.episodes||[]){
  const bundle=episode?.i18n;
  if(!bundle?.cs||!bundle?.sk)continue;
  const skDescription=compact(bundle.sk.description||episode.description);
  const existingCs=compact(bundle.cs.description||'');
  const translated=translateDescription(skDescription);
  bundle.sk.description=skDescription;
  if(translated&&translated!==skDescription){
    covered++;
    if(existingCs!==translated){bundle.cs.description=translated;changed++}
  }
}

data.source=data.source||{};
data.source.descriptionTranslationPairs=pairs.length;
data.source.translatedEpisodeDescriptions=covered;
data.source.updatedEpisodeDescriptions=changed;
fs.writeFileSync(contentPath,JSON.stringify(data));
console.log(JSON.stringify({descriptionTranslationPairs:pairs.length,translatedEpisodeDescriptions:covered,updatedEpisodeDescriptions:changed},null,2));
