import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useState } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase_config';
import { EXPO_CLIENT_ID, IOS_CLIENT_ID, ANDROID_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = () => {
  const [loading, setLoading] = useState(false);

  const redirectUri = "https://auth.expo.io/@calvinhoang203/mealbuddy"; 

  console.log('EXPO_CLIENT_ID:', EXPO_CLIENT_ID);
  console.log('Redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  const signIn = async () => {
    setLoading(true);
    try {
      const result = await promptAsync({ useProxy: true });
      console.log('Full promptAsync result:', result);  // <-- Add this
      if (result.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        console.log('User signed in successfully:', userCredential.user);
        return userCredential.user;
      } else {
        console.log('Google Sign-In was cancelled or failed.', result);
        throw new Error('Google Sign-In was cancelled or failed.');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  return { signIn, loading, request, response };
};
