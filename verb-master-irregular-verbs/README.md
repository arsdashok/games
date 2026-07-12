# Verb Master

English irregular verbs learning platform.

Single codebase that ships as:
- Web app
- PWA (installable on iOS/Android home screen)
- Native iOS app (via Capacitor → App Store)
- Native Android app (via Capacitor → Google Play)

## Current state

**Phase 2 — Architecture refactor.** The working MVP (97 verbs, 5 games, custom sets,
teacher dashboard) is in `index.html`. Around it we're building the production
architecture: data abstraction layer, Firebase backend, PWA shell.

See `docs/ROADMAP.md` for the phased plan.

## Quick start (dev)

No build tools needed. Either:

**A. VS Code Live Server:**
1. Open `verb-master-app/` in VS Code
2. Install the "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"

**B. Python:**
```bash
cd verb-master-app
python3 -m http.server 8000
# open http://localhost:8000
```

Why a server (not `file://`)? Service workers and ES modules require an http(s) origin.

## Project layout

```
.
├── index.html           Entry — currently the monolithic MVP
├── manifest.json        PWA metadata
├── sw.js                Service worker (offline cache)
├── firebase.json        Firebase Hosting + Firestore config
├── firestore.rules      Database security rules
├── netlify.toml         Netlify deploy config
│
├── icons/               PWA icons (placeholder SVG → replace with real PNGs)
│
├── src/
│   ├── main.js          Bootstrap
│   ├── config.js        Backend selector + feature flags
│   ├── data/
│   │   ├── store.js     DataStore interface (the contract)
│   │   ├── localStore.js     LocalStorage impl (current MVP)
│   │   └── firebaseStore.js  Firestore impl (skeleton)
│   ├── auth/            (Phase 4)
│   ├── games/           (Phase 2 final — extract from index.html)
│   ├── ui/              (Phase 2 final)
│   ├── helpers/         (Phase 2 final)
│   └── styles/          (Phase 2 final)
│
└── docs/
    ├── ARCHITECTURE.md      Full system design
    ├── FIRESTORE_SCHEMA.md  Data model + security rules
    ├── MONETIZATION.md      Pricing tiers + paywall strategy
    ├── ROADMAP.md           Phased milestones
    └── DEPLOY.md            How to ship (Netlify, Firebase, iOS, Android)
```

## Key concept: the abstraction layer

The app uses ONE `DataStore` interface — all data access goes through it.
Two concrete implementations:

- `LocalStore` (current MVP, no network)
- `FirebaseStore` (production, multi-device sync)

Switch by flipping `STORE_TYPE` in `src/config.js`. Games never see the
difference — they just call `store.recordVerbAttempt(...)`.

## Where the docs live

- **Architecture decisions:** `docs/ARCHITECTURE.md`
- **Database schema:** `docs/FIRESTORE_SCHEMA.md`
- **Pricing model:** `docs/MONETIZATION.md`
- **Roadmap (phases):** `docs/ROADMAP.md`
- **Deployment guide:** `docs/DEPLOY.md`

## Next steps

See `docs/ROADMAP.md` Phase 2 final tasks:
1. Extract `VERBS` array from `index.html` → `src/data/verbs.js`
2. Extract helpers → `src/helpers/`
3. Extract each game → `src/games/`
4. Verify everything still works exactly as before
5. Move on to Phase 3 (PWA polish) and Phase 4 (Firebase)
