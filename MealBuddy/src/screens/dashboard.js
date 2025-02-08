import React from 'react';
import { View, Text } from 'react-native';
import ProgressBar from '../components/progress_bar';
import Tracker from '../components/tracker';
import styles from '../styles/dashboard_styles';

const Dashboard = () => {
  const progressData = [
    { label: 'Calories', value: 1200, maxValue: 2000 },
    { label: 'Protein', value: 60, maxValue: 100 },
    { label: 'Carbs', value: 150, maxValue: 250 },
    { label: 'Fats', value: 40, maxValue: 70 },
  ];

  const trackerData = [
    { label: 'Steps', value: 7500 },
    { label: 'Water Intake', value: '2.5L' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>

      {progressData.map((item, index) => (
        <ProgressBar key={index} label={item.label} value={item.value} maxValue={item.maxValue} />
      ))}

      <View style={styles.tracker_container}>
        {trackerData.map((item, index) => (
          <Tracker key={index} label={item.label} value={item.value} />
        ))}
      </View>
    </View>
  );
};

export default Dashboard;
