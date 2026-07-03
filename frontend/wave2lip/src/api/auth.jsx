import {
  auth,
  googleProvider,
} from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// import { BACKEND_URL } from "./client";
const BACKEND_URL = "http://localhost:8000";
// BACKEND_URL = "http://localhost:8000"
// ------------------------------------
// EMAIL SIGNUP
// ------------------------------------
export async function signupWithEmail(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}


// ------------------------------------
// EMAIL LOGIN
// ------------------------------------
export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}


// ------------------------------------
// GOOGLE LOGIN
// ------------------------------------
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}


// ------------------------------------
// GOOGLE SIGNUP (creates Supabase entry)
// ------------------------------------
export async function googleSignup() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const token = await user.getIdToken(true);

  // Verify user and insert to Supabase `users` table
  await fetch(`${BACKEND_URL}/auth/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { user, token };
}


// ------------------------------------
// LOGOUT
// ------------------------------------
export async function logoutUser() {
  return await signOut(auth);
}
