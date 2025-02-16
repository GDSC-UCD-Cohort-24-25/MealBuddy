import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, Button, Text, Alert, Keyboard, 
  TouchableWithoutFeedback, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signUp, signIn } from '../services/auth_service';
import { db, auth } from '../services/firebase_config';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import styles from '../styles/settings_styles'; // Import styles
import Colors from '../constants/Colors'; // Import theme colors

const Settings = () => {
  const [mode, setMode] = useState(null); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          navigation.replace('ProfileScreen', { name: docSnap.data().name, age: docSnap.data().age });
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

      navigation.replace('ProfileScreen', { name, age });

      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, { name, age });
      await batch.commit();

      console.log('User profile saved successfully');

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
        navigation.replace('ProfileScreen', { name: docSnap.data().name, age: docSnap.data().age });
      } else {
        Alert.alert('Profile Not Found', 'No user profile found.');
      }

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
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            {userProfile ? (
              <View>
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.text}>Name: {userProfile.name}</Text>
                <Text style={styles.text}>Age: {userProfile.age}</Text>
              </View>
            ) : (
              <>
                {mode === null && (
                  <>
                    <View style={styles.button_container}>
                      <Button title="Sign Up" color={Colors.primary} onPress={() => setMode('signup')} />
                    </View>
                    <View style={styles.button_container}>
                      <Button title="Log In" color={Colors.secondary} onPress={() => setMode('login')} />
                    </View>
                  </>
                )}

                {mode === 'signup' && (
                  <>
                    {error ? <Text style={styles.error_text}>{error}</Text> : null}
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
                    <View style={styles.button_container}>
                      <Button title="Submit" color={Colors.primary} onPress={handleSignUp} />
                    </View>
                  </>
                )}

                {mode === 'profile' && (
                  <>
                    {error ? <Text style={styles.error_text}>{error}</Text> : null}
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
                    <View style={styles.button_container}>
                      <Button title="Submit Profile" color={Colors.primary} onPress={handleSubmitProfile} />
                    </View>
                  </>
                )}
                
                {mode === 'login' && (
                  <>
                    {error ? <Text style={styles.error_text}>{error}</Text> : null}
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
                    <View style={styles.button_container}>
                      <Button title="Log In" color={Colors.primary} onPress={handleLogIn} />
                    </View>
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

export default Settings;
