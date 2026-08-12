import fs from 'node:fs';

const FILE='content-v2.json';
const data=JSON.parse(fs.readFileSync(FILE,'utf8'));
const episodes=Array.isArray(data.episodes)?data.episodes:[];

const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const MATHEMATICS=new Set([91,93,98,113,115,116,117,118,156,181,198,201,216,249,282,286,328,329,336]);
const SCIENTISTS={
  men:[18,66,77,92,97,107,188,206,207,230,324],
  women:[320,305,302,288,222,220,205,199,140,85,70,53]
};
const VEDATOR_SPECIAL_TITLES=new Set([
  'vedatorsky special udrzatelnost pripadova studia ikea',
  'vedatorsky special preco je v nealko pive alkohol',
  'vedatorsky special astrologia',
  'vedatorsky special prenos signalu vzduchom',
  'vedatorsky special obycajne zazraky ukazka z knihy',
  'vedatorsky special vdaka comu su jadrove elektrarne bezpecne',
  'vedatorsky special zelena energia',
  'vedatorsky special kusky reality',
  'vedatorsky special ako znie vesmir',
  'vedatorsky special dungeon vedator'
]);

const titleFor=(episode,lang)=>episode?.i18n?.[lang]?.title||episode?.title||'';
const episodeDate=episode=>new Date(episode?.date||0).getTime()||0;
const byNumber=new Map(episodes.map(episode=>[Number(episode.number),episode]));

const fixed=[
  [{cs:'Hledání mimozemského života',sk:'Hľadanie mimozemského života'},episode=>norm(episode.title).includes('hladanie mimozemskeho zivota')],
  [{cs:'FAQ – dobré otázky',sk:'FAQ – dobré otázky'},episode=>/\bfaq\b/i.test(episode.title)||[138,300].includes(Number(episode.number))],
  [{cs:'Rozhovory o vesmíru',sk:'Rozhovory o vesmíre'},episode=>norm(episode.title).includes('rozhovory o vesmire')],
  [{cs:'Žiji vědu',sk:'Žijem vedu'},episode=>norm(episode.title).includes('zijem vedu')],
  [{cs:'Genetický speciál',sk:'Genetický špeciál'},episode=>norm(episode.title).includes('geneticky special')],
  [{cs:'Nobelovy ceny',sk:'Nobelove ceny'},episode=>{const value=norm(episode.title);return(value.includes('nobelove ceny')&&!value.includes('ig nobelove'))||Number(episode.number)===152}],
  [{cs:'Ig Nobelovy ceny',sk:'Ig Nobelove ceny'},episode=>norm(episode.title).includes('ig nobelove ceny')],
  [{cs:'Matematika',sk:'Matematika'},episode=>MATHEMATICS.has(Number(episode.number))],
  [{cs:'Teorie her',sk:'Teória hier'},episode=>[29,105,120,245,254].includes(Number(episode.number))],
  [{cs:'Rozhovory v angličtině',sk:'Rozhovory v angličtine'},episode=>[234,236,238,240,242,246,250,256,265,267].includes(Number(episode.number))],
  [{cs:'Internet',sk:'Internet'},episode=>[223,258,333].includes(Number(episode.number))],
  [{cs:'Vedátorský speciál',sk:'Vedátorský špeciál'},episode=>VEDATOR_SPECIAL_TITLES.has(norm(episode.title))],
  [{cs:'Černé díry',sk:'Čierne diery'},episode=>[296,227,173,132,104,68].includes(Number(episode.number))],
  [{cs:'Temná hmota a energie',sk:'Tmavá hmota a energia'},episode=>[210,182,145,48,2].includes(Number(episode.number))],
  [{cs:'Částice',sk:'Častice'},episode=>[10,34,163,175,180,187,225].includes(Number(episode.number))],
  [{cs:'Roky ve vědě',sk:'Roky vo vede'},episode=>[108,160,212,318].includes(Number(episode.number))]
];

const result=[];
function addSeries(names,items,extra={}){
  const sorted=[...items].filter(Boolean).sort((a,b)=>episodeDate(a)-episodeDate(b));
  if(sorted.length<2)return;
  result.push({
    name:names.cs,
    i18n:{cs:names.cs,sk:names.sk},
    episodes:sorted.map(item=>Number(item.number)).filter(Boolean),
    ...extra
  });
}

for(const [names,test] of fixed)addSeries(names,episodes.filter(test));
addSeries({cs:'Vědci',sk:'Vedci'},SCIENTISTS.men.map(number=>byNumber.get(number)),{people:true});
addSeries({cs:'Vědkyně',sk:'Vedkyne'},SCIENTISTS.women.map(number=>byNumber.get(number)),{people:true});

function coreName(value){
  return norm(String(value||'')
    .replace(/^Vedátorský podcast\s*\d+\s*[–—-]?\s*/i,'')
    .replace(/\b(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|\d+)\b\s*$/i,''));
}
function displaySeriesName(value){
  return String(value||'')
    .replace(/^Vedátorský podcast\s*\d+\s*[–—-]?\s*/i,'')
    .replace(/\s+(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|\d+)\s*$/i,'')
    .trim();
}

const automatic=new Map();
for(const episode of episodes){
  const core=coreName(episode.title);
  if(core==='najvacsia bitka v matematike'||core.length<=8)continue;
  if(!automatic.has(core))automatic.set(core,[]);
  automatic.get(core).push(episode);
}
for(const items0 of automatic.values()){
  if(items0.length<2)continue;
  const alreadyUsed=new Set(result.flatMap(series=>series.episodes));
  const items=items0.filter(episode=>!alreadyUsed.has(Number(episode.number)));
  if(items.length<2)continue;
  const first=items.sort((a,b)=>episodeDate(a)-episodeDate(b))[0];
  const cs=displaySeriesName(titleFor(first,'cs'))||displaySeriesName(first.title);
  const sk=displaySeriesName(titleFor(first,'sk'))||displaySeriesName(first.title);
  addSeries({cs,sk},items,{automatic:true});
}

result.sort((a,b)=>b.episodes.length-a.episodes.length||String(a.name).localeCompare(String(b.name),'cs'));
data.series=result;
data.meta={...(data.meta||{}),legacyParity:{
  fixedSeries:fixed.length,
  scientistSeries:2,
  automaticSeries:result.filter(series=>series.automatic).length,
  totalSeries:result.length
}};
fs.writeFileSync(FILE,JSON.stringify(data));
console.log(JSON.stringify(data.meta.legacyParity,null,2));
