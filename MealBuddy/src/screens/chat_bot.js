import React, { useState } from 'react';
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
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ Official Gemini SDK
import { GOOGLE_GEMINI_API_KEY } from '@env';

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

  // ✅ Initialize Gemini AI Client
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
      // ✅ Start a chat session correctly
      const chatSession = model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        history: [],
      });

      // ✅ Correct JSON Structure
      const result = await chatSession.sendMessage([
        { text: "You are a helpful AI assistant specialized in cooking. Your job is to suggest recipes based on ingredients provided by the user. Always include ingredient quantities in grams where possible and format recipes with clear step-by-step instructions and cooking times." },
        { text: `Suggest recipes with these ingredients (quantities in grams): ${input}. Please provide ingredient quantities in grams in the recipes.` }
      ]);

      const botResponse = result.response.text() || "⚠️ No response from Gemini";

      const botMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: botResponse,
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('🚨 Chatbot error:', error.message);

      const errorMessage = {
        id: Date.now().toString() + '-error',
        text: "Oops! Something went wrong.",
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 50} // ✅ FIX HEIGHT FOR KEYBOARD
    >
      {/* ✅ Remove ScrollView, Only Use FlatList */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id} // Ensures unique keys
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        keyboardShouldPersistTaps="handled" // ✅ FIXES TEXTINPUT MEASUREMENT ERROR
      />

      {loading && <ActivityIndicator size="large" color="#007bff" />}

      {/* ✅ Fixed Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter ingredients to get recipes..."
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
