# Verb Master — Architecture

## North-star

A single codebase that ships as:
1. **Web app** at `verbmaster.app` (or whatever domain we get)
2. **PWA** — installable on Android/iOS Safari from the web (no app store)
3. **Native iOS app** via Capacitor wrapper → App Store
4. **Native Android app** via Capacitor wrapper → Google Play

All four share the same HTML/CSS/JS. Updates to logic ship everywhere via OTA web updates (for PWA + Capacitor live updates).

## Stack decisions (and why)

### Frontend: vanilla ES modules
- **Why not React/Vue/Svelte:** the app is essentially a state machine with screens. We have ~3000 lines of working vanilla JS. Adopting a framework = rewriting the whole MVP for marginal gains. Vanilla scales fine to 10–15k lines if disciplined.
- **Why ES modules:** modern browsers (Chrome/Safari/Firefox last 5 years) support them natively. No build step, no npm required locally during development.
- **Why no TypeScript:** same — adds build step + learning curve. JSDoc gives us inline type hints in VS Code without compilation.

### Backend: Firebase
- **Auth:** email/password + Google + Apple (Apple required by App Store if you have any 3rd-party login)
- **Firestore:** user data, sets, progress, classes
- **Cloud Functions (later):** subscription verification, teacher class invites, scheduled streak emails
- **Analytics:** built-in, free
- **Hosting (optional):** Firebase Hosting is fine; Netlify/Vercel are also fine. Netlify wins on UI but Firebase Hosting has tighter integration with the rest of the stack.

**Why not Supabase/own server:** Firebase free tier covers ~10k users comfortably; auth is best-in-class; iOS/Android SDKs first-class; one vendor for everything.

### Native shell: Capacitor
- **Why not React Native:** complete rewrite required
- **Why not Cordova:** dying ecosystem, Capacitor superseded it
- **Why Capacitor:** Ionic team, modern, actively developed; wraps web app in native shell with one config; first-class plugins for in-app purchases, push, etc.

### Monetization
- **Web:** Stripe Checkout (3% fees vs 30%)
- **iOS:** Apple In-App Purchase (mandatory for digital subscriptions; 15-30%)
- **Android:** Google Play Billing (same — 15-30%)

See `MONETIZATION.md`.

## File layout

```
verb-master-app/
├── index.html                  Entry — loads main.js as module
├── manifest.json               PWA manifest (name, icons, theme)
├── sw.js                       Service worker (offline cache)
├── firebase.json               Firebase Hosting config (deploy)
├── firestore.rules             Firestore security rules
├── firestore.indexes.json      Firestore index definitions
│
├── icons/                      PWA icons (192, 512, maskable, apple-touch)
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
│
├── src/
│   ├── main.js                 Bootstrap: pick store, init auth, route to screen
│   ├── config.js               Firebase config (gitignored in prod via env)
│   │
│   ├── data/
│   │   ├── verbs.js            VERBS array (97 entries) — pure data
│   │   ├── store.js            DataStore interface (contract only)
│   │   ├── localStore.js       LocalStorage implementation (current MVP)
│   │   └── firebaseStore.js    Firestore implementation
│   │
│   ├── auth/
│   │   ├── authUI.js           Login/register/anonymous-upgrade UI
│   │   ├── firebaseAuth.js     Firebase Auth wrapper
│   │   └── session.js          currentUser singleton + listeners
│   │
│   ├── games/
│   │   ├── study.js            Flashcards
│   │   ├── hangman.js
│   │   ├── speed.js
│   │   ├── sort.js
│   │   ├── story.js
│   │   └── battle.js
│   │
│   ├── ui/
│   │   ├── dashboard.js        Student dashboard render
│   │   ├── teacherDashboard.js
│   │   ├── settings.js
│   │   ├── sets.js             Custom sets editor
│   │   └── nav.js              showScreen, transitions
│   │
│   ├── helpers/
│   │   ├── verbHelpers.js      dupPattern, formsForWord, displayAllForms
│   │   ├── tts.js              Speech synthesis with voice selection
│   │   ├── i18n.js             UI translations (later)
│   │   └── utils.js            shuffle, pickRandom, escapeHtml, etc.
│   │
│   └── styles/
│       ├── main.css            Variables, reset, layout
│       ├── components.css      Buttons, modals, cards
│       └── games.css           Game-specific styles
│
└── docs/
    ├── ARCHITECTURE.md         (this file)
    ├── FIRESTORE_SCHEMA.md
    ├── MONETIZATION.md
    ├── ROADMAP.md
    └── DEPLOY.md
```

