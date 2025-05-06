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
  Image,
  ImageBackground
} from 'react-native';
import styles from '../styles/chatbot_styles';
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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMINI_API_KEY, YOUTUBE_API_KEY } from '@env';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot } from 'firebase/firestore';
import axios from 'axios';


const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // All chat messages are stored here.
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState([]);

  // Reference to the ScrollView.
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
      const greeting = "Hello! I'm your MealBuddy chatbot. Tell me what ingredients you have, and I'll suggest recipes!";
      const newMessage = { id: Date.now().toString(), text: greeting, isUser: false };
      setMessages([newMessage]);
      setLoading(false);
    }, 1000);
  };

  // Reset chatbot function (clears chat and starts fresh).
  const resetChatbot = () => {
    setMessages([]);
    setInput('');
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
        const items = snapshot.docs.map(doc => doc.data().name || "Unknown Ingredient");
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

  // Send user message to chatbot with typewriter effect on response.
  const sendMessage = async () => {
    if (!input.trim()) return;
    const lowerInput = input.toLowerCase();
    // Append user's message.
    const userMsg = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';

      if (lowerInput.includes("what meals can i make")) {
        console.log("🔍 Checking fridge contents:", fridgeItems);
        if (fridgeItems.length === 0) {
          responseText = "I cannot see anything in your fridge! Please add ingredients first.";
        } else {
          const ingredientList = fridgeItems.map(item => `• **${item}**`).join("\n");
          responseText = `I see you have:\n${ingredientList}\n\nHere are some meal ideas:\n`;
          const prompt = `I have these ingredients: ${ingredientList}. Please suggest 3 creative and diverse meal recipes using only these ingredients. For each recipe, do the following:
1. Start with "Recipe X:" (where X is 1, 2, 3).
2. Provide a bold title for the recipe.
3. List the required ingredients with specific quantities (in grams).
4. Provide a detailed, step-by-step cooking process with timings (e.g., preheat, cook for X minutes, etc.) and a serving suggestion.
Separate each recipe with a line containing only "---".`;

          const requestPayload = {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          };

          const result = await model.generateContent(requestPayload);
          const recipeText = result.response.text() || "No recipes found.";
          // Split the recipes using the delimiter.
          const recipeSections = recipeText.split('---').map(section => section.trim()).filter(section => section.length > 0);
          let finalRecipesText = "";
          for (let i = 0; i < recipeSections.length; i++) {
            let section = recipeSections[i];
            const titleMatch = section.match(/(?:\*\*)([^*]+)(?:\*\*)/);
            let recipeTitle = titleMatch ? titleMatch[1] : `Recipe ${i+1}`;
            const videoLink = await fetchYouTubeVideo(recipeTitle);
            section += `\n\n🔗 Watch ${recipeTitle}: ${videoLink ? videoLink : "No video found"}`;
            finalRecipesText += section + "\n";
          }
          responseText += finalRecipesText;
          responseText += "\nLet me know if you need anything else.";
        }
      } else if (lowerInput.includes("what do i have in the fridge") || lowerInput.includes("my fridge")) {
        if (fridgeItems.length === 0) {
          responseText = "Your fridge is empty! Please add some ingredients.";
        } else {
          const ingredientList = fridgeItems.map(item => `• **${item}**`).join("\n");
          responseText = `You currently have:\n${ingredientList}\n\nLet me know if you need anything else.`;
        }
      } else {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: input }] }]
        });
        responseText = result.response.text() || "No response from Gemini.";
        responseText += "\n\nLet me know if you need anything else.";
      }

      // Append a blank bot message, then use the typewriter effect.
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
  
  // Render messages with clickable links, highlighted text and animations
  const renderMessage = (message, index) => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const parts = message.text.split(linkRegex);
    const isUser = message.isUser;
    
    // Different animation based on user/bot message
    const enteringAnimation = isUser 
      ? SlideInRight.delay(50).springify()
      : SlideInLeft.delay(50).springify();
    
    return (
      <Animated.View
        key={message.id}
        entering={enteringAnimation}
        style={{
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          marginBottom: 12,
          paddingHorizontal: 10,
        }}
      >
        {!isUser && (
          <Animated.Image
            entering={FadeIn.delay(100).duration(300)}
            source={require('../../images/mealbuddy_icon.png')}
            style={styles.avatarIcon}
          />
        )}
        
        <Animated.View 
          style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          {parts.map((part, idx) =>
            linkRegex.test(part) ? (
              <TouchableOpacity key={idx} onPress={() => Linking.openURL(part)}>
                <Text style={[styles.messageText, styles.linkText]}>{part}</Text>
              </TouchableOpacity>
            ) : (
              <Text key={idx} style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
                {renderHighlightedText(part)}
              </Text>
            )
          )}
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      source={require('../../images/background.png')}
      resizeMode="cover"
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 50} 
      >
        <Animated.ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => renderMessage(message, index))}
        </Animated.ScrollView>
        
        {loading && (
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{ alignItems: 'center', marginVertical: 10 }}
          >
            <ActivityIndicator size="large" color="#5e2bff" />
          </Animated.View>
        )}
        
        {/* Reset Chat Button */}
        <Animated.View
          entering={FadeIn.delay(600).duration(500)}
        >
          <TouchableOpacity style={styles.resetButton} onPress={resetChatbot}>
            <Ionicons name="refresh-circle" size={36} color="#5e2bff" />
          </TouchableOpacity>
        </Animated.View>

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
          />
          
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
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
