// Firebase, lazy and optional. Without EXPO_PUBLIC_FIREBASE_* env the app
// runs local-only (demo mode) and every helper below no-ops to null.
// ponytail: Firestore pairing/sync lands here when a real backend is wired;
// the store API already matches that shape, so no call-site churn then.
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function firebaseConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY && process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (!firebaseConfigured()) return null;
  try {
    if (!app) {
      if (getApps().length === 0) {
        app = initializeApp({
          apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
          appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        });
      } else {
        app = getApps()[0] ?? null;
      }
    }
    if (!app) return null;

    if (!auth) {
      try {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch {
        auth = getAuth(app);
      }
    }

    if (!db) {
      db = getFirestore(app);
    }

    return { app, auth, db };
  } catch {
    return null;
  }
}

/** Anonymous sign-in; null when unconfigured or on failure (caller falls back local). */
export async function signInAnon(): Promise<string | null> {
  const fb = getFirebase();
  if (!fb) return null;
  try {
    const cred = await signInAnonymously(fb.auth);
    return cred.user.uid;
  } catch {
    return null;
  }
}
