export const names=['goose','timmy','creeper'];
export const destinations=['school','home','park','library','shop','playground','swimming pool'];
export const transport=['walk','bus','car','plane','train'];
export function parseCommand(raw,{voice=false}={}){
 let s=String(raw??'').toLowerCase().trim().replace(/[.,!?;:]+$/g,'').replace(/\s+/g,' ');
 if(voice)s=s.replace(/^tim(?:mie|i)\b/,'timmy').replace(/^creepa\b/,'creeper').replace(/by plain$/,'by plane');
 if(!s)return {ok:false,error:'Say who, where and how. Try: Goose walks to school.'};
 const who=s.match(/^(?:the )?(goose|timmy|creeper)\b/);
 if(!who)return {ok:false,error:'Who is going? Start with Goose, Timmy or Creeper.'};
 const rest=s.slice(who[0].length).trim();
 if(/^(?:goes|walks) (?:by\b|on foot\b)/.test(rest))return {ok:false,error:'Put the place before the transport: who → action → where → how. Try the whole sentence again.'};
 if(/^(go|walk)\b/.test(rest))return {ok:false,error:`With ${who[1][0].toUpperCase()+who[1].slice(1)}, use “goes” or “walks”. Try the whole sentence again.`};
 const verb=rest.match(/^(goes|walks)\s+/);
 if(!verb)return {ok:false,error:'Add an action: goes or walks. Say the whole sentence.'};
 if(/\bto (?:the )?home\b/.test(rest))return {ok:false,error:'We say “goes home” or “walks home”, without “to”.'};
 const match=rest.match(/^(goes|walks) (home|to school|to the (?:park|library|shop|playground|swimming pool))(?: (by (?:bus|car|plane|train)|on foot))?$/);
 if(!match)return {ok:false,error:'Try: Timmy goes to the swimming pool by bus. For school, use “to school”; for home, just “home”.'};
 const [,action,place,way]=match;
 if(action==='walks'&&way&&way!=='on foot')return {ok:false,error:'Walking or riding? Use “walks to school” OR “goes to school by bus”.'};
 if(action==='goes'&&!way)return {ok:false,error:'How? Add by bus, by car, by plane, by train or on foot.'};
 const mode=action==='walks'||way==='on foot'?'walk':way.slice(3);
 const destination=place.replace(/^to (?:the )?/,'');
 const name=who[1],label=name[0].toUpperCase()+name.slice(1);
 const sentence=`${label} ${mode==='walk'?'walks':'goes'} ${place}${mode==='walk'?'':' by '+mode}.`;
 return {ok:true,who:name,destination,mode,sentence};
}
