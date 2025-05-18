import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Linking,
  ScrollView,
  Image,
  ImageBackground,
  Alert
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    FadeIn,
    FadeOut,
    SlideInRight,
    SlideInLeft
} from 'react-native-reanimated';
import styles from '../styles/chatbot_styles';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMINI_API_KEY, YOUTUBE_API_KEY } from '@env';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot, doc, deleteDoc, addDoc, getDocs, query, where } from 'firebase/firestore';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [recipeDropdownState, setRecipeDropdownState] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedRecipeToAdd, setSelectedRecipeToAdd] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Breakfast');
  const [currentRecipes, setCurrentRecipes] = useState([]);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const scrollViewRef = useRef();

  // Typewriter effect: gradually reveal text in the last message.
  const typeMessage = (fullText, delay = 15) => {
    let currentIndex = 0;
    let typedText = "";
    const interval = setInterval(() => {
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length === 0 || typeof updated[updated.length - 1].text !== 'string') {
          clearInterval(interval);
          return prev;
        }
        typedText += fullText[currentIndex];
        updated[updated.length - 1] = { ...updated[updated.length - 1], text: typedText };
        return updated;
      });
      currentIndex++;
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
      }
    }, delay);
  };

  // Helper to render highlighted text (text wrapped in ** ... **)
  const renderHighlightedText = (text) => {
    const highlightRegex = /\*\*(.*?)\*\*/g;
    let elements = [];
    let lastIndex = 0;
    let match;
    const inputText = typeof text === 'string' ? text : '';
    while ((match = highlightRegex.exec(inputText)) !== null) {
      if (match.index > lastIndex) {
        elements.push(inputText.substring(lastIndex, match.index));
      }
      elements.push(
        <Text key={match.index} style={styles.highlightText}>
          {match[1]}
        </Text>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < inputText.length) {
      elements.push(inputText.substring(lastIndex));
    }
    return elements;
  };

  // Function to show initial greeting.
  const showInitialGreeting = () => {
    setLoading(true);
    setTimeout(() => {
      const greeting = "Hello! I'm your MealBuddy chatbot. Ask me what meals you can make with your ingredients!";
      const newMessage = { id: Date.now().toString(), text: greeting, isUser: false };
      setMessages([newMessage]);
      setLoading(false);
    }, 1000);
  };

  // Reset chatbot function (clears chat and starts fresh).
  const resetChatbot = () => {
    setMessages([]);
    setInput('');
    setCurrentRecipes([]);
    setExpandedRecipe(null);
    setShowCategoryPicker(false);
    setSelectedRecipeToAdd(null);
    setSelectedCategory('Breakfast');
    showInitialGreeting();
  };

  // Load initial greeting on startup.
  useEffect(() => {
    showInitialGreeting();
  }, []);

  // Live Firestore Listener for Fridge Items.
  useEffect(() => {
    if (!auth.currentUser) {
      console.error("❌ No authenticated user found.");
      setFridgeItems([]);
      return;
    }
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');
    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      if (snapshot.empty) {
        console.warn("⚠️ No ingredients found in Firestore.");
        setFridgeItems([]);
      } else {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          if (data && typeof data.name === 'string' && data.name.trim().length > 0) {
            return { id: doc.id, ...data };
          } else {
            console.warn("Skipping fridge item due to missing or invalid name:", doc.id, data);
            return null;
          }
        }).filter(item => item !== null);
        console.log("🔹 Updated fridge items:", items);
        setFridgeItems(items);
      }
    }, (error) => {
      console.error("🔥 Error fetching fridge items:", error);
      Alert.alert("Error", "Failed to fetch fridge items.");
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  // Fetch one YouTube video for a recipe.
  const fetchYouTubeVideo = async (query) => {
    if (!YOUTUBE_API_KEY) {
      console.warn("⚠️ YOUTUBE_API_KEY is not set.");
      return null;
    }
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          q: `${query} recipe`,
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
      });
      const videoId = response.data.items[0]?.id?.videoId;
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
    } catch (error) {
      console.error("YouTube API error:", error);
      if (error.response) {
        console.error("YouTube API response data:", error.response.data);
        console.error("YouTube API response status:", error.response.status);
      }
      return null;
    }
  };

  // Initialize Gemini AI.
  const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Function to add a meal to the user's nutrition tracker (dashboard)
  const addMealToNutrition = async (recipe, category) => {
    console.log("Attempting to add meal to nutrition:", recipe.title, "Category:", category);
    if (!auth.currentUser) {
      console.error('Error adding meal: No authenticated user found.');
      Alert.alert('Error', 'No authenticated user found.');
      // Throwing here might be too abrupt if called directly. Let's return false/throw based on how it's used.
      // Since confirmAddToDashboard catches, throwing is fine.
      throw new Error('No authenticated user.');
    }

    try {
      const userId = auth.currentUser.uid;
      const mealData = {
        name: recipe.title || 'Unnamed Recipe',
        category: category,
        ingredients: recipe.ingredients, // Store ingredients for reference
        calories: recipe.calories || 0,
        protein: recipe.protein || 0,
        total_fat: recipe.fats || 0,
        carbs: recipe.carbs || 0,
        timestamp: new Date().toISOString()
      };

      console.log("Attempting to add mealData to Firestore:", mealData); // Log before the Firestore call
      const docRef = await addDoc(collection(db, 'users', userId, 'meals'), mealData);
      console.log('✅ Meal added to nutrition tracker (dashboard):', docRef.id, mealData);
    } catch (error) {
      console.error('🔥 Error adding meal (dashboard):', error);
      Alert.alert('Error', 'Failed to add meal to nutrition tracker.');
      throw error; // Re-throw to be caught by confirmAddToDashboard
    }
  };

  // Function to remove ingredients from the user's fridge
  const removeIngredientsFromFridge = async (ingredientsToRemove) => {
    console.log("Attempting to remove ingredients from fridge:", ingredientsToRemove);
    if (!auth.currentUser) {
      console.error('Error removing ingredients: No authenticated user found.');
      return; // Don't throw error, just log and stop if no user
    }
    if (!ingredientsToRemove || ingredientsToRemove.length === 0) {
      console.log('No ingredients to remove.');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const ingredientsRef = collection(db, 'users', userId, 'ingredients');
      const fridgeIngredientNames = fridgeItems.map(item => ({ name: item.name.toLowerCase().replace(/[^a-z0-9]/g, ''), id: item.id }));

      const removePromises = ingredientsToRemove.map(async (ingredientName) => {
        const cleanedRecipeIngredientName = ingredientName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        // Find fridge ingredients that include the recipe ingredient name
        const matchingFridgeItems = fridgeIngredientNames.filter(fridgeItem =>
            fridgeItem.name.includes(cleanedRecipeIngredientName) || cleanedRecipeIngredientName.includes(fridgeItem.name)
        );

        console.log(`Searching for ingredient "${ingredientName}" (cleaned: "${cleanedRecipeIngredientName}") in fridge. Found potential matches:`, matchingFridgeItems);

        const deletePromises = matchingFridgeItems.map(async (match) => {
             console.log(`Deleting fridge item ID: ${match.id} (Name: ${match.name})`);
             return deleteDoc(doc(db, "users", userId, "ingredients", match.id));
        });

        return Promise.all(deletePromises);
      });

      await Promise.all(removePromises.flat());
      console.log('✅ Ingredients removal process completed.');
    } catch (error) {
      console.error('🔥 Error removing ingredients:', error);
       Alert.alert('Error', 'Failed to remove some ingredients from fridge.');
      throw error; // Re-throw to be caught by the caller
    }
  };

  // Function to handle the "Add to Dashboard" button press (Opens Category Picker)
  const handleAddToDashboardPress = (recipe) => {
    console.log("Make this recipe button pressed. Opening category picker for recipe:", recipe.title);
    setSelectedRecipeToAdd(recipe);
    setShowCategoryPicker(true);
  };

  // Function to handle confirming adding to dashboard with category AND removing ingredients
  const confirmAddToDashboard = async () => {
    console.log("Confirm Add to Dashboard pressed. Selected Recipe:", selectedRecipeToAdd?.title, "Category:", selectedCategory);
    if (!selectedRecipeToAdd || !selectedCategory) {
      console.warn("No recipe or category selected to add to dashboard.");
      Alert.alert('Error', 'Please select a recipe and category.');
      return;
    }
    if (!auth.currentUser) {
      console.error('Error confirming add: No authenticated user found.');
      Alert.alert('Error', 'No authenticated user found.');
      return;
    }

    setLoading(true); // Show loading indicator during the process
    try {
      // 1. Add meal to nutrition tracker (dashboard) with the selected category
      console.log("Step 1: Adding meal to dashboard...");
      await addMealToNutrition(selectedRecipeToAdd, selectedCategory);
      console.log("Step 1 Complete: Meal successfully added to dashboard.");

      // 2. Remove ingredients from fridge
      console.log("Step 2: Attempting to remove ingredients...");
      // Pass the ingredients list from the selected recipe
      if (Array.isArray(selectedRecipeToAdd.ingredients)) {
         await removeIngredientsFromFridge(selectedRecipeToAdd.ingredients);
         console.log("Step 2 Complete: Ingredients removal process initiated.");
      } else if (typeof selectedRecipeToAdd.ingredients === 'string') {
         const ingredientsArray = selectedRecipeToAdd.ingredients.split(',').map(item => item.trim()).filter(item => item);
         await removeIngredientsFromFridge(ingredientsArray);
         console.log("Step 2 Complete: Ingredients removal process initiated from string.");
      } else {
         console.warn("Recipe ingredients not in expected array or string format for removal:", selectedRecipeToAdd.ingredients);
         Alert.alert('Warning', 'Could not automatically remove ingredients. Please update your fridge manually.');
      }

      // Clear displayed recipes and hide picker after successful process
      setCurrentRecipes([]);
      setExpandedRecipe(null);
      setShowCategoryPicker(false);

      // Add a success message to the chat
      const confirmationMsg = {
        id: Date.now().toString() + '_confirm',
        text: `Great! I've added "${selectedRecipeToAdd.title || 'the meal'}" to your Dashboard under ${selectedCategory} and removed the used ingredients from your fridge. Enjoy! 😊`,
        isUser: false
      };
      setMessages(prev => [...prev, confirmationMsg]);
       console.log("Confirmation message added to chat.");

    } catch (error) {
      console.error('🔥 Error during confirmAddToDashboard process:', error);
      // Use a general alert for the user if the whole process failed
      Alert.alert('Error', 'Something went wrong while processing your request. Please check the console for details.');
    } finally {
      setLoading(false); // Hide loading indicator
      setSelectedRecipeToAdd(null); // Reset selected recipe
      setSelectedCategory('Breakfast'); // Reset category picker
      console.log("confirmAddToDashboard process finished.");
    }
  };

  const parseRecipes = (recipeText) => {
    console.log("Attempting to parse raw recipe text:", recipeText);
    const recipes = [];
    const recipeSections = recipeText.split('---').filter(section => section.trim().length > 0);
    console.log(`Found ${recipeSections.length} potential recipe sections separated by '---'.`);

    recipeSections.forEach((section, sectionIndex) => {
      console.log(`Parsing section ${sectionIndex + 1}/${recipeSections.length}:`);

      const recipe = {
        title: '',
        description: '',
        ingredients: [],
        steps: [],
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0
      };

      // Split section into lines and clean them
      const lines = section.split('\n').map(line => line.trim());

      // Use a simple state machine or lookahead to find content blocks
      let currentField = null;
      let currentContent = [];

      lines.forEach(line => {
          const lowerLine = line.toLowerCase();

          if (lowerLine.startsWith('title:')) {
              if (currentField) recipe[currentField] = currentContent.join('\n').trim();
              currentField = 'title';
              currentContent = [line.substring('Title:'.length).trim()];
          } else if (lowerLine.startsWith('description:')) {
              if (currentField) recipe[currentField] = currentContent.join('\n').trim();
              currentField = 'description';
              currentContent = [line.substring('Description:'.length).trim()];
          } else if (lowerLine.startsWith('ingredients:')) {
               if (currentField) recipe[currentField] = currentContent.join('\n').trim();
               currentField = 'ingredients';
               // Capture content starting from after the header
               currentContent = [line.substring('Ingredients:'.length).trim()];
          } else if (lowerLine.startsWith('steps:') || lowerLine.startsWith('directions:')) {
               if (currentField) recipe[currentField] = currentContent.join('\n').trim();
               currentField = 'steps';
               // Capture content starting from after the header
               currentContent = [line.substring(lowerLine.startsWith('steps:') ? 'Steps:'.length : 'Directions:'.length).trim()];
          } else if (lowerLine.startsWith('calories:')) {
               if (currentField) recipe[currentField] = currentContent.join('\n').trim();
               currentField = 'calories';
               currentContent = [line.substring('Calories:'.length).trim()];
          } else if (lowerLine.startsWith('protein:')) {
               if (currentField) recipe[currentField] = currentContent.join('\n').trim();
               currentField = 'protein';
               currentContent = [line.substring('Protein:'.length).trim()];
          } else if (lowerLine.startsWith('fats:')) {
               if (currentField) recipe[currentField] = currentContent.join('\n').trim();
               currentField = 'fats';
               currentContent = [line.substring('Fats:'.length).trim()];
          } else if (lowerLine.startsWith('carbohydrates:') || lowerLine.startsWith('carbs:')) {
               if (currentField) recipe[currentField] = currentContent.join('\n').trim();
               currentField = 'carbs';
               currentContent = [line.substring(lowerLine.startsWith('carbohydrates:') ? 'Carbohydrates:'.length : 'Carbs:'.length).trim()];
          } else if (currentField) {
              // If we are inside a field, add the line to the current content
              currentContent.push(line);
          }
      });

      // Add the last captured content to the recipe object
       if (currentField && currentContent.length > 0) {
           recipe[currentField] = currentContent.join('\n').trim();
       }


      // Now, process the collected content strings for lists and numbers
      // Process Ingredients (split by newline or bullet points)
      if (typeof recipe.ingredients === 'string') {
         recipe.ingredients = recipe.ingredients.split(/[\n\r]+|^\s*[\-\*\u2022]\s*/).map(item => item.trim()).filter(item => item.length > 0);
      } else {
          recipe.ingredients = []; // Ensure it's an array even if content wasn't string
      }

      // Process Steps (split by newline and number/dot/paren)
       if (typeof recipe.steps === 'string') {
           recipe.steps = recipe.steps.split(/[\n\r]+|\d+[\.\)]?\s*/).map(step => step.trim()).filter(step => step.length > 0);
       } else {
           recipe.steps = []; // Ensure it's an array
       }

      // Process numerical fields
      if (typeof recipe.calories === 'string') {
          const match = recipe.calories.match(/(\d+)/);
          recipe.calories = match ? parseInt(match[1]) : 0;
      }
       if (typeof recipe.protein === 'string') {
          const match = recipe.protein.match(/(\d+(\.\d+)?)/);
          recipe.protein = match ? parseFloat(match[1]) : 0;
      }
       if (typeof recipe.fats === 'string') {
          const match = recipe.fats.match(/(\d+(\.\d+)?)/);
          recipe.fats = match ? parseFloat(match[1]) : 0;
      }
       if (typeof recipe.carbs === 'string') {
          const match = recipe.carbs.match(/(\d+(\.\d+)?)/);
          recipe.carbs = match ? parseFloat(match[1]) : 0;
      }


       // Only add the recipe if it has a title, ingredients (as array with items), AND steps (as array with items)
      if (recipe.title && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && Array.isArray(recipe.steps) && recipe.steps.length > 0) {
        recipes.push(recipe);
         console.log(`✅ Successfully parsed recipe: "${recipe.title}" with ${recipe.ingredients.length} ingredients and ${recipe.steps.length} steps.`);
      } else {
        console.warn(`❌ Skipping section ${sectionIndex + 1} - Missing required fields or empty lists. Parsed:`, { title: recipe.title, ingredientsCount: Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 'Not Array', stepsCount: Array.isArray(recipe.steps) ? recipe.steps.length : 'Not Array', rawIngredients: recipe.ingredients, rawSteps: recipe.steps }); // More detailed warning
      }
    });

     console.log(`Finished parsing. Found ${recipes.length} valid recipes.`);
    return recipes;
  };

  const renderRecipeCard = (recipe, index) => {
    const recipeKey = `recipe-${recipe.title.replace(/[^a-zA-Z0-9]/g, '')}-${index}`;
    const isExpanded = expandedRecipe === index;
    
    return (
      <Animated.View key={recipeKey} style={styles.recipeCard} entering={SlideInLeft.delay(index * 50).springify()}>
        <TouchableOpacity 
          onPress={() => setExpandedRecipe(isExpanded ? null : index)}
          style={styles.recipeHeader}
        >
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#5e2bff"
          />
        </TouchableOpacity>
        
        <Text style={styles.recipeDescription}>{recipe.description}</Text>
        
        {isExpanded && (
          <Animated.View style={styles.recipeDetails} entering={FadeIn.duration(300)}>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, i) => (
                <Text 
                  key={`${recipeKey}-ingredient-${i}`}
                  style={styles.ingredientText}
                >
                  • {ingredient}
                </Text>
              ))
            ) : (
              <Text style={styles.ingredientText}>No ingredients listed.</Text>
            )}
            
            <Text style={styles.sectionTitle}>Steps:</Text>
            {Array.isArray(recipe.steps) && recipe.steps.length > 0 ? (
              recipe.steps.map((step, i) => (
                <Text 
                  key={`${recipeKey}-step-${i}`}
                  style={styles.stepText}
                >
                  {i + 1}. {step}
                </Text>
              ))
            ) : (
              <Text style={styles.stepText}>No steps listed.</Text>
            )}
            
            <Text style={styles.sectionTitle}>Nutrition (per serving):</Text>
            <Text style={styles.nutritionText}>
              Calories: {recipe.calories !== undefined && recipe.calories !== null ? recipe.calories : 'N/A'} kcal{'\n'}
              Protein: {recipe.protein !== undefined && recipe.protein !== null ? recipe.protein : 'N/A'} g{'\n'}
              Fats: {recipe.fats !== undefined && recipe.fats !== null ? recipe.fats : 'N/A'} g
              {recipe.carbs !== undefined && recipe.carbs !== null && `\nCarbohydrates: ${recipe.carbs} g`}
            </Text>
            
            {recipe.videoLink && typeof recipe.videoLink === 'string' && recipe.videoLink.length > 0 && (
              <TouchableOpacity onPress={() => Linking.openURL(recipe.videoLink)} style={styles.videoLinkButton}>
                <Text style={styles.videoLinkText}>Watch Video</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.makeRecipeButton}
              onPress={() => handleAddToDashboardPress(recipe)}
            >
              <Text style={styles.makeRecipeButtonText}>Make this recipe</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  // Animated send button scale for press effect
  const buttonScale = useSharedValue(1);
  
  const onPressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 10, stiffness: 100 });
  };
  
  const onPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 100 });
  };
  
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });

  // Send user message to chatbot.
  const sendMessage = async () => {
    if (!input.trim()) return;
    const lowerInput = input.toLowerCase();
    setCurrentRecipes([]); // Clear previous recipes when sending a new message
    setExpandedRecipe(null);
    const userMsg = { id: Date.now().toString() + '_user', text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';

      const recipeTriggers = [
        'make', 'cook', 'recipe', 'recipes', 'what can i make',
        'what meals can i make', 'what to cook', 'suggest a recipe',
        'give me some recipes', 'meal', 'show me recipes', 'generate recipes'
      ];
      const isRecipeRequest = recipeTriggers.some(trigger => lowerInput.includes(trigger));
      console.log("User input:", input, "Is recipe request:", isRecipeRequest);

      if (isRecipeRequest) {
        if (fridgeItems.length === 0) {
          responseText = "It looks like your fridge is empty! Add some ingredients first so I can suggest recipes.";
          const noFridgeMsg = { id: Date.now().toString() + '_bot_no_fridge', text: responseText, isUser: false };
          setMessages(prev => [...prev, noFridgeMsg]);
          console.log("No fridge items, sent no fridge message.");
        } else {
          const ingredientList = fridgeItems.map(item => item.name).join(", ");
           console.log("Fridge items available. Generating recipe prompt with ingredients:", ingredientList);
          // Prompt remains the same as the previous turn's refinement
          const prompt = `Generate exactly THREE simple, distinct recipes using ONLY the following ingredients from a fridge: ${ingredientList}. Do NOT use any ingredients not explicitly listed. Format each recipe STRICTLY as follows, separated by "---" on a new line:
Title: [Recipe Name]
Description: [One sentence description]
Ingredients: [List ONLY ingredients from the provided list, one per line, using bullet points like "- Ingredient Name"]
Steps: [3-5 concise steps, numbered like "1. Step one", "2. Step two"]
Calories: [estimated calories]
Protein: [estimated protein in grams]
Fats: [estimated fats in grams]
Carbohydrates: [estimated carbohydrates in grams]
---
Example:
Title: Simple Veggie Stir Fry
Description: A quick and easy stir fry with fridge vegetables.
Ingredients:
- Broccoli
- Carrot
- Soy Sauce
Steps:
1. Chop broccoli and carrot.
2. Stir fry vegetables in soy sauce.
3. Serve hot.
Calories: 200
Protein: 5g
Fats: 10g
Carbohydrates: 25g
---
DO NOT include any introductory or concluding text outside of the recipes themselves. Provide ONLY the three recipes formatted as specified.`;

          const requestPayload = {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          };

          const result = await model.generateContent(requestPayload);
          const fullRecipeResponse = result.response.text() || "";
          console.log("Raw AI Response:\n", fullRecipeResponse);

          const recipes = parseRecipes(fullRecipeResponse); // Use the enhanced parseRecipes
          console.log(`Attempted to parse recipes. Resulted in ${recipes.length} valid recipe objects.`);

          // *** MODIFIED LOGIC HERE *** (Keep the improved fallback message)
          if (recipes.length === 0) {
            // If no valid recipes were parsed, provide the fallback message
             responseText = "Hmm, I couldn't generate specific recipes with those ingredients right now. Try adding more items to your fridge, or ask me to list what you have!";
             const noRecipeMsg = { id: Date.now().toString() + '_bot_fallback_recipe', text: responseText, isUser: false };
             setMessages(prev => [...prev, noRecipeMsg]);
             console.log("No valid recipes parsed, sent fallback message.");
          } else {
            // If ANY recipes were parsed, display them
            setCurrentRecipes(recipes); // Use the parsed recipes
            const introMsg = {
                id: Date.now().toString() + '_bot_intro',
                text: "Here are a few recipe ideas based on your ingredients:",
                isUser: false
            };
             setMessages(prev => [...prev, introMsg]);
             console.log("Valid recipes found, set recipes and sent intro message.");
          }
        }
      } else if (lowerInput.includes("what do i have in the fridge") || lowerInput.includes("my fridge")) {
         console.log("User asked for fridge contents.");
        if (fridgeItems.length === 0) {
          responseText = "Your fridge is empty! Please add some ingredients.";
           const emptyFridgeMsg = { id: Date.now().toString() + '_bot_empty_fridge', text: responseText, isUser: false };
           setMessages(prev => [...prev, emptyFridgeMsg]);
           console.log("Fridge is empty, sent empty fridge message.");
        } else {
          const ingredientList = fridgeItems.map(item => `• **${item.name}**`).join("\n");
          responseText = `You currently have:\n${ingredientList}`;
          const fridgeMsg = { id: Date.now().toString() + '_bot_fridge_list', text: responseText, isUser: false };
          setMessages(prev => [...prev, fridgeMsg]);
          console.log("Listed fridge items.");
        }
      } else {
         console.log("User sent general message. Calling Gemini.");
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: input }] }]
        });
         responseText = result.response.text() || "I'm not sure how to help with that specific request. I can provide recipes based on your fridge items or list what you have.";
        const generalMsg = { id: Date.now().toString() + '_bot_general', text: "", isUser: false };
        setMessages(prev => [...prev, generalMsg]);
        typeMessage(responseText);
        console.log("Sent general AI response.");
      }

    } catch (error) {
      console.error("🔥 Chatbot error:", error.message);
      // This catch block handles unexpected errors during the process, not parsing failures
      const errorMsg = { id: Date.now().toString() + '_bot_process_error', text: "Oops! Something went wrong on my end. Please try again.", isUser: false }; // Changed message
      setMessages(prev => [...prev, errorMsg]);
      console.log("Caught process error, displayed error message in chat.");
    } finally {
      setLoading(false);
       console.log("sendMessage process finished. Loading set to false.");
    }
  };

  const renderMessage = (message, index) => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    // Ensure message.text is always treated as a string for splitting
    const parts = typeof message.text === 'string' ? message.text.split(linkRegex) : [];
    const messageKey = `message-${message.id}-${index}`;
    const isUser = message.isUser; // Determine if it's a user message

    // Different animation based on user/bot message
    const enteringAnimation = isUser
      ? SlideInRight.delay(50).springify()
      : SlideInLeft.delay(50).springify();

    return (
      // Use Animated.View for the message container with animation
      <Animated.View
         key={messageKey}
         style={[
            styles.messageBubbleContainer,
            isUser ? styles.userMessageContainer : styles.botMessageContainer,
         ]}
         entering={enteringAnimation}
      >
         {/* Render avatar only for bot messages */}
         {!isUser && (
           <Animated.Image
              entering={FadeIn.delay(100).duration(300)} // Animation for the avatar
              source={require('../../images/mealbuddy_icon.png')} // Ensure this path is correct
              style={styles.avatarIcon}
            />
         )}

        {/* Use Animated.View for the message bubble */}
        <Animated.View
            style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}
            entering={FadeIn.duration(200).delay(150)} // Animation for the bubble
        >
           <View style={styles.messageTextContent}>
              {parts.map((part, partIndex) =>
                linkRegex.test(part) ? (
                  <TouchableOpacity
                    key={`${messageKey}-link-${partIndex}`}
                    onPress={() => Linking.openURL(part)}
                  >
                    <Text style={[styles.messageText, styles.linkText]}>{part}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text
                    key={`${messageKey}-text-${partIndex}`}
                    style={[styles.messageText, isUser ? styles.userText : styles.botText]}
                  >
                    {renderHighlightedText(part)}
                  </Text>
                )
              )}

               {/* Conditionally render recipe cards WITHIN the bot's message bubble */}
               {/* Check if it's a bot message AND it's the specific intro message for recipes */}
               {!isUser && currentRecipes.length > 0 && message.id.includes('_intro') && (
                 <View style={styles.recipesContainer}> {/* Use recipesContainer style */}
                   {currentRecipes.map((recipe, recipeIndex) => renderRecipeCard(recipe, recipeIndex))}
                 </View>
               )}
           </View>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    // Wrap with ImageBackground
    <ImageBackground
      source={require('../../images/background.png')} // Ensure this path is correct
      resizeMode="cover"
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 50}
      >
        {/* Use ScrollView for scrolling */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {/* Map through messages and render each using the combined renderMessage */}
          {messages.map((message, index) => renderMessage(message, index))}

          {/* REMOVED: Separate rendering of recipe cards here. They are now rendered inside renderMessage. */}
        </ScrollView>

        {/* Category Picker Modal/Overlay */}
        {showCategoryPicker && selectedRecipeToAdd && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.categoryPickerOverlay}>
              <View style={styles.categoryPickerContainer}>
                 <Text style={styles.categoryPickerTitle}>Add "{selectedRecipeToAdd.title || 'Recipe'}" to:</Text>
                <Picker
                    selectedValue={selectedCategory}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                >
                    <Picker.Item label="Breakfast" value="Breakfast" />
                    <Picker.Item label="Lunch" value="Lunch" />
                    <Picker.Item label="Dinner" value="Dinner" />
                    <Picker.Item label="Snack" value="Snack" />
                </Picker>
                <TouchableOpacity
                    style={styles.confirmAddButton}
                    onPress={confirmAddToDashboard} // Call confirmAddToDashboard
                >
                    <Text style={styles.confirmAddButtonText}>Confirm Add</Text>
                </TouchableOpacity>
                 <TouchableOpacity
                    style={styles.cancelAddButton}
                    onPress={() => setShowCategoryPicker(false)}
                 >
                    <Text style={styles.cancelAddButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.loadingIndicatorContainer}
          >
            <ActivityIndicator size="large" color="#5e2bff" />
          </Animated.View>
        )}

        {/* Reset Chat Button */}
        <Animated.View
          entering={FadeIn.delay(600).duration(500)}
          style={styles.resetButtonContainer}
        >
          <TouchableOpacity style={styles.resetButton} onPress={resetChatbot}>
            <Ionicons name="refresh-circle" size={36} color="#5e2bff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Input Container and Send Button */}
        <Animated.View
          style={styles.inputContainer}
          entering={FadeIn.delay(300).duration(500)}
        >
          <TextInput
            placeholder="Ask me anything about cooking..."
            value={input}
            onChangeText={setInput}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            editable={!loading}
          />

          {/* Wrap send button in Animated.View for press animation */}
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading || !input.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Chatbot;
