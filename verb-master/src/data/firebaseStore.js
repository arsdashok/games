/**
 * FirebaseStore — DataStore implementation backed by Firebase Auth + Firestore.
 *
 * STATUS: skeleton with full method shapes. Each method has the right
 * signature and TODO comments showing what to call from Firebase SDK.
 *
 * Activate by setting STORE_TYPE='firebase' in config.js after running
 * `npm install firebase` OR using the CDN imports.
 *
 * Uses Firebase v10 modular SDK. Each method only imports what it needs
 * to keep bundle size low (when bundled).
 *
 * Reference: https://firebase.google.com/docs/firestore/manage-data/add-data
 */

import { DataStore } from './store.js';
import { FIREBASE_CONFIG } from '../config.js';

// CDN imports — work without npm. For production bundling, replace
// with 'firebase/app' etc. after `npm install firebase`.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged,
  signInAnonymously, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut as fbSignOut,
  GoogleAuthProvider, OAuthProvider, signInWithPopup,
  linkWithCredential, EmailAuthProvider,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, query, where, getDocs, orderBy,
  serverTimestamp, increment, arrayUnion, arrayRemove,
  enableIndexedDbPersistence
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import {
  getAnalytics, logEvent as fbLogEvent
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js';

export class FirebaseStore extends DataStore {
  constructor() {
    super();
    this._app = null;
    this._auth = null;
    this._db = null;
    this._analytics = null;
    this._authListeners = [];
    this._currentUser = null;            // UserProfile cached
    this._currentFbUser = null;           // raw Firebase user
  }

  // ===== Lifecycle =====

  async init() {
    this._app = initializeApp(FIREBASE_CONFIG);
    this._auth = getAuth(this._app);
    this._db = getFirestore(this._app);
    try { this._analytics = getAnalytics(this._app); } catch { /* may fail in some env */ }

    // Offline cache — Firestore stores data locally for instant reads
    try { await enableIndexedDbPersistence(this._db); } catch (e) {
      console.warn('IndexedDB persistence not available:', e.code);
    }

    // Wire auth state listener — pulls profile from Firestore on sign-in
    onAuthStateChanged(this._auth, async (fbUser) => {
      this._currentFbUser = fbUser;
      if (fbUser) {
        const profile = await this._loadOrCreateProfile(fbUser);
        this._currentUser = profile;
      } else {
        this._currentUser = null;
      }
      this._authListeners.forEach(cb => cb(this._currentUser));
    });

    return true;
  }

  async _loadOrCreateProfile(fbUser) {
    const ref = doc(this._db, 'users', fbUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { uid: fbUser.uid, ...snap.data() };
    }
    // First-time sign-in — create profile
    const profile = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Anonymous'),
      photoURL: fbUser.photoURL || null,
      role: 'student',
      isAnonymous: fbUser.isAnonymous,
      subscription: { tier: 'free', source: null, expiresAt: null, autoRenew: false },
      studied: [],
      verbStats: {},
      gameScores: { hangman: 0, speed: 0, sort: 0, story: 0, battle: 0, weak: 0 },
      xp: 0, level: 1,
      gamesPlayed: 0, totalCorrect: 0, totalAnswered: 0, bestStreak: 0,
      settings: {
        tier: 'all', sortTimer: 8, speedTimer: 10, rate: 1.0,
        voice: '', reverseSpeed: 'off', uiLanguage: 'en'
      },
      classCode: null,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return profile;
  }

  // ===== Auth =====

  async signInAnonymously() {
    const cred = await signInAnonymously(this._auth);
    return cred.user.uid;
  }

  async signUp({ email, password, displayName, role = 'student' }) {
    const cred = await createUserWithEmailAndPassword(this._auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    // Profile auto-created by onAuthStateChanged. Patch role/classCode here.
    const patch = { role };
    if (role === 'teacher') {
      patch.classCode = await this._generateUniqueClassCode();
      // Create class doc
      await setDoc(doc(this._db, 'classes', patch.classCode), {
        code: patch.classCode,
        teacherId: cred.user.uid,
        name: `${displayName || email}'s class`,
        createdAt: serverTimestamp(),
        studentCount: 0,
      });
    }
    await updateDoc(doc(this._db, 'users', cred.user.uid), patch);
    return cred.user.uid;
  }

  async signIn({ email, password }) {
    const cred = await signInWithEmailAndPassword(this._auth, email, password);
    return cred.user.uid;
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this._auth, provider);
    return cred.user.uid;
  }

  async signInWithApple() {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const cred = await signInWithPopup(this._auth, provider);
    return cred.user.uid;
  }

  async signOut() {
    await fbSignOut(this._auth);
  }

  async linkAnonymousAccount(method, credentials) {
    if (!this._currentFbUser || !this._currentFbUser.isAnonymous) {
      throw new Error('No anonymous session to link');
    }
    let cred;
    if (method === 'email') {
      cred = EmailAuthProvider.credential(credentials.email, credentials.password);
    } else if (method === 'google') {
      const provider = new GoogleAuthProvider();
      cred = GoogleAuthProvider.credential(credentials.idToken);
    } else if (method === 'apple') {
      const provider = new OAuthProvider('apple.com');
      cred = provider.credential({ idToken: credentials.idToken });
    } else {
      throw new Error('Unknown link method');
    }
    const result = await linkWithCredential(this._currentFbUser, cred);
    // Update profile.isAnonymous = false
    await updateDoc(doc(this._db, 'users', result.user.uid), { isAnonymous: false });
    return result.user.uid;
  }

  onAuthChange(callback) {
    this._authListeners.push(callback);
    queueMicrotask(() => callback(this._currentUser));
    return () => {
      const i = this._authListeners.indexOf(callback);
      if (i >= 0) this._authListeners.splice(i, 1);
    };
  }

  getCurrentUser() {
    return this._currentUser;
  }

  // ===== Profile =====

  async getUserProfile(userId) {
    const snap = await getDoc(doc(this._db, 'users', userId));
    return snap.exists() ? { uid: userId, ...snap.data() } : null;
  }

  async updateUserProfile(userId, patch) {
    await updateDoc(doc(this._db, 'users', userId), {
      ...patch,
      lastActive: serverTimestamp(),
    });
    if (this._currentUser && this._currentUser.uid === userId) {
      Object.assign(this._currentUser, patch);
    }
  }

  // ===== Studied verbs =====

  async markVerbStudied(userId, verbV1) {
    await updateDoc(doc(this._db, 'users', userId), {
      studied: arrayUnion(verbV1),
      lastActive: serverTimestamp(),
    });
    if (this._currentUser && this._currentUser.uid === userId) {
      if (!this._currentUser.studied.includes(verbV1)) {
        this._currentUser.studied.push(verbV1);
      }
    }
  }

  async unmarkVerbStudied(userId, verbV1) {
    await updateDoc(doc(this._db, 'users', userId), {
      studied: arrayRemove(verbV1),
      lastActive: serverTimestamp(),
    });
    if (this._currentUser && this._currentUser.uid === userId) {
      this._currentUser.studied = this._currentUser.studied.filter(v => v !== verbV1);
    }
  }

  async getStudiedVerbs(userId) {
    const u = await this.getUserProfile(userId);
    return (u && u.studied) || [];
  }

  // ===== Verb stats =====

  async recordVerbAttempt(userId, verbV1, correct, options = {}) {
    const ref = doc(this._db, 'users', userId);
    // Atomic increment is safer than read-modify-write for concurrent games
    const patch = {
      [`verbStats.${verbV1}.total`]: increment(1),
      [`verbStats.${verbV1}.lastSeen`]: serverTimestamp(),
      totalAnswered: increment(1),
      lastActive: serverTimestamp(),
    };
    if (correct) {
      patch[`verbStats.${verbV1}.correct`] = increment(1);
      patch.totalCorrect = increment(1);
    }
    await updateDoc(ref, patch);
  }

  async getVerbStats(userId) {
    const u = await this.getUserProfile(userId);
    return (u && u.verbStats) || {};
  }

  // ===== Game scores =====

  async saveGameScore(userId, gameType, score) {
    // Read current best, only write if better
    const u = await this.getUserProfile(userId);
    const current = (u && u.gameScores && u.gameScores[gameType]) || 0;
    const patch = { gamesPlayed: increment(1) };
    if (score > current) {
      patch[`gameScores.${gameType}`] = score;
    }
    await updateDoc(doc(this._db, 'users', userId), patch);
  }

  async getGameScores(userId) {
    const u = await this.getUserProfile(userId);
    return (u && u.gameScores) || {};
  }

  // ===== Settings =====

  async getSettings(userId) {
    const u = await this.getUserProfile(userId);
    return (u && u.settings) || null;
  }

  async saveSettings(userId, settings) {
    await updateDoc(doc(this._db, 'users', userId), { settings });
    if (this._currentUser && this._currentUser.uid === userId) {
      this._currentUser.settings = settings;
    }
  }

  // ===== Custom sets =====

  async listSets(userId) {
    const q = query(
      collection(this._db, 'sets'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async getSet(setId) {
    const snap = await getDoc(doc(this._db, 'sets', setId));
    return snap.exists() ? { id: setId, ...snap.data() } : null;
  }

  async createSet(userId, { name, verbs, forms, description = null }) {
    const ref = await addDoc(collection(this._db, 'sets'), {
      ownerId: userId, name, verbs, forms, description,
      shared: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastPlayedAt: null,
    });
    return { id: ref.id, ownerId: userId, name, verbs, forms, shared: false };
  }

  async updateSet(setId, patch) {
    await updateDoc(doc(this._db, 'sets', setId), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteSet(setId) {
    await deleteDoc(doc(this._db, 'sets', setId));
  }

  async listSharedSetsForStudent(studentId) {
    const student = await this.getUserProfile(studentId);
    if (!student || !student.classCode) return [];
    const cls = await this.getClass(student.classCode);
    if (!cls) return [];
    const q = query(
      collection(this._db, 'sets'),
      where('ownerId', '==', cls.teacherId),
      where('shared', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // ===== Classes =====

  async _generateUniqueClassCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 10; attempt++) {
      let code = '';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      const snap = await getDoc(doc(this._db, 'classes', code));
      if (!snap.exists()) return code;
    }
    throw new Error('Could not generate unique class code');
  }

  async createClass(teacherId, name) {
    const code = await this._generateUniqueClassCode();
    await setDoc(doc(this._db, 'classes', code), {
      code, teacherId, name,
      createdAt: serverTimestamp(),
      studentCount: 0,
    });
    await this.updateUserProfile(teacherId, { classCode: code });
    return code;
  }

  async getClass(classCode) {
    const snap = await getDoc(doc(this._db, 'classes', classCode));
    return snap.exists() ? snap.data() : null;
  }

  async joinClass(studentId, classCode) {
    const cls = await this.getClass(classCode);
    if (!cls) throw new Error('Invalid class code');
    await this.updateUserProfile(studentId, { classCode });
    await updateDoc(doc(this._db, 'classes', classCode), {
      studentCount: increment(1)
    });
  }

  async leaveClass(studentId) {
    const me = await this.getUserProfile(studentId);
    if (me && me.classCode) {
      await updateDoc(doc(this._db, 'classes', me.classCode), {
        studentCount: increment(-1)
      });
    }
    await this.updateUserProfile(studentId, { classCode: null });
  }

  async getClassMembers(teacherId) {
    const teacher = await this.getUserProfile(teacherId);
    if (!teacher || !teacher.classCode) return [];
    const q = query(
      collection(this._db, 'users'),
      where('role', '==', 'student'),
      where('classCode', '==', teacher.classCode)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }

  // ===== Subscriptions =====

  async getSubscription(userId) {
    const u = await this.getUserProfile(userId);
    return u ? u.subscription : null;
  }

  /**
   * Stripe Checkout — initiated client-side, returns a redirect URL.
   * The actual upgrade happens server-side via webhook → Cloud Function.
   */
  async startCheckout(userId, priceId, returnUrl) {
    // TODO: call Cloud Function `createCheckoutSession`
    // Function returns Stripe session URL → window.location = url
    throw new Error('Stripe Checkout not yet wired — implement Cloud Function');
  }

  // ===== Telemetry =====

  async logEvent(eventName, params = {}) {
    if (this._analytics) {
      try { fbLogEvent(this._analytics, eventName, params); }
      catch (e) { console.warn('analytics:', e); }
    }
  }

  // ===== Migration =====

  async migrateFromLocalStorage(userId) {
    try {
      const raw = localStorage.getItem('verbmaster_data_v2') || localStorage.getItem('verbmaster_data');
      if (!raw) return false;
      const data = JSON.parse(raw);
      const oldUser = data.users && data.users[0];  // legacy MVP had single user
      if (!oldUser) return false;
      // Patch only the learning state, preserve any new Firestore-only fields
      const patch = {
        studied: oldUser.studied || [],
        verbStats: oldUser.verbStats || {},
        gameScores: oldUser.gameScores || {},
        xp: oldUser.xp || 0,
        level: oldUser.level || 1,
        gamesPlayed: oldUser.gamesPlayed || 0,
        totalCorrect: oldUser.totalCorrect || 0,
        totalAnswered: oldUser.totalAnswered || 0,
        bestStreak: oldUser.bestStreak || 0,
        migratedFromLocal: true,
      };
      await updateDoc(doc(this._db, 'users', userId), patch);
      // Migrate sets
      const oldSets = data.sets || [];
      for (const s of oldSets) {
        await this.createSet(userId, {
          name: s.name,
          verbs: s.verbs,
          forms: s.forms,
          description: 'Imported from offline'
        });
      }
      // Clear old storage so we don't re-migrate
      localStorage.removeItem('verbmaster_data_v2');
      localStorage.removeItem('verbmaster_data');
      return true;
    } catch (e) {
      console.error('Migration failed:', e);
      return false;
    }
  }
}
