import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions
} from "react-native";
import { db, auth } from "../services/firebase_config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import styles from "../styles/profile_styles";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeOut,
  SlideInUp
} from "react-native-reanimated";
import { calculateBMI, calculateCalorieNeeds, getActivityLevelDescription } from "../utils/health_calculations";

// Interactive animated card with press feedback
const AnimatedCard = ({ index, children }) => {
  const scale = useSharedValue(1);
  
  // Animation for when the card is pressed
  const onPressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 200 });
  };
  
  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  return (
    <Animated.View 
      entering={SlideInUp.delay(index * 200).springify()} 
      style={[styles.card, animatedStyle]}
    >
      <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
        <View>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

// Animated info row component for consistent animations
const AnimatedInfoRow = ({ label, value, delay = 0, color }) => {
  return (
    <Animated.View 
      entering={FadeIn.delay(delay).duration(400)}
      style={styles.infoRow}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[
        styles.infoValue, 
        color ? { color } : null
      ]} numberOfLines={3} ellipsizeMode="tail">
        {value}
      </Text>
    </Animated.View>
  );
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const fetchProfile = () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, "users", auth.currentUser.uid);
      unsubscribeRef.current = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            // Ensure all fields have default values
            setUser({
              ...userData,
              name: userData.name || "User",
              age: userData.age || "N/A",
              gender: userData.gender || "N/A",
              height: userData.height || "N/A",  // Keep as entered (feet)
              weight: userData.weight || "N/A",  // Keep as entered (pounds)
              activityLevel: userData.activityLevel || "moderate",
              dietaryPreferences: userData.dietaryPreferences || "None specified",
              createdAt: userData.createdAt || new Date(),
            });
            setProfileImage(userData.profileImage || null);
          }
          setLoading(false);
        },
        (error) => {
          if (!auth.currentUser || isSigningOut) return;
          console.error("Snapshot listener error:", error.message);
          setLoading(false);
        }
      );
    };

    fetchProfile();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isSigningOut]);

  const handleSignOut = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure that you want to log out?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            if (unsubscribeRef.current) {
              unsubscribeRef.current();
              unsubscribeRef.current = null;
            }
            setIsSigningOut(true);
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: "AuthScreen" }],
              });
            } catch (error) {
              console.error("Error signing out:", error.message);
            }
          },
        },
      ]
    );
  };

  // Calculate BMI and provide a category
  const calculateUserBMI = (user) => {
    if (!user || !user.weight || !user.height) {
      return {
        value: null,
        category: 'N/A',
        color: '#666',
        description: 'Please update your height and weight in your profile',
        recommendation: 'Add your measurements to get personalized recommendations'
      };
    }
    
    try {
      const heightFeet = parseFloat(user.height);
      const weightPounds = parseFloat(user.weight);
      
      if (isNaN(heightFeet) || isNaN(weightPounds) || heightFeet <= 0 || weightPounds <= 0) {
        return {
          value: null,
          category: 'N/A',
          color: '#666',
          description: 'Please enter valid height and weight values',
          recommendation: 'Height and weight must be greater than 0'
        };
      }
      
      const bmiResult = calculateBMI(heightFeet, weightPounds);
      return {
        value: bmiResult.value,
        category: bmiResult.category.category,
        color: bmiResult.category.color,
        description: bmiResult.category.description,
        recommendation: bmiResult.category.recommendation
      };
    } catch (error) {
      console.error("BMI calculation error:", error);
      return {
        value: null,
        category: 'N/A',
        color: '#666',
        description: 'Error calculating BMI',
        recommendation: 'Please try updating your measurements'
      };
    }
  };

  // Calculate daily calorie needs based on activity level
  const calculateUserCalories = (user) => {
    if (!user || !user.weight || !user.height || !user.age || !user.gender) {
      return {
        maintenance: null,
        weightLoss: null,
        weightGain: null
      };
    }
    
    try {
      const heightFeet = parseFloat(user.height);
      const weightPounds = parseFloat(user.weight);
      const age = parseInt(user.age);
      
      if (isNaN(heightFeet) || isNaN(weightPounds) || isNaN(age) || 
          heightFeet <= 0 || weightPounds <= 0 || age <= 0) {
        return {
          maintenance: null,
          weightLoss: null,
          weightGain: null
        };
      }
      
      return calculateCalorieNeeds(weightPounds, heightFeet, age, user.gender, user.activityLevel);
    } catch (error) {
      console.error("Calorie calculation error:", error);
      return {
        maintenance: null,
        weightLoss: null,
        weightGain: null
      };
    }
  };

  const getActivityLevelText = (level) => {
    switch (level) {
      case "sedentary": return "Sedentary (little or no exercise)";
      case "light": return "Light (light exercise 1-3 days/week)";
      case "moderate": return "Moderate (moderate exercise 3-5 days/week)";
      case "active": return "Active (hard exercise 6-7 days/week)";
      case "very_active": return "Very Active (very hard exercise & physical job)";
      default: return "Moderate";
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await handleImagePicked(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image. Please try again.');
    }
  };

  const handleImagePicked = async (uri) => {
    if (!uri) return;
    
    try {
      setUploading(true);
      
      // In a real app, you would upload the image to Firebase Storage here
      // For now, we'll just store the local URI
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        profileImage: uri
      });
      
      setProfileImage(uri);
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Error updating profile image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const bmi = calculateUserBMI(user);
  const calorieNeeds = calculateUserCalories(user);

  

  // Create an animated profile header
  const ProfileHeader = () => {
    return (
      <Animated.View 
        entering={FadeIn.delay(100).duration(600)}
        style={styles.headerContainer}
      >
        <TouchableOpacity 
          onPress={pickImage}
          style={styles.profileImageContainer}
          disabled={uploading}
        >
          {profileImage ? (
            <Animated.Image 
              entering={FadeIn.duration(500)}
              source={{ uri: profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <Animated.View entering={FadeIn.duration(500)}>
              <Ionicons name="person" size={60} color="#666" />
            </Animated.View>
          )}
          {uploading && (
            <ActivityIndicator style={styles.uploadIndicator} color="#666" />
          )}
        </TouchableOpacity>
        <Animated.Text 
          entering={FadeIn.delay(300).duration(500)}
          style={styles.title}
        >
          {user?.name}
        </Animated.Text>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      source={require('../../images/background.png')}
      resizeMode="cover"
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header with profile image and name */}
          <ProfileHeader />

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {user ? (
            <>
              {/* Health Metrics Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="fitness-outline" size={24} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Health Metrics</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Body Mass Index (BMI)</Text>
                    <View style={styles.metricValueContainer}>
                      <Text style={[styles.metricValue, { color: bmi.color }]}>
                        {typeof bmi.value === 'number' ? bmi.value.toFixed(1) : 'N/A'}
                      </Text>
                      <Text style={[styles.metricCategory, { color: bmi.color }]}>
                        {bmi.category || 'N/A'}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {bmi.description || 'Please update your height and weight in your profile'}
                      </Text>
                      <Text style={styles.metricRecommendation}>
                        {bmi.recommendation || 'Add your measurements to get personalized recommendations'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Recommended Daily Calories</Text>
                    <View style={styles.calorieContainer}>
                      <View style={styles.calorieItem}>
                        <Text style={styles.calorieLabel}>Maintenance</Text>
                        <Text style={styles.calorieValue}>
                          {typeof calorieNeeds.maintenance === 'number' ? `${calorieNeeds.maintenance} kcal/day` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.calorieItem}>
                        <Text style={styles.calorieLabel}>Weight Loss</Text>
                        <Text style={styles.calorieValue}>
                          {typeof calorieNeeds.weightLoss === 'number' ? `${calorieNeeds.weightLoss} kcal/day` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.calorieItem}>
                        <Text style={styles.calorieLabel}>Weight Gain</Text>
                        <Text style={styles.calorieValue}>
                          {typeof calorieNeeds.weightGain === 'number' ? `${calorieNeeds.weightGain} kcal/day` : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Personal Information Card */}
              <AnimatedCard index={1}>
                <View style={styles.cardHeader}>
                  <Ionicons name="person-outline" size={24} color={'#5e2bff'} />
                  <Text style={styles.cardTitle}>Personal Information</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <AnimatedInfoRow label="Age" value={user.age} delay={100} />
                  <AnimatedInfoRow label="Gender" value={user.gender} delay={150} />
                  <AnimatedInfoRow label="Height" value={`${user.height} ft`} delay={200} />
                  <AnimatedInfoRow label="Weight" value={`${user.weight} lbs`} delay={250} />
                </View>
              </AnimatedCard>

              {/* Preferences Card */}
              <AnimatedCard index={2}>
                <View style={styles.cardHeader}>
                  <Ionicons name="options-outline" size={24} color={'#5e2bff'} />
                  <Text style={styles.cardTitle}>Preferences</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <AnimatedInfoRow 
                    label="Activity Level" 
                    value={getActivityLevelText(user.activityLevel)} 
                    delay={100} 
                  />
                  
                  <AnimatedInfoRow 
                    label="Dietary Preferences" 
                    value={user.dietaryPreferences} 
                    delay={200} 
                  />
                </View>
              </AnimatedCard>
            </>
          ) : (
            <Animated.Text 
              entering={FadeIn.delay(500)}
              style={styles.noDataText}
            >
              No profile data found.
            </Animated.Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Profile;
