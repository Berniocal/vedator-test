import fs from 'node:fs';

const data=JSON.parse(fs.readFileSync('content-v2.json','utf8'));
const fail=message=>{throw new Error(message)};

if(data.schema!==3)fail(`Unexpected schema ${data.schema}`);
if(!Array.isArray(data.episodes)||data.episodes.length<380)fail(`Too few episodes: ${data.episodes?.length}`);
if(!Array.isArray(data.questions))fail('Questions missing');
if(data.questions.length!==734)fail(`Expected 734 questions, got ${data.questions.length}`);
if(new Set(data.questions.map(q=>q.episode)).size!==42)fail(`Expected 42 FAQ episodes, got ${new Set(data.questions.map(q=>q.episode)).size}`);
if(data.questions.some(q=>!q.title||!Array.isArray(q.points)||!q.points.length))fail('Question with missing title/answer detected');
if(data.questions.some(q=>!q.i18n?.cs?.title||!q.i18n?.sk?.title||!Array.isArray(q.i18n.cs.points)||!Array.isArray(q.i18n.sk.points)))fail('Question translation bundle missing');
if(!Array.isArray(data.series)||data.series.length<8)fail(`Too few series: ${data.series?.length}`);
if(data.series.some(series=>!series.i18n?.cs||!series.i18n?.sk))fail('Series translation missing');
const nonEpisodes=Object.keys(data.nonquestions?.episodes||{});
if(nonEpisodes.length<10)fail(`Too few nonquestion episodes: ${nonEpisodes.length}`);
for(const n of [334,335,338,339,341,342,343,344,345,347]){
  if(!data.nonquestions.episodes[String(n)])fail(`Missing nonquestion episode ${n}`);
}
const episodeNumbers=new Set(data.episodes.map(e=>Number(e.number)));
for(const q of data.questions){if(!episodeNumbers.has(Number(q.episode)))fail(`Question points to missing episode ${q.episode}`)}

const episodeI18n=data.episodes.filter(e=>e.i18n?.cs&&e.i18n?.sk);
if(episodeI18n.length<340)fail(`Too few bilingual episodes: ${episodeI18n.length}`);
const changedEpisodes=episodeI18n.filter(e=>e.i18n.cs.title!==e.i18n.sk.title||e.i18n.cs.description!==e.i18n.sk.description);
if(changedEpisodes.length<300)fail(`Too few actually translated episodes: ${changedEpisodes.length}`);
const changedQuestions=data.questions.filter(q=>q.i18n.cs.title!==q.i18n.sk.title||q.i18n.cs.points.some((point,index)=>point!==q.i18n.sk.points[index]));
if(changedQuestions.length<500)fail(`Too few actually translated questions: ${changedQuestions.length}`);

const episode343=data.episodes.find(e=>Number(e.number)===343);
if(!episode343?.i18n?.cs?.title.includes('tečky'))fail('Episode 343 Czech title missing');
if(!episode343?.i18n?.sk?.title.includes('bodky'))fail('Episode 343 Slovak title missing');
const blackHoles=data.series.find(series=>series.name==='Černé díry');
if(!blackHoles||blackHoles.i18n.sk!=='Čierne diery')fail('Series Czech/Slovak mapping missing');

console.log(JSON.stringify({
  ok:true,
  episodes:data.episodes.length,
  bilingualEpisodes:episodeI18n.length,
  changedEpisodes:changedEpisodes.length,
  questions:data.questions.length,
  translatedQuestions:changedQuestions.length,
  faqEpisodes:new Set(data.questions.map(q=>q.episode)).size,
  series:data.series.length,
  nonquestionEpisodes:nonEpisodes.length,
  episodeTranslationFiles:data.source?.episodeTranslationFiles,
  questionTranslationFiles:data.source?.questionTranslationFiles
},null,2));
