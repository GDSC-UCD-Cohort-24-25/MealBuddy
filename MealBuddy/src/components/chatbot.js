import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleChat = async () => {
    const result = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: input }],
      },
      {
        headers: { Authorization: `Bearer YOUR_OPENAI_API_KEY` },
      }
    );
    setResponse(result.data.choices[0].message.content);
  };

  return (
    <View>
      <TextInput
        placeholder="Ask a question..."
        value={input}
        onChangeText={setInput}
      />
      <Button title="Ask" onPress={handleChat} />
      <Text>{response}</Text>
    </View>
  );
};

export default Chatbot;
