(function(root){
'use strict';
const DEFAULT_ENDPOINT='https://script.google.com/macros/s/AKfycbzbYDPP_rPDGXiXbOwpgxkR6zkGDXLdhFDdnHqvEf54Bsl57zb2iGx0lwBs94hxM54B/exec';
const TEACHER_SIGN_IN_URL='https://script.google.com/macros/s/AKfycbx02Lh5ZbHsPLMPc-9F5ynhQrjXMxMT4x9gDpVMAfAUCia1Ju24CdLLgWgtqG6znwNrXA/exec';
function endpoint(value){
  const s=String(value||'').trim();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(s))throw Error('Connect the character voice in Voice connection first.');
  return s;
}
async function prepare(text,url,token,fetcher=fetch){
  url=endpoint(url);
  if(typeof token!=='string'||token.trim().length<24)throw Error('Enter the teacher connection code in Voice connection.');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),75000);
  try{
    const response=await fetcher(url+'?request='+encodeURIComponent(crypto.randomUUID()),{cache:'no-store',method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({text,token:token.trim()}),signal:controller.signal,redirect:'follow',credentials:'omit'});
    if(!response.ok)throw Error('The voice service is unavailable. Please try again.');
    let data;try{data=await response.json();}catch(_){throw Error('The voice service did not respond correctly. Check its deployment access.');}
    if(!data.ok)throw Error(data.error||(data.service==='Monster Bakery voice'?'The voice service redirected the request. Please save again.':'The recording could not be prepared.'));
    if(typeof data.audio!=='string'||data.audio.length<100||data.audio.length>1400000||!/^[A-Za-z0-9+/]+={0,2}$/.test(data.audio))throw Error('The recording is invalid. Please try again.');
    return {audio:'data:audio/mpeg;base64,'+data.audio,cached:!!data.cached};
  }catch(e){if(e.name==='AbortError')throw Error('The voice service took too long. Save again to retrieve the recording if it finished.');if(e instanceof TypeError)throw Error('Could not reach the voice service. Check your connection and try again.');throw e;}
  finally{clearTimeout(timeout);}
}
const api={endpoint,prepare,DEFAULT_ENDPOINT,TEACHER_SIGN_IN_URL};if(typeof module==='object'&&module.exports)module.exports=api;else root.BakeryVoice=api;
})(typeof window==='object'?window:globalThis);
