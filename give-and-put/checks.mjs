import assert from 'node:assert/strict';
import {items,people,surfaces,parseCommand} from './commands.mjs';
let count=0;
for(const item of items){
 for(const person of people){const s=`Give ${item.phrase} to ${person}`;assert.equal(parseCommand(s).ok,true,s);count++;}
 for(const place of surfaces){if(item.id==='bag'&&place.id==='bag')continue;const s=`Put ${item.phrase} on the ${place.id}`;assert.equal(parseCommand(s).ok,true,s);count++;}
 if(item.id!=='bag'){assert.equal(parseCommand(`Put ${item.phrase} in the bag`).ok,true);count++;}
}
for(const s of ['Give pencil to Goose','Give a pencil Goose','Give to Goose a pencil','Put a book the table','Put a book to the table','Give a book on the table','Give a water to Goose','Give a trousers to Timmy','Put a book on table','Put a book in the chair','Put a bag in the bag','Give a pickaxe to peacocks','Give a book to Timmy then put it on the bed'])assert.equal(parseCommand(s).ok,false,s);
for(const s of ['Give a pickaxe to Creeper','Put the pickaxe on the bed','Give some water to Goose','Put a pair of shoes in the bag','Give trousers to Timmy','Give some boots to Goose'])assert.equal(parseCommand(s).ok,true,s);
console.log(`${count} object/person/place combinations passed; malformed instructions rejected.`);
