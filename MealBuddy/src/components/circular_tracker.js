import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Svg, Circle, LinearGradient, Defs, Stop } from 'react-native-svg';
import styles from '../styles/circular_tracker_styles';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  interpolateColor
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Create animated SVG components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularTracker = ({ label, value, maxValue, color, size, unit = '' }) => {
  // Calculate dimensions
  const radius = size / 2 - 12; // Slightly smaller for better visual
  const innerRadius = radius - 5; // Inner circle for layered effect
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  // For pulse animation of the value
  const valueScale = useSharedValue(1);
  const valueOpacity = useSharedValue(0);
  
  // Progress animation
  const progress = useSharedValue(0);
  const percentage = (value / maxValue) * 100;
  
  // Calculate darker/lighter versions of the color for gradient
  const darkerColor = color; // Original color
  const lighterColor = color + '80'; // Add transparency
  
  // Calculate color based on percentage (green to red) for extra visual feedback
  const getHealthColor = (percent) => {
    if (percent > 85) return '#e74c3c'; // Red for high
    if (percent > 65) return '#f39c12'; // Orange for medium-high
    if (percent > 45) return '#2ecc71'; // Green for medium
    return '#3498db'; // Blue for low
  };
  
  // Animated styles for the value text
  const valueAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: valueScale.value }],
      opacity: valueOpacity.value,
    };
  });
  
  // Animate the progress and value when component mounts or value changes
  useEffect(() => {
    // Animate progress circle
    progress.value = withTiming(
      (value / maxValue) * circumference,
      { 
        duration: 1500, 
        easing: Easing.bezierFn(0.16, 1, 0.3, 1) // Custom bezier curve for smoother animation
      }
    );
    
    // Animate value with a subtle pulse and fade-in
    valueScale.value = withSequence(
      withTiming(1.15, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
    
    valueOpacity.value = withTiming(1, { duration: 600 });
  }, [value, maxValue, circumference]);
  
  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference - progress.value
    };
  });

  // Format the value based on its type
  const formattedValue = parseInt(value) === value ? value : value.toFixed(1);
  
  // Create a visual icon based on the nutrient type
  const getNutrientIcon = () => {
    switch (label.toLowerCase()) {
      case 'calories':
        return <Ionicons name="flame" size={14} color={color} />;
      case 'water':
      case 'water (oz)':
        return <Ionicons name="water" size={14} color={color} />;
      case 'protein':
        return <Ionicons name="fitness" size={14} color={color} />;
      case 'sugar':
        return <Ionicons name="nutrition" size={14} color={color} />;
      case 'fats':
        return <Ionicons name="restaurant" size={14} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View 
      style={[styles.container, { width: size, height: size }]}
      entering={FadeIn.duration(500)}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={lighterColor} stopOpacity="0.8" />
            <Stop offset="1" stopColor={darkerColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Background Circle - Light Gray with soft shadow */}
        <Circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke="#e0e0e0" 
          strokeWidth={strokeWidth} 
          strokeOpacity={0.6}
          fill="none" 
        />
        
        {/* Inner Background Circle for layered effect */}
        <Circle 
          cx={size / 2} 
          cy={size / 2} 
          r={innerRadius} 
          stroke="#f0f0f0" 
          strokeWidth={strokeWidth - 3} 
          fill="none" 
        />
        
        {/* Animated Progress Circle with Gradient */}
        <AnimatedCircle
          cx={size / 2} 
          cy={size / 2} 
          r={radius}
          stroke="url(#grad)" 
          strokeWidth={strokeWidth} 
          fill="none"
          strokeDasharray={circumference} 
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Text Container with Value and Label */}
      <View style={styles.textContainer}>
        <Animated.View style={valueAnimatedStyle}>
          <View style={styles.valueContainer}>
            <Animated.Text 
              style={styles.valueText}
            >
              {formattedValue}
            </Animated.Text>
            
            {unit && <Text style={styles.unitText}>{unit}</Text>}
          </View>
        </Animated.View>
        
        <View style={styles.labelContainer}>
          {getNutrientIcon()}
          <Animated.Text 
            entering={FadeIn.delay(400).duration(300)}
            style={[styles.labelText, { color }]}
          >
            {label}
          </Animated.Text>
        </View>
        
        {/* Percentage indicator */}
        <Animated.Text 
          entering={FadeIn.delay(500).duration(300)}
          style={styles.percentText}
        >
          {Math.round(percentage)}%
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

export default CircularTracker;
