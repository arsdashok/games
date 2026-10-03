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
function recipe(ingredients=[]){const surprises=ingredients.filter(x=>!x.correct).map(x=>x.art);const bad=surprises.length,total=ingredients.length;return {bad,total,surprises,ratio:total?bad/total:0,icing:bad?'#9daa69':'#e6a9b6',name:bad?(bad===1?'A cake with a surprise':'A wonderfully wonky cake'):'A delicious cake'};}
const cakes=[{name:'Strawberry cloud',icing:'#efa9bd',sponge:'#d8ab72',topping:'#be586e'},{name:'Chocolate comet',icing:'#694337',sponge:'#875039',topping:'#f3d097'},{name:'Lemon sunshine',icing:'#f7d969',sponge:'#e5be76',topping:'#eaae37'},{name:'Blueberry dream',icing:'#b8a0de',sponge:'#d5af83',topping:'#65558d'}];
function cakeStyle(order){return cakes[((Number(order.variant)||0)+(order.bonusStage?1:0))%cakes.length];}
function finishPractice(order,words){const missed=order.words.filter((w,i)=>!order.answers[i]?.correct);if(order.stage!=='result'||order.practiceComplete||!missed.length||missed.some(w=>!words.some(t=>normalize(t)===normalize(w.text))))return false;order.practiceComplete=true;order.bonusStage='baking';return true;}
function serveBonus(order,progress){if(order.bonusStage!=='serve')return false;order.bonusStage='result';progress.orders++;return true;}
const api={cakes,cakeStyle,finishPractice,serveBonus,recipe,normalize,upgrades,level,shuffle,makeOrder,answer,next,score,award};root.KitchenCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
