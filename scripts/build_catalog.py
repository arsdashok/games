#!/usr/bin/env python3
"""Render the static console and check that every published game is listed."""
import argparse
import json
from html import escape
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


def render():
    catalog = json.loads((ROOT / 'catalog.json').read_text())
    categories, games = catalog['categories'], catalog['games']
    category_ids = [c['id'] for c in categories]
    assert len(set(category_ids)) == len(category_ids), 'Duplicate category'
    ids, links, listed_folders = set(), set(), set()
    for game in games:
        assert game['id'] not in ids, f"Duplicate game: {game['id']}"
        ids.add(game['id'])
        assert game['category'] in category_ids, f"Unknown category: {game['id']}"
        assert game['links'], f"No play link: {game['id']}"
        for link in game['links']:
            href = link['href']
            assert href not in links, f'Duplicate play link: {href}'
            links.add(href)
            url = urlsplit(href)
            if url.scheme:
                assert url.scheme == 'https' and url.netloc, f'Invalid external URL: {href}'
            else:
                assert not url.netloc and not href.startswith('/') and '..' not in href.split('/'), href
                path = ROOT / url.path
                target = path / 'index.html' if href.endswith('/') else path
                assert target.is_file(), f'Missing game: {target}'
                listed_folders.add(url.path.split('/')[0])
    folders = {p.name for p in ROOT.iterdir() if p.is_dir() and (p / 'index.html').exists()}
    assert not folders - listed_folders, f'Games missing from catalog: {sorted(folders - listed_folders)}'

    count = len(games)
    chips = '\n'.join(f'<button type="button" data-category="{escape(c["id"])}" aria-pressed="false">{escape(c["title"])}</button>' for c in categories)
    sections = []
    for category in categories:
        cards = []
        for game in games:
            if game['category'] != category['id']:
                continue
            badge = f'<span class="badge">{escape(game["badge"])}</span>' if game.get('badge') else ''
            buttons = '\n'.join(
                f'<a class="play{" secondary" if i else ""}" href="{escape(link["href"], quote=True)}" target="_blank" rel="noopener" aria-label="{escape(game["title"] + ": " + link["label"], quote=True)}">{escape(link["label"])} <span aria-hidden="true">↗</span></a>'
                for i, link in enumerate(game['links'])
            )
            search = ' '.join([game['title'], game['description'], game.get('keywords', ''), category['title']])
            cards.append(f'''<article class="card" id="{game['id']}" data-search="{escape(search, quote=True)}">
  <div class="card-top"><span class="emoji" aria-hidden="true">{game['icon']}</span>{badge}</div>
  <h3>{escape(game['title'])}</h3>
  <p>{escape(game['description'])}</p>
  <div class="actions">{buttons}</div>
</article>''')
        sections.append(f'''<section class="category" data-group="{category['id']}" aria-labelledby="heading-{category['id']}">
  <h2 id="heading-{category['id']}">{escape(category['title'])} <span class="section-count">{len(cards)}</span></h2>
  <div class="grid">{chr(10).join(cards)}</div>
</section>''')
    return f'''<!DOCTYPE html>
<!-- Generated from catalog.json by scripts/build_catalog.py. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Dasha’s game console: reading, spelling, maths and English games for lessons. Find Reading Tower, Monster Bakery, Place Value Chart and more.">
  <title>Dasha's Games · Game console</title>
  <link rel="stylesheet" href="console.css?v=20261101">
  <script src="console.js?v=20261101" defer></script>
</head>
<body>
  <a class="skip-link" href="#games">Skip to games</a>
  <div class="wrap">
    <header>
      <div class="eyebrow"><span aria-hidden="true">🎮</span> THE GAME CONSOLE</div>
      <h1>Dasha’s Games<span class="title-dot">.</span></h1>
      <p class="intro">A little practice. A lot of play.</p>
      <p class="library-count">{count} games & activities · Pick your next adventure.</p>
    </header>
    <div id="filters" class="filters" hidden>
      <div class="search-row">
        <label class="search-box" for="search"><span aria-hidden="true">⌕</span><span class="sr-only">Find a game</span><input id="search" type="search" placeholder="Find a game or a skill…" autocomplete="off"></label>
        <button id="reset" class="reset" type="button">Reset filters</button>
      </div>
      <div class="chips" role="group" aria-label="Filter by subject">
        <button type="button" data-category="all" aria-pressed="true">All games</button>
        {chips}
      </div>
      <p id="results" role="status" aria-live="polite">Showing all {count} games & activities</p>
    </div>
    <main id="games">
      {chr(10).join(sections)}
      <div id="empty" class="empty" hidden><h2>No games found.</h2><p>Try another word, or reset the filters to see everything.</p></div>
    </main>
    <footer>Made for lessons. Have fun! <span aria-hidden="true">✨</span><br><small>Games open in a new tab. Reading Tower uses your learner login.</small></footer>
  </div>
</body>
</html>
'''


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Check coverage and whether index.html is up to date')
    args = parser.parse_args()
    html = render()
    output = ROOT / 'index.html'
    if args.check:
        assert output.read_text() == html, 'Run python3 scripts/build_catalog.py to update index.html'
        print('OK: catalog covers every game folder; all local links exist; index.html is up to date.')
    else:
        output.write_text(html)
        print('Updated index.html; every game folder is in the catalog.')
