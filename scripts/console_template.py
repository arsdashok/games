"""Accessible static HTML for the game console."""
from html import escape as esc
ICONS={
 'grid':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 'heart':'<path d="M20.8 4.6a5.6 5.6 0 0 0-7.9 0L12 5.5l-.9-.9a5.6 5.6 0 0 0-7.9 7.9L12 21l8.8-8.5a5.6 5.6 0 0 0 0-7.9Z"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'book':'<path d="M3 4h5a5 5 0 0 1 4 2 5 5 0 0 1 4-2h5v15h-5a5 5 0 0 0-4 2 5 5 0 0 0-4-2H3Z"/><path d="M12 6v15"/>',
 'maths':'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 3h1m6 0h1"/>',
 'grammar':'<path d="M3 7h11M8 3v4m-3 4c2 4 4 6 8 7M12 7c-1 6-4 10-9 12m11 2 4-12 4 12m-7-4h6"/>',
 'speech':'<path d="M21 11a9 8 0 0 1-9 8c-2 0-3-.4-4-1l-5 3 1-6a8 8 0 0 1-1-4 9 8 0 0 1 18 0Z"/><path d="M8 10h8M8 14h5"/>',
 'puzzle':'<path d="M9 3H3v6a3 3 0 0 1 0 6v6h6a3 3 0 0 1 6 0h6v-6a3 3 0 0 1 0-6V3h-6a3 3 0 0 1-6 0Z"/>',
 'spark':'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
 'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 'arrow':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 'close':'<path d="m6 6 12 12M6 18 18 6"/>',
 'controller':'<path d="M7 6h10c3 0 4 3 5 11 .5 4-4 4-7 0H9c-3 4-7.5 4-7 0 1-8 2-11 5-11Z"/><path d="M8 9v6m-3-3h6m5-1h.01M19 14h.01"/>',
 'chevron':'<path d="m8 10 4 4 4-4"/>'}
