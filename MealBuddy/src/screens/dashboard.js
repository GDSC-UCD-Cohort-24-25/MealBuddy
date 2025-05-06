import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ImageBackground, TouchableOpacity } from 'react-native';
import CircularTracker from '../components/circular_tracker';
import styles from '../styles/dashboard_styles';
import Colors from '../constants/Colors';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate
} from 'react-native-reanimated';

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;



const Dashboard = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const greetingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 100], [1, 0]),
      transform: [{ translateY: interpolate(scrollY.value, [0, 100], [0, -50]) }],
    };
  });
  

  const [mealCount, setMealCount] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('en-US', options));

    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const fullName = docSnap.data().name || '';
          const first = fullName.split(' ')[0];
          setFirstName(first);
        }
      });
    }
  }, []);


  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    sugar: 0,
    fats: 0,
    water: 0,
  });
  const [mealIngredients, setMealIngredients] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');
    const safeValue = (value) => (isNaN(value) || value === null ? 0 : value);

    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      setMealCount(snapshot.size);
      let newTotals = {
        calories: 0,
        protein: 0,
        sugar: 0,
        fats: 0,
        water: 0,
      };
      const newMealIngredients = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        newTotals.calories += safeValue(data.calories);
        newTotals.protein += safeValue(data.protein);
        newTotals.sugar += safeValue(data.sugar);
        newTotals.fats += safeValue(data.total_fat);
        newTotals.water += safeValue(data.water);

        // Group ingredients by meal category
        if (data.mealCategory) {
          newMealIngredients[data.mealCategory].push(data);
        }
      });

      setTotals({
        calories: roundToOneDecimal(newTotals.calories),
        protein: roundToOneDecimal(newTotals.protein),
        sugar: roundToOneDecimal(newTotals.sugar),
        fats: roundToOneDecimal(newTotals.fats),
        water: roundToOneDecimal(newTotals.water),
      });
      setMealIngredients(newMealIngredients);
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
  <ImageBackground
    source={require('../../images/background.png')}
    resizeMode="cover"
    style={styles.background}
    imageStyle={{ opacity: 0.20 }}
  >
    <Animated.ScrollView
      contentContainerStyle={styles.scrollContent}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >

      <Animated.View style={[styles.greetingContainer, greetingAnimatedStyle]}>
        <Text style={styles.greetingText}>Good Morning, {firstName}! 👋</Text>
        <Text style={styles.dateText}>{currentDate}</Text>
        <Text style={styles.loggedText}>Meals logged today: {mealCount}</Text>
      </Animated.View>


      <View style={styles.mealOfDayCard}>
        <View style={styles.mealOfDayHeader}>
          <Text style={styles.mealOfDayTitle}>Meals of the Day</Text>
          <TouchableOpacity style={styles.logMealButton}>
            <Text style={styles.logMealButtonText}>+ Log Meal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealCardBody}>
          <View style={styles.placeholderBox} />
          <Text style={styles.mealCardTitle}>Quinoa Buddha Bowl</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.viewAllText}>See all meals →</Text>
        </TouchableOpacity>
      </View>


      {/* Nutrition Summary Box */}
      <View style={styles.mealContainer}>
        <View style={styles.mealOfDayHeader}>
          <Text style={styles.mealOfDayTitle}>Nutrition Summary</Text>
        </View>
        
        <View style={styles.nutritionSummaryContent}>
          <View style={styles.largeTrackerRow}>
            <CircularTracker 
              label="Calories" 
              value={totals.calories} 
              maxValue={2000} 
              color={Colors.calories} 
              size={150} 
            />
            <CircularTracker 
              label="Water (oz)" 
              value={totals.water} 
              maxValue={100} 
              color={Colors.water} 
              size={150} 
            />
          </View>
          
          <View style={styles.smallTrackerRow}>
            <CircularTracker 
              label="Protein" 
              value={totals.protein} 
              maxValue={100} 
              color={Colors.protein} 
              size={90} 
            />
            <CircularTracker 
              label="Sugar" 
              value={totals.sugar} 
              maxValue={50} 
              color={Colors.carbs} 
              size={90} 
            />
            <CircularTracker 
              label="Fats" 
              value={totals.fats} 
              maxValue={70} 
              color={Colors.fats} 
              size={90} 
            />
          </View>
        </View>
      </View>
      

      {/* Bar Chart */}
      <View style={{ marginTop: 20 }}>
        <BarChart
          data={{
            labels: ['Calories', 'Water', 'Protein', 'Sugar', 'Fats'],
            datasets: [
              {
                data: [
                  totals.calories,
                  totals.water,
                  totals.protein,
                  totals.sugar,
                  totals.fats,
                ],
              },
            ],
          }}
          width={370}
          height={250}
          yAxisLabel=""
          yAxisSuffix="g"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.7,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      {/* Meal Categories */}
      <View style={styles.mealContainer}>
        <Text style={styles.mealTitle}>Breakfast</Text>
        {mealIngredients.breakfast.map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <View style={styles.nutritionContainer}>
              <Text style={styles.nutritionText}>Calories: {item.calories} kcal</Text>
              <Text style={styles.nutritionText}>Protein: {item.protein} g</Text>
              <Text style={styles.nutritionText}>Fat: {item.total_fat} g</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.mealContainer}>
        <Text style={styles.mealTitle}>Lunch</Text>
        {mealIngredients.lunch.map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <View style={styles.nutritionContainer}>
              <Text style={styles.nutritionText}>Calories: {item.calories} kcal</Text>
              <Text style={styles.nutritionText}>Protein: {item.protein} g</Text>
              <Text style={styles.nutritionText}>Fat: {item.total_fat} g</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.mealContainer}>
        <Text style={styles.mealTitle}>Dinner</Text>
        {mealIngredients.dinner.map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <View style={styles.nutritionContainer}>
              <Text style={styles.nutritionText}>Calories: {item.calories} kcal</Text>
              <Text style={styles.nutritionText}>Protein: {item.protein} g</Text>
              <Text style={styles.nutritionText}>Fat: {item.total_fat} g</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.mealContainer}>
        <Text style={styles.mealTitle}>Snack</Text>
        {mealIngredients.snack.map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <View style={styles.nutritionContainer}>
              <Text style={styles.nutritionText}>Calories: {item.calories} kcal</Text>
              <Text style={styles.nutritionText}>Protein: {item.protein} g</Text>
              <Text style={styles.nutritionText}>Fat: {item.total_fat} g</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.ScrollView>
  </ImageBackground>
  );
};



export default Dashboard;