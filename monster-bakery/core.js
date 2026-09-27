(function(root){
'use strict';
const normalize=s=>String(s).trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const upgrades=[{at:0,name:'Little bakery',item:'A kitchen of your own'},{at:3,name:'Freshly painted',item:'A striped awning'},{at:8,name:'Growing nicely',item:'A plant for your window'},{at:15,name:'Looking bright',item:'Twinkly restaurant lights'},{at:25,name:'A local favourite',item:'A golden cake sign'},{at:40,name:'Monster favourite',item:'A crown for your bakery'}];
function level(stars){return upgrades.filter(u=>stars>=u.at).length-1}
function shuffle(a,random=Math.random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeOrder(words,count,random=Math.random){if(!words.length)throw Error('Add at least one word.');return {id:Date.now().toString(36)+'-'+random().toString(36).slice(2),words:shuffle(words,random).slice(0,Math.min(Math.max(1,Math.floor(count)||5),12,words.length)),answers:[],stage:'spell',awarded:false}}
function answer(order,input){if(order.stage!=='spell'||order.answers.length>=order.words.length)return false; if(!normalize(input))return false;const correct=normalize(input)===normalize(order.words[order.answers.length].text);order.answers.push({typed:input.trim(),correct});order.stage='feedback';return true}
function next(order){if(order.stage!=='feedback')return;order.stage=order.answers.length===order.words.length?'ready':'spell'}
function score(order){return order.answers.filter(a=>a.correct).length}
function award(order,progress){if(order.awarded)return {earned:0,unlocked:[]};if(order.answers.length!==order.words.length)throw Error('Finish the order first.');const earned=score(order),before=level(progress.stars);progress.stars+=earned;progress.orders+=1;order.awarded=true;order.stage='result';return{earned,unlocked:upgrades.slice(before+1,level(progress.stars)+1)}}
const api={normalize,upgrades,level,shuffle,makeOrder,answer,next,score,award};root.KitchenCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