def icon(name):return f'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'
CAT_META={'reading':('Reading & spelling','book'),'maths':('Numbers & maths','maths'),'grammar':('Grammar & verbs','grammar'),'speaking':('Vocabulary & speaking','speech'),'puzzles':('Puzzles & stories','puzzle'),'seasonal':('Seasonal & fun','spark')}
PRIORITY=['reading-tower','monster-bakery','place-value-chart','block-maths','word-jobs','secret-character','odometer']
def render_console(categories,games):
    ordered=sorted(games,key=lambda g: PRIORITY.index(g['id']) if g['id'] in PRIORITY else len(PRIORITY)+games.index(g))
    count=len(games)
    nav=[]
    for view,label,ico,n in [('all','All games','grid',count),('favourites','Favourites','heart',0),('recent','Recently opened','clock',0)]:
        nav.append(f'<button class="nav-item" data-view="{view}" aria-pressed="{str(view=="all").lower()}">{icon(ico)}<span>{label}</span><span class="nav-count" data-count="{view}">{n}</span></button>')
    subjects=[]
    for c in categories:
        title,ico=CAT_META[c['id']];n=sum(g['category']==c['id'] for g in games)
        subjects.append(f'<button class="nav-item subject {c["id"]}" data-view="{c["id"]}" aria-pressed="false">{icon(ico)}<span>{esc(title)}</span><span class="nav-count">{n}</span></button>')
    cards=[]
    for i,g in enumerate(ordered):
        title=esc(g['title']); first=g['links'][0];cat_title=CAT_META[g['category']][0]
        links=[]
        for j,l in enumerate(g['links']):
            label=l['label'];label='3D' if label=='3D adventure' else label
            links.append(f'<a class="play{" alternate" if j else " primary"}" href="{esc(l["href"],quote=True)}" target="_blank" rel="noopener" aria-label="{esc(g["title"]+": "+l["label"],quote=True)}" data-open="{g["id"]}">{esc(label)}{icon("arrow") if j==0 else ""}</a>')
        badge=f'<span class="game-badge">{esc(g["badge"])}</span>' if g.get('badge') else ''
        haystack=' '.join([g['title'],g['description'],g.get('keywords',''),cat_title])
        cards.append(f'''<article class="game-card {g['category']}" id="{g['id']}" data-game="{g['id']}" data-category="{g['category']}" data-order="{i}" data-title="{esc(g['title'],quote=True)}" data-search="{esc(haystack,quote=True)}">
 <div class="cover">
  <a class="cover-link" href="{esc(first['href'],quote=True)}" target="_blank" rel="noopener" aria-label="Open {title}" data-open="{g['id']}"><img src="{g['cover']}" width="600" height="360" alt="" loading="{'eager' if i<3 else 'lazy'}" decoding="async"><span class="cover-play">{icon('arrow')}</span></a>
  <button class="favourite" type="button" data-favourite="{g['id']}" aria-label="Add {title} to favourites" aria-pressed="false" hidden>{icon('heart')}</button>
 </div>
 <div class="card-body"><div class="card-meta"><span class="subject-label">{esc(cat_title)}</span>{badge}</div>
 <h3>{title}</h3><p class="description">{esc(g['description'])}</p>
 <div class="card-actions">{''.join(links)}</div></div>
</article>''')
    return f'''<!doctype html>
<!-- Generated from catalog.json by scripts/build_catalog.py. -->
<html lang="en">
<head>
 <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
 <meta name="theme-color" content="#f7f7f2">
 <meta name="description" content="Your little library of learning adventures. Reading, spelling, maths and English games, all in one place.">
 <title>Dasha’s Games · Pick your next adventure</title>
 <link rel="icon" type="image/svg+xml" href="console-assets/favicon.svg">
 <link rel="stylesheet" href="console.css?v=20261101-shelf">
 <script src="console.js?v=20261101-shelf" defer></script>
</head>
<body>
 <a class="skip-link" href="#library">Skip to games</a>
 <aside class="sidebar">
  <a class="brand" href="./" aria-label="Dasha’s Games home"><span class="brand-mark">{icon('controller')}</span><span>Dasha’s<span class="brand-sub">games</span></span></a>
  <div class="sidebar-nav" id="navigation" hidden>
   <nav class="main-nav" aria-label="Your library">{''.join(nav)}</nav>
   <div class="subject-heading">EXPLORE BY SUBJECT</div>
   <nav class="subject-nav" aria-label="Subjects">{''.join(subjects)}</nav>
  </div>
  <div class="sidebar-note"><span class="note-art" aria-hidden="true">a<span>+</span>b</span><p>A little practice.<br>A lot of possibility.</p><span class="note-caption">MADE FOR CURIOUS MINDS</span></div>
 </aside>
 <div class="main-shell">
  <header class="topbar">
   <div class="topbar-label"><span class="status-dot"></span>YOUR LEARNING PLAYGROUND</div>
   <div class="search-wrap" id="search-tools" hidden>
    <label class="search-box" for="search">{icon('search')}<span class="sr-only">Find a game</span><input type="search" id="search" placeholder="Search games or skills…" autocomplete="off"><kbd aria-hidden="true">/</kbd></label>
   </div>
  </header>
  <main id="library">
   <section class="welcome" aria-labelledby="welcome-title"><div><p class="eyebrow">PLAY. LEARN. REPEAT.</p><h1 id="welcome-title">What shall we play<span>?</span></h1><p class="welcome-copy">Small challenges. Big discoveries. Find your next favourite.</p></div><div class="collection-stamp" aria-label="{count} games in your collection"><strong>{count}</strong><span>GAMES TO<br>GROW WITH</span>{icon('spark')}</div></section>
   <div class="library-toolbar"><div class="library-title"><h2 id="view-title" tabindex="-1">All games</h2><span id="results" class="result-count" role="status" aria-live="polite">{count} games</span></div>
    <div class="toolbar-actions" id="toolbar-actions" hidden><button type="button" id="reset" class="reset" hidden>Clear filters {icon('close')}</button><label class="sort-control"><span class="sr-only">Sort games</span><select id="sort" aria-label="Sort games"><option value="library">Library order</option><option value="az">A–Z</option></select>{icon('chevron')}</label></div>
   </div>
   <p class="view-note" id="view-note" hidden></p>
   <div class="game-grid" id="game-grid">{''.join(cards)}</div>
   <section class="empty-state" id="empty" hidden><div class="empty-art">{icon('heart')}</div><h2 id="empty-title">No games found</h2><p id="empty-copy">Try another word or explore all games.</p><button id="empty-reset" type="button">Explore all games {icon('arrow')}</button></section>
   <p class="storage-note" id="storage-note" hidden>Browser storage is unavailable. Your favourites will last for this visit.</p>
   <div class="sr-only" role="status" id="announcement" aria-live="polite"></div>
  </main>
  <footer><span class="footer-brand">Dasha’s games<span class="status-dot"></span></span><span>Made for lessons. Played for the fun of it.</span><small>Games open in a new tab.</small></footer>
 </div>
</body></html>
'''
