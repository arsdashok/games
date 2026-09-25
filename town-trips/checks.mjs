import assert from 'node:assert/strict';
import {parseCommand,names,destinations,transport} from './commands.mjs';
import {createSpeechInput} from './speech.mjs';
let count=0;
for(const who of names)for(const dest of destinations)for(const mode of transport){
 const place=dest==='home'?'home':dest==='school'?'to school':'to the '+dest;
 const sentence=who+' '+(mode==='walk'?'walks ':'goes ')+place+(mode==='walk'?'':' by '+mode);
 assert.equal(parseCommand(sentence).ok,true,sentence);count++;
 if(mode!=='walk')assert.equal(parseCommand(who+' goes by '+mode+' '+place).ok,false);
}
for(const sentence of ['creeper goes by bus home','Timmy go to school by bus','Goose walks to school by car','Creeper goes to home by train','Timmy goes to school','bus home','Goose walks school','Timmy goes to park by bus']){
 assert.equal(parseCommand(sentence).ok,false,sentence);assert.equal(parseCommand(sentence,{voice:true}).ok,false,sentence);
}
function rig(){
 let text='',listening=false;const sent=[],errors=[],sessions=[],timers=new Map();let sequence=0;
 class FakeSpeech{constructor(){sessions.push(this);}start(){}stop(){this.stopped=true;}abort(){this.aborted=true;}}
 const voice=createSpeechInput({Speech:FakeSpeech,read:()=>text,write:t=>{text=t;},state:b=>{listening=b;},message:(m,e)=>{if(e)errors.push(m);},submit:t=>sent.push(t),schedule:(fn,delay)=>{timers.set(++sequence,{fn,delay});return sequence;},cancel:id=>timers.delete(id)});
 const flush=()=>{const tasks=[...timers.values()];timers.clear();for(const t of tasks)t.fn();};
 const result=(r,...parts)=>r.onresult({results:parts.map(p=>Object.assign([{transcript:p}],{isFinal:true}))});
 return {voice,sessions,sent,errors,timers,flush,result,get text(){return text;},get listening(){return listening;}};
}
const t=rig();t.voice.start();assert.equal(t.sessions[0].continuous,true);
assert.equal(t.timers.size,0,'No automatic listening deadline');
t.result(t.sessions[0],'Timmy goes.');assert.equal(t.sent.length,0,'Do not submit a partial sentence');
t.sessions[0].onerror({error:'no-speech'});t.sessions[0].onend();t.flush();
assert.equal(t.listening,true);assert.equal(t.sessions.length,2);
t.result(t.sessions[1],'to the swimming pool.','by bus.');
assert.equal(t.text,'Timmy goes to the swimming pool by bus');assert.equal(t.sent.length,0,'Do not auto-submit even a complete sentence');
t.voice.finish(true);assert.equal(t.sessions[1].stopped,true);assert.equal(t.sent.length,0,'Wait for final results');
t.sessions[1].onend();assert.deepEqual(t.sent,['Timmy goes to the swimming pool by bus']);assert.equal(t.timers.size,0);
const u=rig();u.voice.start();u.result(u.sessions[0],'Goose');u.voice.finish(true);u.result(u.sessions[0],'Goose walks to school');u.sessions[0].onend();assert.deepEqual(u.sent,['Goose walks to school']);
const v=rig();v.voice.start();v.result(v.sessions[0],'Creeper goes home by train');v.voice.finish();v.sessions[0].onend();assert.equal(v.sent.length,0);assert.equal(v.text,'Creeper goes home by train');
const w=rig();w.voice.start();w.sessions[0].onend();w.voice.abort();w.flush();assert.equal(w.sessions.length,1,'No restart after cancellation');
const x=rig();x.voice.start();x.sessions[0].onerror({error:'not-allowed'});x.sessions[0].onend();x.flush();assert.equal(x.listening,false);assert.equal(x.sessions.length,1);assert.equal(x.errors.length,1);
const y=rig();y.voice.start();y.result(y.sessions[0],'Goose walks home');y.voice.finish(true);y.flush();assert.deepEqual(y.sent,['Goose walks home']);y.sessions[0].onend();assert.equal(y.sent.length,1);
console.log(`${count} valid combinations; wrong order rejected; silence/restart, manual submit, final results, cancellation, permission errors and stop fallback passed.`);
