import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Bounce a couple of times
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out and navigate after 4 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('AuthScreen'); // This should correctly navigate after the splash screen animation.
      });
    }, 4000); // Delay fade out to 4 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../../images/background.png')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <Animated.Image 
        source={require('../../images/mealbuddy_icon.png')} 
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: bounceAnim }],
          },
        ]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
        MealBuddy
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        An AI helper for healthy planning
      </Animated.Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    opacity: 0.05,  
    resizeMode: 'cover', 
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default SplashScreen;
