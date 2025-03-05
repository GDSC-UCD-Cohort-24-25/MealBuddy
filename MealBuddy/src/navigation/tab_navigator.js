import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, Button, Text, Alert, Keyboard, 
  TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, StyleSheet 
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
import Chatbot from '../screens/chat_bot';
import Profile from '../screens/profile';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { Picker } from '@react-native-picker/picker'; 
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-paper';
import { forgotPassword } from '../services/auth_service';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


const AuthScreen = ({ navigation }) => {
  const [mode, setMode] = useState(null); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);

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

  const resetInputs = () => {
    setEmail('');
    setPassword('');
    setError('');
  };


  const validateSignUp = () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format. Please check your email.');
      return false;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return false;
    }
    if (password.length < 7 || password.length > 32) {
      setError('The password must be 7 to 32 characters long.');
      return false;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d|.*[^A-Za-z\d]).{7,32}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain a mix of letters, numbers, and/or special characters.');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setError('');
    if (!validateSignUp()) return;
    setLoading(true);
    setMode('profile');
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Input Required', 'Please enter your email address first.');
      return;
    }
    try {
      const message = await forgotPassword(email);
      Alert.alert('Success', message);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  const handleSubmitProfile = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Now, proceed to sign-up process after profile submission
      const user = await signUp(email, password); // Sign-up at this point
      
      if (!user || !user.uid) {
        throw new Error('User UID is undefined after sign-up.');
      }
  
      navigation.replace('MainTabs');
  
      // Save user profile details after successful sign-up
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, { name, age, gender, weight, height });
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
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format. Please check your email.');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }

    try {
      const user = await signIn(email, password);
      if (!user || !user.uid) throw new Error('Incorrect email or password.');

      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Profile Not Found', 'No user profile found.');
      }
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Incorrect email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: '#f3fefb', justifyContent: 'center', padding: 20 }}>
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
                      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, left: 10 }}>
                        Welcome to MealBuddy!
                      </Text>
                    {/* Blue Box Sign Up Button */}
                    <TouchableOpacity onPress={() => { setMode('signup'); resetInputs(); }} style={styles.authButton}>
                      <Text style={styles.authButtonText}>Sign Up</Text>
                    </TouchableOpacity>

                    {/* Blue Box Log In Button */}
                    <TouchableOpacity onPress={() => { setMode('login'); resetInputs(); }} style={styles.authButtonSecondary}>
                      <Text style={styles.authButtonText}>Log In</Text>
                    </TouchableOpacity>

                  </>
                )}

                {mode === 'signup' && (
                  <>

                  {/* Member Sign Up Title */}
                    <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                      Member Sign Up
                    </Text>

                    {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                   {/* Email Input Box */}
                  <TextInput
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={{
                      borderWidth: 1, // Add border
                      borderColor: '#ccc', // Border color
                      borderRadius: 8, // Rounded corners
                      padding: 10, // Padding inside the box
                      marginBottom: 10, // Space between inputs
                    }}
                  />
                     {/* Password Input Box */}
                    <View style={{ position: 'relative' }}>
                      <TextInput
                        placeholder="Enter Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                        style={{
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 10,
                        }}
                      />
                      
                      {/* Toggle Visibility Button (Eye Icon) */}
                      <TouchableOpacity 
                        onPress={() => setPasswordVisible(!passwordVisible)} 
                        style={{ position: 'absolute', right: 10, top: 10 }}
                      >
                        <Ionicons 
                          name={passwordVisible ? 'eye-off' : 'eye'} 
                          size={24} 
                          color="#000" 
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Blue Box Sign Up Button */}
                      <TouchableOpacity
                        onPress={handleSignUp}
                        style={{
                         // borderWidth: 2,
                          //borderColor: 'Colors.primary', // Blue border color
                          backgroundColor: '#24a0ed', // Transparent background
                          paddingVertical: 15,
                          paddingHorizontal: 40,
                          borderRadius: 10, // Rounded corners (optional)
                          alignItems: 'center',
                          marginBottom: 20,
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                          Sign Up
                        </Text>
                      </TouchableOpacity>
                    {/* Back to Sign Up Link */}
                    <TouchableOpacity onPress={() => {setMode('login'); resetInputs();}}>
                    <Text style={{ color: Colors.primary, textAlign: 'center', marginTop: 10 }}>Already have an account? Log In</Text>
                    </TouchableOpacity>
                      
                    </>
                  )}

                {mode === 'profile' && (
                  <>
                    {/* Background Information Title */}
                      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                        Background Information
                      </Text>
                    {/* Error Message */}
                    {error ? (
                      <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
                        {error}
                      </Text>
                    ) : null}

                    {/* Name Input */}
                    <TextInput
                      placeholder="Enter Your Name"
                      value={name}
                      onChangeText={setName}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 15,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        fontSize: 16,
                      }}
                    />

                    {/* Age Input */}
                    <TextInput
                      placeholder="Enter Your Age"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        fontSize: 16,
                      }}
                    />

                      {/* Gender Input */}
                    <TextInput
                      placeholder="Enter Your Gender"
                      value={gender}
                      onChangeText={setGender}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 15,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        fontSize: 16,
                      }}
                    />

                    {/* Height Input */}
                    <TextInput
                      placeholder="Enter Your Height (in Feet)"
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="default" 
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        fontSize: 16,
                      }}
                    />

                    {/* Weight Input */}
                    <TextInput
                      placeholder="Enter Your Weight (in Pounds)"
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        fontSize: 16,
                      }}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={handleSubmitProfile}
                      disabled={loading} // Disable button when loading
                      style={{
                        backgroundColor: '#24a0ed', // Transparent background
                        paddingVertical: 15,
                        paddingHorizontal: 40,
                        borderRadius: 10, // Rounded corners (optional)
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Submit Profile</Text>
                      )}
                    </TouchableOpacity>

                    {/* Optional: Back Button */}
                    <TouchableOpacity
                      onPress={() => setMode('signup')}
                      style={{ marginTop: 20, alignItems: 'center' }}
                    >
                      <Text style={{ color: Colors.primary }}>Back to Sign Up</Text>
                    </TouchableOpacity>

                  </>
                )}
                
                {mode === 'login' && (
                  <>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                    Member Log In
                  </Text>

                    {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                   {/* Email Input Box */}
                  <TextInput
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={{
                      borderWidth: 1, // Add border
                      borderColor: '#ccc', // Border color
                      borderRadius: 8, // Rounded corners
                      padding: 10, // Padding inside the box
                      marginBottom: 10, // Space between inputs
                    }}
                  />
                  
                  {/* Password Input Box */}
                  <TextInput
                    placeholder="Enter Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                    style={{
                      borderWidth: 1, // Add border
                      borderColor: '#ccc', // Border color
                      borderRadius: 8, // Rounded corners
                      padding: 10, // Padding inside the box
                      marginBottom: 10, // Space between inputs
                    }}
                  />
                  
                  {/* Toggle Visibility Button (Eye Icon) */}
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                      <Ionicons 
                        name={passwordVisible ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#000" 
                        style={{ position: 'absolute', right: 10, top: -40 }} // Positioning the eye icon inside the text input box
                      />
                    </TouchableOpacity>


                     {/* Forgot Password Link */}
                    <TouchableOpacity onPress={async () => {await handleForgotPassword()}}>
                      <Text style={{ color: Colors.primary, textAlign: 'left', marginBottom: 10 }}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>

                    {/* Blue Box Log In Button */}
                    <TouchableOpacity
                      onPress={handleLogIn}
                      style={{
                        backgroundColor: '#24a0ed', // Blue background color
                        paddingVertical: 15,
                        paddingHorizontal: 40,
                        borderRadius: 10, // Rounded corners (optional)
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                        Log In
                      </Text>
                    </TouchableOpacity>
                     {/* Back to Sign Up Link */}
                    <TouchableOpacity onPress={() => {setMode('signup'); resetInputs();}}>
                    <Text style={{ color: Colors.primary, textAlign: 'center', marginTop: 10 }}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
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
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = 'home-outline';
        else if (route.name === 'Your Fridge') iconName = 'basket-outline';
        else if (route.name === 'Add') iconName = 'add-circle-outline';
        else if (route.name === 'Chatbot') iconName = 'chatbubble-ellipses-outline';
        else if (route.name === 'Profile') iconName = 'person-outline';

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.tabBarActive,
      tabBarInactiveTintColor: Colors.tabBarInactive,
    })}
  >
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Your Fridge" component={YourFridge} />
    <Tab.Screen name="Add" component={AddIngredients} />
    <Tab.Screen name="Chatbot" component={Chatbot} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  authButton: {
    backgroundColor: '#24a0ed',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: "40%",
    left: 120,
  },
  authButtonSecondary: {
    backgroundColor: '#24a0ed',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: "40%",
    left: 120,
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  </NavigationContainer>
);
