(function(root){
'use strict';
let enabled=false,ctx=null,nodes=new Set(),timers=new Set(),ovenTimer=null,reaction=null,previous={};
function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);if(enabled&&!document.hidden)fn();},ms);timers.add(id);return id;}
function context(){if(!enabled||document.hidden)return null;try{ctx ||= new (root.AudioContext||root.webkitAudioContext)();ctx.resume().catch(()=>{});return ctx;}catch(_){return null;}}
function tone(freq,duration=.15,volume=.035,end=freq,type='sine',delay=0){const c=context();if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(c.destination);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.03);}
function noise(duration=.2,volume=.04,freq=800,delay=0){const c=context();if(!c)return;const t=c.currentTime+delay,source=c.createBufferSource(),buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);source.buffer=buffer;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=freq;const gain=c.createGain();gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter);filter.connect(gain);gain.connect(c.destination);nodes.add(source);source.onended=()=>{nodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(t);source.stop(t+duration);}
function play(kind){if(!enabled)return;
 if(kind==='bird'){const f=1400+Math.random()*700;tone(f,.12,.018,f*1.35);tone(f*1.25,.17,.013,f*.85,'sine',.17);noise(.12,.014,1700,.04);}
 if(kind==='mouse'){tone(1700,.09,.012,2500);tone(2100,.11,.01,1400,'sine',.18);for(let i=0;i<4;i++)noise(.05,.012,550,.3+i*.13);}
 if(kind==='water'){noise(.55,.065,2300);for(let i=0;i<5;i++)tone(500+Math.random()*700,.13,.024,180,'sine',.08+i*.065);}
 if(kind==='plop'){tone(180,.2,.10,45);noise(.22,.055,900,.04);tone(550,.12,.032,180,'sine',.12);}
 if(kind==='oven'){tone(85,.48,.018,70,'triangle');noise(.45,.025,350);}
 if(kind==='ding'){tone(1180,.65,.024,1180);tone(1770,.5,.014,1770,'sine',.06);}
 if(kind==='chew'){for(let i=0;i<3;i++){noise(.16,.04,380,i*.28);tone(140,.15,.035,75,'sine',i*.28+.04);}}
}
function stop(){for(const id of timers)clearTimeout(id);timers.clear();if(ovenTimer){clearInterval(ovenTimer);ovenTimer=null;}for(const n of nodes){try{n.stop();}catch(_){}}nodes.clear();if(reaction){reaction.pause();reaction=null;}}
function setEnabled(on){enabled=!!on;if(!enabled)stop();else context();}
function speak(kind){if(!enabled||document.hidden)return;reaction=new Audio('./audio/'+kind+'.mp3');reaction.volume=.55;reaction.play().catch(()=>{});}
root.BakerySound={play,later,setEnabled,stop};
root.addEventListener('bakery-sound-setting',e=>setEnabled(e.detail));
root.addEventListener('bakery-word-play',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
root.addEventListener('bakery-state',e=>{const s=e.detail,p=previous;previous=s;if(p.stage==='result'&&s.stage!=='result')stop();if(ovenTimer&&s.stage!=='baking'){clearInterval(ovenTimer);ovenTimer=null;}
 if(s.stage==='baking'&&p.stage!=='baking'&&enabled){play('oven');ovenTimer=setInterval(()=>play('oven'),600);}
 if(s.stage==='serve'&&p.stage==='baking')play('ding');
 if(s.stage==='result'&&p.stage==='serve'){play('chew');later(()=>speak(s.correct===s.total?'yummy':'ohno'),1050);}
});
})(window);
