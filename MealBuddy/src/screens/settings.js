import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { signUp, signIn } from '../services/auth_service';
import { db, auth } from '../services/firebase_config';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';

const Settings = () => {
  const [mode, setMode] = useState(null); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user profile if logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      }
    };
    fetchUserProfile();
  }, []);

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
      const user = auth.currentUser;

      if (!user || !user.uid) {
        throw new Error('User UID is undefined after login.');
      }

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { name, age });

      console.log('User profile saved successfully');

      // Set profile state to display in settings
      setUserProfile({ name, age });

      // Clear input fields
      setMode(null);
      setEmail('');
      setPassword('');
      setName('');
      setAge('');
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

      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
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
            {/* Show User Profile in Settings */}
            {userProfile ? (
              <View>
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.text}>Name: {userProfile.name}</Text>
                <Text style={styles.text}>Age: {userProfile.age}</Text>
              </View>
            ) : (
              <>
                {/* Show Sign Up / Log In Buttons */}
                {mode === null && (
                  <>
                    <Button title="Sign Up" onPress={() => setMode('signup')} />
                    <View style={styles.spacer} />
                    <Button title="Log In" onPress={() => setMode('login')} />
                  </>
                )}

                {/* Sign Up Form */}
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

                {/* Profile Form After Sign Up */}
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

                {/* Log In Form */}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 5,
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
