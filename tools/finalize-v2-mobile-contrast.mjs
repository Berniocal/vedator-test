import fs from 'node:fs';

const file='v2.html';
let source=fs.readFileSync(file,'utf8');
const oldA='html body .topic-v2.active,html body .question-topic.active{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}';
const oldB='html[data-theme="dark"] body .topic-v2.active,html[data-theme="dark"] body .question-topic.active{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}';
const newA='html body .topic-v2.active,html body .question-topic.active{background:#5b4bdb!important;color:#fff!important;border-color:#7c6eef!important}';
const newB='html[data-theme="dark"] body .topic-v2.active,html[data-theme="dark"] body .question-topic.active{background:#5b4bdb!important;color:#fff!important;border-color:#a399ff!important}';
if(source.includes(oldA))source=source.replace(oldA,newA);
if(source.includes(oldB))source=source.replace(oldB,newB);
if(!source.includes(newA)||!source.includes(newB))throw new Error('Mobile contrast finalizer could not confirm active topic rules');
fs.writeFileSync(file,source);
console.log('Strengthened active topic contrast for mobile dark mode');
