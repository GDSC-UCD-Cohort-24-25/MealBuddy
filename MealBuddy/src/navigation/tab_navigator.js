import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, Button, Text, Alert, Keyboard, 
  TouchableWithoutFeedback, ActivityIndicator 
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { signUp, signIn } from '../services/auth_service';
import { db, auth } from '../services/firebase_config';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import Dashboard from '../screens/dashboard';
import YourFridge from '../screens/your_fridge';
import AddIngredients from '../screens/add_ingredients';
import SuggestedRecipes from '../screens/suggested_recipes';
import Profile from '../screens/profile';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthScreen = ({ navigation }) => {
  const [mode, setMode] = useState(null); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          navigation.replace('MainTabs');
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

      navigation.replace('MainTabs');

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
        navigation.replace('MainTabs');
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
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            {userProfile ? (
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome, {userProfile.name}!</Text>
                <Text>Age: {userProfile.age}</Text>
              </View>
            ) : (
              <>
                {mode === null && (
                  <>
                    <View style={{ marginBottom: 10 }}>
                      <Button title="Sign Up" color={Colors.primary} onPress={() => setMode('signup')} />
                    </View>
                    <View style={{ marginBottom: 10 }}>
                      <Button title="Log In" color={Colors.secondary} onPress={() => setMode('login')} />
                    </View>
                  </>
                )}

                {mode === 'signup' && (
                  <>
                    {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                    <TextInput
                      placeholder="Enter Email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <TextInput
                      placeholder="Enter Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <Button title="Submit" color={Colors.primary} onPress={handleSignUp} />
                  </>
                )}

                {mode === 'profile' && (
                  <>
                    {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                    <TextInput
                      placeholder="Enter Your Name"
                      value={name}
                      onChangeText={setName}
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <TextInput
                      placeholder="Enter Your Age"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <Button title="Submit Profile" color={Colors.primary} onPress={handleSubmitProfile} />
                  </>
                )}

                {mode === 'login' && (
                  <>
                    {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                    <TextInput
                      placeholder="Enter Email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <TextInput
                      placeholder="Enter Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <Button title="Log In" color={Colors.primary} onPress={handleLogIn} />
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

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Your Fridge" component={YourFridge} />
    <Tab.Screen name="Add" component={AddIngredients} />
    <Tab.Screen name="Suggested Recipes" component={SuggestedRecipes} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

const TabNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Authentication Screen */}
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
      {/* Main Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default TabNavigator;
