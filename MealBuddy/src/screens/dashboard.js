import React from 'react';
import { View, Text, FlatList } from 'react-native';
import CircularTracker from '../components/circular_tracker';
import styles from '../styles/dashboard_styles';
import Colors from '../constants/Colors';

const Dashboard = () => {
  const largeTrackers = [
    { label: 'Calories', value: 1200, maxValue: 2000, color: Colors.calories },
    { label: 'Water Intake', value: 2.5, maxValue: 3, color: Colors.water },
  ];

  const smallTrackers = [
    { label: 'Protein', value: 60, maxValue: 100, color: Colors.protein },
    { label: 'Carbs', value: 150, maxValue: 250, color: Colors.carbs },
    { label: 'Fats', value: 40, maxValue: 70, color: Colors.fats },
  ];

  const meals = [
    {
      mealType: 'Breakfast',
      items: [
        { name: 'Oatmeal, Cooked', calories: 285, protein: 10, carbs: 51, fats: 5, water: 13 },
        { name: 'Berries, Frozen', calories: 100, protein: 1, carbs: 24, fats: 0, water: 6 },
        { name: 'Coffee', calories: 4, protein: 0, carbs: 0, fats: 0, water: 16 },
        { name: 'Whey Protein', calories: 88, protein: 20, carbs: 3, fats: 1, water: 0 },
      ],
    },
    {
      mealType: 'Lunch',
      items: [
        { name: 'Grilled Chicken', calories: 400, protein: 40, carbs: 0, fats: 10, water: 8 },
        { name: 'Steamed Vegetables', calories: 150, protein: 5, carbs: 30, fats: 1, water: 12 },
        { name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fats: 2, water: 0 },
      ],
    },
    {
      mealType: 'Dinner',
      items: [
        { name: 'Salmon', calories: 500, protein: 50, carbs: 0, fats: 22, water: 10 },
        { name: 'Quinoa', calories: 220, protein: 8, carbs: 39, fats: 3, water: 5 },
        { name: 'Green Salad', calories: 100, protein: 2, carbs: 20, fats: 2, water: 14 },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Macros</Text>

      {/* Large Trackers */}
      <View style={styles.largeTrackerRow}>
        {largeTrackers.map((item, index) => (
          <CircularTracker key={index} label={item.label} value={item.value} maxValue={item.maxValue} color={item.color} size={140} />
        ))}
      </View>

      {/* Small Trackers */}
      <View style={styles.smallTrackerRow}>
        {smallTrackers.map((item, index) => (
          <CircularTracker key={index} label={item.label} value={item.value} maxValue={item.maxValue} color={item.color} size={100} />
        ))}
      </View>

      {/* Meal Section */}
      <FlatList
        data={meals}
        keyExtractor={(item) => item.mealType}
        renderItem={({ item }) => (
          <View style={styles.mealContainer}>
            <Text style={styles.mealTitle}>{item.mealType}</Text>
            {item.items.map((food, index) => (
              <View key={index} style={styles.foodItem}>
                <Text style={styles.foodName}>{food.name}</Text>
                <View style={styles.nutritionContainer}>
                  <Text style={[styles.nutritionText, { color: Colors.calories }]}>🔥 {food.calories} kcal</Text>
                  <Text style={[styles.nutritionText, { color: Colors.protein }]}>💪 {food.protein}g</Text>
                  <Text style={[styles.nutritionText, { color: Colors.carbs }]}>🥔 {food.carbs}g</Text>
                  <Text style={[styles.nutritionText, { color: Colors.fats }]}>🥑 {food.fats}g</Text>
                  <Text style={[styles.nutritionText, { color: Colors.water }]}>💧 {food.water}ml</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default Dashboard;
