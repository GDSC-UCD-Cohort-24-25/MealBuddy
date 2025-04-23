import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image,
  StyleSheet
} from "react-native";
import { db, auth } from "../services/firebase_config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import styles from "../styles/profile_styles";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [editMode, setEditMode] = useState(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const bmi = calculateBMI();
  const calorieNeeds = calculateCalorieNeeds();

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header with profile image and name */}
        <View style={styles.headerContainer}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitial}>{user?.name?.charAt(0) || "U"}</Text>
          </View>
          <Text style={styles.title}>{user?.name}</Text>
        </View>

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
                  <Text style={styles.metricLabel}>BMI</Text>
                  <View style={styles.metricValueContainer}>
                    <Text style={[styles.metricValue, { color: bmi.color }]}>{bmi.value}</Text>
                    <Text style={[styles.metricCategory, { color: bmi.color }]}>{bmi.category}</Text>
                  </View>
                </View>
                
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Daily Calories</Text>
                  <Text style={styles.metricValue}>{calorieNeeds} kcal</Text>
                </View>
              </View>
            </View>

            {/* Personal Information Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-outline" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Personal Information</Text>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{user.age}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{user.gender}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>{user.height} ft</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{user.weight} lbs</Text>
                </View>
              </View>
            </View>

            {/* Preferences Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="options-outline" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Preferences</Text>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Activity Level</Text>
                  <Text style={styles.infoValue}>{getActivityLevelText(user.activityLevel)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dietary Preferences</Text>
                  <Text style={styles.infoValue}>{user.dietaryPreferences}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>No profile data found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default Profile;
