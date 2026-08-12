import fs from 'node:fs';
const file='v2.html';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_SERIES_THREE_PER_ROW_V1 */';
if(!source.includes(marker)){
  const css=`\n${marker}\n#series-v2:not(.hidden){grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#series-v2 .series[open]{grid-column:1/-1}\n@media(max-width:620px){#series-v2:not(.hidden){grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important}#series-v2 .series>summary{padding:9px 6px!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:3px!important;align-items:start!important}#series-v2 .series>summary strong{font-size:.72rem!important;line-height:1.15!important;overflow-wrap:anywhere;min-width:0}#series-v2 .series-progress-summary-v2{font-size:.62rem!important;line-height:1.1!important;white-space:normal!important;grid-column:1!important;margin:0!important;align-items:flex-start!important}#series-v2 .series>summary .deep-share{grid-column:2!important;grid-row:1/3!important;width:30px!important;min-width:30px!important;height:30px!important;min-height:30px!important;font-size:.8rem!important}#series-v2 .series[open]{grid-column:1/-1!important}#series-v2 .series[open]>summary strong{font-size:.9rem!important}}\n`;
  source=source.replace('</style>',css+'\n</style>');
  fs.writeFileSync(file,source);
  console.log('Kept series at three cards per row, expanding opened series full width');
}else console.log('Three-series mobile grid already present');
