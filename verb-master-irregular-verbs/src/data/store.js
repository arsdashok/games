/**
 * DataStore — abstract data layer interface.
 *
 * The whole app talks to ONE of these. Two concrete implementations:
 *   - LocalStore (localStorage; offline, dev, anonymous-only)
 *   - FirebaseStore (Firestore + Firebase Auth; production)
 *
 * Method signatures and shapes are the contract. Both implementations
 * must conform exactly. Games and UI never touch storage directly.
 *
 * @typedef {Object} UserProfile
 * @property {string} uid
 * @property {string|null} email
 * @property {string} displayName
 * @property {string|null} photoURL
 * @property {'student'|'teacher'} role
 * @property {boolean} isAnonymous
 * @property {Subscription} subscription
 * @property {string[]} studied
 * @property {Object<string, VerbStat>} verbStats
 * @property {GameScores} gameScores
 * @property {number} xp
 * @property {number} level
 * @property {number} gamesPlayed
 * @property {number} totalCorrect
 * @property {number} totalAnswered
 * @property {number} bestStreak
 * @property {Settings} settings
 * @property {string|null} classCode
 * @property {string} createdAt          ISO timestamp
 * @property {string} lastActive         ISO timestamp
 *
 * @typedef {Object} Subscription
 * @property {'free'|'pro'|'teacher'} tier
 * @property {'stripe'|'apple'|'google'|'gift'|null} source
 * @property {string|null} expiresAt
 * @property {boolean} autoRenew
 *
 * @typedef {Object} VerbStat
 * @property {number} correct
 * @property {number} total
 * @property {string} lastSeen           ISO timestamp
 * @property {number|null} avgResponseMs
 *
 * @typedef {Object} GameScores
 * @property {number} hangman
 * @property {number} speed
 * @property {number} sort
 * @property {number} story
 * @property {number} battle
 * @property {number} weak
 *
 * @typedef {Object} Settings
 * @property {'all'|'easy'|'medium'|'hard'} tier
 * @property {number} sortTimer
 * @property {number} speedTimer
 * @property {number} rate
 * @property {string} voice
 * @property {'on'|'off'} reverseSpeed
 * @property {string} uiLanguage
 *
 * @typedef {Object} VerbSet
 * @property {string} id
 * @property {string} ownerId
 * @property {string} name
 * @property {string[]} verbs
 * @property {Array<'v2'|'v3'>} forms
 * @property {boolean} shared
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} lastPlayedAt
 */

export class DataStore {

  // ===== Lifecycle =====

  /** Called once at app boot. Set up SDKs, restore session if any. */
  async init() { throw _notImpl('init'); }

  // ===== Auth =====

  /** Begin an anonymous session. Resolves with the user uid. */
  async signInAnonymously() { throw _notImpl('signInAnonymously'); }

  /**
   * @param {{email:string, password:string, displayName?:string, role?:'student'|'teacher'}} args
   */
  async signUp(args) { throw _notImpl('signUp'); }

  /** @param {{email:string, password:string}} args */
  async signIn(args) { throw _notImpl('signIn'); }

  /** OAuth — only meaningful in FirebaseStore. LocalStore can throw. */
  async signInWithGoogle() { throw _notImpl('signInWithGoogle'); }
  async signInWithApple() { throw _notImpl('signInWithApple'); }

  async signOut() { throw _notImpl('signOut'); }

  /**
   * Promote anonymous user to a real identity, preserving data.
   * @param {'email'|'google'|'apple'} method
   * @param {Object} credentials
   */
  async linkAnonymousAccount(method, credentials) { throw _notImpl('linkAnonymousAccount'); }

  /**
   * Subscribe to auth state changes.
   * @param {(user:UserProfile|null) => void} callback
   * @returns {() => void} unsubscribe fn
   */
  onAuthChange(callback) { throw _notImpl('onAuthChange'); }

  /** Synchronously read currently signed-in user, if any. */
  getCurrentUser() { throw _notImpl('getCurrentUser'); }

  // ===== User profile =====

