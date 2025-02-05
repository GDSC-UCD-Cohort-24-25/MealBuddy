import { auth } from './firebase_config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Sign Up Function with Validation
export const signUp = async (email, password) => {
  try {
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up successfully:', userCredential.user);
    return userCredential.user;
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
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};
