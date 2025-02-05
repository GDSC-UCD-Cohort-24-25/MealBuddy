import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            console.log('User profile not found.');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error.message);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No user is logged in.');
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup the listener when the component unmounts
  }, []); // ✅ Ensured proper dependency handling

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userProfile ? (
        <>
          <Text style={styles.text}>Welcome, {userProfile.name}!</Text>
          <Text style={styles.text}>Age: {userProfile.age}</Text>
        </>
      ) : (
        <Text style={styles.text}>No profile data found.</Text>
      )}
    </View>
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
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
