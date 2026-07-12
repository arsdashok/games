# Quick deploy — 5 steps to ship as PWA

Goal: get the app live on a real URL, installable on your phone, in **under 15 minutes**.

## Step 1 — Sign up at Netlify (2 min)

1. Go to [netlify.com](https://www.netlify.com) → **Sign up**
2. Recommended: sign up with GitHub (easier for later automation). Or use email — fine for now.
3. Free plan is enough. No credit card needed.

## Step 2 — Deploy by drag-and-drop (1 min)

1. Once logged in, you land on the dashboard
2. Look for the dropzone that says **"Want to deploy a new site without connecting to Git?"** → "Drag and drop your site output folder here"
3. Open Finder, navigate to `/Users/ars_dashok/Documents/Tutoring Claude/Games/`
4. **Drag the entire `verb-master-app` folder** onto the Netlify dropzone
5. Wait ~30 seconds while Netlify uploads + processes

You'll get a URL like `https://random-words-abc123.netlify.app`.

## Step 3 — Rename to something memorable (1 min)

1. In the Netlify dashboard for your site → **Site configuration** → **Change site name**
2. Pick something like `verbmaster` or `verb-master-app`
3. Now your URL is `https://verbmaster.netlify.app`

## Step 4 — Open on your phone (2 min)

### iPhone (Safari)
1. Open Safari on iPhone (NOT Chrome — iOS only allows PWA install from Safari)
2. Navigate to `https://verbmaster.netlify.app`
3. Tap the **Share button** (square with arrow up, at the bottom)
4. Scroll down → **Add to Home Screen**
5. Confirm → icon appears on home screen
6. Tap the icon → opens full-screen, no Safari UI, looks like native app

### Android (Chrome)
1. Open Chrome on Android
2. Navigate to `https://verbmaster.netlify.app`
3. Chrome will show a banner: **"Add Verb Master to home screen"** → tap **Install**
4. (If no banner: tap ⋮ menu → **Install app**)
5. Icon appears on home screen

## Step 5 — Tell your student (1 min)

Send Kristina (or whoever):

> Hey, I made an app for irregular verbs. Open this link on your phone in Safari (iPhone) or Chrome (Android):
> **https://verbmaster.netlify.app**
> Then tap "Add to Home Screen" — you'll get an app icon. Create your account, study a few verbs, try the games. Let me know what you think.

## Updating the app

Any time you change code in the local folder:
1. Drag the `verb-master-app` folder onto Netlify again (replaces the previous deploy)
2. Existing users get the new version on their next app launch (service worker auto-updates)
3. No need for them to reinstall

## Troubleshooting

**Service worker not registering?**
- Check Chrome DevTools → Application → Service Workers. Should show registered for `/sw.js`.
- If it shows errors, hard reload (Cmd+Shift+R) and check Console tab.

**iOS won't show "Add to Home Screen"?**
- Must be Safari, not Chrome iOS
- Page must have `apple-touch-icon` link (we have it)
- Page must be served over HTTPS (Netlify provides this automatically)

**Voice not working on iOS?**
- iOS Safari only speaks after user interaction. The 🔊 button click counts as interaction.
- Some iOS voices have low quality. The voice picker in Settings lets the user choose better ones.

**App icon shows default browser icon?**
- Force-uninstall and reinstall on the device
- iOS sometimes caches the old icon; clearing Safari cache helps

## Done — what now?

You have a real, installable, shareable app. Next session we plug in Firebase so:
- Same account works on phone + laptop
- Teacher dashboard sees real students live
- We can sell Pro subscriptions

But first — get it on Kristina's phone, watch her use it for a session, note what feels wrong. That feedback shapes the next iteration.
