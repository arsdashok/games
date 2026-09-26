export const items=[
 {id:'ruler',phrase:'a ruler',cell:0},{id:'bag',phrase:'a bag',cell:1},
 {id:'pen',phrase:'a pen',cell:2},{id:'pencil',phrase:'a pencil',cell:3},
 {id:'book',phrase:'a book',cell:4},{id:'cake',phrase:'a cake',cell:5},
 {id:'banana',phrase:'a banana',cell:6},{id:'water',phrase:'some water',cell:7},
 {id:'trousers',phrase:'trousers',cell:8},{id:'boots',phrase:'boots',cell:9},
 {id:'teddy bear',phrase:'a teddy bear',cell:10},{id:'pickaxe',phrase:'a pickaxe',cell:11}
];
export const people=['Timmy','Goose','Creeper'];
export const surfaces=[{id:'bed',cell:12},{id:'table',cell:13},{id:'chair',cell:14},{id:'bag',cell:15}];
function object(raw){
 const text=raw.replace(/\bshoes\b/g,'boots').replace(/\bpants\b/g,'trousers').replace(/^a teddy$/,'a teddy bear').replace(/^the teddy$/,'the teddy bear');
 for(const item of items){
  const noun=item.id;
  const forms=['water','trousers','boots'].includes(noun)?[noun,'some '+noun,'the '+noun]:['a '+noun,'the '+noun];
  if(['trousers','boots'].includes(noun))forms.push('a pair of '+noun,'the pair of '+noun);
  if(forms.includes(text))return item;
 }
 return null;
}
export function parseCommand(raw){
 const text=String(raw??'').toLowerCase().trim().replace(/[.!?]+$/,'').replace(/\s+/g,' ').replace(/\bpick axe\b/g,'pickaxe');
 const fail=error=>({ok:false,error});
 if(!text)return fail('Say or type a whole instruction.');
 const match=text.match(/^(give|put) (.+?) (to|on|in) (.+)$/);
 if(!match)return fail('Use Give + an object + to + a person, or Put + an object + on/in + a place.');
 const [,verb,noun,prep,target]=match,item=object(noun);
 if(!item)return fail(/^(a|an) (water|trousers|boots|shoes|pants)$/.test(noun)?'Use some water, trousers or boots — not a water, a trousers or a boots.':'Check the object phrase. For one object, include a or the: a pencil, a book, a pickaxe.');
 if(verb==='give'){
  const person=people.find(p=>p.toLowerCase()===target);
  if(prep!=='to'||!person)return fail('Give the object to Timmy, Goose or Creeper. Use to before the name.');
  return {ok:true,verb,item:item.id,prep,target:person,zone:person,sentence:`Give ${noun} to ${person}.`};
 }
 const place=target.match(/^the (bed|table|chair|bag)$/)?.[1];
 if(!place||!['on','in'].includes(prep))return fail('After Put, use on the bed/table/chair/bag, or in the bag.');
 if(prep==='in'&&place!=='bag')return fail('In this game, use on for the bed, table and chair. Use in for inside the bag.');
 if(item.id==='bag'&&place==='bag')return fail('Choose another object to put on or in the bag.');
 return {ok:true,verb,item:item.id,prep,target:place,zone:prep+'-'+place,sentence:`Put ${noun} ${prep} the ${place}.`};
}
