// Browser sessions may end during silence; the pupil's recording session does not.
export function createSpeechInput({Speech,read,write,state,message,submit,hidden=()=>false,schedule=setTimeout,cancel=clearTimeout}){
 let current=null,active=false,finishing=false,send=false,restartTimer,finishTimer;
 const clean=text=>String(text).replace(/[.,!?;:]+/g,' ').replace(/\s+/g,' ').trim();
 function complete(){
  cancel(finishTimer);cancel(restartTimer);
  const shouldSend=send;send=false;active=false;finishing=false;
  const old=current;current=null;if(old)try{old.abort();}catch{}
  state(false);
  if(shouldSend)submit(read());
 }
 function abort(){send=false;complete();}
 function session(){
  if(!active||hidden()){abort();return;}
  const base=clean(read()),r=new Speech();current=r;
  r.lang='en-GB';r.continuous=true;r.interimResults=true;r.maxAlternatives=3;
  r.onresult=event=>{
   if(current!==r||(!active&&!finishing))return;
   const parts=[base];
   for(let i=0;i<event.results.length;i++)parts.push(event.results[i][0].transcript);
   write(clean(parts.join(' ')));
  };
  r.onend=()=>{
   if(current!==r)return;current=null;
   if(finishing){complete();return;}
   if(active&&!hidden())restartTimer=schedule(session,400);
   else abort();
  };
  r.onerror=event=>{
   if(current!==r)return;
   // Silence is thinking time, not a failed attempt. onend restarts recognition.
   if(event.error==='no-speech')return;
   if(finishing){complete();return;}
   const errors={'not-allowed':'Allow microphone access, or type your sentence.','service-not-allowed':'Voice input is unavailable here. Type your sentence instead.','audio-capture':'No microphone found. You can type instead.','network':'Voice connection lost. Your words are kept. Press Speak to start again, or edit and press Go.'};
   message(errors[event.error]||'Microphone stopped. Your words are kept; you can edit them and press Go.',true);abort();
  };
  try{r.start();}catch{message('Could not start the microphone. You can type instead.',true);abort();}
 }
 function start(){
  if(!Speech||active||finishing)return;
  write('');active=true;state(true);
  message('Take your time. Pause whenever you like. Press Go when you are ready.');session();
 }
 function finish(shouldSend=false){
  if(finishing){send=send||shouldSend;return;}
  if(!active){if(shouldSend)submit(read());return;}
  active=false;finishing=true;send=shouldSend;cancel(restartTimer);state(false);
  message(shouldSend?'Finishing your sentence…':'Your words are kept. Edit them if needed, then press Go.');
  // Let a last, in-flight recognition result arrive before submitting.
  if(current){finishTimer=schedule(complete,1800);try{current.stop();}catch{complete();}}
  else complete();
 }
 return {start,finish,abort,get active(){return active;},get finishing(){return finishing;}};
}
