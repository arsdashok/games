# Monetization

## Pricing model

### Free tier
- **30 verbs** unlocked (the Easy tier + 10 hand-picked Mediums)
- **2 games**: Study + one rotating game per week
- **1 custom set** max
- Basic settings, no Weak Verbs mode
- Ads (banner at bottom of dashboard — non-intrusive)

**Goal:** enough to fall in love with the app, but with a clear ceiling

### Pro tier — £2.99 / month, £19.99 / year (-44%)
- All **97+ verbs** unlocked
- All **5+ games**
- Unlimited custom sets
- Weak Verbs mode
- Voice selection + speed customisation
- Daily streak rewards / badges
- No ads
- Cloud sync (anonymous users get this anyway, but the pitch is "your progress is safe")

**Goal:** £2.99 is the proven sweet spot for ed-tech impulse purchase (Duolingo Plus = $6.99, Babbel = $12.99 → we undercut by half)

### Teacher tier — £9.99 / month, £79.99 / year
Includes everything in Pro, plus:
- Create / manage classes (unlimited)
- Student progress dashboard (real-time)
- Assign sets to students (push to their account)
- Export class data (CSV)
- Group leaderboards
- Bulk-add students by CSV
- Email reminders to inactive students

**Goal:** tutors who manage 5+ paying students pay for this easily — covers itself with 1 student's lesson revenue per month

### Lifetime — £49.99 one-off
Same as Pro, forever. Captures the "I don't want subscriptions" crowd. Math: 1 lifetime = 16 monthly subs broken even at 16 months — good value for both.

## Free trial strategy

**7-day full Pro access** for new accounts, no card required.

After day 7: lock Pro features, show paywall on next attempt. Anti-pattern is "card required upfront" — it crushes conversion.

iOS / Android stores let us configure the trial natively. On web, we set `subscription.expiresAt = now + 7 days` server-side on signup, then the paywall logic just checks expiry.

## Conversion funnel

Industry benchmark for ed-tech freemium: **3-7% of installs → paying subscribers**. We aim for the top of that.

The funnel:
1. **Install / open** (1000)
2. **Complete onboarding** (700, -30%)
3. **Start first game** (600, -15%)
4. **Day-2 retention** (200, -67% — this is the brutal one)
5. **Day-7 retention** (80, -60%)
6. **Hit paywall** (50, -38% — they tried a locked feature)
7. **Subscribe** (5-10, -80-90%)

Final: **0.5-1% paid conversion from install**. Sounds tiny but at scale it works.

**Levers to pull (in order of impact):**
1. Onboarding → first game flow (the "aha" moment must come in <5 min)
2. Day-2 retention via push notification / email (push notification on Day-2 morning is the single highest-impact intervention)
3. Paywall placement — only trigger after value experienced
4. Pricing — A/B test £2.99 vs £3.99 monthly
5. Annual discount — 40-50% off vs monthly drives most revenue

## Where to put paywalls

Paywalls trigger on **friction with Pro-only features**, never randomly:

- Trying to unlock Medium tier in Study Mode → "Unlock all 97 verbs with Pro"
- Trying to start Sort/Story/Battle (if not in free weekly rotation) → "All games are in Pro"
- Tapping "+ Create new set" when already at 1 → "Unlimited sets with Pro"
- Tapping Weak Verbs → "Targeted practice is a Pro feature"
- Settings → Voice selection → "Choose your voice with Pro"

Each paywall has:
- The feature name + icon
- 3 bullet benefits of Pro
- Price comparison (monthly vs annual — annual highlighted)
- "Maybe later" button (don't be aggressive)
- 7-day free trial CTA

## Apple's rules — important constraints

1. **If you sell digital subscriptions in your iOS app, you MUST use Apple IAP** (15-30% cut). No Stripe, no PayPal.
2. **You CANNOT link to external purchase** inside iOS app. App can't say "subscribe on our website for cheaper".
3. **However:** you CAN sell on web at a different price, and the iOS user signing in with their account sees they're already Pro. This is the **Spotify model**. Allowed.
4. **Apple Small Business Program:** if your total revenue from App Store < $1M/year, you get 15% rate (not 30%) automatically.

For Android (Google Play): same rules, same cuts, also has Small Business at 15%.

## Recommended payment strategy

**Phase 1 — web launch:**
- Stripe only, £2.99/mo or £19.99/year
- Pay 2.9% + 30p per transaction → ~£0.20 per monthly sub
- 97% of revenue retained

**Phase 2 — iOS launch:**
- Add Apple IAP for iOS-installed users (subscription via App Store)
- Web-installed users continue paying via Stripe
- Server-side: both subscription sources update `user.subscription.tier = 'pro'`

**Phase 3 — Android launch:**
- Add Google Play Billing for Android-installed users
- Web users still on Stripe

**RevenueCat consideration:** if managing 3 payment systems gets messy, use RevenueCat (free up to $10k MRR, then 1% cut). It unifies Stripe + Apple + Google into one API. Worth using once we're on 2+ platforms.

## Annual vs monthly mix

Industry data: ~60% revenue comes from annual subscribers, ~40% from monthly, **but** annual subscribers are 4x less churn-prone. Push annual hard:
- Headline price = annual ("£19.99/year — save 44%")
- Monthly is shown smaller below
- 1-year cohort LTV >>> monthly cohort LTV

## Affiliate / referral

Phase 2+:
- Refer-a-friend gives both parties 1 month free
- Tracked via referral code in `users.referralCode` and `users.referredBy`
- Cap at 5 referrals per user (anti-abuse)

## Tutor pack

Special offering: a tutor (like Dasha) buys "Teacher tier" → gets bulk codes that automatically grant Pro to up to 20 students. £79.99/year for the tutor, value-adds £19.99 × 20 = £400/year of student Pro = massive win-win.

Implementation: `users/{tutorUid}.studentLicenses = 20` field. When student signs up with tutor's class code, `subscription.tier = 'pro'` granted via Cloud Function. License revoked when student leaves class.

## Long-term: B2B angle

Schools / language centres → 50-200 students at a discount (£5/student/year).
Direct sales, custom contracts, dashboards for school admins. Far longer sales cycle, higher per-deal value. Not phase 1.
