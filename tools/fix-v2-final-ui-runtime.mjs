import fs from 'node:fs';
const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const oldValue="function finalIsStandalone(){return matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true}";
const newValue="function finalIsStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true}";
if(source.includes(oldValue))source=source.replace(oldValue,newValue);
if(!source.includes(newValue))throw new Error('finalIsStandalone compatibility fix missing');
fs.writeFileSync(file,source);
console.log('Fixed V2 install matchMedia compatibility');
