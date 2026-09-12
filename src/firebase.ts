// Firebase, lazy and optional. Without EXPO_PUBLIC_FIREBASE_* env the app
// runs local-only (demo mode) and every helper below no-ops to null.
// ponytail: Firestore pairing/sync lands here when a real backend is wired;
// the store API already matches that shape, so no call-site churn then.
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCxBZMs7NGWBLdryN0_Pdi2Znp46waXxKs',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'bizde-app-4291.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'bizde-app-4291',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:987561084486:web:a5b549e259b65ae6c86c47',
};

export function firebaseConfigured(): boolean {
  return Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
}

let app: FirebaseApp | null = null;
let auth: firebaseAuth.Auth | null = null;
let db: Firestore | null = null;

export function getFirebase(): { app: FirebaseApp; auth: firebaseAuth.Auth; db: Firestore } | null {
  if (!firebaseConfigured()) {
    console.warn('[Firebase] Config missing, running local-only');
    return null;
  }
  try {
    if (!app) {
      if (getApps().length === 0) {
        app = initializeApp(FIREBASE_CONFIG);
      } else {
        app = getApps()[0] ?? null;
      }
    }
    if (!app) return null;

    if (!auth) {
      try {
        const getReactNativePersistence = (firebaseAuth as unknown as { getReactNativePersistence?: (storage: unknown) => unknown }).getReactNativePersistence;
        if (typeof getReactNativePersistence === 'function') {
          auth = firebaseAuth.initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage) as unknown as firebaseAuth.Persistence,
          });
        } else {
          auth = firebaseAuth.getAuth(app);
        }
      } catch {
        auth = firebaseAuth.getAuth(app);
      }
    }

    if (!db) {
      db = getFirestore(app);
    }

    return { app, auth, db };
  } catch (err) {
    console.error('[Firebase] Init error:', err);
    return null;
  }
}

/** Anonymous sign-in; null when unconfigured or on failure (caller falls back local). */
export async function signInAnon(): Promise<string | null> {
  const fb = getFirebase();
  if (!fb) return null;
  try {
    if (fb.auth.currentUser) {
      return fb.auth.currentUser.uid;
    }
    const cred = await firebaseAuth.signInAnonymously(fb.auth);
    console.log('[Firebase] Signed in anonymously:', cred.user.uid);
    return cred.user.uid;
  } catch (err) {
    console.error('[Firebase] signInAnon failed:', err);
    return null;
  }
}

export function getFirebaseDebugStatus(): { configured: boolean; projectId: string; hasUser: boolean } {
  return {
    configured: firebaseConfigured(),
    projectId: FIREBASE_CONFIG.projectId,
    hasUser: Boolean(auth?.currentUser?.uid),
  };
}
