import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase app
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };

console.log('Firebase Initialized:', app);
console.log('Active Apps:', getApps());
console.log('Firestore Initialized:', db);

// Enhanced error suppression: Combine all arguments into one string and check for specific error messages.
const originalConsoleError = console.error;
console.error = (...args) => {
  const combinedMessage = args
    .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
    .join(' ');
  // Suppress Firestore permission-denied errors in snapshot listeners
  if (
    combinedMessage.includes('[code=permission-denied]: Missing or insufficient permissions')
  ) {
    return;
  }
  
  // Also suppress common auth errors.
  if (
    args.some(arg =>
      typeof arg === 'string' &&
      (
        arg.includes('auth/invalid-credential') ||
        arg.includes('auth/user-not-found') ||
        arg.includes('auth/wrong-password')
      )
    )
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Use LogBox to ignore the specific Firestore permission-denied error log.
LogBox.ignoreLogs([
  /permission-denied.*Missing or insufficient permissions/
]);
