(() => {
  'use strict';
  const search = document.querySelector('#search');
  const chips = [...document.querySelectorAll('[data-category]')];
  const groups = [...document.querySelectorAll('[data-group]')];
  const cards = [...document.querySelectorAll('[data-search]')];
  let category = 'all';
  const normalize = text => text.toLocaleLowerCase().replace(/ё/g, 'е').trim();

  function filter() {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let total = 0;
    groups.forEach(group => {
      let matches = 0;
      group.querySelectorAll('[data-search]').forEach(card => {
        const subjectMatches = category === 'all' || category === group.dataset.group;
        const haystack = normalize(card.dataset.search);
        card.hidden = !subjectMatches || !words.every(word => haystack.includes(word));
        if (!card.hidden) matches++;
      });
      group.hidden = matches === 0;
      group.querySelector('.section-count').textContent = matches;
      total += matches;
    });
    chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.category === category)));
    document.querySelector('#empty').hidden = total !== 0;
    document.querySelector('#results').textContent = total === cards.length
      ? `Showing all ${total} games & activities`
      : `${total} of ${cards.length} games & activities`;
  }

  search.addEventListener('input', filter);
  chips.forEach(chip => chip.addEventListener('click', () => {
    category = chip.dataset.category;
    filter();
  }));
  document.querySelector('#reset').addEventListener('click', () => {
    search.value = '';
    category = 'all';
    filter();
    search.focus();
  });
  document.querySelector('#filters').hidden = false;
  filter();
})();
