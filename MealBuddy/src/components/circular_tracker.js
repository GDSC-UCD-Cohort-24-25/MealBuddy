import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import styles from '../styles/circular_tracker_styles';

const CircularTracker = ({ label, value, maxValue, color, size }) => {
  const radius = size / 2 - 10; // Adjust size dynamically
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / maxValue) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#e0e0e0" strokeWidth={strokeWidth} fill="none" />
        {/* Progress Circle */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={[styles.labelText, { color }]}>{label}</Text>
      </View>
    </View>
  );
};

export default CircularTracker;
