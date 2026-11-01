#!/usr/bin/env python3
"""Render the static console and check that every published game is listed."""
import argparse
import json
from html import escape
from pathlib import Path
from urllib.parse import urlsplit
from console_template import render_console

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

    for game in games:
        assert (ROOT / game['cover']).is_file(), f"Missing cover: {game['id']}"
    return render_console(categories, games)


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
