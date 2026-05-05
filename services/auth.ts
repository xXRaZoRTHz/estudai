import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential,
  } from 'firebase/auth';
  import { auth } from './firebase';
  import { useAuthStore } from '@stores/authStore';
  
  // Observador — corre uma vez no arranque do app
  export function initAuthListener() {
    return onAuthStateChanged(auth, (user) => {
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setLoading(false);
    });
  }
  
  // Registo com e-mail
  export async function registarComEmail(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  }
  
  // Login com e-mail
  export async function loginComEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }
  
  // Logout
  export async function logout() {
    await signOut(auth);
  }