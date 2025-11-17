import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDdeE6-XAyeJ7Xat-rY8ExZIJCjPXQ_F2o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zuber-54737.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "zuber-54737",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zuber-54737.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "709923856765",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:709923856765:web:ab8d1f184a68630e282c14",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);