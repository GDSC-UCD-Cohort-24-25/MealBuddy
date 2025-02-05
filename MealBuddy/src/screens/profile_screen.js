import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!auth.currentUser) {
          console.error('No user is logged in');
          return;
        }

        const userId = auth.currentUser.uid;
        const docSnap = await getDoc(doc(db, 'users', userId));

        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          console.log('User profile not found.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
