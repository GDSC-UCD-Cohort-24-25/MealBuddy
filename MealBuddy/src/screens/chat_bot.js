import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Linking
} from 'react-native';
import styles from '../styles/chatbot_styles';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMINI_API_KEY, YOUTUBE_API_KEY } from '@env';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot } from 'firebase/firestore';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // start empty; initial greeting will be shown after a delay.
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState([]);

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

  // Show initial greeting after a loading period
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const greeting = "Hello! I'm your MealBuddy chatbot. Tell me what ingredients you have, and I'll suggest recipes!";
      const newMessage = { id: Date.now().toString(), text: "", isUser: false };
      setMessages([newMessage]);
      typeMessage(greeting);
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Live Firestore Listener for Fridge Items
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
        // Only get the name of each ingredient.
        const items = snapshot.docs.map(doc => doc.data().name || "Unknown Ingredient");
        console.log("🔹 Updated fridge items:", items);
        setFridgeItems(items);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch one YouTube video for a recipe (overall recipe video)
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

  // Initialize Gemini AI
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
          // List only the ingredient names (highlighted)
          const ingredientList = fridgeItems.map(item => `• **${item}**`).join("\n");
          responseText = `I see you have:\n${ingredientList}\n\nHere are some meal ideas:`;

          // Open-ended prompt for detailed recipes.
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
          // Process each recipe individually.
          for (let i = 0; i < recipeSections.length; i++) {
            let section = recipeSections[i];
            // Extract the recipe title (first bold text).
            const titleMatch = section.match(/(?:\*\*)([^*]+)(?:\*\*)/);
            let recipeTitle = titleMatch ? titleMatch[1] : `Recipe ${i+1}`;
            // Fetch the overall recipe video for this recipe.
            const videoLink = await fetchYouTubeVideo(recipeTitle);
            // Append the video link directly after this recipe.
            section += `\n\n🔗 Watch ${recipeTitle}: ${videoLink ? videoLink : "No video found"}`;
            // Add a separator between recipes.
            finalRecipesText += section + "\n\n";
          }
          responseText += finalRecipesText;
          // Append the final prompt.
          responseText += "\nLet me know if you need anything else.";
        }
      } else if (lowerInput.includes("what do i have in the fridge") || lowerInput.includes("my fridge")) {
        if (fridgeItems.length === 0) {
          responseText = "Your fridge is empty! Please add some ingredients.";
        } else {
          // List ingredients as bullet points with highlights.
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

      // Append a blank bot message then use typewriter effect.
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

  // Render messages with clickable links and highlighted text.
  const renderMessage = ({ item }) => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const parts = item.text.split(linkRegex);
    return (
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        {parts.map((part, index) =>
          linkRegex.test(part) ? (
            <TouchableOpacity key={index} onPress={() => Linking.openURL(part)}>
              <Text style={[styles.messageText, styles.linkText]}>{part}</Text>
            </TouchableOpacity>
          ) : (
            <Text key={index} style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
              {renderHighlightedText(part)}
            </Text>
          )
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
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id} 
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        keyboardShouldPersistTaps="handled" 
      />
      {loading && <ActivityIndicator size="large" color="#007bff" />}
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
