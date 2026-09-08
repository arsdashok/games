(function(root){
 const small=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
 function words(n){if(n===100)return 'one hundred';if(n<20)return small[n];return ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'][Math.floor(n/10)]+(n%10?'-'+small[n%10]:'')}
 function shuffle(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function validate(c){return Number.isInteger(c.min)&&Number.isInteger(c.max)&&c.min>=1&&c.max<=100&&c.min<c.max&&[3,4,6].includes(c.choices)&&[5,8,12].includes(c.goal)&&['listen','read','teacher'].includes(c.mode)}
 function pool(c){return Array.from({length:c.max-c.min+1},(_,i)=>i+c.min)}
 function options(target,c,rng=Math.random){const rest=pool(c).filter(x=>x!==target),confusable=target>=13&&target<=19?(target-10)*10:target%10===0&&target>=30&&target<=90?target/10+10:null;let picked=[];if(rest.includes(confusable))picked.push(confusable);picked.push(...shuffle(rest.filter(x=>x!==confusable),rng));return shuffle([target,...picked.slice(0,Math.min(c.choices,rest.length+1)-1)],rng)}
 root.ExplorerEngine={words,shuffle,validate,pool,options};
})(typeof module==='object'?module.exports:window);
