import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import styles from '../styles/circular_tracker_styles';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeIn
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Create animated SVG components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularTracker = ({ label, value, maxValue, color, size, unit = '' }) => {
  // Calculate dimensions - match the style in the image
  const radius = size / 2 - 12; // Slightly larger radius to make the circle bigger
  const strokeWidth = 12; // Slightly thicker stroke to match the image better
  const circumference = 2 * Math.PI * radius;
  
  // For pulse animation of the value
  const valueScale = useSharedValue(1);
  const valueOpacity = useSharedValue(0);
  
  // Progress animation
  const progress = useSharedValue(0);
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
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
        duration: 1200, 
        easing: Easing.out(Easing.cubic)
      }
    );
    
    // Animate value with a subtle pulse and fade-in
    valueScale.value = withSequence(
      withTiming(1.1, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
    
    valueOpacity.value = withTiming(1, { duration: 500 });
  }, [value, maxValue, circumference]);
  
  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference - progress.value
    };
  });

  // Format the value based on its type
  const formattedValue = Number.isInteger(value) ? value : value.toFixed(1);
  
  // Create a visual icon based on the nutrient type
  const getNutrientIcon = () => {
    switch (label.toLowerCase()) {
      case 'calories':
        return <Ionicons name="flame" size={16} color={color} />;
      case 'water':
        return <Ionicons name="water" size={16} color={color} />;
      case 'protein':
        return <Ionicons name="fitness" size={16} color={color} />;
      case 'sugar':
        return <Ionicons name="nutrition" size={16} color={color} />;
      case 'fats':
        return <Ionicons name="restaurant" size={16} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View 
      style={[styles.container, { width: size, height: size }]}
      entering={FadeIn.duration(500)}
    >
      <View style={styles.circleBackground}>
        <Svg width={size} height={size}>
          {/* Background Circle - White with border */}
          <Circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius + strokeWidth/2} 
            fill="white" 
            stroke="#F0F0F0"
            strokeWidth={1}
          />
          
          {/* Background Circle - Track */}
          <Circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            stroke="#F0F0F0" 
            strokeWidth={strokeWidth} 
            fill="none" 
          />
          
          {/* Animated Progress Circle */}
          <AnimatedCircle
            cx={size / 2} 
            cy={size / 2} 
            r={radius}
            stroke={color} 
            strokeWidth={strokeWidth} 
            fill="none"
            strokeDasharray={circumference} 
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      
      {/* Text Container with Value, Label and Percentage */}
      <View style={styles.textContainer}>
        {/* Top Value */}
        <Animated.View 
          style={[valueAnimatedStyle, {position: 'absolute', top: size > 100 ? '18%' : '12%'}]}
        >
          <View style={styles.valueContainer}>
            <Animated.Text 
              style={styles.valueText}
            >
              {formattedValue}
            </Animated.Text>
            
            {unit && <Text style={styles.unitText}>{unit}</Text>}
          </View>
        </Animated.View>
        
        {/* Center Label with Icon */}
        <View style={[styles.labelContainer, {top: '50%', transform: [{translateY: -10}]}]}>
          {getNutrientIcon()}
          <Animated.Text 
            entering={FadeIn.delay(300).duration(300)}
            style={[styles.labelText, { color }]}
          >
            {label}
          </Animated.Text>
        </View>
        
        {/* Bottom Percentage */}
        <Animated.Text 
          entering={FadeIn.delay(400).duration(300)}
          style={[styles.percentText, {position: 'absolute', bottom: size > 100 ? '20%' : '15%'}]}
        >
          {Math.round(percentage)}%
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

export default CircularTracker;
