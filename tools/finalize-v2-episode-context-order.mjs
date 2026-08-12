import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const oldLine="const episodes=sortedParityEpisodes().slice().sort((a,b)=>(Number(a.number)||0)-(Number(b.number)||0));";
const visibleLine='const episodes=sortedParityEpisodes();';
const finalLine="const episodes=parityUi.episodeTopic==='all'&&!state.query.trim()?sortedParityEpisodes().slice().sort((a,b)=>(Number(a.number)||0)-(Number(b.number)||0)):sortedParityEpisodes();";

if(source.includes(finalLine)){
  console.log('Episode player context already uses final numeric All navigation');
  process.exit(0);
}
if(source.includes(oldLine))source=source.replace(oldLine,visibleLine);
if(source.includes(oldLine))throw new Error('Episode context still uses old unconditional numeric ordering');
if(!source.includes(visibleLine))throw new Error('Episode context base line missing');
fs.writeFileSync(file,source);
console.log('Episode player context prepared for final navigation layer');
