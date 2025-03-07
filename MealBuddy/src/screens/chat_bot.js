import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import styles from '../styles/chatbot_styles';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMINI_API_KEY, YOUTUBE_API_KEY } from '@env';
import { db, auth } from '../services/firebase_config';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: "Hello! I'm your MealBuddy chatbot. Tell me what ingredients you have, and I'll suggest recipes!",
      isUser: false,
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState([]);

  useEffect(() => {
    fetchFridgeItems();
  }, []);

  const fetchFridgeItems = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');
    const snapshot = await getDocs(ingredientsRef);
    const items = snapshot.docs.map(doc => doc.data().name);
    setFridgeItems(items);
  };

  const fetchYouTubeVideo = async (recipeName) => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          q: `${recipeName} recipe`,
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
      });
      const videoId = response.data.items[0]?.id?.videoId;
      return videoId ? `🔗 Watch: https://www.youtube.com/watch?v=${videoId}` : "(No video found)";
    } catch (error) {
      console.error("YouTube API error:", error);
      return "(No video found)";
    }
  };

  const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: input,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';

      const chatSession = model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        history: [],
      });

      const result = await chatSession.sendMessage([{ text: input }]);
      responseText = result.response.text() || "No response from Gemini.";

      if (input.toLowerCase().includes("what meals can i make")) {
        if (fridgeItems.length === 0) {
          responseText = "Your fridge is empty! Add some ingredients to get meal suggestions.";
        } else {
          responseText = `I see you have: ${fridgeItems.join(', ')}. Let me find some recipes for you...`;
          
          const result = await chatSession.sendMessage([
            { text: `Suggest 3 meal recipes using: ${fridgeItems.join(", ")}` }
          ]);
          
          const recipeText = result.response.text() || "No recipes found.";
          
          const recipeNames = recipeText.match(/(?:\*\*)([^*]+)(?:\*\*)/g) || [];
          
          const videoLinks = await Promise.all(recipeNames.map(recipe => fetchYouTubeVideo(recipe.replace(/\*\*/g, ''))));
          
          responseText += `\n\n${recipeText}\n\n` + videoLinks.join('\n');
        }
      }

      setMessages((prevMessages) => [...prevMessages, { id: Date.now().toString(), text: responseText, isUser: false }]);
    } catch (error) {
      console.error("Chatbot error:", error.message);
      setMessages((prevMessages) => [...prevMessages, { id: Date.now().toString(), text: "Oops! Something went wrong.", isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
        {item.text}
      </Text>
    </View>
  );

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
