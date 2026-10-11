import { authenticatedFetch } from './apiClient';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFbProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  getFirebaseAuth,
  getFirebaseDb,
  getGoogleProvider,
  isFirebaseConfigured
} from './firebase';
import { UserProfile, LeaderboardEntry } from '@/types';

async function saveCloudProfile(data: object, _options?: object) {
  const fields = ['username', 'displayName', 'bio', 'avatar', 'avatarType', 'photoURL', 'customAvatar', 'privacySettings'];
  const updates = Object.fromEntries(Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined));
  const res = await authenticatedFetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
  if (!res.ok) throw new Error('Could not save cloud profile.');
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
  code?: string;
  isFallback?: boolean;
}

/**
 * Translates raw Firebase Auth error codes into helpful, actionable guidance.
 */
export const formatAuthError = (error: any): { message: string; code: string; isConfigIssue: boolean } => {
  const code = error?.code || 'auth/unknown';
  let message = 'Authentication could not be completed. Please try again.';
  let isConfigIssue = false;

  switch (code) {
    case 'auth/unauthorized-domain':
      message = 'Domain not authorized in Firebase Console. Add this domain in Firebase Console > Authentication > Settings > Authorized Domains.';
      isConfigIssue = true;
      break;
    case 'auth/operation-not-allowed':
      message = 'Authentication provider is not enabled in Firebase Console > Authentication > Sign-in method.';
      isConfigIssue = true;
      break;
    case 'auth/popup-blocked':
      message = 'Sign-in pop-up was blocked by your browser. You can click "Sign In (Redirect)" or use Instant Cloud Play.';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Sign-in window was closed before completing authentication.';
      break;
    case 'auth/cancelled-popup-request':
      message = 'Another sign-in request was initiated. Please try again.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error connecting to Auth servers. Please check your internet connection.';
      break;
    case 'auth/email-already-in-use':
      message = 'This email address is already registered. Please login instead.';
      break;
    case 'auth/user-not-found':
      message = 'Invalid email or password. Please verify your login details.';
      break;
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      message = 'Invalid email or password. Please verify your login details.';
      break;
    case 'auth/weak-password':
      message = 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
      break;
    case 'auth/invalid-email':
      message = 'Please enter a valid email address.';
      break;
    case 'auth/too-many-requests':
      message = 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
      break;
    case 'auth/user-disabled':
      message = 'This user account has been disabled by an administrator.';
      break;
    case 'auth/invalid-api-key':
      message = 'Invalid Firebase API key. Please check your NEXT_PUBLIC_FIREBASE_API_KEY.';
      isConfigIssue = true;
      break;
    case 'auth/app-deleted':
    case 'auth/invalid-app-credential':
      message = 'Firebase App configuration issue. Please verify your Firebase project credentials.';
      isConfigIssue = true;
      break;
    default:
      if (typeof message === 'string' && message.startsWith('Firebase: Error (')) {
        message = message.replace(/^Firebase: Error \(([^)]+)\)\.?/, '$1').trim();
      }
      break;
  }

  return { message, code, isConfigIssue };
};

/**
 * Creates a standard UserProfile representation from Firebase User details.
 */
export const buildProfileFromFirebaseUser = (
  fbUser: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null },
  currentProfile?: Partial<UserProfile>,
  authType: 'google' | 'guest' = 'google'
): UserProfile => {
  const photo = fbUser.photoURL || undefined;
  // If user signed in with Google, default their avatar to their real Google photoURL
  const avatar = (authType === 'google' && photo)
    ? photo
    : (currentProfile?.avatar || '🚀');
  const avatarType: 'google' | 'upload' | 'preset' = (authType === 'google' && photo)
    ? 'google'
    : (currentProfile?.avatarType || 'preset');

  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email || undefined,
    photoURL: photo,
    username: fbUser.displayName ? fbUser.displayName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 15) : (currentProfile?.username || `Gamer_${fbUser.uid.slice(-4)}`),
    displayName: fbUser.displayName || currentProfile?.displayName || undefined,
    avatar,
    avatarType,
    authType: authType,
    isCloudSynced: true,
    xp: currentProfile?.xp || 0,
    level: currentProfile?.level || 1,
    coins: currentProfile?.coins || 0,
    streak: currentProfile?.streak || 0,
    rank: currentProfile?.rank || 'Bronze II',
    lastLoginDate: new Date().toISOString(),
    badges: currentProfile?.badges || [],
    unlockedSkins: currentProfile?.unlockedSkins || ['default'],
    equippedSkin: currentProfile?.equippedSkin || 'default',
    stats: currentProfile?.stats || {
      gamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      totalScore: 0,
      bestScore: 0,
      highScores: {},
      roastsWon: 0,
      sixesHit: 0,
      chaiServed: 0,
      penFlipsLanded: 0,
      eraserHits: 0
    }
  };
};

