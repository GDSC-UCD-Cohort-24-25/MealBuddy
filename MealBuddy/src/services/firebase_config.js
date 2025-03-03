import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // Import expo-constants

// Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig.extra.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig.extra.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig.extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig.extra.FIREBASE_APP_ID,
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