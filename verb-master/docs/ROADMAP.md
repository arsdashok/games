# Roadmap

Phased approach. Each phase ends with a usable artifact you can ship to real users.

## Phase 1 — MVP (✅ DONE)
**Status:** the current `verb_platform_v2.html`, working in browsers, used with Kristina.

Delivered:
- 97 irregular verbs, 3 tiers, Russian translations
- 5 games + Study Mode
- Custom sets
- Local-only auth
- TTS, settings, voice picker

## Phase 2 — Architecture refactor (← we are here)
**Goal:** split monolithic HTML into modules + data abstraction layer. **No new user-facing features.** Same MVP, but ready for backend swap.

Done in this session:
- Directory structure
- ARCHITECTURE.md, FIRESTORE_SCHEMA.md, MONETIZATION.md, ROADMAP.md, DEPLOY.md
- `DataStore` interface + `LocalStore` implementation extracted

To finish Phase 2:
- [ ] Extract VERBS into `src/data/verbs.js`
- [ ] Extract helpers into `src/helpers/`
- [ ] Extract each game into its own module
- [ ] Verify everything still works as before, locally
- [ ] Add basic CSS file split

**Duration:** 1 evening of focused work

## Phase 3 — PWA shell
**Goal:** the same MVP, but installable on Android/iOS home screen, works offline.

Tasks:
- [ ] `manifest.json` with metadata + icons
- [ ] Service worker for cache-first asset loading
- [ ] Real icons (192px, 512px, maskable, apple-touch — make in Figma or pay £20 on Fiverr)
- [ ] Splash screen
- [ ] iOS-specific meta tags (`apple-mobile-web-app-capable`, etc.)
- [ ] Add-to-home-screen prompt for Android

**Duration:** 1 evening + waiting for icon

**Deliverable:** ship to Netlify (deploy step in DEPLOY.md). You can send this URL to anyone, they install on phone, looks/feels like app.

## Phase 4 — Firebase backend
**Goal:** users sign in across devices, teachers see students live, subscriptions are possible.

Tasks:
- [ ] Create Firebase project + enable Auth + Firestore
- [ ] Implement `FirebaseStore` (the other half of the abstraction layer)
- [ ] Add Google Sign-In + Apple Sign-In + email/password
- [ ] Add anonymous auth + upgrade flow
- [ ] Wire teacher dashboard to live Firestore queries
- [ ] Migration UX: detect existing localStorage data, offer to upload
- [ ] Deploy `firestore.rules` + indexes

**Duration:** 2-3 days

**Deliverable:** working cross-device sync. You log in on phone & laptop, same progress. Teacher dashboard shows your real students in realtime.

## Phase 5 — Subscriptions (web only first)
**Goal:** sell Pro plans on the web via Stripe.

Tasks:
- [ ] Stripe account + price IDs for monthly/annual/lifetime
- [ ] Stripe Checkout flow ("Upgrade to Pro" button → Stripe-hosted page → success)
- [ ] Webhook handler in Cloud Function: receives `checkout.session.completed`, updates `user.subscription.tier`
- [ ] Paywall UI (modal that pops on Pro features)
- [ ] Free trial logic (7 days)
- [ ] Subscription management page (cancel, view billing)
- [ ] Refund / cancellation handling via webhook

**Duration:** 3-5 days

**Deliverable:** people can pay you on the web. Real revenue.

## Phase 6 — iOS launch
**Goal:** wrapper around the web app, submitted to App Store.

Tasks:
- [ ] Apple Developer account ($99)
- [ ] `npm install` Capacitor — first time we need Node locally
- [ ] `npx cap add ios` — generates Xcode project
- [ ] Add Apple Sign-In (mandatory if you have Google sign-in)
- [ ] Add Apple In-App Purchase via RevenueCat or native IAP
- [ ] App icon (1024×1024) + screenshots (6.7", 6.5", 5.5" — three sizes)
- [ ] App Store Connect: app listing, description, keywords, screenshots
- [ ] Privacy policy URL (host on Notion or simple page)
- [ ] App Review submission — Apple takes 1-3 days

**Duration:** 1 week (most of it is screenshots + waiting for review)

**Deliverable:** Verb Master live in App Store.

## Phase 7 — Android launch
**Goal:** Google Play version.

Tasks:
- [ ] Google Play Console account ($25 one-time)
- [ ] `npx cap add android` — generates Android Studio project
- [ ] Add Google Play Billing
- [ ] App icon adaptive (foreground + background layer)
- [ ] Screenshots (phone + tablet)
- [ ] Google Play listing — same content as iOS, simpler review

**Duration:** 2-3 days (Google review is faster than Apple)

**Deliverable:** Verb Master in Google Play.

## Phase 8 — UI localisation
**Goal:** non-Russian-speaking learners use the app.

Tasks:
- [ ] Externalize all UI strings to i18n dictionary (`src/helpers/i18n.js`)
- [ ] Translations: en (source), pl, es, de, fr, it, pt, tr (Turkey is huge ESL market)
- [ ] Translations: ru (already in verbs, now UI too)
- [ ] Verb translations: add `translations: { ru, pl, es, de, fr, ... }` to each verb
- [ ] Language picker in onboarding
- [ ] RTL languages skipped for now (English doesn't have many learners from RTL countries)

**Duration:** 1 week (mostly text + translator work)

**Deliverable:** addressable market 10x bigger.

## Phase 9 — Growth / polish

Ongoing work after launch:
- [ ] Onboarding flow A/B tests
- [ ] Add new game: Speed Round (60-second mode for daily streak)
- [ ] Spaced repetition scheduling (SRS) for Weak Verbs
- [ ] Daily challenge: same 5 verbs for everyone, leaderboard
- [ ] Streak system + push notifications
- [ ] Refer-a-friend
- [ ] Phrasal verbs add-on pack
- [ ] Prepositions add-on pack
- [ ] Adult learners pack (more advanced sentences)
- [ ] Kids pack (more colourful, simpler verbs)
- [ ] Voice recording + pronunciation feedback (Web Speech API + recognition score)

## Future big bets

- **AI tutor:** chat with the app to practice using verbs in context. Powered by Claude API. Premium feature, £4.99/mo extra
- **Custom curricula:** teachers build full courses, sell to other teachers (marketplace, 70/30 split)
- **Schools:** B2B sales with admin portal, 100+ student licenses
- **Other languages:** the engine is generic. Spanish irregular verbs are even worse than English — clone, retarget.

## Milestone metrics

- Phase 3 done → 10 friends/family using PWA
- Phase 5 done → first £1 of revenue
- Phase 6+7 done → 100 installs / week from organic
- Phase 8 done → 1000 active users
- Phase 9+ → £1k MRR (recurring monthly revenue)

If hitting these milestones takes 6 months, that's healthy product velocity for solo + AI co-founder.
