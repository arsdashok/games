import {parseCommand} from './commands.mjs';
import {createSpeechInput} from './speech.mjs';
const $=id=>document.getElementById(id);
const characters={goose:'Goose',timmy:'Timmy',creeper:'Creeper'};
const places={school:{label:'school',phrase:'to school',x:16.25,y:26,p:[130,180]},home:{label:'home',phrase:'home',x:16.25,y:76,p:[130,490]},park:{label:'park',phrase:'to the park',x:47.5,y:26,p:[380,180]},library:{label:'library',phrase:'to the library',x:81.25,y:26,p:[650,180]},shop:{label:'shop',phrase:'to the shop',x:81.25,y:76,p:[650,490]},playground:{label:'playground',phrase:'to the playground',x:47.5,y:76,p:[380,490]},'swimming pool':{label:'swimming pool',phrase:'to the swimming pool',x:47.5,y:49,p:[380,320]}};
const modes=['walk','bus','car','plane','train'];
function characterArt(who){if(who==='creeper')return '<img class="character-pic" src="assets/creeper.webp" alt="Creeper">';const view=who==='timmy'?'1640 120 68 110':'1638 284 195 104';return `<svg class="character-pic sprite" viewBox="${view}" role="img" aria-label="${characters[who]}"><image href="assets/reference.png" width="2014" height="1230"/></svg>`;}
function placeArt(key){const cell={school:[0,0],home:[1,0],park:[2,0],library:[0,1],shop:[1,1],playground:[2,1],'swimming pool':[0,2]}[key];return `<div class="picture-window"><svg class="place-art" viewBox="${cell[0]*418} ${cell[1]*418} 418 418" role="img" aria-label="${key}"><image href="assets/places-atlas.png" width="1254" height="1254"/></svg></div>`;}
for(const [key,p] of Object.entries(places))$('places').insertAdjacentHTML('beforeend',`<div class="place" id="place-${key.replace(' ','-')}" style="left:${p.x}%;top:${p.y}%">${placeArt(key)}</div>`);
for(const who of Object.keys(characters)){$('who').insertAdjacentHTML('beforeend',`<button type="button" class="word" data-word="${characters[who]}">${characterArt(who)}${characters[who]}</button>`);$('travellers').insertAdjacentHTML('beforeend',`<div class="traveller" id="actor-${who}" aria-label="${characters[who]} at home"><div class="rider">${characterArt(who)}</div><img class="vehicle" alt=""><span class="name">${characters[who]}</span></div>`);}
$('how').insertAdjacentHTML('beforeend','<button type="button" class="word verb-word" data-word="goes">goes</button>');
for(const mode of modes)$('how').insertAdjacentHTML('beforeend',`<button type="button" class="word" data-word="${mode==='walk'?'walks':'by '+mode}"><img src="assets/${mode}.png" alt="">${mode==='walk'?'walks':'by '+mode}</button>`);
for(const p of Object.values(places))$('where').insertAdjacentHTML('beforeend',`<button type="button" class="word" data-word="${p.phrase}">${p.phrase}</button>`);
document.querySelectorAll('[data-word]').forEach(b=>b.addEventListener('click',()=>{stopVoice();const input=$('sentence'),word=b.dataset.word;if(Object.values(characters).includes(word)&&/[.!?]$/.test(input.value.trim()))input.value='';input.value=(input.value.trim()+' '+word).trim();input.focus();}));
let positions={},busy=false,tripToken=0,frame=0,pendingTrip;
const offsets={goose:[-52,9],timmy:[0,-2],creeper:[52,9]};
const input=$('sentence'),feedback=$('feedback'),mic=$('mic'),go=$('go');
function say(message,error=false){feedback.textContent=message;feedback.classList.toggle('error',error);}
function draw(who,point,idle=false){const actor=$('actor-'+who),offset=idle?offsets[who]:[0,0];actor.style.left=((point[0]+offset[0])/8)+'%';actor.style.top=((point[1]+offset[1])/6)+'%';}
function reset(){tripToken++;cancelAnimationFrame(frame);if(pendingTrip){pendingTrip({ok:false,cancelled:true});pendingTrip=null;}busy=false;go.disabled=false;document.querySelectorAll('.place').forEach(e=>e.classList.remove('arrived'));for(const who of Object.keys(characters)){positions[who]=[130,490];const actor=$('actor-'+who);actor.className='traveller';actor.setAttribute('aria-label',characters[who]+' at home');draw(who,positions[who],true);}input.value='';$('journey').textContent='Where shall we go?';say('Say a whole sentence, or type it and press Go.');stopVoice(true);}
function route(from,to){const path=[from.slice()];if(from[0]!==to[0]&&from[1]!==to[1])path.push([from[0],320],[to[0],320]);else if(from[0]!==to[0])path.push([to[0],from[1]]);path.push(to.slice());return path.filter((p,i,a)=>!i||p[0]!==a[i-1][0]||p[1]!==a[i-1][1]);}
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
async function runTrip(command){
 if(busy)return {ok:false,error:'Wait for this trip to finish, then try your sentence.'};
 stopVoice(true);busy=true;go.disabled=true;
 const token=++tripToken,{who,mode,destination,sentence}=command,actor=$('actor-'+who),start=positions[who].slice(),end=places[destination].p.slice();
 document.querySelectorAll('.place').forEach(e=>e.classList.remove('arrived'));
 actor.className='traveller moving '+(mode==='walk'?'walk':'riding '+mode);
 const vehicle=actor.querySelector('.vehicle');if(mode!=='walk'){vehicle.src=`assets/${mode}.png`;vehicle.alt=mode;}
 actor.setAttribute('aria-label',sentence);$('journey').textContent=sentence;say('Off we go!');
 const path=mode==='plane'?[start,end]:route(start,end),lengths=path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1])),total=lengths.reduce((a,b)=>a+b,0);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=reduced?350:Math.min(6200,Math.max(1900,total*(mode==='walk'?9:6)));
 return await new Promise(resolve=>{pendingTrip=resolve;let begin;
  function animate(now){if(token!==tripToken){resolve({ok:false,cancelled:true});return;}begin??=now;const progress=Math.min(1,(now-begin)/duration);let point;
   if(total<1){point=[end[0],end[1]-(reduced?0:Math.sin(progress*Math.PI)*28)];}
   else if(mode==='plane'){const t=ease(progress);point=[start[0]+(end[0]-start[0])*t,start[1]+(end[1]-start[1])*t-(reduced?0:Math.sin(t*Math.PI)*95)];}
   else {let d=total*progress,seg=0;while(seg<lengths.length-1&&d>lengths[seg]){d-=lengths[seg];seg++;}const t=lengths[seg]?d/lengths[seg]:1;point=[path[seg][0]+(path[seg+1][0]-path[seg][0])*t,path[seg][1]+(path[seg+1][1]-path[seg][1])*t];}
   draw(who,point);
   if(progress<1){frame=requestAnimationFrame(animate);return;}
   positions[who]=end;actor.className='traveller';draw(who,end,true);actor.setAttribute('aria-label',characters[who]+' at '+destination);$('place-'+destination.replace(' ','-')).classList.add('arrived');$('journey').textContent=`${characters[who]} is ${destination==='home'?'home':'at '+(destination==='school'?'school':'the '+destination)}!`;say('Your sentence made it happen. Where next?');busy=false;go.disabled=false;pendingTrip=null;resolve({ok:true,who,destination,mode});
  }frame=requestAnimationFrame(animate);
 });
}
async function submit(raw,voice=false){const command=parseCommand(raw,{voice});if(!command.ok){say(command.error,true);return command;}if(busy){const result={ok:false,error:'Wait for this trip to finish, then press Go.'};say(result.error);return result;}input.value=command.sentence;return runTrip(command);}
$('command-form').addEventListener('submit',e=>{e.preventDefault();if(voice.active||voice.finishing)voice.finish(true);else submit(input.value);});$('reset').addEventListener('click',reset);
const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
function setListening(on){mic.classList.toggle('listening',on);mic.querySelector('span').textContent=!Speech?'No mic':on?'Stop':'Speak';mic.setAttribute('aria-label',on?'Stop microphone':'Start microphone');mic.setAttribute('aria-pressed',String(on));}
const voice=createSpeechInput({Speech,read:()=>input.value,write:value=>{input.value=value;},state:setListening,message:say,submit:value=>submit(value,true),hidden:()=>document.hidden});
function stopVoice(){voice.abort();}
if(!Speech){mic.disabled=true;mic.title='Voice input is not supported in this browser. Type your sentence instead.';$('mic').querySelector('span').textContent='No mic';}
mic.addEventListener('click',()=>{
 if(voice.active){voice.finish();return;}
 if(busy){say('Let this trip finish before the next sentence.');return;}
 voice.start();
});
input.addEventListener('input',()=>{if(voice.active||voice.finishing)stopVoice();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice(true);});
window.addEventListener('pagehide',()=>stopVoice());
reset();if(!Speech)say('Voice input is unavailable in this browser. Type a sentence and press Go.');
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'send_character',title:'Send a character around town',description:'Run one whole English sentence through the same check and animation as the Go button. Does not use the microphone.',inputSchema:{type:'object',properties:{sentence:{type:'string',maxLength:180}},required:['sentence'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async arg=>{if(!arg||typeof arg.sentence!=='string'||arg.sentence.length>180)return {ok:false,error:'A sentence of up to 180 characters is required.'};input.value=arg.sentence;return submit(arg.sentence);}})).catch(()=>{});}catch{}}
