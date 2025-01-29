import { auth } from './firebase_config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Sign Up Function
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up successfully:', userCredential.user);
    return userCredential.user; // Return the authenticated user
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
};

// Sign In Function
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in successfully:', userCredential.user);
    return userCredential.user; // Return the authenticated user
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};