## Data flow — the abstraction layer

The single most important architectural decision: **all data access goes through `DataStore`**. Games and UI never touch `localStorage` or `firebase/firestore` directly.

```
[ Game / UI ]
     ↓
[ DataStore (interface) ]
     ↓
[ LocalStore  or  FirebaseStore ]
     ↓
[ localStorage  or  Firestore SDK ]
```

A boot flag in `config.js` decides which implementation to use:

```js
// config.js
export const STORE_TYPE = 'firebase';  // 'local' | 'firebase'
```

This means:
- **Dev/testing:** flip to `'local'` — no Firebase needed, works offline
- **Production:** `'firebase'` — sync across devices, teacher dashboard works
- **Demo mode for a tutorial / new user:** `'local'` — anonymous play before signup

### DataStore interface (the contract)

```js
// src/data/store.js — interface only, no implementation

export class DataStore {
  // === Auth ===
  async signUp({ email, password, role }) {}
  async signIn({ email, password }) {}
  async signInWithGoogle() {}
  async signInWithApple() {}
  async signInAnonymously() {}
  async signOut() {}
  onAuthChange(callback) {}   // returns unsubscribe fn
  getCurrentUser() {}

  // === User profile ===
  async getUserProfile(userId) {}
  async updateUserProfile(userId, patch) {}

  // === Studied verbs ===
  async markVerbStudied(userId, verbV1) {}
  async unmarkVerbStudied(userId, verbV1) {}
  async getStudiedVerbs(userId) {}

  // === Verb statistics ===
  async recordVerbAttempt(userId, verbV1, correct) {}
  async getVerbStats(userId) {}

  // === Game scores ===
  async saveGameScore(userId, gameType, score, details) {}
  async getGameScores(userId) {}

  // === Settings ===
  async getSettings(userId) {}
  async saveSettings(userId, settings) {}

  // === Custom sets ===
  async listSets(userId) {}
  async getSet(setId) {}
  async createSet(userId, { name, verbs, forms }) {}
  async updateSet(setId, patch) {}
  async deleteSet(setId) {}

  // === Classes (teacher) ===
  async getClassMembers(classCode) {}    // teacher only
  async joinClass(userId, classCode) {}  // student
  async leaveClass(userId) {}

  // === Telemetry / analytics ===
  async logEvent(userId, eventName, params) {}
}
```

Both `LocalStore` and `FirebaseStore` implement this same interface. Games call `store.recordVerbAttempt(...)` and don't care which backend.

## Authentication flow

### Anonymous-first (critical for conversion)

```
Open app
   ↓
Anonymous session created automatically
   ↓
User plays Study + 1 game (data saved to anonymous user)
   ↓
At natural moment (level up, finish first set, etc.):
"Save your progress" → upgrade to email/Google/Apple
   ↓
Anonymous user document is linked to new credential
   ↓
Data preserved
```

Apple/Google sign-in is essential for friction-free login on phones. Email/password is the fallback.

### Multi-device sync

Once user has any non-anonymous credential, opening on a second device pulls their data via Firestore. No "export/import" UX needed.

### Teacher accounts

Teachers create accounts the same way but with `role: 'teacher'` set during signup. They get a `classCode` generated on signup. Students enter the code to join. Class membership tracked in `users/{studentId}.classCode`.

Teacher dashboard queries: `collection('users').where('role','==','student').where('classCode','==',myCode)`.

## Routing / screens