  /** @returns {Promise<UserProfile|null>} */
  async getUserProfile(userId) { throw _notImpl('getUserProfile'); }

  /** @param {Partial<UserProfile>} patch */
  async updateUserProfile(userId, patch) { throw _notImpl('updateUserProfile'); }

  // ===== Studied verbs =====

  async markVerbStudied(userId, verbV1) { throw _notImpl('markVerbStudied'); }
  async unmarkVerbStudied(userId, verbV1) { throw _notImpl('unmarkVerbStudied'); }
  async getStudiedVerbs(userId) { throw _notImpl('getStudiedVerbs'); }

  // ===== Verb statistics =====

  /** Record a single attempt; bumps the verbStats[v1] doc + global totals. */
  async recordVerbAttempt(userId, verbV1, correct, options = {}) {
    throw _notImpl('recordVerbAttempt');
  }

  async getVerbStats(userId) { throw _notImpl('getVerbStats'); }

  // ===== Game scores =====

  /**
   * Save best score for a game type. Only writes if better than existing.
   * @param {'hangman'|'speed'|'sort'|'story'|'battle'|'weak'} gameType
   */
  async saveGameScore(userId, gameType, score, details = {}) {
    throw _notImpl('saveGameScore');
  }

  async getGameScores(userId) { throw _notImpl('getGameScores'); }

  // ===== Settings =====

  async getSettings(userId) { throw _notImpl('getSettings'); }
  async saveSettings(userId, settings) { throw _notImpl('saveSettings'); }

  // ===== Custom sets =====

  async listSets(userId) { throw _notImpl('listSets'); }
  async getSet(setId) { throw _notImpl('getSet'); }
  async createSet(userId, { name, verbs, forms, description = null }) {
    throw _notImpl('createSet');
  }
  async updateSet(setId, patch) { throw _notImpl('updateSet'); }
  async deleteSet(setId) { throw _notImpl('deleteSet'); }

  /** Sets owned by the current user's teacher and shared with the class. */
  async listSharedSetsForStudent(studentId) { throw _notImpl('listSharedSetsForStudent'); }

  // ===== Classes (teacher functionality) =====

  /** Generates a 6-char code. Stored on user.classCode. */
  async createClass(teacherId, name) { throw _notImpl('createClass'); }

  async getClass(classCode) { throw _notImpl('getClass'); }

  async joinClass(studentId, classCode) { throw _notImpl('joinClass'); }

  async leaveClass(studentId) { throw _notImpl('leaveClass'); }

  /** Returns array of student UserProfiles in teacher's class. */
  async getClassMembers(teacherId) { throw _notImpl('getClassMembers'); }

  // ===== Subscriptions =====

  /**
   * Read current subscription tier — never trust this client-side for gating.
   * Server (Cloud Function) is source of truth via webhook updates.
   */
  async getSubscription(userId) { throw _notImpl('getSubscription'); }

  /** Initiate Stripe Checkout / IAP. Returns a checkout URL or product handle. */
  async startCheckout(userId, priceId, returnUrl) { throw _notImpl('startCheckout'); }

  // ===== Telemetry =====

  /**
   * Lightweight event log — goes to Firebase Analytics in prod,
   * console in dev.
   * @param {string} eventName
   * @param {Object} params
   */
  async logEvent(eventName, params = {}) { throw _notImpl('logEvent'); }

  // ===== Migration helper =====

  /**
   * One-time: if localStorage has an old MVP user document,
   * upload to Firestore and link to newly-signed-in account.
   */
  async migrateFromLocalStorage(userId) { throw _notImpl('migrateFromLocalStorage'); }
}

function _notImpl(method) {
  return new Error(`DataStore.${method}() not implemented in this backend`);
}

// ===============================================
// Singleton accessor
// ===============================================

/** @type {DataStore|null} */
let _store = null;

export function setStore(s) {
  if (!(s instanceof DataStore)) {
    throw new Error('setStore: must pass a DataStore subclass instance');
  }
  _store = s;
}

export function getStore() {
  if (!_store) throw new Error('Store not initialised — call setStore() first');
  return _store;
}
