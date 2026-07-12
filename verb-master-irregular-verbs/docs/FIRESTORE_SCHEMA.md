# Firestore Schema

## Collections overview

```
users/{userId}                  — one doc per user (incl. anonymous)
  └── /sessions/{sessionId}     — optional: subcoll of game-play logs

sets/{setId}                    — custom verb sets, owned by a user
  (queried by ownerId)

classes/{classCode}             — teacher → class metadata
  └── /members/{userId}         — student membership records

invitations/{token}             — one-shot invite links (future)

# Indexes
- users (role asc, classCode asc)               — teacher's class roster
- sets  (ownerId asc, updatedAt desc)            — user's sets list
- users/{userId}/sessions (createdAt desc)       — recent activity
```

## `users/{userId}` document

Auto-id = Firebase Auth UID. Created on first sign-in (anonymous or otherwise).

```ts
{
  // Identity
  uid: string,                    // = doc id, redundant but handy
  email: string | null,           // null for anonymous users
  displayName: string,            // user-editable
  photoURL: string | null,
  role: 'student' | 'teacher',    // default 'student'
  isAnonymous: boolean,

  // Subscription
  subscription: {
    tier: 'free' | 'pro' | 'teacher',
    source: 'stripe' | 'apple' | 'google' | 'gift' | null,
    expiresAt: Timestamp | null,
    autoRenew: boolean,
  },

  // Learning state
  studied: string[],              // V1 keys, e.g. ['go','do','see']
  verbStats: {
    [v1: string]: {
      correct: number,
      total: number,
      lastSeen: Timestamp,
      avgResponseMs: number | null,  // for SRS later
    }
  },

  // Game scores
  gameScores: {
    hangman: number,
    speed: number,
    sort: number,
    story: number,
    battle: number,
    weak: number,
  },

  // Aggregate stats
  xp: number,
  level: number,
  gamesPlayed: number,
  totalCorrect: number,
  totalAnswered: number,
  bestStreak: number,
  currentStreakDays: number,      // daily login streak
  lastActiveDay: string,          // YYYY-MM-DD

  // Settings
  settings: {
    tier: 'all' | 'easy' | 'medium' | 'hard',
    sortTimer: number,
    speedTimer: number,
    rate: number,
    voice: string,                // SpeechSynthesisVoice.name
    reverseSpeed: 'on' | 'off',
    uiLanguage: 'en' | 'ru' | 'pl' | ...,
    translationLanguage: 'ru' | 'pl' | ...,
  },

  // Class membership (student) or class code (teacher)
  classCode: string | null,

  // Timestamps
  createdAt: Timestamp,
  lastActive: Timestamp,
}
```

### Notes
- `verbStats` is a map, not a subcollection. We expect <500 verbs ever — well within Firestore's 1MB doc limit.
- `studied` is an array. Arrays max 1M elements, but realistically <500.
- `subscription.expiresAt` is checked server-side via Cloud Function before granting Pro features.

## `sets/{setId}` document

```ts
{
  id: string,
  ownerId: string,                // user uid
  name: string,
  verbs: string[],                // V1 keys
  forms: ('v2' | 'v3')[],
  shared: boolean,                // teacher can mark a set shareable to students
  description: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastPlayedAt: Timestamp | null,
}
```

### Sharing model (teacher → student)
When a teacher marks a set `shared: true`, students in their class see it under "Sets from your teacher" on their dashboard. They can practice but not edit.

## `classes/{classCode}` document

`classCode` is the 6-char code (e.g. `H7K4PM`) — used as the doc id for easy lookup.

```ts
{
  code: string,
  teacherId: string,
  name: string,                   // "Year 7 ESL", etc.
  createdAt: Timestamp,
  studentCount: number,           // denormalised for fast display
}
```

Students linked via `users/{uid}.classCode` field (denormalised). When a teacher pulls their class, they query `users where classCode == X`.

Alternative considered: subcollection `classes/{code}/members/{uid}`. Rejected because (a) the query "all students in class X" is dead simple either way and (b) we'd duplicate progress data into members subdoc.

