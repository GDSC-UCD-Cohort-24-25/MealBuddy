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
  // Flag to indicate if sign-out is in progress
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigation = useNavigation();
  // useRef to store the unsubscribe function for the snapshot listener
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
          // If there's no authenticated user or we're signing out, do nothing.
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
            // Unsubscribe immediately to prevent further snapshot calls.
            if (unsubscribeRef.current) {
              unsubscribeRef.current();
              unsubscribeRef.current = null;
            }
            setIsSigningOut(true);
            try {
              await signOut(auth);
              // Reset navigation to clear history and return to the authentication screen.
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sign Out Button at the top-right */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {user ? (
        <>
          <Text style={styles.title}>Welcome, {user.name}!</Text>
          <Text style={styles.subtitle}>Age: {user.age}</Text>
          <Text style={styles.subtitle}>Gender: {user.gender}</Text>
          <Text style={styles.subtitle}>Height: {user.height}</Text>
          <Text style={styles.subtitle}>Weight: {user.weight} pounds</Text>
        </>
      ) : (
        <Text style={styles.noDataText}>No profile data found.</Text>
      )}
    </View>
  );
};

export default Profile;
