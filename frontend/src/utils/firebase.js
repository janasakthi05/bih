import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Check if Firebase is configured (not placeholder values)
const isFirebaseApiKeySet = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your-');
const isFirebaseProjectConfigured = !!(firebaseConfig.projectId && firebaseConfig.authDomain) && !firebaseConfig.projectId.includes('your-') && !firebaseConfig.authDomain.includes('your-');

if (!isFirebaseApiKeySet) {
    console.error('Firebase API key is missing or uses placeholder value. Set REACT_APP_FIREBASE_API_KEY in frontend/.env and restart the dev server.');
}

if (!isFirebaseProjectConfigured) {
    console.warn('Firebase project fields look incomplete. Make sure REACT_APP_FIREBASE_PROJECT_ID and REACT_APP_FIREBASE_AUTH_DOMAIN are set in frontend/.env.');
}

if (isFirebaseApiKeySet && !isFirebaseProjectConfigured) {
    console.error('Firebase API key is present, but project configuration might be incomplete — this can cause `auth/configuration-not-found` errors when using Authentication. Verify project settings and enable desired sign-in providers (e.g., Email/Password) in the Firebase Console.');
}

export { auth, storage, isFirebaseApiKeySet, isFirebaseProjectConfigured };