## `users/{userId}/sessions/{sessionId}` subcollection (optional, for analytics)

```ts
{
  gameType: 'hangman' | 'speed' | 'sort' | 'story' | 'battle',
  score: number,
  duration: number,               // ms
  questionsAsked: number,
  correctCount: number,
  wrongCount: number,
  verbsPracticed: string[],
  fromSet: string | null,
  fromWeak: boolean,
  createdAt: Timestamp,
}
```

Use case: drives analytics + future "session history" UI. Optional — can be derived from Firebase Analytics events too. Decide based on whether we need queryable history in-app.

## Security rules (`firestore.rules`)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== USERS =====
    match /users/{userId} {
      // Read: self + teacher reading their class members
      allow read: if isSelf(userId)
                  || isTeacherOf(userId);

      // Write: self only (no teacher edits student data)
      allow create: if isSelf(userId);
      allow update: if isSelf(userId)
                    && !changingRestrictedFields();
      allow delete: if false;  // we soft-delete via Cloud Function

      // ----- sessions subcollection -----
      match /sessions/{sessionId} {
        allow read, write: if isSelf(userId);
      }
    }

    // ===== SETS =====
    match /sets/{setId} {
      allow read: if resource.data.ownerId == request.auth.uid
                  || resource.data.shared == true
                  && isSameClass(resource.data.ownerId);
      allow create: if request.auth.uid != null
                    && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if resource.data.ownerId == request.auth.uid;
    }

    // ===== CLASSES =====
    match /classes/{code} {
      allow read: if request.auth.uid != null;  // anyone signed-in can read for joining
      allow create: if request.auth.uid != null
                    && request.resource.data.teacherId == request.auth.uid;
      allow update, delete: if resource.data.teacherId == request.auth.uid;
    }

    // ===== HELPERS =====
    function isSelf(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    function isTeacherOf(studentUid) {
      let me = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      let student = get(/databases/$(database)/documents/users/$(studentUid)).data;
      return me.role == 'teacher'
             && student.classCode == me.classCode;
    }

    function isSameClass(ownerUid) {
      let me = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      let owner = get(/databases/$(database)/documents/users/$(ownerUid)).data;
      return me.classCode != null && me.classCode == owner.classCode;
    }

    function changingRestrictedFields() {
      // Prevent self-promotion to teacher/pro
      return request.resource.data.role != resource.data.role
          || request.resource.data.subscription.tier != resource.data.subscription.tier;
    }
  }
}
```

### Migration when going Pro
Subscription state is changed by a Cloud Function with admin SDK (bypasses these rules). Stripe/Apple/Google webhooks trigger the Cloud Function. Clients can never self-upgrade.

## Indexes (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "classCode", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "sets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "sets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shared", "order": "ASCENDING" },
        { "fieldPath": "ownerId", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Migration from current localStorage MVP

When a user signs in for the first time after we ship Firebase:
1. Check `localStorage.verbmaster_data` for their offline account
2. If found → "We found local progress, do you want to keep it?"
3. If yes → upload to Firestore as their now-authenticated profile
4. If no → fresh start
5. Wipe localStorage either way (use IndexedDB for offline cache going forward via Firebase's built-in offline persistence)

Migration runs once per device per user. Tracked via `users/{uid}.migratedFromLocal: true`.

## Cost projection

Firebase pricing relevant pieces (Spark = free tier):
- **Auth:** 50k MAU free → covers us until viral success
- **Firestore:** 50k reads/day, 20k writes/day, 1GB storage free
- **Hosting:** 10GB storage, 360MB/day transfer free

Per active user per day estimate:
- Reads: ~30 (load profile, sets list, leaderboard?, game launches)
- Writes: ~15 (verb stats, game scores, session logs)

→ Free tier handles ~1500 daily-active users comfortably. Plenty of runway before paying.

Blaze (pay-as-you-go) costs after free tier: cents per 100k operations. Even at 10k DAU, monthly cost ~$5-15. Not a constraint.
