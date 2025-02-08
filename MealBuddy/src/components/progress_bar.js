import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/progress_bar_styles';

const ProgressBar = ({ label, value, maxValue }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}: {value}/{maxValue}</Text>
      <View style={styles.progress_bar}>
        <View style={[styles.filled, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

export default ProgressBar;
