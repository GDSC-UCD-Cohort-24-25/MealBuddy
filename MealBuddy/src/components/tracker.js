import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/tracker_styles';

const Tracker = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export default Tracker;
