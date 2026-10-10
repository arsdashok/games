const assert = require('node:assert/strict');
const H = require('../spelling-help.js');
const C = require('../core.js');
const required = 'accident accidentally actual actually address answer appear arrive believe bicycle breath breathe build busy business calendar caught centre century certain circle complete consider continue decide describe different difficult disappear early earth eight eighth enough exercise experience experiment extreme famous favourite february forward forwards fruit grammar group guard guide heard heart height history imagine increase important interest island knowledge learn length library material medicine mention minute natural naughty notice occasion occasionally often opposite ordinary particular peculiar perhaps popular position possess possession possible potatoes pressure probably promise purpose quarter question recent regular reign remember sentence separate special straight strange strength suppose surprise therefore though although thought through various weight woman women'.split(' ');
for (const word of required) assert(H.get(word).curated, `Missing Year 3/4 word: ${word}`);
for (const word of H.words) {
  const h = H.get(word);
  assert(h.tip && h.focus && word.includes(h.focus), `Incorrect highlight: ${word}`);
  if(h.syllables.length) assert.equal(h.syllables.join(''), word, `Syllable letters: ${word}`);
  if(h.parts.length) {
    assert.equal(h.parts.map(p=>p.text).join(''), word, `Word parts: ${word}`);
    assert(h.parts.some(p=>p.kind==='b'), `No base word: ${word}`);
  }
}
assert.deepEqual(H.get('  RECEIVE '), H.get('receive'));
assert.equal(H.get('receive').focus,'ei');
assert.match(H.get('receive').tip,/long ee sound after c/);
assert.equal(H.get('believe').focus,'ie');
assert.equal(H.get('breathe').focusAt,6,'Highlight the final e, not the first e');
for(const word of ['weird','seize']) assert.match(H.get(word).tip,/exception/);
for(const word of ['science','height','eight','their']) assert.doesNotMatch(H.get(word).tip,/Use i before e|i before e for the long ee/);
assert.deepEqual(H.get('unhelpful').parts.map(p=>[p.text,p.kind]),[['un','p'],['help','b'],['ful','s']]);
assert.equal(H.get('business').syllables.length,0,'Do not confuse written chunks with spoken syllables');
assert.equal(H.get('stopped').syllables.length,0,'Do not split a one-syllable suffix');
for (const word of ['inventedword','constructor','__proto__',"teacher's",'ice cream']) {
  const h=H.get(word);assert.equal(h.curated,false);assert.deepEqual(h.parts,[]);assert.deepEqual(h.syllables,[]);
}
assert.equal(H.get('puffball').focus,'ff');
// Consulting help must not change an order, first-attempt score or reward.
const o=C.makeOrder([{text:'receive'}],1,()=>0);
C.answer(o,'recieve');C.next(o);const progress={stars:2,orders:1};C.award(o,progress);
const before=JSON.stringify([o,progress]);H.get(o.words[0].text);assert.equal(JSON.stringify([o,progress]),before);
assert.equal(C.finishPractice(o,['wrong']),false);
assert.equal(C.finishPractice(o,['receive']),true);
assert.equal(progress.stars,2);
console.log(`PASS: ${H.words.length} curated clues; all Year 3/4 words; spelling integrity, exceptions, safe fallback and unchanged first-attempt rewards.`);
