import {items,people,surfaces,parseCommand} from './commands.mjs';
import {createSpeechInput} from '../town-trips/speech.mjs';
const $=id=>document.getElementById(id),input=$('sentence'),go=$('go'),mic=$('mic');
function art(cell,label){return `<svg class="art" viewBox="${cell%4*100} ${Math.floor(cell/4)*100} 100 100" role="img" aria-label="${label}"><image href="assets/objects.png" width="400" height="400"/></svg>`;}
function character(name){if(name==='Creeper')return '<img class="portrait" src="../town-trips/assets/creeper.webp" alt="Creeper">';return `<svg class="portrait ${name.toLowerCase()}" viewBox="${name==='Timmy'?'1640 120 68 110':'1638 284 195 104'}" role="img" aria-label="${name}"><image href="../town-trips/assets/reference.png" width="2014" height="1230"/></svg>`;}
for(const person of people)$('people').insertAdjacentHTML('beforeend',`<div class="person" aria-label="${person}">${character(person)}<div class="stash" id="zone-${person}" aria-label="Objects given to ${person}"></div></div>`);
for(const place of surfaces)$('furniture').insertAdjacentHTML('beforeend',`<div class="surface" data-place="${place.id}">${art(place.cell,place.id)}<div class="stash" id="zone-on-${place.id}" aria-label="On the ${place.id}"></div>${place.id==='bag'?'<div class="stash inside" id="zone-in-bag" aria-label="In the bag"></div>':''}</div>`);
for(const item of items)$('objects').insertAdjacentHTML('beforeend',`<button type="button" class="object-word" id="word-${item.cell}" data-word="${item.phrase}">${art(item.cell,item.id)}<span>${item.phrase}</span></button>`);
for(const phrase of [...people.map(n=>'to '+n),...surfaces.map(p=>'on the '+p.id),'in the bag'])$('phrases').insertAdjacentHTML('beforeend',`<button type="button" data-word="${phrase}">${phrase}</button>`);
let busy=false,epoch=0,animation=null,floating=null;
const tokens=new Map();
function say(text,error=false){$('feedback').textContent=text;$('feedback').classList.toggle('error',error);}
async function perform(raw){
 const command=parseCommand(raw);if(!command.ok){say(command.error,true);return command;}
 if(busy)return {ok:false,error:'Wait for this move to finish.'};
 voice.abort();busy=true;go.disabled=true;const turn=++epoch;
 const item=items.find(i=>i.id===command.item),zone=$('zone-'+command.zone);
 document.querySelectorAll('.happy').forEach(e=>e.classList.remove('happy'));
 const previous=tokens.get(item.id),start=(previous||$('word-'+item.cell)).getBoundingClientRect();
 const token=previous||document.createElement('div');token.className='token';token.innerHTML=art(item.cell,item.id);token.setAttribute('aria-label',`${item.id}: ${command.verb==='give'?'given to '+command.target:command.prep+' the '+command.target}`);
 token.style.visibility='hidden';zone.append(token);tokens.set(item.id,token);
 document.querySelectorAll('.stash').forEach(e=>e.classList.toggle('crowded',e.children.length>6));
 const end=token.getBoundingClientRect();floating=document.createElement('div');floating.className='flying';floating.innerHTML=art(item.cell,item.id);floating.setAttribute('aria-hidden','true');floating.style.left=start.left+start.width/2-36+'px';floating.style.top=start.top+start.height/2-36+'px';document.body.append(floating);
 input.value=command.sentence;say('Here we go!');
 const dx=end.left+end.width/2-start.left-start.width/2,dy=end.top+end.height/2-start.top-start.height/2;
 animation=floating.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx/2}px,${dy/2-55}px) scale(1.12)`,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(${end.width/72})`}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?1:1100,easing:'ease-in-out',fill:'forwards'});
 try{await animation.finished;}catch{}
 if(turn!==epoch)return {ok:false,cancelled:true};
 floating.remove();floating=null;animation=null;token.style.visibility='visible';zone.parentElement.classList.add('happy');
 $('scene-message').textContent=command.sentence;busy=false;go.disabled=false;say('Done! What next?');return command;
}
const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
const voice=createSpeechInput({Speech,read:()=>input.value,write:t=>{input.value=t;},state:on=>{mic.classList.toggle('listening',on);mic.querySelector('span').textContent=!Speech?'No mic':on?'Stop':'Speak';mic.setAttribute('aria-pressed',String(on));mic.setAttribute('aria-label',on?'Stop microphone':'Start microphone');},message:say,submit:perform,hidden:()=>document.hidden});
if(!Speech){mic.disabled=true;mic.querySelector('span').textContent='No mic';say('Type your instruction and press Go.');}
mic.addEventListener('click',()=>{if(busy)return;if(voice.active)voice.finish();else voice.start();});
$('form').addEventListener('submit',e=>{e.preventDefault();if(voice.active||voice.finishing)voice.finish(true);else perform(input.value);});
input.addEventListener('input',()=>voice.abort());
document.querySelectorAll('[data-word]').forEach(button=>button.addEventListener('click',()=>{voice.abort();const word=button.dataset.word;if(word==='Give'||word==='Put')input.value=word;else input.value=(input.value.trim()+' '+word).trim();input.focus();}));
$('reset').addEventListener('click',()=>{epoch++;voice.abort();animation?.cancel();floating?.remove();animation=null;floating=null;tokens.forEach(t=>t.remove());tokens.clear();document.querySelectorAll('.happy,.crowded').forEach(e=>e.classList.remove('happy','crowded'));input.value='';busy=false;go.disabled=false;$('scene-message').textContent='What shall we do?';say('Press Speak. Take your time, then press Go.');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)voice.abort();});window.addEventListener('pagehide',()=>voice.abort());
if(document.modelContext?.registerTool)try{Promise.resolve(document.modelContext.registerTool({name:'give_or_put',description:'Execute a complete Give or Put instruction using the same strict parser and animation as Go. No microphone access.',inputSchema:{type:'object',properties:{sentence:{type:'string',maxLength:180}},required:['sentence'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:args=>perform(args.sentence)})).catch(()=>{});}catch{}
