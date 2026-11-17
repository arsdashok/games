'use strict';
(() => {
  const el = id => document.getElementById(id);
  const canvas = el('scene'), art = campsiteArt(canvas);
  const bag = Trail.gear.map(name => {
    const tag = document.createElement('li');tag.textContent=name;el('kit').append(tag);return tag;
  });
  let state, paused=false, previous=0, clock=0, messageUntil=0, packedMessage='', routePercent=-1;
  function message(text) {el('notice').textContent=text;}
  function refresh() {
    const i=Math.min(2,Math.floor(state.x/Trail.step));
    const camp=state.mode==='camp'||state.mode==='done';
    el('place').textContent=camp?'Starlight Camp':Trail.names[i];
    el('stage').textContent=camp?'At the clearing':'Trail '+(i+1)+' of 3';
    el('actions').hidden=camp;el('pause').hidden=camp;
    el('unpack').hidden=state.mode!=='camp';el('finish').hidden=state.mode!=='done';
    el('paused').hidden=!paused;
    el('cue').hidden=paused||camp||(state.mode!=='wait' && clock>=messageUntil);
    el('cue').textContent=state.mode==='wait'?'Hop to keep going ↑':packedMessage;
    bag.forEach((tag,k)=>{
      tag.classList.toggle('packed',state.packed>k);
      tag.setAttribute('aria-label',Trail.gear[k]+(state.packed>k?' packed':' to find'));
    });
  }
  function progress() {
    const n=Math.round(100*state.x/Trail.end);
    if(n===routePercent)return;
    routePercent=n;el('meter').setAttribute('aria-valuenow',n);el('meter').firstElementChild.style.width=n+'%';
  }
  function step(dt) {
    const {mode,packed,x} = state;
    Trail.tick(state,dt);clock+=dt;
    if (packed!==state.packed) {
      packedMessage=Trail.gear[state.packed-1]+' packed!';messageUntil=clock+1.4;
      message(packedMessage);refresh();
    }
    if (mode!==state.mode || Math.floor(x/Trail.step)!==Math.floor(state.x/Trail.step)) {
      refresh();
      if(state.mode==='wait')message('Pip is waiting. Jump when you’re ready.');
      if(state.mode==='camp') {message('You reached camp. Choose an item to unpack.');el('gear').querySelector('button').focus({preventScroll:true});}
    }
    if(state.mode==='run'&&clock>=messageUntil)el('cue').hidden=true;
    progress();
  }
  function frame(now) {
    if(!paused&&!document.hidden) {
      const dt=previous?Math.min(.06,(now-previous)/1000):0;
      step(dt);art.draw(state,clock);
    }
    previous=now;
    requestAnimationFrame(frame);
  }
  function start() {
    const first=!state;
    state=Trail.initial();paused=false;clock=0;previous=0;messageUntil=0;routePercent=-1;
    el('start').hidden=true;el('game').hidden=false;
    for(const button of el('gear').children)button.disabled=false;
    art.resize();refresh();progress();art.draw(state,0);
    el('jump').focus({preventScroll:true});message('Fernwood Valley. Press Space, up arrow or tap to jump.');
    if(first)requestAnimationFrame(frame);
  }
  function jump() {
    if(!state||paused)return;
    const waiting=state.mode==='wait';
    Trail.jump(state);
    if(waiting){message('Back on the trail.');refresh();}
  }
  function setPaused(value) {
    if(!state||!['run','wait'].includes(state.mode))return;
    paused=value;previous=0;refresh();(value?el('resume'):el('jump')).focus({preventScroll:true});
  }
  Trail.gear.forEach((name,i)=>{
    const button=document.createElement('button');button.textContent=['Hang the lantern','Unroll the bedroll','Pitch the tent'][i];
    button.onclick=()=>{
      Trail.unpack(state,i);button.disabled=true;refresh();
      if(state.mode==='done'){message('Your camp is ready.');el('again').focus({preventScroll:true});}
      else el('gear').querySelector('button:enabled')?.focus({preventScroll:true});
    };el('gear').append(button);
  });
  el('play').onclick=start;el('again').onclick=start;el('jump').onclick=jump;
  canvas.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0)jump();});
  el('pause').onclick=()=>setPaused(true);el('resume').onclick=()=>setPaused(false);
  document.addEventListener('keydown',e=>{
    if(!state||!['run','wait'].includes(state.mode))return;
    if(e.key==='Escape'&&!e.repeat){e.preventDefault();setPaused(!paused);return;}
    if (paused || !['Space','ArrowUp'].includes(e.code))return;
    if(e.code==='Space'&&e.target.closest('a,button')&&!el('jump').contains(e.target))return;
    e.preventDefault();if(!e.repeat)jump();
  });
  document.addEventListener('visibilitychange',()=>{previous=0;if(document.hidden&&state&&!paused)setPaused(true);});
  new ResizeObserver(()=>{if(state){art.resize();art.draw(state,clock);}}).observe(canvas);
})();
