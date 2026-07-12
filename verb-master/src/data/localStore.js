/**
 * LocalStore — DataStore implementation backed by localStorage.
 *
 * Used for:
 *   - Development without Firebase
 *   - Anonymous "try before sign-up" mode in production
 *   - Offline fallback when Firebase is unavailable
 *
 * Data is namespaced under STORAGE_KEY and structured as:
 *   {
 *     users: UserProfile[],
 *     sets: VerbSet[],
 *     classes: { [code]: { teacherId, createdAt, name } },
 *     currentUserId: string|null
 *   }
 */

import { DataStore } from './store.js';

const STORAGE_KEY = 'verbmaster_data_v2';

export class LocalStore extends DataStore {
  constructor() {
    super();
    this._listeners = [];
    this._currentUserId = null;
  }

  // ===== Internals =====

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this._empty();
      const parsed = JSON.parse(raw);
      return Object.assign(this._empty(), parsed);
    } catch {
      return this._empty();
    }
  }

  _save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  _empty() {
    return { users: [], sets: [], classes: {}, currentUserId: null };
  }

  _emit() {
    const me = this.getCurrentUser();
    this._listeners.forEach(cb => cb(me));
  }

  _genId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  _emptyProfile(uid, overrides = {}) {
    return {
      uid,
      email: null,
      displayName: 'Anonymous',
      photoURL: null,
      role: 'student',
      isAnonymous: true,
      subscription: { tier: 'free', source: null, expiresAt: null, autoRenew: false },
      studied: [],
      verbStats: {},
      gameScores: { hangman: 0, speed: 0, sort: 0, story: 0, battle: 0, weak: 0 },
      xp: 0,
      level: 1,
      gamesPlayed: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      bestStreak: 0,
      settings: {
        tier: 'all', sortTimer: 8, speedTimer: 10, rate: 1.0,
        voice: '', reverseSpeed: 'off', uiLanguage: 'en'
      },
      classCode: null,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      ...overrides
    };
  }

  // ===== Lifecycle =====

  async init() {
    const data = this._load();
    this._currentUserId = data.currentUserId;
    return true;
  }

  // ===== Auth =====

  async signInAnonymously() {
    const data = this._load();
    const uid = this._genId('anon_');
    data.users.push(this._emptyProfile(uid));
    data.currentUserId = uid;
    this._save(data);
    this._currentUserId = uid;
    this._emit();
    return uid;
  }

  async signUp({ email, password, displayName, role = 'student' }) {
    const data = this._load();
    if (data.users.find(u => u.email === email)) {
      throw new Error('Email already in use');
    }
    const uid = this._genId('user_');
    const profile = this._emptyProfile(uid, {
      email,
      displayName: displayName || email.split('@')[0],
      role,
      isAnonymous: false,
      _localPassword: password,  // ⚠️ local only — never replicate this in FirebaseStore
    });
    if (role === 'teacher') {
      profile.classCode = this._genClassCode(data);
      data.classes[profile.classCode] = {
        teacherId: uid,
        name: `${profile.displayName}'s class`,
        createdAt: new Date().toISOString()
      };
    }
    data.users.push(profile);
    data.currentUserId = uid;
    this._save(data);
    this._currentUserId = uid;
    this._emit();
    return uid;
  }

  async signIn({ email, password }) {
    const data = this._load();
    const user = data.users.find(u => u.email === email && u._localPassword === password);
    if (!user) throw new Error('Invalid email or password');
    data.currentUserId = user.uid;
    this._save(data);
    this._currentUserId = user.uid;
    this._emit();
    return user.uid;
  }

  async signInWithGoogle() { throw new Error('Google sign-in requires FirebaseStore'); }
  async signInWithApple() { throw new Error('Apple sign-in requires FirebaseStore'); }

  async signOut() {
    const data = this._load();
    data.currentUserId = null;
    this._save(data);
    this._currentUserId = null;
    this._emit();
  }

  async linkAnonymousAccount(method, credentials) {
    if (method !== 'email') throw new Error('LocalStore only supports email linking');
    const data = this._load();
    const me = data.users.find(u => u.uid === this._currentUserId);
    if (!me || !me.isAnonymous) throw new Error('No anonymous session to link');
    if (data.users.find(u => u.email === credentials.email)) {
      throw new Error('Email already in use');
    }
    me.email = credentials.email;
    me._localPassword = credentials.password;
    me.displayName = credentials.displayName || me.displayName;
    me.isAnonymous = false;
    this._save(data);
    this._emit();
    return me.uid;
  }

  onAuthChange(callback) {
    this._listeners.push(callback);
    // fire once immediately with current state
    queueMicrotask(() => callback(this.getCurrentUser()));
    return () => {
      const i = this._listeners.indexOf(callback);
      if (i >= 0) this._listeners.splice(i, 1);
    };
  }

  getCurrentUser() {
    if (!this._currentUserId) return null;
    const data = this._load();
    return data.users.find(u => u.uid === this._currentUserId) || null;
  }

  // ===== Profile =====

  async getUserProfile(userId) {
    const data = this._load();
    return data.users.find(u => u.uid === userId) || null;
  }

  async updateUserProfile(userId, patch) {
    const data = this._load();
    const i = data.users.findIndex(u => u.uid === userId);
    if (i < 0) throw new Error('User not found');
    data.users[i] = { ...data.users[i], ...patch, lastActive: new Date().toISOString() };
    this._save(data);
    if (userId === this._currentUserId) this._emit();
    return data.users[i];
  }

  // ===== Studied verbs =====

  async markVerbStudied(userId, verbV1) {
    const u = await this.getUserProfile(userId);
    if (!u) return;
    if (!u.studied.includes(verbV1)) u.studied.push(verbV1);
    await this.updateUserProfile(userId, { studied: u.studied });
  }

  async unmarkVerbStudied(userId, verbV1) {
    const u = await this.getUserProfile(userId);
    if (!u) return;
    await this.updateUserProfile(userId, { studied: u.studied.filter(v => v !== verbV1) });
  }

  async getStudiedVerbs(userId) {
    const u = await this.getUserProfile(userId);
    return (u && u.studied) || [];
  }

  // ===== Verb statistics =====

  async recordVerbAttempt(userId, verbV1, correct, options = {}) {
    const u = await this.getUserProfile(userId);
    if (!u) return;
    const stats = { ...(u.verbStats || {}) };
    if (!stats[verbV1]) stats[verbV1] = { correct: 0, total: 0, lastSeen: null, avgResponseMs: null };
    stats[verbV1].total++;
    if (correct) stats[verbV1].correct++;
    stats[verbV1].lastSeen = new Date().toISOString();
    if (options.responseMs) {
      const old = stats[verbV1].avgResponseMs || options.responseMs;
      stats[verbV1].avgResponseMs = Math.round((old + options.responseMs) / 2);
    }
    await this.updateUserProfile(userId, {
      verbStats: stats,
      totalAnswered: u.totalAnswered + 1,
      totalCorrect: u.totalCorrect + (correct ? 1 : 0),
    });
  }

  async getVerbStats(userId) {
    const u = await this.getUserProfile(userId);
    return (u && u.verbStats) || {};
  }

  // ===== Game scores =====

  async saveGameScore(userId, gameType, score) {
    const u = await this.getUserProfile(userId);
    if (!u) return;
    const scores = { ...(u.gameScores || {}) };
    if (score > (scores[gameType] || 0)) {
      scores[gameType] = score;
      await this.updateUserProfile(userId, {
        gameScores: scores,
        gamesPlayed: (u.gamesPlayed || 0) + 1,
      });
    } else {
      await this.updateUserProfile(userId, { gamesPlayed: (u.gamesPlayed || 0) + 1 });
    }
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
    await this.updateUserProfile(userId, { settings });
  }

  // ===== Custom sets =====

  async listSets(userId) {
    const data = this._load();
    return data.sets.filter(s => s.ownerId === userId);
  }

  async getSet(setId) {
    const data = this._load();
    return data.sets.find(s => s.id === setId) || null;
  }

  async createSet(userId, { name, verbs, forms, description = null }) {
    const data = this._load();
    const id = this._genId('set_');
    const now = new Date().toISOString();
    const set = {
      id, ownerId: userId, name, verbs, forms,
      shared: false, description,
      createdAt: now, updatedAt: now, lastPlayedAt: null
    };
    data.sets.push(set);
    this._save(data);
    return set;
  }

  async updateSet(setId, patch) {
    const data = this._load();
    const i = data.sets.findIndex(s => s.id === setId);
    if (i < 0) return null;
    data.sets[i] = { ...data.sets[i], ...patch, updatedAt: new Date().toISOString() };
    this._save(data);
    return data.sets[i];
  }

  async deleteSet(setId) {
    const data = this._load();
    data.sets = data.sets.filter(s => s.id !== setId);
    this._save(data);
  }

  async listSharedSetsForStudent(studentId) {
    const data = this._load();
    const student = data.users.find(u => u.uid === studentId);
    if (!student || !student.classCode) return [];
    const cls = data.classes[student.classCode];
    if (!cls) return [];
    return data.sets.filter(s => s.ownerId === cls.teacherId && s.shared === true);
  }

  // ===== Classes =====

  _genClassCode(data) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    } while (data.classes[code]);
    return code;
  }

  async createClass(teacherId, name) {
    const data = this._load();
    const code = this._genClassCode(data);
    data.classes[code] = { teacherId, name, createdAt: new Date().toISOString() };
    this._save(data);
    await this.updateUserProfile(teacherId, { classCode: code });
    return code;
  }

  async getClass(classCode) {
    const data = this._load();
    return data.classes[classCode] || null;
  }

  async joinClass(studentId, classCode) {
    const data = this._load();
    if (!data.classes[classCode]) throw new Error('Invalid class code');
    await this.updateUserProfile(studentId, { classCode });
  }

  async leaveClass(studentId) {
    await this.updateUserProfile(studentId, { classCode: null });
  }

  async getClassMembers(teacherId) {
    const data = this._load();
    const teacher = data.users.find(u => u.uid === teacherId);
    if (!teacher || !teacher.classCode) return [];
    return data.users.filter(u => u.role === 'student' && u.classCode === teacher.classCode);
  }

  // ===== Subscriptions =====

  async getSubscription(userId) {
    const u = await this.getUserProfile(userId);
    return u ? u.subscription : null;
  }

  async startCheckout() {
    throw new Error('Checkout requires FirebaseStore + Stripe');
  }

  // ===== Telemetry =====

  async logEvent(eventName, params = {}) {
    if (typeof console !== 'undefined') {
      console.log('[event]', eventName, params);
    }
  }

  // ===== Migration =====

  async migrateFromLocalStorage() {
    // No-op: LocalStore IS localStorage. Nothing to migrate from.
    return false;
  }
}
