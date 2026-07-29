(()=>{
  if(window.__vedatorTitleTruncate)return;
  window.__vedatorTitleTruncate=true;

  const style=document.createElement('style');
  style.textContent=`.series-card>summary>span:first-child, details.vedator-playlist-card>summary .vedator-playlist-title{
      flex:1;
      min-width:0;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    } .series-card[open]>summary>span:first-child, details.vedator-playlist-card[open]>summary .vedator-playlist-title{
      overflow:visible;
      text-overflow:clip;
      white-space:normal;
      overflow-wrap:anywhere;
    } `;
  document.head.appendChild(style);
})();