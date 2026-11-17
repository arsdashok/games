'use strict';
const Trail = (() => {
  const gear = ['Lantern', 'Bedroll', 'Tent'];
  const names = ['Fernwood Valley', 'Copper Creek', 'Firefly Ridge'];
  const step = 1440;
  const end = step * names.length;
  const speed = 174;
  const clearTime = 1;
  const hurdles = [
    [330, 'log'], [655, 'rock'], [995, 'stream'], [1260, 'log'],
    [1680, 'rock'], [1990, 'stream'], [2300, 'log'], [2620, 'stream'],
    [3080, 'log'], [3380, 'rock'], [3710, 'stream'], [4000, 'log']
  ].map(([at, kind]) => ({at, kind}));
  const pickups = [1090, 2410, 3820];
  const initial = () => ({x:0, height:0, jumpAge:clearTime, vaultAge:clearTime,
    next:0, mode:'run', packed:0, placed:0, stumbleAge:0});
  function jump(s) {
    if (s.mode === 'wait') {
      s.mode = 'run';
      s.next++;
      s.vaultAge = 0;
    } else if (s.mode !== 'run' || s.height > 0) return;
    s.jumpAge = 0;
  }
  function arc(age) {
    return age < clearTime ? 450 * age * (clearTime - age) : 0;
  }
  function tick(s, dt) {
    if (s.mode === 'wait') {
      s.stumbleAge += dt;
      return;
    }
    if (s.mode !== 'run') return;
    s.jumpAge = Math.min(clearTime, s.jumpAge + dt);
    s.vaultAge = Math.min(clearTime, s.vaultAge + dt);
    s.height = Math.max(arc(s.jumpAge), arc(s.vaultAge));
    const nextX = Math.min(end, s.x + speed * dt);
    const hurdle = hurdles[s.next];
    if (hurdle && nextX >= hurdle.at) {
      if (s.height < 14 && s.jumpAge > .5) {
        s.x = hurdle.at;
        s.height = 0;
        s.stumbleAge = 0;
        s.mode = 'wait';
        return;
      }
      // Carry even a slightly early jump safely across the entire obstacle.
      s.vaultAge = Math.min(s.jumpAge, clearTime - s.jumpAge);
      s.next++;
    }
    s.x = nextX;
    if (s.packed < gear.length && s.x >= pickups[s.packed]) s.packed++;
    if (s.x === end) s.mode = 'camp';
  }
  function unpack(s, slot) {
    if (s.mode !== 'camp' || !Number.isInteger(slot) || slot < 0 || slot >= s.packed) return;
    s.placed |= 1 << slot;
    if (s.placed === 7) s.mode = 'done';
  }
  return {gear, names, step, end, hurdles, pickups, initial, jump, tick, unpack};
})();
