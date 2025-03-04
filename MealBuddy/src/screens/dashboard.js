import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import CircularTracker from '../components/circular_tracker';
import styles from '../styles/dashboard_styles';
import Colors from '../constants/Colors';
import { PieChart } from 'react-native-chart-kit';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot } from 'firebase/firestore';

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

const Dashboard = () => {
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    sugar: 0,
    fats: 0,
    water: 0,
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');
    const safeValue = (value) => (isNaN(value) || value === null ? 0 : value);
    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      let newTotals = {
        calories: 0,
        protein: 0,
        sugar: 0,
        fats: 0,
        water: 0,
      };
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

  // Pie chart data
  const pieChartData = [
    {
      name: 'Calories',
      population: totals.calories,
      color: Colors.calories,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Water Intake',
      population: totals.water,
      color: Colors.water,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Protein',
      population: totals.protein,
      color: Colors.protein,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Sugar',
      population: totals.sugar,
      color: Colors.carbs,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Fats',
      population: totals.fats,
      color: Colors.fats,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Summary</Text>

      <View style={styles.largeTrackerRow}>
        <CircularTracker
          label="Calories"
          value={totals.calories}
          maxValue={2000}
          color={Colors.calories}
          size={140}
          unit="kcal"
        />
        <CircularTracker
          label="Water Intake"
          value={totals.water}
          maxValue={3000}
          color={Colors.water}
          size={140}
          unit="ml"
        />
      </View>

      <View style={styles.smallTrackerRow}>
        <CircularTracker
          label="Protein"
          value={totals.protein}
          maxValue={100}
          color={Colors.protein}
          size={100}
          unit="g"
        />
        <CircularTracker
          label="Sugar"
          value={totals.sugar}
          maxValue={250}
          color={Colors.carbs}
          size={100}
          unit="g"
        />
        <CircularTracker
          label="Fats"
          value={totals.fats}
          maxValue={70}
          color={Colors.fats}
          size={100}
          unit="g"
        />
      </View>

      {/* Pie Chart */}
      <View style={{ marginTop: 20 }}>
        <PieChart
          data={pieChartData}
          width={370} // Pie chart width
          height={250} // Pie chart height
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 10]}
        />
      </View>
    </View>
  );
};



export default Dashboard;