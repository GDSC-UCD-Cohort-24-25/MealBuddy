import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const YourFridge = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        if (!auth.currentUser) {
          console.error('No user is logged in');
          setIngredients([]); // Clear ingredients if no user is logged in
          setLoading(false);
          return;
        }

        const userId = auth.currentUser.uid; // Get the logged-in user's UID
        const ingredientsRef = collection(db, 'ingredients');

        // Query only ingredients belonging to the logged-in user
        const q = query(ingredientsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setIngredients(snapshot.docs.map(doc => doc.data()));
        } else {
          console.log('No ingredients found for the current user.');
          setIngredients([]);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (ingredients.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No ingredients found in your fridge.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ingredients}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default YourFridge;
