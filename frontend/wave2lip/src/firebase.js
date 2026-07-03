// src/firebase.js

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from "firebase/auth";

// ❗ DO NOT use firebase.analytics in development with Vite.
// It breaks local dev due to service worker / HTTPS requirements.
// So analytics is removed. (Safe and recommended)

const firebaseConfig = {
  apiKey: "AIzaSyAt2FpPL-NhcQDLZxF3pHqoym7c1BvyLiw",
  authDomain: "wave-motion-e2512.firebaseapp.com",
  projectId: "wave-motion-e2512",
  storageBucket: "wave-motion-e2512.firebasestorage.app",  // FIXED!
  messagingSenderId: "210124694412",
  appId: "1:210124694412:web:44b1d8ed2ed014a7e62ca9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Email/Password Auth Helpers
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};
