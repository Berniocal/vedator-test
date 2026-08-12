import fs from 'node:fs';

const file='app-v2.js';
let source=fs.readFileSync(file,'utf8');
if(!source.includes('/* V2_FULL_PARITY_V1 */'))throw new Error('Full parity layer is missing');

source=source.replace(
  "observers:new Map(),generation:0,mediaTick:0,installed:false",
  "observers:new Map(),generations:new Map(),mediaTick:0,installed:false"
);
source=source.replace(
  "return result.length?result:['society'];",
  "return result;"
);
source=source.replace(
  "function episodeTagHtml(episode){return '<div class=\"tags parity-tags\">'+episodeCategoryKeys(episode).map(key=>'<span class=\"tag\">'+parityTopicLabel(EPISODE_TOPICS[key])+'</span>').join('')+'</div>'}",
  "function episodeTagHtml(episode){const keys=episodeCategoryKeys(episode);const labels=keys.length?keys.map(key=>parityTopicLabel(EPISODE_TOPICS[key])):[esc(text('Ostatní','Ostatné'))];return '<div class=\"tags parity-tags\">'+labels.map(label=>'<span class=\"tag\">'+label+'</span>').join('')+'</div>'}"
);
source=source.replace(
  "disconnectParityObserver(view);const generation=++parityUi.generation;container.replaceChildren();",
  "disconnectParityObserver(view);const generation=(parityUi.generations.get(view)||0)+1;parityUi.generations.set(view,generation);container.replaceChildren();"
);
source=source.replace(
  "if(generation!==parityUi.generation)return;const end=Math.min(rendered+(rendered===0?firstCount:amount),items.length);",
  "if(parityUi.generations.get(view)!==generation)return;const end=Math.min(rendered+(rendered===0?firstCount:amount),items.length);"
);

const oneToMany=[
  ["$('.tab-v2').forEach","$$('.tab-v2').forEach"],
  ["$('.view-v2').forEach","$$('.view-v2').forEach"],
  ["$('#series-v2 .series[data-series-index]').forEach","$$('#series-v2 .series[data-series-index]').forEach"]
];
for(const [single,multiple] of oneToMany){
  let at=source.indexOf(single);
  while(at>=0){
    if(at===0||source[at-1]!=='$')source=source.slice(0,at)+multiple+source.slice(at+single.length);
    at=source.indexOf(single,at+multiple.length);
  }
}

if(source.includes("return result.length?result:['society'];"))throw new Error('Other-tag fallback fix did not apply');
if(source.includes('++parityUi.generation')||source.includes('!==parityUi.generation'))throw new Error('Per-view generation fix did not fully apply');
for(const [single] of oneToMany){
  let at=source.indexOf(single),bad=false;
  while(at>=0){if(at===0||source[at-1]!=='$'){bad=true;break}at=source.indexOf(single,at+single.length)}
  if(bad)throw new Error(`Collection selector fix did not apply: ${single}`);
}

fs.writeFileSync(file,source);
console.log('Finalized V2 full parity runtime');
