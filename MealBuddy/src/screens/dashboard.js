import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, useWindowDimensions } from 'react-native';
import CircularTracker from '../components/circular_tracker';
import styles from '../styles/dashboard_styles';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
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

  // State for logged meals fetched from 'meals' collection
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [groupedLoggedMeals, setGroupedLoggedMeals] = useState({
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: []
  });

  // State for ingredients fetched from 'ingredients' collection
  const [fridgeIngredients, setFridgeIngredients] = useState([]); // Renamed for clarity

  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    sugar: 0,
    fats: 0,
    water: 0,
    carbs: 0,
  });
  const [mealIngredients, setMealIngredients] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

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


  // Listener for Fridge Ingredients
  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');

    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("🔹 Updated fridge ingredients:", items);
      setFridgeIngredients(items); // Update the dedicated state for ingredients
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  // Listener for Logged Meals
  useEffect(() => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const mealsRef = collection(db, 'users', userId, 'meals');
      // Order meals by timestamp to show recent ones first
      const q = query(mealsRef, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
          const mealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log("🔹 Updated logged meals:", mealsData); // Keep logging here
          setLoggedMeals(mealsData);
          // Grouping for display will happen in the totals effect
          // setGroupedLoggedMeals(grouped); // Moved grouping
      }, (error) => {
          console.error("🔥 Error fetching logged meals:", error);
      });

      return () => unsubscribe();
  }, [auth.currentUser]);

  // EFFECT TO CALCULATE TOTALS AND GROUP FRIDGE INGREDIENTS
  useEffect(() => {
      console.log("🔄 Recalculating totals and grouping fridge ingredients...");
      console.log("Current fridgeIngredients state:", fridgeIngredients.length, fridgeIngredients); // Log ingredients state
      console.log("Current loggedMeals state:", loggedMeals.length, loggedMeals); // Log meals state

      const safeValue = (value) => (isNaN(value) || value === null ? 0 : value);

      let newTotals = {
        calories: 0,
        protein: 0,
        sugar: 0,
        fats: 0,
        water: 0,
        carbs: 0,
      };

      // Sum up macros from Fridge Ingredients
      fridgeIngredients.forEach(item => {
        newTotals.calories += safeValue(item.calories);
        newTotals.protein += safeValue(item.protein);
        newTotals.sugar += safeValue(item.sugar);
        newTotals.fats += safeValue(item.total_fat || item.fats);
        newTotals.water += safeValue(item.water);
      });
       console.log("Totals after processing fridgeIngredients:", newTotals); // Log intermediate total

      // Sum up macros from Logged Meals
      loggedMeals.forEach(meal => {
          newTotals.calories += safeValue(meal.calories);
          newTotals.protein += safeValue(meal.protein);
          newTotals.fats += safeValue(meal.total_fat || meal.fats);
          newTotals.carbs += safeValue(meal.carbs);
      });
      console.log("Totals after processing loggedMeals:", newTotals); // Log final total before setting state


      setTotals({
        calories: roundToOneDecimal(newTotals.calories),
        protein: roundToOneDecimal(newTotals.protein),
        sugar: roundToOneDecimal(newTotals.sugar),
        fats: roundToOneDecimal(newTotals.fats),
        water: roundToOneDecimal(newTotals.water),
        carbs: roundToOneDecimal(newTotals.carbs),
      });
       console.log("✅ Totals state updated.");


      // Update mealCount based on both ingredients and logged meals
      setMealCount(fridgeIngredients.length + loggedMeals.length);
       console.log("✅ Meal count updated:", fridgeIngredients.length + loggedMeals.length);


       // Group fridge ingredients by meal category for display
       const newMealIngredients = {
         breakfast: [],
         lunch: [],
         dinner: [],
         snack: [],
       };
       fridgeIngredients.forEach((doc) => {
         const data = doc;
         if (data.mealCategory && newMealIngredients[data.mealCategory.toLowerCase()]) {
           newMealIngredients[data.mealCategory.toLowerCase()].push(data);
         }
       });
       setMealIngredients(newMealIngredients);
        console.log("✅ Fridge ingredients grouped for display.");


       // Group logged meals by category for display (Moved from the loggedMeals listener)
       const newGroupedLoggedMeals = {
           Breakfast: [],
           Lunch: [],
           Dinner: [],
           Snack: []
       };
       loggedMeals.forEach(meal => {
           if (meal.category && newGroupedLoggedMeals[meal.category]) {
               newGroupedLoggedMeals[meal.category].push(meal);
           } else {
               console.warn("Meal found without a valid category during grouping:", meal);
           }
       });
       setGroupedLoggedMeals(newGroupedLoggedMeals);
        console.log("✅ Logged meals grouped for display.");


  }, [fridgeIngredients, loggedMeals]); // This effect depends on both states

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

  // Helper to render a single logged meal item
  const renderLoggedMealItem = (meal, index) => (
      <View key={meal.id || index} style={styles.loggedMealItemContainer}> {/* Use a dedicated style for the container */}
          <Text style={styles.loggedMealTitle}>{meal.name || 'Unnamed Meal'}</Text>
          <View style={styles.loggedMealMacros}>
              <Text style={styles.loggedMealMacroText}>Calories: {roundToOneDecimal(meal.calories || 0)} kcal</Text>
              <Text style={styles.loggedMealMacroText}>Protein: {roundToOneDecimal(meal.protein || 0)} g</Text>
              <Text style={styles.loggedMealMacroText}>Fat: {roundToOneDecimal(meal.total_fat || meal.fats || 0)} g</Text>
              <Text style={styles.loggedMealMacroText}>Carbs: {roundToOneDecimal(meal.carbs || 0)} g</Text> {/* Added Carbs */}
          </View>
          {/* Optionally display ingredients if needed */}
          {/* {meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
              <Text style={styles.loggedMealIngredientsText}>Ingredients: {meal.ingredients.join(', ')}</Text>
          )} */}
      </View>
  );

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
            Meals logged today: {loggedMeals.length}
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
              entering={SlideInUp.delay(200).springify()}
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
              entering={SlideInUp.delay(300).springify()}
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
              entering={SlideInUp.delay(400).springify()}
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

        {/* NEW: Separate Logged Meals Sections by Category - Start index from 3 */}
        {Object.keys(groupedLoggedMeals).map((category, categoryIndex) => {
            const mealsInCategory = groupedLoggedMeals[category];
            // Only render a card for categories with meals
            if (mealsInCategory.length > 0) {
                return (
                    // Create a new AnimatedCard for each category
                    // Use the categoryIndex to offset the animation delay
                    <AnimatedCard key={category} index={3 + categoryIndex} style={styles.loggedMealsSectionContainer}> {/* Re-indexed */}
                        <View style={styles.cardHeader}>
                            {/* Use the category name as the card title */}
                            <Text style={styles.cardTitle}>{category}</Text>
                            {/* Optional: Add an icon here if needed - you would add it next to the Text */}
                             {/* For example: <Ionicons name={category === 'Breakfast' ? 'sunny' : category === 'Lunch' ? 'sunny-outline' : category === 'Dinner' ? 'moon' : 'star'} size={20} color={Colors.text} style={{ marginLeft: 10 }} /> */}
                        </View>
                        <View style={styles.loggedMealsContent}>
                            {/* Render each meal item using renderLoggedMealItem */}
                            {mealsInCategory.map((meal, mealIndex) => renderLoggedMealItem(meal, mealIndex))}
                        </View>
                    </AnimatedCard>
                );
            }
            return null; // Don't render anything for empty categories
        })}

        {/* Meal Categories (Your Fridge Items) - These will now appear after Logged Meals cards */}
        {Object.keys(mealIngredients).map((mealType, mealIndex) => (
          mealIngredients[mealType].length > 0 && (
            // Adjust the index to appear after the potential logged meal cards (max 4 categories)
            <AnimatedCard key={mealType} index={7 + mealIndex} style={styles.mealContainer}> {/* Re-indexed */}
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
