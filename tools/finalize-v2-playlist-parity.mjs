import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
if(!source.includes('/* V2_PLAYLIST_PARITY_V1 */'))throw new Error('Playlist parity layer missing');

const oldObserver="const modal=$('#playlist-editor-v2');if(modal){new MutationObserver(()=>enhancePlaylistEditorMobile()).observe(modal,{childList:true,subtree:true});modal.addEventListener('click',event=>{";
const replacement="const modal=$('#playlist-editor-v2');if(modal){document.addEventListener('click',event=>{if(event.target.closest?.('.playlist-card .edit'))setTimeout(enhancePlaylistEditorMobile,0)});modal.addEventListener('input',()=>setTimeout(enhancePlaylistEditorMobile,0));modal.addEventListener('change',()=>setTimeout(enhancePlaylistEditorMobile,0));modal.addEventListener('click',event=>{";
if(!source.includes(oldObserver))throw new Error('Self-triggering playlist observer not found');
source=source.replace(oldObserver,replacement);
if(source.includes('new MutationObserver(()=>enhancePlaylistEditorMobile())'))throw new Error('Playlist editor observer still present');
fs.writeFileSync(file,source);
console.log('Finalized playlist editor without MutationObserver loop');
