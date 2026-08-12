(()=>{
  if(window.__vedatorTabSwipeNavigation)return;
  window.__vedatorTabSwipeNavigation=true;

  const MIN_DISTANCE=85;
  const MAX_DURATION=900;
  const HORIZONTAL_RATIO=1.55;
  const INTERACTIVE='a,button,input,select,textarea,label,audio,video,[contenteditable="true"],[role="button"],[data-no-swipe]';

  let start=null;
  let suppressClickUntil=0;

  const visibleTabs=()=>[...document.querySelectorAll('.tabs .tab')].filter(tab=>{
    const style=getComputedStyle(tab);
    return !tab.disabled&&style.display!=='none'&&style.visibility!=='hidden'&&tab.getClientRects().length>0;
  });

  const horizontallyScrollable=element=>{
    for(let el=element;el&&el!==document.body;el=el.parentElement){
      const style=getComputedStyle(el);
      if((style.overflowX==='auto'||style.overflowX==='scroll')&&el.scrollWidth>el.clientWidth+4)return true;
    }
    return false;
  };

  const swipeFriendlySummary=summary=>!!summary?.closest('.series-card,.vedator-playlist-card');

  const blockedTarget=target=>{
    const element=target instanceof Element?target:null;
    if(!element)return true;
    if(element.closest(INTERACTIVE))return true;
    if(element.closest('.tabs,.topics,.links,.episode-summary,.vedator-editor'))return true;
    const summary=element.closest('summary');
    if(summary&&!swipeFriendlySummary(summary))return true;
    return horizontallyScrollable(element);
  };

  document.addEventListener('touchstart',event=>{
    if(event.touches.length!==1||blockedTarget(event.target)){start=null;return}
    const touch=event.touches[0];
    start={x:touch.clientX,y:touch.clientY,time:performance.now(),id:touch.identifier,target:event.target};
  },{passive:true});

  document.addEventListener('touchend',event=>{
    if(!start||event.changedTouches.length!==1){start=null;return}
    const gesture=start;
    const touch=event.changedTouches[0];
    start=null;
    if(touch.identifier!==gesture.id)return;

    const dx=touch.clientX-gesture.x;
    const dy=touch.clientY-gesture.y;
    const duration=performance.now()-gesture.time;

    if(duration>MAX_DURATION||Math.abs(dx)<MIN_DISTANCE)return;
    if(Math.abs(dx)<Math.abs(dy)*HORIZONTAL_RATIO)return;

    const tabs=visibleTabs();
    if(tabs.length<2)return;
    let index=tabs.findIndex(tab=>tab.classList.contains('active')||tab.getAttribute('aria-selected')==='true');
    if(index<0)index=0;

    const next=index+(dx<0?1:-1);
    if(next<0||next>=tabs.length)return;

    suppressClickUntil=performance.now()+650;
    tabs[next].click();
    tabs[next].scrollIntoView({behavior:'auto',block:'nearest',inline:'center'});
  },{passive:true});

  document.addEventListener('click',event=>{
    if(performance.now()>suppressClickUntil)return;
    if(!(event.target instanceof Element))return;
    if(!event.target.closest('.series-card>summary,.vedator-playlist-card>summary'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClickUntil=0;
  },true);

  document.addEventListener('touchcancel',()=>{start=null},{passive:true});
})();
