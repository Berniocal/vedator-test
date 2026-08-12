import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const oldLine="const episodes=sortedParityEpisodes().slice().sort((a,b)=>(Number(a.number)||0)-(Number(b.number)||0));";
const newLine='const episodes=sortedParityEpisodes();';
if(source.includes(oldLine))source=source.replace(oldLine,newLine);
if(source.includes(oldLine))throw new Error('Episode context still re-sorts visible episodes');
if(!source.includes(newLine))throw new Error('Episode context visible-order line missing');
fs.writeFileSync(file,source);
console.log('Episode player context now follows the visible filtered/sorted order');
