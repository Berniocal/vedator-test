(()=>{
  if(window.__vedatorTitleOverflowFix)return;
  window.__vedatorTitleOverflowFix=true;

  const style=document.createElement('style');
  style.textContent=`
    .series-card summary > span:first-child,
    details.vedator-playlist-card .vedator-playlist-title{
      display:block;
      flex:1 1 auto;
      min-width:0;
      max-width:100%;
      overflow:hidden;
      white-space:nowrap;
      text-overflow:ellipsis;
    }

    .series-card[open] summary > span:first-child,
    details.vedator-playlist-card[open] .vedator-playlist-title{
      overflow:visible;
      white-space:normal;
      text-overflow:clip;
      overflow-wrap:anywhere;
    }
  `;
  document.head.appendChild(style);
})();
