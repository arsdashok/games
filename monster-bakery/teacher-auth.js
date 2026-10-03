(function(root){
'use strict';
const key='bakery-teacher-session-v1';
let pending=null;
function read(){try{const s=JSON.parse(localStorage.getItem(key)||'null');if(s&&/^session_[a-f0-9]{64}$/.test(s.token)&&s.expiresAt>Date.now())return s;localStorage.removeItem(key);}catch(_){}return null;}
function forget(){try{localStorage.removeItem(key);}catch(_){}if(pending){clearTimeout(pending.timer);pending.reject(Error('Sign-in cancelled.'));pending=null;}}
async function requestOnce(body){const c=new AbortController(),t=setTimeout(()=>c.abort(),60000);try{const r=await fetch(root.BakeryVoice.DEFAULT_ENDPOINT+'?request='+crypto.randomUUID(),{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body),credentials:'omit',cache:'no-store',signal:c.signal});if(!r.ok)throw Error('Google sign-in is temporarily unavailable. Please try again.');const data=await r.json();if(!data.ok)throw Error(data.error||'Could not sign in.');return data;}catch(e){if(e.name==='AbortError')throw Error('Google sign-in took too long. Please try again.');if(e instanceof TypeError)throw Error('Could not reach Google sign-in. Please try again.');throw e;}finally{clearTimeout(t);}}
async function request(body){let error;for(let attempt=0;attempt<3;attempt++){try{return await requestOnce(body);}catch(e){error=e;if(!/temporarily unavailable|reach Google|too long/.test(e.message))throw e;}}throw error;}
async function signIn(onStatus=()=>{}){
 if(pending)throw Error('Finish the open Google sign-in first.');
 onStatus('Preparing your secure sign-in link…');
 const verifier=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
 const challenge=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))),x=>x.toString(16).padStart(2,'0')).join('');
 await request({action:'startSignIn',challenge});
 if(!/^https:\/\/script\.google\.com\/macros\/s\//.test(root.BakeryVoice.TEACHER_SIGN_IN_URL||''))throw Error('Please refresh the game to load the latest sign-in link.');
 const url=root.BakeryVoice.TEACHER_SIGN_IN_URL+'?mode=teacher&challenge='+challenge;
 onStatus('Open Google sign-in, press Connect this browser, then return here.',url);
 return new Promise((resolve,reject)=>{const deadline=Date.now()+280000;const flow={reject,timer:null};pending=flow;async function poll(){if(pending!==flow)return;if(Date.now()>deadline){pending=null;reject(Error('Sign-in timed out. Press Sign in with Google to try again.'));return;}try{const data=await request({action:'completeSignIn',verifier});if(pending!==flow)return;if(!data.pending){if(!/^session_[a-f0-9]{64}$/.test(data.token)||!Number.isFinite(data.expiresAt))throw Error('Invalid sign-in response.');localStorage.setItem(key,JSON.stringify({token:data.token,expiresAt:data.expiresAt}));pending=null;resolve(read());return;}}catch(e){pending=null;reject(e);return;}if(pending)pending.timer=setTimeout(poll,3500);}pending.timer=setTimeout(poll,1800);});
}
root.BakeryTeacher={read,signIn,forget};
})(window);
