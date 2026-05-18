import API from './index';

export const getMyFavorites = async () => {
  const response = await API.get('/favorites');
  return response.data;
};

export const addToFavorites = async (propertyId) => {
  const response = await API.post('/favorites', { propertyId });
  return response.data;
};

export const removeFromFavorites = async (propertyId) => {
  const response = await API.delete(`/favorites/${propertyId}`);
  return response.data;
};
