import fs from 'node:fs';
const file='v2.html';
let source=fs.readFileSync(file,'utf8');
const oldMarker='/* V2_SERIES_THREE_PER_ROW_V1 */';
const marker='/* V2_SERIES_DESKTOP_THREE_MOBILE_ONE_V1 */';
const css=`\n${marker}\n#series-v2:not(.hidden){grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#series-v2 .series[open]{grid-column:1/-1}\n@media(max-width:700px){#series-v2:not(.hidden){grid-template-columns:minmax(0,1fr)!important;gap:10px!important}#series-v2 .series,#series-v2 .series[open]{grid-column:auto!important}}\n`;
if(source.includes(oldMarker)){
  const start=source.indexOf(oldMarker),end=source.indexOf('</style>',start);
  if(end<0)throw new Error('Style end missing after old series marker');
  source=source.slice(0,start)+css+'\n'+source.slice(end);
}else if(!source.includes(marker)){
  source=source.replace('</style>',css+'\n</style>');
}
fs.writeFileSync(file,source);
console.log('Series use three desktop columns and one phone column');
