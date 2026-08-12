import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const bad="const tabs=$('.tab-v2').filter(tab=>!tab.disabled&&!tab.classList.contains('hidden'));";
const good="const tabs=$$('.tab-v2').filter(tab=>!tab.disabled&&!tab.classList.contains('hidden'));";
if(source.includes(bad))source=source.split(bad).join(good);
if(source.includes(bad))throw new Error('Mobile polish: single-element swipe selector remains');
if(!source.includes(good))throw new Error('Mobile polish: corrected swipe selector missing');
fs.writeFileSync(file,source);
console.log('Finalized all mobile swipe selectors');
