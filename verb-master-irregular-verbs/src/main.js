/**
 * App bootstrap — runs on page load, before anything else.
 *
 * Responsibilities:
 *   1. Pick a DataStore based on config
 *   2. Initialise it
 *   3. Register service worker (PWA)
 *   4. Hand off to UI router
 *
 * The current monolithic index.html still works without main.js. Once
 * we incrementally extract modules (Phase 2 final step), main.js becomes
 * the entry and index.html becomes a thin shell.
 */

import { STORE_TYPE, APP_VERSION, FEATURES } from './config.js';
import { setStore, getStore } from './data/store.js';
import { LocalStore } from './data/localStore.js';

async function boot() {
  console.log(`[VerbMaster] booting v${APP_VERSION} with store=${STORE_TYPE}`);

  let store;
  if (STORE_TYPE === 'firebase') {
    // Dynamic import — Firebase SDK only loaded if needed
    const { FirebaseStore } = await import('./data/firebaseStore.js');
    store = new FirebaseStore();
  } else {
    store = new LocalStore();
  }
  await store.init();
  setStore(store);

  // Auto-anonymous: if no session and feature enabled, start anonymous
  if (FEATURES.enableAnonymous && !store.getCurrentUser()) {
    // Don't auto-create on every page load — only if no current user
    // Will be triggered by the login UI's "Try without account" button
  }

  registerServiceWorker();

  // Wire global "logEvent" helper for legacy code in index.html
  window.appLogEvent = (name, params) => store.logEvent(name, params);

  // Signal that the store is ready — legacy code can listen for this
  window.dispatchEvent(new CustomEvent('verbmaster:ready', { detail: { store } }));
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[SW] registered:', reg.scope))
        .catch(err => console.warn('[SW] registration failed:', err));
    });
  }
}

boot().catch(err => {
  console.error('[VerbMaster] boot failed:', err);
});
