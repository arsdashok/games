# Game console

Every published game belongs in `catalog.json`, including games hosted elsewhere.
Keep variants (for example Reading Tower's Koala, first-person and dollhouse
versions) together on one card. Preserve existing game URLs and saved progress.

After adding or editing a catalog entry, run:

```
python3 scripts/build_catalog.py
python3 scripts/build_catalog.py --check
```

`index.html` is generated and committed so the catalog works without JavaScript.
The check rejects game folders that have no catalog entry, missing local links,
duplicate URLs, and a stale generated page. Search is a progressive enhancement.

Do browser QA silently. Do not play game audio during automated checks.