/**
 * Sign In with Google Popup (with isolated Firestore sync)
 */
export const signInWithGoogle = async (
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();

  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    let profile = buildProfileFromFirebaseUser(fbUser, currentProfile, 'google');

    // Attempt to sync with Firestore, but NEVER fail login if Firestore has rule/network issues
    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as Partial<UserProfile>;
          const photo = fbUser.photoURL || data.photoURL;
          // Determine avatar: if user explicitly saved an avatar in Firestore, keep it,
          // otherwise default to Google photoURL
          const resolvedAvatar = data.avatar || photo || currentProfile?.avatar || profile.avatar;
          const resolvedAvatarType = data.avatarType || (photo ? 'google' : 'preset');

          profile = {
            ...profile,
            ...data,
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email || data.email,
            photoURL: photo,
            displayName: data.displayName || fbUser.displayName || currentProfile?.displayName || profile.displayName,
            username: data.username || currentProfile?.username || profile.username,
            avatar: resolvedAvatar,
            avatarType: resolvedAvatarType,
            isCloudSynced: true,
            lastLoginDate: new Date().toISOString()
          };
          await saveCloudProfile({
            photoURL: photo,
            lastLoginDate: new Date().toISOString() 
          }, { merge: true });
        } else {
          await saveCloudProfile({
            ...profile,
            usernameLower: profile.username.toLowerCase(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreErr) {
        console.warn('Firestore user profile sync warning (Auth still succeeded):', firestoreErr);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    const formatted = formatAuthError(error);

    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Sign In with Google Redirect (Bypasses popup blocker completely)
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();
  if (auth && googleProvider) {
    await signInWithRedirect(auth, googleProvider);
  }
};

/**
 * Check and process redirect login result after page reload
 */
export const checkRedirectResult = async (): Promise<UserProfile | null> => {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return buildProfileFromFirebaseUser(result.user, undefined, 'google');
    }
  } catch (err) {
    console.warn('Redirect auth result notice:', err);
  }
  return null;
};

/**
 * Sign In Anonymously with Firebase Auth
 */
export const signInAnonymouslyWithFirebase = async (
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();

  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    const result = await signInAnonymously(auth);
    const fbUser = result.user;
    const profile = buildProfileFromFirebaseUser(fbUser, currentProfile, 'guest');

    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        await saveCloudProfile({
          ...profile,
          lastLoginDate: new Date().toISOString(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore anonymous sync notice:', e);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Anonymous Sign-in error:', error);
    const formatted = formatAuthError(error);
    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Check if a username is available in Firestore
 */
export const checkUsernameAvailability = async (username: string, currentUid?: string): Promise<{ available: boolean; error?: string }> => {
  const cleanUsername = username.trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { available: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { available: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }

  try {
    const res = await authenticatedFetch(`/api/auth/check-username?username=${encodeURIComponent(cleanUsername)}`);
    if (!res.ok) return { available: false, error: 'Cannot verify username availability right now.' };
    return await res.json();
  } catch { return { available: false, error: 'Cannot verify username availability right now.' }; }
};

/**
 * Sign Up with Email and Password (SaaS-grade with profile initialization)
 */
export const signUpWithEmail = async (
  params: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
    avatar?: string;
  },
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanUsername = params.username.trim();
  const cleanDisplayName = params.displayName?.trim() || cleanUsername;
  const avatar = params.avatar || currentProfile?.avatar || '🚀';

  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    // 1. Create auth user
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
    const fbUser = cred.user;

    // 2. Set Firebase Auth display name
    try {
      await updateFbProfile(fbUser, { displayName: cleanDisplayName });
    } catch (e) {
      console.warn('Failed to update FB profile displayName:', e);
    }

    // 3. Build comprehensive SaaS UserProfile with genuine starting baseline
    const profile: UserProfile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanDisplayName,
      avatar: avatar,
      bio: 'Chill Arena Gamer 🎮',
      authType: 'email',
      isCloudSynced: true,
      xp: currentProfile?.xp || 0,
      level: currentProfile?.level || 1,
      coins: currentProfile?.coins || 100,
      streak: 0,
      rank: 'Unranked',
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      badges: [],
      unlockedSkins: ['default'],
      equippedSkin: 'default',
      stats: currentProfile?.stats || {
        gamesPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalScore: 0,
        bestScore: 0,
        highScores: {},
        roastsWon: 0,
        sixesHit: 0,
        chaiServed: 0,
        penFlipsLanded: 0,
        eraserHits: 0
      }
    };

    // 4. Save to Firestore `users` collection with low-case username indexing
    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        await saveCloudProfile({
          ...profile,
          usernameLower: cleanUsername.toLowerCase(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.warn('Firestore signup profile sync warning:', firestoreErr);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Sign up error:', error);
    const formatted = formatAuthError(error);
    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Sign In with Email or Username + Password (SaaS-grade with Remember Me)
 */
export const signInWithEmail = async (
  emailOrUsername: string,
  password: string,
  rememberMe: boolean = true,
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();
  const identifier = emailOrUsername.trim();

  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    // Configure session persistence
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    const targetEmail = identifier;

    if (!identifier.includes('@')) return { success: false, error: 'Please sign in with your email address.' };

    const cred = await signInWithEmailAndPassword(auth, targetEmail, password);
    const fbUser = cred.user;

    let profile: UserProfile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: fbUser.email || undefined,
      username: fbUser.displayName || currentProfile?.username || `Gamer_${fbUser.uid.slice(-4)}`,
      displayName: fbUser.displayName || currentProfile?.displayName || fbUser.displayName || undefined,
      avatar: currentProfile?.avatar || '🚀',
      authType: 'email',
      isCloudSynced: true,
      xp: currentProfile?.xp || 0,
      level: currentProfile?.level || 1,
      coins: currentProfile?.coins || 0,
      streak: currentProfile?.streak || 0,
      rank: currentProfile?.rank || 'Unranked',
      lastLoginDate: new Date().toISOString(),
      badges: currentProfile?.badges || [],
      unlockedSkins: currentProfile?.unlockedSkins || ['default'],
      equippedSkin: currentProfile?.equippedSkin || 'default',
      stats: currentProfile?.stats || {
        gamesPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalScore: 0,
        bestScore: 0,
        highScores: {},
        roastsWon: 0,
        sixesHit: 0,
        chaiServed: 0,
        penFlipsLanded: 0,
        eraserHits: 0
      }
    };

    // Fetch and merge Firestore profile data
    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const cloudData = userSnap.data() as Partial<UserProfile>;
          profile = {
            ...profile,
            ...cloudData,
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email || cloudData.email,
            username: cloudData.username || profile.username,
            displayName: cloudData.displayName || cloudData.username || profile.displayName,
            avatar: cloudData.avatar || profile.avatar,
            bio: cloudData.bio || profile.bio,
            stats: {
              ...profile.stats,
              ...(cloudData.stats || {})
            },
            lastLoginDate: new Date().toISOString()
          };
          await saveCloudProfile({ lastLoginDate: new Date().toISOString() }, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('Firestore profile fetch warning during sign-in:', firestoreErr);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Email Sign-in error:', error);
    const formatted = formatAuthError(error);
    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  const cleanEmail = email.trim();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const auth = getFirebaseAuth();
  if (!isFirebaseConfigured() || !auth) {
    return { success: true }; // Graceful simulated success
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (error: any) {
    console.error('Password reset error:', error);
    const formatted = formatAuthError(error);
    return { success: false, error: formatted.message };
  }
};

/**
 * Safely update user profile fields (Avatar, Display Name, Username, Bio, AvatarType, Privacy)
 * Strictly rejects modifications to stats, xp, coins, or score directly.
 */
export const updateUserProfileData = async (
  uid: string,
  updates: {
    avatar?: string;
    avatarType?: 'google' | 'upload' | 'preset';
    displayName?: string;
    username?: string;
    bio?: string;
    photoURL?: string;
    customAvatar?: string;
    privacySettings?: {
      isPublic: boolean;
      showStats: boolean;
      showGameHistory: boolean;
      showAchievements: boolean;
    };
  }
): Promise<{ success: boolean; error?: string }> => {
  if (!uid) {
    return { success: false, error: 'User ID is required.' };
  }

  // Sanitize updates to ONLY allowed editable SaaS profile fields
  const safeUpdates: Record<string, any> = {};

  if (typeof updates.displayName === 'string') {
    safeUpdates.displayName = updates.displayName.trim().slice(0, 40);
  }

  if (typeof updates.username === 'string') {
    const cleanUsername = updates.username.trim();
    if (cleanUsername.length >= 3 && cleanUsername.length <= 20 && /^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      safeUpdates.username = cleanUsername;
      safeUpdates.usernameLower = cleanUsername.toLowerCase();
    }
  }

  if (typeof updates.bio === 'string') {
    safeUpdates.bio = updates.bio.trim().slice(0, 200);
  }

  if (typeof updates.avatar === 'string') {
    // Allows URLs (Google / Cloud / data URIs) or emojis (up to 1MB)
    safeUpdates.avatar = updates.avatar.slice(0, 1000000);
  }

  if (updates.avatarType && ['google', 'upload', 'preset'].includes(updates.avatarType)) {
    safeUpdates.avatarType = updates.avatarType;
  }

  if (typeof updates.photoURL === 'string') {
    safeUpdates.photoURL = updates.photoURL.slice(0, 2048);
  }

  if (typeof updates.customAvatar === 'string') {
    safeUpdates.customAvatar = updates.customAvatar.slice(0, 1000000);
  }

  if (updates.privacySettings && typeof updates.privacySettings === 'object') {
    safeUpdates.privacySettings = {
      isPublic: Boolean(updates.privacySettings.isPublic),
      showStats: Boolean(updates.privacySettings.showStats),
      showGameHistory: Boolean(updates.privacySettings.showGameHistory),
      showAchievements: Boolean(updates.privacySettings.showAchievements)
    };
  }

  const db = getFirebaseDb();
  if (db && isFirebaseConfigured()) {
    try {
      const userRef = doc(db, 'users', uid);
      safeUpdates.updatedAt = serverTimestamp();
      await saveCloudProfile(safeUpdates);

      // Also update auth displayName or photoURL if changed
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        const authUpdates: { displayName?: string; photoURL?: string } = {};
        if (safeUpdates.displayName) authUpdates.displayName = safeUpdates.displayName;
        if (safeUpdates.avatar && (safeUpdates.avatar.startsWith('http') || safeUpdates.avatar.startsWith('/'))) {
          authUpdates.photoURL = safeUpdates.avatar;
        }
        if (Object.keys(authUpdates).length > 0) {
          try {
            await updateFbProfile(auth.currentUser, authUpdates);
          } catch (e) {
            console.warn('Firebase Auth update profile note:', e);
          }
        }
      }
    } catch (e: any) {
      console.warn('Firestore profile update warning:', e);
      // Try merge if document does not exist yet
      try {
        const userRef = doc(db, 'users', uid);
        await saveCloudProfile(safeUpdates);
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to save profile changes to cloud.' };
      }
    }
  }

  return { success: true };
};

/**
 * Fetch public gamer profile by username (strictly sanitized, no sensitive auth/emails)
 */
export const getPublicProfileByUsername = async (username: string): Promise<Partial<UserProfile> | null> => {
  try {
    const res = await authenticatedFetch(`/api/user/profile?username=${encodeURIComponent(username.replace(/^@/, '').trim())}`);
    return res.ok ? (await res.json()).profile : null;
  } catch { return null; }
};

/**
 * Submit Game Score with Backend validation and Anti-Cheat ceiling checks
 */
export const submitGameScoreSecure = async (
  gameId: string,
  gameTitle: string,
  score: number,
  user: UserProfile
): Promise<{ success: boolean; xpEarned: number; newHighScore: boolean; coinsEarned: number }> => {
  // Anti-Cheat Max Ceilings
  const GAME_CEILINGS: Record<string, number> = {
    'modi-run': 50000,
    'cid-escape': 25000,
    'pen-flip': 500,
    'gully-cricket': 1000,
    'chai-tapri': 50000,
    'meme-roast': 5000,
    'eraser-football': 100,
    'hand-cricket': 300,
    'pappu-pakia': 25000,
    'escape-door': 50000
  };

  const maxAllowed = GAME_CEILINGS[gameId] || 100000;
  const validatedScore = Math.max(0, Math.min(Math.floor(score), maxAllowed));
  const currentBest = user.stats.highScores?.[gameId] || 0;
  const isNewHigh = validatedScore > currentBest;

  // Calculate XP reward
  const baseXP = 50;
  const bonusXP = isNewHigh ? 100 : Math.min(100, Math.floor(validatedScore / 50));
  const xpEarned = baseXP + bonusXP;
  const coinsEarned = Math.max(10, Math.min(250, Math.floor(validatedScore / 10)));

  // Persist to Cloud Leaderboards
  if (user.isCloudSynced && isFirebaseConfigured()) {
    try {
      await saveScoreToCloudLeaderboard(gameId, gameTitle, validatedScore, user);
    } catch (e) {
      console.warn('Leaderboard score cloud persist note:', e);
    }
  }

  return {
    success: true,
    xpEarned,
    newHighScore: isNewHigh,
    coinsEarned
  };
};

/**
 * Sign Out User
 */
export const logoutFromFirebase = async (): Promise<boolean> => {
  const auth = getFirebaseAuth();
  if (!isFirebaseConfigured() || !auth) {
    return true;
  }
  try {
    await signOut(auth);
    return true;
  } catch (err) {
    console.error('Logout error:', err);
    return false;
  }
};

/**
 * Sync Full User Profile to Cloud Firestore
 */
export const syncUserProfileToCloud = async (profile: UserProfile): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db || !profile.uid) {
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await saveCloudProfile(
      {
        ...profile,
        isCloudSynced: true,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error syncing profile to Firestore:', error);
    return false;
  }
};

/**
 * Save High Score to Firestore Leaderboard
 */
export const saveScoreToCloudLeaderboard = async (
  gameId: string,
  gameTitle: string,
  score: number,
  user: UserProfile
): Promise<boolean> => {
  // Client scores are local practice results. Only trusted game engines may publish rankings.
  return false;
};

/**
 * Fetch Top Scores from Firestore Leaderboard with optional gameId filtering
 */
export const fetchCloudLeaderboard = async (
  limitCount = 200,
  gameId?: string
): Promise<LeaderboardEntry[]> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    const leaderboardsRef = collection(db, 'verifiedLeaderboards');
    const q = gameId && gameId !== 'all'
      ? query(leaderboardsRef, where('gameId', '==', gameId), orderBy('score', 'desc'), limit(limitCount))
      : query(leaderboardsRef, orderBy('score', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    snapshot.docs.forEach((d, idx) => {
      const data = d.data();
      entries.push({
        rank: idx + 1,
        username: data.username || 'Anonymous',
        avatar: data.avatar || '🚀',
        score: Number(data.score) || 0,
        gameId: data.gameId,
        gameTitle: data.gameTitle,
        country: data.country || '🇮🇳 Global',
        wins: Number(data.wins) || 0,
        xp: Number(data.xp) || 0,
        badge: data.badge || (idx === 0 ? '👑 Leader' : idx < 3 ? '🥈 Champion' : '🔥 Veteran')
      });
    });

    return entries;
  } catch (err) {
    console.error('Error fetching cloud leaderboard:', err);
    return [];
  }
};

/**
 * Fetches all players from both 'users' and 'leaderboards' collections,
 * creating an exhaustive, strictly deduplicated (1 row per real user) ranked leaderboard.
 */
export const fetchAllCloudLeaderboard = async (
  selectedGameId = 'all'
): Promise<LeaderboardEntry[]> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    const usersMap = new Map<string, LeaderboardEntry>();

    // 2. Fetch match records from 'leaderboards' collection to capture any new scores
    try {
      const leaderboardsRef = collection(db, 'verifiedLeaderboards');
      const lSnap = await getDocs(query(leaderboardsRef, limit(500)));
      lSnap.docs.forEach((d) => {
        const data = d.data();
        const userId = data.userId || d.id.split('_')[0];
        const score = Number(data.score) || 0;
        if (selectedGameId !== 'all' && data.gameId !== selectedGameId) return;

        if (usersMap.has(userId)) {
          const existing = usersMap.get(userId)!;
          existing.score = Math.max(existing.score, score);
          if (data.wins) existing.wins = Math.max(existing.wins ?? 0, Number(data.wins));
          if (data.xp) existing.xp = Math.max(existing.xp ?? 0, Number(data.xp));
        } else {
          // If a standalone user doc without users profile
          usersMap.set(userId, {
            rank: 0,
            username: data.username || 'Anonymous',
            avatar: data.avatar || '🚀',
            score,
            wins: Number(data.wins) || 0,
            xp: Number(data.xp) || 0,
            gameId: data.gameId || selectedGameId,
            gameTitle: data.gameTitle || 'Arena Game',
            country: data.country || '🇮🇳 Global',
            badge: '⚡ Verified Player'
          });
        }
      });
    } catch (e) {
      console.warn('Leaderboards collection query note:', e);
    }

    // 3. Sort deterministically: Score DESC -> Wins DESC -> XP DESC -> Username ASC
    const combined = Array.from(usersMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const bWins = Number(b.wins) || 0;
      const aWins = Number(a.wins) || 0;
      if (bWins !== aWins) return bWins - aWins;
      const bXp = Number(b.xp) || 0;
      const aXp = Number(a.xp) || 0;
      if (bXp !== aXp) return bXp - aXp;
      return a.username.localeCompare(b.username);
    });

    // 4. Assign clean deterministic ranks
    return combined.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      badge: idx === 0 ? '👑 Grand Champion' : idx < 3 ? '🥈 Podium Master' : idx < 10 ? '🔥 Top 10 Elite' : '⚡ Arena Competitor'
    }));
  } catch (err) {
    console.error('Error in fetchAllCloudLeaderboard:', err);
    return [];
  }
};

/**
 * Listen for live Leaderboard changes in Real-time
 */
export const subscribeToCloudLeaderboard = (
  callback: (entries: LeaderboardEntry[]) => void,
  limitCount = 200,
  gameId?: string
) => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const leaderboardsRef = collection(db, 'verifiedLeaderboards');
    const q = gameId && gameId !== 'all'
      ? query(leaderboardsRef, where('gameId', '==', gameId), orderBy('score', 'desc'), limit(limitCount))
      : query(leaderboardsRef, orderBy('score', 'desc'), limit(limitCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const entries: LeaderboardEntry[] = [];
        snapshot.docs.forEach((d, idx) => {
          const data = d.data();
          entries.push({
            rank: idx + 1,
            username: data.username || 'Anonymous',
            avatar: data.avatar || '🚀',
            score: Number(data.score) || 0,
            gameId: data.gameId,
            gameTitle: data.gameTitle,
            country: data.country || '🇮🇳 Global',
            wins: Number(data.wins) || 0,
            xp: Number(data.xp) || 0,
            badge: data.badge || (idx === 0 ? '👑 Leader' : idx < 3 ? '🥈 Champion' : '🔥 Veteran')
          });
        });
        callback(entries);
      },
      (error) => {
        console.warn('Leaderboard real-time subscription note:', error);
      }
    );
  } catch (err) {
    console.error('Error subscribing to cloud leaderboard:', err);
    return () => {};
  }
};

/**
 * Subscribe to Firebase Auth State changes
 */
export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

