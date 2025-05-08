import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, useWindowDimensions } from 'react-native';
import CircularTracker from '../components/circular_tracker';
import styles from '../styles/dashboard_styles';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideInRight
} from 'react-native-reanimated';

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

// Animated components
const AnimatedCard = ({ index, children, style }) => {
  return (
    <Animated.View 
      entering={SlideInUp.delay(index * 150).springify()} 
      style={[style]}
    >
      {children}
    </Animated.View>
  );
};



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
        if (data.mealCategory && newMealIngredients[data.mealCategory]) {
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

  const navigation = useNavigation();
  
  // Animation for screen entrance when focused
  React.useEffect(() => {
    // This will run once when the component mounts
    scrollY.value = 0; // Reset scroll position on screen focus
  }, []);
  
  // Hook to handle the "Ask MealBuddy" CTA
  const handleAskMealBuddy = () => {
    navigation.navigate('Chatbot'); // Navigate to the Chatbot screen
  };

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
        {/* Header with greeting */}
        <Animated.View style={[styles.greetingContainer, greetingAnimatedStyle]}>
          <Animated.Text 
            entering={FadeIn.duration(600)} 
            style={styles.greetingText}
          >
            Welcome, {firstName}! 👋
          </Animated.Text>
          <Animated.Text 
            entering={FadeIn.delay(200).duration(400)} 
            style={styles.dateText}
          >
            {currentDate}
          </Animated.Text>
          <Animated.Text 
            entering={FadeIn.delay(300).duration(400)} 
            style={styles.loggedText}
          >
            Meals logged today: {mealCount}
          </Animated.Text>
        </Animated.View>

        {/* Meals of the Day Card */}
        <AnimatedCard index={0} style={styles.mealOfDayCard}>
          <View style={styles.mealOfDayHeader}>
            <Text style={styles.mealOfDayTitle}>Meals of the Day</Text>
            <TouchableOpacity 
              style={styles.logMealButton}
              onPress={() => navigation.navigate('Add Food')}
            >
              <Text style={styles.logMealButtonText}>+ Log Meal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealCardBody}>
            <View style={styles.placeholderBox} />
            <Text style={styles.mealCardTitle}>Quinoa Buddha Bowl</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Your Fridge')}>
            <Text style={styles.viewAllText}>See all meals →</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* Nutrition Summary Card */}
        <AnimatedCard index={1} style={styles.nutritionSummaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Nutrition Summary</Text>
          </View>
          
          <View style={styles.nutritionSummaryContent}>
            <View style={styles.largeTrackerRow}>
              <Animated.View entering={FadeIn.delay(200)}>
                <CircularTracker 
                  label="Calories" 
                  value={totals.calories} 
                  maxValue={2000} 
                  color={Colors.calories} 
                  size={160} // Increased size
                  unit="kcal"
                />
              </Animated.View>
              <Animated.View entering={FadeIn.delay(300)}>
                <CircularTracker 
                  label="Water" 
                  value={totals.water} 
                  maxValue={100} 
                  color={Colors.water} 
                  size={160} // Increased size
                  unit="oz"
                />
              </Animated.View>
            </View>
            
            <View style={styles.smallTrackerRow}>
              <Animated.View entering={FadeIn.delay(400)}>
                <CircularTracker 
                  label="Protein" 
                  value={totals.protein} 
                  maxValue={100} 
                  color={Colors.protein} 
                  size={120} // Increased size for small trackers
                  unit="g"
                />
              </Animated.View>
              <Animated.View entering={FadeIn.delay(500)}>
                <CircularTracker 
                  label="Sugar" 
                  value={totals.sugar} 
                  maxValue={50} 
                  color={Colors.carbs} 
                  size={120} // Increased size for small trackers
                  unit="g"
                />
              </Animated.View>
              <Animated.View entering={FadeIn.delay(600)}>
                <CircularTracker 
                  label="Fats" 
                  value={totals.fats} 
                  maxValue={70} 
                  color={Colors.fats} 
                  size={120} // Increased size for small trackers
                  unit="g"
                />
              </Animated.View>
            </View>
          </View>
        </AnimatedCard>
        
        {/* Suggested Recipes Section */}
        <AnimatedCard index={2} style={styles.recipesSectionContainer}>
          <View style={styles.recipesSectionHeader}>
            <Text style={styles.recipesSectionTitle}>Suggested Recipes</Text>
          </View>
          
          <Animated.ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recipeScrollView}
          >
            {/* Recipe Card 1 */}
            <Animated.View 
              entering={SlideInRight.delay(200).springify()}
              style={styles.recipeCard}
            >
              <View style={styles.recipeImage} />
              <View style={styles.recipeContent}>
                <Text style={styles.recipeTitle}>Green Protein Bowl</Text>
                <TouchableOpacity style={styles.recipeButton}>
                  <Text style={styles.recipeButtonText}>View Recipe</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            {/* Recipe Card 2 */}
            <Animated.View 
              entering={SlideInRight.delay(300).springify()}
              style={styles.recipeCard}
            >
              <View style={styles.recipeImage} />
              <View style={styles.recipeContent}>
                <Text style={styles.recipeTitle}>Mediterranean Salad</Text>
                <TouchableOpacity style={styles.recipeButton}>
                  <Text style={styles.recipeButtonText}>View Recipe</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            {/* Recipe Card 3 */}
            <Animated.View 
              entering={SlideInRight.delay(400).springify()}
              style={styles.recipeCard}
            >
              <View style={styles.recipeImage} />
              <View style={styles.recipeContent}>
                <Text style={styles.recipeTitle}>Avocado Toast</Text>
                <TouchableOpacity style={styles.recipeButton}>
                  <Text style={styles.recipeButtonText}>View Recipe</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.ScrollView>
        </AnimatedCard>

        {/* Meal Categories */}
        {Object.keys(mealIngredients).map((mealType, mealIndex) => (
          mealIngredients[mealType].length > 0 && (
            <AnimatedCard key={mealType} index={3 + mealIndex} style={styles.mealContainer}>
              <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
              {mealIngredients[mealType].map((item, index) => (
                <Animated.View 
                  key={index} 
                  entering={FadeIn.delay(100 * index)}
                  style={styles.foodItem}
                >
                  <Text style={styles.foodName}>{item.name}</Text>
                  <View style={styles.nutritionContainer}>
                    <Text style={styles.nutritionText}>Calories: {item.calories} kcal</Text>
                    <Text style={styles.nutritionText}>Protein: {item.protein} g</Text>
                    <Text style={styles.nutritionText}>Fat: {item.total_fat} g</Text>
                  </View>
                </Animated.View>
              ))}
            </AnimatedCard>
          )
        ))}
      </Animated.ScrollView>
      
      {/* Chatbot CTA Button */}
      <Animated.View 
        entering={FadeIn.delay(800).duration(500)}
        style={styles.chatbotCTA}
      >
        <TouchableOpacity 
          onPress={handleAskMealBuddy}
          style={{flexDirection: 'row', alignItems: 'center'}}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
          <Text style={styles.chatbotCTAText}>Ask MealBuddy</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
};



export default Dashboard;
