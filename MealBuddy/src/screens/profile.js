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
  const calculateBMI = () => {
    if (!user || !user.weight || !user.height) return { value: "N/A", category: "N/A" };
    
    // Convert height from feet to meters (assuming height is stored as feet)
    const heightInMeters = parseFloat(user.height) * 0.3048;
    
    // Convert weight from pounds to kg
    const weightInKg = parseFloat(user.weight) * 0.453592;
    
    if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters === 0) {
      return { value: "N/A", category: "N/A" };
    }
    
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(bmi * 10) / 10;
    
    let category;
    let color;
    
    if (bmi < 18.5) {
      category = "Underweight";
      color = "#3498db"; // Blue
    } else if (bmi < 25) {
      category = "Normal";
      color = "#2ecc71"; // Green
    } else if (bmi < 30) {
      category = "Overweight";
      color = "#f39c12"; // Orange
    } else {
      category = "Obese";
      color = "#e74c3c"; // Red
    }
    
    return { value: roundedBMI.toString(), category, color };
  };

  // Calculate daily calorie needs based on activity level
  const calculateCalorieNeeds = () => {
    if (!user || !user.weight || !user.height || !user.age || !user.gender) {
      return "N/A";
    }
    
    // Convert height from feet to cm
    const heightInCm = parseFloat(user.height) * 30.48;
    
    // Convert weight from pounds to kg
    const weightInKg = parseFloat(user.weight) * 0.453592;
    
    const age = parseInt(user.age);
    
    if (isNaN(heightInCm) || isNaN(weightInKg) || isNaN(age)) {
      return "N/A";
    }
    
    // Mifflin-St Jeor Equation
    let bmr;
    if (user.gender.toLowerCase() === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
    }
    
    // Activity multiplier
    let activityMultiplier;
    switch (user.activityLevel) {
      case "sedentary":
        activityMultiplier = 1.2;
        break;
      case "light":
        activityMultiplier = 1.375;
        break;
      case "moderate":
        activityMultiplier = 1.55;
        break;
      case "active":
        activityMultiplier = 1.725;
        break;
      case "very_active":
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.55; // Default to moderate
    }
    
    const calories = Math.round(bmr * activityMultiplier);
    return calories.toString();
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

  const bmi = calculateBMI();
  const calorieNeeds = calculateCalorieNeeds();

  

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
          <Animated.View entering={FadeIn.delay(400)}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

          {user ? (
            <>
              {/* Health Metrics Card */}
              <AnimatedCard index={0}>
                <View style={styles.cardHeader}>
                  <Ionicons name="fitness-outline" size={24} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Health Metrics</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>BMI</Text>
                    <Animated.View 
                      entering={FadeIn.delay(100).duration(300)}
                      style={styles.metricValueContainer}
                    >
                      <Text style={[styles.metricValue, { color: bmi.color }]}>{bmi.value}</Text>
                      <Text style={[styles.metricCategory, { color: bmi.color }]}>{bmi.category}</Text>
                    </Animated.View>
                  </View>
                  
                  <Animated.View 
                    entering={FadeIn.delay(200).duration(300)}
                    style={styles.metricRow}
                  >
                    <Text style={styles.metricLabel}>Daily Calories</Text>
                    <Text style={styles.metricValue}>{calorieNeeds} kcal</Text>
                  </Animated.View>
                </View>
              </AnimatedCard>

              {/* Personal Information Card */}
              <AnimatedCard index={1}>
                <View style={styles.cardHeader}>
                  <Ionicons name="person-outline" size={24} color={Colors.primary} />
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
                  <Ionicons name="options-outline" size={24} color={Colors.primary} />
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
