import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, Button, Text, Alert, Keyboard, 
  TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, StyleSheet 
} from 'react-native';
import { signUp, signIn } from '../services/auth_service';
import { db, auth } from '../services/firebase_config';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { Picker } from '@react-native-picker/picker'; 

import { forgotPassword } from '../services/auth_service';
import { useGoogleSignIn } from '../services/google_sign_in';
import { Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';
import { Modal } from 'react-native';


const heightOptions = [
  "4'0", "4'1", "4'2", "4'3", "4'4", "4'5", "4'6", "4'7", "4'8",
  "4'10", "4'11", "5'0", "5'1", "5'2", "5'3", "5'4", "5'5",
  "5'6", "5'7", "5'8", "5'9", "5'10", "5'11", "6'0", "6'1", "6'2",
  "6'3", "6'4", "6'5", "6'6", "6'7", "6'8", "6'9", "6'10", "6'11",
  "7'0", "7'1", "7'2", "7'3", "7'4", "7'5", "7'6", "7'7", "7'8",
  "7'9", "7'10", "7'11", "8'0", "8'1", "8'2", "8'3", "8'4", "8'5",
];

const activityOptions = [
  'Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'
];

const dietOptions = [
  'None', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Low Carb', 'High Protein'
];

const genderOptions = ['Male', 'Female'];

const AuthScreen = ({ navigation }) => {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useSharedValue(0);
  const translateY = useSharedValue(50);

  const formOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);

  const [heightPickerVisible, setHeightPickerVisible] = useState(false);
  const [selectedHeight, setSelectedHeight] = useState('');
  const [activityPickerVisible, setActivityPickerVisible] = useState(false);
  const [dietPickerVisible, setDietPickerVisible] = useState(false);
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, []);

  const animateModeChange = (newMode) => {
    formOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setMode)(newMode);
      formTranslateY.value = 20;
      formOpacity.value = withTiming(1, { duration: 300 });
      formTranslateY.value = withTiming(0, { duration: 300 });
    });
  };
  
  

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
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
      batch.set(userRef, { 
        name, 
        age, 
        gender, 
        weight, 
        height,
        activityLevel,
        dietaryPreferences,
        createdAt: new Date()
      });
      await batch.commit();
  
      console.log('User profile saved successfully');
    } catch (error) {
      setError(error.message); // still useful for UI debug or display
      Alert.alert('Sign Up Failed', error.message); // friendly title + clean message
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

  const handleGoogleSignIn = async () => {
    try {
      const user = await googleSignIn();
      if (user && user.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          navigation.replace('MainTabs');
        } else {
          Alert.alert('New Account', 'Please complete your profile.');
          setMode('profile');
        }
      }
    } catch (error) {
      Alert.alert('Google Sign-In Failed', error.message);
    }
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: translateY.value }],
  }));
  
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));
  
  
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[{ flex: 1, backgroundColor: '#e0fae7', justifyContent: 'center', padding: 20 }, animatedStyle]}>
      {/* Height Picker Modal */}
      <Modal visible={heightPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={height}
              onValueChange={(itemValue) => {
                setHeight(itemValue);
              }}
              style={{ backgroundColor: '#fff' }}
              itemStyle={{ color: '#000', fontSize: 18 }}
            >
              {heightOptions.map((option) => (
                <Picker.Item label={option} value={option} key={option} />
              ))}
            </Picker>
            <TouchableOpacity 
              onPress={() => {
                // If no height is selected, default to the first option
                if (!height) {
                  setHeight(heightOptions[0]);
                }
                setHeightPickerVisible(false);
              }} 
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Activity Picker Modal */}
      <Modal visible={activityPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={activityLevel}
              onValueChange={(itemValue) => {
                setActivityLevel(itemValue);
              }}
              style={{ backgroundColor: '#fff' }}
              itemStyle={{ color: '#000', fontSize: 18 }}
            >
              {activityOptions.map((level) => (
                <Picker.Item label={level} value={level} key={level} />
              ))}
            </Picker>
            <TouchableOpacity 
              onPress={() => {
                if (!activityLevel) {
                  setActivityLevel(activityOptions[0]);
                }
                setActivityPickerVisible(false);
              }} 
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Diet Picker Modal */}
      <Modal visible={dietPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={dietaryPreferences}
              onValueChange={(itemValue) => {
                setDietaryPreferences(itemValue);
              }}
              style={{ backgroundColor: '#fff' }}
              itemStyle={{ color: '#000', fontSize: 18 }}
            >
              {dietOptions.map((option) => (
                <Picker.Item label={option} value={option} key={option} />
              ))}
            </Picker>
            <TouchableOpacity 
              onPress={() => {
                if (!dietaryPreferences) {
                  setDietaryPreferences(dietOptions[0]);
                }
                setDietPickerVisible(false);
              }} 
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal visible={genderPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => {
                setGender(itemValue);
              }}
              style={{ backgroundColor: '#fff' }}
              itemStyle={{ color: '#000', fontSize: 18 }}
            >
              {genderOptions.map((option) => (
                <Picker.Item label={option} value={option} key={option} />
              ))}
            </Picker>
            <TouchableOpacity 
              onPress={() => {
                // If no gender is selected, default to the first option
                if (!gender) {
                  setGender(genderOptions[0]);
                }
                setGenderPickerVisible(false);
              }} 
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


        <Image
          source={require('../../images/mealbuddy_icon.png')}
          style={{ width: 100, height: 100, marginBottom: 20, alignSelf: 'center' }}
        />
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
                      <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#5e2bff' }}>
                        Welcome to MealBuddy!
                      </Text>
                      <Text style={{ fontSize: 19, textAlign: 'center', marginBottom: 30, color: '#5e2bff' }}>
                        Your Personal Meal Tracker and Planner 🥗
                      </Text>

                      <Animated.View style={buttonAnimatedStyle}>
                        <TouchableOpacity onPress={() => { animateModeChange('signup'); resetInputs(); }} style={styles.authButton}>
                          <Text style={styles.authButtonText}>Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { animateModeChange('login');; resetInputs(); }} style={styles.authButtonSecondary}>
                          <Text style={styles.authButtonText}>Log In</Text>
                        </TouchableOpacity>
                      </Animated.View>


                    
                    
                  </>
                )}
                <Animated.View style={formAnimatedStyle}>
                  {mode === 'signup' && (
                    <>

                    {/* Member Sign Up Title */}
                      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#5e2bff' }}>
                        Member Sign Up
                      </Text>

                      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                      {/* Email Input Box */}
                      <TextInput
                        placeholder="Enter Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        style={styles.inputBox}
                      />

                      {/* Password Input Box */}
                      <View style={{ position: 'relative' }}>
                      <TextInput
                        placeholder="Enter Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                        style={styles.inputBox}
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
                            backgroundColor: '#5e2bff', // Transparent background
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
                      <TouchableOpacity onPress={() => {animateModeChange('login'); resetInputs();}}>
                      <Text style={{ color: Colors.primary, textAlign: 'center', marginTop: 10, color: '#5e2bff' }}>Already have an account? Log In</Text>
                      </TouchableOpacity>
                        
                      </>
                    )}
                </Animated.View>
                <Animated.View style={formAnimatedStyle}>
                  {mode === 'profile' && (
                    <>
                      {/* Background Information Title */}
                        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#5e2bff' }}>
                          Background Information
                        </Text>
                      {/* Error Message */}
                      {error ? (
                        <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
                          {error}
                        </Text>
                      ) : null}

                      {/* Name Input */}
                      <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Name</Text>
                      <TextInput
                        placeholder="Enter Your Name"
                        placeholderTextColor="#999"
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
                          color: '#000',
                        }}
                      />

                      {/* Age Input */}
                      <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Age</Text>
                      <TextInput
                        placeholder="Enter Your Age"
                        placeholderTextColor="#999"
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
                          color: '#000',
                        }}
                      />

                        {/* Gender Input */}
                      <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Gender</Text>
                      <TouchableOpacity
                        onPress={() => setGenderPickerVisible(true)}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 15,
                          borderColor: '#ddd',
                          borderWidth: 1,
                          fontSize: 16,
                        }}
                      >
                        <Text style={{ 
                          color: gender ? '#000' : '#999',
                          fontSize: 16,
                          fontFamily: 'System' // or your app's default font
                        }}>
                          {gender || 'Select Gender'}
                        </Text>
                      </TouchableOpacity>

                      {/* Height Input with feet/inches format */}
                      <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Height</Text>
                        <TouchableOpacity
                          onPress={() => setHeightPickerVisible(true)}
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            padding: 12,
                            borderColor: '#ddd',
                            borderWidth: 1,
                            fontSize: 16,
                          }}
                        >
                          <Text style={{ 
                            color: height ? '#000' : '#999',
                            fontSize: 16,
                            fontFamily: 'System' // or your app's default font
                          }}>
                            {height || 'Select Height'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Weight Input with lbs */}
                      <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Weight (lbs)</Text>
                        <TextInput
                          placeholder="Enter Your Weight"
                          placeholderTextColor="#999"
                          value={weight}
                          onChangeText={setWeight}
                          keyboardType="numeric"
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            padding: 12,
                            borderColor: '#ddd',
                            borderWidth: 1,
                            fontSize: 16,
                            color: '#000',
                          }}
                        />
                      </View>

                      {/* Activity Level */}
                      <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Activity Level</Text>
                        <TouchableOpacity
                          onPress={() => setActivityPickerVisible(true)}
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            padding: 12,
                            borderColor: '#ddd',
                            borderWidth: 1,
                            fontSize: 16,
                          }}
                        >
                          <Text style={{ 
                            color: activityLevel ? '#000' : '#999',
                            fontSize: 16,
                            fontFamily: 'System' // or your app's default font
                          }}>
                            {activityLevel || 'Select Activity Level'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Dietary Preferences */}
                      <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Dietary Preference</Text>
                        <TouchableOpacity
                          onPress={() => setDietPickerVisible(true)}
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            padding: 12,
                            borderColor: '#ddd',
                            borderWidth: 1,
                            fontSize: 16,
                          }}
                        >
                          <Text style={{ 
                            color: dietaryPreferences ? '#000' : '#999',
                            fontSize: 16,
                            fontFamily: 'System' // or your app's default font
                          }}>
                            {dietaryPreferences || 'Select Dietary Preference'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Submit Button */}
                      <TouchableOpacity
                        onPress={handleSubmitProfile}
                        disabled={loading} // Disable button when loading
                        style={{
                          backgroundColor: '#5e2bff', // Transparent background
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
                        onPress={() => { animateModeChange('signup'); resetInputs(); }}
                        style={{ marginTop: 10, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#5e2bff' }}>Back to Sign Up</Text>
                      </TouchableOpacity>

                    </>
                  )}
                </Animated.View>
                <Animated.View style={formAnimatedStyle}>
                {mode === 'login' && (
                  <>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#5e2bff' }}>
                    Member Log In
                  </Text>

                    {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                   {/* Email Input Box */}
                   <TextInput
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.inputBox}
                  />

                  
                  {/* Password Input Box */}
                  <TextInput
                    placeholder="Enter Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                    style={styles.inputBox}
                  />

                  
                  {/* Toggle Visibility Button (Eye Icon) */}
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                      <Ionicons 
                        name={passwordVisible ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#000" 
                        style={{ position: 'absolute', right: 10, top: -50 }} // Positioning the eye icon inside the text input box
                      />
                    </TouchableOpacity>


                     {/* Forgot Password Link */}
                    <TouchableOpacity onPress={async () => {await handleForgotPassword()}}>
                      <Text style={{ color: '#5e2bff', textAlign: 'left', marginBottom: 10 }}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleLogIn}
                      style={{
                        backgroundColor:'#5e2bff',
                        paddingVertical: 15,
                        paddingHorizontal: 40,
                        borderRadius: 10, 
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                        Log In
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleGoogleSignIn()}
                      style={{
                        backgroundColor: '#4318D1',
                        paddingVertical: 15,
                        paddingHorizontal: 40,
                        borderRadius: 10,
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                        Sign in with Google
                      </Text>
                    </TouchableOpacity>
                    {/* Back to Sign Up Link */}
                    <TouchableOpacity onPress={() => { animateModeChange('signup'); resetInputs(); }}>
                      <Text style={{ color: '#5e2bff', textAlign: 'center', marginTop: 10, color: '#5e2bff' }}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
                                </>
                              )}
                </Animated.View>
              </>
            )}
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  authButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonSecondary: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonText: {
    color: '#5e2bff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  

  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '55%',
    left: 90,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  
  modalButton: {
    backgroundColor: '#5e2bff',
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerStyle: {
    color: '#000',
    fontSize: 16,
  },
  
  inputBox: {
    backgroundColor: '#f8f8f8',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  
  
});

export default AuthScreen;