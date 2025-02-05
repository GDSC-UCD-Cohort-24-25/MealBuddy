import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { signUp, signIn } from '../services/auth_service';
import { db } from '../services/firebase_config';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const navigation = useNavigation();
  const [mode, setMode] = useState(null); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      const user = await signUp(email, password);
      
      if (!user || !user.uid) {
        throw new Error('User UID is undefined after sign-up.');
      }

      setMode('profile'); // Move to profile setup
    } catch (error) {
      setError(error.message);
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    try {
      setError('');
      setLoading(true);
      const user = await signIn(email, password);

      if (!user || !user.uid) {
        throw new Error('User UID is undefined after login.');
      }

      // Save user profile information in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { name, age });

      console.log('User profile saved successfully');

      setMode(null);
      setEmail('');
      setPassword('');
      setName('');
      setAge('');

      // Navigate to Profile Screen
      navigation.navigate('ProfileScreen');
    } catch (error) {
      setError(error.message);
      Alert.alert('Profile Submission Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogIn = async () => {
    try {
      setError('');
      setLoading(true);
      const user = await signIn(email, password);

      if (!user || !user.uid) {
        throw new Error('User UID is undefined after login.');
      }

      // Retrieve user profile
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        const { name, age } = docSnap.data();
        Alert.alert(`Welcome back, ${name} (${age} years old)!`);
        navigation.navigate('ProfileScreen');
      } else {
        Alert.alert('Profile Not Found', 'No user profile found.');
      }

      setMode(null);
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error.message);
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
            {mode === null && (
              <>
                <Button title="Sign Up" onPress={() => setMode('signup')} />
                <View style={styles.spacer} />
                <Button title="Log In" onPress={() => setMode('login')} />
              </>
            )}

            {mode === 'signup' && (
              <>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  spacer: {
    height: 20,
  },
});

export default Settings;
