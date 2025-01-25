import firebase from './firebase_config';

// Sign Up Function
export const signUp = async (email, password) => {
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    console.log('User signed up successfully:', userCredential.user);
  } catch (error) {
    console.error('Error signing up:', error.message);
  }
};

// Sign In Function
export const signIn = async (email, password) => {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log('User signed in successfully:', userCredential.user);
  } catch (error) {
    console.error('Error signing in:', error.message);
  }
};
