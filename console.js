(() => {
  'use strict';
  const storageKey = 'dasha-games-library-v1';
  const search = document.querySelector('#search');
  const sort = document.querySelector('#sort');
  const grid = document.querySelector('#game-grid');
  const cards = [...document.querySelectorAll('[data-game]')];
  const navigation = [...document.querySelectorAll('[data-view]')];
  const ids = new Set(cards.map(card => card.dataset.game));
  const titles = new Map(cards.map(card => [card.dataset.game, card.dataset.title]));
  const names = {all:'All games',favourites:'Your favourites',recent:'Recently opened',reading:'Reading & spelling',maths:'Numbers & maths',grammar:'Grammar & verbs',speaking:'Vocabulary & speaking',puzzles:'Puzzles & stories',seasonal:'Seasonal & fun'};
  let view = 'all';
  const normalize = value => value.toLocaleLowerCase().replace(/ё/g, 'е').trim();
  function validList(value) {
    return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && ids.has(id)))] : [];
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
      return {favourites: validList(saved.favourites), recent: validList(saved.recent).slice(0,12)};
    } catch (error) {
      return {favourites: [], recent: []};
    }
  }
  let state = load();
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch (error) { document.querySelector('#storage-note').hidden = false; }
  }
  function syncButtons() {
    cards.forEach(card => {
      const id = card.dataset.game;
      const button = card.querySelector('[data-favourite]');
      const active = state.favourites.includes(id);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active ? 'Remove' : 'Add'} ${titles.get(id)} ${active ? 'from' : 'to'} favourites`);
      button.title = active ? 'Remove from favourites' : 'Add to favourites';
    });
    document.querySelector('[data-count="favourites"]').textContent = state.favourites.length;
    document.querySelector('[data-count="recent"]').textContent = state.recent.length;
  }
  function render() {
    const focused = document.activeElement;
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    const ordered = [...cards].sort((a,b) => {
      if (view === 'recent') return state.recent.indexOf(a.dataset.game) - state.recent.indexOf(b.dataset.game);
      if (sort.value === 'az') return a.dataset.title.localeCompare(b.dataset.title, 'en');
      return Number(a.dataset.order) - Number(b.dataset.order);
    });
    let count = 0;
    ordered.forEach(card => {
      const id = card.dataset.game;
      const inView = view === 'all' || (view === 'favourites' ? state.favourites.includes(id) : view === 'recent' ? state.recent.includes(id) : view === card.dataset.category);
      card.hidden = !inView || !words.every(word => normalize(card.dataset.search).includes(word));
      if (!card.hidden) count++;
      grid.append(card);
    });
    navigation.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    document.querySelector('#view-title').textContent = names[view];
    document.querySelector('#results').textContent = `${count} ${count === 1 ? 'game' : 'games'}`;
    document.querySelector('#reset').hidden = view === 'all' && !words.length && sort.value === 'library';
    sort.disabled = view === 'recent';
    sort.closest('.sort-control').hidden = view === 'recent';
    const note = document.querySelector('#view-note');
    note.hidden = view !== 'favourites' && view !== 'recent';
    note.textContent = view === 'favourites' ? 'Your own little shortlist. Saved in this browser.' : 'Games you opened from this console. Most recent first.';
    const empty = document.querySelector('#empty');
    empty.hidden = count !== 0;
    const emptyFavourites = view === 'favourites' && !state.favourites.length && !words.length;
    const emptyRecent = view === 'recent' && !state.recent.length && !words.length;
    document.querySelector('#empty-title').textContent = emptyFavourites ? 'Make room for your favourites.' : emptyRecent ? 'Your next adventure starts here.' : 'No games found. Yet.';
    document.querySelector('#empty-copy').textContent = emptyFavourites ? 'Tap the heart on a game to keep it here for your next lesson.' : emptyRecent ? 'Open a game from the library and it will appear here next time.' : 'Try another word, or clear the filters to explore the whole library.';
    syncButtons();
    if (focused && focused.matches('[data-favourite]') && !focused.closest('[data-game]').hidden) focused.focus({preventScroll:true});
  }
  function reset() {
    view = 'all'; search.value = ''; sort.value = 'library'; render(); search.focus();
  }
  navigation.forEach(button => button.addEventListener('click', () => {view = button.dataset.view;render();}));
  search.addEventListener('input',render);
  sort.addEventListener('change',render);
  document.querySelector('#reset').addEventListener('click',reset);
  document.querySelector('#empty-reset').addEventListener('click',reset);
  grid.addEventListener('click',event => {
    const button = event.target.closest('[data-favourite]');
    if (button) {
      const id = button.dataset.favourite;
      const wasFavourite = state.favourites.includes(id);
      state.favourites = wasFavourite ? state.favourites.filter(item => item !== id) : [...state.favourites,id];
      save(); render();
      document.querySelector('#announcement').textContent = `${titles.get(id)} ${wasFavourite ? 'removed from' : 'added to'} favourites.`;
      if (view === 'favourites' && wasFavourite) document.querySelector('#view-title').focus();
    }
  });
  function recordOpen(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target.closest('[data-open]');
    if (!link) return;
    const id = link.dataset.open;
    state.recent = [id,...state.recent.filter(item => item !== id)].slice(0,12);
    save(); syncButtons();
    // Keep the active link in place until its default new-tab action completes.
    if (view === 'recent') setTimeout(render,0);
  }
  grid.addEventListener('click',recordOpen);
  grid.addEventListener('auxclick',recordOpen);
  document.addEventListener('keydown',event => {
    const editing = event.target.closest('input,textarea,select,[contenteditable="true"]');
    if (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {event.preventDefault();search.focus();}
    if (event.key === 'Escape' && event.target === search) {search.value='';render();}
  });
  window.addEventListener('storage',event => {if (event.key === storageKey || event.key === null) {state=load();render();}});
  ['navigation','search-tools','toolbar-actions'].forEach(id => document.getElementById(id).hidden=false);
  document.querySelectorAll('[data-favourite]').forEach(button => {button.hidden=false;});
  render();
})();
