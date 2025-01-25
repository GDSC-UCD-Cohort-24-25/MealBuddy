import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

export const getRecipeSuggestions = async (ingredients) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Suggest recipes using: ${ingredients}` }],
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching recipe suggestions:', error.message);
    return 'Failed to get suggestions. Try again later.';
  }
};
