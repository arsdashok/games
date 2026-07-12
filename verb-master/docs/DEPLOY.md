# Deployment guide

End-to-end: how to ship Verb Master to real users.

## Stage 1 — local development

No build tools required initially. Just:
1. Open `verb-master-app/` in VS Code (or any editor)
2. Right-click `index.html` → "Open with Live Server" (install Live Server extension once)
3. App opens at `http://localhost:5500` with hot reload on save

Why a local server (not just file://)? Because:
- Service workers won't register from `file://` — needed for PWA
- ES modules need proper MIME types
- Firebase auth redirects need real URLs

Alternative: `python3 -m http.server 8000` from the project dir.

## Stage 2 — deploy to Netlify (web)

Free, no credit card needed.

### One-time setup
1. Sign up at netlify.com (use GitHub auth for later automation)
2. Click "Add new site" → "Deploy manually"
3. Drag the `verb-master-app/` folder into the dropzone
4. Get URL like `https://random-name-12345.netlify.app`
5. Site Settings → Change site name → `verbmaster` (or whatever's free)
6. (Optional) Custom domain: buy at Porkbun/Namecheap (~£10/year), point CNAME at Netlify

### Iterating
Two options:
- **Drag-and-drop redeploy:** any time you change files, drag the folder again. Old version is replaced.
- **Git-based (better):** push your folder to GitHub repo, connect Netlify to repo, every push auto-deploys.

For Phase 2-3, drag-and-drop is fine. Once we add Firebase config secrets, switch to Git.

### Custom domain
- Buy `verbmaster.app` (or .com/.io/whatever) at Porkbun for ~£15/year
- Netlify → Domains → Add custom domain
- Add CNAME record in Porkbun: `verbmaster.app → <netlify-url>`
- SSL certificate auto-provisioned (free, Let's Encrypt) within minutes

## Stage 3 — Firebase setup

### Create project
1. Go to console.firebase.google.com
2. "Add project" → name "verb-master" or "verbmaster"
3. Disable Google Analytics initially (less to configure; can enable later)
4. Create project — takes 30 seconds

### Enable services
1. **Authentication:** Build → Authentication → Get Started
   - Enable Email/Password
   - Enable Google (uses your Google account as auth provider)
   - Enable Anonymous
   - Enable Apple (later, when we add iOS — requires Apple Developer account)
2. **Firestore Database:** Build → Firestore → Create database
   - Start in production mode (we'll add rules)
   - Region: `eur3` (Belgium, closest to UK/EU users) — IMPORTANT: cannot change region later
3. **Hosting (optional, alternative to Netlify):** Build → Hosting
   - We're using Netlify, skip this. But it's there if you change your mind.

### Get config
1. Project Overview → ⚙️ → Project Settings → General
2. Scroll to "Your apps" → Click `</>` (Web)
3. Register app, name it "Verb Master web"
4. Copy the `firebaseConfig` object — looks like:
```js
{
  apiKey: "AIzaSy...",
  authDomain: "verb-master.firebaseapp.com",
  projectId: "verb-master",
  storageBucket: "verb-master.appspot.com",
  messagingSenderId: "...",
  appId: "..."
}
```
5. Paste into `src/config.js` (see template there)

⚠️ The Firebase web config is **safe to commit to git** — it's not a secret. Security is enforced by Firestore rules, not by hiding the config. Auth providers themselves enforce origin checks (you whitelist your domain in console).

### Deploy security rules
Install Firebase CLI (one-time, requires Node):
```bash
brew install node
npm install -g firebase-tools
firebase login
firebase init firestore   # picks up firestore.rules + firestore.indexes.json
firebase deploy --only firestore:rules,firestore:indexes
```

## Stage 4 — Stripe (subscriptions on web)

### Setup
1. Stripe account at stripe.com (UK business is straightforward, individual is also OK)
2. Activate account (provide tax info, bank details for payouts)
3. Dashboard → Products → create:
   - "Verb Master Pro Monthly" — recurring, £2.99/month
   - "Verb Master Pro Annual" — recurring, £19.99/year
   - "Verb Master Pro Lifetime" — one-time, £49.99
   - "Verb Master Teacher Monthly" — recurring, £9.99/month
   - "Verb Master Teacher Annual" — recurring, £79.99/year
4. Get price IDs (start with `price_...`) — paste into `src/config.js`

### Test mode
Stripe has a test mode toggle. Use test cards (`4242 4242 4242 4242`) to verify the flow before going live. Once happy, flip to live mode.

### Webhook handler
This is a Cloud Function — Firebase has free function hosting. Code goes in `functions/index.js` and is deployed via `firebase deploy --only functions`.

We need ONE webhook endpoint to listen for:
- `customer.subscription.created` → set `users/{uid}.subscription.tier = 'pro'`
- `customer.subscription.updated` → update expiry
- `customer.subscription.deleted` → set `tier = 'free'`

Detailed code in `functions/` directory (later phase).

## Stage 5 — iOS submission (Capacitor)

Requirements:
- Mac (you have one — confirmed)
- Xcode installed (free from Mac App Store, ~12 GB download)
- Apple Developer account ($99/year, sign up at developer.apple.com)

### Steps
```bash
# In verb-master-app/, first time:
npm init -y                         # create package.json
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Verb Master" "app.verbmaster.web"   # bundle id
npx cap add ios                     # generates ios/ folder

# Each time you ship an update:
npx cap sync ios                    # copies web build into ios project
npx cap open ios                    # opens Xcode
# In Xcode: select target device → Product → Archive → Upload to App Store Connect
```

### App Store Connect
1. appstoreconnect.apple.com
2. My Apps → + → New app
3. Fill metadata: name, description, screenshots, keywords, privacy policy URL
4. Pricing: Free (with IAP)
5. Add IAP subscription products matching Stripe prices
6. Submit for review → wait 1-3 days

### Apple-specific gotchas
- **Privacy policy URL is mandatory.** Host on Notion or a simple page on Netlify (e.g. `verbmaster.app/privacy`).
- **App Tracking Transparency:** since we collect Firebase Analytics, we'll need to show the iOS prompt. Capacitor plugin: `@capacitor-community/app-tracking-transparency`.
- **Sign in with Apple is mandatory** if you offer Google sign-in. Don't skip this — automatic rejection otherwise.
- **First submission often gets rejected** for tiny things (missing screenshot, unclear value proposition). Don't panic — iterate.

## Stage 6 — Android submission

Requirements:
- Android Studio (free, ~5 GB download)
- Google Play Console account ($25, one-time)

### Steps
```bash
npm install @capacitor/android
npx cap add android
npx cap sync android
npx cap open android
# In Android Studio: Build → Generate Signed Bundle → AAB → upload
```

### Google Play Console
1. play.google.com/console
2. Create app → fill metadata
3. Production → Create new release → Upload AAB
4. Internal testing track is great for early iterations (immediate availability for testers)
5. Production review: 1-7 days typically

## Stage 7 — Updating across the stack

When you change code and want to ship everywhere:

```bash
# 1. Update web (Netlify)
# Either: drag-and-drop folder again
# Or: git push → auto-deploy

# 2. Update native (Capacitor)
npx cap sync             # copies updated web to ios/android projects
npx cap open ios         # archive + upload new version to App Store Connect
npx cap open android     # build new AAB + upload to Play Console

# 3. Update Firebase functions / rules (if changed)
firebase deploy --only firestore:rules,functions
```

For minor JS-only updates, you can use **Capacitor Live Updates** (paid) to push changes without resubmitting to app stores. Useful for content/bug fixes, NOT for new features or anything that adds permissions.

## Pre-launch checklist

Before submitting to any app store:
- [ ] Real icon (1024×1024) + adaptive variants
- [ ] Splash screen
- [ ] All TODO/FIXME removed from code
- [ ] Lighthouse PWA score = 100
- [ ] Test on real iPhone + real Android phone
- [ ] Test with slow 3G (Chrome DevTools throttle) — still loads
- [ ] Test offline mode — at least dashboard + Study works
- [ ] Privacy policy + Terms of Service URLs live
- [ ] All payment flows tested with Stripe test mode
- [ ] At least one Pro feature paywall tested end-to-end
- [ ] Firebase Analytics events firing (verify in console)
- [ ] No console.error/warn in production build
- [ ] Crashlytics enabled
- [ ] CSP headers set in Netlify config (`netlify.toml`)
- [ ] Test sign-in with Apple, Google, email, anonymous
