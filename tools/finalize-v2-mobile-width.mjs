import fs from 'node:fs';

const file='v2.html';
let source=fs.readFileSync(file,'utf8');
const marker='/* V2_MOBILE_WIDTH_CONTAINMENT_V1 */';
if(!source.includes(marker)){
  const css=`\n${marker}\n/* Contain intrinsic widths instead of hiding horizontal overflow. */\nmain,.wrap,.view-v2,.grid,.grid>*,.card,.episode-card-v2,.question-card,.series,.playlist-card,.actions,.episode-summary-v2,.episode-summary-v2>summary,.episode-summary-v2>summary>*,.player-shell,.player-inner,.player-main,.player-controls{min-width:0!important}\n.card,.episode-card-v2,.question-card,.series,.playlist-card,.episode-summary-v2,.actions{max-width:100%!important}\n.card h2,.card p,.card li,.episode-summary-v2 summary,.series summary,.playlist-card summary{overflow-wrap:anywhere;word-break:normal}\n.episode-summary-v2>summary{width:100%!important}\n.episode-summary-v2>summary>span{min-width:0!important;flex:1 1 auto!important}\n.episode-summary-v2>summary>small{min-width:0!important;flex:0 1 auto!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\n@media(max-width:700px){\n  main.wrap{width:100%!important;max-width:100%!important}\n  .view-v2,.grid{width:100%!important;max-width:100%!important}\n  .card,.episode-card-v2,.question-card,.series,.playlist-card{width:100%!important;max-width:100%!important}\n  .actions{width:100%!important;max-width:100%!important}\n  .player-shell{width:100%!important;max-width:100vw!important;left:0!important;right:0!important}\n  .player-inner{width:100%!important;max-width:100vw!important}\n  .player-controls{width:100%!important;max-width:100%!important}\n  .player-controls>*{min-width:0!important;max-width:100%!important}\n}\n`;
  const close='\n</style>';
  if(!source.includes(close))throw new Error('Mobile width finalizer: style closing tag missing');
  source=source.replace(close,css+close);
  fs.writeFileSync(file,source);
  console.log('Constrained intrinsic mobile card/player widths');
}else console.log('Mobile width containment already present');
