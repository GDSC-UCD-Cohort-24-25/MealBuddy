import React from 'react';
import { View, Text } from 'react-native';
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>

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
    </View>
  );
};

export default Dashboard;
