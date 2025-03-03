import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const SuggestedRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your recipe assistant. Tell me what ingredients you have, and I\'ll suggest some delicious recipes you can make.',
      isUser: false,
    },
  ]);

  const getRecipeSuggestions = async () => {
    setLoading(true);

    // Add the user's message to the chat history
    const userMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: ingredients,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are a helpful cooking assistant that suggests recipes based on ingredients. Always provide ingredient quantities in grams when possible. Format recipes with clear steps and cooking times.' 
            },
            { 
              role: 'user', 
              content: `Suggest recipes with these ingredients (quantities in grams): ${ingredients}. Please provide ingredient quantities in grams in the recipes.` 
            }
          ],
        },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        }
      );

      const botMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: response.data.choices[0].message.content,
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setRecipes(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching recipes:', error.message);
      setRecipes('Failed to fetch recipes.');
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
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

      <TextInput
        placeholder="Enter ingredients"
        value={ingredients}
        onChangeText={setIngredients}
        style={styles.input}
      />
      <Button title="Get Recipes" onPress={getRecipeSuggestions} />
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : null}
      <Text>{recipes}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  messageList: {
    flex: 1,
    marginBottom: 20,
  },
  messageListContent: {
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderTopRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
});

export default SuggestedRecipes;
