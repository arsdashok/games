/**
 * App-wide configuration.
 *
 * STORE_TYPE — which backend to use:
 *   'local'    → LocalStore (localStorage, no network)
 *   'firebase' → FirebaseStore (production)
 *
 * Flip to 'firebase' after running through DEPLOY.md → Stage 3.
 */

export const STORE_TYPE = 'local';

/**
 * Firebase config — paste from Firebase Console → Project Settings → Your apps → Web.
 * Safe to commit (NOT secrets — security is enforced by Firestore rules).
 *
 * Replace placeholders below with your real project values.
 */
export const FIREBASE_CONFIG = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

/**
 * Stripe price IDs (from Stripe Dashboard → Products → Pricing).
 * Empty string means feature not configured yet.
 */
export const STRIPE_PRICES = {
  proMonthly: '',
  proAnnual: '',
  proLifetime: '',
  teacherMonthly: '',
  teacherAnnual: '',
};

/**
 * Feature flags — flip during development without code changes.
 */
export const FEATURES = {
  enableSubscriptions: false,
  enableAnonymous: true,
  enableTeacherDashboard: true,
  enableAnalytics: true,
};

/**
 * Build version — bumped per release. Used by service worker for cache invalidation.
 */
export const APP_VERSION = '2.0.0-dev';

/**
 * Minimum studied verbs before quiz games unlock.
 */
export const MIN_STUDIED_TO_PLAY = 3;

/**
 * Verbs / sentences / sets limits by tier (drives paywalls).
 */
export const TIER_LIMITS = {
  free: {
    maxStudiedVerbs: 30,        // can't mark more than 30 as studied
    availableGames: ['study', 'speed'],
    maxCustomSets: 1,
    weakVerbsMode: false,
    voiceSelection: false,
  },
  pro: {
    maxStudiedVerbs: Infinity,
    availableGames: ['study', 'hangman', 'speed', 'sort', 'story', 'battle', 'weak'],
    maxCustomSets: Infinity,
    weakVerbsMode: true,
    voiceSelection: true,
  },
  teacher: {
    maxStudiedVerbs: Infinity,
    availableGames: ['study', 'hangman', 'speed', 'sort', 'story', 'battle', 'weak'],
    maxCustomSets: Infinity,
    weakVerbsMode: true,
    voiceSelection: true,
    teacherDashboard: true,
    sharedSets: true,
    classManagement: true,
  },
};
