import API from './index';

export const getAiRecommendations = async (preferences) => {
  const response = await API.post('/ai/recommend', preferences);
  return response.data;
};

export const propertyChat = async (id, message, history) => {
  const response = await API.post(`/ai/chat/${id}`, { message, history });
  return response.data;
};

export const generalAssistant = async (message) => {
  const response = await API.post('/ai/assistant', { message });
  return response.data;
};