Single-page app. URL hash routing:
- `#login` — auth screen
- `#dashboard` — student or teacher dashboard
- `#study` — flashcards
- `#game/hangman`, `#game/speed`, etc.
- `#sets`, `#sets/new`, `#sets/{id}/edit`
- `#settings`

URL changes triggered by `showScreen(screenId)`. Browser back button works naturally because we update `location.hash`.

## State management

No Redux/MobX/etc. Plain JS objects. The two stateful singletons:

```js
// src/auth/session.js
let currentUser = null;
const listeners = [];

export function getCurrentUser() { return currentUser; }
export function onUserChange(cb) { listeners.push(cb); return () => /* unsub */ }

// src/data/store.js
let store;  // either LocalStore or FirebaseStore based on config
export function getStore() { return store; }
```

Games subscribe to user changes if needed. Mostly stateless: load user → render → save → unmount.

## PWA setup

### Manifest (`manifest.json`)
Required entries:
- `name`, `short_name`
- `start_url`, `scope`
- `display: 'standalone'`
- `theme_color`, `background_color`
- `icons` array (192px, 512px, maskable variant)

### Service worker (`sw.js`)
Strategy: **cache-first for assets, network-first for Firebase**:
- HTML/JS/CSS/icons → cached forever, updated on deploy via version bump
- Firestore calls → always go to network (Firebase SDK manages its own offline cache)

This gives:
- Offline play with cached verbs/games
- Instant launch (no network wait on assets)
- Auto-update on next launch when we ship new code

### "Add to Home Screen" UX
- Show install prompt on Android via `beforeinstallprompt` event
- iOS users need to do it manually; show a small "How to install" banner

## Capacitor (later — Phase 4)

```bash
npx cap add ios
npx cap add android
```

This wraps the entire web app in a native shell. Then:
- iOS: `npx cap open ios` → Xcode → archive → upload to App Store Connect
- Android: `npx cap open android` → Android Studio → build → upload to Play Console

Plugins we'll need:
- `@capacitor/in-app-purchases` (or `revenuecat` SDK for cross-platform subscriptions)
- `@capacitor/push-notifications`
- `@capacitor/preferences` (native key-value, replaces localStorage on native)
- `@capacitor/share`
- `@capacitor/app` (back button handling on Android)

## Versioning & deploys

Semantic versioning: `MAJOR.MINOR.PATCH`.

Strategy:
- Push to `main` → auto-deploy to staging URL via Netlify
- Manual promote to production via Netlify CLI or button
- Tagged releases trigger Capacitor native builds (later via GitHub Actions)

Service worker cache uses version number, so users get the new build on next launch.

## Telemetry — what to track

Firebase Analytics events from day one:
- `signup` (method: email/google/apple/anonymous)
- `study_card_flipped` (verb, tier)
- `study_verb_marked_studied` (verb, tier)
- `game_started` (game_type, source: dashboard/set/weak)
- `game_completed` (game_type, score, accuracy, duration)
- `set_created` (verb_count, forms)
- `set_practiced` (set_id, game_type)
- `paywall_shown` (trigger)
- `paywall_dismissed`
- `subscription_started` (tier, price)
- `subscription_renewed`
- `subscription_canceled`

This data drives every product decision: which games to invest in, where to put the paywall, which verb-tier introduces churn, etc.

## Performance budget

Targets for the bundled web app:
- First contentful paint: < 1.5s on 3G
- Time to interactive: < 3s on 3G
- HTML+CSS+JS bundle: < 300 KB gzipped (we're nowhere near this — current MVP is ~150 KB)
- Lighthouse score: > 90 in all categories

PWA-readiness: 100% Lighthouse PWA score before launch.

## What's NOT in scope for v1

- Spaced repetition algorithm (SM-2 or similar) — `verbStats.lastSeen` is the seed for this, but a proper SRS is its own iteration
- Multiplayer / friends / leaderboards
- Voice recording / pronunciation grading
- AI tutor chat (interesting later)
- Curriculum mode (lesson plans for teachers)

All listed as future ideas in `ROADMAP.md`.
