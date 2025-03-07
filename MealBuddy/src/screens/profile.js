import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { db, auth } from "../services/firebase_config";
import { doc, onSnapshot } from "firebase/firestore";
import styles from "../styles/profile_styles";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
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
            setUser(docSnap.data());
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

  // Calculate BMI
  const calculateBMI = () => {
    if (user?.height && user?.weight) {
      return (user.weight / (user.height * user.height)).toFixed(1);
    }
    return "N/A";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {user ? (
        <>
          <Text style={styles.title}>Welcome, {user.name}!</Text>
          <View style={styles.profileInfoContainer}>
            <Text style={styles.subtitle}>Age: <Text style={styles.value}>{user.age}</Text></Text>
            <Text style={styles.subtitle}>Gender: <Text style={styles.value}>{user.gender}</Text></Text>
            <Text style={styles.subtitle}>Height: <Text style={styles.value}>{user.height} m</Text></Text>
            <Text style={styles.subtitle}>Weight: <Text style={styles.value}>{user.weight} kg</Text></Text>
            <Text style={styles.subtitle}>BMI: <Text style={styles.value}>{calculateBMI()}</Text></Text>
          </View>
        </>
      ) : (
        <Text style={styles.noDataText}>No profile data found.</Text>
      )}
    </View>
  );
};

export default Profile;
