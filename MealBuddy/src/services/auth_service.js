import { auth } from './firebase_config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

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
    if (__DEV__) {
      console.log('User signed up successfully:', userCredential.user);
    }
    return userCredential.user;
  } catch (error) {
    if (__DEV__) {
      console.error('Sign Up Failed:', error.message);
    }
    throw new Error(error.message);
  }
};

// Sign In Function
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (__DEV__) {
      console.log('User signed in successfully:', userCredential.user);
    }
    return userCredential.user;
  } catch (error) {
    let friendlyMessage = error.message;
    // Customize error message for known error codes
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      friendlyMessage = 'Incorrect email or password.';
    }
    // Optionally, conditionally log errors in development only when not one of the suppressed ones
    if (__DEV__ && !(
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    )) {
      console.error('Error signing in:', error.message);
    }
    throw new Error(friendlyMessage);
  }
};

// Forgot Password Function
export const forgotPassword = async (email) => {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    await sendPasswordResetEmail(auth, email);
    return 'A password reset email has been sent.';
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    throw new Error(error.message);
  }
};
