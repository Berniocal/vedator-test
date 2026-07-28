(()=>{
const V=window.V;
V.updateBackTop=()=>{const show=document.documentElement.scrollHeight>innerHeight+120&&scrollY>360;V.$('#backTop').classList.toggle('visible',show)};
V.$$('[data-language]').forEach(b=>b.addEventListener('click',()=>{V.state.lang=b.dataset.language;localStorage.setItem(V.KEYS.lang,V.state.lang);V.state.topic='all';V.setRenderReset();V.render()}));
V.$('#themeToggle').addEventListener('change',e=>{V.state.theme=e.target.checked?'dark':'light';V.applyTheme(true)});
V.$$('.tab').forEach(b=>b.addEventListener('click',()=>{V.state.view=b.dataset.view;V.state.topic='all';V.setRenderReset();V.sortOptions();V.render()}));
V.$('#search').addEventListener('input',()=>{V.setRenderReset();V.render()});V.$('#sort').addEventListener('change',()=>{V.setRenderReset();V.render()});V.$('#topics').addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(!b)return;V.state.topic=b.dataset.topic;V.setRenderReset();V.render()});
V.$('#content').addEventListener('click',e=>{
const toggle=e.target.closest('[data-toggle-text]');if(toggle){const block=toggle.previousElementSibling;block.classList.toggle('expanded');toggle.textContent=V.t(block.classList.contains('expanded')?'readLess':'readMore');return}
const ep=e.target.closest('[data-play-episode]');if(ep){V.openEpisode(Number(ep.dataset.playEpisode));return}
const q=e.target.closest('[data-play-question]');if(q){V.openQuestion(q.dataset.playQuestion);return}
const series=e.target.closest('[data-series-play]');if(series){const card=series.closest('.series-card'),numbers=[...card.querySelectorAll('[data-series-play]')].map(x=>Number(x.dataset.seriesPlay)),items=numbers.map(n=>{const r=V.episodeByNumber(n),l=V.localizedEpisode(r);return r?.enclosure?{kind:'episode',episode:n,title:l.title,url:r.enclosure,start:null}:null}).filter(Boolean);V.openEpisode(Number(series.dataset.seriesPlay),null,items);return}
if(e.target.closest('#addPlaylist')){V.addPlaylist();return}
const edit=e.target.closest('[data-edit-playlist]');if(edit){e.preventDefault();V.openEditor(edit.dataset.editPlaylist);return}
const del=e.target.closest('[data-delete-playlist]');if(del){e.preventDefault();const p=V.state.playlists.find(x=>x.id===del.dataset.deletePlaylist);if(p&&confirm(V.t('confirmDelete',{name:p.name}))){V.state.playlists=V.state.playlists.filter(x=>x.id!==p.id);V.savePlaylists();V.render()}return}
const share=e.target.closest('[data-share-playlist]');if(share){e.preventDefault();V.sharePlaylist(share.dataset.sharePlaylist);return}
const playList=e.target.closest('[data-play-playlist]');if(playList){e.preventDefault();const p=V.state.playlists.find(x=>x.id===playList.dataset.playPlaylist),items=p?V.playlistContext(p):[];if(items.length)V.openAudio(items[0],items);return}
const openItem=e.target.closest('[data-open-playlist-item]');if(openItem){const[id,index]=openItem.dataset.openPlaylistItem.split(':'),p=V.state.playlists.find(x=>x.id===id),items=p?V.playlistContext(p):[],item=items[Number(index)];if(item)V.openAudio(item,items);return}
if(e.target.closest('#exportData')){V.exportData();return}if(e.target.closest('#importData')){V.$('#backupFile').click();return}
});
V.$('#content').addEventListener('toggle',e=>{if(e.target.matches('.series-card'))e.target.querySelector('[data-series-body]')?.classList.toggle('hidden',!e.target.open)},true);V.$('#content').addEventListener('change',e=>{if(e.target.id==='backupFile'&&e.target.files?.[0])V.importData(e.target.files[0])});
window.addEventListener('popstate',()=>{if(!V.$('#audioModal').hidden)V.closeAudio()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!V.$('#playlistEditor').classList.contains('hidden'))V.closeEditor();else if(!V.$('#audioModal').hidden)history.back()}});
V.$('#backTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});window.addEventListener('scroll',V.updateBackTop,{passive:true});window.addEventListener('resize',V.updateBackTop,{passive:true});
let installPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});V.$('#installApp').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}else alert(V.t('installHelp'))});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});V.loadAll();
})();
