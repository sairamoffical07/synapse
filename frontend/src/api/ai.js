import { apiClient } from './client';

export const aiApi = {
  sendChat: async (question) => {
    return apiClient('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },

  generateQuiz: async (topic, count = 5) => {
    return apiClient('/ai/quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, count }),
    });
  },

  generateFlashcards: async (topic, count = 5) => {
    return apiClient('/ai/flashcards', {
      method: 'POST',
      body: JSON.stringify({ topic, count }),
    });
  },
};
