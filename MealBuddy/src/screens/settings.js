import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { signUp, signIn } from '../services/auth_service';
import { db } from '../services/firebase_config';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';

const Settings = () => {
  const [mode, setMode] = useState(null); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSignUp = async () => {
    try {
      const user = await signUp(email, password); // Get user object from signUp()
      console.log('User signed up successfully:', user);

      if (!user || !user.uid) {
        throw new Error('User UID is undefined after sign-up.');
      }

      setMode('profile'); // Move to profile setup
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  const handleSubmitProfile = async () => {
    try {
      const user = await signIn(email, password); // Get user object from signIn()
      console.log('User logged in:', user);
  
      if (!user || !user.uid) {
        throw new Error('User UID is undefined after login.');
      }
  
      // Check if user data already exists before writing
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        // Save user profile information in Firestore only if it doesn’t exist
        await setDoc(userRef, { name, age });
        console.log('User profile saved successfully');
      } else {
        console.log('User profile already exists, skipping write');
      }
  
      setMode(null);
      setEmail('');
      setPassword('');
      setName('');
      setAge('');
    } catch (error) {
      console.error('Error submitting profile:', error.message);
    }
  };
  

  const handleLogIn = async () => {
    try {
      const user = await signIn(email, password); // Get user object from signIn()
      console.log('User logged in:', user);

      if (!user || !user.uid) {
        throw new Error('User UID is undefined after login.');
      }

      // Retrieve user profile
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        const { name, age } = docSnap.data();
        console.log(`Welcome back, ${name} (${age} years old)!`);
      } else {
        console.log('No user profile found.');
      }

      // Reset fields and redirect back to settings
      setMode(null);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {mode === null && (
          <>
            <Button title="Sign Up" onPress={() => setMode('signup')} />
            <View style={styles.spacer} />
            <Button title="Log In" onPress={() => setMode('login')} />
          </>
        )}

        {mode === 'signup' && (
          <>
            <TextInput
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <Button title="Submit" onPress={handleSignUp} />
          </>
        )}

        {mode === 'profile' && (
          <>
            <TextInput
              placeholder="Enter Your Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Enter Your Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button title="Submit Profile" onPress={handleSubmitProfile} />
          </>
        )}

        {mode === 'login' && (
          <>
            <TextInput
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <Button title="Log In" onPress={handleLogIn} />
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  spacer: {
    height: 20,
  },
});

export default Settings;
