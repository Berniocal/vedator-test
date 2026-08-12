import fs from 'node:fs';
const file='tools/test-app-v2.mjs';
let source=fs.readFileSync(file,'utf8');
source=source.replace(
  'const questionSelector=`#questions-v2 [data-question="${bilingualQuestion.episode}:${bilingualQuestion.order}"] h2`;',
  'const questionSelector=`#questions-v2 [data-item="q:${bilingualQuestion.episode}:${bilingualQuestion.order}"] h2`;'
);
fs.writeFileSync(file,source);
console.log('Updated legacy V2 DOM test selectors.');
