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
  Alert
} from 'react-native';
import styles from '../styles/chatbot_styles';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMINI_API_KEY, YOUTUBE_API_KEY } from '@env';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot, doc, deleteDoc, addDoc, getDocs, query, where } from 'firebase/firestore';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [currentRecipes, setCurrentRecipes] = useState([]);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const scrollViewRef = useRef();

  // Typewriter effect: gradually reveal text in the last message.
  const typeMessage = (fullText, delay = 15) => {
    let currentIndex = 0;
    let typedText = "";
    const interval = setInterval(() => {
      typedText += fullText[currentIndex];
      setMessages(prev => {
        const updated = [...prev];
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
    while ((match = highlightRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      elements.push(
        <Text key={match.index} style={styles.highlightText}>
          {match[1]}
        </Text>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
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
      return;
    }
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');
    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      if (snapshot.empty) {
        console.warn("⚠️ No ingredients found in Firestore.");
        setFridgeItems([]);
      } else {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("🔹 Updated fridge items:", items);
        setFridgeItems(items);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch one YouTube video for a recipe.
  const fetchYouTubeVideo = async (query) => {
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
      return null;
    }
  };

  // Initialize Gemini AI.
  const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const addMealToNutrition = async (recipe) => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const mealData = {
        name: recipe.title,
        calories: recipe.calories || 0,
        protein: recipe.protein || 0,
        total_fat: recipe.fats || 0,
        water: recipe.water || 0,
        sugar: recipe.sugar || 0,
        mealCategory: recipe.mealCategory || 'dinner',
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'users', userId, 'meals'), mealData);
      Alert.alert('Success', 'Meal added to your nutrition tracker!');
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal to nutrition tracker.');
    }
  };

  const removeIngredientsFromFridge = async (ingredients) => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const ingredientsRef = collection(db, 'users', userId, 'ingredients');
      
      for (const ingredient of ingredients) {
        const q = query(ingredientsRef, where('name', '==', ingredient));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      }
      
      Alert.alert('Success', 'Ingredients removed from your fridge!');
    } catch (error) {
      console.error('Error removing ingredients:', error);
      Alert.alert('Error', 'Failed to remove ingredients from fridge.');
    }
  };

  const handleRecipeConfirmation = async (recipe) => {
    if (!recipe) return;
    
    try {
      await addMealToNutrition(recipe);
      await removeIngredientsFromFridge(recipe.ingredients);
      setCurrentRecipes([]);
      setExpandedRecipe(null);
      
      const confirmationMsg = { 
        id: Date.now().toString(), 
        text: "Great! I've added the meal to your nutrition tracker and removed the used ingredients from your fridge. Enjoy your meal! 😊", 
        isUser: false 
      };
      setMessages(prev => [...prev, confirmationMsg]);
    } catch (error) {
      console.error('Error handling recipe confirmation:', error);
      Alert.alert('Error', 'Something went wrong while processing your recipe.');
    }
  };

  const parseRecipes = (recipeText) => {
    const recipes = [];
    const recipeSections = recipeText.split('---').filter(section => section.trim().length > 0);
    
    recipeSections.forEach(section => {
      const lines = section.split('\n');
      const recipe = {
        title: '',
        description: '',
        ingredients: [],
        steps: [],
        calories: 0,
        protein: 0,
        fats: 0
      };

      lines.forEach(line => {
        if (line.startsWith('Title:')) {
          recipe.title = line.replace('Title:', '').trim();
        } else if (line.startsWith('Description:')) {
          recipe.description = line.replace('Description:', '').trim();
        } else if (line.startsWith('Ingredients:')) {
          const ingredients = line.replace('Ingredients:', '').trim();
          recipe.ingredients = ingredients.split(',').map(i => i.trim());
        } else if (line.startsWith('Steps:')) {
          const steps = line.replace('Steps:', '').trim();
          recipe.steps = steps.split(',').map(s => s.trim());
        } else if (line.startsWith('Calories:')) {
          recipe.calories = parseInt(line.replace('Calories:', '').trim()) || 0;
        } else if (line.startsWith('Protein:')) {
          recipe.protein = parseInt(line.replace('Protein:', '').trim()) || 0;
        } else if (line.startsWith('Fats:')) {
          recipe.fats = parseInt(line.replace('Fats:', '').trim()) || 0;
        }
      });

      recipes.push(recipe);
    });

    return recipes;
  };

  const renderRecipeCard = (recipe, index) => {
    const isExpanded = expandedRecipe === index;
    const recipeKey = `recipe-${recipe.title.replace(/\\s+/g, '-')}-${index}`;
    
    return (
      <View key={recipeKey} style={styles.recipeCard}>
        <TouchableOpacity 
          onPress={() => setExpandedRecipe(isExpanded ? null : index)}
          style={styles.recipeHeader}
        >
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#007bff" 
          />
        </TouchableOpacity>
        
        <Text style={styles.recipeDescription}>{recipe.description}</Text>
        
        {isExpanded && (
          <View style={styles.recipeDetails}>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            {recipe.ingredients.map((ingredient, i) => (
              <Text 
                key={`${recipeKey}-ingredient-${ingredient.replace(/\s+/g, '-')}-${i}`} 
                style={styles.ingredientText}
              >
                • {ingredient}
              </Text>
            ))}
            
            <Text style={styles.sectionTitle}>Steps:</Text>
            {recipe.steps.map((step, i) => (
              <Text 
                key={`${recipeKey}-step-${i}-${Date.now()}`} 
                style={styles.stepText}
              >
                {i + 1}. {step}
              </Text>
            ))}
            
            <Text style={styles.nutritionText}>
              Calories: {recipe.calories} kcal | Protein: {recipe.protein}g | Fats: {recipe.fats}g
            </Text>
            
            <TouchableOpacity 
              style={styles.makeRecipeButton}
              onPress={() => handleRecipeConfirmation(recipe)}
            >
              <Text style={styles.makeRecipeButtonText}>Make this recipe</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const lowerInput = input.toLowerCase();
    const userMsg = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';

      // Triggers for any recipe-related request
      const recipeTriggers = [
        'make',
        'cook',
        'recipe',
        'recipes',
        'what can i make',
        'what meals can i make',
        'what to cook',
        'suggest a recipe',
        'give me some recipes',
        'meal',
      ];
      const isRecipeRequest = recipeTriggers.some(trigger => lowerInput.includes(trigger));

      if (isRecipeRequest) {
        if (fridgeItems.length === 0) {
          responseText = "I cannot see anything in your fridge! Please add ingredients first.";
        } else {
          const ingredientList = fridgeItems.map(item => item.name).join(", ");
          const prompt = `Given ONLY these ingredients in the fridge: ${ingredientList}, suggest THREE simple recipes that use ONLY these ingredients. IMPORTANT: DO NOT suggest any recipes that require ingredients not in this list. For each recipe, format as follows:
---\nTitle: [Recipe Name]\nDescription: [One sentence description of the recipe]\nIngredients: [List ONLY ingredients from the provided list, no substitutions]\nSteps: [3-4 simple steps using ONLY the listed ingredients]\nCalories: [estimated calories]\nProtein: [estimated protein in grams]\nFats: [estimated fats in grams]\n---\nSeparate each recipe with "---". Remember: ONLY use ingredients from the provided list.`;

          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
          });
          
          const recipeText = result.response.text();
          const recipes = parseRecipes(recipeText);
          
          // Verify that recipes only use ingredients from the fridge
          const validRecipes = recipes.filter(recipe => {
            const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase().replace(/[^a-z]/g, ''));
            const fridgeIngredients = fridgeItems.map(i => i.name.toLowerCase().replace(/[^a-z]/g, ''));
            return recipeIngredients.every(ingredient =>
              fridgeIngredients.some(fridgeIngredient =>
                fridgeIngredient.includes(ingredient) || ingredient.includes(fridgeIngredient)
              )
            );
          });

          if (validRecipes.length === 0) {
            responseText = "I couldn't find any recipes using only your current ingredients. Try adding more ingredients to your fridge!";
          } else {
            setCurrentRecipes(validRecipes);
            responseText = "Here are recipes you can make with your current ingredients:\n\n";
            validRecipes.forEach((recipe, index) => {
              responseText += `${index + 1}. ${recipe.title}\n`;
              responseText += `${recipe.description}\n\n`;
            });
            responseText += "Tap on any recipe to see the full details and make it!";
          }
        }
      } else if (lowerInput.includes("what do i have in the fridge") || lowerInput.includes("my fridge")) {
        if (fridgeItems.length === 0) {
          responseText = "Your fridge is empty! Please add some ingredients.";
        } else {
          const ingredientList = fridgeItems.map(item => `• **${item.name}**`).join("\n");
          responseText = `You currently have:\n${ingredientList}\n\nLet me know if you need anything else.`;
        }
      } else {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: input }] }]
        });
        responseText = result.response.text() || "I'm not sure how to help with that. Try asking about recipes or your fridge contents.";
      }

      const newBotMsg = { id: Date.now().toString(), text: "", isUser: false };
      setMessages(prev => [...prev, newBotMsg]);
      typeMessage(responseText);
    } catch (error) {
      console.error("🔥 Chatbot error:", error.message);
      const errorMsg = { id: Date.now().toString(), text: "Oops! Something went wrong.", isUser: false };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (message) => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const parts = message.text.split(linkRegex);
    const messageKey = `message-${message.id}-${Date.now()}`;
    
    return (
      <View key={messageKey} style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.botBubble]}>
        {parts.map((part, index) =>
          linkRegex.test(part) ? (
            <TouchableOpacity 
              key={`${messageKey}-link-${index}-${Date.now()}`} 
              onPress={() => Linking.openURL(part)}
            >
              <Text style={[styles.messageText, styles.linkText]}>{part}</Text>
            </TouchableOpacity>
          ) : (
            <Text 
              key={`${messageKey}-text-${index}-${Date.now()}`} 
              style={[styles.messageText, message.isUser ? styles.userText : styles.botText]}
            >
              {renderHighlightedText(part)}
            </Text>
          )
        )}
        
        {!message.isUser && currentRecipes.length > 0 && (
          <View style={styles.recipesContainer}>
            {currentRecipes.map((recipe, index) => renderRecipeCard(recipe, index))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 50} 
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => renderMessage(message))}
      </ScrollView>
      {loading && <ActivityIndicator size="large" color="#007bff" />}

      {/* Reset Chat Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetChatbot}>
        <Ionicons name="refresh-circle" size={36} color="#007bff" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Ask me anything about cooking..."
          value={input}
          onChangeText={setInput}
          style={styles.input}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chatbot;
