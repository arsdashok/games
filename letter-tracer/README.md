# Tobi Letter Tracer

Handwriting tracing game for Tobi. Live at **https://tobi-letter-tracer.surge.sh/**

## How it deploys
Push to `main` → the GitHub Action in `.github/workflows/deploy.yml` runs `surge` and publishes `index.html` to https://tobi-letter-tracer.surge.sh/. No manual deploy needed, just commit and push.

## Editing
`index.html` is the whole game (one self-contained file: a canvas with per-letter writing lanes, gray out-of-bounds fields, letters a–o + capitals, and Tobi's known sight words).

The working/source copy also lives in the tutoring folder at `Students/Tutorful/Tobi/Games/Letter_Tracer.html` (where the review gates run). Keep them in sync: copy the source over this repo's `index.html`, commit, push.

Secrets used by the Action (repo → Settings → Secrets → Actions): `SURGE_LOGIN`, `SURGE_TOKEN`.
