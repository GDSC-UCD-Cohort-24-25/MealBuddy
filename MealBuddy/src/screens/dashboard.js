import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import CircularTracker from '../components/circular_tracker';
import styles from '../styles/dashboard_styles';
import Colors from '../constants/Colors';
import { db, auth } from '../services/firebase_config';
import { collection, query, onSnapshot } from 'firebase/firestore';


const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

const Dashboard = () => {
  const [totals, setTotals] = useState({ calories: 0, protein: 0, sugar: 0, fats: 0, water: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');
    const safeValue = (value) => isNaN(value) || value === null ? 0 : value;
    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      let newTotals = { calories: 0, protein: 0, sugar: 0, fats: 0, water: 0 };
      snapshot.forEach((doc) => {
        const data = doc.data();
        newTotals.calories += safeValue(data.calories);
        newTotals.protein += safeValue(data.protein);
        newTotals.sugar += safeValue(data.sugar);
        newTotals.fats += safeValue(data.total_fat);
        newTotals.water += safeValue(data.water);
      });
      setTotals({
        calories: roundToOneDecimal(newTotals.calories),
        protein: roundToOneDecimal(newTotals.protein),
        sugar: roundToOneDecimal(newTotals.sugar),
        fats: roundToOneDecimal(newTotals.fats),
        water: roundToOneDecimal(newTotals.water),
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Macros Overview</Text>
      <View style={styles.largeTrackerRow}>
        <CircularTracker label="Calories" value={totals.calories} maxValue={2000} color={Colors.calories} size={140} />
        <CircularTracker label="Water Intake" value={totals.water} maxValue={3000} color={Colors.water} size={140} />
      </View>
      <View style={styles.smallTrackerRow}>
        <CircularTracker label="Protein" value={totals.protein} maxValue={100} color={Colors.protein} size={100} />
        <CircularTracker label="Sugar" value={totals.sugar} maxValue={250} color={Colors.carbs} size={100} />
        <CircularTracker label="Fats" value={totals.fats} maxValue={70} color={Colors.fats} size={100} />
      </View>
      <Text style={styles.nutritionText}>Calories: {totals.calories} kcal</Text>
      <Text style={styles.nutritionText}>Protein: {totals.protein} g</Text>
      <Text style={styles.nutritionText}>Fats: {totals.fats} g</Text>
      <Text style={styles.nutritionText}>Sugar: {totals.sugar} g</Text>
      <Text style={styles.nutritionText}>Water Intake: {totals.water} ml</Text>

    </View>
  );
};

export default Dashboard;
