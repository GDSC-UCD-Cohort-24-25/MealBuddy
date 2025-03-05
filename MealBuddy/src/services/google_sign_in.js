import React, { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase_config';

// Import env variables
import { EXPO_CLIENT_ID, IOS_CLIENT_ID, ANDROID_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = () => {
    const [loading, setLoading] = useState(false);
  
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: IOS_CLIENT_ID,
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }), 
        scopes: ['profile', 'email'],
      });
      
  
    const signIn = async () => {
      setLoading(true);
      try {
        const result = await promptAsync();
        if (result.type === 'success') {
          const { id_token } = result.params;
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          setLoading(false);
          return userCredential.user;
        } else {
          throw new Error('Google Sign-In was cancelled or failed.');
        }
      } catch (error) {
        setLoading(false);
        console.error('Google Sign-In Error:', error);
        throw error;
      }
    };
  
    return { signIn, loading, request, response };
  };