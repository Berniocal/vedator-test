import fs from 'node:fs';

const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const fail=message=>{throw new Error(message)};

if(data.schema!==2)fail(`Unexpected schema ${data.schema}`);
if(!Array.isArray(data.episodes)||data.episodes.length<380)fail(`Too few episodes: ${data.episodes?.length}`);
if(!Array.isArray(data.questions))fail('Questions missing');
if(data.questions.length!==734)fail(`Expected 734 questions, got ${data.questions.length}`);
if(new Set(data.questions.map(q=>q.episode)).size!==42)fail(`Expected 42 FAQ episodes, got ${new Set(data.questions.map(q=>q.episode)).size}`);
if(data.questions.some(q=>!q.title||!Array.isArray(q.points)||!q.points.length))fail('Question with missing title/answer detected');
if(!Array.isArray(data.series)||data.series.length<8)fail(`Too few series: ${data.series?.length}`);
const nonEpisodes=Object.keys(data.nonquestions?.episodes||{});
if(nonEpisodes.length<10)fail(`Too few nonquestion episodes: ${nonEpisodes.length}`);
for(const n of [334,335,338,339,341,342,343,344,345,347]){
  if(!data.nonquestions.episodes[String(n)])fail(`Missing nonquestion episode ${n}`);
}
const episodeNumbers=new Set(data.episodes.map(e=>Number(e.number)));
for(const q of data.questions){if(!episodeNumbers.has(Number(q.episode)))fail(`Question points to missing episode ${q.episode}`)}
console.log(JSON.stringify({ok:true,episodes:data.episodes.length,questions:data.questions.length,faqEpisodes:new Set(data.questions.map(q=>q.episode)).size,series:data.series.length,nonquestionEpisodes:nonEpisodes.length},null,2));
