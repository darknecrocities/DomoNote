import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'domoskills.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'domoskills',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'domoskills.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '773414834493',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:773414834493:web:892e0fb6171aed54333554',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-YR0Z60K8NK',
};

// Initialize Firebase App as singleton safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Safe Analytics initialization (only in supported browser environments)
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported or blocked by adblocker
      analyticsInstance = null;
    });
}

export const getFirebaseAnalytics = () => analyticsInstance;
