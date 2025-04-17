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
  ScrollView
} from 'react-native';
import styles from '../styles/chatbot_styles';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMINI_API_KEY, YOUTUBE_API_KEY } from '@env';
import { db, auth } from '../services/firebase_config';
import { collection, onSnapshot } from 'firebase/firestore';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [userPrefs, setUserPrefs] = useState({
    dietary: '',
    speed: '',
    servings: '',
    mealType: '',
    flavor: ''
  });
  const [awaitingQuestion, setAwaitingQuestion] = useState('');
  const scrollViewRef = useRef();

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
      if (currentIndex >= fullText.length) clearInterval(interval);
    }, delay);
  };

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

  const showInitialGreeting = () => {
    setLoading(true);
    setTimeout(() => {
      const greeting = "Hello! I'm your MealBuddy chatbot. Let's create perfect meal ideas together.\n\nFirst, what ingredients do you have in your fridge?";
      const newMessage = { id: Date.now().toString(), text: greeting, isUser: false };
      setMessages([newMessage]);
      setLoading(false);
      setAwaitingQuestion('ingredients');
    }, 1000);
  };

  const resetChatbot = () => {
    setMessages([]);
    setInput('');
    setUserPrefs({
      dietary: '',
      speed: '',
      servings: '',
      mealType: '',
      flavor: ''
    });
    setAwaitingQuestion('');
    showInitialGreeting();
  };

  useEffect(() => {
    showInitialGreeting();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, 'users', userId, 'ingredients');
    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data().name || "Unknown Ingredient");
      setFridgeItems(items);
    });
    return () => unsubscribe();
  }, []);

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
      return null;
    }
  };

  const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      switch (awaitingQuestion) {
        case 'ingredients':
          setFridgeItems(input.split(',').map(item => item.trim()));
          setAwaitingQuestion('dietary');
          typeMessage("Great! Do you have any dietary restrictions (vegan, gluten-free, allergies)?");
          break;

        case 'dietary':
          setUserPrefs(prev => ({ ...prev, dietary: input }));
          setAwaitingQuestion('speed');
          typeMessage("Thanks! Do you prefer quick meals or slow-cooked meals?");
          break;

        case 'speed':
          setUserPrefs(prev => ({ ...prev, speed: input }));
          setAwaitingQuestion('servings');
          typeMessage("Got it! How many servings are you cooking for?");
          break;

        case 'servings':
          setUserPrefs(prev => ({ ...prev, servings: input }));
          setAwaitingQuestion('mealType');
          typeMessage("Understood! Are you looking for breakfast, lunch, dinner, or snacks?");
          break;

        case 'mealType':
          setUserPrefs(prev => ({ ...prev, mealType: input }));
          setAwaitingQuestion('flavor');
          typeMessage("And lastly, do you prefer spicy, mild, or sweet meals?");
          break;

        case 'flavor':
          setUserPrefs(prev => ({ ...prev, flavor: input }));
          setAwaitingQuestion('');
          await generateMealPlan();
          break;

        default:
          typeMessage("I'm ready to help you create meal ideas! Could you tell me what ingredients you have?");
          setAwaitingQuestion('ingredients');
          break;
      }
    } catch (error) {
      const errorMsg = { id: Date.now().toString(), text: "Oops! Something went wrong.", isUser: false };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    try {
      const ingredients = fridgeItems.map(item => `• ${item}`).join("\n");
      const { dietary, speed, servings, mealType, flavor } = userPrefs;

      const prompt = `
I have the following ingredients:\n${ingredients}\n
I have these preferences:
- Dietary: ${dietary}
- Cooking Speed: ${speed}
- Number of Servings: ${servings}
- Meal Type: ${mealType}
- Flavor Preference: ${flavor}

Based on all the above, suggest 3 creative meal recipes using only the ingredients I have. 
For each recipe:
1. Title the recipe in bold.
2. List the ingredients with quantities.
3. Provide detailed step-by-step instructions including cook times.
4. Suggest serving ideas.
Separate each recipe with "---".
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      let responseText = result.response.text() || "No recipes found.";
      const recipeSections = responseText.split('---').map(section => section.trim()).filter(section => section);
      let finalRecipesText = "";

      for (let i = 0; i < recipeSections.length; i++) {
        const section = recipeSections[i];
        const titleMatch = section.match(/(?:\*\*)([^*]+)(?:\*\*)/);
        const recipeTitle = titleMatch ? titleMatch[1] : `Recipe ${i+1}`;
        const videoLink = await fetchYouTubeVideo(recipeTitle);
        finalRecipesText += `${section}\n\n🔗 Watch ${recipeTitle}: ${videoLink || "No video found"}\n\n`;
      }

      const newBotMsg = { id: Date.now().toString(), text: "", isUser: false };
      setMessages(prev => [...prev, newBotMsg]);
      typeMessage(finalRecipesText + "\nLet me know if you'd like to plan another meal!");
    } catch (error) {
      const errorMsg = { id: Date.now().toString(), text: "Oops! Failed to generate recipes.", isUser: false };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const renderMessage = (message) => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const parts = message.text.split(linkRegex);
    return (
      <View key={message.id} style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.botBubble]}>
        {parts.map((part, index) =>
          linkRegex.test(part) ? (
            <TouchableOpacity key={index} onPress={() => Linking.openURL(part)}>
              <Text style={[styles.messageText, styles.linkText]}>{part}</Text>
            </TouchableOpacity>
          ) : (
            <Text key={index} style={[styles.messageText, message.isUser ? styles.userText : styles.botText]}>
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
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => renderMessage(message))}
      </ScrollView>

      {loading && <ActivityIndicator size="large" color="#007bff" />}

      <TouchableOpacity style={styles.resetButton} onPress={resetChatbot}>
        <Ionicons name="refresh-circle" size={36} color="#007bff" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type your answer or ask anything..."
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
