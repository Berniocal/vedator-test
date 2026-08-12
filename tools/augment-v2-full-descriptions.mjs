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
function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function escapeAttr(value){return escapeHtml(value)}

const ALLOWED_TAGS=new Set(['p','br','a','ul','ol','li','strong','b','em','i','blockquote','h2','h3','h4']);
function sanitizeRichHtml(value){
  return String(value||'')
    .replace(/<!--[\s\S]*?-->/g,'')
    .replace(/<\/?([a-z0-9:-]+)([^>]*)>/gi,(full,rawTag,attrs)=>{
      const closing=/^<\//.test(full),tag=String(rawTag||'').toLowerCase();
      if(!ALLOWED_TAGS.has(tag))return '';
      if(closing)return `</${tag}>`;
      if(tag==='br')return '<br>';
      if(tag==='a'){
        const match=String(attrs||'').match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href=String(match?.[1]??match?.[2]??match?.[3]??'').trim();
        if(!/^https?:\/\//i.test(href))return '<a>';
        return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">`;
      }
      return `<${tag}>`;
    });
}
function richHtmlToText(value){
  const text=decodeEntities(String(value||'')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<li\b[^>]*>/gi,'\n• ')
    .replace(/<\/(?:p|div|li|ul|ol|h[1-6]|blockquote)>/gi,'\n')
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
function translatePlain(source){
  let value=compact(source);if(!value)return value;
  const direct=exact.get(value);if(direct)return direct;
  for(const pair of pairs){if(pair.sk.length<40)continue;if(value.includes(pair.sk))value=value.split(pair.sk).join(pair.cs)}
  return value;
}
function translateRichHtml(source,lead){
  let html=String(source||'');
  if(lead){
    let replaced=false;
    html=html.replace(/<p>([\s\S]*?)<\/p>/i,()=>{replaced=true;return `<p>${escapeHtml(lead)}</p>`});
    if(!replaced)html=`<p>${escapeHtml(lead)}</p>${html}`;
  }
  let inAnchor=false;
  return html.split(/(<[^>]+>)/g).map(token=>{
    if(token.startsWith('<')){
      if(/^<a\b/i.test(token))inAnchor=true;
      else if(/^<\/a\b/i.test(token))inAnchor=false;
      return token;
    }
    if(inAnchor||!token)return token;
    let value=token;
    for(const pair of pairs){if(value.includes(pair.sk))value=value.split(pair.sk).join(pair.cs)}
    return value;
  }).join('');
}

const feed=JSON.parse(read('episodes.json'));
const sourceEpisodes=Array.isArray(feed)?feed:(feed.episodes||[]);
const rawByNumber=new Map(sourceEpisodes.map(episode=>[Number(episode.number)||0,episode]));
const data=JSON.parse(read('content-v2.json'));
let fullDescriptionCount=0,richDescriptionCount=0,translatedFullDescriptionCount=0,translatedRichDescriptionCount=0;
for(const episode of data.episodes||[]){
  const raw=rawByNumber.get(Number(episode.number)||0);if(!raw)continue;
  const rich=sanitizeRichHtml(raw.description);const full=richHtmlToText(rich);if(!full)continue;
  episode.fullDescription=full;episode.fullDescriptionHtml=rich;fullDescriptionCount++;if(rich)richDescriptionCount++;
  if(episode.i18n?.sk){episode.i18n.sk.fullDescription=full;episode.i18n.sk.fullDescriptionHtml=rich}
  if(episode.i18n?.cs){
    const lead=String(episode.i18n.cs.description||'').trim()||translatePlain(String(episode.description||''));
    const translatedRich=sanitizeRichHtml(translateRichHtml(rich,lead));
    const translated=richHtmlToText(translatedRich)||translatePlain(full)||full;
    episode.i18n.cs.fullDescription=translated;
    episode.i18n.cs.fullDescriptionHtml=translatedRich||rich;
    if(translated&&translated!==compact(full))translatedFullDescriptionCount++;
    if(translatedRich&&translatedRich!==rich)translatedRichDescriptionCount++;
  }
}
data.source=data.source||{};
data.source.fullDescriptionCount=fullDescriptionCount;
data.source.richDescriptionCount=richDescriptionCount;
data.source.translatedFullDescriptionCount=translatedFullDescriptionCount;
data.source.translatedRichDescriptionCount=translatedRichDescriptionCount;
fs.writeFileSync('content-v2.json',JSON.stringify(data));
console.log(JSON.stringify({fullDescriptionCount,richDescriptionCount,translatedFullDescriptionCount,translatedRichDescriptionCount},null,2));
