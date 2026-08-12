import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_UI_EXPERIENCE_V1 */';
if(source.includes(marker)){
  console.log('V2 UI experience already present.');
  process.exit(0);
}

const block=`
  ${marker}
  const THEME_KEY='vedator-ui-theme-v1';
  function systemPreferredTheme(){
    try{return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{return'light'}
  }
  function storedTheme(){
    try{const saved=localStorage.getItem(THEME_KEY);return saved==='dark'||saved==='light'?saved:''}catch{return''}
  }
  function currentTheme(){
    const html=document.documentElement.dataset.theme;
    return html==='dark'||html==='light'?html:(storedTheme()||systemPreferredTheme());
  }
  function updateThemeButton(){
    const button=$('#theme-toggle-v2');if(!button)return;
    const dark=currentTheme()==='dark';
    const label=dark?text('Přepnout na světlý režim','Prepnúť na svetlý režim'):text('Přepnout na tmavý režim','Prepnúť na tmavý režim');
    button.textContent=dark?'☀':'☾';button.title=label;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(dark));
  }
  function updateBackTopLabel(){
    const button=$('#back-top-v2');if(!button)return;
    const label=text('Nahoru','Nahor');button.title=label;button.setAttribute('aria-label',label);
  }
  function applyTheme(theme,persist=true){
    const next=theme==='dark'?'dark':'light';document.documentElement.dataset.theme=next;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=next==='dark'?'#0b0e16':'#151b2f';
    if(persist){try{localStorage.setItem(THEME_KEY,next)}catch{}}
    updateThemeButton();
    window.dispatchEvent(new CustomEvent('vedatorthemechange',{detail:{theme:next}}));
  }
  function updateBackTopVisibility(){
    const button=$('#back-top-v2');if(!button)return;
    button.classList.toggle('hidden',Number(window.scrollY||0)<650);
  }
  function installUiExperience(){
    if(document.documentElement.dataset.v2UiInstalled==='1')return;
    document.documentElement.dataset.v2UiInstalled='1';
    applyTheme(storedTheme()||currentTheme(),false);updateBackTopLabel();updateBackTopVisibility();
    $('#theme-toggle-v2')?.addEventListener('click',()=>applyTheme(currentTheme()==='dark'?'light':'dark',true));
    $('#back-top-v2')?.addEventListener('click',()=>{
      let behavior='smooth';try{if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)behavior='auto'}catch{}
      try{window.scrollTo({top:0,behavior})}catch{window.scrollTo?.(0,0)}
    });
    window.addEventListener('scroll',updateBackTopVisibility,{passive:true});
    window.addEventListener('vedatorlanguagechange',()=>{updateThemeButton();updateBackTopLabel()});
    try{
      const media=window.matchMedia?.('(prefers-color-scheme: dark)');
      media?.addEventListener?.('change',event=>{if(!storedTheme())applyTheme(event.matches?'dark':'light',false)});
    }catch{}
  }

`;
const startToken='  async function start(){';
const at=source.indexOf(startToken);
if(at<0)throw new Error('start() token not found');
source=source.slice(0,at)+block+source.slice(at);

const startup='buildLegacyQuestionIndex();loadUserData();installEpisodeExperienceStyles();applyStaticUi();';
if(!source.includes(startup))throw new Error('V2 startup sequence not found');
source=source.replace(startup,'buildLegacyQuestionIndex();loadUserData();installEpisodeExperienceStyles();installUiExperience();applyStaticUi();');

const clearSequence="state.language='sk';loadUserData();rerenderLanguage();$('#status-v2').textContent=";
if(source.includes(clearSequence))source=source.replace(clearSequence,"state.language='sk';applyTheme(systemPreferredTheme(),false);loadUserData();rerenderLanguage();$('#status-v2').textContent=");

fs.writeFileSync(file,source);
console.log('Injected V2 theme, mobile helpers, and back-to-top behavior into app-v2.js');
