(function(root){
'use strict';
const validId=id=>typeof id==='string'&&/^[a-f0-9]{64}$/.test(id);
async function request(body,id){let last;for(let attempt=0;attempt<3;attempt++){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);try{const endpoint=root.BakeryVoice.DEFAULT_ENDPOINT;const url=endpoint+(id?'?menu='+id+'&':'?')+'request='+crypto.randomUUID();const response=await fetch(url,{...(body?{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body)}:{}),credentials:'omit',cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Please try again. The menu service is temporarily unavailable.');const data=await response.json();if(data.service==='Monster Bakery voice')throw Error('The menu service redirected the request. Please try again.');if(!data.ok)throw Error(data.error||'This menu could not be opened.');return data;}catch(e){last=e;if(!/temporarily|redirected|Failed to fetch|Load failed|aborted/i.test(e.message))throw e;}finally{clearTimeout(timer);}}throw last;}
async function share(menu,token,id){if(!token||token.length<24)throw Error('Sign in with Google to share a student menu.');if(!validId(id))throw Error('Could not prepare the share link.');const data=await request({action:'shareMenu',menu,token,id});if(!validId(data.id))throw Error('Could not prepare the share link.');return 'https://arsdashok.github.io/games/monster-bakery/#menu='+data.id;}
async function load(id){if(!validId(id))throw Error('This student link is invalid. Ask your teacher for a new link.');return (await request(null,id)).menu;}
function newId(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');}
root.BakeryMenus={share,load,newId};
})(window);
