import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import CircularTracker from '../components/circular_tracker';
import styles from '../styles/dashboard_styles';
import Colors from '../constants/Colors';
import { db, auth } from '../services/firebase_config';
import { collection, query, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');

    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      let newTotals = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
      snapshot.forEach((doc) => {
        const data = doc.data();
        newTotals.calories += data.calories;
        newTotals.protein += data.protein;
        newTotals.carbs += data.carbs;
        newTotals.fats += data.total_fat;
        newTotals.water += data.water;
      });
      setTotals(newTotals);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Macros</Text>
      <View style={styles.largeTrackerRow}>
        <CircularTracker label="Calories" value={totals.calories} maxValue={2000} color={Colors.calories} size={140} />
        <CircularTracker label="Water Intake" value={totals.water} maxValue={3000} color={Colors.water} size={140} />
      </View>
      <View style={styles.smallTrackerRow}>
        <CircularTracker label="Protein" value={totals.protein} maxValue={100} color={Colors.protein} size={100} />
        <CircularTracker label="Carbs" value={totals.carbs} maxValue={250} color={Colors.carbs} size={100} />
        <CircularTracker label="Fats" value={totals.fats} maxValue={70} color={Colors.fats} size={100} />
      </View>
    </View>
  );
};

export default Dashboard;
